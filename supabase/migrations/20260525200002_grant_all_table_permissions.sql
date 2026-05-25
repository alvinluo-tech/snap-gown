-- Grant missing table privileges to Supabase roles
-- All tables are missing SELECT/INSERT/UPDATE/DELETE for authenticated/anon

-- orders
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon;

-- availability_slots
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_slots TO anon;

-- order_status_logs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_status_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_status_logs TO anon;

-- commission_ledger
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_ledger TO anon;
