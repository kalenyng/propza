-- Row Level Security (RLS) Policies for Propza
-- This migration enables RLS on all tables and creates policies to ensure data isolation

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- PROPERTIES TABLE POLICIES
-- ============================================

-- Users can only read their own properties
CREATE POLICY "Users can read own properties" ON properties
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can only insert properties with their own owner_id
CREATE POLICY "Users can insert own properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can only update their own properties
CREATE POLICY "Users can update own properties" ON properties
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can only delete their own properties
CREATE POLICY "Users can delete own properties" ON properties
    FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- TENANTS TABLE POLICIES
-- ============================================

-- Users can only read tenants for properties they own
CREATE POLICY "Users can read tenants for own properties" ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = tenants.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Users can only insert tenants for properties they own
CREATE POLICY "Users can insert tenants for own properties" ON tenants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = tenants.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Users can only update tenants for properties they own
CREATE POLICY "Users can update tenants for own properties" ON tenants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = tenants.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Users can only delete tenants for properties they own
CREATE POLICY "Users can delete tenants for own properties" ON tenants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = tenants.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Users can only read payments for properties they own
CREATE POLICY "Users can read payments for own properties" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = payments.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Users can only insert payments for properties they own
CREATE POLICY "Users can insert payments for own properties" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = payments.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Users can only update payments for properties they own
CREATE POLICY "Users can update payments for own properties" ON payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = payments.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Users can only delete payments for properties they own
CREATE POLICY "Users can delete payments for own properties" ON payments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = payments.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- ============================================
-- PROFILES TABLE POLICIES (if exists)
-- ============================================

-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can read own properties" ON properties IS 'Ensures users can only access their own properties';
COMMENT ON POLICY "Users can read tenants for own properties" ON tenants IS 'Ensures users can only access tenants for properties they own';
COMMENT ON POLICY "Users can read payments for own properties" ON payments IS 'Ensures users can only access payments for properties they own';
COMMENT ON POLICY "Users can read own profile" ON profiles IS 'Ensures users can only access their own profile data';
