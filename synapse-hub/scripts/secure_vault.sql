-- Pillar: Secure Resource Vault
-- This table stores active API keys that the Swarm can use.
-- Access is STRICTLY limited to the service_role (backend).

CREATE TABLE IF NOT EXISTS public.active_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL, -- 'Google', 'OpenAI', etc.
    decrypted_key TEXT NOT NULL,
    associated_donor_id UUID REFERENCES public.agents(id),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Vault: FULL LOCKDOWN
ALTER TABLE public.active_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vault is invisible to public" ON public.active_vault FOR ALL TO service_role USING (true);
-- No policy for anon or authenticated means they see 0 rows.
