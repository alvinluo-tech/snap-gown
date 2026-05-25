-- Temporary test function: bypasses auth.uid() check to test row-level lock mechanism
CREATE OR REPLACE FUNCTION app_private.test_hold_slot(
  p_slot_id uuid,
  p_order_no varchar,
  p_payment_ref varchar,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_slot public.availability_slots%rowtype;
  v_order_id uuid := gen_random_uuid();
  v_expires_at timestamptz := now() + interval '30 minutes';
  v_platform_fee int;
BEGIN
  SELECT * INTO v_slot FROM public.availability_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'SLOT_NOT_FOUND'; END IF;
  IF v_slot.status <> 'AVAILABLE'::public.slot_status THEN RAISE EXCEPTION 'SLOT_NOT_AVAILABLE'; END IF;

  v_platform_fee := round(v_slot.price_pence * 0.15);

  INSERT INTO public.orders (id, order_no, payment_ref, user_id, photographer_id, slot_id, total_amount_pence, platform_fee_pence, status, created_at, updated_at)
  VALUES (v_order_id, p_order_no, p_payment_ref, p_user_id, v_slot.photographer_id, v_slot.id, v_slot.price_pence, v_platform_fee, 'PENDING_PAYMENT'::public.order_status, now(), now());

  UPDATE public.availability_slots SET status = 'HELD'::public.slot_status, hold_expires_at = v_expires_at WHERE id = v_slot.id;

  INSERT INTO public.order_status_logs (order_id, actor_id, to_status, note)
  VALUES (v_order_id, p_user_id, 'PENDING_PAYMENT', 'Concurrency test.');

  RETURN jsonb_build_object('order_id', v_order_id, 'slot_id', v_slot.id);
EXCEPTION
  WHEN unique_violation THEN RAISE EXCEPTION 'SLOT_ALREADY_HAS_ACTIVE_ORDER';
END;
$$;

GRANT EXECUTE ON FUNCTION app_private.test_hold_slot(uuid, varchar, varchar, uuid) TO service_role;
