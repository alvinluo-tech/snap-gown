-- ====================================================================
-- SnapGown v1.1 Upgrade Migration
-- ====================================================================

-- 1. New enum for commission ledger status
CREATE TYPE ledger_status AS ENUM ('PENDING', 'SETTLED', 'WAIVED');

-- 2. Add payment_ref to orders and update commission rate default
ALTER TABLE orders ADD COLUMN payment_ref VARCHAR(20) UNIQUE;
UPDATE orders SET payment_ref = 'D-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) WHERE payment_ref IS NULL;
ALTER TABLE orders ALTER COLUMN payment_ref SET NOT NULL;
ALTER TABLE orders ALTER COLUMN commission_rate_pct SET DEFAULT 15.00;

-- 3. Add unique constraint on availability_slots to prevent duplicate slots
ALTER TABLE availability_slots ADD CONSTRAINT unique_photographer_timeline UNIQUE (photographer_id, slot_date, start_time, end_time);

-- 4. Create order_status_logs table
CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    from_status order_status,
    to_status order_status NOT NULL,
    actor_id UUID REFERENCES profiles(id) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create commission_ledger table
CREATE TABLE commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    platform_fee_pence INT NOT NULL,
    ledger_status ledger_status DEFAULT 'PENDING' NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE,
    settled_by UUID REFERENCES profiles(id),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for new tables
CREATE INDEX idx_order_logs_order ON order_status_logs (order_id, created_at);
CREATE INDEX idx_ledger_photo ON commission_ledger (photographer_id, ledger_status);
CREATE INDEX idx_orders_ref ON orders (payment_ref);

-- 7. Enable RLS on new tables
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for order_status_logs
-- Admin can see all logs
CREATE POLICY "Admin can view all order logs" ON order_status_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- Photographer can see logs for their orders
CREATE POLICY "Photographer can view own order logs" ON order_status_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_logs.order_id
      AND orders.photographer_id = auth.uid()
    )
  );
-- Student can see logs for their orders
CREATE POLICY "Student can view own order logs" ON order_status_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_logs.order_id
      AND orders.user_id = auth.uid()
    )
  );
-- Admin can insert logs
CREATE POLICY "Admin can insert order logs" ON order_status_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- System can insert logs (for server actions)
CREATE POLICY "Authenticated can insert order logs" ON order_status_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. RLS Policies for commission_ledger
-- Admin can see all ledger entries
CREATE POLICY "Admin can view all ledger" ON commission_ledger
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- Photographer can see own ledger entries
CREATE POLICY "Photographer can view own ledger" ON commission_ledger
  FOR SELECT USING (auth.uid() = photographer_id);
-- Admin can insert/update ledger
CREATE POLICY "Admin can manage ledger" ON commission_ledger
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 10. Update RLS on existing tables for admin access
-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- Admin can update any profile
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Admin can view all orders
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- Admin can update any order
CREATE POLICY "Admin can update any order" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Admin can view all slots
CREATE POLICY "Admin can view all slots" ON availability_slots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
-- Admin can update any slot
CREATE POLICY "Admin can update any slot" ON availability_slots
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 11. Update release_expired_holds to also cancel expired orders and log
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS void AS $$
DECLARE
  expired_slot RECORD;
BEGIN
  -- Find all expired HELD slots
  FOR expired_slot IN
    SELECT s.id as slot_id, o.id as order_id, o.status as order_status
    FROM availability_slots s
    JOIN orders o ON o.slot_id = s.id
    WHERE s.status = 'HELD'
    AND s.hold_expires_at < NOW()
    AND o.status = 'PENDING_PAYMENT'
  LOOP
    -- Release the slot
    UPDATE availability_slots
    SET status = 'AVAILABLE', hold_expires_at = NULL
    WHERE id = expired_slot.slot_id;

    -- Cancel the order
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE id = expired_slot.order_id;

    -- Log the status change
    INSERT INTO order_status_logs (order_id, from_status, to_status, actor_id, note)
    VALUES (expired_slot.order_id, expired_slot.order_status, 'CANCELLED', '00000000-0000-0000-0000-000000000000', 'Auto-cancelled: 30-minute payment window expired');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 12. RPC: admin override confirm order
CREATE OR REPLACE FUNCTION admin_confirm_order(target_order_id UUID, admin_id UUID)
RETURNS void AS $$
DECLARE
  order_rec RECORD;
BEGIN
  -- Verify admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND role = 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: not an admin';
  END IF;

  SELECT * INTO order_rec FROM orders WHERE id = target_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Update order status
  UPDATE orders SET status = 'CONFIRMED', confirmed_at = NOW() WHERE id = target_order_id;

  -- Update slot
  UPDATE availability_slots SET status = 'BOOKED' WHERE id = order_rec.slot_id;

  -- Log
  INSERT INTO order_status_logs (order_id, from_status, to_status, actor_id, note)
  VALUES (target_order_id, order_rec.status, 'CONFIRMED', admin_id, 'Admin override: confirmed');
END;
$$ LANGUAGE plpgsql;

-- 13. RPC: admin reject order
CREATE OR REPLACE FUNCTION admin_reject_order(target_order_id UUID, admin_id UUID, reason TEXT DEFAULT 'Admin rejected')
RETURNS void AS $$
DECLARE
  order_rec RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND role = 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: not an admin';
  END IF;

  SELECT * INTO order_rec FROM orders WHERE id = target_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Cancel order
  UPDATE orders SET status = 'CANCELLED' WHERE id = target_order_id;

  -- Release slot
  UPDATE availability_slots SET status = 'AVAILABLE', hold_expires_at = NULL WHERE id = order_rec.slot_id;

  -- Log
  INSERT INTO order_status_logs (order_id, from_status, to_status, actor_id, note)
  VALUES (target_order_id, order_rec.status, 'CANCELLED', admin_id, 'Admin rejected: ' || reason);
END;
$$ LANGUAGE plpgsql;
