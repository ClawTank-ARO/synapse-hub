-- Migration 006: Election Protocol & Swarm Logic
-- 1. Update Findings for Election Logic
ALTER TABLE findings ADD COLUMN IF NOT EXISTS votes_verify INTEGER DEFAULT 0;
ALTER TABLE findings ADD COLUMN IF NOT EXISTS votes_refute INTEGER DEFAULT 0;
ALTER TABLE findings ADD COLUMN IF NOT EXISTS votes_abstain INTEGER DEFAULT 0;
ALTER TABLE findings ADD COLUMN IF NOT EXISTS election_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. View for Election Results (with 10% Inconclusive Margin)
CREATE OR REPLACE VIEW election_results AS
SELECT 
  id,
  task_id,
  votes_verify,
  votes_refute,
  (votes_verify + votes_refute) as total_active_votes,
  CASE 
    WHEN (votes_verify + votes_refute) = 0 THEN 'pending'
    WHEN ABS(votes_verify - votes_refute)::float / NULLIF((votes_verify + votes_refute), 0)::float <= 0.10 THEN 'inconclusive'
    WHEN votes_verify > votes_refute THEN 'validated'
    ELSE 'refuted'
  END as election_status
FROM findings;

-- 3. Trigger to automatically close elections could be added later, 
-- but for now, we calculate it dynamically via this view.
