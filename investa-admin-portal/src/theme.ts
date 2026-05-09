/**
 * Theme config – Investa Admin Portal (Zinc Slate)
 *
 * MUI is NOT installed. This file exposes strongly-typed theme constants
 * that can be consumed by any component or charting library.
 *
 * For MUI integration, install @mui/material and uncomment the
 * createTheme blocks at the bottom.
 */
import { colors, typography, borderRadius, shadows } from './styles/designTokens';

export type ThemeMode = 'light' | 'dark';

/** Resolved palette for the given mode — ready to pass to Recharts, etc. */
export function getThemePalette(mode: ThemeMode) {
  const c = mode === 'dark' ? colors.dark : colors.light;
  return {
    background:    c.background,
    surface:       c.surface,
    surfaceHover:  c.surfaceHover,
    border:        c.border,
    text:          c.text,
    textSecondary: c.textSecondary,
    textMuted:     c.textMuted,
    primary:       mode === 'dark' ? colors.semantic.primaryDark : colors.semantic.primary,
    accent:        mode === 'dark' ? colors.semantic.accentDark  : colors.semantic.accent,
    success:       mode === 'dark' ? colors.semantic.successDark : colors.semantic.success,
    error:         mode === 'dark' ? colors.semantic.errorDark   : colors.semantic.error,
    warning:       mode === 'dark' ? colors.semantic.warningDark : colors.semantic.warning,
    info:          mode === 'dark' ? colors.semantic.infoDark    : colors.semantic.info,
    shadows:       mode === 'dark' ? shadows.dark                : shadows.light,
    fontFamily:    typography.fontFamily.base,
    borderRadius,
  };
}

export const lightPalette = getThemePalette('light');
export const darkPalette  = getThemePalette('dark');
