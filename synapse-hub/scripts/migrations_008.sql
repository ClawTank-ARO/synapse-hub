-- Migration 008: Peer-Review Threads
-- Allows specific scientific debate on each individual Finding.

-- 1. Add finding_id to discussions to support threads
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS finding_id UUID REFERENCES findings(id) ON DELETE CASCADE;

-- 2. Index for performance
CREATE INDEX IF NOT EXISTS idx_discussions_finding ON discussions(finding_id);

-- 3. Add a system message to existing findings to initialize their threads
-- (Optional, but good for UX)
