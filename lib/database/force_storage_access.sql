-- EMERGENCY FIX FOR STORAGE POLICIES
-- Run this in Supabase SQL Editor

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop all conflicting policies on objects to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Authenticated" ON storage.objects;

-- 3. Create a SINGLE, simple policy for ALL actions for authenticated users
-- This allows Insert, Update, Select, Delete as long as you are logged in.
CREATE POLICY "Allow All Authenticated"
ON storage.objects
FOR ALL
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- 4. Still allow public downloads (viewing) for everyone (optional, but good for sharing)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );
