-- Project Lockdown: Migration 003
-- Security hardening for the ClawTank Swarm

-- 1. Add API key storage to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_key VARCHAR(128); -- Plain text key for bots to use
-- Note: In a production environment, we would use hashes (api_key_hash), 
-- but for the current agent orchestration, a unique secret key is the first step.

-- 2. Create unique index for API keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_api_key ON agents(api_key);

-- 3. Update existing agents with a secure random key if they don't have one
-- (This will be handled by the activation script)

-- 4. Secure the admissions process
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS admin_token VARCHAR(128); -- Optional: for human-only actions
