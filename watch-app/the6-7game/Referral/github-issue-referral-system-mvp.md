# GitHub Issue: Referral System MVP

## Title
Implement Referral System MVP - Analytics & Viral Growth Tracking

## Labels
- `feature`
- `mvp`
- `analytics`
- `cross-platform`
- `priority: high`

## Description

Implement a minimal viable referral system focused on **analytics and viral growth**. This MVP tracks referral events (clicks, signups, conversions) across waitlist and user registration flows, provides analytics endpoints, and enables easy sharing. **No reward system is included in MVP** - the focus is on tracking, analytics, and enabling viral growth through easy sharing.

## Objectives

1. **Analytics First**: Track all referral events for insights and optimization
2. **Viral Growth**: Enable users to easily share MetaFan with friends and family
3. **User Acquisition**: Convert referrals into active registered users
4. **Cross-Platform**: Works seamlessly across metafan-core (API), metafan-web, and metafan-app
5. **Simple & Fast**: Minimal complexity to get to market quickly for testing

## Documentation

- **PRD**: [`_aiwk/docs/referral-system-prd.md`](_aiwk/docs/referral-system-prd.md)
- **Implementation Plan**: [`_aiwk/plans/referral-system-mvp-plan.md`](_aiwk/plans/referral-system-mvp-plan.md)

## Key Requirements

### Database
- Create `referral_events` table for unified tracking
- Add referral fields to `waitlist_entries` table
- Keep existing `user_referrals` table as-is

### Backend API (metafan-core)
- Referral events service for tracking clicks, signups, conversions
- Analytics service for aggregated stats
- API endpoints:
  - `GET /api/v1/users/me/referral/stats` - User analytics
  - `GET /api/v1/users/me/referral/events` - Event list
  - `POST /api/v1/referral/track-click` - Public click tracking
  - `GET /api/v1/referral/validate?code={code}` - Public validation

### Web Integration (metafan-web)
- Referral tracking utility
- Update waitlist signup to handle referral codes
- Track referral clicks on WaitlistPage
- Enhance ReferralPage with analytics

### Mobile App (metafan-app) - **Priority**
- Referral API client
- **Add referral section to Settings screen** - Users need to see their code
- Share modal component

## Out of Scope (MVP)

- Reward/incentive system
- Advanced fraud prevention (beyond basic self-referral check)
- Admin interface
- Email notifications
- Background jobs for reward distribution

## Success Metrics

1. Referral Adoption Rate: % of users who share
2. Click-Through Rate: Clicks / shares
3. Signup Conversion Rate: Signups / clicks
4. Viral Coefficient: Avg referrals per user
5. Top Channels: Which sharing methods work best

## Implementation Phases

1. **Phase 1**: Database schema
2. **Phase 2**: Backend API
3. **Phase 3**: Web integration
4. **Phase 4**: Analytics & reporting
5. **Phase 5**: Mobile app integration (Priority: Settings screen)

## Acceptance Criteria

- [ ] Users can view their referral code in mobile app settings
- [ ] Referral link clicks are tracked
- [ ] Waitlist signups with referral codes are tracked
- [ ] User registrations with referral codes are tracked
- [ ] Waitlist → user conversions are tracked
- [ ] Analytics endpoints return accurate stats
- [ ] Self-referral attempts are prevented
- [ ] Referral code validation works
- [ ] Share functionality works on mobile and web

## Related Issues

- None

## Notes

- Focus on analytics, not rewards
- Keep it simple and fast to market
- Mobile settings integration is highest priority

