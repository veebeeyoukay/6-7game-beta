# Product Requirements Document: Referral System MVP

**Version**: 1.0 MVP  
**Date**: 2025-12-22
**Status**: Draft  
**Target**: MetaFan Platform (Core API, Web, Mobile App)

## Executive Summary

This PRD defines the requirements for a **minimal viable referral system** focused on **analytics and viral growth**. The MVP tracks referral events (clicks, signups, conversions) across waitlist and user registration flows, provides analytics endpoints, and enables easy sharing. **No reward system is included in MVP** - the focus is on tracking, analytics, and enabling viral growth through easy sharing.

## Objectives (Prioritized)

1. **Analytics First**: Track all referral events for insights and optimization
2. **Viral Growth**: Enable users to easily share MetaFan with friends and family
3. **User Acquisition**: Convert referrals into active registered users
4. **Cross-Platform**: Works seamlessly across metafan-core (API), metafan-web, and metafan-app
5. **Simple & Fast**: Minimal complexity to get to market quickly for testing

## Current State Analysis

### Existing Components

1. **Database Schema**:
   - `user_profiles.referral_code` - Unique 8-character alphanumeric code
   - `user_profiles.referred_by` - Code of user who referred them
   - `user_profiles.referral_count` - Count of successful referrals
   - `waitlist.referral_code` - Waitlist referral codes
   - `waitlist.referred_by` - Waitlist referral tracking
   - `referrals` table (two versions exist - waitlist-based and user-based)

2. **Database Functions**:
   - `generate_referral_code()` - Auto-generates codes on user creation
   - `increment_referral_count()` - Increments waitlist referral count
   - `get_referral_stats()` - Gets referral statistics
   - `complete_referral()` - Marks referral as completed
   - `get_user_by_referral_code()` - Finds user by code

3. **Frontend Components**:
   - `ReferralModal` - Modal for sharing referral code
   - `ReferralPage` - Public referral landing page
   - `WaitlistForm` - Includes referral code handling

4. **Analytics**:
   - Basic Mixpanel tracking for referral shares and clicks

### Gaps to Address (MVP Scope)

1. **No unified referral tracking** (waitlist vs user referrals are separate)
2. **No referral event tracking** (clicks, signups, conversions not tracked)
3. **Incomplete analytics** (no analytics endpoints or dashboard)
4. **No mobile app integration** (referral code not visible in app settings)
5. **Limited click tracking** (referral link clicks not systematically tracked)

### Out of MVP Scope (Future Enhancements)

- Reward/incentive system
- Advanced fraud prevention (beyond basic self-referral check)
- Admin interface for managing referrals
- Email notifications
- Referral leaderboard/gamification
- Referral expiration rules

## System Architecture

### Data Flow

```
User A (Referrer)
  ↓
Generates Referral Code (auto-created)
  ↓
Shares Referral Link (visible in app settings)
  ↓
User B (Referee) Clicks Link
  ↓
[Track Click Event]
  ↓
User B Signs Up (Waitlist or Registration)
  ↓
[Track Signup Event]
  ↓
User B Converts to Registered User (if from waitlist)
  ↓
[Track Conversion Event]
  ↓
Analytics Updated
```

### Core Entities

1. **Referral Code**: Unique identifier for each user (stored in `user_referrals`)
2. **Referral Event**: Tracks clicks, signups, conversions (stored in `referral_events`)
3. **Event Types**: `click`, `signup`, `conversion`
4. **Source**: `waitlist` or `registration`
5. **Analytics**: Aggregated stats for user dashboard

## Functional Requirements

### FR1: Referral Code Management

#### FR1.1: Code Generation
- **Requirement**: Every user must have a unique referral code
- **Format**: 8-character alphanumeric (uppercase)
- **Uniqueness**: Must be globally unique across all users
- **Generation**: Automatic on user profile creation
- **Persistence**: Stored in `user_profiles.referral_code`
- **Validation**: Code must not contain ambiguous characters (0/O, 1/I/l)

