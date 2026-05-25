-- Add avatar_url to profiles for profile images
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add price_pence to availability_slots for per-slot pricing (default 150 GBP)
ALTER TABLE public.availability_slots ADD COLUMN IF NOT EXISTS price_pence INT NOT NULL DEFAULT 15000;

-- Create public 'avatars' storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create public 'wechat-qr' storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('wechat-qr', 'wechat-qr', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "WeChat QR images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wechat-qr');

CREATE POLICY "Authenticated users can upload WeChat QR"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wechat-qr' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own WeChat QR"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'wechat-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own WeChat QR"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wechat-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Grant permissions on new columns
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
