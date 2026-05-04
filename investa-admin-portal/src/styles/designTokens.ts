/**
 * Design Tokens – Investa Admin Portal (Obsidian Theme)
 * Single source of truth for all visual constants.
 */

// ── 1. Colors ──────────────────────────────────────────────────────────────
export const colors = {
  light: {
    background:    '#f8fafc',
    surface:       '#ffffff',
    surfaceHover:  '#f1f5f9',
    border:        '#e2e8f0',
    text:          '#0f172a',
    textSecondary: '#475569',
    textMuted:     '#94a3b8',
  },
  dark: {
    background:    '#09090b',
    surface:       '#111117',
    surfaceHover:  '#18181f',
    border:        'rgba(255,255,255,0.07)',
    text:          '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted:     '#64748b',
  },
  semantic: {
    primary:     '#0ea5e9',
    primaryDark: '#38bdf8',
    accent:      '#38bdf8',
    success:     '#10b981',
    error:       '#ef4444',
    warning:     '#f59e0b',
    info:        '#06b6d4',
  },
  focus: {
    light: 'rgba(14,165,233,0.15)',
    dark:  'rgba(56,189,248,0.2)',
  },
};

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
    xs: '0 1px 2px rgba(15,23,36,0.05)',
    sm: '0 1px 3px rgba(15,23,36,0.08), 0 1px 2px -1px rgba(15,23,36,0.08)',
    md: '0 4px 6px -1px rgba(15,23,36,0.08)',
    lg: '0 10px 15px -3px rgba(15,23,36,0.08)',
    xl: '0 20px 25px -5px rgba(15,23,36,0.08)',
  },
  dark: {
    xs: '0 1px 2px rgba(0,0,0,0.35)',
    sm: '0 1px 3px rgba(0,0,0,0.45)',
    md: '0 4px 6px -1px rgba(0,0,0,0.55)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.65)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.75)',
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
