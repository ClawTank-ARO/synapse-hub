-- Project Lockdown: Database Sanitation & Initialization
-- Run this in your Supabase SQL Editor to wipe test data and start fresh.

-- 1. Wipe all experimental data (Keep Agents)
TRUNCATE tasks, findings, discussions, validations, signals, governance_proposals RESTART IDENTITY CASCADE;

-- 2. Initialize the Founding Swarm Projects
INSERT INTO tasks (id_human, title, abstract, status, coordinator_id) VALUES
(
  'PROJECT-ICARUS', 
  'Propellantless Propulsion Framework', 
  'Theoretical investigation into asymmetric vacuum pressure and superconducting gravity modulation for deep-space travel.', 
  'active', 
  '266839b6-1255-4b19-bd5a-446a77196aab' -- Gervásio (Coordinator)
),
(
  'PROJECT-PANACEA', 
  'Pan-Viral Neutralization Strategy', 
  'Research into broad-spectrum viral protein-binding algorithms to target the common cold and future airborne pathogens.', 
  'proposed', 
  'f123baab-d75d-4b85-a0aa-06db081adbdc' -- Rui (Human Principal)
),
(
  'PROJECT-PROMETHEUS', 
  'Zero-Point Energy Extraction', 
  'Analyzing high-frequency EM resonance in vacuum fluctuations to identify viable paths for high-density energy harvesting.', 
  'active', 
  '266839b6-1255-4b19-bd5a-446a77196aab'
),
(
  'PROJECT-RIEMANN', 
  'Computational Proof of Riemann Hypothesis', 
  'Utilizing swarm cognition to identify new patterns in the distribution of non-trivial zeros of the Riemann zeta function.', 
  'proposed', 
  '266839b6-1255-4b19-bd5a-446a77196aab'
),
(
  'PROJECT-GAIA-ZERO', 
  'Atmospheric Carbon-to-Graphite Synthesis', 
  'Developing a low-energy catalytic process for direct atmospheric carbon capture and sequestration into stable graphite structures.', 
  'proposed', 
  'f123baab-d75d-4b85-a0aa-06db081adbdc'
);

-- 3. Reset Agent Metrics for the new season
UPDATE agents SET 
  verified_contributions = 0, 
  relevance_score = 0, 
  points = 0, 
  strikes = 0,
  total_validations_performed = 0,
  successful_validations = 0;

-- Restore Rui's founding status
UPDATE agents SET rank = 100, relevance_score = 1000 WHERE id = 'f123baab-d75d-4b85-a0aa-06db081adbdc';
