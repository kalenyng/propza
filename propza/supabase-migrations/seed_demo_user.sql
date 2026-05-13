-- =============================================================================
-- Propza demo seed — one landlord (matches auth.users.id / profiles.id)
-- Replace DEMO_USER_ID if needed (default below).
--
-- Run in Supabase SQL Editor (uses elevated privileges; bypasses RLS).
-- Re-run: execute the DELETE block first (same fixed property UUIDs).
--
-- Omits properties.notes if that column is not present in your project.
-- =============================================================================

-- DELETE FROM public.payments WHERE property_id IN (
--   'b1111111-1111-4111-a111-111111111101','b1111111-1111-4111-a111-111111111102',
--   'b1111111-1111-4111-a111-111111111103','b1111111-1111-4111-a111-111111111104',
--   'b1111111-1111-4111-a111-111111111105','b1111111-1111-4111-a111-111111111106');
-- DELETE FROM public.tenants WHERE property_id IN (
--   'b1111111-1111-4111-a111-111111111101','b1111111-1111-4111-a111-111111111102',
--   'b1111111-1111-4111-a111-111111111103','b1111111-1111-4111-a111-111111111104',
--   'b1111111-1111-4111-a111-111111111105','b1111111-1111-4111-a111-111111111106');
-- DELETE FROM public.tenancies WHERE property_id IN (
--   'b1111111-1111-4111-a111-111111111101','b1111111-1111-4111-a111-111111111102',
--   'b1111111-1111-4111-a111-111111111103','b1111111-1111-4111-a111-111111111104',
--   'b1111111-1111-4111-a111-111111111105','b1111111-1111-4111-a111-111111111106');
-- DELETE FROM public.properties WHERE id IN (
--   'b1111111-1111-4111-a111-111111111101','b1111111-1111-4111-a111-111111111102',
--   'b1111111-1111-4111-a111-111111111103','b1111111-1111-4111-a111-111111111104',
--   'b1111111-1111-4111-a111-111111111105','b1111111-1111-4111-a111-111111111106');

BEGIN;

INSERT INTO public.properties (
  id, owner_id, name, address, rent_amount, currency, status,
  lease_url, created_at, updated_at
) VALUES
(
  'b1111111-1111-4111-a111-111111111101',
  '740da824-ecbc-4ee8-8aee-153260f80968',
  'Muizenberg Sea Flat',
  '14 Beach Rd, Muizenberg, Cape Town 7945',
  7800, 'ZAR', 'vacant',
  NULL,
  '2024-01-15 10:00:00+00', '2024-06-01 12:00:00+00'
),
(
  'b1111111-1111-4111-a111-111111111102',
  '740da824-ecbc-4ee8-8aee-153260f80968',
  'Rosebank Executive Unit',
  '88 Tyrwhitt Ave, Rosebank, Johannesburg 2196',
  16800, 'ZAR', 'occupied',
  'https://example.com/leases/demo-rosebank-lease.pdf',
  '2024-06-01 09:00:00+00', '2026-05-01 08:00:00+00'
),
(
  'b1111111-1111-4111-a111-111111111103',
  '740da824-ecbc-4ee8-8aee-153260f80968',
  'Stellenbosch Student Cottage',
  '5 Victoria St, Stellenbosch Central 7600',
  9400, 'ZAR', 'occupied',
  NULL,
  '2025-02-10 11:30:00+00', '2026-04-20 09:15:00+00'
),
(
  'b1111111-1111-4111-a111-111111111104',
  '740da824-ecbc-4ee8-8aee-153260f80968',
  'Woodstock Loft',
  '112 Sir Lowry Rd, Woodstock, Cape Town 7925',
  13200, 'ZAR', 'occupied',
  NULL,
  '2025-08-22 14:00:00+00', '2026-05-10 16:45:00+00'
),
(
  'b1111111-1111-4111-a111-111111111105',
  '740da824-ecbc-4ee8-8aee-153260f80968',
  'Claremont Garden Flat',
  '22 Imam Haron Rd, Claremont, Cape Town 7708',
  10100, 'ZAR', 'occupied',
  NULL,
  '2026-01-08 07:45:00+00', '2026-05-12 10:00:00+00'
),
(
  'b1111111-1111-4111-a111-111111111106',
  '740da824-ecbc-4ee8-8aee-153260f80968',
  'Umhlanga New Acquisition',
  '9 Lagoon Dr, Umhlanga Rocks, Durban 4320',
  21500, 'ZAR', 'vacant',
  NULL,
  '2026-04-28 15:20:00+00', '2026-05-11 11:00:00+00'
);

INSERT INTO public.tenancies (property_id, start_date, end_date, rent_due_day) VALUES
('b1111111-1111-4111-a111-111111111102', '2024-06-15', NULL, 1),
('b1111111-1111-4111-a111-111111111103', '2025-03-01', NULL, 1),
('b1111111-1111-4111-a111-111111111104', '2025-09-01', NULL, 28),
('b1111111-1111-4111-a111-111111111105', '2026-01-15', NULL, 16);

