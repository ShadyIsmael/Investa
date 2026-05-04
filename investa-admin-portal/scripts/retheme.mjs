/**
 * Theme generation script – run with: node scripts/retheme.mjs
 * Overwrites all style / token files with the new "Obsidian" theme.
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src  = resolve(root, 'src');

// ---------------------------------------------------------------------------
// 1.  index.css  (imported by main.tsx as ../index.css)
// ---------------------------------------------------------------------------
writeFileSync(resolve(root, 'index.css'), `/* ========================================================
   Investa Admin – Obsidian Theme  (index.css)
   All legacy token names kept for backward-compat with
   components that still use var(--bg), var(--surface) etc.
   ======================================================== */
:root {
  /* Backgrounds */
  --bg:             #f8fafc;
  --surface:        #ffffff;
  --surface-hover:  #f1f5f9;

  /* Borders */
  --border:         #e2e8f0;

  /* Typography */
  --text:           #0f172a;
  --text-secondary: #475569;
  --text-muted:     #94a3b8;
  --text-strong:    #020617;

  /* Accent – Electric Sky Blue */
  --primary:        #0ea5e9;
  --accent:         #38bdf8;
  --success:        #10b981;
  --error:          #ef4444;
  --warning:        #f59e0b;
  --info:           #06b6d4;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(15,23,36,0.05);
  --shadow-sm: 0 1px 3px rgba(15,23,36,0.08), 0 1px 2px -1px rgba(15,23,36,0.08);
  --shadow-md: 0 4px 6px -1px rgba(15,23,36,0.08), 0 2px 4px -2px rgba(15,23,36,0.08);
  --shadow-lg: 0 10px 15px -3px rgba(15,23,36,0.08), 0 4px 6px -4px rgba(15,23,36,0.08);
  --shadow-xl: 0 20px 25px -5px rgba(15,23,36,0.08), 0 8px 10px -6px rgba(15,23,36,0.08);

  /* Z-index ladder */
  --z-dropdown:     40;
  --z-fixed:        50;
  --z-modal:        60;
  --z-popover:      70;
  --z-notification: 80;
  --z-tooltip:      90;

  /* Radii */
  --radius-sm:   0.375rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
  --radius-2xl:  1.5rem;
  --radius-full: 9999px;

  /* Font */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;

  /* Transitions */
  --transition-fast:   all 150ms cubic-bezier(0.4,0,0.2,1);
  --transition-normal: all 250ms cubic-bezier(0.4,0,0.2,1);
}

.dark {
  --bg:             #09090b;
  --surface:        #111117;
  --surface-hover:  #18181f;

  --border:         rgba(255,255,255,0.07);

  --text:           #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted:     #64748b;
  --text-strong:    #ffffff;

  --primary:        #38bdf8;
  --accent:         #7dd3fc;
  --success:        #34d399;
  --error:          #f87171;
  --warning:        #fbbf24;
  --info:           #22d3ee;

  --shadow-xs: 0 1px 2px rgba(0,0,0,0.35);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.45), 0 1px 2px -1px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.55), 0 2px 4px -2px rgba(0,0,0,0.5);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.65), 0 4px 6px -4px rgba(0,0,0,0.55);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.75), 0 8px 10px -6px rgba(0,0,0,0.65);
}

/* ── Base reset ─────────────────────────────────────────── */
html {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-family);
  min-height: 100vh;
}

body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transition: background-color 0.3s, color 0.3s;
}

