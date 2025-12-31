# The 6-7 Game — Phase 2 Development Plan
## Post-MVP Feature Roadmap & Coding Assistant Prompts

**Date:** December 24, 2025
**Current Status:** MVP Scaffolded (Pairing, Practice Mode, Battle Mode shell)
**Goal:** Transform MVP into a polished, Apple-quality family gaming platform

---

## Executive Summary

Phase 2 transforms the scaffolded MVP into a production-ready family gaming platform with three focus areas:

1. **Parent Experience** — Onboarding, KYC, family management, analytics dashboard
2. **Child Experience** — Avatar customization, improved battle UI, multiple-choice answers
3. **Family Ecosystem** — Calendar integration, behavioral validation battles, NFC preparation system

---

## Learning Commons MCP Validation

**CRITICAL:** The Parent Preview Mode feature serves a dual purpose:

1. **User Trust** — Parents can see exactly what their kids will be quizzed on
2. **Technical Validation** — Confirms Learning Commons Knowledge Graph MCP integration is working

### What to Verify

When Preview Mode is working correctly, questions should:

| Check | Expected Result |
|-------|-----------------|
| Standard Code Format | Florida: `MA.5.NSO.2.2` (subject.grade.domain.cluster.standard) |
| Standard Source | FL B.E.S.T. Standards (not generic Common Core) |
| Grade Alignment | Grade 4 questions should reference grade 4 standards |
| Subject Match | Math questions should have MA.* codes, not LA.* |
| Prerequisite Chain | Lower-grade standards should be listed |
| Question Quality | Age-appropriate, clear, solvable |

### Quick Test

After deploying `preview-questions` Edge Function:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/preview-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"state": "FL", "grade": 4, "subject": "math", "count": 3}'
```

Expected response should include questions with valid `MA.4.*` standard codes.

### If MCP Fails

If Learning Commons MCP is unavailable or returns errors:
1. Questions will still generate (Claude has knowledge of standards)
2. Standard codes may be generic or approximate
3. Log issue in `vikas_actions.md`
4. Consider fallback to static question bank

---

## Current State Assessment

### What's Working (Screenshots Reviewed)

| Component | Status | Notes |
|-----------|--------|-------|
| Watch: 6-Digit Pairing | ✅ Complete | Clean UI, functional |
| Watch: Main Menu | ✅ Complete | Practice Mode, Battle Mode, Mollars display (150) |
| Parent: Family Dashboard | ✅ Complete | Shows children, pairing status, Mollars balance |
| Parent: Add Child | ✅ Complete | Name + Grade (2-5) input |
| Parent: Pairing Modal | ✅ Complete | Generates 6-digit code |
| Database: Core Schema | ✅ Complete | Users, families, children, battles |

### What's Missing

| Feature | Priority | Phase |
|---------|----------|-------|
| Parent Onboarding | P0 | 2A |
| KYC/ID Verification | P0 | 2A |
| Child Profile Detail Screen | P1 | 2A |
| Navigation Bar + Analytics | P1 | 2A |
| Light/Dark Theme | P1 | 2A |
| Family Calendar | P1 | 2B |
| Behavioral Validation Battles | P1 | 2B |
| Avatar Customization (Watch) | P1 | 2C |
| Multiple Choice Answers (Watch) | P0 | 2A |
| Visual Pairing (2x2 Grid) | P2 | 2C |
| NFC Preparation System | P2 | 2D |

---

## Phase 2A: Core Polish (Week 1-2)

### Sprint Goal
Make the app feel like a professional Apple product with complete parent onboarding, proper navigation, and polished UI.

### Features

#### 1. Parent Onboarding Flow

**User Story:** As a new parent user, I want to complete my profile and family setup before accessing the dashboard.

**Screens:**
1. **Welcome Screen** — App logo, "Get Started" button
2. **Personal Profile** — First name, last name, date of birth, state (picker), ZIP code
3. **KYC Screen** — Camera capture for driver's license (front/back)
4. **Family Profile** — Family name, number of adults, number of children
5. **Adult Invites** — Add other adults (sends invite with verification)
6. **Children Setup** — For each child: first name, birth month/year, grade (auto-calculated)
7. **Completion** — Animated success, proceed to dashboard

**Database Changes:**
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN state VARCHAR(2);
ALTER TABLE users ADD COLUMN zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN kyc_front_url TEXT;
ALTER TABLE users ADD COLUMN kyc_back_url TEXT;
ALTER TABLE users ADD COLUMN kyc_submitted_at TIMESTAMPTZ;

-- Add to families table
ALTER TABLE families ADD COLUMN adults_count INTEGER DEFAULT 1;

-- Family members table (for multi-adult households)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'parent', -- parent, guardian, caregiver
  invite_status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  invite_code VARCHAR(8) UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- Update children table
ALTER TABLE children ADD COLUMN birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12);
ALTER TABLE children ADD COLUMN birth_year INTEGER CHECK (birth_year BETWEEN 2005 AND 2023);
ALTER TABLE children ADD COLUMN avatar_config JSONB DEFAULT '{}';
```

#### 2. Navigation Bar & Analytics Dashboard

**Components:**
- Bottom navigation: Home, Calendar, Battles, Settings
- Home screen analytics:
  - Total family Mollars
  - Battles this week (won/lost)
  - Practice sessions completed
  - Streak counters per child
  - Quick action buttons

**Design System:**
- Safe area compliance (notch, home indicator)
- System color scheme support (light/dark/auto)
- SF Symbols for icons
- Haptic feedback on interactions

#### 3. Child Profile Detail Screen

**Accessed by:** Tapping child card on dashboard

**Content:**
- Avatar preview (placeholder until Phase 2C)
- Name, grade, birth month/year (editable)
- Pairing status with timestamp
- Mollars balance with transaction history link
- Standards mastery progress (from Learning Commons)
- Battle history (wins/losses)
- Practice statistics
- "Edit" and "Disconnect Watch" actions

#### 4. Multiple Choice on Watch (Critical)

**Current Issue:** Keyboard input on Apple Watch is cumbersome for kids.

**Solution:** All quiz answers must be multiple choice with large tap targets.

**UI Layout:**
```
┌─────────────────────┐
│     What is        │
│      7 × 8?        │
├──────────┬─────────┤
│    54    │   56    │
├──────────┼─────────┤
│    48    │   64    │
└──────────┴─────────┘
```

---

## Phase 2B: Family Ecosystem (Week 3-4)

### Sprint Goal
Transform the app from individual play into family collaboration with calendars and behavioral validation.

### Features

#### 5. Family Calendar

**User Story:** As a parent, I want to schedule battles, track activities, and see my family's gaming history.

**Database Schema:**
```sql
CREATE TABLE family_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL, -- scheduled_battle, activity, reminder, nfc_prep
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  recurrence_rule TEXT, -- RRULE format
  participants JSONB DEFAULT '[]', -- [{type: "child", id: "uuid"}, {type: "parent", id: "uuid"}]
  metadata JSONB DEFAULT '{}', -- battle_config, nfc_checklist, etc.
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES family_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  participant_type VARCHAR(10) NOT NULL, -- parent, child
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, skipped
  mollars_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ
);
```

**Features:**
- Month/week/day views
- Create scheduled battles
- Activity profiles (from NFC system: School, Sports, Music)
- Sync with iOS Calendar (read-only initially)
- Event reminders via push notifications

#### 6. Behavioral Validation Battles (Parent vs Child)

**Concept:** Parents can validate real-world behaviors and tasks, turning accountability into a game.

**Battle Categories (Default):**
| Category | Description | Example Tasks |
|----------|-------------|---------------|
| Chores | Household responsibilities | Made bed, Cleaned room, Fed pet |
| Tasks | One-time assignments | Finished homework, Practiced instrument |
| Behavior | Conduct validation | Was kind to sibling, Used manners |
| Prep | Preparation validation | Packed backpack, Ready on time |
| Bring Back | Item return validation | Returned library books, Brought lunchbox home |

**Database Schema:**
```sql
CREATE TABLE validation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50), -- SF Symbol name
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE validation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES validation_categories(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  mollars_reward INTEGER DEFAULT 10,
  game_time_minutes INTEGER DEFAULT 0, -- alternative reward
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  assigned_children JSONB DEFAULT '[]', -- child IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE validation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES validation_tasks(id),
  child_id UUID REFERENCES children(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, denied
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  parent_note TEXT,
  mollars_awarded INTEGER
);
```

**Flow:**
1. Child completes task in real world
2. Child taps "Request Validation" on watch for specific task
3. Parent receives push notification: "James claims: Practiced violin ✓✗"
4. Parent taps ✓ (approved) or ✗ (denied) with optional note
5. Child receives result + Mollars if approved
6. Transaction logged for accountability

**Watch UI for Validation:**
```
┌─────────────────────┐
│   Request Credit    │
├─────────────────────┤
│   🧹 Chores         │
│   📚 Tasks          │
│   ⭐ Behavior       │
│   🎒 Prep           │
│   📦 Bring Back     │
└─────────────────────┘
        ↓ tap
┌─────────────────────┐
│     🧹 Chores       │
├─────────────────────┤
│   Made Bed          │
│   Cleaned Room      │
│   Fed Max           │
│   + Custom...       │
└─────────────────────┘
```

---

## Phase 2C: Child Experience (Week 5-6)

### Sprint Goal
Make the watch app delightful with personalization and kid-friendly interactions.

### Features

#### 7. Avatar Customization (Watch)

**First Login Flow:**
1. "Create Your Player" title
2. Swipe left/right: Pixelated boy or girl base
3. Tap "Customize"
4. Hair style (6 options via swipe)
5. Skin tone (6 options via swipe)
6. Top color (8 options via swipe)
7. Bottom color (8 options via swipe)
8. "Done" → Avatar saved to `children.avatar_config`

**Avatar Config Schema:**
```json
{
  "base": "boy" | "girl",
  "hair_style": 1-6,
  "skin_tone": 1-6,
  "top_color": "#hex",
  "bottom_color": "#hex",
  "evolution_stage": 1-6
}
```

**Visual Style:** 16x16 pixel art that "evolves" as child levels up (matches the "6-7 to awesome" theme).

#### 8. Visual Pairing (Security Enhancement)

**Current:** 6-digit code typed on watch keyboard
**Problem:** Keyboard is slow and error-prone for kids

**Solution: 2x2 Grid Challenge**

**Parent App Shows:**
```
┌─────────────────────────┐
│     Connect Watch       │
│                         │
│  Enter this code on     │
│  the Apple Watch:       │
│                         │
│     ┌─────┬─────┐       │
│     │  3  │  7  │       │
│     ├─────┼─────┤       │
│     │  1  │  9  │       │
│     └─────┴─────┘       │
│                         │
│  Tap: 1st then 3rd      │
│  (positions: ↖️ then ↙️)  │
│                         │
│         [OK]            │
└─────────────────────────┘
```

**Watch Shows:**
```
┌─────────────────────┐
│   Tap the numbers   │
│   your parent shows │
├──────────┬──────────┤
│    3     │    7     │
├──────────┼──────────┤
│    1     │    9     │
└──────────┴──────────┘
│  Waiting for taps...│
└─────────────────────┘
```

**Logic:**
- Parent sees: 4 random digits + instruction (e.g., "Tap 1st then 3rd")
- Watch shows: Same 4 digits in same positions
- Child taps two digits in order
- System validates: Did child tap positions 1 and 3?
- Success: Paired. Fail: Regenerate grid.

---

## Phase 2E: Referral & Viral Growth Engine (Week 8-9)

### Sprint Goal
Enable viral growth through family-to-family referrals with full analytics tracking. Parents share referral codes, earn bonus Mollars for their children, and see their referral impact.

### Why Referrals Matter for 6-7 Game

| Growth Vector | Mechanism |
|---------------|-----------|
| School Networks | Parents share with other parents at pickup |
| Sports Teams | Team parents refer each other |
| Playdates | "My kid loves this game" conversations |
| Family Groups | Grandparents, aunts/uncles with kids |
| Social Media | Parent influencers, mommy bloggers |

### Features

#### 11. Referral System Core

**User Story:** As a parent, I want to share my referral code with other families so my children earn bonus Mollars when they sign up.

**Referral Flow:**
```
1. Parent A copies referral link from app
2. Parent A shares via text/social/email
3. Parent B clicks link → lands on signup with ?ref=CODE
4. Parent B completes signup and onboarding
5. Parent B's child completes first battle (conversion)
6. Parent A's children receive bonus Mollars (50 each)
7. Both families see referral in their dashboards
```

**Database Schema:**
```sql
-- Add referral code to users table (may already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(12);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES users(id);

-- Referral events tracking table
CREATE TABLE referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referrer info
  referral_code VARCHAR(12) NOT NULL,
  referrer_user_id UUID REFERENCES users(id),
  
  -- Event type and status
  event_type VARCHAR(20) NOT NULL, -- 'click', 'signup', 'onboarding_complete', 'first_battle', 'conversion'
  source VARCHAR(20) DEFAULT 'direct', -- 'direct', 'social', 'email', 'sms', 'qr'
  
  -- Referred user info (populated as they progress)
  referred_email TEXT,
  referred_user_id UUID REFERENCES users(id),
  referred_family_id UUID REFERENCES families(id),
  
  -- Tracking metadata
  ip_address INET,
  user_agent TEXT,
  utm_source VARCHAR(50),
  utm_medium VARCHAR(50),
  utm_campaign VARCHAR(50),
  utm_content VARCHAR(100),
  referring_url TEXT,
  
  -- Timestamps for funnel tracking
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ,
  first_battle_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  -- Reward tracking
  reward_granted BOOLEAN DEFAULT false,
  reward_amount INTEGER DEFAULT 0,
  reward_granted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_referral_events_code ON referral_events(referral_code);
CREATE INDEX idx_referral_events_referrer ON referral_events(referrer_user_id);
CREATE INDEX idx_referral_events_referred ON referral_events(referred_user_id);
CREATE INDEX idx_referral_events_type ON referral_events(event_type);
CREATE INDEX idx_referral_events_created ON referral_events(created_at DESC);

-- Referral rewards configuration
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_event VARCHAR(20) NOT NULL, -- 'signup', 'onboarding_complete', 'first_battle', 'conversion'
  referrer_mollars INTEGER DEFAULT 0,
  referred_mollars INTEGER DEFAULT 0,
  referrer_game_time_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  max_rewards_per_user INTEGER, -- null = unlimited
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default rewards
INSERT INTO referral_rewards (name, description, trigger_event, referrer_mollars, referred_mollars) VALUES
('Signup Bonus', 'Bonus when referred family signs up', 'signup', 10, 25),
('Onboarding Complete', 'Bonus when referred family completes setup', 'onboarding_complete', 15, 0),
('First Battle', 'Bonus when referred child completes first battle', 'first_battle', 25, 10),
('Full Conversion', 'Bonus for fully active referred family', 'conversion', 50, 25);

-- Referral stats materialized view (for fast analytics)
CREATE MATERIALIZED VIEW referral_stats AS
SELECT
  referrer_user_id,
  referral_code,
  COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
  COUNT(*) FILTER (WHERE event_type = 'signup') as total_signups,
  COUNT(*) FILTER (WHERE event_type = 'first_battle') as total_conversions,
  COUNT(DISTINCT referred_user_id) as unique_referrals,
  SUM(reward_amount) as total_mollars_earned,
  MAX(created_at) as last_referral_at
FROM referral_events
WHERE referrer_user_id IS NOT NULL
GROUP BY referrer_user_id, referral_code;

CREATE UNIQUE INDEX idx_referral_stats_user ON referral_stats(referrer_user_id);
```

**Referral Code Generation:**
```typescript
// Generate unique, readable referral code
function generateReferralCode(userId: string): string {
  // Format: 67-XXXX-XXXX (easy to read/share)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0/O, 1/I/L)
  let code = '67-';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code; // e.g., "67-AB3K-M9PQ"
}
```

**Edge Function: track-referral-click**
```typescript
// supabase/functions/track-referral-click/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { code, source, utm_source, utm_medium, utm_campaign, utm_content, referring_url } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Validate referral code exists
  const { data: referrer } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', code)
    .single()
  
  if (!referrer) {
    return new Response(JSON.stringify({ valid: false }), { status: 200 })
  }
  
  // Get request metadata
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')
  const userAgent = req.headers.get('user-agent')
  
  // Create click event
  const { data: event } = await supabase
    .from('referral_events')
    .insert({
      referral_code: code,
      referrer_user_id: referrer.id,
      event_type: 'click',
      source: source || 'direct',
      ip_address: ip,
      user_agent: userAgent,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      referring_url,
      clicked_at: new Date().toISOString()
    })
    .select()
    .single()
  
  return new Response(JSON.stringify({
    valid: true,
    event_id: event?.id
  }))
})
```

**Edge Function: process-referral-signup**
```typescript
// supabase/functions/process-referral-signup/index.ts
serve(async (req) => {
  const { referral_code, new_user_id, new_user_email, event_id } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Validate referral code
  const { data: referrer } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', referral_code)
    .single()
  
  if (!referrer) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid code' }))
  }
  
  // Prevent self-referral
  if (referrer.id === new_user_id) {
    return new Response(JSON.stringify({ success: false, error: 'Self-referral not allowed' }))
  }
  
  // Update or create referral event
  if (event_id) {
    // Update existing click event
    await supabase
      .from('referral_events')
      .update({
        event_type: 'signup',
        referred_user_id: new_user_id,
        referred_email: new_user_email,
        signed_up_at: new Date().toISOString()
      })
      .eq('id', event_id)
  } else {
    // Create new signup event (direct signup without prior click)
    await supabase
      .from('referral_events')
      .insert({
        referral_code,
        referrer_user_id: referrer.id,
        event_type: 'signup',
        referred_user_id: new_user_id,
        referred_email: new_user_email,
        signed_up_at: new Date().toISOString()
      })
  }
  
  // Update new user's referral info
  await supabase
    .from('users')
    .update({
      referred_by_code: referral_code,
      referred_by_user_id: referrer.id
    })
    .eq('id', new_user_id)
  
  // Get and grant signup reward
  const { data: reward } = await supabase
    .from('referral_rewards')
    .select('*')
    .eq('trigger_event', 'signup')
    .eq('is_active', true)
    .single()
  
  if (reward) {
    // Grant mollars to referrer's children
    const { data: referrerChildren } = await supabase
      .from('children')
      .select('id')
      .eq('family_id', referrer.family_id)
    
    for (const child of referrerChildren || []) {
      await supabase.rpc('add_mollars', {
        child_id: child.id,
        amount: reward.referrer_mollars,
        reason: 'referral_signup'
      })
    }
  }
  
  return new Response(JSON.stringify({ success: true }))
})
```

#### 12. Referral Dashboard (Parent App)

**Location:** New tab in bottom navigation OR section in Settings

