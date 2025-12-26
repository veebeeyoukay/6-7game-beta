# The 6-7 Game (Beta)

**The 6-7 Game** is a comprehensive gamified parenting and education platform. It turns math practice and daily chores into a "Mollar" economy, allowing 2nd-5th graders to earn currency through learning and validated behavior.

## 🏗️ Architecture & Tech Stack

This project is a **monorepo** containing the complete ecosystem:

*   **Parent App (`parent-app/`)**:
    *   **Framework**: React Native with **Expo** (TypeScript).
    *   **Routing**: Expo Router (File-based routing).
    *   **Key Features**: Family Dashboard, Child Management, Calendar (Mustard/Ketchup/Pickle taxes), Referral Dashboard.
*   **Watch App (`watch-app/`)**:
    *   **Framework**: Native **SwiftUI** (WatchOS).
    *   **Key Features**: 2x2 Math Grid, Smart Distractors, Interactive Avatar, Time Overlay.
*   **Backend (`supabase/`)**:
    *   **Database**: PostgreSQL with extensive **Row Level Security (RLS)** for multi-parent/family privacy.
    *   **Edge Functions**: Deno/TypeScript.
        *   `preview-questions`: Generates math problems using **Google Gemini 2.0 Flash**.
        *   `track-referral`: Handles viral growth loops.
    *   **Auth**: Supabase Auth (Email/Password).

## 🚀 Key Features (Dev Status)

### 1. Family Ecosystem
*   **Multi-Parent Support**: Supports multiple adults (`role='adult'`) managing a single family via shared RLS policies.
*   **Child Accounts**: Managed profiles with grade-level settings and device pairing.
*   **Onboarding**: Multi-step wizard collecting Profile, KYC (placeholder), and Family Setup.

### 2. The Game (Watch App)
*   **Math Logic**: Custom `GameLogic` engine generating grade-appropriate questions.
*   **Smart Distractors**: Algorithmically generates plausible wrong answers (e.g., close numbers, transpositions) to test mastery.
*   **UI**: Kid-friendly 2x2 grid with haptic feedback and persistent time visibility.

### 3. Productivity & Calendar
*   **Task Taxonomy**:
    *   **Mustard**: Must-do items (High priority).
    *   **Ketchup**: Catch-up items (Overdue).
    *   **Pickle**: Pickle-your-task (Optional/Fun).
*   **Validation**: Parents receive logic-based requests to validate task completion.

### 4. Viral Growth
*   **Referral Engine**: DB Triggers automatically reward referrers when new users complete onboarding.
*   **Tracking**: Dedicated `referral_events` table and dashboard.

## 🛠️ Developer Setup

### Prerequisites
*   Node.js 18+
*   Xcode 15+ (for Watch App)
*   Supabase CLI

### 1. Setup Parent App
```bash
cd parent-app
npm install
npx expo start -c
```
*Use the `setup_backend.sh` script to sync your local environment variables.*

### 2. Setup Watch App
1.  Open `watch-app/the6-7game/the6-7game.xcodeproj` in **Xcode**.
2.  Select the **Watch App** target.
3.  Choose a Simulator (e.g., Apple Watch Series 9).
4.  Run (`Cmd + R`).

### 3. Backend Management
```bash
# Push migrations to remote
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy preview-questions --no-verify-jwt
npx supabase functions deploy track-referral --no-verify-jwt
```

## 🔐 Environment Variables

The project uses a standard `.env` file in `parent-app/` for frontend keys and Supabase Secrets for backend keys.

**Critical Secrets:**
*   `GOOGLE_API_KEY`: Required for Gemini AI generation.
*   `SUPABASE_SERVICE_ROLE_KEY`: Required for admin tasks in Edge Functions.

## 📜 License

Copyright © MetaFan. All rights reserved.
