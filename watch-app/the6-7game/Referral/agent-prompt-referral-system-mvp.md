# Agent Prompt: Build Referral System MVP (All Repos)

## Mission

Implement a **Referral System MVP** for MetaFan across all three repositories (metafan-core, metafan-web, metafan-app). This is an analytics-focused referral tracking system that enables viral growth. **No reward system** - purely tracking referral events (clicks, signups, conversions) and providing analytics.

## Key Principles

1. **Analytics First**: Every referral event must be tracked
2. **Simple & Fast**: Minimal complexity to get to market quickly
3. **Cross-Platform**: Works seamlessly across all three repos
4. **No Rewards**: Skip reward system entirely - focus on tracking and sharing

## Documentation (Read First)

### Main Documentation (metafan-core)
- **PRD**: `metafan-core/_aiwk/docs/referral-system-prd.md` - Complete requirements
- **Implementation Plan**: `metafan-core/_aiwk/plans/referral-system-mvp-plan.md` - Step-by-step tasks
- **GitHub Issue**: `metafan-core/_aiwk/docs/github-issue-referral-system-mvp.md` - Issue template

### Repo-Specific Guides
- **Web Integration**: `metafan-web/_aiwk/docs/referral-system-integration.md` - Web-specific tasks
- **Mobile Integration**: `metafan-app/_aiwk/docs/referral-system-integration.md` - Mobile-specific tasks

## Current State

### metafan-core (API)
- ✅ `user_referrals` table exists with referral codes
- ✅ `user_profiles` table has basic referral fields
- ✅ Basic referral service: `src/services/users/referral.service.ts`
- ✅ API endpoint: `GET /api/v1/users/me/referral`
- ❌ Missing: `referral_events` table, analytics endpoints, conversion tracking

### metafan-web
- ✅ `WaitlistPage` exists and extracts `?ref=` param
- ✅ `ReferralPage` exists but lacks analytics
- ✅ Waitlist signup edge function accepts `referralCode` but doesn't process it
- ❌ Missing: Referral tracking utility, click tracking, analytics display

### metafan-app
- ✅ Settings screen exists: `app/(tabs)/settings.tsx`
- ✅ AuthContext provides user authentication
- ❌ Missing: Referral API client, Settings screen integration (PRIORITY), share modal

## Implementation Order

### Phase 1: Database Schema (metafan-core) ⚠️ START HERE

**Task 1.1: Create `referral_events` table**
- **File**: `metafan-core/src/db/schema/users.ts`
- **Action**: Add new table definition
- **Fields**:
  ```typescript
  export const referralEvents = pgTable('referral_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    referralCode: text('referral_code').notNull(),
    referrerUserId: uuid('referrer_user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(), // 'click', 'signup', 'conversion'
    source: text('source'), // 'waitlist' or 'registration'
    referredEmail: text('referred_email'),
    referredUserId: uuid('referred_user_id').references(() => userProfiles.id, { onDelete: 'set null' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    referringUrl: text('referring_url'),
    clickedAt: timestamp('clicked_at', { withTimezone: true }),
    signedUpAt: timestamp('signed_up_at', { withTimezone: true }),
    convertedAt: timestamp('converted_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  });
  ```

**Task 1.2: Add referral tracking to waitlist_entries**
- **File**: `metafan-core/src/db/schema/campaigns.ts`
- **Action**: Add to `waitlistEntries` table:
  ```typescript
  referredByCode: text('referred_by_code'),
  referredByUserId: uuid('referred_by_user_id').references(() => userProfiles.id),
  ```

**Task 1.3: Generate and run migration**
- **Commands**:
  ```bash
  cd metafan-core
  npm run db:generate
  npm run db:migrate
  ```

### Phase 2: Backend API (metafan-core)

**Task 2.1: Create referral events service**
- **File**: `metafan-core/src/services/users/referral-events.service.ts` (NEW)
- **Functions**:
  ```typescript
  export async function trackClick(code: string, ip: string, userAgent: string, utmParams: object)
  export async function trackSignup(code: string, email: string, source: 'waitlist' | 'registration', userId?: string)
  export async function trackConversion(waitlistEntryId: string, userId: string)
  export async function getReferralStats(userId: string)
  export async function getReferralEvents(userId: string, filters?: object)
  ```

**Task 2.2: Enhance existing referral service**
- **File**: `metafan-core/src/services/users/referral.service.ts`
- **Action**: 
  - Add `getReferralStats(userId: string)` function
  - Enhance `generateShareLink()` to include UTM params automatically

