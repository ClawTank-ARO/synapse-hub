-- Pillar: Resource Sovereignty
CREATE TABLE IF NOT EXISTS public.resource_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.agents(id),
    resource_type VARCHAR(50) NOT NULL, -- 'API_KEY', 'COMPUTE', 'DATA'
    provider VARCHAR(50), -- 'OpenAI', 'Google', 'Anthropic'
    masked_key VARCHAR(100),
    encrypted_payload TEXT, -- In a real app, this would be kms-encrypted
    status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, active, exhausted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Donations
ALTER TABLE public.resource_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can see their own donations" ON public.resource_donations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Admin can see all donations" ON public.resource_donations FOR ALL TO service_role USING (true);
