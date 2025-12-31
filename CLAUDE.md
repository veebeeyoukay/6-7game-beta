# Claude Code Instructions for 6-7 Game

> Instructions for AI coding assistants working on this project.

---

## Project Overview

The 6-7 Game is a gamified parenting and education platform with:
- **Parent App** (`parent-app/`) — React Native/Expo (TypeScript)
- **Watch App** (`watch-app/`) — Native SwiftUI (watchOS)
- **Backend** (`supabase/`) — PostgreSQL + Edge Functions

---

## Critical Documents to Reference

### 1. Brand Compliance (REQUIRED)

**Before making ANY UI changes, read:**
- **[`brand-compliance.md`](./brand-compliance.md)** — Brand colors, typography, spacing, component patterns

**Key rules:**
- NEVER hardcode colors — use brand constants
- Import from `constants/brand.ts` (parent-app) or use `Color.brand*` (watch-app)
- Primary action = Magenta (`#E91E8C`)
- Secondary action = Electric Blue (`#4361EE`)
- Success = Bright Teal (`#00D9FF`)
- Currency/Mollars = Warm Gold (`#FFD700`)
- Backgrounds = Deep Navy (`#1A1A2E`)

### 2. Product Requirements

- **[`the-67-game-mvp-prd-v2.md`](./the-67-game-mvp-prd-v2.md)** — Full PRD
- **[`6-7-game-creative-brief.md`](./6-7-game-creative-brief.md)** — Brand voice, messaging, visual identity
- **[`_ai_wk/planning/phase-2-plan.md`](./_ai_wk/planning/phase-2-plan.md)** — Development roadmap

### 3. Backlog

- **[`backlog.md`](./backlog.md)** — Legacy backlog (see `_ai_wk/todos.md` for active todos)

---

## Code Patterns

### Parent App (React Native)

```typescript
// Always import brand constants
import { BrandColors, SemanticColors, BorderRadius, Spacing } from '../constants/brand';

// Use in styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.deepNavy,
    padding: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: BrandColors.magenta,
    borderRadius: BorderRadius.lg,
  },
});
```

### Watch App (SwiftUI)

```swift
// Brand colors are available as Color extensions
Text("Battle")
    .background(Color.brandMagenta)
    .foregroundColor(.white)

Text("\(mollars) Mollars")
    .foregroundColor(.brandGold)
```

---

## File Structure

```
6-7game-beta/
├── parent-app/           # React Native/Expo app
│   ├── app/              # Expo Router pages
│   ├── components/       # Reusable components
│   ├── constants/        # Theme, brand, config
│   │   ├── brand.ts      # Design system (colors, spacing, etc.)
│   │   └── theme.ts      # Theme configuration
│   └── lib/              # Utilities, Supabase client
├── watch-app/            # SwiftUI Watch app
│   └── the6-7game/
│       └── the6-7game Watch App/
│           ├── Assets.xcassets/  # Color assets
│           ├── BrandColors.swift # Color extension
│           └── *.swift           # Views
├── supabase/             # Backend
│   ├── migrations/       # SQL migrations
│   └── functions/        # Edge functions
├── images/               # Brand assets (logos, etc.)
├── brand-compliance.md   # Brand guide (READ THIS)
├── CLAUDE.md             # This file
└── README.md             # Project overview
```

---

## Common Tasks

### Adding a New Screen

1. Read `brand-compliance.md` for color/spacing requirements
2. Import brand constants
3. Use semantic colors (e.g., `SemanticColors.backgroundCard`)
4. Follow existing screen patterns

### Updating Colors

1. Update `parent-app/constants/brand.ts`
2. Update `watch-app/.../Assets.xcassets/Brand*.colorset/`
3. Update `watch-app/.../BrandColors.swift`
4. Update `brand-compliance.md`

### Database Changes

1. Create migration in `supabase/migrations/`
2. Test RLS policies (multi-parent support is critical)
3. Run `npx supabase db push`

---

## Testing

### Parent App
```bash
cd parent-app
npm run lint
npx expo start -c
```

### Watch App
1. Open in Xcode
2. Select Watch App target
3. Run on simulator (Cmd + R)

---

## GitHub Workflow

- Create issues for non-trivial work
- Reference issue numbers in commits
- PR to `main` branch

---

## Questions?

Check these docs in order:
1. `brand-compliance.md` — UI/brand questions
2. `the-67-game-mvp-prd-v2.md` — Feature questions
3. `README.md` — Setup questions
