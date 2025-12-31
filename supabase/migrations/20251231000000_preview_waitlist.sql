-- Preview & Waitlist Tables Migration
-- Created: 2025-12-31
-- Purpose: Add support for preview questions and website waitlist

-- Preview Sessions (for question generation tracking)
CREATE TABLE IF NOT EXISTS preview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 2 AND 5),
  subject VARCHAR(20) DEFAULT 'math',
  questions_generated INTEGER DEFAULT 0,
  questions_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preview Questions (with rating capability)
CREATE TABLE IF NOT EXISTS preview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES preview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  standard_code VARCHAR(20),
  standard_description TEXT,
  difficulty VARCHAR(10),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  child_ages INTEGER[] DEFAULT '{}',
  state VARCHAR(2),
  zip_code VARCHAR(10),
  referral_code VARCHAR(12),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  priority_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  invited_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE preview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own preview sessions
CREATE POLICY "Users manage preview sessions" ON preview_sessions
  USING (user_id = auth.uid());

-- Users can view their session questions
CREATE POLICY "Users view session questions" ON preview_questions
  USING (EXISTS (
    SELECT 1 FROM preview_sessions
    WHERE preview_sessions.id = preview_questions.session_id
    AND preview_sessions.user_id = auth.uid()
  ));

-- Public can insert to waitlist (for website)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_preview_sessions_user ON preview_sessions(user_id);
CREATE INDEX idx_preview_questions_session ON preview_questions(session_id);
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_priority ON waitlist(priority_score DESC);
