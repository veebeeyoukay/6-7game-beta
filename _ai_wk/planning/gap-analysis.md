# Ralph Plan vs Reality: Gap Analysis
**Generated:** 2025-12-31
**Project:** 6-7 Game App
**Repo:** `6-7game-app/` (formerly `the-6-7-game/`)

---

## Executive Summary

The Ralph implementation plan was created for a project structure that differs from current reality. Significant foundational work has already been completed, but under different naming conventions and with some architectural variations.

**Key Findings:**
- ✅ **70% of database schema already implemented**
- ✅ **60% of edge functions exist** (but using different AI provider)
- ❌ **Path mismatches throughout** (plan uses wrong directory)
- ⚠️ **Schema naming differences** (`family_members` vs `family_adults`, etc.)
- ❌ **Website & n8n workflows not started**

---

## Path Corrections Required

### Critical Issue: Repository Name Mismatch

```diff
- Ralph Plan Expects: /Users/vikasbhatia/dev-mm4/the-6-7-game/
+ Actual Location:    /Users/vikasbhatia/dev-mm4/6-7game-app/
```

**Impact:** Every file path, migration script, and automation prompt in the Ralph plan is incorrect.

---

## Database Schema Analysis

### ✅ IMPLEMENTED (Already Exists)

| Ralph Task | Current Implementation | File | Notes |
|------------|------------------------|------|-------|
| **TASK-1.1: User Profiles** | ✅ Complete | `20251225000000_phase2_onboarding.sql:4-13` | Includes first_name, last_name, date_of_birth, state, zip_code, onboarding fields |
| **TASK-1.1: KYC Fields** | ✅ Complete | `20240101000000_initial_schema.sql:5-6` + `20251225000000:10-12` | kyc_status, kyc_front_url, kyc_back_url, kyc_submitted_at |
| **TASK-1.1: Family Extensions** | ⚠️ Partial | `20251225000000_phase2_onboarding.sql:15` | Has `adults_count` instead of `adult_count` + `child_count` |
| **TASK-1.1: Family Adults** | ✅ Complete (different name) | `20251225000000_phase2_onboarding.sql:18-28` | Named `family_members` instead of `family_adults` |
| **TASK-1.1: Children Extensions** | ✅ Complete | `20251225000000_phase2_onboarding.sql:31-33` | birth_month, birth_year, avatar_config |
| **TASK-1.2: Validation System** | ✅ Complete | `20251225000000_phase2_onboarding.sql:62-96` | validation_categories, validation_tasks, validation_requests |
| **TASK-1.3: Calendar** | ✅ Complete (different name) | `20251225000000_phase2_onboarding.sql:36-59` | Named `family_events` instead of `calendar_events` |
| **TASK-1.4: Referral System** | ⚠️ Partial | `20251225000001_phase2e_referrals.sql` | Has referral_code, referral_events, but different format |
| **Mollar Transactions** | ✅ Complete | `20240101000000_initial_schema.sql:98-105` | Already in initial schema |

### ❌ MISSING (Not Yet Implemented)

| Ralph Task | Status | Needed For |
|------------|--------|------------|
| **TASK-1.5: preview_sessions** | ❌ Missing | Tracking preview question sessions |
| **TASK-1.5: preview_questions** | ❌ Missing | Storing generated preview questions with ratings |
| **TASK-1.5: waitlist** | ❌ Missing | Website waitlist signups |
| **TASK-1.4: referral_rewards** | ❌ Missing | Tracking unclaimed referral rewards |
| **TASK-1.2: mollar_transactions extended fields** | ⚠️ Partial | Ralph plan has different schema than existing |

### ⚠️ SCHEMA DRIFT (Different Naming/Structure)

| Ralph Plan Expects | Actual Implementation | Impact |
|--------------------|----------------------|--------|
| `family_adults` table | `family_members` table | Code references need updating |
| `calendar_events` table | `family_events` table | Edge function/app code may differ |
| `adult_count` + `child_count` columns | `adults_count` only | Missing child_count tracking |
| Referral code format `67-XXXX-XXXX` | MD5 hash (8 chars) | Different referral code generation |

---

## Edge Functions Analysis

### ✅ IMPLEMENTED (Already Exists)

