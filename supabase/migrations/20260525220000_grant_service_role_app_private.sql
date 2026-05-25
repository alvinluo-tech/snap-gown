-- Grant service_role access to app_private schema and hold_slot_for_payment RPC
GRANT USAGE ON SCHEMA app_private TO service_role;
GRANT EXECUTE ON FUNCTION public.hold_slot_for_payment(UUID, VARCHAR, VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION app_private.hold_slot_for_payment(UUID, VARCHAR, VARCHAR) TO service_role;
