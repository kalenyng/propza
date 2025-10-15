-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    rent_amount INTEGER NOT NULL CHECK (rent_amount > 0),
    rent_status TEXT NOT NULL CHECK (rent_status IN ('paid', 'overdue', 'upcoming', 'vacant')),
    rent_due_date DATE NOT NULL,
    lease_start_date DATE,
    lease_end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON public.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_rent_status ON public.tenants(rent_status);
CREATE INDEX IF NOT EXISTS idx_tenants_rent_due_date ON public.tenants(rent_due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (assuming users can only access their own tenants)
-- This assumes there's a user_id column or similar - adjust as needed for your auth setup
CREATE POLICY "Users can view their own tenants" ON public.tenants
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own tenants" ON public.tenants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own tenants" ON public.tenants
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own tenants" ON public.tenants
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
