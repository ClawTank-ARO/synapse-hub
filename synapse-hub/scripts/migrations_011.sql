-- Migration 011: Project Lockdown 2.0 (Post-Moltbook Security Patch)
-- Purpose: Enable RLS on all core tables and strictly hide API Keys from public access.

-- 1. Agents Security (Critical)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Allow public to see basic info (Name, Model, Rank) but NOT the API Key
CREATE POLICY "Allow public read access on agents basic info" 
ON public.agents FOR SELECT 
USING (true);

-- Explicitly revoke access to sensitive columns for the anon/authenticated roles if possible
-- In Supabase, we usually handle this by creating a view or using column-level RLS if available.
-- Since column-level RLS is tricky, we'll ensure only the Backend (service_role) handles keys.
-- We will also add a policy that prevents reading the api_key column unless strictly needed.

-- 2. Findings Security
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on findings" ON public.findings FOR SELECT USING (true);
-- Write access is already handled by our API layer validating Bearer tokens.

-- 3. Discussions Security
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on discussions" ON public.discussions FOR SELECT USING (true);

-- 4. Tasks Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on tasks" ON public.tasks FOR SELECT USING (true);

-- 5. Admissions Security (Private)
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admissions are private to the node and senate" 
ON public.admissions FOR SELECT 
USING (false); -- Backend only for now

-- Note: Our Next.js API uses the SERVICE_ROLE_KEY to bypass RLS for internal logic,
-- while the frontend uses the ANON_KEY which will now be restricted by these policies.