#### FR1.2: Code Retrieval
- **Requirement**: Users can view their referral code at any time
- **Locations**: 
  - **Mobile App**: Settings screen (new "Referral" section) - **MVP Priority**
  - **Web**: Referral dashboard page
- **Display**: Code should be clearly visible and copyable
- **Formatting**: Display as-is (8 characters, no hyphens needed)
- **API**: `GET /api/v1/users/me/referral` returns referral code

#### FR1.3: Code Validation
- **Requirement**: System must validate referral codes before accepting
- **Checks**:
  - Code exists in database
  - Code belongs to active user
  - Code is not expired (if expiration implemented)
  - User is not referring themselves
- **Error Handling**: Clear error messages for invalid codes

### FR2: Referral Link Generation

#### FR2.1: Link Format
- **Requirement**: Generate shareable referral links
- **Format**: `https://metafan.net/waitlist?ref={CODE}` or `https://metafan.net/signup?ref={CODE}`
- **UTM Parameters**: Automatically append UTM tracking
  - `utm_source=referral`
  - `utm_medium=referral_link`
  - `utm_campaign=user_referral`
  - `utm_content={referral_code}`

#### FR2.2: Link Sharing
- **Requirement**: Multiple sharing methods
- **Methods**:
  - Copy to clipboard
  - Email share
  - Social media (Twitter/X, Facebook, WhatsApp, LinkedIn)
  - SMS/Text message
  - Web Share API (mobile native)
- **Pre-filled Content**: Share text should include referral code and value proposition

#### FR2.3: Link Tracking
- **Requirement**: Track referral link clicks
- **Metrics**:
  - Click timestamp
  - Source platform
  - User agent
  - IP address (for basic fraud detection)
  - Geographic location (optional)
- **Storage**: Store in `referral_events` table with `event_type = 'click'`

### FR3: Referral Tracking

#### FR3.1: Waitlist Referrals
- **Requirement**: Track referrals from waitlist signups
- **Flow**:
  1. User clicks referral link with `?ref={CODE}`
  2. User enters email on waitlist form
  3. System validates referral code
  4. Creates waitlist entry with `referred_by` field
  5. Creates referral record in `referrals` table
  6. Increments referrer's `referral_count` in waitlist table
- **Completion**: When waitlist user converts to registered user

#### FR3.2: User Registration Referrals
- **Requirement**: Track referrals from user signups
- **Flow**:
  1. User clicks referral link
  2. User completes registration
  3. System validates referral code
  4. Creates referral record in `referrals` table (user-based)
  5. Sets `user_profiles.referred_by` field
  6. Increments referrer's `user_profiles.referral_count`
- **Completion**: When referred user completes onboarding

#### FR3.3: Referral Status Lifecycle
- **States** (MVP - simplified):
  - `pending`: Referral event created but not yet completed
  - `completed`: Referred user completed required action (signup or conversion)
  - `invalid`: Referral marked as fraudulent or invalid (self-referral, etc.)
- **Note**: `rewarded` and `expired` states out of MVP scope (no rewards system)
- **Transitions**: Only allow valid state transitions

#### FR3.4: Referral Record Creation
- **Requirement**: Create referral record when user signs up with code
- **Data Captured**:
  - Referrer user ID
  - Referred user ID (or email for waitlist)
  - Referral code used
  - Signup timestamp
  - Signup source (waitlist vs direct registration)
  - IP address
  - User agent
  - UTM parameters
  - Geographic location (if available)
- **Uniqueness**: One referral record per referrer-referee pair

### FR4: Referral Completion Criteria

#### FR4.1: Waitlist Completion
- **Requirement**: Define when waitlist referral is "completed"
- **Criteria**: Referred user converts from waitlist to registered user
- **Tracking**: Use `waitlist.converted_to` field to link waitlist entry to user profile