/* ── Scrollbar ──────────────────────────────────────────── */
::-webkit-scrollbar             { width: 6px; height: 6px; }
::-webkit-scrollbar-track       { background: transparent; }
::-webkit-scrollbar-thumb       { background: var(--border); border-radius: var(--radius-full); }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* ── Legacy utility helpers ─────────────────────────────── */
.text-strong   { color: var(--text-strong) !important; font-weight: 600; }
.text-muted    { color: var(--text-muted)  !important; }
.bg-surface    { background-color: var(--surface) !important; }
.border-themed { border-color: var(--border) !important; }
`);

// ---------------------------------------------------------------------------
// 2.  src/globals.css  (Tailwind entry)
// ---------------------------------------------------------------------------
writeFileSync(resolve(src, 'globals.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Tailwind CSS-variable bridge (Obsidian theme) ─────── */
@layer base {
  :root {
    --background:  210 40% 98%;     /* #f8fafc */
    --foreground:  222 47% 11%;     /* #0f172a */

    --card:        0 0% 100%;
    --card-foreground: 222 47% 11%;

    --popover:     0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Electric Sky Blue primary */
    --primary:          199 89% 48%;  /* #0ea5e9 */
    --primary-foreground: 0 0% 100%;

    --secondary:        210 40% 96%;
    --secondary-foreground: 222 47% 11%;

    --muted:            210 40% 96%;
    --muted-foreground: 215 16% 47%;

    --accent:           199 89% 48%;
    --accent-foreground: 0 0% 100%;

    --destructive:      0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border:      214 32% 91%;
    --input:       214 32% 91%;
    --ring:        199 89% 48%;

    --radius:      0.75rem;
  }

  .dark {
    --background:  240 6% 4%;     /* #09090b */
    --foreground:  210 40% 98%;

    --card:        240 5% 7%;     /* #111117 */
    --card-foreground: 210 40% 98%;

    --popover:     240 5% 7%;
    --popover-foreground: 210 40% 98%;

    /* Lighter sky blue pops on dark */
    --primary:          199 89% 60%;  /* #38bdf8 */
    --primary-foreground: 240 6% 4%;

    --secondary:        240 4% 14%;
    --secondary-foreground: 210 40% 98%;

    --muted:            240 4% 14%;
    --muted-foreground: 215 20% 55%;

    --accent:           199 89% 60%;
    --accent-foreground: 240 6% 4%;

    --destructive:      0 63% 40%;
    --destructive-foreground: 210 40% 98%;

    --border:      240 4% 14%;
    --input:       240 4% 14%;
    --ring:        199 89% 60%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}

/* ── Shared component helpers ───────────────────────────── */
@layer components {
  .card {
    @apply bg-card text-card-foreground border border-border rounded-2xl shadow-sm transition-all duration-200;
  }

  .card-hover {
    @apply hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5;
  }

  .btn-primary {
    @apply bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm
           hover:opacity-90 active:scale-95 transition-all duration-150 shadow-sm;
  }

  .btn-ghost {
    @apply text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-2
           rounded-xl font-medium text-sm transition-all duration-150;
  }

  .input-field {
    @apply w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium
           outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all;
  }

  .badge {
    @apply inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border;
  }

  .badge-success { @apply bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800; }
  .badge-error   { @apply bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800; }
  .badge-warning { @apply bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800; }
  .badge-info    { @apply bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800; }
  .badge-primary { @apply bg-primary/10 text-primary border-primary/20; }
}
`);

// ---------------------------------------------------------------------------
// 3.  src/styles/designTokens.ts
// ---------------------------------------------------------------------------
writeFileSync(resolve(src, 'styles', 'designTokens.ts'), `/**
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
`);

// ---------------------------------------------------------------------------
// 4.  tailwind.config.js
// ---------------------------------------------------------------------------
writeFileSync(resolve(root, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        xl:   'calc(var(--radius) + 4px)',
        '2xl':'calc(var(--radius) + 8px)',
        '3xl':'calc(var(--radius) + 16px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'fade-in':     { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up':    { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in':      'fade-in 0.4s ease-out',
        'slide-up':     'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
`);

console.log('✅  All theme files written successfully.\n');
console.log('  • index.css');
console.log('  • src/globals.css');
console.log('  • src/styles/designTokens.ts');
console.log('  • tailwind.config.js');
