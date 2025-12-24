# The 6-7 Game (Beta)

**The 6-7 Game** is a math learning ecosystem designed to help 2nd-5th graders master multiplication facts through gamified practice and battles.

## Project Structure

*   **`parent-app/`**: React Native (Expo) application for parents.
    *   Manage family and children.
    *   Monitor progress and Mollar balance.
    *   Configure battles and pairing.
*   **`watch-app/`**: Swift (WatchOS) application for children.
    *   Pairing with Parent App.
    *   Math practice mode.
    *   Real-time battles.
*   **`supabase/`**: Backend infrastructure.
    *   Database schema and migrations.
    *   Edge Functions (AI question generation, battle logic).

## Getting Started

### 1. Parent App (Parent/Admin)

The Parent App is built with Expo.

**Prerequisites:**
*   Node.js & npm
*   Expo Go app on your phone (or a Simulator)

**Run the App:**
```bash
cd parent-app
npm install
npx expo start -c
```
Scan the QR code with your phone.

### 2. Watch App (Child/Player)

The Watch App is a native SwiftUI app for Apple Watch.

**Prerequisites:**
*   Mac with Xcode installed.

**Build Instructions:**
1.  Open Xcode.
2.  Create a new project in Xcode with the Product Name **"the6-7game"** (Watch-only App).
    *   Organization Identifier: `net.metafan`
    *   Point the project location to `6-7game-beta/watch-app/`.
3.  Drag the **`Services` folder** and all **Swift files** from `watch-app/The67Game Watch App/` into your new Xcode project group.
    *   **Important:** Select "Copy items if needed".
    *   Replace any default files (like `ContentView.swift` or `the6_7gameApp.swift`) if prompted.
4.  Select a Watch Simulator and run (`Cmd + R`).

### 3. Backend (Supabase)

The backend is hosted on Supabase.
*   **URL**: `https://nxdcttkyegnwnjnnjjqg.supabase.co`
*   **Migrations**: Managed via `supabase/migrations`.
*   **Edge Functions**: Deployed to Supabase.

## Features (MVP)

*   **Authentication**: Email/Password login for parents.
*   **Family Management**: Add children and generate pairing codes.
    *   *Includes "Pull to Refresh" to update connection status.*
*   **Pairing**: Securely link Watch App to Parent Account via 6-digit PIN.
*   **Practice Mode**: Answer fast-paced math questions on the watch.
*   **Battles**: Parent vs. Child async math battles (MVP logic).

## License

Copyright © MetaFan. All rights reserved.
