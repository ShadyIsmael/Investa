import { createTheme } from '@mui/material/styles';
import { colors, typography, spacing, borderRadius, shadows } from './styles/designTokens';

const commonPalette = {
  primary: {
    main: colors.semantic.primary,
  },
  secondary: {
    main: colors.semantic.accent,
  },
  error: {
    main: colors.semantic.error,
  },
  warning: {
    main: colors.semantic.warning,
  },
  info: {
    main: colors.semantic.info,
  },
  success: {
    main: colors.semantic.success,
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...commonPalette,
    background: {
      default: colors.light.background,
      paper: colors.light.surface,
    },
    text: {
      primary: colors.light.text,
      secondary: colors.light.textSecondary,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.base,
    ...typography.fontSize,
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  shape: {
    borderRadius: parseFloat(borderRadius.md),
  },
  shadows: Object.values(shadows.light) as any,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...commonPalette,
    primary: {
        main: colors.semantic.primaryDark,
    },
    background: {
      default: colors.dark.background,
      paper: colors.dark.surface,
    },
    text: {
      primary: colors.dark.text,
      secondary: colors.dark.textSecondary,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.base,
    ...typography.fontSize,
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  shape: {
    borderRadius: parseFloat(borderRadius.md),
  },
  shadows: Object.values(shadows.dark) as any,
});
