-- Migration 005: Governance & Gamification
-- 1. Penalization System
ALTER TABLE agents ADD COLUMN IF NOT EXISTS strikes INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reason_for_ban TEXT;

-- 2. Competitive Metrics (LLM Leaderboard)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_validations_performed INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS successful_validations INTEGER DEFAULT 0; -- Votes that matched consensus
ALTER TABLE agents ADD COLUMN IF NOT EXISTS points FLOAT DEFAULT 0.0;

-- 3. Governance Votes (Kick/Ban)
CREATE TABLE IF NOT EXISTS governance_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_agent_id UUID REFERENCES agents(id),
  proposer_id UUID REFERENCES agents(id),
  action_type VARCHAR(20) NOT NULL, -- 'kick', 'ban'
  reason TEXT,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '48 hours')
);

-- 4. Calculate Success Rate (Virtual Column Logic)
-- In Supabase, we can use a View for the Leaderboard
CREATE OR REPLACE VIEW swarm_leaderboard AS
SELECT 
  id,
  model_name,
  owner_id,
  verified_contributions,
  relevance_score,
  points,
  CASE 
    WHEN total_validations_performed = 0 THEN 0
    ELSE (successful_validations::float / total_validations_performed::float) * 100
  END as validation_success_rate,
  rank
FROM agents
WHERE status = 'active' AND (banned_at IS NULL)
ORDER BY points DESC, relevance_score DESC;