| Ralph Task | Current Implementation | Notes |
|------------|------------------------|-------|
| **TASK-2.1: preview-questions** | ✅ `supabase/functions/preview-questions/` | ⚠️ Uses Google Gemini, not Anthropic + Learning Commons MCP |
| **TASK-2.3: track-referral** | ✅ `supabase/functions/track-referral/` | Handles referral click tracking |

### ❌ MISSING (Not Yet Implemented)

| Ralph Task | Status | Needed For |
|------------|--------|------------|
| **TASK-2.2: request-validation** | ❌ Missing | Child validation requests from Watch |
| **TASK-2.3: process-referral-signup** | ❌ Missing | Award Mollars on signup completion |
| **TASK-2.3: get-referral-stats** | ❌ Missing | Return referral stats for dashboard |
| **TASK-2.4: waitlist-signup** | ❌ Missing | Website waitlist with priority scoring |

### ⚠️ ARCHITECTURAL DIFFERENCES

**AI Provider:**
- Ralph Plan expects: **Anthropic Claude with Learning Commons MCP**
- Current implementation: **Google Gemini (gemini-2.0-flash)**

**Recommendation:** Decide whether to:
1. Keep Gemini (current)
2. Switch to Anthropic (Ralph plan)
3. Support both with feature flag

---

## Parent App (React Native) Analysis

### Current State
- Onboarding flow exists (based on git history)
- Dashboard implementation started
- Brand design system in place (`constants/brand.ts`)

### Ralph Plan Expectations
- Phase 3: 6 onboarding screens (TASK-3.1 through 3.6)
- Phase 4: Dashboard with 5 tabs (TASK-4.1 through 4.3)

**Recommendation:** Audit existing parent-app code to identify what's already built vs what Ralph plan expects.

---

## Website Analysis

### ✅ DECISION MADE: Use Existing 6-7game-web Repo

**Status:** Website exists in separate repository `6-7game-web`

**Integration Required:**
- Add WaitlistForm component to existing website
- Configure environment variables for Supabase
- Integrate with `waitlist-signup` edge function
- Add referral link handling

**Integration Guide:** `../../6-7game-web/_ai_wk/planning/integration-guide.md` provides complete implementation details

**No New Website Directory Needed:** Ralph plan's `website/` directory creation (TASK-0.3) is **not applicable** - using existing separate repo instead

---

## n8n Automation Analysis

### ❌ COMPLETELY MISSING

Ralph Phase 10 expects:
- `n8n-workflows/` directory
- Three workflows:
  1. **waitlist-welcome** - SendGrid email + Slack notification
  2. **validation-notification** - Email parents when child requests validation
  3. **daily-summary** - 7pm daily Mollar summary emails

**Current Status:** No n8n directory, no workflows, no automation infrastructure

---

## Priority Gap Closure Plan

### 🔴 HIGH PRIORITY (Blockers for MVP)

1. **Create waitlist infrastructure:**
   - Migration: `preview_sessions`, `preview_questions`, `waitlist` tables
   - Edge function: `waitlist-signup`
   - Decision: Website location (this repo vs 6-7game-web)

2. **Fix referral system:**
   - Add `referral_rewards` table
   - Create `process-referral-signup` edge function
   - Create `get-referral-stats` edge function
   - Update referral code format to `67-XXXX-XXXX` pattern

3. **Validation flow completion:**
   - Create `request-validation` edge function
   - Connect to Watch app

### 🟡 MEDIUM PRIORITY (Enhances UX)

4. **n8n automation setup:**
   - Create `n8n-workflows/` directory
   - Implement waitlist welcome workflow
   - Implement validation notification workflow

5. **AI provider alignment:**
   - Decide on Gemini vs Anthropic
   - Update `preview-questions` if switching to Anthropic

### 🟢 LOW PRIORITY (Nice-to-have)

6. **Schema alignment:**
   - Rename `family_members` → `family_adults` (or update docs)
   - Rename `family_events` → `calendar_events` (or update docs)
   - Add missing `child_count` column to families

7. **Documentation updates:**
   - Update all path references in Ralph plan
   - Create migration guide for schema differences

---

## File Structure Comparison

