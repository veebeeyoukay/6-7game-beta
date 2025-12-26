# 6-7 Game Brand Compliance Guide

> **Living Document** — Last updated: December 2024
>
> This document is the source of truth for brand consistency across all apps and platforms.
> All coding assistants and developers MUST reference this guide when making UI changes.

---

## Quick Reference

### Brand Colors (Copy-Paste Ready)

```
Deep Navy:      #1A1A2E   (backgrounds)
Electric Blue:  #4361EE   (CTAs, links)
Bright Teal:    #00D9FF   (success, accents)
Warm Gold:      #FFD700   (Mollars, rewards)
Soft White:     #F8F9FA   (text on dark)
Charcoal:       #2D2D2D   (text on light)
Magenta:        #E91E8C   (primary action)
Lime Green:     #7FFF00   (accents)
```

### Mollar Tier Colors

```
Bronze:   #B87333
Silver:   #C0C0C0
Gold:     #FFD700
Diamond:  #B9F2FF
```

---

## 1. Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Deep Navy** | `#1A1A2E` | `rgb(26, 26, 46)` | Primary backgrounds, headers, cards |
| **Electric Blue** | `#4361EE` | `rgb(67, 97, 238)` | CTAs, interactive elements, links, secondary buttons |
| **Bright Teal** | `#00D9FF` | `rgb(0, 217, 255)` | Success states, correct answers, accents, highlights |
| **Warm Gold** | `#FFD700` | `rgb(255, 215, 0)` | Mollars, achievements, rewards, currency displays |
| **Soft White** | `#F8F9FA` | `rgb(248, 249, 250)` | Text on dark backgrounds, cards on dark mode |
| **Charcoal** | `#2D2D2D` | `rgb(45, 45, 45)` | Body text on light backgrounds |

### Accent Colors (from Logo)

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Magenta** | `#E91E8C` | `rgb(233, 30, 140)` | Primary action buttons (the "7" in logo) |
| **Lime Green** | `#7FFF00` | `rgb(127, 255, 0)` | Secondary accents (the "6" in logo) |

### Mollar Tier Colors

| Tier | Hex | Usage |
|------|-----|-------|
| Bronze | `#B87333` | Entry-level Mollars |
| Silver | `#C0C0C0` | Mid-tier Mollars |
| Gold | `#FFD700` | Premium Mollars (same as Warm Gold) |
| Diamond | `#B9F2FF` | Elite Mollars |

### Semantic Color Mapping

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary Action (buttons) | Magenta | `#E91E8C` |
| Secondary Action | Electric Blue | `#4361EE` |
| Success / Correct | Bright Teal | `#00D9FF` |
| Error / Wrong | Magenta | `#E91E8C` |
| Warning | Warm Gold | `#FFD700` |
| Currency / Rewards | Warm Gold | `#FFD700` |
| Background (primary) | Deep Navy | `#1A1A2E` |
| Background (secondary) | `#252538` | Slightly lighter navy |
| Background (cards) | `#2A2A3E` | Card surfaces |
| Background (inputs) | `#333347` | Form inputs |
| Border (default) | `#3A3A4E` | Subtle borders |
| Text (primary) | Soft White | `#F8F9FA` |
| Text (secondary) | `#A0A0B0` | Muted text |
| Text (muted) | `#6B6B7B` | Disabled/hint text |

---

## 2. Typography

### Font Families

| Element | Font Family | Fallback |
|---------|-------------|----------|
| Headlines | Poppins / Montserrat | System Bold |
| Subheadlines | Poppins | System Semi-Bold |
| Body Text | Inter / Open Sans | System Regular |
| UI Labels | Inter | System Medium |
| Watch UI | SF Pro (system) | — |

### Font Sizes

| Element | Size | Weight |
|---------|------|--------|
| Title (large) | 32-40px | Bold (700) |
| Title | 28px | Bold (700) |
| Subtitle | 20-24px | Semi-Bold (600) |
| Body | 16-18px | Regular (400) |
| Label | 14px | Medium (500) |
| Caption | 12px | Regular (400) |

---

## 3. Spacing & Layout

### Spacing Scale

```
xs:   4px
sm:   8px
md:   12px
lg:   16px
xl:   20px
2xl:  24px
3xl:  32px
4xl:  40px
5xl:  48px
```

### Border Radius

```
none: 0
sm:   4px
md:   8px
lg:   12px
xl:   16px
2xl:  20px
full: 9999px (circular)
```

---

## 4. Platform-Specific Implementation

### Parent App (React Native)