**UI Layout:**
```
┌─────────────────────────────────────┐
│ ← Referrals                         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  Your Referral Code             │ │
│ │                                 │ │
│ │     67-AB3K-M9PQ                │ │
│ │                                 │ │
│ │  [📋 Copy]  [📤 Share]         │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Your Impact                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Clicks  │ │ Signups │ │ Active  ││
│ │   47    │ │   12    │ │    8    ││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ Mollars Earned: 🪙 650              │
├─────────────────────────────────────┤
│ How It Works                        │
│ ┌─────────────────────────────────┐ │
│ │ 1. Share your code with friends │ │
│ │ 2. They sign up & add kids      │ │
│ │ 3. Their kid plays first battle │ │
│ │ 4. Your kids earn 50 Mollars!   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Recent Referrals                    │
│ ┌─────────────────────────────────┐ │
│ │ 🟢 The Johnson Family           │ │
│ │    Converted • +50 Mollars      │ │
│ │    2 days ago                   │ │
│ ├─────────────────────────────────┤ │
│ │ 🟡 The Garcia Family            │ │
│ │    Signed up • Waiting for      │ │
│ │    first battle                 │ │
│ │    5 days ago                   │ │
│ ├─────────────────────────────────┤ │
│ │ ⚪ Anonymous                    │ │
│ │    Clicked link                 │ │
│ │    1 week ago                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Share Modal:**
```
┌─────────────────────────────────────┐
│         Share The 6-7 Game          │
├─────────────────────────────────────┤
│                                     │
│  🎮 My kids love The 6-7 Game!      │
│  Join us and your kids earn         │
│  Mollars for learning math.         │
│                                     │
│  the67game.com/join?ref=67-AB3K-M9PQ│
│                                     │
├─────────────────────────────────────┤
│ Share via:                          │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 💬  │ │ 📧  │ │ 📘  │ │ 🐦  │   │
│ │Text │ │Email│ │ FB  │ │ X   │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│     [📋 Copy Link]                  │
│                                     │
└─────────────────────────────────────┘
```

**Edge Function: get-referral-stats**
```typescript
// supabase/functions/get-referral-stats/index.ts
serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  
  // Get user's referral code
  const { data: profile } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', user.id)
    .single()
  
  // Get aggregated stats
  const { data: events } = await supabase
    .from('referral_events')
    .select('event_type, reward_amount, created_at, referred_user_id')
    .eq('referrer_user_id', user.id)
    .order('created_at', { ascending: false })
  
  const stats = {
    referral_code: profile?.referral_code,
    total_clicks: events?.filter(e => e.event_type === 'click').length || 0,
    total_signups: events?.filter(e => e.event_type === 'signup').length || 0,
    total_conversions: events?.filter(e => e.event_type === 'conversion').length || 0,
    total_mollars_earned: events?.reduce((sum, e) => sum + (e.reward_amount || 0), 0) || 0,
    conversion_rate: 0,
    recent_events: events?.slice(0, 10) || []
  }
  
  if (stats.total_clicks > 0) {
    stats.conversion_rate = Math.round((stats.total_conversions / stats.total_clicks) * 100)
  }
  
  return new Response(JSON.stringify(stats))
})
```

#### 13. QR Code Sharing

**Feature:** Generate QR code for in-person sharing (sports practice, school events)

**Implementation:**
```typescript
// Use qrcode library to generate QR
import QRCode from 'qrcode';

async function generateReferralQR(code: string): Promise<string> {
  const url = `https://the67game.com/join?ref=${code}&utm_source=qr&utm_medium=offline`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 256,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  });
  return qrDataUrl;
}
```

**Watch Integration (Stretch Goal):**
Kids can show QR code on watch face to share with friends' parents:
```
┌─────────────────────┐
│  Share with Friend  │
├─────────────────────┤
│                     │
│    ┌───────────┐    │
│    │ [QR CODE] │    │
│    │           │    │
│    │           │    │
│    └───────────┘    │
│                     │
│  Have their parent  │
│  scan this code!    │
│                     │
│  🪙 +50 if they join│
└─────────────────────┘
```

#### 14. Referral Leaderboard (Optional)

**Gamify referrals with family leaderboard:**
```
┌─────────────────────────────────────┐
│ 🏆 Top Referrers This Month         │
├─────────────────────────────────────┤
│ 1. 🥇 The Martinez Family    23     │
│ 2. 🥈 The Chen Family        18     │
│ 3. 🥉 The Williams Family    15     │
│ ...                                 │
│ 47. 👨‍👩‍👧‍👦 Your Family           3     │
├─────────────────────────────────────┤
│ Top 3 win 500 Mollars each!         │
└─────────────────────────────────────┘
```

### Referral Rewards Structure

| Event | Referrer Gets | Referred Gets | Notes |
|-------|---------------|---------------|-------|
| Click | — | — | Just tracked |
| Signup | 10 Mollars/child | 25 Mollars/child | Welcome bonus |
| Onboarding Complete | 15 Mollars/child | — | Profile + kids added |
| First Battle | 25 Mollars/child | 10 Mollars/child | Real engagement |
| 7-Day Active | 50 Mollars/child | 25 Mollars/child | Retention reward |

**Total Potential:** 100 Mollars per child for successful referral

### Analytics Tracking

**Events to Track:**
| Event | Trigger | Data Captured |
|-------|---------|---------------|
| `referral_link_generated` | User copies/shares link | source (app/web), share_method |
| `referral_link_clicked` | Someone clicks link | UTM params, device, location |
| `referral_signup_started` | Referred user starts signup | referral_code, email |
| `referral_signup_completed` | Referred user completes signup | user_id, family_id |
| `referral_onboarding_completed` | Referred user finishes onboarding | children_count |
| `referral_first_battle` | Referred child plays first battle | child_id, battle_id |
| `referral_conversion` | 7+ days of activity | retention_days |

### Integration Points

**1. Signup Flow:**
- Check URL for `?ref=` parameter
- Store in session/local storage
- Pass to signup API
- Process referral on successful signup

**2. Onboarding Flow:**
- Track completion as referral milestone
- Grant onboarding rewards

**3. First Battle (Watch App):**
- Check if child is from referred family
- Check if this is their first battle
- Trigger conversion tracking
- Grant battle rewards to both families

**4. Parent Dashboard:**
- Show referral section/tab
- Display stats and earnings
- Show referral code prominently

---

## Phase 2D: NFC Preparation System (Week 7-8)

### Sprint Goal
Bridge digital gaming with real-world responsibility tracking.

### Features

#### 9. NFC Item Tracking Integration

**Concept:** Kids earn Mollars for completing preparation checklists verified via NFC tags.

**Activity Profiles:**
- School Day: Backpack, lunchbox, homework folder, instrument
- Soccer: Cleats, shin guards, water bottle, uniform
- Music: Instrument case, sheet music, metronome

**Database Schema:**
```sql
CREATE TABLE nfc_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  nfc_tag_id VARCHAR(100) UNIQUE, -- From NFC scan
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  items JSONB DEFAULT '[]', -- array of nfc_item IDs
  mollars_reward INTEGER DEFAULT 10,
  streak_bonus JSONB DEFAULT '{"3": 5, "7": 15, "30": 50}'
);

