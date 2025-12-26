/**
 * Theme colors for the 6-7 Game app.
 * Uses brand colors from brand.ts for consistency.
 *
 * For the full brand design system, see: constants/brand.ts
 */

import { Platform } from 'react-native';
import { BrandColors, SemanticColors } from './brand';

// Brand-aligned tint colors
const tintColorLight = BrandColors.electricBlue;
const tintColorDark = BrandColors.brightTeal;

export const Colors = {
  light: {
    text: BrandColors.charcoal,
    background: BrandColors.softWhite,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Brand extensions
    primary: BrandColors.magenta,
    secondary: BrandColors.electricBlue,
    accent: BrandColors.brightTeal,
    gold: BrandColors.warmGold,
  },
  dark: {
    text: BrandColors.softWhite,
    background: BrandColors.deepNavy,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Brand extensions
    primary: BrandColors.magenta,
    secondary: BrandColors.electricBlue,
    accent: BrandColors.brightTeal,
    gold: BrandColors.warmGold,
    // Semantic shortcuts
    card: SemanticColors.backgroundCard,
    input: SemanticColors.backgroundInput,
    border: SemanticColors.borderDefault,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
