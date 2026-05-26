-- Make slot_id nullable so terminal orders don't block slot deletion
ALTER TABLE orders ALTER COLUMN slot_id DROP NOT NULL;

-- Add ON DELETE SET NULL so deleting a slot automatically nullifies references
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_slot_id_fkey,
  ADD CONSTRAINT orders_slot_id_fkey FOREIGN KEY (slot_id)
  REFERENCES availability_slots(id) ON DELETE SET NULL;