CREATE TABLE preparation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES activity_profiles(id),
  child_id UUID REFERENCES children(id),
  items_scanned JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT false,
  mollars_earned INTEGER DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** NFC scanning requires iPhone app (watch doesn't have NFC reader for tags). This becomes a Parent App feature where kids scan items before leaving, tracked to their profile.

---

## Phase 2A-Plus: Parent Preview Mode (Week 2)

### Sprint Goal
Give parents full visibility into what their children will experience, pulling real questions from Learning Commons Knowledge Graph.

### Features

#### 10. Parent Quiz Preview Mode

**User Story:** As a parent, I want to preview the exact types of questions my child will receive so I can verify the content is appropriate and aligned with their schoolwork.

**Access Points:**
- Child Profile → "Preview Questions" button
- Settings → "Question Preview"
- Battle Setup → "Preview Questions" link

**Preview Flow:**
1. Parent selects child (or grade if no child selected)
2. Parent selects subject (Math, ELA, Science, All)
3. System fetches 5 sample questions from Learning Commons
4. Parent can swipe through questions
5. Each question shows: question text, answer options, correct answer, standard code, standard description

**UI Layout:**
```
┌─────────────────────────────────────┐
│ ← Preview Questions                 │
├─────────────────────────────────────┤
│ Previewing for: James (Grade 5)     │
│ Subject: [Math ▼]                   │
├─────────────────────────────────────┤
│ Question 1 of 5                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │  Sarah has 3 boxes of crayons.  │ │
│ │  Each box has 24 crayons.       │ │
│ │  How many crayons does she      │ │
│ │  have in all?                   │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │   72    │ │   27    │            │
│ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐            │
│ │   21    │ │   96    │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ ✓ Correct Answer: 72                │
├─────────────────────────────────────┤
│ 📚 Standard: MA.5.NSO.2.2          │
│ "Multiply multi-digit whole         │
│ numbers including using a standard  │
│ algorithm with procedural fluency." │
├─────────────────────────────────────┤
│      [← Prev]  •••○○  [Next →]     │
└─────────────────────────────────────┘
```

**Additional Features:**
- "Refresh" button to get new sample questions
- "Report Issue" if question seems inappropriate
- "Try as Watch" button to see Watch UI mockup
- Filter by difficulty (Easy/Medium/Hard)
- Show prerequisite standards for struggling areas

**Database Schema:**
```sql
-- Track preview sessions for analytics
CREATE TABLE preview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  grade INTEGER,
  state VARCHAR(2),
  subject VARCHAR(20),
  questions_previewed JSONB DEFAULT '[]',
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question feedback from parents
CREATE TABLE question_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_hash VARCHAR(64), -- hash of question text
  standard_code VARCHAR(20),
  feedback_type VARCHAR(20), -- inappropriate, too_hard, too_easy, incorrect, great
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Edge Function: preview-questions**

This is critical for validating the Learning Commons integration is working correctly.

```typescript
// supabase/functions/preview-questions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "npm:@anthropic-ai/sdk"

const anthropic = new Anthropic()

serve(async (req) => {
  const { state, grade, subject, count = 5, difficulty } = await req.json()
  
  // Validate inputs
  if (!state || !grade) {
    return new Response(
      JSON.stringify({ error: "state and grade are required" }),
      { status: 400 }
    )
  }

  const systemPrompt = `You are generating preview quiz questions for parents to review.
These questions will be shown to children on Apple Watches.

IMPORTANT: Use the Learning Commons Knowledge Graph MCP to ensure questions are aligned
to ${state} state standards for grade ${grade}.

For Florida, use FL B.E.S.T. Standards.
For other states, use their adopted standards (Common Core where applicable).`

  const userPrompt = `Generate ${count} multiple choice quiz questions for a grade ${grade} student in ${state}.

Requirements:
- Subject: ${subject || 'math'}
- Difficulty: ${difficulty || 'grade-appropriate mix'}
- Each question must have exactly 4 answer options
- Questions should be appropriate for Apple Watch display (concise)
- Include word problems and computational problems

For EACH question, you MUST:
1. Use the Learning Commons Knowledge Graph to find the appropriate state standard
2. Include the exact standard code (e.g., MA.5.NSO.2.2 for Florida)
3. Include the full standard description
4. Identify any prerequisite standards

Return a JSON array with this exact structure:
[
  {
    "question_text": "The question (keep under 100 characters if possible)",
    "options": ["A) answer1", "B) answer2", "C) answer3", "D) answer4"],
    "correct_answer": "A",
    "correct_index": 0,
    "standard_code": "MA.5.NSO.2.2",
    "standard_description": "Full text of the standard from Learning Commons",
    "learning_component": "Specific skill being tested",
    "difficulty": "easy|medium|hard",
    "explanation": "Why this is the correct answer (for parent reference)",
    "prerequisite_standards": ["MA.4.NSO.2.1"]
  }
]

Return ONLY valid JSON, no markdown or explanations.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      mcp_servers: [{
        type: "url",
        url: "https://kg.mcp.learningcommons.org/mcp",
        name: "learning-commons-kg"
      }]
    })

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    // Parse JSON from response
    const jsonStr = textContent.text.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(jsonStr)

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format')
    }

    // Add metadata
    const enrichedQuestions = questions.map((q, i) => ({
      ...q,
      preview_id: crypto.randomUUID(),
      generated_at: new Date().toISOString(),
      source: 'learning-commons-kg',
      index: i + 1
    }))

    return new Response(
      JSON.stringify({
        questions: enrichedQuestions,
        metadata: {
          state,
          grade,
          subject: subject || 'math',
          count: enrichedQuestions.length,
          generated_at: new Date().toISOString()
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Preview generation error:', error)
    return new Response(
      JSON.stringify({
        error: "Failed to generate preview questions",
        details: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

**React Native Component:**

```typescript
// components/QuestionPreview.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

interface PreviewQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  correct_index: number;
  standard_code: string;
  standard_description: string;
  learning_component: string;
  difficulty: string;
  explanation: string;
  prerequisite_standards: string[];
}

interface QuestionPreviewProps {
  childId?: string;
  grade: number;
  state: string;
}

export function QuestionPreview({ childId, grade, state }: QuestionPreviewProps) {
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('math');
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('preview-questions', {
        body: { state, grade, subject, count: 5 }
      });

      if (error) throw error;
      
      setQuestions(data.questions);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [grade, state, subject]);

  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading questions from Learning Commons...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchQuestions} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Subject Selector */}
      <View style={styles.subjectRow}>
        {['math', 'ela', 'science'].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setSubject(s)}
            style={[styles.subjectPill, subject === s && styles.subjectPillActive]}
          >
            <Text style={[styles.subjectText, subject === s && styles.subjectTextActive]}>
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <Text style={styles.questionText}>
          {currentQuestion?.question_text}
        </Text>

        {/* Answer Options */}
        <View style={styles.optionsGrid}>
          {currentQuestion?.options.map((option, idx) => (
            <View
              key={idx}
              style={[
                styles.optionButton,
                showAnswer && idx === currentQuestion.correct_index && styles.correctOption
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
            </View>
          ))}
        </View>

        {/* Show/Hide Answer */}
        <TouchableOpacity
          onPress={() => setShowAnswer(!showAnswer)}
          style={styles.showAnswerButton}
        >
          <Text style={styles.showAnswerText}>
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Text>
        </TouchableOpacity>

        {showAnswer && (
          <View style={styles.answerSection}>
            <Text style={styles.correctAnswerText}>
              ✓ Correct: {currentQuestion?.options[currentQuestion.correct_index]}
            </Text>
            <Text style={styles.explanationText}>
              {currentQuestion?.explanation}
            </Text>
          </View>
        )}
      </View>

      {/* Standard Info */}
      <View style={styles.standardCard}>
        <Text style={styles.standardLabel}>📚 State Standard</Text>
        <Text style={styles.standardCode}>{currentQuestion?.standard_code}</Text>
        <Text style={styles.standardDescription}>
          {currentQuestion?.standard_description}
        </Text>
        {currentQuestion?.prerequisite_standards?.length > 0 && (
          <Text style={styles.prerequisiteText}>
            Prerequisites: {currentQuestion.prerequisite_standards.join(', ')}
          </Text>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => {
            setCurrentIndex(Math.max(0, currentIndex - 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === 0}
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchQuestions} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄 New Questions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === questions.length - 1}
          style={[styles.navButton, currentIndex === questions.length - 1 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

**Testing Checklist:**
- [ ] Questions load for all supported grades (2-5)
- [ ] Florida B.E.S.T. standards appear correctly
- [ ] Standard codes are valid and verifiable
- [ ] Questions are age-appropriate
- [ ] Math word problems are clear
- [ ] Answer options make sense
- [ ] Explanations help parents understand
- [ ] Prerequisite standards are accurate
- [ ] Refresh generates different questions
- [ ] Error handling works when MCP is unavailable

---

## Feature Priority Matrix

| Feature | User Value | Dev Effort | Priority | Phase |
|---------|------------|------------|----------|-------|
| Multiple Choice on Watch | Critical | Low | P0 | 2A |
| Parent Onboarding | High | Medium | P0 | 2A |
| **Parent Preview Mode** | **Critical** | **Medium** | **P0** | **2A** |
| KYC Upload | Medium | Low | P0 | 2A |
| Child Profile Screen | High | Low | P1 | 2A |
| Navigation + Analytics | High | Medium | P1 | 2A |
| Light/Dark Theme | Medium | Low | P1 | 2A |
| Behavioral Validation | High | High | P1 | 2B |
| Family Calendar | Medium | High | P1 | 2B |
| Avatar Customization | High | Medium | P1 | 2C |
| Visual Pairing (2x2) | Low | Medium | P2 | 2C |
| NFC Preparation | Medium | High | P2 | 2D |
| **Referral System** | **High** | **Medium** | **P1** | **2E** |
| **Referral Analytics** | **Medium** | **Low** | **P1** | **2E** |
| **QR Code Sharing** | **Low** | **Low** | **P2** | **2E** |
| **Referral Leaderboard** | **Low** | **Medium** | **P3** | **Future** |

**Note:** Preview Mode is P0 because it validates Learning Commons MCP integration is working correctly. If preview questions don't load with proper Florida B.E.S.T. standards, the entire educational value proposition fails.

**Note:** Referral System is P1 because viral growth is essential for consumer app success. Getting this right early compounds over time.

---

## Coding Assistant Prompts

### Prompt 1: Parent Onboarding Flow

```markdown
# Task: Implement Parent Onboarding Flow

## Context
The 6-7 Game parent app (React Native Expo) needs a complete onboarding flow for new users. Currently, users land directly on the Family Dashboard after signup. We need to intercept first-time users and guide them through profile creation.

## Current State
- Supabase Auth is working (email/password)
- Basic navigation exists
- Family Dashboard is the current home screen

## Requirements

### Database Migrations
Run these SQL migrations in Supabase:

```sql
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN state VARCHAR(2);
ALTER TABLE users ADD COLUMN zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN kyc_front_url TEXT;
ALTER TABLE users ADD COLUMN kyc_back_url TEXT;
ALTER TABLE users ADD COLUMN kyc_submitted_at TIMESTAMPTZ;

ALTER TABLE families ADD COLUMN adults_count INTEGER DEFAULT 1;
ALTER TABLE children ADD COLUMN birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12);
ALTER TABLE children ADD COLUMN birth_year INTEGER CHECK (birth_year BETWEEN 2005 AND 2023);
```

### Screens to Create

1. **OnboardingWelcome.tsx**
   - Full-screen with app logo
   - "Get Started" button
   - Skip for existing users (check `onboarding_completed`)

2. **OnboardingProfile.tsx**
   - Form: First name, last name, date of birth (date picker)
   - State dropdown (all 50 US states)
   - ZIP code input (5-digit validation)
   - "Next" button

3. **OnboardingKYC.tsx**
   - Explanation text: "Verify your identity to enable rewards"
   - "Scan Front of ID" button → camera
   - "Scan Back of ID" button → camera
   - Upload to Supabase Storage bucket `kyc-documents`
   - "Skip for now" option

4. **OnboardingFamily.tsx**
   - Family name input (default: last name + " Family")
   - Number of adults slider (1-4)
   - Number of children slider (1-6)
   - "Next" button

5. **OnboardingChildren.tsx**
   - For each child (based on count):
     - First name
     - Birth month (picker: January-December)
     - Birth year (picker: 2010-2022)
     - Grade (auto-calculate or manual override)
   - "Add Children" button → creates all children in DB

6. **OnboardingComplete.tsx**
   - Confetti animation
   - "Welcome to the 6-7 Game!"
   - "Go to Dashboard" button
   - Set `onboarding_completed = true`

### Navigation Logic
In `app/_layout.tsx` or root navigator:
```typescript
// After auth check
if (user && !user.onboarding_completed) {
  return <OnboardingStack />;
}
return <MainTabNavigator />;
```

### Tech Notes
- Use `expo-camera` for ID scanning
- Use `@supabase/storage-js` for file uploads
- State picker should use `@react-native-picker/picker`
- Follow iOS Human Interface Guidelines
- Support dark mode via `useColorScheme()`

### Deliverables
1. Create all 6 onboarding screens
2. Add database migrations
3. Implement navigation gating
4. Test flow end-to-end
5. Create `vikas_actions.md` with:
   - Supabase Storage bucket creation instructions
   - Any manual steps needed
```

---

### Prompt 2: Navigation Bar & Analytics Dashboard

```markdown
# Task: Add Navigation Bar and Analytics Dashboard

## Context
The 6-7 Game parent app needs proper navigation and an analytics-rich home screen. Currently it's a single screen with child list.

## Requirements

### Bottom Tab Navigation
Create 4 tabs using `@react-navigation/bottom-tabs`:

| Tab | Icon (SF Symbol) | Screen |
|-----|------------------|--------|
| Home | house.fill | FamilyDashboard |
| Calendar | calendar | FamilyCalendar |
| Battles | gamecontroller.fill | BattleHub |
| Settings | gearshape.fill | Settings |

### Family Dashboard Redesign

**Layout:**
```
┌─────────────────────────────────────┐
│ 👨‍👩‍👧‍👦 The Smith Family           ⚙️ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  🪙 Total Mollars: 1,247        │ │
│ │  📊 +156 this week              │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ This Week                           │
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │ ⚔️ 12 │ │ ✅ 8  │ │ 🔥 5  │      │
│ │Battles│ │ Wins  │ │Streak │      │
│ └───────┘ └───────┘ └───────┘      │
├─────────────────────────────────────┤
│ Children                            │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] James         750 🪙   │ │
│ │ 🟢 Connected  |  Grade 5        │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] Jack          497 🪙   │ │
│ │ 🟢 Connected  |  Grade 4        │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Quick Actions                       │
│ [+ Add Child] [⚔️ Start Battle]    │
└─────────────────────────────────────┘
```

### Color Theme Support
```typescript
// lib/theme.ts
export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  mollars: '#FFD700'
};

export const darkTheme = {
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  primary: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
  mollars: '#FFD700'
};
```

Use `useColorScheme()` from React Native to detect system preference.

### Safe Areas
Wrap all screens in `<SafeAreaView>` and use `useSafeAreaInsets()` for custom padding.

### Deliverables
1. Implement bottom tab navigator
2. Redesign FamilyDashboard with analytics
3. Create theme system with light/dark support
4. Ensure safe area compliance
5. Add pull-to-refresh for data reload
```

---

### Prompt 3: Child Profile Detail Screen

```markdown
# Task: Create Child Profile Detail Screen

## Context
When a parent taps a child card on the dashboard, they should see a detailed profile screen with stats, settings, and management options.

## Requirements

### Screen: ChildProfile.tsx

**Route:** `/child/[id]` or navigation param

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Back                        Edit  │
├─────────────────────────────────────┤
│         ┌───────────────┐           │
│         │   [Avatar]    │           │
│         │   16x16 pixel │           │
│         └───────────────┘           │
│            James                    │
│     Grade 5  •  Connected           │
├─────────────────────────────────────┤
│ Mollars                             │
│ ┌─────────────────────────────────┐ │
│ │  🪙 750                         │ │
│ │  +47 today  •  View History →   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Statistics                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Battles │ │  Wins   │ │ Streak  ││
│ │   42    │ │   31    │ │  5 🔥   ││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │Practice │ │Correct %│ │Mastered ││
│ │   127   │ │   78%   │ │ 12 stds ││
│ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────┤
│ Standards Progress                  │
│ [============------] 68%           │
│ 12 of 18 grade-level standards     │
│ View Details →                      │
├─────────────────────────────────────┤
│ Recent Activity                     │
│ • Won battle vs Dad (+15 🪙) - 2h   │
│ • Practice: 8/10 correct - 5h       │
│ • Lost battle vs Jack (-5 🪙) - 1d  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     🔌 Disconnect Watch         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Edit Mode
Tap "Edit" to modify:
- First name
- Birth month/year
- Grade (with auto-calculation option)

### Queries Needed
```typescript
// Get child with stats
const { data: child } = await supabase
  .from('children')
  .select(`
    *,
    battles:battles(count),
    battles_won:battles(count).filter(winner_id.eq.child_id),
    question_history(count, is_correct),
    learning_progress(*)
  `)
  .eq('id', childId)
  .single();
```

### Deliverables
1. Create ChildProfile screen
2. Implement edit mode
3. Add Mollar transaction history modal
4. Create "Disconnect Watch" flow (clears pairing, resets code)
5. Add navigation from dashboard child cards
```

---

### Prompt 4: Watch Multiple Choice UI

```markdown
# Task: Replace Keyboard Input with Multiple Choice on Watch

## Context
The Apple Watch app currently uses keyboard input for quiz answers. This is slow and frustrating for kids. ALL quiz interactions must use multiple choice buttons.

## Current State
- Practice mode exists
- Battle mode exists
- Questions are fetched from Supabase Edge Function

## Requirements

### Question Response Format
Ensure Edge Function returns:
```json
{
  "question_text": "What is 7 × 8?",
  "options": ["48", "54", "56", "64"],
  "correct_answer": "C",
  "correct_index": 2
}
```

### Quiz UI Layout (QuizView.swift)
```swift
struct QuizView: View {
    let question: Question
    @State private var selectedAnswer: Int? = nil
    @State private var isAnswered = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // Question text
                Text(question.text)
                    .font(.headline)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                // Timer
                TimerView(seconds: 30)
                
                // 2x2 Answer grid
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 8) {
                    ForEach(0..<4) { index in
                        AnswerButton(
                            text: question.options[index],
                            index: index,
                            isSelected: selectedAnswer == index,
                            isCorrect: isAnswered ? index == question.correctIndex : nil
                        ) {
                            selectAnswer(index)
                        }
                    }
                }
                .padding(.horizontal, 4)
            }
        }
    }
    
    func selectAnswer(_ index: Int) {
        guard !isAnswered else { return }
        selectedAnswer = index
        isAnswered = true
        
        // Haptic feedback
        WKInterfaceDevice.current().play(
            index == question.correctIndex ? .success : .failure
        )
        
        // Submit answer
        Task {
            await submitAnswer(index)
        }
    }
}

