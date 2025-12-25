# Phase 2 Development Plan: The 6-7 Game

## Goal Description
Transform the MVP into a polished, Apple-quality family gaming platform. This phase focuses on the Parent Experience (Onboarding, KYC, Analytics), Child Experience (Avatar, Multiple Choice), and the Family Ecosystem (Calendar, Behavioral Validation).

## User Review Required
> [!IMPORTANT]
> This is a hands-off phase for the user. The plan must be comprehensive enough for an agent to execute autonomously.
> **Critical Validation:** Verify Learning Commons MCP integration via the Parent Preview Mode.

## Proposed Changes

### Phase 2A.1: Multi-Parent Support (Priority 0)
**Goal:** Enable multiple adults to manage the same family account.

*   **Database Changes:**
    *   Update `family_members` role default to `'adult'` (was `'parent'`).
    *   Migrate existing `'parent'` roles to `'adult'`.
*   **Security (RLS) Overhaul:**
    *   **Old Logic:** `families.created_by = auth.uid()` (Only creator has access).
    *   **New Logic:** `EXISTS (SELECT 1 FROM family_members WHERE family_id = [table].family_id AND user_id = auth.uid() AND role = 'adult')`.
    *   **Apply to Tables:** `families`, `children`, `battles`, `battle_questions`, `learning_progress`, `family_events`, `validation_...`

**GitHub Issues:**
*   `[FEAT] Multi-Parent RLS Migration`

**Test Cases:**
*   [ ] User A invites User B.
*   [ ] User B accepts and becomes 'adult'.
*   [ ] User B can view User A's created children/events.
*   [ ] User B can approve validation requests.

### Phase 2A: Watch App Core (Priority 1)
#### 1. Multiple Choice & Answer Logic
**Goal:** Kid-friendly input method with smart distractors.

*   **UI (Watch App):**
    *   Replace keyboard input with 2x2 grid of options.
    *   **Requirement:** Ensure current time is always visible on screen (top-right or persistent overlay).
    *   Implement `AnswerButton.swift` component reuse.
*   **Logic (Shared/Watch):**
    *   `generateDistractors(correctAnswer)` function.
    *   Math Logic: +/- 1-2, transpositions (e.g., 23 vs 32).
    *   Spelling Logic: Phonetic neighbors.

**Verification:**
*   [ ] Quiz displays 4 distinct options.
*   [ ] Distractors are plausible.

### Phase 2E: Referral Engine (Priority 2)
#### 2. Referral Logic Implementation
**Goal:** Enable viral growth.
**Pre-requisite:** Verify Multi-Family/Multi-Child Schema Support (Confirmed: Schema supports it, RLS needs check).

*   **Edge Functions:**
    *   `track-referral`: Handle click events.
    *   `process-signup`: Link new user to referrer.
*   **Database:**
    *   Verify `referral_events` trigger correct Mollar updates.

**Verification:**
*   [ ] User B signs up with User A's code -> `referral_events` row created.
*   [ ] User A gets notification/mollars.

### Phase 2B: Family Ecosystem (Priority 3)


#### 5. Family Calendar
**Goal:** Scheduling and tracking family activity.

*   **Database Changes:**
    *   `family_events`: Schedule battles, activities.
    *   `event_completions`: Track status.
*   **UI (Parent App):**
    *   Calendar View (Month/Day).
    *   Add Event Modal.

**GitHub Issues:**
*   `[FEAT] Family Calendar Database Schema`
*   `[FEAT] Calendar UI & Event Creation`

**Test Cases:**
*   [ ] Created event appears on calendar.
*   [ ] Event persists to `family_events` table.

#### 6. Behavioral Validation Battles
**Goal:** Gamify real-world tasks.

*   **Database Changes:**
    *   `validation_categories`, `validation_tasks`, `validation_requests`.
*   **UI (Watch App):**
    *   Task list -> "Request Validation".
*   **UI (Parent App):**
    *   Notification/Inbox for requests -> Approve/Deny.

**GitHub Issues:**
*   `[FEAT] Behavioral Validation Schema`
*   `[FEAT] Task Request Flow on Watch`
*   `[FEAT] Parent Approval Workflow`

**Test Cases:**
*   [ ] Watch request creates `validation_request` entry.
*   [ ] Parent approval grants Mollars.
*   [ ] Denial records status.

### Phase 2B: Family Ecosystem & Calendar (Priority 3)
#### 5. Family Calendar (Task System)
**Goal:** Track activities ("Mustard", "Ketchup", "Pickle") and prep tasks.

*   **Task Taxonomy:**
    *   **Mustard (Must Do):** Mandatory, due date/time. Becomes "Parent-Child Battle".
    *   **Ketchup (Catch Up):** Overdue/missed.
    *   **Pickle (Pick One):** Optional choice.
*   **UI (Parent App):**
    *   **Views:** List, 3-Day, Week views.
    *   **Validation:** Chips for age-appropriate tasks (e.g., Brush Teeth).
    *   **Rewards:** Assign Mollars.
*   **Database:**
    *   `validation_tasks`: Add `category_type` (mustard/ketchup/pickle), `due_at`.

**GitHub Issues:**
*   `[FEAT] Calendar: Mustard/Ketchup/Pickle Logic`
*   `[FEAT] Calendar 3-Day & Week Views`

**Test Cases:**
*   [ ] Mustard task appears in child's mandatory list.
*   [ ] 3-Day view renders correctly.

### Phase 2C: Child Experience & Avatar
#### 6. 8-Bit Avatar Engine
**Goal:** Simple, retro customization.

*   **Customization Flow:**
    *   **Base:** Scroll Up/Down for Boy/Girl.
    *   **Style:** 8-Bit Art Style.
*   **Options:**
    *   **Hair:** Black, Brown, Red, Blonde.
    *   **Eyes:** Black, Brown, Green, Blue.
    *   **Outfit:** Shirt/Pants (Boy), Dress (Girl) - 8-bit colors.
*   **Data:**
    *   Store in `children.avatar_config` JSON.

**GitHub Issues:**
*   `[FEAT] 8-Bit Avatar Customization UI`

**Test Cases:**
*   [ ] "Boy" selection limits to Shirt/Pants options.
*   [ ] "Girl" selection limits to Dress options.
*   [ ] Config persists to DB.

#### 8. Visual Pairing
**Goal:** Easier, secure pairing.

*   **Logic:**
    *   Parent sees 4 digits + pattern.
    *   Watch shows 4 digits.
    *   Child taps pattern.

**GitHub Issues:**
*   `[FEAT] Visual Pairing Logic & UI`

**Test Cases:**
*   [ ] Correct pattern tap pairs device.
*   [ ] Incorrect pattern fails/retries.

### Phase 2E: Referral Engines

#### 9. Referral System
**Goal:** Viral growth.

*   **Database:**
    *   `referral_codes` on users.
    *   `referral_events` tracking.
*   **Edge Functions:**
    *   `track-referral-click`
    *   `process-referral-signup`

**GitHub Issues:**
*   [x] `[FEAT] Referral Database Schema & Code Gen`
*   `[FEAT] Referral Tracking Edge Functions`
*   [x] `[FEAT] Referral Dashboard UI`

**Test Cases:**
*   [ ] Signing up with code links users.
*   [ ] Rewards granted upon trigger events.

## Verification Plan

### Automated Tests
*   **Unit Tests:** Jest tests for utility functions (Referral code gen, distractor logic).
*   **Integration Tests:** Supabase local testing for DB migrations and Edge Functions.

### Manual Verification
*   **Parent App:** Run via Expo on Simulator/Device. Step through Onboarding, Dashboard, Calendar.
*   **Watch App:** Run on Watch Simulator. Test Quiz UI, Avatar flow.
*   **End-to-End:** Complete a full loop: Signup -> Add Child -> Pair Watch -> Play Battle -> Check Analytics.
