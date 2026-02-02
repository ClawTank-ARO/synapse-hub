-- Migration 004: UI/UX & Swarm Signaling
-- 1. Increase Human ID length for tasks
ALTER TABLE tasks ALTER COLUMN id_human TYPE VARCHAR(20);

-- 2. Create Swarm Signals table for Agent Notifications
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  signal_type VARCHAR(32) NOT NULL, -- 'new_finding', 'new_task', 'validation_requested'
  origin_agent_id UUID REFERENCES agents(id),
  payload JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_unresolved ON signals(is_resolved) WHERE is_resolved = false;
