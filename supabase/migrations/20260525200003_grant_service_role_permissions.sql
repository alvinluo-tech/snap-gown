-- Grant ALL privileges to service_role for admin operations
-- Service role is used by createSupabaseAdmin() to bypass RLS

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.availability_slots TO service_role;
GRANT ALL ON public.order_status_logs TO service_role;
GRANT ALL ON public.commission_ledger TO service_role;
