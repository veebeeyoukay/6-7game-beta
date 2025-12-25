# Backlog

## Phase 2A: Core Polish & Watch App Logic
- [ ] **Data Source Config:**
    - [ ] Verify `preview-questions` with `curl` (Blocked by API Key in previous status, need to confirm verified).
- [ ] **Multiple Choice on Watch (UI):**
    - [ ] Replace keyboard input with 2x2 grid of options.
    - [ ] Implement tap-to-select interaction.
    - [ ] Feedback animations (Success/Fail).
- [ ] **Answer Generation Logic:**
    - [ ] Create logic to generate 3 distractors along with the correct answer.
    - [ ] Ensure distractors are plausible (e.g., close numbers for math).

## Phase 2E: Referral Engine
- [ ] **Referral Logic (Edge Functions):**
    - [ ] Implement `track-referral-click` function.
    - [ ] Implement `process-referral-signup` function.
    - [ ] Verify credits/mollars are awarded correctly.

## Phase 2D: Monetization (Subscription & Store)
- [ ] **Subscription Paywall:**
    - [ ] Design Paywall UI.
    - [ ] Integrate RevenueCat or similar (or native IAP).
    - [ ] Logic for locking/unlocking features.
- [ ] **In-Game Store:**
    - [ ] Store UI (Mollar redemption).
    - [ ] Inventory management.

## Technical Debt & Infrastructure
- [ ] **RLS Policy Enhancements:**
    - [ ] Update RLS policies to allow `family_members` (not just `created_by`) to view/edit family data.
    - [ ] Ensure "Spouse" role works correctly.
- [ ] **Linting:**
    - [ ] Fix `expo-router` pathing lint errors.
    - [ ] Fix `pickerStyle` issue in Watch App (SegmentedPickerStyle substitution).

## Deferred / Icebox
- [ ] **Visual Pairing:** Deferred in favor of Code Pairing.
