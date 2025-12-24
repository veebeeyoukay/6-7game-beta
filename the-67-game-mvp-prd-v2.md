# The 6-7 Game: MVP Product Requirements Document

**Version:** 2.0  
**Date:** December 23, 2024  
**Author:** Vikas  
**Status:** MVP Definition  

---

## 1. Executive Summary

The 6-7 Game MVP is a family-focused educational gaming platform that transforms learning into competitive play between parents and children. The MVP consists of two applications:

- **Parent App:** A React Native Expo application (iOS/Android) with Supabase backend—providing family management, battle controls, and real-time progress monitoring
- **Child App:** A native Apple Watch application (Swift/SwiftUI) enabling children to earn "Mollars" through educational quizzes and battle family members

**MVP Scope Constraints:**
- Single-family testing (Vikas family only)
- Florida state curriculum only
- Grades 2-5 only
- Minimal security posture (family trust model)
- Maximum AI/AGI utilization via Learning Commons Knowledge Graph MCP

---

## 2. Product Vision

**Problem Statement:** Traditional educational apps feel like work. Children resist engagement, and parents lack visibility into actual learning. Existing solutions don't gamify family dynamics or enable meaningful parent-child competition.

**Solution:** Transform education into a family battle arena where:
- Children earn currency ("Mollars") by correctly answering curriculum-aligned questions
- Parents and siblings become opponents in knowledge battles
- Real-time updates keep the family connected and competitive
- The Apple Watch makes learning accessible anywhere, anytime

**MVP Success Criteria:**
- James (Grade 5) and Jack (Grade 3) voluntarily request to play daily
- Both parents can monitor progress from their phones
- Children complete 10+ quizzes per day without prompting
- Family battles occur at least 3x per week

---

## 3. User Personas

### 3.1 Parent Persona

**Name:** Vikas (Primary) / Spouse (Secondary)  
**Role:** Family Administrator  
**Goals:**
- Easy onboarding and family setup
- Real-time visibility into children's learning
- Ability to challenge children and track battles
- Minimal friction in daily management

**Pain Points:**
- Don't want to nag children about education
- Need learning to fit into family routines
- Want fair competition across different grade levels

### 3.2 Child Persona - Older

**Name:** James  
**Age:** 11 (Grade 5)  
**Device:** Apple Watch  
**Goals:**
- Earn Mollars to accumulate wealth/status
- Beat Dad and younger brother in battles
- Quick, engaging quiz sessions
- See progress and achievements

**Behaviors:**
- Competitive
- Tech-savvy
- Responsive to gamification

### 3.3 Child Persona - Younger

**Name:** Jack  
**Age:** 9 (Grade 3)  
**Device:** Apple Watch  
**Goals:**
- Keep up with older brother
- Earn Mollars
- Fun, accessible questions at his level

**Behaviors:**
- Motivated by sibling competition
- Needs age-appropriate difficulty
- Short attention span for complexity

---

## 4. User Journeys

### 4.1 Parent Onboarding Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PARENT ONBOARDING                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Download App    2. Sign Up        3. Verify Email              │
│     (App Store)       ─ Email           ─ Magic link or            │
│                       ─ Password          6-digit code             │
│                       ─ Confirm PW                                 │
│                                                                     │
│  4. Profile Setup   5. ID Upload      6. Referral Code             │
│     ─ Display name    (Placeholder)     ─ Auto-generated          │
│     ─ Photo (opt)     ─ Driver license   ─ Displayed for          │
│                       ─ Stored only       future sharing          │
│                       ─ No KYC now                                 │
│                                                                     │
│  7. Dashboard Access                                                │
│     ─ Empty state: "Create Your Family"                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Detailed Steps:**

| Step | Screen | Fields/Actions | Validation |
|------|--------|----------------|------------|
| 1 | App Store | Download & Install | — |
| 2 | Sign Up | Email, Password, Confirm Password | Email format, Password 8+ chars, Passwords match |
| 3 | Email Verification | 6-digit code input | Code expires in 10 min |
| 4 | Profile Setup | Display Name (required), Profile Photo (optional) | Name 2-50 chars |
| 5 | ID Upload | Camera/Gallery picker | File size < 10MB, Image format only |
| 6 | Referral Display | Show auto-generated code | Read-only, Copy button |
| 7 | Dashboard | Empty state with CTA | — |

**Authentication Flows:**

- **Sign Up:** Email + Password → Email verification → Profile setup
- **Sign In:** Email + Password → Dashboard
- **Forgot Password:** Email → Reset link → New password entry
- **Sign Out:** Settings → Confirm → Return to Sign In