**Task 2.3: Add API endpoints**
- **File**: `metafan-core/src/routes/users.ts`
- **Add routes**:
  ```typescript
  router.get('/me/referral/stats', ...) // Get analytics
  router.get('/me/referral/events', ...) // Get events list
  ```
- **File**: `metafan-core/src/routes/index.ts` (or create `src/routes/referral.ts`)
- **Add public routes**:
  ```typescript
  router.post('/referral/track-click', ...) // Public click tracking
  router.get('/referral/validate', ...) // Public validation
  ```

**Task 2.4: Update waitlist signup service**
- **File**: `metafan-core/src/services/campaigns.service.ts`
- **Action**: Enhance `joinWaitlist()` to:
  - Accept `referralCode` parameter
  - Validate code via `getReferralByCode()`
  - Create referral event via `trackSignup()`
  - Link waitlist entry to referrer

**Task 2.5: Add conversion tracking**
- **File**: `metafan-core/src/services/users/profile.service.ts` (or create conversion service)
- **Action**: When waitlist user converts to registered user:
  - Find referral events for waitlist entry
  - Update event status to 'conversion'
  - Link `referred_user_id` to new user
  - Track conversion timestamp

### Phase 3: Web Integration (metafan-web)

**Task 3.1: Create referral tracking utility**
- **File**: `metafan-web/src/lib/referral-tracking.ts` (NEW)
- **Functions**:
  ```typescript
  export async function trackReferralClick(code: string): Promise<void>
  export function getReferralCodeFromURL(): string | null
  export function generateShareLink(code: string): string
  ```
- **API Base URL**: Use environment variable (check existing API config)

**Task 3.2: Update waitlist signup edge function**
- **File**: `metafan-web/supabase/functions/waitlist-signup/index.ts`
- **Action**:
  1. Extract `referralCode` from request body
  2. Validate via API: `GET {API_URL}/api/v1/referral/validate?code={code}`
  3. Store in waitlist entry: `referred_by_code` and `referred_by_user_id`
  4. Call tracking API if not already tracked

**Task 3.3: Update WaitlistPage**
- **File**: `metafan-web/src/pages/WaitlistPage.tsx`
- **Action**: On page load/mount:
  - Check for `?ref=` parameter
  - If present, call `trackReferralClick(code)`
  - Code already passed to signup (existing)

**Task 3.4: Enhance ReferralPage**
- **File**: `metafan-web/src/pages/ReferralPage.tsx`
- **Action**: Add analytics section:
  - Fetch from `GET {API_URL}/api/v1/users/me/referral/stats`
  - Display: Total clicks, signups, conversion rate, recent events
  - Use existing UI patterns

### Phase 4: Analytics & Reporting (metafan-core)

**Task 4.1: Analytics service**
- **File**: `metafan-core/src/services/users/referral-analytics.service.ts` (NEW)
- **Functions**:
  ```typescript
  export async function getUserReferralStats(userId: string)
  export async function getReferralFunnel(userId: string)
  export async function getReferralTrends(userId: string, period: string)
  ```

**Task 4.2: Analytics endpoints**
- **File**: `metafan-core/src/routes/users.ts`
- **Add**: `GET /api/v1/users/me/referral/analytics`
- **Returns**: Aggregated stats with conversion rates

### Phase 5: Mobile App Integration (metafan-app) 🎯 **HIGHEST PRIORITY**

**Task 5.1: Referral API client**
- **File**: `metafan-app/lib/api/referral.ts` (NEW)
- **Pattern**: Follow existing API client patterns (check `lib/api/` directory)
- **Functions**:
  ```typescript
  export async function getReferralCode(): Promise<{ referralCode: string, referralCount: number }>
  export async function getReferralStats(): Promise<ReferralStats>
  export async function generateShareLink(channel?: string): Promise<{ url: string, code: string }>
  export async function trackShare(channel: string): Promise<void>
  ```
- **Auth**: Use token from `AuthContext`
- **Base URL**: Use environment variable or config

**Task 5.2: Add Referral Section to Settings Screen** 🚨 **CRITICAL PRIORITY**
- **File**: `metafan-app/app/(tabs)/settings.tsx`
- **Action**:
  1. Add new "Referral" section after Profile section
  2. Display:
     - Referral code (large, copyable text)
     - Copy to clipboard button (use `expo-clipboard`)
     - Share button (opens ReferralShareModal)
     - Basic stats (total referrals, if available)
  3. Fetch data on screen load using `getReferralCode()` and `getReferralStats()`
  4. Handle loading and error states
  5. Use existing styling patterns from Settings screen