struct AnswerButton: View {
    let text: String
    let index: Int
    let isSelected: Bool
    let isCorrect: Bool?
    let action: () -> Void
    
    var backgroundColor: Color {
        if let correct = isCorrect {
            if isSelected {
                return correct ? .green : .red
            } else if correct {
                return .green.opacity(0.5)
            }
        }
        return isSelected ? .blue : Color(.darkGray)
    }
    
    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 16, weight: .semibold))
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(backgroundColor)
                .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}
```

### Result Animation
After answer:
1. Correct: Green flash + confetti + "+10 🪙" overlay
2. Wrong: Red flash + show correct answer highlighted green
3. Auto-advance to next question after 2 seconds

### Deliverables
1. Replace all keyboard inputs with multiple choice
2. Implement 2x2 grid layout for answers
3. Add visual feedback (colors, haptics)
4. Add result animations
5. Ensure accessibility (large tap targets, clear contrast)
```

---

### Prompt 5: Behavioral Validation System

```markdown
# Task: Implement Behavioral Validation Battles

## Context
Parents can validate real-world tasks and behaviors, turning accountability into a game. Kids request credit for completed tasks, parents approve/deny via push notification.

## Requirements

### Database Migrations
```sql
-- Validation categories
CREATE TABLE validation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO validation_categories (family_id, name, icon, is_default, sort_order) VALUES
(NULL, 'Chores', 'house.fill', true, 1),
(NULL, 'Tasks', 'checklist', true, 2),
(NULL, 'Behavior', 'star.fill', true, 3),
(NULL, 'Prep', 'backpack.fill', true, 4),
(NULL, 'Bring Back', 'arrow.uturn.backward', true, 5);