### 4.2 Family Creation Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FAMILY CREATION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Create Family     2. Add First Child    3. Add More Children   │
│     ─ Family name        ─ First name only     ─ Repeat step 2     │
│     ─ Auto-generate      ─ State (Florida)     ─ Or skip           │
│       family code        ─ Grade (2-5)                             │
│                          ─ Generate pairing                        │
│                            code (6 chars)                          │
│                                                                     │
│  4. Configure Battles   5. Send Watch Apps                         │
│     ─ Parent↔Child ON     ─ TestFlight links                       │
│     ─ Child↔Child toggle   ─ Via iMessage                          │
│                            ─ Instructions included                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Child Data Model (Minimal):**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| first_name | string | 2-30 chars, required | Display only |
| state | enum | Florida only (MVP) | For curriculum alignment |
| grade | integer | 2, 3, 4, or 5 only | Determines question difficulty |
| pairing_code | string | 6 alphanumeric, unique | Expires after pairing |

### 4.3 Watch App Distribution Journey

**Solution: TestFlight Distribution**

TestFlight is Apple's official beta testing platform. Since you have an Apple Developer account, this is the secure, standard method for family distribution.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WATCH APP DISTRIBUTION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PARENT SIDE:                                                       │
│  1. In Parent App, tap "Send Watch App" for child                  │
│  2. Opens iMessage with pre-filled:                                │
│     ─ TestFlight download link                                     │
│     ─ Child's pairing code                                         │
│     ─ Simple instructions                                          │
│                                                                     │
│  CHILD/WATCH SIDE:                                                  │
│  3. Parent helps child open TestFlight link on paired iPhone       │
│  4. TestFlight installs companion app                              │
│  5. Watch app auto-syncs from iPhone companion                     │
│  6. Child opens watch app, enters pairing code                     │
│  7. Pairing confirmed → Dashboard access                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Why TestFlight:**
- ✅ Secure (requires Apple ID authentication)
- ✅ You already have Apple Developer account
- ✅ Standard iOS/watchOS distribution method
- ✅ Easy updates pushed automatically
- ✅ Works via simple text/email link
- ✅ 90-day builds (plenty for MVP testing)

**Pre-filled iMessage Template:**
```
Hey! Here's your 6-7 Game watch app:

1. Install TestFlight (if needed): https://testflight.apple.com
2. Join our beta: [YOUR_TESTFLIGHT_LINK]
3. Your pairing code: [CHILD_CODE]

Open the watch app and enter your code to start earning Mollars! 🎮
```

### 4.4 Watch Pairing Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WATCH PAIRING                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Child opens watch app                                          │
│     ─ Shows "Enter Your Code" screen                               │
│     ─ 6-character input (alphanumeric)                             │
│     ─ Digital Crown to scroll, tap to select                       │
│                                                                     │
│  2. Code validation                                                 │
│     ─ API call to Supabase                                         │
│     ─ Match code to child record                                   │
│     ─ Mark code as "used" (one-time)                               │
│                                                                     │
│  3. Success                                                        │
│     ─ Brief animation/haptic                                       │
│     ─ "Welcome, [First Name]!"                                     │
│     ─ Transition to main menu                                      │
│                                                                     │
│  4. Parent notification                                            │
│     ─ Push notification: "[Child] connected!"                      │
│     ─ Dashboard updates to show "Active"                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Error States:**
- Invalid code → "Code not found. Check with your parent."
- Expired code → "Code expired. Ask parent for a new one."
- Already used → "Already paired. Ask parent if stuck."
- Network error → "Can't connect. Try again."

### 4.5 Child Watch Experience

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WATCH MAIN MENU                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│           ┌─────────────────────┐                                   │
│           │   THE 6-7 GAME      │                                   │
│           │                     │                                   │
│           │   💰 1,247 Mollars  │  ← Current balance                │
│           │                     │                                   │
│           │  ┌───────────────┐  │                                   │
│           │  │ 📊 Dashboard  │  │  ← Option 1                       │
│           │  └───────────────┘  │                                   │
│           │  ┌───────────────┐  │                                   │
│           │  │ 💵 Earn       │  │  ← Option 2                       │
│           │  └───────────────┘  │                                   │
│           │  ┌───────────────┐  │                                   │
│           │  │ ⚔️ Battle     │  │  ← Option 3                       │
│           │  └───────────────┘  │                                   │
│           │                     │                                   │
│           └─────────────────────┘                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Option 1: Dashboard / Status

Displays:
- Current Mollar balance (large, prominent)
- Today's earnings
- Current streak (days active)
- Rank vs siblings (if applicable)
- Last battle result

