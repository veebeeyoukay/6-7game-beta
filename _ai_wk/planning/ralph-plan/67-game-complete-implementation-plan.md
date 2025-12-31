# The 6-7 Game — Complete Implementation Plan
## Ralph Wiggum Edition v2.0

**Single Source of Truth for Product, Marketing & Automation**

---

## 📋 EXECUTION GUIDE

### Completion Promise Pattern
```bash
/ralph-loop "<prompt>" --max-iterations <n> --completion-promise "<TASK_ID>_COMPLETE"
```

---

## 🎯 PROJECT OVERVIEW

| Component | Technology |
|-----------|------------|
| Parent App | React Native Expo + Supabase |
| Watch App | Swift/SwiftUI (watchOS 10+) |
| Backend | Supabase (Auth, DB, Realtime, Edge Functions) |
| Quiz Content | Learning Commons MCP |
| Website | Next.js + Tailwind + Vercel |
| Automation | n8n |

### Project Path
```
/Users/vikasbhatia/dev-mm4/the-6-7-game/
├── parent-app/
├── watch-app/
├── website/
├── supabase/
├── n8n-workflows/
└── _ralph_status/
```

---

# PHASE 0: FOUNDATION (4 Tasks)

## TASK-0.1: Verify Infrastructure
- Check Supabase connection
- Verify env vars exist
- Check project directories
- Run npm install
- Verify Xcode project

## TASK-0.2: Create Ralph Status Directory
- Create _ralph_status/
- Initialize progress.json
- Update .gitignore

## TASK-0.3: Create Website Project
- npx create-next-app@latest website
- Install framer-motion, lucide-react
- Create src structure

## TASK-0.4: Create n8n Workflows Directory
- Create n8n-workflows/
- Create README.md
- Create credentials template

---

# PHASE 1: DATABASE MIGRATIONS (5 Tasks)

## TASK-1.1: User Profile Migration (002_user_profile_fields.sql)
- Extend users: first_name, last_name, date_of_birth, state, zip_code
- Add KYC fields: kyc_status, kyc_front_url, kyc_back_url
- Extend families: family_name, adult_count, child_count
- Create family_adults table
- Extend children: birth_month, birth_year, avatar_config, connected_at

## TASK-1.2: Validation System Migration (003_validation_system.sql)
- Create validation_categories (Chores, Tasks, Behaviour, Prep, Bring Back)
- Create validation_tasks (parent-defined with Mollar rewards)
- Create validation_requests (pending, approved, rejected)
- Create mollar_transactions (audit trail)
- Trigger for default categories on family creation

## TASK-1.3: Calendar Migration (004_family_calendar.sql)
- Create calendar_events table
- Support recurrence (iCal RRULE)
- Auto-create events on battle completion

## TASK-1.4: Referral System Migration (005_referral_system.sql)
- Add referral_code (67-XXXX-XXXX format) to users
- Create referral_events table
- Create referral_rewards table
- Auto-generate codes on user creation

## TASK-1.5: Preview & Waitlist Migration (006_preview_waitlist.sql)
- Create preview_sessions table
- Create preview_questions table
- Create waitlist table with priority scoring

---

# PHASE 2: EDGE FUNCTIONS (4 Tasks)

## TASK-2.1: preview-questions
- Calls Anthropic API with Learning Commons MCP
- Generates grade 2-5 Florida B.E.S.T. questions
- Stores in preview_sessions and preview_questions

## TASK-2.2: request-validation
- Child requests credit from Watch
- Creates validation_request with 24hr expiry
- Triggers n8n webhook for parent notification

## TASK-2.3: Referral Tracking (3 functions)
- track-referral-click: Validates code, hashes IP, records click
- process-referral-signup: Awards 50 Mollars to both parties
- get-referral-stats: Returns code, stats, rewards, share URL

## TASK-2.4: waitlist-signup
- Validates email
- Calculates priority score (FL +20, referral +10)
- Triggers n8n webhook for welcome email

---

# PHASE 3: PARENT APP ONBOARDING (6 Tasks)

## TASK-3.1: Layout & Navigation
- Stack navigator for 6 screens
- Button component (primary/secondary/outline)
- Welcome screen with features

## TASK-3.2: Profile Screen
- first_name, last_name, date_of_birth (18+), state, zip_code
- Validation and Supabase update

## TASK-3.3: KYC Screen
- Camera capture for ID front/back
- Upload to Supabase Storage
- Skip option available

## TASK-3.4: Family Setup Screen
- Family name input
- Adult count (1-4), child count (1-6)
- Creates family and family_adults records

## TASK-3.5: Children Setup Screen
- Collects: first_name, birth_month, birth_year, grade (2-5)
- Generates 6-digit pairing codes
- Creates children records

## TASK-3.6: Complete Screen
- Celebration UI
- Displays pairing codes (copyable/shareable)
- Navigate to main dashboard

---

# PHASE 4: PARENT APP DASHBOARD (3 Tasks)

## TASK-4.1: Tab Navigation
- 5 tabs: Dashboard, Calendar, Battles, Referrals, Settings
- Ionicons, light/dark theme support

## TASK-4.2: Dashboard Home
- Family greeting and stats (Mollars, battles, streaks)
- Child cards with avatar, name, Mollars, streak
- Quick actions: Start Battle, Preview Questions, Validations
- Realtime subscriptions

## TASK-4.3: Referrals Tab
- Referral code display (67-XXXX-XXXX)
- Copy/share functionality
- Stats grid: clicks, signups, conversions, rate
- Unclaimed rewards section
- How It Works explainer

