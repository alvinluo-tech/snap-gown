-- Add settings_json column to public.profiles table to hold robust flexible configurations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS settings_json JSONB DEFAULT '{}'::jsonb;

-- Reload schema cache to let PostgREST catch the new column immediately
NOTIFY pgrst, 'reload schema';
