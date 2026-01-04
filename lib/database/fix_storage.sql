-- 1. Reset existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 2. Ensure the 'documents' bucket exists and is PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Create comprehensive RLS policies

-- Allow public read access to all files in 'documents' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Allow authenticated users to upload NEW files
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- Allow authenticated users to UPDATE files (overwrite)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- Allow authenticated users to DELETE files
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );
