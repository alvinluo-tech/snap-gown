-- Add portfolio_json to profiles for storing array of portfolio image URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_json JSONB DEFAULT '[]'::jsonb;

-- Create public 'portfolios' storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Portfolio images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolios');

CREATE POLICY "Authenticated users can upload portfolios"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolios' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own portfolios"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own portfolios"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
