-- Phase 2A: Parent Onboarding & Family Ecosystem

-- 1. Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_front_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_back_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

-- 2. Update Families Table
ALTER TABLE families ADD COLUMN IF NOT EXISTS adults_count INTEGER DEFAULT 1;

-- 3. Create Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'parent',
  invite_status VARCHAR(20) DEFAULT 'pending',
  invite_code VARCHAR(8) UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Update Children Table
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12);
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_year INTEGER CHECK (birth_year BETWEEN 2005 AND 2025);
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{}';

-- 5. Family Events (Calendar)
CREATE TABLE IF NOT EXISTS family_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  recurrence_rule TEXT,
  participants JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES family_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  participant_type VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  mollars_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ
);

-- 6. Validation Battles
CREATE TABLE IF NOT EXISTS validation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES validation_categories(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  mollars_reward INTEGER DEFAULT 10,
  game_time_minutes INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  assigned_children JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES validation_tasks(id),
  child_id UUID REFERENCES children(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  parent_note TEXT,
  mollars_awarded INTEGER
);

-- RLS Policies
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their family members" ON family_members
  USING (EXISTS (SELECT 1 FROM families WHERE families.id = family_members.family_id AND families.created_by = auth.uid()));

CREATE POLICY "Users manage family events" ON family_events
  USING (EXISTS (SELECT 1 FROM families WHERE families.id = family_events.family_id AND families.created_by = auth.uid()));

CREATE POLICY "Users manage validation categories" ON validation_categories
  USING (EXISTS (SELECT 1 FROM families WHERE families.id = validation_categories.family_id AND families.created_by = auth.uid()));

CREATE POLICY "Users manage validation tasks" ON validation_tasks
  USING (EXISTS (SELECT 1 FROM families WHERE families.id = validation_tasks.family_id AND families.created_by = auth.uid()));
