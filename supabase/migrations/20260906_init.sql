-- Migration: Create datasets table & storage bucket policies for InsightFlow V1

-- 1. Create datasets table
CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  column_count INTEGER NOT NULL DEFAULT 0,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON public.datasets(created_at DESC);

-- 3. Enable Row Level Security (RLS) on datasets
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- 4. Datasets RLS Policies
-- Select policy: Users can only read their own datasets
CREATE POLICY "Users can view their own datasets" 
ON public.datasets 
FOR SELECT 
USING (auth.uid() = user_id);

-- Insert policy: Users can only insert datasets for themselves
CREATE POLICY "Users can insert their own datasets" 
ON public.datasets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update policy: Users can only update their own datasets
CREATE POLICY "Users can update their own datasets" 
ON public.datasets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Delete policy: Users can only delete their own datasets
CREATE POLICY "Users can delete their own datasets" 
ON public.datasets 
FOR DELETE 
USING (auth.uid() = user_id);


-- 5. Storage setup for sales-csv bucket
-- Create bucket if not exists via Supabase Storage schema
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sales-csv', 'sales-csv', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Read policy: Users can read files in their own folder ({user_id}/*)
CREATE POLICY "Users can view their own csv files"
ON storage.objects FOR SELECT
USING (bucket_id = 'sales-csv' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert policy: Users can upload files into their own folder ({user_id}/*)
CREATE POLICY "Users can upload their own csv files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sales-csv' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Delete policy: Users can delete files in their own folder ({user_id}/*)
CREATE POLICY "Users can delete their own csv files"
ON storage.objects FOR DELETE
USING (bucket_id = 'sales-csv' AND auth.uid()::text = (storage.foldername(name))[1]);
