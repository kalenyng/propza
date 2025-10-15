-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL,
    rent_amount INTEGER NOT NULL CHECK (rent_amount > 0),
    rent_frequency TEXT NOT NULL CHECK (rent_frequency IN ('weekly', 'monthly')) DEFAULT 'monthly',
    description TEXT,
    bedrooms INTEGER,
    bathrooms DECIMAL,
    size_sqm INTEGER,
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'townhouse', 'studio')),
    status TEXT CHECK (status IN ('available', 'occupied', 'maintenance')) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_address ON public.properties(address);

-- Enable Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (assuming users can only access their own properties)
CREATE POLICY "Users can view their own properties" ON public.properties
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own properties" ON public.properties
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own properties" ON public.properties
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER handle_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