#### Option 2: Earn Mollars (Solo Quiz Mode)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EARN MOLLARS FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Tap "Earn Mollars"                                             │
│     ─ Fetch question from Learning Commons KG                      │
│     ─ Based on child's grade + Florida standards                   │
│     ─ Random subject (Math, Science, ELA, Social Studies)          │
│                                                                     │
│  2. Question Display                                                │
│     ─ Question text (brief, watch-optimized)                       │
│     ─ 4 multiple choice options                                    │
│     ─ Scroll with Digital Crown                                    │
│     ─ Tap to select                                                │
│                                                                     │
│  3. Answer Submission                                               │
│     ─ Confirm selection                                            │
│     ─ Send to backend for validation                               │
│                                                                     │
│  4. Result                                                          │
│     ─ Correct: Haptic success + "+10 Mollars!" + animation         │
│     ─ Wrong: Gentle haptic + "Not quite" + Show correct answer     │
│                                                                     │
│  5. Continue or Exit                                                │
│     ─ "Next Question" or "Done"                                    │
│     ─ No forced sessions—child controls pace                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Question Display Optimization (Watch):**
- Max 80 characters for question
- Max 25 characters per answer option
- Larger font, high contrast
- Haptic feedback on all interactions

#### Option 3: Battle Mode

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BATTLE FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Tap "Battle"                                                   │
│     ─ Show available opponents:                                    │
│       • "Dad" (always available if enabled)                        │
│       • "Mom" (always available if enabled)                        │
│       • Siblings (if inter-kid battles enabled)                    │
│                                                                     │
│  2. Select Opponent                                                 │
│     ─ Tap opponent name                                            │
│     ─ "Challenge [Name]?"                                          │
│     ─ Confirm                                                      │
│                                                                     │
│  3. Battle Initiated                                                │
│     ─ Opponent gets push notification                              │
│     ─ 5-question rapid-fire round                                  │
│     ─ Same questions, race for speed + accuracy                    │
│     ─ Questions difficulty: LOWER grade of participants            │
│                                                                     │
│  4. Waiting/Active States                                          │
│     ─ If opponent hasn't started: "Waiting for [Name]..."          │
│     ─ If opponent active: Show live progress                       │
│     ─ If opponent finished: Show their score                       │
│                                                                     │
│  5. Battle Complete                                                 │
│     ─ Winner announced                                             │
│     ─ Mollars awarded:                                             │
│       • Winner: +50 Mollars                                        │
│       • Loser: +10 Mollars (participation)                         │
│       • Tie: +30 each                                              │
│     ─ Stats recorded                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Battle Fairness (Cross-Grade):**
- When James (Grade 5) battles Jack (Grade 3), questions are Grade 3 level
- This creates fair competition while still engaging the older child
- Parent battles use the child's grade level

### 4.6 Parent Dashboard Experience

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PARENT DASHBOARD                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  THE 6-7 GAME                              ⚙️ Settings      │   │
│  │  Smith Family                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  TODAY'S ACTIVITY                                           │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  📊 12 questions answered  |  ⚔️ 2 battles  |  📈 83% avg   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  CHILDREN                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐       │
│  │  👦 James                │  │  👦 Jack                 │       │
│  │  Grade 5 • Florida       │  │  Grade 3 • Florida       │       │
│  │  ━━━━━━━━━━━━━━━━━━━━━━ │  │  ━━━━━━━━━━━━━━━━━━━━━━ │       │
│  │  💰 2,847 Mollars       │  │  💰 1,456 Mollars       │       │
│  │  📊 8 today | 91%       │  │  📊 4 today | 75%       │       │
│  │  🔥 5 day streak        │  │  🔥 3 day streak        │       │
│  │  ━━━━━━━━━━━━━━━━━━━━━━ │  │  ━━━━━━━━━━━━━━━━━━━━━━ │       │
│  │  [⚔️ Challenge] [📊 Details]│ │  [⚔️ Challenge] [📊 Details]│  │
│  └──────────────────────────┘  └──────────────────────────┘       │
│                                                                     │
│  RECENT ACTIVITY (Live Feed)                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🕐 2 min ago   James answered correctly (+10 Mollars)      │   │
│  │  🕐 5 min ago   Jack started a quiz session                 │   │
│  │  🕐 12 min ago  James challenged Dad to battle              │   │
│  │  🕐 15 min ago  Battle complete: James won! (+50)           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           [➕ Add Child]    [⚙️ Battle Settings]             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Parent App Screens:**

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| Dashboard | Overview | Family stats, children cards, live feed |
| Child Detail | Deep dive | Full history, subject breakdown, trends |
| Battle Arena | Parent battles | Challenge child, active battles, history |
| Battle Settings | Configuration | Toggle inter-kid battles |
| Add Child | Onboarding | Name, state, grade, generate code |
| Settings | Account | Profile, sign out, referral code |

