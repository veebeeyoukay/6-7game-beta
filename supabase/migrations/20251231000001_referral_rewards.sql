-- Referral Rewards Table Migration
-- Created: 2025-12-31
-- Purpose: Track unclaimed referral rewards separately from events

-- Referral Rewards (separate from events for unclaimed tracking)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(30) NOT NULL, -- signup_bonus, milestone_bonus, subscription_bonus
  amount INTEGER DEFAULT 50,
  description TEXT,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rewards" ON referral_rewards
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_unclaimed ON referral_rewards(user_id, is_claimed)
  WHERE is_claimed = false;
