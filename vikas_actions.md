# Next Steps for Vikas

## 🚀 Immediate Action Items

### 1. Build and Run the Watch App
Since you are on a Mac, you need to use Xcode to build the Watch App.

1.  **Open Xcode**.
2.  Create a **New Project**:
    *   Platform: **watchOS**
    *   Application: **App**
    *   Product Name: `the6-7game`
    *   Organization Identifier: `net.metafan`
3.  **Import Code**:
    *   Right-click the `the6-7game Watch App` folder in Xcode.
    *   Select "Add Files to..." and select all swift files from:
        `/Users/vikasbhatia/dev-mm4/6-7game-beta/watch-app/The67Game Watch App/`
    *   *Important:* When asked, choose **"Replace"** if files exist, or delete the default `ContentView.swift` and `the6_7gameApp.swift` created by Xcode first to avoid conflicts.
4.  **Run**: Select a Watch Simulator (e.g., Apple Watch Series 10) and press Play (`Cmd+R`).

### 2. Verify Paring Flow
1.  **Parent App**: Go to Dashboard -> Add Child -> Create a dummy child -> Note the **Pairing Code** (Tap the child card).
2.  **Watch App**: Enter that 6-digit code.
3.  **Success**: The Watch should switch to the Main Menu.

### 3. Test a Battle
1.  **Parent App**: Select "Create Battle" -> Choose the child -> Start.
2.  **Watch App**: Go to "Battle Mode" (In the MVP, this checks for active battles).

---

## ✅ Completed Setup (Reference)

*   **Repo**: `https://github.com/veebeeyoukay/6-7game-beta.git`
*   **Supabase Project**: `nxdcttkyegnwnjnnjjqg`
*   **Parent App Bundle ID**: `6-7game-beta.metafan.net`
*   **Dependencies**: installed `react-native-url-polyfill` to fix launch crashes.