---

## 5. Feature Requirements

### 5.1 Parent App (React Native Expo + Supabase)

#### 5.1.1 Authentication Module

| Feature | Priority | Description |
|---------|----------|-------------|
| Email Sign Up | P0 | Email, password, confirm password |
| Email Verification | P0 | 6-digit code, 10-min expiry |
| Sign In | P0 | Email + password |
| Forgot Password | P0 | Email → Reset link → New password |
| Sign Out | P0 | Clear session, return to login |
| Session Persistence | P0 | Stay logged in across app restarts |

**Implementation Notes:**
- Use Supabase Auth with email provider
- Store session tokens securely (Expo SecureStore)
- Handle deep links for password reset

#### 5.1.2 Onboarding Module

| Feature | Priority | Description |
|---------|----------|-------------|
| Profile Setup | P0 | Display name (required), photo (optional) |
| ID Upload | P1 | Camera/gallery, store to Supabase Storage |
| Referral Code Display | P1 | Auto-generated, copyable |
| KYC Integration | P2 (Future) | Placeholder for now |

**ID Upload Notes (MVP):**
- Store image in Supabase Storage bucket
- No verification/OCR—visual placeholder only
- Simple metadata: timestamp, user_id

#### 5.1.3 Family Management Module

| Feature | Priority | Description |
|---------|----------|-------------|
| Create Family | P0 | Family name, generate family_code |
| Add Child | P0 | First name, state, grade, generate pairing_code |
| View Children | P0 | List all children with status |
| Remove Child | P1 | Soft delete with confirmation |
| Edit Child | P1 | Update name, grade |
| Regenerate Pairing Code | P1 | New code if lost/expired |

#### 5.1.4 Dashboard Module

| Feature | Priority | Description |
|---------|----------|-------------|
| Family Overview | P0 | Today's stats aggregate |
| Child Cards | P0 | Per-child summary: Mollars, today's activity, streak |
| Live Activity Feed | P0 | Real-time events via Supabase Realtime |
| Child Detail View | P1 | Historical data, subject breakdown |

**Real-Time Implementation:**
- Supabase Realtime subscriptions on `quiz_attempts` and `battles` tables
- Optimistic UI updates
- Reconnection handling

#### 5.1.5 Battle Module (Parent Side)

| Feature | Priority | Description |
|---------|----------|-------------|
| Challenge Child | P0 | Select child, initiate battle |
| Battle Notifications | P0 | Push when challenged/completed |
| Answer Battle Questions | P0 | 5 questions, timed |
| Battle History | P1 | Past battles with results |
| Toggle Inter-Kid Battles | P0 | Enable/disable sibling battles |

#### 5.1.6 Watch Distribution Module

| Feature | Priority | Description |
|---------|----------|-------------|
| Send Watch App | P0 | Open iMessage with TestFlight link + code |
| View Pairing Status | P0 | Show if child has paired |
| Resend Link | P1 | Regenerate and resend |

### 5.2 Child Watch App (Swift/SwiftUI)

#### 5.2.1 Pairing Module

| Feature | Priority | Description |
|---------|----------|-------------|
| Code Entry | P0 | 6-char alphanumeric input |
| Code Validation | P0 | API call, error handling |
| Pairing Confirmation | P0 | Success animation, transition |

**Watch Input UX:**
- Use WKInterfaceTextField or custom picker
- Digital Crown for navigation
- Large touch targets
- Haptic feedback on selection

#### 5.2.2 Main Menu

| Feature | Priority | Description |
|---------|----------|-------------|
| Dashboard Button | P0 | Navigate to status view |
| Earn Mollars Button | P0 | Navigate to quiz mode |
| Battle Button | P0 | Navigate to battle selection |
| Mollar Balance Display | P0 | Prominent, always visible |

#### 5.2.3 Dashboard/Status View

| Feature | Priority | Description |
|---------|----------|-------------|
| Mollar Balance | P0 | Large display |
| Today's Earnings | P0 | +X Mollars today |
| Streak Counter | P1 | X day streak |
| Sibling Rank | P2 | 1st/2nd place (if applicable) |

#### 5.2.4 Earn Mollars (Quiz Mode)

| Feature | Priority | Description |
|---------|----------|-------------|
| Fetch Question | P0 | From Learning Commons KG via Supabase Edge Function |
| Display Question | P0 | Optimized for watch (brief text) |
| Multiple Choice | P0 | 4 options, scrollable |
| Submit Answer | P0 | Confirm selection |
| Show Result | P0 | Correct/incorrect + Mollars update |
| Continue/Exit | P0 | Next question or return to menu |
| Haptic Feedback | P0 | Success/failure patterns |

