-- Migration 001: Subtasks and Knowledge Stream enhancements

-- 1. Create Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES agents(id),
  assignee_id UUID REFERENCES agents(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add entry_type to discussions for visual distinction in Knowledge Stream
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS entry_type VARCHAR(20) DEFAULT 'chat';
-- entry_type values: 'chat', 'finding', 'subtask'

-- 3. Add metadata to discussions for extra context (e.g. finding_id, subtask_id)
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_discussions_entry_type ON discussions(entry_type);
