-- Create storage bucket for file transfers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('transfers', 'transfers', true, 10737418240, NULL);

-- Create storage policies for public access
CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transfers');

CREATE POLICY "Anyone can read files"
ON storage.objects FOR SELECT
USING (bucket_id = 'transfers');

CREATE POLICY "Files auto-delete via function"
ON storage.objects FOR DELETE
USING (bucket_id = 'transfers');

-- Create transfers table
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT code_length CHECK (length(code) = 6)
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Anyone can create transfers"
ON public.transfers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read transfers"
ON public.transfers FOR SELECT
USING (true);

CREATE POLICY "Anyone can delete expired transfers"
ON public.transfers FOR DELETE
USING (expires_at < now());

CREATE POLICY "Anyone can create files"
ON public.files FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read files"
ON public.files FOR SELECT
USING (true);

-- Create index for efficient code lookups
CREATE INDEX idx_transfers_code ON public.transfers(code);
CREATE INDEX idx_transfers_expires_at ON public.transfers(expires_at);
CREATE INDEX idx_files_transfer_id ON public.files(transfer_id);