# The 6-7 Game — Detailed Ralph Prompts
## Full Task Specifications for Autonomous Execution

---

# PHASE 0: FOUNDATION

## TASK-0.1: Verify Infrastructure Access

\`\`\`bash
/ralph-loop "
Verify all 6-7 Game infrastructure is accessible and working.

VERIFICATION CHECKLIST:
1. Check Supabase connection:
   - Read SUPABASE_URL from /Users/vikasbhatia/dev-mm4/the-6-7-game/parent-app/.env
   - Verify connection works
   - Expected: Connection successful

2. Check environment variables exist:
   - EXPO_PUBLIC_SUPABASE_URL
   - EXPO_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - ANTHROPIC_API_KEY

3. Check project structure:
   - parent-app/ exists (React Native Expo)
   - watch-app/ exists (Swift/SwiftUI)
   - supabase/ exists (migrations and functions)

4. Check npm dependencies:
   - cd parent-app && npm install
   - Verify Expo CLI available

5. Check Xcode project:
   - watch-app/*.xcodeproj exists
   - watchOS target configured

SUCCESS CRITERIA:
- [ ] Supabase connection successful
- [ ] Environment variables present
- [ ] All project directories exist
- [ ] npm install completes
- [ ] Xcode project exists

Create file: /Users/vikasbhatia/dev-mm4/the-6-7-game/_ralph_status/TASK-0.1-infrastructure.json
{
  'task_id': 'TASK-0.1',
  'status': 'complete',
  'supabase_connected': true,
  'env_vars_present': true,
  'projects_exist': true,
  'npm_installed': true,
  'xcode_exists': true,
  'timestamp': '<ISO_DATE>'
}

When ALL checks pass, output: <promise>TASK-0.1_COMPLETE</promise>
" --max-iterations 10 --completion-promise "TASK-0.1_COMPLETE"
\`\`\`

---

## TASK-0.2: Create Ralph Status Directory

\`\`\`bash
/ralph-loop "
Create Ralph status tracking directory and initialize files.

TASKS:
1. Create directory: /Users/vikasbhatia/dev-mm4/the-6-7-game/_ralph_status/

2. Create: /Users/vikasbhatia/dev-mm4/the-6-7-game/_ralph_status/progress.json
{
  'project': 'The 6-7 Game Complete Implementation',
  'version': '2.0',
  'started_at': '<ISO_DATE>',
  'phases': {
    'phase_0': { 'name': 'Foundation', 'status': 'in_progress', 'tasks': [] },
    'phase_1': { 'name': 'Database', 'status': 'pending', 'tasks': [] },
    'phase_2': { 'name': 'Edge Functions', 'status': 'pending', 'tasks': [] },
    'phase_3': { 'name': 'Onboarding', 'status': 'pending', 'tasks': [] },
    'phase_4': { 'name': 'Dashboard', 'status': 'pending', 'tasks': [] },
    'phase_9': { 'name': 'Website', 'status': 'pending', 'tasks': [] },
    'phase_10': { 'name': 'n8n', 'status': 'pending', 'tasks': [] },
    'phase_11': { 'name': 'Build', 'status': 'pending', 'tasks': [] }
  },
  'completed_tasks': [],
  'failed_tasks': []
}

3. Add _ralph_status/ to .gitignore if not present

SUCCESS CRITERIA:
- [ ] Directory exists
- [ ] progress.json created with valid JSON
- [ ] .gitignore updated

When complete, output: <promise>TASK-0.2_COMPLETE</promise>
" --max-iterations 5 --completion-promise "TASK-0.2_COMPLETE"
\`\`\`

---

## TASK-0.3: Create Website Project

\`\`\`bash
/ralph-loop "
Initialize Next.js website project for marketing site.

TASKS:
1. Create website directory:
   cd /Users/vikasbhatia/dev-mm4/the-6-7-game
   npx create-next-app@latest website --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'

2. Install dependencies:
   cd website
   npm install @vercel/analytics @vercel/speed-insights framer-motion lucide-react

3. Create .env.local template

4. Verify build: npm run build

SUCCESS CRITERIA:
- [ ] website/ directory created
- [ ] Dependencies installed
- [ ] Build succeeds

Create: _ralph_status/TASK-0.3-website-init.json

When complete, output: <promise>TASK-0.3_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-0.3_COMPLETE"
\`\`\`

---

## TASK-0.4: Create n8n Directory

\`\`\`bash
/ralph-loop "
Create n8n workflows directory.

TASKS:
1. mkdir -p n8n-workflows
2. Create README.md with workflow overview
3. Create credentials-template.json

SUCCESS CRITERIA:
- [ ] Directory created
- [ ] README exists
- [ ] Template exists

When complete, output: <promise>TASK-0.4_COMPLETE</promise>
" --max-iterations 5 --completion-promise "TASK-0.4_COMPLETE"
\`\`\`

---

# PHASE 1: DATABASE MIGRATIONS

## TASK-1.1: User Profile Migration

\`\`\`bash
/ralph-loop "
Create Supabase migration for user profiles.

FILE: supabase/migrations/002_user_profile_fields.sql

CONTENT:
-- Extend users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(2) DEFAULT 'FL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- KYC fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_front_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_back_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

-- Extend families
ALTER TABLE families ADD COLUMN IF NOT EXISTS family_name VARCHAR(100);
ALTER TABLE families ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 1;
ALTER TABLE families ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0;

-- Create family_adults
CREATE TABLE IF NOT EXISTS family_adults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  status VARCHAR(20) DEFAULT 'pending',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Extend children
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_month INTEGER;
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{}';
ALTER TABLE children ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ;
ALTER TABLE children ADD COLUMN IF NOT EXISTS total_mollars INTEGER DEFAULT 0;
ALTER TABLE children ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- RLS and indexes
ALTER TABLE family_adults ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_family_adults_family ON family_adults(family_id);
CREATE INDEX idx_children_family ON children(family_id);

APPLY: cd supabase && supabase db push

When complete, output: <promise>TASK-1.1_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-1.1_COMPLETE"
\`\`\`

---

## TASK-1.2: Validation System Migration

\`\`\`bash
/ralph-loop "
Create validation system migration.

FILE: supabase/migrations/003_validation_system.sql

CONTENT:
-- Categories
CREATE TABLE IF NOT EXISTS validation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) DEFAULT 'check-circle',
  color VARCHAR(7) DEFAULT '#4CAF50',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS validation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES validation_categories(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  mollar_reward INTEGER DEFAULT 10,
  requires_photo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requests
CREATE TABLE IF NOT EXISTS validation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES validation_tasks(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  photo_url TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  reviewed_at TIMESTAMPTZ,
  mollars_awarded INTEGER DEFAULT 0
);

-- Transactions
CREATE TABLE IF NOT EXISTS mollar_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(30) NOT NULL,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create default categories
CREATE OR REPLACE FUNCTION create_default_validation_categories()
RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO validation_categories (family_id, name, icon, color, sort_order) VALUES
    (NEW.id, 'Chores', 'home', '#4CAF50', 1),
    (NEW.id, 'Tasks', 'clipboard-list', '#2196F3', 2),
    (NEW.id, 'Behaviour', 'heart', '#E91E63', 3),
    (NEW.id, 'Prep', 'backpack', '#FF9800', 4),
    (NEW.id, 'Bring Back', 'package', '#9C27B0', 5);
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER on_family_created_add_categories
  AFTER INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION create_default_validation_categories();

When complete, output: <promise>TASK-1.2_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-1.2_COMPLETE"
\`\`\`

---

## TASK-1.3: Calendar Migration

\`\`\`bash
/ralph-loop "
Create calendar migration.

FILE: supabase/migrations/004_family_calendar.sql

CONTENT:
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  recurrence_rule TEXT,
  participants UUID[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS and indexes
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_calendar_events_family ON calendar_events(family_id);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);

When complete, output: <promise>TASK-1.3_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-1.3_COMPLETE"
\`\`\`

---

## TASK-1.4: Referral System Migration

\`\`\`bash
/ralph-loop "
Create referral system migration.

FILE: supabase/migrations/005_referral_system.sql

CONTENT:
-- Add referral columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- Generate 67-XXXX-XXXX format
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(12) AS \$\$
DECLARE
  new_code VARCHAR(12);
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := '67-' || 
                LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
                LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
\$\$ LANGUAGE plpgsql;

-- Referral events
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(12) NOT NULL,
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  event_type VARCHAR(30) NOT NULL,
  utm_source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(30) NOT NULL,
  amount INTEGER,
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate code
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS \$\$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Backfill existing users
UPDATE users SET referral_code = generate_referral_code() WHERE referral_code IS NULL;

When complete, output: <promise>TASK-1.4_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-1.4_COMPLETE"
\`\`\`

---

## TASK-1.5: Waitlist Migration

\`\`\`bash
/ralph-loop "
Create waitlist migration.

FILE: supabase/migrations/006_preview_waitlist.sql

CONTENT:
-- Preview sessions
CREATE TABLE IF NOT EXISTS preview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 2 AND 5),
  questions_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preview questions
CREATE TABLE IF NOT EXISTS preview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES preview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  standard_code VARCHAR(20),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  child_ages INTEGER[] DEFAULT '{}',
  state VARCHAR(2),
  referral_code VARCHAR(12),
  utm_source VARCHAR(100),
  priority_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous waitlist inserts
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY 'Anyone can join waitlist' ON waitlist FOR INSERT WITH CHECK (true);

When complete, output: <promise>TASK-1.5_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-1.5_COMPLETE"
\`\`\`

---

# PHASE 2: EDGE FUNCTIONS

## TASK-2.1: Preview Questions Function

\`\`\`bash
/ralph-loop "
Create preview-questions Edge Function.

FILE: supabase/functions/preview-questions/index.ts

Key functionality:
- Authenticate user
- Validate grade 2-5
- Create preview_session
- Call Anthropic API with Learning Commons MCP
- Parse questions from response
- Store in preview_questions
- Return questions array

Deploy: supabase functions deploy preview-questions

When deployed, output: <promise>TASK-2.1_COMPLETE</promise>
" --max-iterations 20 --completion-promise "TASK-2.1_COMPLETE"
\`\`\`

---

## TASK-2.2: Request Validation Function

\`\`\`bash
/ralph-loop "
Create request-validation Edge Function.

FILE: supabase/functions/request-validation/index.ts

Key functionality:
- Accept childId, taskId, optional photo
- Verify child and task exist
- Check for duplicate pending request
- Create validation_request with 24hr expiry
- Trigger n8n webhook for notification

Deploy: supabase functions deploy request-validation

When deployed, output: <promise>TASK-2.2_COMPLETE</promise>
" --max-iterations 20 --completion-promise "TASK-2.2_COMPLETE"
\`\`\`

---

## TASK-2.3: Referral Functions

\`\`\`bash
/ralph-loop "
Create referral tracking Edge Functions.

THREE FUNCTIONS:

1. track-referral-click
   - Validate 67-XXXX-XXXX format
   - Hash IP for deduplication
   - Record click event

2. process-referral-signup
   - Prevent self-referral
   - Update referred_by
   - Award 50 Mollars to referrer's children
   - Create reward record

3. get-referral-stats
   - Return user's code and share URL
   - Calculate stats (clicks, signups, conversions)
   - Return unclaimed rewards

Deploy all three functions.

When deployed, output: <promise>TASK-2.3_COMPLETE</promise>
" --max-iterations 25 --completion-promise "TASK-2.3_COMPLETE"
\`\`\`

---

## TASK-2.4: Waitlist Signup Function

\`\`\`bash
/ralph-loop "
Create waitlist-signup Edge Function.

FILE: supabase/functions/waitlist-signup/index.ts

Key functionality:
- Validate email format
- Hash IP for tracking
- Calculate priority score (+20 FL, +10 referral)
- Handle duplicate signups
- Trigger n8n webhook for welcome email

Deploy: supabase functions deploy waitlist-signup

When deployed, output: <promise>TASK-2.4_COMPLETE</promise>
" --max-iterations 20 --completion-promise "TASK-2.4_COMPLETE"
\`\`\`

---

# PHASE 10: N8N WORKFLOWS

## TASK-10.1: Waitlist Welcome

\`\`\`bash
/ralph-loop "
Create waitlist welcome n8n workflow.

FILE: n8n-workflows/waitlist-welcome.json

Nodes:
1. Webhook trigger (POST /waitlist-welcome)
2. Filter: Is waitlist_signup
3. SendGrid: Welcome email
4. Slack: Notify #waitlist-signups
5. Respond OK

When complete, output: <promise>TASK-10.1_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-10.1_COMPLETE"
\`\`\`

---

## TASK-10.2: Validation Notification

\`\`\`bash
/ralph-loop "
Create validation notification workflow.

FILE: n8n-workflows/validation-notification.json

Nodes:
1. Webhook trigger
2. Get family adults from Supabase
3. Loop each parent
4. Get user email
5. SendGrid: Notification email

When complete, output: <promise>TASK-10.2_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-10.2_COMPLETE"
\`\`\`

---

## TASK-10.3: Daily Summary

\`\`\`bash
/ralph-loop "
Create daily summary workflow.

FILE: n8n-workflows/daily-summary.json

Nodes:
1. Schedule trigger (7pm daily)
2. Get active users
3. Loop users
4. Get children
5. Build summary (Code node)
6. SendGrid: Summary email

When complete, output: <promise>TASK-10.3_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-10.3_COMPLETE"
\`\`\`

---

# PHASE 11: BUILD & TESTING

## TASK-11.1: Parent App Build

\`\`\`bash
/ralph-loop "
Verify parent app builds.

Steps:
1. cd parent-app
2. rm -rf node_modules && npm install
3. npx tsc --noEmit (0 errors)
4. npx eslint . --ext .ts,.tsx
5. npx expo-doctor
6. npx expo prebuild --clean

Create: _ralph_status/TASK-11.1-parent-build.json

When all pass, output: <promise>TASK-11.1_COMPLETE</promise>
" --max-iterations 20 --completion-promise "TASK-11.1_COMPLETE"
\`\`\`

---

## TASK-11.2: Website Build

\`\`\`bash
/ralph-loop "
Verify website builds.

Steps:
1. cd website
2. rm -rf node_modules && npm install
3. npm run build
4. npm run lint

Create: _ralph_status/TASK-11.2-website-build.json

When all pass, output: <promise>TASK-11.2_COMPLETE</promise>
" --max-iterations 15 --completion-promise "TASK-11.2_COMPLETE"
\`\`\`

---

## TASK-11.3: Final Report

\`\`\`bash
/ralph-loop "
Generate final report.

Read all _ralph_status/*.json files.
Create: _ralph_status/FINAL-REPORT.md

Include:
- Summary (total/completed/failed)
- Phase status
- Files created
- Migrations applied
- Edge functions deployed
- n8n workflows
- Next steps

When complete, output: <promise>TASK-11.3_COMPLETE</promise>
" --max-iterations 20 --completion-promise "TASK-11.3_COMPLETE"
\`\`\`

---

**Ready for autonomous execution! 🎮📚**
