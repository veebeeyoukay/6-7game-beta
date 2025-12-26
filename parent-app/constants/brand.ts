/**
 * 6-7 Game Brand Design System
 *
 * Centralized brand tokens for consistent UI across the app.
 * Based on the official creative brief and logo design.
 */

// =============================================================================
// BRAND COLORS
// =============================================================================

export const BrandColors = {
  // Primary Palette (from Creative Brief)
  deepNavy: '#1A1A2E',      // Primary backgrounds, headers
  electricBlue: '#4361EE',  // CTAs, interactive elements, links
  brightTeal: '#00D9FF',    // Accents, highlights, success states
  warmGold: '#FFD700',      // Mollars, achievements, rewards
  softWhite: '#F8F9FA',     // Text on dark backgrounds, cards
  charcoal: '#2D2D2D',      // Body text on light backgrounds

  // Accent Colors (from Logo)
  magenta: '#E91E8C',       // Primary action (the "7" in logo)
  limeGreen: '#7FFF00',     // Accents (the "6" in logo)

  // Mollar Tier Colors
  mollarBronze: '#B87333',
  mollarSilver: '#C0C0C0',
  mollarGold: '#FFD700',
  mollarDiamond: '#B9F2FF',

  // UI Utility Colors
  error: '#FF4444',
  success: '#00D9FF',       // Same as brightTeal
  warning: '#FFD700',       // Same as warmGold

  // Transparency variants
  navyTransparent: 'rgba(26, 26, 46, 0.9)',
  overlayDark: 'rgba(0, 0, 0, 0.5)',
} as const;

// =============================================================================
// SEMANTIC COLOR MAPPING
// =============================================================================

export const SemanticColors = {
  // Backgrounds
  backgroundPrimary: BrandColors.deepNavy,
  backgroundSecondary: '#252538', // Slightly lighter navy
  backgroundCard: '#2A2A3E',
  backgroundInput: '#333347',

  // Text
  textPrimary: BrandColors.softWhite,
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B7B',
  textOnLight: BrandColors.charcoal,

  // Interactive Elements
  buttonPrimary: BrandColors.magenta,
  buttonSecondary: BrandColors.electricBlue,
  buttonSuccess: BrandColors.brightTeal,

  // Borders
  borderDefault: '#3A3A4E',
  borderFocus: BrandColors.electricBlue,
  borderError: BrandColors.error,

  // Currency & Rewards
  mollars: BrandColors.warmGold,

  // Status
  statusActive: BrandColors.brightTeal,
  statusInactive: '#6B6B7B',
  statusBattle: BrandColors.magenta,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const Typography = {
  // Font families (system fonts for now, Poppins/Inter as future enhancement)
  fontFamily: {
    heading: 'System',      // TODO: Replace with Poppins/Montserrat
    body: 'System',         // TODO: Replace with Inter/Open Sans
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// =============================================================================
// COMPONENT STYLES
// =============================================================================

export const ComponentStyles = {
  // Card styling
  card: {
    backgroundColor: SemanticColors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.borderDefault,
  },

  // Primary button
  buttonPrimary: {
    backgroundColor: SemanticColors.buttonPrimary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  // Secondary button
  buttonSecondary: {
    backgroundColor: SemanticColors.buttonSecondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  // Input field
  input: {
    backgroundColor: SemanticColors.backgroundInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: SemanticColors.borderDefault,
    padding: Spacing.md,
    color: SemanticColors.textPrimary,
  },
} as const;

// =============================================================================
// MOLLAR DISPLAY STYLES
// =============================================================================

export const getMollarTierColor = (tier: 'bronze' | 'silver' | 'gold' | 'diamond'): string => {
  const colors = {
    bronze: BrandColors.mollarBronze,
    silver: BrandColors.mollarSilver,
    gold: BrandColors.mollarGold,
    diamond: BrandColors.mollarDiamond,
  };
  return colors[tier];
};

// =============================================================================
// EXPORT DEFAULT THEME OBJECT
// =============================================================================

export const Brand = {
  colors: BrandColors,
  semantic: SemanticColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  components: ComponentStyles,
} as const;

export default Brand;