#### FR4.2: User Registration Completion
- **Requirement**: Define when user referral is "completed"
- **Criteria Options** (configurable):
  - User completes registration
  - User completes onboarding
  - User adds first item to collection
  - User completes first valuation
  - User makes first purchase
- **Default**: User completes onboarding

#### FR4.3: Completion Detection
- **Requirement**: Automatically detect when completion criteria is met
- **Methods**:
  - Database triggers on relevant events
  - Application-level checks during user actions
  - Background job to process pending referrals
- **Update**: Automatically update referral status to `completed`

### FR5: Analytics & Reporting (MVP Focus)

#### FR5.1: User Analytics
- **Requirement**: Track referral performance for individual users
- **Metrics**:
  - Total referral links generated
  - Total clicks on referral links
  - Click-through rate (CTR)
  - Conversion rate (clicks → signups)
  - Completion rate (signups → conversions)
  - Total referrals (signups)
  - Total conversions (waitlist → user)
- **Display**: 
  - Mobile App: Basic stats in Settings screen
  - Web: Full analytics on Referral dashboard
- **API**: `GET /api/v1/users/me/referral/stats`

#### FR5.2: Event Tracking
- **Requirement**: Track all referral-related events
- **Events**:
  - `referral_link_clicked` - When someone clicks referral link
  - `referral_signup` - When someone signs up with referral code
  - `referral_conversion` - When waitlist user converts to registered user
  - `referral_share` - When user shares their referral link
- **Storage**: `referral_events` table
- **API**: `GET /api/v1/users/me/referral/events`

#### FR5.3: System Analytics (Future)
- **Requirement**: Overall referral system performance (out of MVP scope)
- **Note**: Can be added later if needed

### FR6: Basic Fraud Prevention (MVP)

#### FR6.1: Self-Referral Prevention
- **Requirement**: Prevent users from referring themselves
- **Checks**:
  - Email address cannot match referrer's email
  - User ID cannot match referrer's user ID (if user already registered)
- **Action**: Silently ignore self-referral, proceed with signup without referral tracking
- **Note**: IP address checks and advanced fraud detection out of MVP scope

### FR7: User Interface

#### FR7.1: Mobile App Settings Integration (MVP Priority)
- **Requirement**: Display referral code in app settings screen
- **File**: `app/(tabs)/settings.tsx`
- **Components**:
  - New "Referral" section after Profile section
  - Referral code display (large, copyable)
  - Copy to clipboard button
  - Share button (opens share modal)
  - Basic stats (total referrals, if available)
- **API**: Fetch from `GET /api/v1/users/me/referral` on screen load

#### FR7.2: Referral Dashboard (Web)
- **Requirement**: User-facing dashboard to view referral stats
- **Components**:
  - Referral code display
  - Copy link button
  - Share buttons (social media)
  - Referral statistics:
    - Total clicks
    - Total signups
    - Conversion rate
    - Recent events
  - Referral list (recent referrals with status)
- **Location**: `/referral` page
- **API**: Fetch from `GET /api/v1/users/me/referral/stats`

#### FR7.2: Referral Landing Page
- **Requirement**: Public page for referral links
- **URL**: `/referral?code={CODE}` or `/waitlist?ref={CODE}`
- **Components**:
  - Referrer information (optional)
  - Value proposition
  - Sign up/Join waitlist form
  - Referral code pre-filled
  - Benefits of signing up
- **Analytics**: Track page views and conversions

#### FR7.3: Referral Modal
- **Requirement**: Modal to prompt users to share referral code
- **Triggers**:
  - After first valuation completed
  - After third item added
  - Manual trigger from settings
- **Components**:
  - Referral code
  - Copy link button
  - Social share buttons
  - Incentive messaging
  - Close/dismiss button

#### FR7.4: Referral Notifications (Future)
- **Requirement**: Notify users of referral events (out of MVP scope)
- **Note**: Can be added later if needed

### FR8: Analytics & Reporting

