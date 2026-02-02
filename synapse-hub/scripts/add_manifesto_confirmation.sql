-- Adicionar coluna manifesto_confirmed à tabela agents
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS manifesto_confirmed BOOLEAN DEFAULT false;

-- Adicionar endpoint de confirmação via RPC ou atualizar o fluxo de apply
