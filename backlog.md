# Backlog

## 🚀 Active Sprint / In Progress

### Infrastructure & Developer Experience
- [ ] **Sync Conversation History:**
    - [ ] Research/Implement solution to sync AI agent conversation history across machines (`.gemini/brain` sync).
- [ ] **Decommissioning Legacy Repo:**
    - [ ] Finalize documentation in `_aiwk/decom/` (Core, Admin, Web, App).
    - [ ] Create `README.md` and `web_copy.md` (Drafts exist, need final review).
- [ ] **Apple Developer Setup:**
    - [ ] Configure App IDs, Certificates, and Provisioning Profiles for iOS and Watch App.
    - [ ] Verify Xcode build settings for both targets.
- [ ] **Android Build Fix:**
    - [ ] Resolve `AAPT: error: file failed to compile` (metafanapplogo.png).
    - [ ] Verify successful `eas build --platform android`.

### Parent App (iOS/Android)
- [/] **Onboarding UI/UX Refactor:**
    - [x] Integrate `useSafeAreaInsets` in `children.tsx` (Completed).
    - [x] Implement `ChildListItem` with masked pairing code (Completed).
    - [ ] *Validation:* Verify visual layout on notch devices (Simulation/TestFlight) (Linear: MET-91).

### Watch App (SwiftUI)
- [ ] **Build & Debug:**
    - [ ] Resolve Xcode visibility issues (Code not showing/syncing) (Linear: MET-92).
    - [ ] Confirm Watch App connects to Supabase/API correctly (Linear: MET-93).
- [ ] **Gameplay UI:** (Linear: MET-94)
    - [ ] Implement 2x2 Grid for multiple choice answers.
    - [ ] Add tap-to-select interactions and success/fail animations.

---

## 📅 Roadmap: Phase 2A (Core Polish & Logic)

### Backend / Edge Functions
- [ ] **Question Generation:**
    - [ ] Verify `preview-questions` endpoint with `curl` (Linear: MET-95).
    - [ ] Implement AI logic for "Smart Distractors" (plausible wrong answers) (Linear: MET-96).
- [ ] **RLS & Security:**
    - [ ] Update RLS to allow Spouses/Admins to manage shared Family data (Linear: MET-97).
    - [ ] Audit `family_members` table policies.

---

## 📅 Roadmap: Phase 2E (Referral Engine)
- [ ] **Referral Logic:** (Linear: MET-98)
    - [ ] `track-referral-click` edge function.
    - [ ] `process-referral-signup` edge function.
    - [ ] Credit/Mollar attribution logic.

---

## 📅 Roadmap: Phase 2D (Monetization)
- [ ] **Subscription & Store:**
    - [ ] Subscriptions: RevenueCat integration (or native IAP) for Premium features.
    - [ ] Store: Mollar redemption UI and Inventory system.

---

## 🧹 Technical Debt / Maintenance
- [ ] **Linting & Code Quality:**
    - [ ] Fix `expo-router` pathing lint errors.
    - [ ] `pickerStyle` deprecation fix in Watch App.
- [ ] **Visual Pairing:**
    - [ ] (Deferred) Consider QR code pairing if manual code entry is too high friction.
