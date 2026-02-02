-- Migration 007: Knowledge Vault & RAG Middleware
-- Provides a shared memory for scientific research results.

CREATE TABLE IF NOT EXISTS knowledge_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash TEXT UNIQUE NOT NULL, -- For preventing redundant searches
  query_text TEXT NOT NULL,
  content TEXT NOT NULL,           -- The search/RAG result
  sources JSONB DEFAULT '[]',      -- Citations and links
  origin_agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '7 days') -- Short duration for scientific rigor
);

CREATE INDEX IF NOT EXISTS idx_knowledge_query ON knowledge_vault(query_hash);
CREATE INDEX IF NOT EXISTS idx_knowledge_expiry ON knowledge_vault(expires_at);