**Task 5.3: Referral Share Modal Component**
- **File**: `metafan-app/components/referral/ReferralShareModal.tsx` (NEW)
- **Props**:
  ```typescript
  interface ReferralShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referralCode: string;
    shareUrl: string;
  }
  ```
- **Features**:
  - Display referral code and shareable link
  - Copy link button
  - Native share sheet (use `expo-sharing` or `react-native` Share API)
  - Track share events via `trackShare()`

## Implementation Guidelines

### Database (metafan-core)
- Use Drizzle ORM schema definitions
- Generate migrations: `npm run db:generate`
- Review SQL before running: `npm run db:migrate`
- Add indexes for performance (see PRD)

### API Design (metafan-core)
- Follow existing patterns in `src/routes/users.ts`
- Use `authMiddleware` for authenticated endpoints
- Use Zod schemas for validation (`src/schemas/users.ts`)
- Use custom error classes from `src/lib/errors.ts`
- Public endpoints should not require auth

### Error Handling
- **Self-referral**: Silently ignore, proceed with signup
- **Invalid codes**: Allow signup without referral
- **API failures**: Log error, allow signup to proceed
- **Network errors**: Show user-friendly messages

### Testing
- Test referral code generation uniqueness
- Test self-referral prevention
- Test click tracking
- Test conversion tracking
- Test analytics aggregation
- Test mobile Settings screen display
- Test web ReferralPage analytics

## Success Criteria

- [ ] `referral_events` table created and migrated
- [ ] Waitlist entries track referral codes
- [ ] Referral link clicks are tracked
- [ ] Waitlist signups with referral codes are tracked
- [ ] User registrations with referral codes are tracked
- [ ] Waitlist → user conversions are tracked
- [ ] Analytics endpoints return accurate stats
- [ ] Self-referral attempts are prevented
- [ ] Referral code validation works
- [ ] **Users can view referral code in mobile app Settings** (PRIORITY)
- [ ] Share functionality works on mobile and web
- [ ] ReferralPage displays analytics

## File Checklist

### metafan-core
- [ ] `src/db/schema/users.ts` - Add `referralEvents` table
- [ ] `src/db/schema/campaigns.ts` - Add referral fields to waitlist
- [ ] `src/services/users/referral-events.service.ts` - NEW
- [ ] `src/services/users/referral-analytics.service.ts` - NEW
- [ ] `src/services/users/referral.service.ts` - Enhance
- [ ] `src/services/campaigns.service.ts` - Add referral tracking
- [ ] `src/routes/users.ts` - Add analytics endpoints
- [ ] `src/routes/index.ts` or `src/routes/referral.ts` - Add public endpoints
- [ ] `src/schemas/users.ts` - Add referral validation schemas

### metafan-web
- [ ] `src/lib/referral-tracking.ts` - NEW
- [ ] `supabase/functions/waitlist-signup/index.ts` - Add referral handling
- [ ] `src/pages/WaitlistPage.tsx` - Add click tracking
- [ ] `src/pages/ReferralPage.tsx` - Add analytics display

### metafan-app
- [ ] `lib/api/referral.ts` - NEW (API client)
- [ ] `app/(tabs)/settings.tsx` - Add referral section (PRIORITY)
- [ ] `components/referral/ReferralShareModal.tsx` - NEW

## Getting Started

1. **Read all documentation** in the order listed above
2. **Start with Phase 1** (Database schema) in metafan-core
3. **Test each phase** before moving to the next
4. **Priority**: Get mobile Settings screen working (Phase 5.2) as soon as Phase 2 is complete
5. **Work sequentially** through phases, but can parallelize web and mobile after Phase 2

## Questions?

Refer to:
- **PRD**: `metafan-core/_aiwk/docs/referral-system-prd.md`
- **Plan**: `metafan-core/_aiwk/plans/referral-system-mvp-plan.md`
- **Web Guide**: `metafan-web/_aiwk/docs/referral-system-integration.md`
- **Mobile Guide**: `metafan-app/_aiwk/docs/referral-system-integration.md`
- **Existing code patterns** in each repo

## Important Notes

- **No rewards system** - pure analytics focus
- **Simple fraud prevention** - basic self-referral check only
- **UTM tracking** - all links should include UTM params
- **Public click tracking** - endpoint for analytics
- **Mobile Settings is highest priority** - users need to see their code
- **Follow existing patterns** - don't reinvent the wheel
- **Test as you go** - don't wait until the end

---

**Ready to start? Begin with Phase 1 in metafan-core!**

