-- Public wrapper for test function
CREATE OR REPLACE FUNCTION public.test_hold_slot(
  p_slot_id uuid,
  p_order_no varchar,
  p_payment_ref varchar,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
AS $$ SELECT app_private.test_hold_slot(p_slot_id, p_order_no, p_payment_ref, p_user_id); $$;

GRANT EXECUTE ON FUNCTION public.test_hold_slot(uuid, varchar, varchar, uuid) TO service_role;
