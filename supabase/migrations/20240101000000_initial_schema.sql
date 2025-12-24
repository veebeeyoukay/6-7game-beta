-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  referral_code VARCHAR(12) UNIQUE,
  kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  kyc_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id),
  inter_child_battles BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  state VARCHAR(2) DEFAULT 'FL',
  grade INTEGER CHECK (grade BETWEEN 2 AND 5),
  pairing_code VARCHAR(6),
  pairing_code_expires TIMESTAMPTZ,
  is_paired BOOLEAN DEFAULT false,
  device_token TEXT, -- for push notifications
  mollars_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battles
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  challenger_type VARCHAR(10) CHECK (challenger_type IN ('parent', 'child')),
  challenger_id UUID NOT NULL,
  opponent_type VARCHAR(10) CHECK (opponent_type IN ('parent', 'child')),
  opponent_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, expired
  questions_count INTEGER DEFAULT 5 CHECK (questions_count IN (5, 10, 15)),
  time_per_question INTEGER DEFAULT 30 CHECK (time_per_question IN (15, 30, 60)),
  subject VARCHAR(20) DEFAULT 'all',
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Battle Questions
CREATE TABLE battle_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["A answer", "B answer", "C answer", "D answer"]
  correct_answer VARCHAR(1) NOT NULL,
  standard_code VARCHAR(20),
  learning_component VARCHAR(100),
  challenger_answer VARCHAR(1),
  challenger_time_ms INTEGER,
  opponent_answer VARCHAR(1),
  opponent_time_ms INTEGER
);

-- Learning Progress
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  standard_code VARCHAR(20) NOT NULL,
  learning_component VARCHAR(100),
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  mastery_level VARCHAR(20) DEFAULT 'not_started', -- not_started, learning, practiced, mastered
  last_tested TIMESTAMPTZ,
  UNIQUE(child_id, standard_code, learning_component)
);

-- Question History
CREATE TABLE question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  question_text TEXT,
  standard_code VARCHAR(20),
  learning_component VARCHAR(100),
  answer_given VARCHAR(1),
  is_correct BOOLEAN,
  time_ms INTEGER,
  mollars_earned INTEGER,
  context VARCHAR(20), -- 'practice' or 'battle'
  battle_id UUID REFERENCES battles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mollar Transactions
CREATE TABLE mollar_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason VARCHAR(50), -- battle_win, practice_bronze, practice_silver, practice_gold, practice_rainbow, practice_diamond
  battle_id UUID REFERENCES battles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mollar_transactions ENABLE ROW LEVEL SECURITY;

-- Users: read/write own data
CREATE POLICY "Users can manage their own data" ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Families:
-- Allow creation by authenticated users
CREATE POLICY "Authenticated users can create families" ON families
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow view/edit if creator
CREATE POLICY "Creators can view/edit their families" ON families
  USING (auth.uid() = created_by);

-- Children:
-- Allow view/edit if parent (via family)
CREATE POLICY "Parents can manage their children" ON children
  USING (EXISTS (
    SELECT 1 FROM families
    WHERE families.id = children.family_id
    AND families.created_by = auth.uid()
  ));

-- Battles, Questions, Progress, History:
-- Simplified RLS for MVP: Allow parents to see everything related to their family
CREATE POLICY "Parents manage battles" ON battles
  USING (EXISTS (
    SELECT 1 FROM families WHERE families.id = battles.family_id AND families.created_by = auth.uid()
  ));

CREATE POLICY "Parents view battle questions" ON battle_questions
  USING (EXISTS (
    SELECT 1 FROM battles
    JOIN families ON families.id = battles.family_id
    WHERE battles.id = battle_questions.battle_id
    AND families.created_by = auth.uid()
  ));