### Ralph Plan Expects:
```
the-6-7-game/
├── parent-app/
├── watch-app/
├── website/              # ❌ Missing
├── supabase/
│   ├── migrations/
│   └── functions/
├── n8n-workflows/        # ❌ Missing
└── _ralph_status/        # ❌ Missing (tracking directory)
```

### Current Reality:
```
6-7game-app/              # ⚠️ Different name
├── parent-app/           # ✅ Exists
├── watch-app/            # ✅ Exists
├── supabase/             # ✅ Exists
│   ├── migrations/       # ✅ 7 migrations exist
│   └── functions/        # ✅ 7 functions exist
├── docs/                 # ✅ Exists (not in Ralph plan)
├── images/               # ✅ Exists (brand assets)
└── CLAUDE.md            # ✅ Project instructions
```

---

## Existing vs Planned Migrations

### Existing Migrations:
1. `20240101000000_initial_schema.sql` - Core tables
2. `20240101000001_handle_new_user.sql` - User creation trigger
3. `20251225000000_phase2_onboarding.sql` - Onboarding + validation
4. `20251225000001_phase2e_referrals.sql` - Referral system
5. `20251225000002_multi_parent_rls.sql` - Multi-parent support
6. `20251225000003_referral_triggers.sql` - Referral completion trigger
7. `20251226000000_fix_rls_recursion.sql` - RLS security fix

### Ralph Plan Expects:
1. `002_user_profile_fields.sql` (redundant with existing #3)
2. `003_validation_system.sql` (redundant with existing #3)
3. `004_family_calendar.sql` (redundant with existing #3)
4. `005_referral_system.sql` (partially redundant with existing #4)
5. `006_preview_waitlist.sql` ❌ **MISSING - NEED TO CREATE**

---

## Recommendations

### Immediate Actions (Next 24 Hours)

1. **Create missing migration:**
   - Implement `007_preview_waitlist.sql` with preview_sessions, preview_questions, waitlist tables

2. **Create missing edge functions:**
   - `request-validation` (validation flow)
   - `process-referral-signup` (referral rewards)
   - `get-referral-stats` (dashboard API)
   - `waitlist-signup` (website integration)

3. **Clarify website strategy:**
   - Confirm: Use `6-7game-web` repo OR create `website/` in this repo?
   - Update Ralph plan accordingly

### Short Term (This Week)

4. **Create n8n infrastructure:**
   - Set up `n8n-workflows/` directory
   - Implement 3 core workflows (waitlist, validation, daily summary)

5. **Update corrected Ralph plan:**
   - Fix all paths to `6-7game-app/`
   - Remove redundant tasks
   - Update schema references to match reality

### Long Term (Nice-to-Have)

6. **Schema alignment decision:**
   - Document why `family_members` != `family_adults`
   - Consider adding `child_count` to families table
   - Decide on referral code format standardization

7. **AI provider strategy:**
   - Benchmark Gemini vs Anthropic for question generation
   - Implement Learning Commons MCP if switching to Anthropic

---

## Summary Scorecard

| Category | Completion | Details |
|----------|------------|---------|
| **Database Schema** | 70% | Core tables exist, missing waitlist/preview tables |
| **Edge Functions** | 40% | 2/6 Ralph functions exist, 4 missing |
| **Parent App** | 50% | Onboarding started, dashboard partial |
| **Watch App** | ??? | Needs audit (not in scope of this analysis) |
| **Website** | 0% | Missing entirely (or in separate repo?) |
| **n8n Workflows** | 0% | Not started |
| **Documentation** | 80% | Great docs exist, but Ralph plan outdated |

**Overall Project Readiness: ~45%**

---

## Next Steps

**Question for Product Owner (Vikas):**

1. Should we use the existing `6-7game-web` repo for the website, or create `website/` here?
2. Keep Google Gemini or switch to Anthropic for question generation?
3. Priority: Complete waitlist flow first, or finish validation/referral systems?

**Ready to Execute:**
- ✅ Missing migrations (waitlist, preview)
- ✅ Missing edge functions (4 functions)
- ✅ n8n workflow templates
- ✅ Corrected Ralph implementation plan

---

**Analysis Complete** | Ready for autonomous implementation 🚀