**Import brand constants:**
```typescript
import { BrandColors, SemanticColors, BorderRadius, Spacing } from '../constants/brand';
```

**Key files:**
- `parent-app/constants/brand.ts` — Full design system
- `parent-app/constants/theme.ts` — Theme configuration

**Usage example:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.deepNavy,
    padding: Spacing.lg,
  },
  button: {
    backgroundColor: BrandColors.magenta,
    borderRadius: BorderRadius.lg,
  },
  text: {
    color: BrandColors.softWhite,
  },
});
```

### Watch App (SwiftUI)

**Import brand colors:**
```swift
// Colors are defined in Assets.xcassets and extended in BrandColors.swift
// Use directly as: Color.brandBlue, Color.brandMagenta, etc.
```

**Key files:**
- `watch-app/.../Assets.xcassets/Brand*.colorset/` — Color definitions
- `watch-app/.../BrandColors.swift` — Color extension

**Usage example:**
```swift
Text("Battle Mode")
    .background(Color.brandMagenta)
    .foregroundColor(.white)

Text("\(mollars) Mollars")
    .foregroundColor(.brandGold)
```

**Available color extensions:**
- `.brandNavy`, `.brandBlue`, `.brandTeal`, `.brandGold`
- `.brandMagenta`, `.brandGreen`
- `.mollarBronze`, `.mollarSilver`, `.mollarGold`, `.mollarDiamond`

---

## 5. Component Patterns

### Buttons

| Type | Background | Text Color | Border |
|------|------------|------------|--------|
| Primary | Magenta `#E91E8C` | White | None |
| Secondary | Electric Blue `#4361EE` | White | None |
| Success | Bright Teal `#00D9FF` | White | None |
| Outline | Transparent | Magenta | 1px Magenta |
| Ghost | Transparent | Electric Blue | None |

### Cards

```
Background: #2A2A3E (SemanticColors.backgroundCard)
Border: 1px #3A3A4E (SemanticColors.borderDefault)
Border Radius: 12px (BorderRadius.lg)
Padding: 16px (Spacing.lg)
```

### Inputs

```
Background: #333347 (SemanticColors.backgroundInput)
Border: 1px #3A3A4E
Border Radius: 8px
Padding: 12px
Text Color: Soft White
Placeholder Color: #6B6B7B
```

### Mollars Display

- Always use **Warm Gold** (`#FFD700`) for Mollar amounts
- Include currency emoji or icon: `💰` or `🏵️`
- Use tier-specific colors for Mollar tier badges

---

## 6. Do's and Don'ts

### DO ✅

- Use brand colors from the constants file, never hardcode hex values
- Use Magenta for primary action buttons (sign up, submit, start battle)
- Use Electric Blue for secondary actions and links
- Use Bright Teal for success states and correct answers
- Use Warm Gold for all currency/Mollar displays
- Keep backgrounds dark (Deep Navy) for the primary theme
- Maintain consistent spacing using the spacing scale

### DON'T ❌

- Use generic system colors (red, blue, green) — use brand equivalents
- Use pure black (`#000000`) for backgrounds — use Deep Navy
- Use pure white (`#FFFFFF`) for text — use Soft White
- Mix old hardcoded colors with brand colors
- Use different shades of the same color — stick to the palette
- Forget to update both apps when changing brand colors

---

## 7. Migration Checklist

When updating a screen to brand compliance:

- [ ] Import brand constants at the top of the file
- [ ] Replace all hardcoded background colors with `BrandColors.deepNavy`
- [ ] Replace all text colors with `BrandColors.softWhite` or `SemanticColors.textSecondary`
- [ ] Replace button colors with `BrandColors.magenta` (primary) or `BrandColors.electricBlue` (secondary)
- [ ] Replace success colors with `BrandColors.brightTeal`
- [ ] Replace error colors with `BrandColors.magenta`
- [ ] Replace gold/currency colors with `BrandColors.warmGold`
- [ ] Replace spacing values with `Spacing.*` constants
- [ ] Replace border radius values with `BorderRadius.*` constants
- [ ] Test in both light and dark modes (if applicable)

---

## 8. Related Documents

- `6-7-game-creative-brief.md` — Full marketing and brand guidelines
- `parent-app/constants/brand.ts` — React Native design system
- `watch-app/.../BrandColors.swift` — SwiftUI color definitions

---

## 9. Version History

| Date | Version | Changes |
|------|---------|---------|
| Dec 2024 | 1.0 | Initial brand compliance guide created |

---

**Questions?** Reference the creative brief or check the implementation in the constants files.
