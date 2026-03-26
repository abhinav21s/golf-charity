-- Migration: Add draw_date column to draws table
-- Run this in your Supabase SQL Editor

-- Add the draw_date column
ALTER TABLE draws ADD COLUMN IF NOT EXISTS draw_date DATE;

-- Update existing draws to have a draw_date (last day of the month)
UPDATE draws 
SET draw_date = (
  DATE_TRUNC('month', MAKE_DATE(draw_year, draw_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day'
)::DATE
WHERE draw_date IS NULL;

-- Make the column NOT NULL after populating existing data
ALTER TABLE draws ALTER COLUMN draw_date SET NOT NULL;

-- Verify the migration
SELECT id, draw_month, draw_year, draw_date, status FROM draws ORDER BY draw_year DESC, draw_month DESC;