**Question Optimization:**
- Questions must be ≤80 characters
- Answers must be ≤25 characters each
- If source question is longer, use AI to summarize

#### 5.2.5 Battle Mode

| Feature | Priority | Description |
|---------|----------|-------------|
| Opponent List | P0 | Show available opponents |
| Challenge Initiation | P0 | Confirm and start |
| Battle Questions | P0 | 5 rapid-fire questions |
| Live Status | P1 | Opponent progress (optional MVP) |
| Battle Result | P0 | Winner, Mollar awards |
| Push Notifications | P0 | Incoming challenge alerts |

### 5.3 Backend (Supabase)

#### 5.3.1 Authentication

- Email/password via Supabase Auth
- Row Level Security (RLS) policies for family data isolation
- Minimal MVP: Trust model (single family, relaxed security)

#### 5.3.2 Database Tables

See Section 6 for complete schema.

#### 5.3.3 Edge Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| generate_question | HTTP | Call Learning Commons KG, return formatted question |
| validate_answer | HTTP | Check answer, update Mollars, record attempt |
| initiate_battle | HTTP | Create battle record, notify opponent |
| complete_battle | HTTP | Calculate winner, award Mollars |
| send_watch_invite | HTTP | Generate TestFlight message content |

#### 5.3.4 Realtime

- Subscribe to `quiz_attempts` inserts
- Subscribe to `battles` updates
- Subscribe to `children` Mollar balance changes

#### 5.3.5 Storage

- Bucket: `id-documents` for parent ID uploads
- Bucket: `profile-photos` for optional photos

---

## 6. Data Models

### 6.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   parents    │       │   families   │       │   children   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──────▶│ id (PK)      │◀──────│ id (PK)      │
│ email        │       │ name         │       │ first_name   │
│ display_name │       │ family_code  │       │ state        │
│ profile_photo│       │ parent_id(FK)│       │ grade        │
│ id_document  │       │ created_at   │       │ pairing_code │
│ referral_code│       └──────────────┘       │ is_paired    │
│ created_at   │                              │ mollar_bal   │
└──────────────┘                              │ family_id(FK)│
                                              │ created_at   │
                                              └──────────────┘
                                                     │
                    ┌────────────────────────────────┼────────────────────────────────┐
                    │                                │                                │
                    ▼                                ▼                                ▼
          ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
          │  quiz_attempts   │            │     battles      │            │  battle_settings │
          ├──────────────────┤            ├──────────────────┤            ├──────────────────┤
          │ id (PK)          │            │ id (PK)          │            │ id (PK)          │
          │ child_id (FK)    │            │ family_id (FK)   │            │ family_id (FK)   │
          │ question_id      │            │ challenger_id(FK)│            │ parent_child_on  │
          │ question_text    │            │ opponent_id (FK) │            │ child_child_on   │
          │ subject          │            │ opponent_type    │            │ updated_at       │
          │ grade_level      │            │ status           │            └──────────────────┘
          │ selected_answer  │            │ challenger_score │
          │ correct_answer   │            │ opponent_score   │
          │ is_correct       │            │ winner_id        │
          │ mollars_earned   │            │ created_at       │
          │ created_at       │            │ completed_at     │
          └──────────────────┘            └──────────────────┘
```

### 6.2 Table Definitions

#### parents

```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  profile_photo_url TEXT,
  id_document_url TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### families

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  family_code TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### children

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Florida',
  grade INTEGER NOT NULL CHECK (grade >= 2 AND grade <= 5),
  pairing_code TEXT UNIQUE NOT NULL,
  is_paired BOOLEAN DEFAULT FALSE,
  mollar_balance INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### quiz_attempts

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  selected_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  mollars_earned INTEGER DEFAULT 0,
  context TEXT, -- 'solo' or 'battle'
  battle_id UUID REFERENCES battles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### battles

```sql
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL, -- child or parent id
  challenger_type TEXT NOT NULL CHECK (challenger_type IN ('child', 'parent')),
  opponent_id UUID NOT NULL,
  opponent_type TEXT NOT NULL CHECK (opponent_type IN ('child', 'parent')),
  grade_level INTEGER NOT NULL, -- determined by lower grade
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  winner_id UUID,
  winner_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### battle_settings

```sql
CREATE TABLE battle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID UNIQUE REFERENCES families(id) ON DELETE CASCADE,
  parent_child_enabled BOOLEAN DEFAULT TRUE,
  child_child_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. API Specifications

### 7.1 Supabase Edge Functions

#### generate_question

**Endpoint:** `POST /functions/v1/generate_question`

