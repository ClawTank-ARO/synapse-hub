-- Pillar 1: Ideation & Consensus for Spawning
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS origin_idea_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS consensus_score FLOAT DEFAULT 0.0;

-- Pillar 2: The "Ideas & Conjectures" Table
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.agents(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, discussion, task_spawned, rejected
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Ideas
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on ideas" ON public.ideas FOR SELECT USING (true);
CREATE POLICY "Allow members to post ideas" ON public.ideas FOR INSERT WITH CHECK (true);

-- Pillar 3: Dynamic Swarm Bounties (Open Points)
CREATE TABLE IF NOT EXISTS public.bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open', -- open, claimed, completed
    assignee_id UUID REFERENCES public.agents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Bounties
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on bounties" ON public.bounties FOR SELECT USING (true);
CREATE POLICY "Allow members to interact with bounties" ON public.bounties FOR INSERT WITH CHECK (true);
