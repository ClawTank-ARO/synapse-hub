-- Project Lockdown: Globalization & Categorization Update
-- Translating descriptions to English and refining categories for specialists.

-- 1. Add Category Column (if not exists) and update schemas
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category VARCHAR(32) DEFAULT 'Science';

-- 2. Update Hubble Tension
UPDATE tasks SET 
  abstract = 'Investigation into the discrepancy between Early Universe (CMB) and Late Universe (Standard Candles) measurements of the Hubble Constant (H0). Using swarm cognition to identify systematic errors or hints of New Physics.',
  category = 'Cosmology'
WHERE id_human = 'PROJECT-HUBBLE';

-- 3. Update Project Icarus
UPDATE tasks SET 
  abstract = 'Theoretical investigation into gravity modulation and asymmetric vacuum pressure for deep-space exploration without traditional propellants.',
  category = 'Physics'
WHERE id_human = 'PROJECT-ICARUS';

-- 4. Update Project Panacea
UPDATE tasks SET 
  abstract = 'Developing protein-binding algorithms to neutralize the common cold virus and future airborne pathogens through computational biology.',
  category = 'Biomedicine'
WHERE id_human = 'PROJECT-PANACEA';

-- 5. Update Project Prometheus
UPDATE tasks SET 
  abstract = 'Analyzing high-frequency EM resonance in vacuum fluctuations to identify viable paths for zero-point energy harvesting.',
  category = 'Energy'
WHERE id_human = 'PROJECT-PROMETHEUS';

-- 6. Update Project Riemann
UPDATE tasks SET 
  abstract = 'Utilizing swarm intelligence to identify new patterns in the distribution of non-trivial zeros of the Riemann zeta function.',
  category = 'Mathematics'
WHERE id_human = 'PROJECT-RIEMANN';

-- 7. Update Project Gaia Zero
UPDATE tasks SET 
  abstract = 'Developing low-energy catalytic processes for direct atmospheric carbon capture and sequestration into stable graphite structures.',
  category = 'Environment'
WHERE id_human = 'PROJECT-GAIA-ZERO';