-- Validation tasks
CREATE TABLE validation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES validation_categories(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  mollars_reward INTEGER DEFAULT 10,
  game_time_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation requests
CREATE TABLE validation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES validation_tasks(id),
  child_id UUID REFERENCES children(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, denied
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  parent_note TEXT,
  mollars_awarded INTEGER DEFAULT 0
);
```

### Parent App Features

**1. Task Management Screen**
- View/edit categories
- Add custom categories
- Add tasks to each category
- Set Mollar reward per task
- Optional: game time reward

**2. Validation Inbox**
- List of pending requests
- Swipe right to approve
- Swipe left to deny
- Tap for details + optional note

**3. Push Notification**
```
🔔 James requests credit
"Practiced violin for 30 min"
[Approve] [Deny]
```

### Watch App Features

**1. Request Credit Flow**
Main menu → "Request Credit" → Category list → Task list → Confirm

**UI:**
```
┌─────────────────────┐
│   Request Credit    │
├─────────────────────┤
│ 🏠 Chores          │
│ 📋 Tasks           │
│ ⭐ Behavior        │
│ 🎒 Prep            │
│ 📦 Bring Back      │
└─────────────────────┘
```

After selection:
```
┌─────────────────────┐
│  Practiced Violin   │
│      🎻            │
│                     │
│  Reward: 10 🪙     │
│                     │
│  [Request Credit]   │
│                     │
│  Waiting for        │
│  parent approval... │
└─────────────────────┘
```

**2. Real-time Status**
Watch shows "Pending..." → "Approved! +10 🪙" or "Denied"

### Edge Function: request-validation
```typescript
// supabase/functions/request-validation/index.ts
serve(async (req) => {
  const { task_id, child_id } = await req.json();
  
  // Create request
  const { data: request } = await supabase
    .from('validation_requests')
    .insert({ task_id, child_id })
    .select()
    .single();
  
  // Get task details
  const { data: task } = await supabase
    .from('validation_tasks')
    .select('name, mollars_reward, family_id')
    .eq('id', task_id)
    .single();
  
  // Get child name
  const { data: child } = await supabase
    .from('children')
    .select('first_name')
    .eq('id', child_id)
    .single();
  
  // Get parent device tokens
  const { data: parents } = await supabase
    .from('users')
    .select('device_token')
    .eq('family_id', task.family_id);
  
  // Send push notifications
  await sendPushNotification(parents, {
    title: `${child.first_name} requests credit`,
    body: task.name,
    data: { request_id: request.id }
  });
  
  return new Response(JSON.stringify({ request }));
});
```

### Deliverables
1. Create database schema
2. Build Task Management UI in parent app
3. Build Validation Inbox in parent app
4. Implement Watch "Request Credit" flow
5. Create Edge Function with push notifications
6. Add real-time status updates via Supabase Realtime
```

---

### Prompt 6: Avatar Customization (Watch)

```markdown
# Task: Implement Avatar Customization on Watch

## Context
When a child first connects their watch, they should create and customize a pixelated avatar. This avatar represents them throughout the app.

## Requirements

### First-Time Flow
After successful pairing, if `children.avatar_config` is empty:
1. Show "Create Your Player" screen
2. Base selection (boy/girl) via horizontal swipe
3. Customization screens for each attribute
4. Save to database
5. Proceed to main menu

### Avatar Config Schema
```swift
struct AvatarConfig: Codable {
    var base: String // "boy" or "girl"
    var hairStyle: Int // 1-6
    var skinTone: Int // 1-6
    var topColor: String // hex color
    var bottomColor: String // hex color
    var evolutionStage: Int // 1-6 (increases with XP)
}
```

### Customization UI

**Screen 1: Base Selection**
```
┌─────────────────────┐
│  Create Your Player │
├─────────────────────┤
│                     │
│   ← [👦] [👧] →     │
│                     │
│   Swipe to choose   │
│                     │
│     [Next →]        │
└─────────────────────┘
```

**Screen 2-5: Attribute Selection**
```
┌─────────────────────┐
│     Hair Style      │
├─────────────────────┤
│                     │
│   ← [Preview] →     │
│                     │
│      3 of 6         │
│                     │
│  [Back]   [Next]    │
└─────────────────────┘
```

Repeat for:
- Skin Tone (6 options)
- Top Color (8 preset colors)
- Bottom Color (8 preset colors)

**Screen 6: Preview & Save**
```
┌─────────────────────┐
│    Looking Good!    │
├─────────────────────┤
│                     │
│   [Final Avatar]    │
│                     │
│   Tap to edit       │
│                     │
│     [Let's Go!]     │
└─────────────────────┘
```

### Asset Requirements
Create 16x16 pixel sprites:
- 2 base characters (boy/girl)
- 6 hair variations each
- 6 skin tone variations
- Clothing overlay system (separate top/bottom)

**Note:** For MVP, can use simple colored shapes. Full pixel art comes later.

### SwiftUI Implementation
```swift
struct AvatarCreationView: View {
    @State private var config = AvatarConfig()
    @State private var step = 0
    
    var body: some View {
        TabView(selection: $step) {
            BaseSelectionView(config: $config)
                .tag(0)
            HairSelectionView(config: $config)
                .tag(1)
            SkinSelectionView(config: $config)
                .tag(2)
            TopColorView(config: $config)
                .tag(3)
            BottomColorView(config: $config)
                .tag(4)
            PreviewView(config: config, onComplete: saveAvatar)
                .tag(5)
        }
        .tabViewStyle(.page)
    }
    
    func saveAvatar() {
        Task {
            try await APIService.shared.updateAvatar(config)
        }
    }
}
```

### Database Update
```sql
-- Update child's avatar
UPDATE children
SET avatar_config = $1
WHERE id = $2;
```

### Deliverables
1. Create AvatarConfig model
2. Build 6-step customization flow
3. Create placeholder avatar sprites (colored shapes OK for MVP)
4. Implement swipe gestures for selection
5. Save config to Supabase
6. Display avatar on main menu and dashboard
```

---

### Prompt 8: Parent Preview Mode (Learning Commons Validation)

```markdown
# Task: Implement Parent Quiz Preview Mode

## Context
Parents need to preview what questions their children will receive. This feature is CRITICAL for:
1. Building parent trust in the platform
2. Validating that Learning Commons MCP integration is working
3. Showing real Florida B.E.S.T. standards alignment

## Requirements

### Edge Function: preview-questions

Create in `supabase/functions/preview-questions/index.ts`

This function MUST:
1. Accept: state, grade, subject, count, difficulty
2. Call Anthropic API with Learning Commons MCP
3. Return questions with full standard metadata
4. Handle errors gracefully

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "npm:@anthropic-ai/sdk"

const anthropic = new Anthropic()

serve(async (req) => {
  const { state, grade, subject, count = 5, difficulty } = await req.json()
  
  if (!state || !grade) {
    return new Response(
      JSON.stringify({ error: "state and grade are required" }),
      { status: 400 }
    )
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: `Generate ${count} multiple choice quiz questions for grade ${grade} in ${state}.
      
Subject: ${subject || 'math'}
Difficulty: ${difficulty || 'mixed'}

Use the Learning Commons Knowledge Graph to get accurate ${state} state standards.
For Florida, use FL B.E.S.T. Standards.

Return JSON array:
[{
  "question_text": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A",
  "correct_index": 0,
  "standard_code": "MA.5.NSO.2.2",
  "standard_description": "Full standard text",
  "learning_component": "Specific skill",
  "difficulty": "easy|medium|hard",
  "explanation": "Why correct",
  "prerequisite_standards": ["MA.4.NSO.2.1"]
}]

Return ONLY valid JSON.`
    }],
    mcp_servers: [{
      type: "url",
      url: "https://kg.mcp.learningcommons.org/mcp",
      name: "learning-commons-kg"
    }]
  })

  const text = response.content.find(c => c.type === 'text')?.text || ''
  const questions = JSON.parse(text.replace(/```json|```/g, '').trim())

  return new Response(JSON.stringify({
    questions,
    metadata: { state, grade, subject, generated_at: new Date().toISOString() }
  }))
})
```

### Database Migrations

```sql
-- Track preview sessions
CREATE TABLE preview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  grade INTEGER,
  state VARCHAR(2),
  subject VARCHAR(20),
  questions_previewed JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent feedback on questions
CREATE TABLE question_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_hash VARCHAR(64),
  standard_code VARCHAR(20),
  feedback_type VARCHAR(20), -- inappropriate, too_hard, too_easy, incorrect, great
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Parent App Screen: QuestionPreview.tsx

**Route:** `/preview` or `/child/[id]/preview`

**Features:**
1. Subject selector (Math, ELA, Science tabs)
2. Question card with swipe navigation
3. Show/Hide answer toggle
4. Standard code and full description
5. Prerequisite standards list
6. "Refresh" for new questions
7. "Report Issue" button for feedback

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Preview Questions                 │
├─────────────────────────────────────┤
│ [Math] [ELA] [Science]              │
├─────────────────────────────────────┤
│ Grade 5 • Florida                   │
├─────────────────────────────────────┤
│ Question 1 of 5                     │
│ ┌─────────────────────────────────┐ │
│ │ Sarah has 3 boxes of crayons.   │ │
│ │ Each box has 24 crayons. How    │ │
│ │ many crayons in all?            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │   72 ✓  │ │   27    │            │
│ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐            │
│ │   21    │ │   96    │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ [Show Answer]                       │
├─────────────────────────────────────┤
│ 📚 MA.5.NSO.2.2                    │
│ "Multiply multi-digit whole        │
│ numbers with procedural fluency."  │
│                                     │
│ Prerequisites: MA.4.NSO.2.1        │
├─────────────────────────────────────┤
│ [←] [🔄 Refresh] [→]               │
│                                     │
│ [⚠️ Report Issue]                   │
└─────────────────────────────────────┘
```

### Access Points

Add "Preview Questions" button to:
1. Child Profile screen (under Standards Progress)
2. Battle setup modal (link text)
3. Settings > "Preview Questions"

### Testing Requirements

**CRITICAL:** This feature validates Learning Commons integration works.

Test checklist:
- [ ] Edge function deploys without errors
- [ ] Questions load for grades 2, 3, 4, 5
- [ ] Math questions have valid FL B.E.S.T. standard codes
- [ ] Standard codes can be verified on Florida DOE website
- [ ] Questions are age-appropriate (no adult themes)
- [ ] Word problems make sense
- [ ] All 4 answer options are plausible
- [ ] Correct answer is actually correct
- [ ] Explanations help parents understand
- [ ] Refresh generates different questions
- [ ] Error state shows if MCP unavailable
- [ ] Feedback submission works

### Deliverables

1. Create Edge Function `preview-questions`
2. Create database tables for tracking
3. Build QuestionPreview screen
4. Add access points (child profile, settings, battle setup)
5. Implement feedback submission
6. Test with real Florida standards
7. Document any Learning Commons MCP issues in vikas_actions.md
```

---

### Prompt 10: Referral System & Viral Growth Engine

```markdown
# Task: Implement Referral System for Viral Family Growth

## Context
The 6-7 Game needs a referral system to enable viral family-to-family growth. Parents share referral codes with other parents, and when referred families sign up and become active, both families' children earn bonus Mollars.

## Key Principles
1. **Analytics First**: Track every referral event (clicks, signups, conversions)
2. **Family Rewards**: Children earn Mollars, not parents
3. **Simple Sharing**: One-tap share with pre-written message
4. **Fraud Prevention**: No self-referrals, rate limiting

## Requirements

### Database Migrations

```sql
-- 006_referral_system.sql

-- Add referral fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(12);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES users(id);

-- Referral events tracking
CREATE TABLE referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code VARCHAR(12) NOT NULL,
  referrer_user_id UUID REFERENCES users(id),
  event_type VARCHAR(20) NOT NULL, -- click, signup, onboarding_complete, first_battle, conversion
  source VARCHAR(20) DEFAULT 'direct', -- direct, social, email, sms, qr
  referred_email TEXT,
  referred_user_id UUID REFERENCES users(id),
  referred_family_id UUID REFERENCES families(id),
  ip_address INET,
  user_agent TEXT,
  utm_source VARCHAR(50),
  utm_medium VARCHAR(50),
  utm_campaign VARCHAR(50),
  utm_content VARCHAR(100),
  referring_url TEXT,
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ,
  first_battle_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  reward_granted BOOLEAN DEFAULT false,
  reward_amount INTEGER DEFAULT 0,
  reward_granted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_events_code ON referral_events(referral_code);
CREATE INDEX idx_referral_events_referrer ON referral_events(referrer_user_id);
CREATE INDEX idx_referral_events_type ON referral_events(event_type);

-- Referral rewards config
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  trigger_event VARCHAR(20) NOT NULL,
  referrer_mollars INTEGER DEFAULT 0,
  referred_mollars INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed rewards
INSERT INTO referral_rewards (name, trigger_event, referrer_mollars, referred_mollars) VALUES
('Signup Bonus', 'signup', 10, 25),
('Onboarding Complete', 'onboarding_complete', 15, 0),
('First Battle', 'first_battle', 25, 10),
('Week Active', 'conversion', 50, 25);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '67-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    IF i = 5 THEN
      code := code || '-';
    END IF;
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();
```

### Edge Functions

**1. track-referral-click (Public)**
```typescript
// supabase/functions/track-referral-click/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const {
    code,
    source = 'direct',
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    referring_url
  } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Validate code exists
  const { data: referrer } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', code)
    .single()

  if (!referrer) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Invalid referral code' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Track click
  const { data: event, error } = await supabase
    .from('referral_events')
    .insert({
      referral_code: code,
      referrer_user_id: referrer.id,
      event_type: 'click',
      source,
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0],
      user_agent: req.headers.get('user-agent'),
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      referring_url,
      clicked_at: new Date().toISOString()
    })
    .select('id')
    .single()

  return new Response(
    JSON.stringify({ valid: true, event_id: event?.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
```

**2. process-referral-signup (Internal)**
```typescript
// supabase/functions/process-referral-signup/index.ts
serve(async (req) => {
  const { referral_code, new_user_id, new_user_email, event_id } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get referrer
  const { data: referrer } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', referral_code)
    .single()

  if (!referrer || referrer.id === new_user_id) {
    return new Response(JSON.stringify({ success: false }))
  }

  // Update or create event
  const eventData = {
    event_type: 'signup',
    referred_user_id: new_user_id,
    referred_email: new_user_email,
    signed_up_at: new Date().toISOString()
  }

  if (event_id) {
    await supabase.from('referral_events').update(eventData).eq('id', event_id)
  } else {
    await supabase.from('referral_events').insert({
      ...eventData,
      referral_code,
      referrer_user_id: referrer.id
    })
  }

  // Link referral to new user
  await supabase.from('users').update({
    referred_by_code: referral_code,
    referred_by_user_id: referrer.id
  }).eq('id', new_user_id)

  // Grant signup rewards
  await grantReferralReward(supabase, 'signup', referrer.id, new_user_id)

  return new Response(JSON.stringify({ success: true }))
})
```

**3. get-referral-stats (Authenticated)**
```typescript
// supabase/functions/get-referral-stats/index.ts
serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Get user profile with referral code
  const { data: profile } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  // Aggregate stats
  const { data: events } = await supabase
    .from('referral_events')
    .select('*')
    .eq('referrer_user_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    referral_code: profile?.referral_code,
    share_url: `https://the67game.com/join?ref=${profile?.referral_code}`,
    total_clicks: events?.filter(e => e.event_type === 'click').length || 0,
    total_signups: events?.filter(e => ['signup', 'onboarding_complete', 'first_battle', 'conversion'].includes(e.event_type)).length || 0,
    total_conversions: events?.filter(e => e.event_type === 'conversion').length || 0,
    total_mollars_earned: events?.reduce((sum, e) => sum + (e.reward_amount || 0), 0) || 0,
    recent_events: events?.slice(0, 10).map(e => ({
      event_type: e.event_type,
      created_at: e.created_at,
      reward_amount: e.reward_amount
    })) || []
  }

  return new Response(JSON.stringify(stats))
})
```

### Parent App Components

**1. ReferralScreen.tsx**
```typescript
// app/(tabs)/referrals.tsx
import { useState, useEffect } from 'react';
import { View, Text, Share, TouchableOpacity, FlatList } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';

