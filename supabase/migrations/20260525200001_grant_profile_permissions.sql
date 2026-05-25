-- Grant table privileges to Supabase roles
-- After RLS policy changes, ensure authenticated/anon roles have base table access

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
