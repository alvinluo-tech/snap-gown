-- Add missing updated_at column to orders table (from PRD v2.1 spec)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE orders ALTER COLUMN updated_at SET NOT NULL;
