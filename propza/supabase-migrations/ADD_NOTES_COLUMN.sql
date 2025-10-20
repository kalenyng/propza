-- ====================================
-- ADD NOTES COLUMN TO PROPERTIES TABLE
-- Run this in Supabase SQL Editor
-- ====================================

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'notes'
  ) THEN
    ALTER TABLE properties ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column to properties table';
  ELSE
    RAISE NOTICE 'Notes column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'properties' AND column_name = 'notes';

