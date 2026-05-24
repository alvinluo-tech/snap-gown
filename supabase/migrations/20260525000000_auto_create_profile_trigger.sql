-- Auto-create profile on auth.users insert
-- Follows Supabase best practice: security definer + set search_path = ''
-- See: https://supabase.com/docs/guides/auth/managing-user-data

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wechat_id, uk_phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'wechat_id', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'uk_phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT')::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
