-- FIX MACHINES TABLE RLS POLICIES
-- We drop ALL potential conflicting policies first to ensure a clean slate.

-- 1. Drop existing policies (handle potential naming variations)
DROP POLICY IF EXISTS "Authenticated users can view machines" ON machines;
DROP POLICY IF EXISTS "Authenticated users can manage machines" ON machines;
DROP POLICY IF EXISTS "Users can view machines" ON machines; -- Just in case
DROP POLICY IF EXISTS "Users can manage machines" ON machines; -- Just in case

-- 2. Create a SINGLE, comprehensive policy for authenticated users
-- This allows Select, Insert, Update, Delete for all logged-in users.
CREATE POLICY "Authenticated users can manage machines"
ON machines FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