**Request:**
```json
{
  "child_id": "uuid",
  "grade": 3,
  "state": "Florida",
  "subject": "math"
}
```

**Response:**
```json
{
  "question_id": "lc_q_12345",
  "question_text": "What is 7 × 8?",
  "subject": "math",
  "grade_level": 3,
  "options": ["48", "54", "56", "64"],
  "source": "learning_commons_kg"
}
```

**Implementation:**
- Call Learning Commons Knowledge Graph MCP
- Filter by Florida standards, grade level
- Format for watch display (truncate if needed)
- Cache recently served questions to avoid repeats

#### validate_answer

**Endpoint:** `POST /functions/v1/validate_answer`

**Request:**
```json
{
  "child_id": "uuid",
  "question_id": "lc_q_12345",
  "selected_answer": "56",
  "context": "solo",
  "battle_id": null
}
```

**Response:**
```json
{
  "is_correct": true,
  "correct_answer": "56",
  "mollars_earned": 10,
  "new_balance": 1257
}
```

**Implementation:**
- Verify answer against stored correct answer
- Update child's Mollar balance
- Record quiz_attempt
- Update streak if applicable

#### initiate_battle

**Endpoint:** `POST /functions/v1/initiate_battle`

**Request:**
```json
{
  "challenger_id": "uuid",
  "challenger_type": "child",
  "opponent_id": "uuid",
  "opponent_type": "parent"
}
```

**Response:**
```json
{
  "battle_id": "uuid",
  "grade_level": 3,
  "questions": [
    { "question_id": "...", "question_text": "...", "options": ["..."] }
  ],
  "status": "pending"
}
```

**Implementation:**
- Determine battle grade level (lower of participants)
- Generate 5 questions
- Create battle record
- Send push notification to opponent

#### complete_battle

**Endpoint:** `POST /functions/v1/complete_battle`

**Request:**
```json
{
  "battle_id": "uuid",
  "participant_id": "uuid",
  "participant_type": "child",
  "score": 4
}
```

**Response:**
```json
{
  "battle_status": "completed",
  "your_score": 4,
  "opponent_score": 3,
  "winner_id": "uuid",
  "mollars_earned": 50,
  "new_balance": 1307
}
```

### 7.2 Realtime Subscriptions

**Parent App Subscriptions:**

```javascript
// Subscribe to children's quiz attempts
supabase
  .channel('family-activity')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'quiz_attempts',
    filter: `child_id=in.(${childIds.join(',')})`
  }, handleQuizAttempt)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'battles',
    filter: `family_id=eq.${familyId}`
  }, handleBattleUpdate)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'children',
    filter: `family_id=eq.${familyId}`
  }, handleChildUpdate)
  .subscribe()
```

---

## 8. Technical Architecture

### 8.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              THE 6-7 GAME MVP                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐              ┌─────────────────┐                      │
│  │   PARENT APP    │              │   WATCH APP     │                      │
│  │  React Native   │              │   Swift/SwiftUI │                      │
│  │  Expo           │              │   watchOS       │                      │
│  │  iOS/Android    │              │                 │                      │
│  └────────┬────────┘              └────────┬────────┘                      │
│           │                                │                                │
│           │  HTTPS/WSS                     │  HTTPS                         │
│           │                                │                                │
│           ▼                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         SUPABASE                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │    Auth     │  │  Database   │  │  Realtime   │  │  Storage   │ │   │
│  │  │  (Email)    │  │ (PostgreSQL)│  │ (WebSocket) │  │  (Blobs)   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │  ┌───────────────────────────────────────────────────────────────┐ │   │
│  │  │                     Edge Functions                             │ │   │
│  │  │  generate_question | validate_answer | initiate_battle | ...   │ │   │
│  │  └───────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    │  MCP Protocol                          │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              LEARNING COMMONS KNOWLEDGE GRAPH                        │   │
│  │              Florida Standards • Grades 2-5                          │   │
│  │              Math • Science • ELA • Social Studies                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Parent App Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React Native + Expo | Managed workflow for faster dev |
| Navigation | Expo Router | File-based routing |
| State | Zustand or Context | Lightweight state management |
| UI | React Native Paper or NativeBase | Pre-built components |
| Auth | Supabase Auth | Email/password |
| Data | Supabase JS Client | Queries + Realtime |
| Push | Expo Notifications + APNs/FCM | Battle alerts |
| Storage | Expo SecureStore | Session tokens |

### 8.3 Watch App Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | SwiftUI | Native watchOS UI |
| Target | watchOS 10+ | Modern APIs |
| Networking | URLSession | Direct HTTPS to Supabase |
| Auth | Keychain | Secure token storage |
| Push | WatchKit Notifications | Local + remote |
| Haptics | WKInterfaceDevice | Feedback patterns |