---

# PHASE 9: WEBSITE & SEO (2 Tasks)

## TASK-9.1: Website Layout & SEO
- layout.tsx with metadata (OG, Twitter)
- robots.ts (allow all, disallow /api/)
- sitemap.ts (home, privacy, terms)
- constants.ts (colors, features)

## TASK-9.2: Landing Page & Waitlist
- Hero with animated background
- Features section
- How It Works section
- WaitlistForm component
- /api/waitlist route calling Edge Function

---

# PHASE 10: N8N AUTOMATION (3 Tasks)

## TASK-10.1: Waitlist Welcome Workflow
- Webhook trigger on waitlist signup
- SendGrid welcome email
- Slack notification to #waitlist-signups

## TASK-10.2: Validation Request Workflow
- Webhook trigger from Edge Function
- Get family adults from Supabase
- Email each parent with task details

## TASK-10.3: Daily Summary Workflow
- Schedule: 7pm daily
- Get all active users and children
- Build Mollars summary
- Email to each parent

---

# PHASE 11: BUILD & TESTING (3 Tasks)

## TASK-11.1: Parent App Build
- npm install, tsc --noEmit, eslint, expo-doctor, prebuild

## TASK-11.2: Website Build
- npm install, npm run build, npm run lint

## TASK-11.3: Final Report
- Read all status files
- Generate FINAL-REPORT.md

---

# 📊 TASK SUMMARY

| Phase | Tasks | Description |
|-------|-------|-------------|
| 0 | 4 | Foundation & setup |
| 1 | 5 | Database migrations |
| 2 | 4 | Edge functions |
| 3 | 6 | Parent app onboarding |
| 4 | 3 | Dashboard screens |
| 9 | 2 | Website & SEO |
| 10 | 3 | n8n workflows |
| 11 | 3 | Build & testing |
| **Total** | **30** | |

---

# 🔗 DEPENDENCY GRAPH

```
PHASE 0 (Foundation)
├── TASK-0.1: Infrastructure Verify
├── TASK-0.2: Ralph Status Directory
├── TASK-0.3: Website Init
└── TASK-0.4: n8n Init

PHASE 1 (Database) → depends on TASK-0.1
├── TASK-1.1 → 1.2 → 1.3 → 1.4 → 1.5

PHASE 2 (Edge Functions) → depends on Phase 1
├── TASK-2.1 (preview) → depends on 1.5
├── TASK-2.2 (validation) → depends on 1.2
├── TASK-2.3 (referral) → depends on 1.4
└── TASK-2.4 (waitlist) → depends on 1.5

PHASE 3 (Onboarding) → depends on TASK-0.2
├── TASK-3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6

PHASE 4 (Dashboard) → depends on TASK-3.6
├── TASK-4.1 → 4.2
└── TASK-4.3 → depends on 2.3

PHASE 9 (Website) → depends on TASK-0.3
├── TASK-9.1 → 9.2 → depends on 2.4

PHASE 10 (n8n) → depends on TASK-0.4
├── TASK-10.1 → 10.2 → 10.3

PHASE 11 (Build) → depends on ALL
├── TASK-11.1, 11.2, 11.3
```

---

# 🚀 PARALLEL EXECUTION GROUPS

**Group A (After Phase 0):**
- Phase 1 migrations
- Phase 3 onboarding (after 0.2)
- Phase 9 website (after 0.3)
- Phase 10 n8n (after 0.4)

**Group B (After Group A):**
- Phase 2 Edge Functions
- Phase 4 Dashboard

**Group C (Final):**
- Phase 11 Build Testing

---

# ✅ VIKAS ACTIONS REQUIRED

## Before Ralph Starts

### Supabase Setup
- [ ] Create 'kyc-documents' storage bucket
- [ ] Configure storage RLS policies
- [ ] Set Edge Function secrets:
  - ANTHROPIC_API_KEY
  - N8N_WAITLIST_WEBHOOK
  - N8N_VALIDATION_WEBHOOK

### Environment Variables
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] ANTHROPIC_API_KEY
- [ ] EXPO_PUBLIC_* variants

### n8n Setup
- [ ] SendGrid account + API key
- [ ] Slack workspace + channels (#waitlist-signups, #validation-requests)
- [ ] n8n cloud or self-hosted instance

### Vercel Setup
- [ ] Connect website repository
- [ ] Add environment variables
- [ ] Configure custom domain

### Apple Developer
- [ ] TestFlight access configured
- [ ] Push notification certificates
- [ ] Bundle identifiers verified

### Testing
- [ ] James's Apple Watch ready
- [ ] Jack's Apple Watch ready
- [ ] TestFlight on paired iPhones

---

# 📝 VERIFICATION SCRIPT

```bash
# Check all status files
ls -la _ralph_status/TASK-*.json

# Count completed
grep -l '"status": "complete"' _ralph_status/TASK-*.json | wc -l

# Check for failures
grep -l '"status": "failed"' _ralph_status/TASK-*.json || echo "No failures"

# Verify builds
cd parent-app && npx tsc --noEmit && echo "Parent App OK"
cd ../website && npm run build && echo "Website OK"

# List migrations
ls supabase/migrations/

# List Edge Functions
ls supabase/functions/

# List n8n workflows
ls n8n-workflows/*.json
```

---

**30 Tasks | 8 Phases | Product + Marketing + Automation**

**Success Metric:** Kids asking to play without prompting 🎮📚

**Primary Testers:** James (11, 5th grade), Jack (9, 4th grade)
