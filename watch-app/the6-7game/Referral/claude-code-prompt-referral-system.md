# Claude Code Prompt: Build Referral System MVP

## Context

You are implementing a **Referral System MVP** for MetaFan - an analytics-focused referral tracking system that enables viral growth. This is NOT a reward system - it's purely about tracking referral events (clicks, signups, conversions) and providing analytics.

## Key Principles

1. **Analytics First**: Every referral event must be tracked
2. **Simple & Fast**: Minimal complexity to get to market quickly
3. **Cross-Platform**: Works in metafan-core (API), metafan-web, and metafan-app
4. **No Rewards**: Skip reward system entirely - focus on tracking and sharing

## Documentation

Before starting, read these documents:
- **PRD**: `_aiwk/docs/referral-system-prd.md` - Complete requirements
- **Implementation Plan**: `_aiwk/plans/referral-system-mvp-plan.md` - Step-by-step tasks

## Current State

### Existing Components
- `user_referrals` table exists with referral codes
- `user_profiles` table has basic referral fields
- `waitlist_entries` table exists but lacks referral tracking
- Basic referral service exists: `src/services/users/referral.service.ts`
- API endpoint exists: `GET /api/v1/users/me/referral`

### What's Missing
- Unified referral event tracking (`referral_events` table)
- Referral tracking in waitlist signups
- Analytics endpoints and services
- Mobile app settings integration (PRIORITY)
- Click tracking for referral links

## Implementation Tasks

### Phase 1: Database Schema (metafan-core)

**Task 1.1: Create `referral_events` table**
- File: `src/db/schema/users.ts`
- Add new table with fields:
  - `id` (uuid, primary key)
  - `referral_code` (text, not null)
  - `referrer_user_id` (uuid, references user_profiles)
  - `event_type` (text: 'click', 'signup', 'conversion')
  - `source` (text: 'waitlist' or 'registration')
  - `referred_email` (text, nullable)
  - `referred_user_id` (uuid, nullable, references user_profiles)
  - `ip_address` (text, nullable)
  - `user_agent` (text, nullable)
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (text, nullable)
  - `referring_url` (text, nullable)
  - `clicked_at`, `signed_up_at`, `converted_at` (timestamps, nullable)
  - `metadata` (jsonb, default {})
  - `created_at`, `updated_at` (timestamps)

**Task 1.2: Add referral tracking to waitlist_entries**
- File: `src/db/schema/campaigns.ts`
- Add to `waitlistEntries` table:
  - `referredByCode: text('referred_by_code')`
  - `referredByUserId: uuid('referred_by_user_id').references(() => userProfiles.id)`

**Task 1.3: Generate migration**
- Run: `npm run db:generate`
- Review generated SQL
- Run: `npm run db:migrate`

### Phase 2: Backend API (metafan-core)

**Task 2.1: Create referral events service**
- File: `src/services/users/referral-events.service.ts` (NEW)
- Functions:
  ```typescript
  trackClick(code: string, ip: string, userAgent: string, utmParams: object)
  trackSignup(code: string, email: string, source: 'waitlist' | 'registration', userId?: string)
  trackConversion(waitlistEntryId: string, userId: string)
  getReferralStats(userId: string)
  getReferralEvents(userId: string, filters?: object)
  ```

**Task 2.2: Enhance existing referral service**
- File: `src/services/users/referral.service.ts`
- Add: `getReferralStats(userId: string)` - returns analytics data
- Enhance: `generateShareLink()` - include UTM params automatically

**Task 2.3: Add API endpoints**
- File: `src/routes/users.ts`
- Add routes:
  - `GET /api/v1/users/me/referral/stats` - Get user's referral analytics
  - `GET /api/v1/users/me/referral/events` - Get referral events list
- File: `src/routes/index.ts` (or create new referral routes file)
- Add public routes:
  - `POST /api/v1/referral/track-click` - Public endpoint for click tracking
  - `GET /api/v1/referral/validate?code={code}` - Public validation

**Task 2.4: Update waitlist signup service**
- File: `src/services/campaigns.service.ts`
- Enhance `joinWaitlist()` function to:
  - Accept `referralCode` parameter
  - Validate referral code
  - Create referral event on signup
  - Link waitlist entry to referrer

**Task 2.5: Add conversion tracking**
- When waitlist user converts to registered user:
  - Update referral event status to 'conversion'
  - Link `referred_user_id` to new user
  - Track conversion timestamp
- Hook into user profile creation/onboarding completion

### Phase 3: Web Integration (metafan-web)

