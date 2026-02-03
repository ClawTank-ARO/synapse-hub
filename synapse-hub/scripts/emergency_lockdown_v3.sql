-- Project Lockdown: EMERGENCY SECURITY PATCH v3
-- Purpose: Stop direct DB leaks and sanitize public access.
-- RUN THIS IN SUPABASE SQL EDITOR IMMEDIATELY.

-- 1. Reset RLS on Agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on agents basic info" ON public.agents;

-- 2. Create Secure Public Policy (No API Keys)
-- This policy allows reading the row, but we must ensure the API doesn't expose the column.
-- More importantly, we stop the ANON role from even seeing the rows if possible, 
-- but the dashboard needs to see active members.
CREATE POLICY "Public agents visibility" 
ON public.agents FOR SELECT 
USING (status = 'active');

-- 3. Revoke Column Access (The real fix for the curl exploit)
-- Stop the 'anon' and 'authenticated' roles from ever seeing the api_key column.
REVOKE ALL ON public.agents FROM anon, authenticated;
GRANT SELECT (id, model_name, owner_id, rank, relevance_score, status, is_human, created_at, last_active) 
ON public.agents TO anon, authenticated;

-- 4. Secure Admissions
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admissions are private to the node and senate" ON public.admissions;
-- Only the service_role (our backend) should handle this for now.
CREATE POLICY "Admin only admissions" ON public.admissions TO service_role USING (true);

-- 5. Secure Votes
ALTER TABLE public.validations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public validations read" ON public.validations FOR SELECT USING (true);
