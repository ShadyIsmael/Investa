/**
 * ============================================================================
 * Design Tokens - Investa Admin Portal
 * ============================================================================
 * Centralized design system constants for colors, spacing, z-index, shadows,
 * typography, and transitions. Import and use these tokens throughout the app
 * for consistent styling and easier theme management.
 * ============================================================================
 */

// ============================================================================
// 1. COLOR PALETTE
// ============================================================================

export const colors = {
  // Background & Surface Colors (Light Mode)
  light: {
    background: '#f8fafc',      // slate-50
    surface: '#ffffff',         // white
    surfaceHover: '#f1f5f9',    // slate-100
    border: '#e6eef8',          // light border
    text: '#0f1724',            // slate-900
    textSecondary: '#6b7280',   // gray-500
    textMuted: '#9ca3af',       // gray-400
  },

  // Background & Surface Colors (Dark Mode)
  dark: {
    background: '#04060a',      // richer dark background
    surface: '#071226',         // dark surface
    surfaceHover: '#0f172a',    // slightly lighter on hover
    border: 'rgba(255,255,255,0.06)',  // subtle border
    text: '#e6eef8',            // light text
    textSecondary: '#cbd5e1',   // slate-300
    textMuted: '#9aa6b6',       // muted gray
  },

  // Semantic Colors
  semantic: {
    primary: '#6366f1',         // indigo-500 (light mode)
    primaryDark: '#9097ff',     // indigo-400 (dark mode)
    accent: '#a855f7',          // purple-500
    success: '#10b981',         // emerald-500
    error: '#ef4444',           // red-500
    warning: '#f59e0b',         // amber-500
    info: '#06b6d4',            // cyan-500
  },

  // Focus & Interaction
  focus: {
    light: 'rgba(99,102,241,0.14)',   // indigo focus ring light
    dark: 'rgba(144,151,255,0.18)',   // indigo focus ring dark
  },
};

// ============================================================================
// 2. SPACING SCALE
// ============================================================================

export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================================================
// 3. Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 40,      // For modals, dropdowns, tooltips
  fixed: 50,         // Fixed headers, navigation
  modal: 60,         // Modal overlays
  popover: 70,       // High-priority popovers
  notification: 80,  // Toast notifications
  tooltip: 90,       // Tooltips (highest)
} as const;

// ============================================================================
// 4. SHADOWS
// ============================================================================

export const shadows = {
  light: {
    xs: '0 2px 4px rgba(15, 23, 36, 0.02)',
    sm: '0 4px 8px rgba(15, 23, 36, 0.04)',
    md: '0 6px 18px rgba(15, 23, 36, 0.06)',
    lg: '0 10px 30px rgba(15, 23, 36, 0.08)',
    xl: '0 15px 40px rgba(15, 23, 36, 0.1)',
  },
  dark: {
    xs: '0 2px 4px rgba(2, 6, 23, 0.3)',
    sm: '0 4px 8px rgba(2, 6, 23, 0.4)',
    md: '0 6px 18px rgba(2, 6, 23, 0.5)',
    lg: '0 10px 30px rgba(2, 6, 23, 0.7)',
    xl: '0 15px 40px rgba(2, 6, 23, 0.9)',
  },
};

// ============================================================================
// 5. BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0px',
  xs: '0.25rem',    // 4px
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',   // Full (circles)
} as const;

// ============================================================================
// 6. TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    base: "'Inter', system-ui, sans-serif",
    mono: "'Monaco', 'Courier New', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================================================
// 7. TRANSITIONS
// ============================================================================

export const transitions = {
  fast: 'all 150ms ease',
  normal: 'all 240ms ease',
  slow: 'all 360ms ease',
};

// ============================================================================
// 8. BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// 9. COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  button: {
    paddingX: spacing[4],
    paddingY: spacing[2],
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: transitions.normal,
  },
  input: {
    borderRadius: borderRadius.md,
    paddingX: spacing[3],
    paddingY: spacing[2],
    fontSize: typography.fontSize.base,
    transition: transitions.normal,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    shadow: shadows.light.md,
  },
  modal: {
    maxWidth: '720px',
    borderRadius: borderRadius.lg,
    shadow: shadows.light.xl,
    zIndex: zIndex.modal,
  },
  dropdown: {
    zIndex: zIndex.dropdown,
    shadow: shadows.light.lg,
    borderRadius: borderRadius.md,
  },
};

// ============================================================================
// 10. THEME UTILITY - Get theme-aware values
// ============================================================================

export function getThemeColor(colorKey: keyof typeof colors.light, isDark = false) {
  if (colorKey in colors.semantic) {
    return colors.semantic[colorKey as keyof typeof colors.semantic];
  }
  return isDark ? colors.dark[colorKey as keyof typeof colors.dark] : colors.light[colorKey as keyof typeof colors.light];
}

export function getThemeShadow(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl', isDark = false) {
  return isDark ? shadows.dark[size] : shadows.light[size];
}