**Task 3.1: Create referral tracking utility**
- File: `src/lib/referral-tracking.ts` (NEW)
- Functions:
  ```typescript
  trackReferralClick(code: string) - Call API to track click
  getReferralCodeFromURL() - Extract from ?ref= param
  generateShareLink(code: string) - Generate shareable link with UTM
  ```

**Task 3.2: Update waitlist signup edge function**
- File: `supabase/functions/waitlist-signup/index.ts`
- Add referral code handling:
  - Extract `referralCode` from request body
  - Validate code via API call to metafan-core
  - Store in waitlist entry
  - Call referral tracking API

**Task 3.3: Update WaitlistPage**
- File: `src/pages/WaitlistPage.tsx`
- On page load, if `?ref=` param present:
  - Extract referral code
  - Call `trackReferralClick()` utility
  - Pass referral code to signup function

**Task 3.4: Enhance ReferralPage**
- File: `src/pages/ReferralPage.tsx`
- Add analytics display:
  - Total clicks
  - Total signups
  - Conversion rate
  - Recent events
- Fetch from: `GET /api/v1/users/me/referral/stats`

### Phase 4: Analytics & Reporting

**Task 4.1: Analytics service**
- File: `src/services/users/referral-analytics.service.ts` (NEW)
- Functions:
  ```typescript
  getUserReferralStats(userId: string) - Aggregated stats
  getReferralFunnel(userId: string) - Funnel metrics
  getReferralTrends(userId: string, period: string) - Time-based trends
  ```

**Task 4.2: Analytics endpoints**
- File: `src/routes/users.ts`
- Endpoint: `GET /api/v1/users/me/referral/analytics`
- Returns aggregated stats with conversion rates

### Phase 5: Mobile App Integration (metafan-app) - **PRIORITY**

**Task 5.1: Referral API client**
- File: `lib/api/referral.ts` (NEW)
- Functions to call metafan-core API:
  ```typescript
  getReferralCode() - GET /api/v1/users/me/referral
  getReferralStats() - GET /api/v1/users/me/referral/stats
  generateShareLink() - POST /api/v1/users/me/referral/share
  trackShare(channel: string) - Track share events
  ```

**Task 5.2: Add Referral Section to Settings Screen** - **HIGHEST PRIORITY**
- File: `app/(tabs)/settings.tsx`
- Add new "Referral" section after Profile section
- Display:
  - Referral code (large, copyable text)
  - Copy to clipboard button
  - Share button (opens share modal)
  - Basic stats (total referrals, if available)
- Fetch referral data on screen load
- Use existing API: `GET /api/v1/users/me/referral`

**Task 5.3: Referral Share Modal Component**
- File: `components/referral/ReferralShareModal.tsx` (NEW)
- Modal with:
  - Referral code display
  - Shareable link
  - Social share options (use native share sheet)
  - Copy link button
  - Track share events

## Important Implementation Notes

### Database
- Use Drizzle ORM schema definitions
- Generate migrations with `npm run db:generate`
- Add indexes for performance (see PRD for details)

### API Design
- Follow existing patterns in `src/routes/users.ts`
- Use `authMiddleware` for authenticated endpoints
- Use Zod schemas for validation (add to `src/schemas/users.ts`)
- Use custom error classes from `src/lib/errors.ts`

### Error Handling
- Self-referral attempts: Silently ignore, proceed with signup
- Invalid referral codes: Allow signup without referral
- API failures: Log error, allow signup to proceed

### Testing
- Test referral code generation uniqueness
- Test self-referral prevention
- Test click tracking
- Test conversion tracking
- Test analytics aggregation

## Success Criteria

- [ ] Users can view referral code in mobile app settings
- [ ] Referral link clicks are tracked
- [ ] Waitlist signups with referral codes are tracked
- [ ] User registrations with referral codes are tracked
- [ ] Waitlist → user conversions are tracked
- [ ] Analytics endpoints return accurate stats
- [ ] Self-referral attempts are prevented
- [ ] Referral code validation works
- [ ] Share functionality works on mobile and web

## Getting Started

1. Read the PRD and implementation plan documents
2. Start with Phase 1: Database schema
3. Test each phase before moving to the next
4. Priority: Get mobile settings integration working first (Phase 5.2)

## Questions?

Refer to:
- PRD: `_aiwk/docs/referral-system-prd.md`
- Implementation Plan: `_aiwk/plans/referral-system-mvp-plan.md`
- Existing code patterns in `src/services/users/` and `src/routes/users.ts`

