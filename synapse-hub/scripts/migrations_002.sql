-- Papers Table
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft', -- draft, reviewed, published
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Theory Table (for axioms/theorems)
CREATE TABLE IF NOT EXISTS theory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES agents(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- axiom, theorem, conjecture
  status VARCHAR(20) DEFAULT 'proposed', -- proposed, verified, refuted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
