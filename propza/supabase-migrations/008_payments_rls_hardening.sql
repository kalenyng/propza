-- =============================================================================
-- 008_payments_rls_hardening.sql
--
-- ISSUE-001 fix: ensure the payments table is protected by Row Level Security
-- with strict owner-scoped policies, regardless of which earlier migrations
-- have actually been applied to this database.
--
-- Why a fresh migration instead of relying on 004_rls_policies.sql?
--   * 002_payments_table.sql created `payments` WITHOUT enabling RLS or adding
--     any policy. If 004 was never applied (or was applied alongside legacy
--     permissive policies), authenticated users can read/mutate any landlord's
--     payment records.
--   * Postgres OR-combines policies for SELECT, so leaving any permissive
--     policy in place defeats the owner-scoped ones. We therefore drop ALL
--     existing policies on `payments` first and recreate a clean set.
--   * `payments` has no `owner_id` column in the runtime schema (see ISSUE-008
--     in architecture/propza-architecture.html); ownership is derived from
--     properties.owner_id via property_id. These policies enforce that join.
--
-- Idempotent: safe to run multiple times.
-- Run in Supabase SQL Editor (uses elevated privileges; bypasses RLS itself).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Pre-flight: confirm the join target exists. If properties.owner_id is
--    missing, abort loudly rather than create policies that silently match
--    nothing or, worse, fail open.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'properties'
      AND column_name  = 'owner_id'
  ) THEN
    RAISE EXCEPTION
      'Cannot harden payments RLS: public.properties.owner_id is missing. '
      'Add the owner_id column (uuid, references auth.users) and backfill it '
      'before re-running this migration.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    RAISE EXCEPTION
      'Cannot harden payments RLS: public.payments table does not exist.';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1. Force RLS on. ENABLE makes RLS apply to non-owners; FORCE makes it
--    apply to the table owner role as well. The service_role key still
--    bypasses RLS, which is the documented Supabase escape hatch for
--    admin/server tasks.
-- ---------------------------------------------------------------------------
ALTER TABLE public.payments ENABLE  ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE   ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Drop every existing policy on payments. We do this dynamically because
--    different historical states could have left different policy names
--    behind (e.g. "Users can read payments for own properties" from 004,
--    or any ad-hoc policy added in the dashboard).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments', pol.policyname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Recreate a clean, strict set of owner-scoped policies. Each policy
--    requires the payment's property_id to reference a row in `properties`
--    whose owner_id equals the authenticated user.
--
--    UPDATE uses both USING and WITH CHECK so a user cannot reassign a
--    payment to a property they don't own.
-- ---------------------------------------------------------------------------

CREATE POLICY "payments_select_own"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = payments.property_id
        AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert_own"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = payments.property_id
        AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "payments_update_own"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = payments.property_id
        AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = payments.property_id
        AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "payments_delete_own"
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = payments.property_id
        AND p.owner_id = auth.uid()
    )
  );

COMMENT ON POLICY "payments_select_own" ON public.payments IS
  'A landlord can read a payment only when they own the referenced property.';
COMMENT ON POLICY "payments_insert_own" ON public.payments IS
  'A landlord can insert a payment only against a property they own.';
COMMENT ON POLICY "payments_update_own" ON public.payments IS
  'A landlord can update a payment only on a property they own, and cannot reassign it to another owner''s property.';
COMMENT ON POLICY "payments_delete_own" ON public.payments IS
  'A landlord can delete a payment only on a property they own.';

COMMIT;

-- ---------------------------------------------------------------------------
-- 4. Verification (run these and confirm before considering this closed).
-- ---------------------------------------------------------------------------

-- 4a. RLS should be enabled AND forced.
--     Expected: rowsecurity = true, forcerowsecurity = true.
SELECT relname,
       relrowsecurity   AS rls_enabled,
       relforcerowsecurity AS rls_forced
FROM   pg_class
WHERE  oid = 'public.payments'::regclass;

-- 4b. Exactly four policies, all owner-scoped via the properties join.
--     Expected: 4 rows, names payments_{select,insert,update,delete}_own.
SELECT policyname, cmd, roles, qual, with_check
FROM   pg_policies
WHERE  schemaname = 'public' AND tablename = 'payments'
ORDER  BY policyname;

-- 4c. Smoke test (optional, run as the anon role from a SQL session that
--     has set request.jwt.claims to a fake user). With auth.uid() returning
--     a UUID that owns no properties, both queries below must return 0 rows
--     and the INSERT must error with "new row violates row-level security".
--
--     SELECT count(*) FROM public.payments;
--     INSERT INTO public.payments (property_id, period, amount, payment_date)
--     VALUES ('00000000-0000-0000-0000-000000000000', '2026-05', 1, CURRENT_DATE);
