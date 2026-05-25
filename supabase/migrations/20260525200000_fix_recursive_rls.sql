-- Fix infinite recursion in profiles RLS policies
-- The "Admin can view all profiles" policy queries profiles to check admin role,
-- which triggers itself again → infinite recursion.
-- The existing "Profiles viewable by everyone" (USING true) already covers all SELECT needs.

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;

-- Admin UPDATE on profiles is handled via createSupabaseAdmin() (service role, bypasses RLS).
-- The existing "Users can update own profile" policy remains for regular users.