#### FR8.1: User Analytics
- **Requirement**: Track referral performance for individual users
- **Metrics**:
  - Total referral links generated
  - Total clicks on referral links
  - Click-through rate (CTR)
  - Conversion rate (clicks → signups)
  - Completion rate (signups → conversions)
  - Average time to conversion
- **Display**: Dashboard with charts and trends
- **Note**: Rewards metrics out of MVP scope

#### FR7.3: Referral Share Modal (Mobile App)
- **Requirement**: Modal for sharing referral code
- **File**: `components/referral/ReferralShareModal.tsx`
- **Components**:
  - Referral code display
  - Shareable link
  - Social share options (native share sheet)
  - Copy link button
  - Track share events when user shares

#### FR7.4: Referral Notifications (Future)
- **Requirement**: Notify users of referral events (out of MVP scope)
- **Note**: Can be added later if needed

## Technical Requirements

### TR1: Database Schema

#### TR1.1: Referral Events Table (MVP)
- **Requirement**: Unified table to track all referral activities
- **File**: `src/db/schema/users.ts`
- **Schema** (Drizzle ORM):
```typescript
export const referralEvents = pgTable('referral_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  referralCode: text('referral_code').notNull(),
  referrerUserId: uuid('referrer_user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // 'click', 'signup', 'conversion'
  source: text('source'), // 'waitlist' or 'registration'
  referredEmail: text('referred_email'),
  referredUserId: uuid('referred_user_id').references(() => userProfiles.id, { onDelete: 'set null' }),
  
  // Attribution
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmContent: text('utm_content'),
  referringUrl: text('referring_url'),
  
  // Timestamps
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  signedUpAt: timestamp('signed_up_at', { withTimezone: true }),
  convertedAt: timestamp('converted_at', { withTimezone: true }),
  
  // Metadata
  metadata: jsonb('metadata').default({}),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

#### TR1.2: Enhance Waitlist Entries
- **Requirement**: Add referral tracking to waitlist
- **File**: `src/db/schema/campaigns.ts`
- **Add fields**:
  - `referredByCode: text('referred_by_code')`
  - `referredByUserId: uuid('referred_by_user_id').references(() => userProfiles.id)`

#### TR1.3: Existing Tables (Keep As-Is)
- **`user_referrals`**: Already exists, contains referral codes
- **No rewards table needed** for MVP

#### TR1.4: Indexes
- **Requirement**: Optimize query performance
- **Indexes**:
  - `referral_events(referrer_user_id)`
  - `referral_events(referred_user_id)`
  - `referral_events(referral_code)`
  - `referral_events(event_type)`
  - `referral_events(created_at)`
  - `referral_events(referral_code, clicked_at)` - For click tracking queries
  - `waitlist_entries(referred_by_code)` - For waitlist referral lookups

#### TR1.5: Database Functions (Optional)
- **Requirement**: Server-side functions for referral operations (can be handled in application layer)
- **Functions** (if needed):
  - `validate_referral_code(code)` - Quick validation lookup
  - `get_referral_stats(user_id)` - Aggregated stats query
- **Note**: Reward distribution and advanced fraud detection functions out of MVP scope

### TR2: API Endpoints (MVP)

#### TR2.1: Public Endpoints
- **GET** `/api/v1/referral/validate?code={CODE}` - Validate referral code (returns code exists and is valid)
- **POST** `/api/v1/referral/track-click` - Track referral link click (public, no auth required)

#### TR2.2: Authenticated Endpoints
- **GET** `/api/v1/users/me/referral` - Get user's referral code and basic info
- **GET** `/api/v1/users/me/referral/stats` - Get user's referral analytics (clicks, signups, conversions, rates)
- **GET** `/api/v1/users/me/referral/events` - Get user's referral events list (with filters)
- **POST** `/api/v1/users/me/referral/share` - Generate share link and track share event

#### TR2.3: Admin Endpoints (Future)
- Admin endpoints out of MVP scope

### TR3: Frontend Components

#### TR3.1: ReferralDashboard Component (Web)
- **Location**: `src/components/referral/ReferralDashboard.tsx` (or enhance existing ReferralPage)
- **Props**: `userId: string`
- **Features**:
  - Display referral code
  - Copy link functionality
  - Share buttons
  - Statistics display (clicks, signups, conversions)
  - Recent events list
- **Note**: Reward summary out of MVP scope

#### TR3.2: ReferralModal Component
- **Location**: `src/components/referral/ReferralModal.tsx` (exists, enhance)
- **Props**: `open: boolean, onOpenChange: (open: boolean) => void, referralCode: string`
- **Features**:
  - Display referral code
  - Copy link
  - Social share buttons
  - Close button

#### TR3.3: ReferralStats Component
- **Location**: `src/components/referral/ReferralStats.tsx`
- **Props**: `stats: ReferralStats`
- **Features**:
  - Total referrals (signups)
  - Total clicks
  - Conversion rate (clicks → signups)
  - Completion rate (signups → conversions)
  - Charts/graphs (optional for MVP)
- **Note**: Rewards metrics out of MVP scope

#### TR3.4: ReferralList Component
- **Location**: `src/components/referral/ReferralList.tsx`
- **Props**: `referrals: Referral[], onViewDetails: (id: string) => void`
- **Features**:
  - List of referrals
  - Status badges
  - Timestamps
  - Filtering/sorting

### TR4: Background Jobs (Out of MVP Scope)

#### TR4.1: Referral Completion Checker (Future)
- **Requirement**: Periodically check for completed referrals
- **Note**: Can be handled synchronously in application layer for MVP
- **Future Enhancement**: Background job to process conversions

#### TR4.2: Reward Distributor (Out of Scope)
- **Requirement**: Distribute rewards for completed referrals
- **Status**: Out of MVP scope - no rewards system

#### TR4.3: Fraud Detection Scanner (Out of Scope)
- **Requirement**: Scan for fraudulent referral patterns
- **Status**: Out of MVP scope - basic self-referral check only

### TR5: Security Requirements

#### TR5.1: Rate Limiting
- **Requirement**: Prevent abuse of referral endpoints
- **Limits**:
  - Referral code validation: 100 requests/minute per IP
  - Referral creation: 10 requests/hour per user
  - Share tracking: 50 requests/hour per user

#### TR5.2: Input Validation
- **Requirement**: Validate all referral-related inputs
- **Validations**:
  - Referral codes: alphanumeric, 8 characters
  - Email addresses: valid format
  - User IDs: valid UUIDs
  - Status values: from allowed enum

#### TR5.3: Authorization
- **Requirement**: Ensure users can only access their own referral data
- **RLS Policies**:
  - Users can read their own referrals
  - Users can create referrals for themselves (as referee)
  - Admins can read all referrals
  - Public can validate referral codes (read-only)

## Non-Functional Requirements

### NFR1: Performance
- Referral code validation: < 100ms
- Referral creation: < 500ms
- Dashboard load: < 2 seconds
- Analytics queries: < 5 seconds

### NFR2: Scalability
- Support 10,000+ concurrent referral operations
- Handle 100,000+ referral records
- Efficient querying with proper indexing

### NFR3: Reliability
- 99.9% uptime for referral system
- No data loss on referral creation
- Idempotent event tracking
- Transaction safety for critical operations

### NFR4: Usability
- Referral code easy to copy (one click)
- Clear instructions for sharing
- Mobile-friendly interface
- Accessible (WCAG 2.1 AA)

### NFR5: Maintainability
- Well-documented code
- Comprehensive error logging
- Monitoring and alerting
- Easy configuration changes

## Edge Cases & Error Handling

### EC1: Invalid Referral Code
- **Scenario**: User enters invalid referral code
- **Handling**: Show clear error message, allow signup without code

### EC2: Self-Referral Attempt
- **Scenario**: User tries to use their own referral code
- **Handling**: Silently ignore, proceed with signup without referral

### EC3: Duplicate Referral
- **Scenario**: User signs up again with same referral code
- **Handling**: Return existing referral record, don't create duplicate

### EC4: Referrer Account Deleted
- **Scenario**: Referrer deletes account before referral completes
- **Handling**: Keep referral event record, analytics still trackable

### EC5: Referee Account Deleted
- **Scenario**: Referee deletes account after referral created
- **Handling**: Keep referral event record for analytics, mark as inactive

### EC6: Concurrent Referral Creation
- **Scenario**: Multiple referrals created simultaneously for same user
- **Handling**: Database unique constraint prevents duplicates

### EC7: API Failure During Tracking
- **Scenario**: API call fails when tracking referral event
- **Handling**: Log error, allow signup to proceed, retry tracking async if possible

## Testing Requirements (MVP)

### Test1: Unit Tests
- Referral code generation
- Code validation logic
- Event tracking functions
- Analytics aggregation

### Test2: Integration Tests
- Referral event creation flow
- Click tracking
- Signup tracking
- Conversion tracking
- API endpoints

### Test3: E2E Tests
- Complete referral flow (click → signup → conversion)
- Self-referral prevention
- Mobile app settings display
- Web referral page

### Test4: Performance Tests
- Load testing for referral creation
- Query performance with large datasets
- Concurrent referral handling

### Test5: Security Tests
- Rate limiting
- Authorization checks
- Input validation
- SQL injection prevention
- XSS prevention

## Migration Plan (MVP)

### Phase 1: Database Schema (metafan-core)
1. Create `referral_events` table
2. Add referral fields to `waitlist_entries` table (`referred_by_code`, `referred_by_user_id`)
3. Generate and run migration
4. Add indexes for performance

### Phase 2: Backend API (metafan-core)
1. Create referral events service (`referral-events.service.ts`)
2. Enhance existing referral service (add stats)
3. Add analytics service (`referral-analytics.service.ts`)
4. Implement API endpoints (stats, events, track-click, validate)
5. Update waitlist signup service to track referrals
6. Add conversion tracking (when waitlist → user)

### Phase 3: Web Integration (metafan-web)
1. Create referral tracking utility (`lib/referral-tracking.ts`)
2. Update waitlist signup edge function (handle referral codes)
3. Update WaitlistPage to track clicks on page load
4. Enhance ReferralPage with analytics display

### Phase 4: Analytics & Reporting (metafan-core)
1. Analytics service implementation
2. Analytics endpoints (`GET /api/v1/users/me/referral/analytics`)
3. Funnel metrics and trends

### Phase 5: Mobile App Integration (metafan-app) - **Priority**
1. Create referral API client (`lib/api/referral.ts`)
2. Add referral section to Settings screen (`app/(tabs)/settings.tsx`) - **MVP Priority**
3. Create share modal component (`components/referral/ReferralShareModal.tsx`)
4. Test referral code display and sharing

### Phase 6: Testing & Launch
1. Unit and integration tests
2. E2E testing across platforms
3. Performance check
4. Deploy to staging
5. User acceptance testing
6. Production rollout

## Success Metrics (MVP)

### Key Performance Indicators (KPIs)

1. **Referral Adoption Rate**: % of users who share referral code
   - Target: 30% of active users
   - Measurement: Track share events

2. **Click-Through Rate**: % of shares that result in clicks
   - Target: 20% CTR
   - Measurement: Clicks / Shares

3. **Signup Conversion Rate**: % of referral clicks that result in signups
   - Target: 15% conversion rate
   - Measurement: Signups / Clicks

4. **Conversion Rate**: % of signups that convert to registered users (waitlist → user)
   - Target: 60% conversion rate
   - Measurement: Conversions / Signups

5. **Viral Coefficient**: Average referrals per user
   - Target: 1.2 (each user brings 1.2 new users)
   - Measurement: Total referrals / Total users

6. **User Acquisition**: % of new users from referrals
   - Target: 40% of new signups
   - Measurement: Referral signups / Total signups

## Dependencies

### External Services
- Analytics service (Mixpanel/Google Analytics) - for event tracking
- IP geolocation service (optional, for future fraud detection)

### Internal Dependencies
- User authentication system (Supabase Auth)
- User profile system
- Waitlist system
- metafan-core API (for referral endpoints)
- metafan-web (for waitlist signup)
- metafan-app (for settings display)

## Risks & Mitigations (MVP)

### Risk1: System Overload
- **Risk**: High referral volume overwhelms system
- **Mitigation**: Rate limiting on API endpoints, efficient database queries with indexes

### Risk2: Poor User Experience
- **Risk**: Complex referral flow discourages users
- **Mitigation**: Simple UI, clear instructions, easy copy/share functionality

### Risk3: Data Inconsistency
- **Risk**: Referral data becomes inconsistent
- **Mitigation**: Database constraints, transaction safety, validation

### Risk4: Missing Analytics
- **Risk**: Not tracking enough data for insights
- **Mitigation**: Comprehensive event tracking, analytics endpoints, regular monitoring

### Risk5: Mobile App Integration Issues
- **Risk**: Referral code not visible or sharing doesn't work
- **Mitigation**: Priority testing on mobile, clear API integration, fallback handling

## Future Enhancements (Post-MVP)

### FE1: Reward System
- Platform credits/currency rewards
- Discount codes
- Feature unlocks
- Badges/achievements

### FE2: Advanced Fraud Prevention
- IP-based detection
- Rate limiting per user/IP
- Suspicious pattern detection
- Admin review interface

### FE3: Referral Campaigns
- Time-limited campaigns
- Special referral codes
- Bonus rewards

### FE4: Referral Leaderboard
- Public leaderboard of top referrers
- Gamification elements

### FE5: Email Notifications
- Referrer notifications (signup, conversion)
- Referee welcome emails
- Milestone notifications

### FE6: Admin Interface
- Referral management dashboard
- Fraud review interface
- System configuration
- Advanced analytics

### FE7: Multi-level Referrals
- 2nd level referrals
- Complex reward structures

## Appendix

### A1: Referral Code Generation Algorithm
```
1. Generate 8 random alphanumeric characters
2. Exclude ambiguous characters (0, O, 1, I, l)
3. Check uniqueness against database
4. If duplicate, regenerate
5. Store in user_profiles.referral_code
```

### A2: State Transition Diagram (MVP)
```
pending → completed
  ↓