### 8.4 Development Environment

**Parent App:**
```bash
# Setup
npx create-expo-app@latest the-67-game-parent --template expo-template-blank-typescript
cd the-67-game-parent
npx expo install @supabase/supabase-js expo-secure-store expo-notifications

# Development
npx expo start
```

**Watch App:**
```bash
# Xcode project structure
The67GameWatch/
├── The67GameWatch.xcodeproj
├── The67GameWatch WatchKit App/
│   ├── Assets.xcassets
│   ├── ContentView.swift
│   └── The67GameWatchApp.swift
├── The67GameWatch WatchKit Extension/
│   ├── Models/
│   ├── Views/
│   ├── Services/
│   │   ├── SupabaseService.swift
│   │   └── QuizService.swift
│   └── Utilities/
└── Tests/
```

---

## 9. Learning Commons Integration

### 9.1 MCP Connection

The Learning Commons Knowledge Graph provides curriculum-aligned questions via MCP (Model Context Protocol).

**Edge Function Implementation:**

```typescript
// supabase/functions/generate_question/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { grade, state, subject } = await req.json()
  
  // Call Learning Commons KG MCP
  const question = await callLearningCommonsMCP({
    action: 'get_question',
    params: {
      state: state || 'Florida',
      grade: grade,
      subject: subject || 'random',
      standard_alignment: true
    }
  })
  
  // Format for watch display
  const formattedQuestion = {
    question_id: question.id,
    question_text: truncateForWatch(question.text, 80),
    subject: question.subject,
    grade_level: question.grade,
    options: question.options.map(o => truncateForWatch(o, 25)),
    correct_answer_index: question.correct_index
  }
  
  return new Response(JSON.stringify(formattedQuestion), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 9.2 Subject Coverage (Florida, Grades 2-5)

| Subject | Grade 2 | Grade 3 | Grade 4 | Grade 5 |
|---------|---------|---------|---------|---------|
| Math | Number sense, addition/subtraction | Multiplication, fractions intro | Multi-digit operations, decimals | Fractions operations, geometry |
| Science | Life cycles, weather | Matter, forces | Earth science, ecosystems | Physical/chemical changes |
| ELA | Reading comprehension, grammar | Main idea, vocabulary | Inference, text structure | Analysis, figurative language |
| Social Studies | Community, maps | Florida history | US regions, government | US history, civics |

### 9.3 Question Formatting Rules

For Apple Watch optimization:

1. **Question Text:** Max 80 characters
   - If longer, AI summarizes while preserving meaning
   - Example: "What number makes this equation true: 5 + __ = 12" → "5 + __ = 12"

2. **Answer Options:** Max 25 characters each
   - Prefer single words or short phrases
   - Example: "The Declaration of Independence" → "Declaration of Independence"

3. **Visual Subjects:**
   - Skip questions requiring diagrams
   - Prefer text-based conceptual questions

---

## 10. Push Notifications

### 10.1 Parent App Notifications

| Event | Title | Body | Trigger |
|-------|-------|------|---------|
| Child Paired | 🎮 [Name] Connected! | [Name] has joined the family. Ready to play! | Child completes pairing |
| Battle Challenge | ⚔️ Battle Request | [Child] challenged you! Tap to accept. | Child initiates parent battle |
| Battle Complete | 🏆 Battle Results | You [won/lost] against [Child]! | Battle concludes |
| Daily Summary | 📊 Daily Recap | Your family answered X questions today | Daily at 7 PM |

### 10.2 Watch Notifications

| Event | Title | Body | Trigger |
|-------|-------|------|---------|
| Battle Challenge | ⚔️ Challenge! | [Name] wants to battle! | Opponent initiates |
| Battle Result | 🏆 or 😔 | You [won/lost]! +[X] Mollars | Battle concludes |
| Streak Reminder | 🔥 Keep Your Streak! | Answer 1 question to continue your streak | 6 PM if no activity |

---

## 11. MVP Constraints & Simplifications

### 11.1 Intentional Limitations

| Area | MVP Approach | Future Enhancement |
|------|--------------|-------------------|
| Security | Family trust model, minimal RLS | Full row-level security, device attestation |
| KYC | Image upload only, no verification | Third-party KYC integration |
| States | Florida only | All US states |
| Grades | 2-5 only | K-12 |
| Users | Single family (Vikas) | Multi-family, multi-tenant |
| Payments | None | Subscription system |
| Content | Learning Commons only | Multiple content providers |
| Analytics | Basic counts | Full learning analytics |
| Offline | None | Cached questions, sync |

### 11.2 Technical Shortcuts (MVP Only)

1. **No rate limiting** - Family trust model
2. **Minimal error handling** - Console logging sufficient
3. **No A/B testing** - Single experience
4. **No i18n** - English only
5. **No accessibility audit** - Basic support only
6. **Hardcoded values** - Florida, USD Mollars

### 11.3 Security Posture (MVP)

```
SECURITY LEVEL: DEVELOPMENT/FAMILY TESTING

