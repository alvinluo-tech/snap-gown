-- ====================================================================
-- SnapGown v2.1 Schema Upgrade
-- Sections 一 (Production DDL) + 二 (Anti-oversell RPC) + 三 (Cron maintenance)
-- All amounts use Integer Pence (便士整数) to eliminate floating-point errors
-- ====================================================================

-- 1. Enable core extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- 2. Create private namespace (isolates critical write functions)
CREATE SCHEMA IF NOT EXISTS app_private;

-- 3. Admin alert events table (for pg_net webhook alerts)
CREATE TABLE IF NOT EXISTS admin_alert_events (
    id BIGSERIAL PRIMARY KEY,
    alert_type TEXT NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    pg_net_request_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (alert_type, order_id)
);

-- 4. Add missing columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS verification_overdue_at TIMESTAMPTZ;

-- 5. Add missing columns to availability_slots
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS price_pence INT NOT NULL DEFAULT 15000;

-- 6. Performance indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_one_active_order_per_slot
ON orders(slot_id)
WHERE status IN ('PENDING_PAYMENT', 'PROOF_SUBMITTED', 'VERIFICATION_OVERDUE', 'CONFIRMED', 'COMPLETED');

CREATE INDEX IF NOT EXISTS idx_orders_payment_uploaded_overdue
ON orders(status, proof_submitted_at) WHERE status = 'PROOF_SUBMITTED';