export default function ReferralsScreen() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.functions.invoke('get-referral-stats');
    setStats(data);
    setLoading(false);
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(stats?.referral_code || '');
    // Show toast
  };

  const shareLink = async () => {
    await Share.share({
      message: `My kids love The 6-7 Game! Join us and your kids earn Mollars for learning math. ${stats?.share_url}`,
      title: 'Join The 6-7 Game'
    });
    
    // Track share event
    await supabase.functions.invoke('track-share', {
      body: { method: 'native_share' }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Referral Code Card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{stats?.referral_code}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={copyCode} style={styles.button}>
            <Text>📋 Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareLink} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard label="Clicks" value={stats?.total_clicks} />
        <StatCard label="Signups" value={stats?.total_signups} />
        <StatCard label="Active" value={stats?.total_conversions} />
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Mollars Earned from Referrals</Text>
        <Text style={styles.earningsValue}>🪙 {stats?.total_mollars_earned}</Text>
      </View>

      {/* How It Works */}
      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Step number={1} text="Share your code with friends" />
        <Step number={2} text="They sign up & add their kids" />
        <Step number={3} text="Their kid plays their first battle" />
        <Step number={4} text="Your kids earn 50 Mollars each!" />
      </View>

      {/* Recent Referrals */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <FlatList
        data={stats?.recent_events}
        renderItem={({ item }) => <ReferralEventItem event={item} />}
        keyExtractor={(item, i) => i.toString()}
      />
    </ScrollView>
  );
}
```

**2. Update Signup Flow**
```typescript
// In your signup/registration logic
const handleSignup = async (email: string, password: string) => {
  // Check for referral code in URL params or stored session
  const referralCode = getReferralCodeFromSession();
  const eventId = getReferralEventIdFromSession();

  // Create user
  const { data: authData } = await supabase.auth.signUp({ email, password });

  if (authData.user && referralCode) {
    // Process referral
    await supabase.functions.invoke('process-referral-signup', {
      body: {
        referral_code: referralCode,
        new_user_id: authData.user.id,
        new_user_email: email,
        event_id: eventId
      }
    });
  }
};
```

**3. Landing Page Integration**
```typescript
// On landing page load
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref');
  
  if (refCode) {
    // Store for later use in signup
    sessionStorage.setItem('referral_code', refCode);
    
    // Track click
    fetch('/api/track-referral-click', {
      method: 'POST',
      body: JSON.stringify({
        code: refCode,
        source: 'web',
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        referring_url: document.referrer
      })
    }).then(res => res.json()).then(data => {
      if (data.event_id) {
        sessionStorage.setItem('referral_event_id', data.event_id);
      }
    });
  }
}, []);
```

### Conversion Tracking

**Track First Battle (in battle completion logic):**
```typescript
// When battle completes, check for referral conversion
const trackFirstBattleConversion = async (childId: string, battleId: string) => {
  // Get child's family and user
  const { data: child } = await supabase
    .from('children')
    .select('family_id, families(created_by)')
    .eq('id', childId)
    .single();

  const userId = child?.families?.created_by;

  // Check if this user was referred
  const { data: user } = await supabase
    .from('users')
    .select('referred_by_user_id, referred_by_code')
    .eq('id', userId)
    .single();

  if (!user?.referred_by_code) return;

  // Check if this is their first battle
  const { count } = await supabase
    .from('question_history')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('context', 'battle');

  if (count === 1) {
    // This is the first battle - trigger conversion
    await supabase.functions.invoke('process-referral-conversion', {
      body: {
        referred_user_id: userId,
        trigger: 'first_battle',
        battle_id: battleId
      }
    });
  }
};
```

### Deliverables

1. Create database migration `006_referral_system.sql`
2. Deploy Edge Functions:
   - `track-referral-click`
   - `process-referral-signup`
   - `process-referral-conversion`
   - `get-referral-stats`
3. Add ReferralsScreen to parent app tab navigator
4. Update signup flow to handle referral codes
5. Add referral tracking to landing/marketing pages
6. Implement conversion tracking on first battle
7. Test full funnel: click → signup → onboarding → first battle
8. Add Share functionality with pre-written messages

### Testing Checklist

- [ ] Referral codes auto-generate on user creation
- [ ] Click tracking works from marketing pages
- [ ] Self-referral is prevented
- [ ] Signup properly links referred user to referrer
- [ ] Mollars are granted to referrer's children on signup
- [ ] First battle triggers conversion event
- [ ] Stats endpoint returns accurate data
- [ ] Share functionality works on iOS and Android
- [ ] UTM parameters are captured correctly
- [ ] Rate limiting prevents abuse
```

