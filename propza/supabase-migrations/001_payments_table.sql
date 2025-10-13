-- Create payments table for tracking rent payments per period
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- Format: YYYY-MM
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique payment per property per period
  CONSTRAINT unique_property_period UNIQUE (property_id, period)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_period ON payments(period);
CREATE INDEX IF NOT EXISTS idx_payments_property_period ON payments(property_id, period);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);

-- Add comment
COMMENT ON TABLE payments IS 'Tracks rent payments per property per period (YYYY-MM)';
COMMENT ON COLUMN payments.period IS 'Payment period in YYYY-MM format';
COMMENT ON CONSTRAINT unique_property_period ON payments IS 'Prevents double-payment for same property in same period';