-- 7. Private domain core function: anti-oversell slot hold with row-level locking
CREATE OR REPLACE FUNCTION app_private.hold_slot_for_payment(
    p_slot_id UUID,
    p_order_no VARCHAR,
    p_payment_ref VARCHAR
)
RETURNS TABLE (
    order_id UUID,
    slot_id UUID,
    order_status public.order_status,
    slot_status public.slot_status,
    hold_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_slot public.availability_slots%ROWTYPE;
    v_order_id UUID := gen_random_uuid();
    v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '30 minutes';
    v_platform_fee INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING errcode = '28000'; END IF;

    -- Row-level lock: exclusive lock on the slot row to prevent concurrent oversell
    SELECT * INTO v_slot FROM public.availability_slots WHERE id = p_slot_id FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'SLOT_NOT_FOUND' USING errcode = 'P0002'; END IF;
    IF v_slot.status <> 'AVAILABLE'::public.slot_status THEN RAISE EXCEPTION 'SLOT_NOT_AVAILABLE' USING errcode = 'P0001'; END IF;
    IF v_slot.slot_date + v_slot.start_time <= NOW() THEN RAISE EXCEPTION 'SLOT_PAST_DUE' USING errcode = 'P0001'; END IF;

    -- Calculate 15% commission in pence
    v_platform_fee := ROUND(v_slot.price_pence * 0.15);

    -- Create order
    INSERT INTO public.orders (id, order_no, payment_ref, user_id, photographer_id, slot_id, total_amount_pence, platform_fee_pence, status, created_at, updated_at)
    VALUES (v_order_id, p_order_no, p_payment_ref, v_user_id, v_slot.photographer_id, v_slot.id, v_slot.price_pence, v_platform_fee, 'PENDING_PAYMENT'::public.order_status, NOW(), NOW());

    -- Update slot status to HELD
    UPDATE public.availability_slots
    SET status = 'HELD'::public.slot_status, hold_expires_at = v_expires_at
    WHERE id = v_slot.id;

    -- Write status transition log
    INSERT INTO public.order_status_logs (order_id, actor_id, to_status, note)
    VALUES (v_order_id, v_user_id, 'PENDING_PAYMENT', 'Student initiated checkout lock.');

    RETURN QUERY SELECT v_order_id, v_slot.id, 'PENDING_PAYMENT'::public.order_status, 'HELD'::public.slot_status, v_expires_at;
EXCEPTION
    WHEN unique_violation THEN RAISE EXCEPTION 'SLOT_ALREADY_HAS_ACTIVE_ORDER' USING errcode = '23505';
END;
$$;

-- 8. Public wrapper for authenticated users
CREATE OR REPLACE FUNCTION public.hold_slot_for_payment(
    p_slot_id UUID,
    p_order_no VARCHAR,
    p_payment_ref VARCHAR
)
RETURNS TABLE (
    order_id UUID,
    slot_id UUID,
    order_status public.order_status,
    slot_status public.slot_status,
    hold_expires_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, app_private, pg_temp
AS $$ SELECT * FROM app_private.hold_slot_for_payment(p_slot_id, p_order_no, p_payment_ref); $$;

-- 9. Grants for authenticated role
GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT EXECUTE ON FUNCTION public.hold_slot_for_payment(UUID, VARCHAR, VARCHAR) TO authenticated;

-- 10. Cron maintenance: release expired holds + 12-hour verification overdue alert
CREATE OR REPLACE FUNCTION app_private.run_booking_maintenance()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
    v_expired_count INT := 0;
    v_overdue_count INT := 0;
    v_alert_ids BIGINT[];
    v_alert_payloads JSONB := '[]'::jsonb;
    v_request_id BIGINT;
    v_api_url TEXT;
    v_api_token TEXT;
BEGIN
    -- Part 1: Release HELD slots where payment proof not uploaded within 30 minutes
    WITH expired_orders AS (
        UPDATE public.orders SET status = 'CANCELLED'::public.order_status, updated_at = NOW()
        WHERE status = 'PENDING_PAYMENT'
          AND id IN (SELECT id FROM public.orders WHERE status = 'PENDING_PAYMENT' AND created_at <= NOW() - INTERVAL '30 minutes')
        RETURNING id, slot_id, user_id
    ),
    log_expires AS (
        INSERT INTO public.order_status_logs (order_id, actor_id, from_status, to_status, note)
        SELECT id, user_id, 'PENDING_PAYMENT', 'CANCELLED', 'Auto-released by cron due to payment timeout.'
        FROM expired_orders
    )
    UPDATE public.availability_slots s
    SET status = 'AVAILABLE'::public.slot_status, hold_expires_at = NULL
    FROM expired_orders e WHERE s.id = e.slot_id AND s.status = 'HELD';

    GET DIAGNOSTICS v_expired_count = ROW_COUNT;

    -- Part 2: Mark orders overdue if proof submitted but not verified within 12 hours
    WITH overdue_orders AS (
        UPDATE public.orders
        SET status = 'VERIFICATION_OVERDUE'::public.order_status,
            verification_overdue_at = NOW(),
            updated_at = NOW()
        WHERE status = 'PROOF_SUBMITTED'
          AND proof_submitted_at <= NOW() - INTERVAL '12 hours'
        RETURNING id, slot_id, user_id, photographer_id, total_amount_pence, payment_proof_url
    ),
    inserted_alerts AS (
        INSERT INTO public.admin_alert_events (alert_type, order_id, payload)
        SELECT 'PAYMENT_VERIFICATION_OVERDUE', o.id,
               jsonb_build_object('order_id', o.id, 'photographer_id', o.photographer_id,
                                  'amount_pence', o.total_amount_pence, 'overdue_at', NOW())
        FROM overdue_orders o
        ON CONFLICT (alert_type, order_id) DO NOTHING
        RETURNING id, payload
    )
    SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::BIGINT[]),
           COALESCE(jsonb_agg(payload), '[]'::jsonb),
           COUNT(*)
    INTO v_alert_ids, v_alert_payloads, v_overdue_count
    FROM inserted_alerts;

    -- Part 3: Fire remote webhook alert to platform admin
    IF v_overdue_count > 0 THEN
        SELECT decrypted_secret INTO v_api_url FROM vault.decrypted_secrets WHERE name = 'admin_alert_api_url';
        SELECT decrypted_secret INTO v_api_token FROM vault.decrypted_secrets WHERE name = 'admin_alert_api_token';
        IF v_api_url IS NOT NULL AND v_api_token IS NOT NULL THEN
            SELECT net.http_post(
                url := v_api_url,
                headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_api_token),
                body := jsonb_build_object('event', 'OVERDUE_ALERT', 'orders', v_alert_payloads)
            ) INTO v_request_id;
            UPDATE public.admin_alert_events SET pg_net_request_id = v_request_id WHERE id = ANY(v_alert_ids);
        END IF;
    END IF;

    RETURN jsonb_build_object('released_expired_slots', v_expired_count, 'triggered_overdue_alerts', v_overdue_count);
END;
$$;

-- 11. Register cron job: run maintenance every 10 minutes
SELECT cron.schedule(
    'booking-maintenance-every-10-minutes',
    '*/10 * * * *',
    $$ SELECT app_private.run_booking_maintenance(); $$
);