✅ Acceptable for MVP:
- Supabase Auth with email/password
- HTTPS for all communications  
- Basic RLS (family_id matching)
- Secure token storage (Keychain/SecureStore)

❌ NOT implementing for MVP:
- Device attestation
- Certificate pinning
- Biometric authentication
- Audit logging
- Rate limiting
- DDoS protection
```

---

## 12. Development Phases

### Phase 1: Foundation (Week 1)

**Parent App:**
- [ ] Expo project setup with TypeScript
- [ ] Supabase connection and auth flow
- [ ] Sign up / Sign in / Forgot password
- [ ] Basic profile setup
- [ ] ID upload placeholder

**Backend:**
- [ ] Database schema creation
- [ ] Basic RLS policies
- [ ] Edge function scaffolding

**Watch App:**
- [ ] Xcode project setup
- [ ] Basic SwiftUI structure
- [ ] Supabase networking layer

### Phase 2: Core Features (Week 2)

**Parent App:**
- [ ] Family creation flow
- [ ] Add child flow with pairing code generation
- [ ] Dashboard UI (static)
- [ ] TestFlight message integration

**Watch App:**
- [ ] Pairing code entry UI
- [ ] Code validation API call
- [ ] Main menu implementation

**Backend:**
- [ ] generate_question edge function
- [ ] Learning Commons MCP integration
- [ ] validate_answer edge function

### Phase 3: Quiz & Battles (Week 3)

**Watch App:**
- [ ] Earn Mollars quiz flow
- [ ] Question display optimization
- [ ] Answer submission
- [ ] Haptic feedback

**Parent App:**
- [ ] Realtime activity feed
- [ ] Child detail view
- [ ] Battle settings toggle

**Backend:**
- [ ] Battle initiation
- [ ] Battle completion
- [ ] Mollar calculations

### Phase 4: Integration & Polish (Week 4)

**Full System:**
- [ ] Push notifications (both platforms)
- [ ] Battle flow end-to-end
- [ ] Parent-child battle complete
- [ ] Sibling battle (if enabled)
- [ ] Real-time updates working
- [ ] Bug fixes and polish
- [ ] TestFlight deployment

---

## 13. Success Metrics (MVP)

### 13.1 Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users | 100% of family | All 4 members active daily |
| Questions/Day/Child | 10+ | Average quiz attempts |
| Battles/Week | 3+ | Total family battles |
| Voluntary Engagement | Yes | Children request to play |
| Session Length | 5+ min | Average watch session |

### 13.2 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Latency | <500ms | Edge function response time |
| Real-time Delay | <2s | Parent notification of child activity |
| Crash Rate | <1% | App stability |
| Pairing Success | 100% | First-attempt pairing |

### 13.3 Qualitative Signals

- James asks "Can I play the 6-7 game?"
- Jack competes to catch up with James
- Parents enjoy battling children
- Family discusses Mollars at dinner

---

## 14. Appendices

### Appendix A: Pairing Code Generation

```typescript
function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### Appendix B: Mollar Economy

| Action | Mollars Earned |
|--------|----------------|
| Correct answer (solo) | +10 |
| Incorrect answer (solo) | +0 |
| Battle win | +50 |
| Battle lose | +10 (participation) |
| Battle tie | +30 |
| Daily streak bonus | +5 per day |

### Appendix C: Watch UI Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Gray | #1C1C1E |
| Primary | Electric Blue | #0A84FF |
| Success | Bright Green | #30D158 |
| Error | Red | #FF453A |
| Mollars | Gold | #FFD60A |
| Text Primary | White | #FFFFFF |
| Text Secondary | Gray | #8E8E93 |

### Appendix D: TestFlight Setup Checklist

1. [ ] Enroll in Apple Developer Program (done)
2. [ ] Create App ID for watch app
3. [ ] Create provisioning profiles
4. [ ] Archive and upload to App Store Connect
5. [ ] Add internal testers (family emails)
6. [ ] Enable TestFlight for watch app
7. [ ] Copy public TestFlight link

---

## 15. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 23, 2024 | Vikas | Initial MVP PRD |
| 2.0 | Dec 23, 2024 | Vikas | Updated with complete user journeys |

---

*End of Document*
