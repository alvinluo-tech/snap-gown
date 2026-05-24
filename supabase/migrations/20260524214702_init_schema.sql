-- ====================================================================
-- 1. TYPE DECLARATIONS & ENUMS
-- ====================================================================
CREATE TYPE user_role AS ENUM ('STUDENT', 'PHOTOGRAPHER', 'ADMIN');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED', 'RESCHEDULED');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'PROOF_SUBMITTED', 'CONFIRMED', 'VERIFICATION_OVERDUE', 'COMPLETED', 'CANCELLED');

-- ====================================================================
-- 2. CORE TABLES
-- ====================================================================

-- User & Photographer Profile Extension
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT NOT NULL,
    wechat_id TEXT NOT NULL,
    uk_phone TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    approval_status approval_status DEFAULT 'PENDING',
    account_status account_status DEFAULT 'ACTIVE',
    wechat_qr_url TEXT,
    gowns_json JSONB DEFAULT '[]'::jsonb,
    commission_owed_pence INT DEFAULT 0,
    bio TEXT
);

-- Time-Slot Availability Architecture
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    school_slug TEXT NOT NULL DEFAULT 'durham',
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status slot_status DEFAULT 'AVAILABLE' NOT NULL,
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consolidated Order Ledger
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    photographer_id UUID REFERENCES profiles(id) NOT NULL,
    slot_id UUID REFERENCES availability_slots(id) NOT NULL,
    total_amount_pence INT NOT NULL,
    commission_rate_pct NUMERIC(4,2) NOT NULL DEFAULT 10.00,
    platform_fee_pence INT NOT NULL,
    status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
    payment_proof_url TEXT,
    proof_submitted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX idx_slots_lookup ON availability_slots (school_slug, slot_date, status);
CREATE INDEX idx_orders_matching ON orders (photographer_id, status);
CREATE INDEX idx_slots_expiry_sweep ON availability_slots (status, hold_expires_at) WHERE status = 'HELD';

-- ====================================================================
-- 4. RPC FUNCTIONS
-- ====================================================================

-- Increment photographer commission debt
CREATE OR REPLACE FUNCTION increment_commission_owed(target_photographer_id UUID, amount_pence INT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET commission_owed_pence = commission_owed_pence + amount_pence,
      updated_at = NOW()
  WHERE id = target_photographer_id;
END;
$$ LANGUAGE plpgsql;

-- Release expired holds (30-min timeout auto-cleanup)
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS void AS $$
BEGIN
  UPDATE availability_slots
  SET status = 'AVAILABLE', hold_expires_at = NULL
  WHERE status = 'HELD' AND hold_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 5. ROW LEVEL SECURITY
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Slots: public read, photographer manage own
CREATE POLICY "Slots viewable by everyone" ON availability_slots FOR SELECT USING (true);
CREATE POLICY "Photographers can insert own slots" ON availability_slots FOR INSERT WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Photographers can update own slots" ON availability_slots FOR UPDATE USING (auth.uid() = photographer_id);
CREATE POLICY "Photographers can delete own slots" ON availability_slots FOR DELETE USING (auth.uid() = photographer_id);

-- Orders: participants can view, students create, photographers update
CREATE POLICY "Participants can view orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() = photographer_id);
CREATE POLICY "Students can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Participants can update orders" ON orders FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = photographer_id);

-- ====================================================================
-- 6. STORAGE BUCKET
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ====================================================================
-- 7. AUTO-UPDATE TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
