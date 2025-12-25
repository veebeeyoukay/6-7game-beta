-- Phase 2E: Referral System

-- 1. Update Users with Referral Info
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(12);

-- 2. Create Referral Events Table
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referee_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL, -- 'signup', 'subscription', 'milestone'
  mollars_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- RLS
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own referrals" ON referral_events
  USING (referrer_id = auth.uid());

-- Function to generate random referral code (simple version)
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS VARCHAR AS $$
BEGIN
    RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;