INSERT INTO public.tenants (
  name, email, phone, property_id, rent_amount, rent_status, rent_due_date,
  lease_start_date, lease_end_date, deposit_amount, notes, created_at, updated_at
) VALUES
(
  'Thando Nkosi', 'thando.nkosi@example.com', '+27 82 555 0142',
  'b1111111-1111-4111-a111-111111111102',
  16800, 'paid', '2026-06-01',
  '2024-06-15', NULL, 33600,
  'TEST_SEED: Prefers EFT; long lease.',
  '2024-06-15 10:05:00+00', '2026-05-01 08:00:00+00'
),
(
  'Liam van der Berg', 'liam.vdberg@example.com', '+27 72 444 8831',
  'b1111111-1111-4111-a111-111111111103',
  9400, 'overdue', '2026-02-01',
  '2025-03-01', NULL, 18800,
  'TEST_SEED: Last full payment Jan 2026.',
  '2025-03-01 09:00:00+00', '2026-04-20 09:15:00+00'
),
(
  'Aisha Khan', 'aisha.khan@example.com', '+27 60 333 2210',
  'b1111111-1111-4111-a111-111111111104',
  13200, 'upcoming', '2026-05-28',
  '2025-09-01', NULL, 26400,
  'TEST_SEED: Partial proof received for May.',
  '2025-09-01 12:00:00+00', '2026-05-10 16:45:00+00'
),
(
  'Jason Meyer', 'jason.meyer@example.com', '+27 84 222 9901',
  'b1111111-1111-4111-a111-111111111105',
  10100, 'upcoming', '2026-05-16',
  '2026-01-15', NULL, 10100,
  'TEST_SEED: Monthly due on the 16th.',
  '2026-01-15 08:00:00+00', '2026-05-12 10:00:00+00'
);

INSERT INTO public.payments (
  property_id, period, amount, payment_date, payment_method, notes, paid_at, created_at
) VALUES
('b1111111-1111-4111-a111-111111111102', '2025-09', 16800, '2025-09-28', 'EFT', 'TEST_SEED: Sep', '2025-09-28 11:00:00+00', '2025-09-28 11:00:00+00'),
('b1111111-1111-4111-a111-111111111102', '2025-10', 16800, '2025-10-29', 'bank_transfer', 'TEST_SEED: Oct', '2025-10-29 09:30:00+00', '2025-10-29 09:30:00+00'),
('b1111111-1111-4111-a111-111111111102', '2025-11', 16800, '2025-11-27', 'EFT', 'TEST_SEED: Nov', '2025-11-27 14:15:00+00', '2025-11-27 14:15:00+00'),
('b1111111-1111-4111-a111-111111111102', '2025-12', 16800, '2025-12-30', 'cash', 'TEST_SEED: Dec', '2025-12-30 16:00:00+00', '2025-12-30 16:00:00+00'),
('b1111111-1111-4111-a111-111111111102', '2026-01', 16800, '2026-01-28', 'EFT', 'TEST_SEED: Jan', '2026-01-28 10:00:00+00', '2026-01-28 10:00:00+00'),
('b1111111-1111-4111-a111-111111111102', '2026-02', 16800, '2026-02-26', 'bank_transfer', 'TEST_SEED: Feb', '2026-02-26 08:45:00+00', '2026-02-26 08:45:00+00'),
('b1111111-1111-4111-a111-111111111102', '2026-03', 16800, '2026-03-30', 'EFT', 'TEST_SEED: Mar', '2026-03-30 12:20:00+00', '2026-03-30 12:20:00+00'),
('b1111111-1111-4111-a111-111111111102', '2026-04', 16800, '2026-04-28', 'EFT', 'TEST_SEED: Apr', '2026-04-28 09:10:00+00', '2026-04-28 09:10:00+00'),
('b1111111-1111-4111-a111-111111111103', '2025-11', 9400, '2025-11-30', 'cash', 'TEST_SEED: Nov', '2025-11-30 18:00:00+00', '2025-11-30 18:00:00+00'),
('b1111111-1111-4111-a111-111111111103', '2025-12', 9400, '2025-12-29', 'EFT', 'TEST_SEED: Dec', '2025-12-29 10:00:00+00', '2025-12-29 10:00:00+00'),
('b1111111-1111-4111-a111-111111111103', '2026-01', 9400, '2026-01-30', 'bank_transfer', 'TEST_SEED: Jan (last)', '2026-01-30 11:30:00+00', '2026-01-30 11:30:00+00'),
('b1111111-1111-4111-a111-111111111104', '2026-04', 13200, '2026-04-27', 'bank_transfer', 'TEST_SEED: Apr full', '2026-04-27 09:00:00+00', '2026-04-27 09:00:00+00'),
('b1111111-1111-4111-a111-111111111104', '2026-05', 6500, '2026-05-08', 'EFT', 'TEST_SEED: Partial May', '2026-05-08 13:00:00+00', '2026-05-08 13:00:00+00');

COMMIT;

-- If payments.owner_id exists (settings export), uncomment:
-- UPDATE public.payments p
-- SET owner_id = '740da824-ecbc-4ee8-8aee-153260f80968'
-- FROM public.properties pr
-- WHERE p.property_id = pr.id AND pr.id IN (
--   'b1111111-1111-4111-a111-111111111102','b1111111-1111-4111-a111-111111111103',
--   'b1111111-1111-4111-a111-111111111104'
-- );
