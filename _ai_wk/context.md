# 6-7 Game App: Context

**Last Updated:** December 2024

## Repository Purpose

This repository contains the main application ecosystem for The 6-7 Game:
- **Parent App**: React Native/Expo mobile app (iOS/Android)
- **Watch App**: Native SwiftUI Apple Watch companion
- **Backend**: Supabase database, migrations, and edge functions

## Tech Stack

### Parent App (`parent-app/`)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **State Management**: React Context + Hooks
- **Backend**: Supabase client

### Watch App (`watch-app/`)
- **Framework**: SwiftUI
- **Language**: Swift
- **Platform**: watchOS
- **Backend**: Supabase REST API

### Backend (`supabase/`)
- **Database**: PostgreSQL
- **Migrations**: SQL files in `migrations/`
- **Edge Functions**: Deno/TypeScript in `functions/`
- **Auth**: Supabase Auth

## Key Features

1. **Family Management**: Multi-parent support, child profiles, onboarding
2. **Math Battles**: Watch app game with grade-appropriate questions
3. **Task Validation**: Mustard/Ketchup/Pickle calendar system
4. **Referral System**: Viral growth with automatic rewards

## Documentation Structure

- **Planning**: `_ai_wk/planning/` - Implementation plans, gap analysis
- **Architecture**: `_ai_wk/architecture/` - Technical architecture docs
- **Development**: `_ai_wk/dev/` - Development notes and summaries
- **Todos**: `_ai_wk/todos.md` - Current backlog and tasks

## Active Reference Files (Root)

These files are kept in the repo root for quick access during development:
- `CLAUDE.md` - AI coding assistant instructions
- `brand-compliance.md` - Quick brand reference (links to consolidated guide)
- `6-7-game-creative-brief.md` - Creative guidelines
- `the-67-game-mvp-prd-v2.md` - Product requirements
- `backlog.md` - Active backlog (being migrated to `_ai_wk/todos.md`)

## Development Setup

See `README.md` in repo root for full setup instructions.

Quick start:
```bash
cd parent-app
npm install
npx expo start -c
```

## Key Directories

- `parent-app/` - React Native app source
- `watch-app/` - SwiftUI watch app source
- `supabase/` - Database and edge functions
- `images/` - Brand assets
- `n8n-workflows/` - Automation workflows

## Related Documentation

- **Project-level**: `../../_ai_wk/` (parent directory)
- **Brand guide**: `../../_ai_wk/reference/brand-guide.md`
- **Website integration**: `../6-7game-web/_ai_wk/planning/integration-guide.md`

