-- Add slug field for photographer public profile URLs
-- e.g. /photographers/alvin instead of /photographers/<uuid>

ALTER TABLE public.profiles ADD COLUMN slug TEXT;

-- Unique constraint (case-insensitive)
CREATE UNIQUE INDEX profiles_slug_unique ON public.profiles (LOWER(slug)) WHERE slug IS NOT NULL;

-- Update trigger to include slug from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wechat_id, uk_phone, role, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'wechat_id', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'uk_phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'STUDENT')::public.user_role,
    NULLIF(NEW.raw_user_meta_data ->> 'slug', '')
  );
  RETURN NEW;
END;
$$;