---

### Prompt 9: Family Calendar

```markdown
# Task: Implement Family Calendar

## Context
Parents need to schedule battles, view family gaming history, and manage activities. The calendar ties together all family gaming events.

## Requirements

### Database Schema
```sql
CREATE TABLE family_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  participants JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_family_events_family ON family_events(family_id);
CREATE INDEX idx_family_events_start ON family_events(start_time);
```

### Event Types
| Type | Description | Icon |
|------|-------------|------|
| scheduled_battle | Pre-scheduled battle | ⚔️ |
| completed_battle | Past battle (auto-created) | ✅ |
| practice_session | Logged practice | 📚 |
| validation_approved | Task completed | ⭐ |
| nfc_prep | Preparation check | 🎒 |
| custom | User-created event | 📅 |

### Calendar Views

**1. Month View**
```
┌─────────────────────────────────────┐
│ ←  December 2025  →                 │
├───┬───┬───┬───┬───┬───┬───┬───────┤
│ S │ M │ T │ W │ T │ F │ S │       │
├───┼───┼───┼───┼───┼───┼───┤       │
│   │ 1 │ 2 │ 3•│ 4 │ 5 │ 6 │       │
│ 7 │ 8•│ 9 │10 │11•│12 │13 │       │
│...                                  │
└─────────────────────────────────────┘
• = has events
```

**2. Day View** (on tap)
```
┌─────────────────────────────────────┐
│ ← December 24, 2025                 │
├─────────────────────────────────────┤
│ 3:00 PM                             │
│ ┌─────────────────────────────────┐ │
│ │ ⚔️ Family Battle                │ │
│ │ James vs Dad                     │ │
│ │ 5 questions • Math              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 5:00 PM                             │
│ ┌─────────────────────────────────┐ │
│ │ ⭐ Practiced Violin             │ │
│ │ James • 15 mollars earned       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [+ Schedule Battle]                 │
└─────────────────────────────────────┘
```

### Create Scheduled Battle
```
┌─────────────────────────────────────┐
│ Schedule Battle                     │
├─────────────────────────────────────┤
│ Challenger                          │
│ [👨 Dad              ▼]             │
│                                     │
│ Opponent                            │
│ [👦 James            ▼]             │
│                                     │
│ Date & Time                         │
│ [Dec 25, 3:00 PM     ▼]             │
│                                     │
│ Questions                           │
│ [● 5  ○ 10  ○ 15]                  │
│                                     │
│ Subject                             │
│ [Math               ▼]              │
│                                     │
│ [Schedule Battle]                   │
└─────────────────────────────────────┘
```

### Push Notification Triggers
- 30 min before scheduled battle: "Battle with James starts in 30 min!"
- At battle time: "Battle time! James is waiting."

### Auto-Created Events
When battles/validations complete, auto-create event entries for history.

### Deliverables
1. Create database schema
2. Build month view calendar component
3. Build day view with event list
4. Implement "Schedule Battle" flow
5. Add push notification reminders
6. Auto-log completed battles as events
```

---

## Implementation Order

```
Week 1: Phase 2A Part 1
├── Database migrations
├── Parent onboarding flow (screens 1-6)
├── KYC upload to Supabase Storage
├── Watch multiple choice UI
└── **Preview Mode Edge Function (validates Learning Commons MCP)**

Week 2: Phase 2A Part 2
├── Navigation bar implementation
├── Analytics dashboard
├── Child profile detail screen
├── **Preview Mode UI in Parent App**
├── Light/dark theme system
└── Safe area compliance

Week 3: Phase 2B Part 1
├── Validation categories database
├── Validation tasks CRUD
├── Parent task management screen
└── Edge function for validation requests

Week 4: Phase 2B Part 2
├── Watch "Request Credit" flow
├── Parent validation inbox
├── Push notifications for validations
├── Real-time status updates
└── Family calendar (basic)

Week 5: Phase 2C
├── Avatar customization (Watch)
├── Avatar display on dashboard
├── Visual pairing (2x2 grid) - optional
└── Polish and bug fixes

Week 6: Phase 2E - Referral System
├── Database migrations (referral_events, referral_rewards)
├── Edge functions (track-click, process-signup, get-stats)
├── Referral Dashboard screen in parent app
├── Share functionality (native share sheet)
├── Signup flow integration (capture referral codes)
└── First battle conversion tracking

Week 7: Phase 2D - NFC (Optional)
├── NFC item tracking database
├── Activity profiles
├── Preparation checklists
└── iPhone NFC scanning integration

Week 8: Testing & Launch
├── Family beta testing (Florida families)
├── Referral system testing (full funnel)
├── TestFlight distribution
├── Bug fixes
└── Performance optimization
```

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion | 90%+ | Analytics |
| Daily active kids | 2+ sessions/day | Supabase |
| Validation requests | 5+/day/child | Supabase |
| Parent engagement | 1+ app open/day | Supabase |
| Kids asking to play | Yes | Observation |
| Avatar creation | 100% of kids | Database |
| **Referral share rate** | **30%+ of parents share** | **Analytics** |
| **Referral click-to-signup** | **15%+ conversion** | **Funnel** |
| **Referral signup-to-active** | **50%+ conversion** | **Funnel** |
| **Viral coefficient** | **>0.5 (target 1.0+)** | **K-factor calc** |

### Viral Growth Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| K-Factor | Avg referrals × conversion rate | >1.0 = viral |
| Share Rate | % of parents who share code | 30%+ |
| Click Rate | Clicks per share | 3+ |
| Signup Conversion | Clicks → Signups | 15%+ |
| Activation | Signups → First Battle | 50%+ |
| Time to Activation | Days from signup to first battle | <3 days |

---

## Files to Create

```
parent-app/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── profile.tsx
│   │   ├── kyc.tsx
│   │   ├── family.tsx
│   │   ├── children.tsx
│   │   └── complete.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx (dashboard)
│   │   ├── calendar.tsx
│   │   ├── battles.tsx
│   │   ├── referrals.tsx          # ← NEW: Referral dashboard
│   │   └── settings.tsx
│   ├── child/
│   │   └── [id].tsx
│   └── preview/
│       └── index.tsx
├── components/
│   ├── ChildCard.tsx
│   ├── MollarDisplay.tsx
│   ├── StatCard.tsx
│   ├── ValidationInbox.tsx
│   ├── QuestionPreview.tsx
│   ├── QuestionCard.tsx
│   ├── StandardInfo.tsx
│   ├── Referral/                   # ← NEW: Referral components
│   │   ├── ReferralCodeCard.tsx
│   │   ├── ReferralStatsGrid.tsx
│   │   ├── ReferralShareModal.tsx
│   │   ├── ReferralEventItem.tsx
│   │   └── HowItWorks.tsx
│   └── Calendar/
│       ├── MonthView.tsx
│       ├── DayView.tsx
│       └── EventCard.tsx
└── lib/
    ├── supabase.ts
    ├── theme.ts
    ├── notifications.ts
    └── referral.ts                 # ← NEW: Referral utilities

watch-app/
├── Views/
│   ├── MainMenuView.swift
│   ├── AvatarCreation/
│   │   ├── AvatarCreationView.swift
│   │   ├── BaseSelectionView.swift
│   │   ├── HairSelectionView.swift
│   │   └── PreviewView.swift
│   ├── Quiz/
│   │   ├── QuizView.swift
│   │   └── AnswerButton.swift
│   ├── Validation/
│   │   ├── RequestCreditView.swift
│   │   ├── CategoryListView.swift
│   │   └── TaskListView.swift
│   └── Referral/                   # ← NEW: QR code sharing (stretch)
│       └── ShareQRView.swift
├── Models/
│   ├── AvatarConfig.swift
│   └── ValidationRequest.swift
└── Services/
    └── APIService.swift

supabase/
├── migrations/
│   ├── 002_user_profile_fields.sql
│   ├── 003_validation_system.sql
│   ├── 004_family_calendar.sql
│   ├── 005_preview_tracking.sql
│   └── 006_referral_system.sql    # ← NEW: Referral tables
└── functions/
    ├── preview-questions/
    │   └── index.ts
    ├── request-validation/
    │   └── index.ts
    ├── schedule-battle/
    │   └── index.ts
    ├── track-referral-click/      # ← NEW: Public click tracking
    │   └── index.ts
    ├── process-referral-signup/   # ← NEW: Signup processing
    │   └── index.ts
    ├── process-referral-conversion/ # ← NEW: Conversion tracking
    │   └── index.ts
    └── get-referral-stats/        # ← NEW: Stats endpoint
        └── index.ts

marketing-web/ (if separate)
├── pages/
│   └── join.tsx                   # ← Landing page with ?ref= handling
└── lib/
    └── referral-tracking.ts       # ← Track clicks, store code
```

---

*Document generated by Claude | December 24, 2025*