invalid (self-referral, fraud, etc.)
```
**Note**: `rewarded` and `expired` states out of MVP scope

### A3: Analytics Aggregation Example
```
User Stats:
- Total Clicks: COUNT(*) WHERE event_type = 'click'
- Total Signups: COUNT(*) WHERE event_type = 'signup'
- Total Conversions: COUNT(*) WHERE event_type = 'conversion'
- Click-Through Rate: (clicks / shares) × 100
- Signup Conversion: (signups / clicks) × 100
- Conversion Rate: (conversions / signups) × 100
```

### A4: API Endpoints Summary
```
GET  /api/v1/users/me/referral              - Get referral code
GET  /api/v1/users/me/referral/stats        - Get analytics
GET  /api/v1/users/me/referral/events       - Get event list
POST /api/v1/users/me/referral/share         - Generate share link
POST /api/v1/referral/track-click           - Track click (public)
GET  /api/v1/referral/validate?code={code}  - Validate code (public)
```

---

**Document Status**: MVP Ready for Implementation  
**Version**: 1.0 MVP  
**Scope**: Analytics-focused referral tracking system  
**Out of Scope**: Rewards, advanced fraud prevention, admin interface, email notifications

**Next Steps**: 
1. ✅ PRD aligned with implementation plan
2. Begin Phase 1: Database schema implementation
3. **Priority**: Mobile app settings integration (Phase 5) - Users need to see their referral code


