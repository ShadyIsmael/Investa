/**
 * Design Tokens – Investa Admin Portal (Zinc Slate Theme)
 * Single source of truth for all visual constants.
 *
 * Identity: Modern enterprise SaaS — charcoal/zinc backgrounds,
 *           indigo primary, full light + dark mode.
 */

// ── 1. Colors ──────────────────────────────────────────────────────────────
export const colors = {
  light: {
    background:    '#f8f8fa',   // zinc-50/warm
    surface:       '#ffffff',
    surfaceHover:  '#f4f4f5',   // zinc-100
    border:        '#e6e6ea',   // matched to index.css
    text:          '#111114',   // updated to match index.css
    textSecondary: '#52525b',   // zinc-600
    textMuted:     '#9aa0a6',   // matched to index.css
  },
  dark: {
    background:    '#030312',   // matched to index.css dark
    surface:       '#0b0b0d',   // matched to index.css dark
    surfaceHover:  '#111114',   // matched to index.css dark
    border:        'rgba(255,255,255,0.06)',
    text:          '#f8fafc',   // matched to index.css dark
    textSecondary: '#c7c7cf',   // matched to index.css dark
    textMuted:     '#94a3b8',   // matched to index.css dark
  },
  semantic: {
    primary:     '#4f46e5',   // indigo (canonical)
    primaryDark: '#818cf8',   // dark variant
    accent:      '#8b5cf6',   // violet-500
    accentDark:  '#a78bfa',   // violet-400
    success:     '#10b981',   // emerald-500
    successDark: '#34d399',   // emerald-400
    error:       '#ef4444',   // red-500
    errorDark:   '#f87171',   // red-400
    warning:     '#f59e0b',   // amber-500
    warningDark: '#fbbf24',   // amber-400
    info:        '#06b6d4',   // cyan-500
    infoDark:    '#22d3ee',   // cyan-400
  },
  focus: {
    light: 'rgba(99,102,241,0.15)',
    dark:  'rgba(129,140,248,0.2)',
  },
} as const;

// ── 2. Spacing ─────────────────────────────────────────────────────────────
export const spacing = {
  0: '0px', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem',
  4: '1rem', 6: '1.5rem', 8: '2rem', 12: '3rem',
  16: '4rem', 20: '5rem', 24: '6rem',
} as const;

// ── 3. Z-Index ─────────────────────────────────────────────────────────────
export const zIndex = {
  hide: -1, base: 0, dropdown: 40, fixed: 50,
  modal: 60, popover: 70, notification: 80, tooltip: 90,
} as const;

// ── 4. Shadows ─────────────────────────────────────────────────────────────
export const shadows = {
  light: {
    xs: '0 1px 2px rgba(24,24,27,0.04)',
    sm: '0 1px 3px rgba(24,24,27,0.06), 0 1px 2px -1px rgba(24,24,27,0.06)',
    md: '0 4px 6px -1px rgba(24,24,27,0.07), 0 2px 4px -2px rgba(24,24,27,0.05)',
    lg: '0 10px 15px -3px rgba(24,24,27,0.08), 0 4px 6px -4px rgba(24,24,27,0.05)',
    xl: '0 20px 25px -5px rgba(24,24,27,0.08), 0 8px 10px -6px rgba(24,24,27,0.05)',
  },
  dark: {
    xs: '0 1px 2px rgba(0,0,0,0.4)',
    sm: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px -1px rgba(0,0,0,0.45)',
    md: '0 4px 6px -1px rgba(0,0,0,0.6), 0 2px 4px -2px rgba(0,0,0,0.5)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.7), 0 4px 6px -4px rgba(0,0,0,0.6)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.8), 0 8px 10px -6px rgba(0,0,0,0.65)',
  },
};

// ── 5. Border Radius ───────────────────────────────────────────────────────
export const borderRadius = {
  none: '0px', xs: '0.25rem', sm: '0.375rem',
  md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', full: '9999px',
} as const;

// ── 6. Typography ──────────────────────────────────────────────────────────
export const typography = {
  fontFamily: { base: "'Inter', system-ui, sans-serif" },
  fontSize: {
    xs: '0.75rem', sm: '0.875rem', base: '1rem',
    lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem',
    '3xl': '1.875rem', '4xl': '2.25rem',
  },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 },
};

// ── 7. Transitions ─────────────────────────────────────────────────────────
export const transitions = {
  fast:   'all 150ms cubic-bezier(0.4,0,0.2,1)',
  normal: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
  slow:   'all 350ms cubic-bezier(0.4,0,0.2,1)',
} as const;
