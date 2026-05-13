-- ====================================
-- ALTER PAYMENTS TABLE - Add Period Column
-- Run this in Supabase SQL Editor
-- ====================================

-- Add the period column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'period'
  ) THEN
    ALTER TABLE payments ADD COLUMN period TEXT;
    
    -- Backfill existing payments with period based on payment_date
    UPDATE payments 
    SET period = TO_CHAR(payment_date, 'YYYY-MM')
    WHERE period IS NULL;
    
    -- Make period NOT NULL after backfill
    ALTER TABLE payments ALTER COLUMN period SET NOT NULL;
  END IF;
END $$;

-- Add the unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_property_period'
  ) THEN
    ALTER TABLE payments 
    ADD CONSTRAINT unique_property_period UNIQUE (property_id, period);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_payments_period ON payments(period);
CREATE INDEX IF NOT EXISTS idx_payments_property_period ON payments(property_id, period);

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Show current table structure
SELECT * FROM payments LIMIT 5;

