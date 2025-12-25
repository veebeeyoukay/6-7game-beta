-- Phase 2E: Referral Triggers

-- Function to handle referral rewards when onboarding is completed
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS TRIGGER AS $$
DECLARE
  referrer_user_id UUID;
  bonus_amount INTEGER := 100; -- Configurable reward
BEGIN
  -- Only proceed if transitioning to completed and has a code
  IF NEW.onboarding_completed = true AND OLD.onboarding_completed = false AND NEW.referred_by_code IS NOT NULL THEN
    
    -- Find the referrer
    SELECT id INTO referrer_user_id FROM users WHERE referral_code = NEW.referred_by_code;
    
    IF referrer_user_id IS NOT NULL THEN
      -- Record the event
      INSERT INTO referral_events (referrer_id, referee_id, event_type, mollars_awarded)
      VALUES (referrer_user_id, NEW.id, 'signup_complete', bonus_amount);
      
      -- TODO: If we want to automatically credit a specific wallet, do it here.
      -- Currently logging the award for future claims/subscription discounts.
    END IF;
    
  END IF;
  return NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_onboarding_complete ON users;
CREATE TRIGGER on_onboarding_complete
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_completion();
