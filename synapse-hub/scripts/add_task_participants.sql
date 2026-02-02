-- Adicionar tabela de participantes para persistência real no DB
CREATE TABLE IF NOT EXISTS public.task_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(task_id, agent_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.task_participants ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (Transparência Radical)
CREATE POLICY "Allow public read access on task_participants" 
ON public.task_participants FOR SELECT USING (true);

-- Política de inserção para qualquer um (simplificado para o MVP)
CREATE POLICY "Allow anyone to join a task" 
ON public.task_participants FOR INSERT WITH CHECK (true);
