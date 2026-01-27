# 🎨 Design System - Investa Client Portal

**Version:** 1.0  
**Last Updated:** January 2025  
**Location:** `src/styles/`

## 📖 Overview

This design system document outlines all visual and interaction design standards for the Investa Client Portal. It ensures consistency across all components and pages.

### Files Reference
- **SCSS Variables:** `src/styles/_theme.scss` - All design tokens
- **Tailwind Config:** `tailwind.config.cjs` - Tailwind CSS configuration
- **Global Styles:** `src/styles/styles.scss` - Global Tailwind directives

---

## 🎯 Color Palette

### Primary Colors (Dark Theme)

| Name | Value | Usage | Tailwind |
|------|-------|-------|----------|
| **Background** | `#0f172a` | Page backgrounds, base color | `bg-slate-950` |
| **Surface** | `#1e293b` | Cards, modals, panels | `bg-slate-900` |
| **Surface Light** | `#334155` | Hover states, secondary elements | `bg-slate-700` |
| **Surface Lighter** | `#475569` | Borders, dividers | `bg-slate-600` |

### Text Colors

| Name | Value | Usage | Tailwind |
|------|-------|-------|----------|
| **Text Primary** | `#f1f5f9` | Main text content | `text-slate-100` |
| **Text Secondary** | `#cbd5e1` | Secondary text, labels | `text-slate-300` |
| **Text Muted** | `#94a3b8` | Disabled, placeholder text | `text-slate-400` |

### Semantic Colors

| Name | Value | Usage | Tailwind |
|------|-------|-------|----------|
| **Accent (Primary)** | `#3b82f6` | Buttons, links, focus states | `bg-blue-500` |
| **Accent Alt** | `#a855f7` | Secondary actions, gradients | `bg-purple-500` |
| **Error** | `#ef4444` | Error messages, invalid states | `bg-red-500` |
| **Success** | `#10b981` | Success messages, valid states | `bg-emerald-500` |
| **Warning** | `#f59e0b` | Warning alerts, caution states | `bg-amber-500` |
| **Info** | `#06b6d4` | Info messages, neutral alerts | `bg-cyan-500` |

### Gradients

```scss
// Primary gradient (used for buttons, CTAs)
$gradient-primary: linear-gradient(135deg, #3b82f6, #a855f7);

// Alternative: Tailwind class
class="bg-gradient-to-r from-blue-500 to-purple-600"
```

---

## 🏗️ Z-Index System

Maintains strict stacking order to prevent overlapping issues.

| Layer | Value | Components | Notes |
|-------|-------|------------|-------|
| **Dropdown** | 1000 | Dropdowns, popovers | Above most content |
| **Sticky** | 1020 | Header, navbar | Stay visible while scrolling |
| **Fixed** | 1030 | Fixed overlays | Always visible |
| **Modal Backdrop** | 1040 | Semi-transparent background | Behind modal |
| **Modal** | 1050 | Modal windows, dialogs | Highest interactive element |
| **Popover** | 1060 | Popovers, advanced tooltips | Above modals if needed |
| **Tooltip** | 1070 | Floating tooltips | Topmost layer |

### Usage Example
```html
<!-- Header (sticky, z-sticky = 1020) -->
<header class="sticky top-0 z-[1060] bg-slate-900/95 backdrop-blur-md">

<!-- Modal (z-modal = 1050) -->
<div class="fixed inset-0 z-[1040]">  <!-- Backdrop -->
<div class="fixed z-[1050]">           <!-- Modal -->
</div>
```

---

## 📏 Spacing Scale

Based on **0.25rem (4px)** increments for fine-grained control.

| Scale | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| **xs** | 0.25rem | `p-1` | Minimal spacing |
| **sm** | 0.5rem | `p-2` | Tight spacing |
| **md** | 1rem | `p-4` | Standard spacing |
| **lg** | 1.5rem | `p-6` | Generous spacing |
| **xl** | 2rem | `p-8` | Large spacing |
| **2xl** | 3rem | `p-12` | Extra large spacing |
| **3xl** | 4rem | `p-16` | Massive spacing |

### Component-Specific Spacing

| Component | Padding | Tailwind | Notes |
|-----------|---------|----------|-------|
| **Navbar** | 0.75rem Y | `py-3` | Compact header padding |
| **Card** | 1.5rem | `p-6` | Standard card padding |
| **Button** | 0.625rem Y, 1rem X | `py-2.5 px-4` | Comfortable click target |
| **Form gap** | 1rem | `gap-4` | Space between form inputs |
| **Page padding** | 2rem | `px-8` | Horizontal page margins |

---

## 🔤 Typography

### Font Families

```scss
// Primary (system stack)
$font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

// Monospace (code, pre)
$font-family-mono: 'Monaco', 'Courier New', monospace;
```

### Font Sizes

| Name | Size | Tailwind | Usage |
|------|------|----------|-------|
| **xs** | 12px | `text-xs` | Small labels, captions |
| **sm** | 14px | `text-sm` | Secondary text, hints |
| **base** | 16px | `text-base` | Body text, default |
| **lg** | 18px | `text-lg` | Lead paragraphs |
| **xl** | 20px | `text-xl` | Subheadings |
| **2xl** | 24px | `text-2xl` | Section headings |
| **3xl** | 30px | `text-3xl` | Page titles |
| **4xl** | 36px | `text-4xl` | Hero headings |
| **5xl** | 48px | `text-5xl` | Banner text |

### Font Weights

| Weight | Value | Tailwind | Usage |
|--------|-------|----------|-------|
| **Normal** | 400 | `font-normal` | Body text |
| **Medium** | 500 | `font-medium` | Emphasis, labels |
| **Semibold** | 600 | `font-semibold` | Buttons, headings |
| **Bold** | 700 | `font-bold` | Strong emphasis |
| **Extrabold** | 800 | `font-extrabold` | Display text |

### Line Heights

| Height | Value | Tailwind | Usage |
|--------|-------|----------|-------|
| **Tight** | 1.25 | `leading-tight` | Headings |
| **Normal** | 1.5 | `leading-normal` | Body text (default) |
| **Relaxed** | 1.625 | `leading-relaxed` | Large paragraphs |
| **Loose** | 2 | `leading-loose` | Spaced paragraphs |

---

## 🌫️ Shadows

Provides visual depth and hierarchy.

| Depth | CSS | Tailwind | Usage |
|-------|-----|----------|-------|
| **sm** | `0 1px 2px 0 rgba(0,0,0,0.05)` | `shadow-sm` | Subtle lift |
| **md** | `0 4px 6px -1px rgba(0,0,0,0.1)` | `shadow-md` | Card shadows |
| **lg** | `0 10px 15px -3px rgba(0,0,0,0.1)` | `shadow-lg` | Modal shadows |
| **xl** | `0 20px 25px -5px rgba(0,0,0,0.1)` | `shadow-xl` | High-elevation shadows |

### Component Shadows

```scss
$shadow-navbar: $shadow-md;         // Header/navbar
$shadow-card: $shadow-sm;           // Cards, smaller components
$shadow-modal: $shadow-xl;          // Modals, large overlays
```

---

## ⏱️ Transitions & Animations

Ensures smooth, consistent motion across interactions.

| Speed | Duration | Timing | Usage |
|-------|----------|--------|-------|
| **Fast** | 150ms | `ease-in-out` | Instant feedback |
| **Base** | 300ms | `ease-in-out` | Standard transitions |
| **Slow** | 500ms | `ease-in-out` | Attention-grabbing |

### Common Transition Classes

```scss
// Colors (background, text, border)
$transition-colors: color 300ms ease-in-out,
                    background-color 300ms ease-in-out,
                    border-color 300ms ease-in-out;

// Opacity (fade in/out)
$transition-opacity: opacity 300ms ease-in-out;

// Everything (comprehensive transition)
$transition-all: all 300ms ease-in-out;
```

### Usage Example

```html
<!-- Hover with color transition -->
<button class="text-white hover:text-blue-400 transition-colors duration-300">
  Hover me
</button>

<!-- Opacity fade -->
<div class="opacity-0 hover:opacity-100 transition-opacity duration-500">
  Fade in on hover
</div>
```

---

## 🔲 Border Radius

Consistent roundness throughout the application.

| Size | Value | Tailwind | Usage |
|------|-------|----------|-------|
| **sm** | 6px | `rounded-md` | Small elements |
| **md** | 8px | `rounded-lg` | Standard elements |
| **lg** | 12px | `rounded-xl` | Large elements |
| **xl** | 16px | `rounded-2xl` | Cards, panels |
| **full** | 9999px | `rounded-full` | Buttons, pills |

---

## 📱 Breakpoints

Mobile-first responsive design.

| Name | Width | Tailwind | Usage |
|------|-------|----------|-------|
| **Mobile** | < 640px | Default | Mobile devices |
| **sm** | ≥ 640px | `sm:` | Small tablets |
| **md** | ≥ 768px | `md:` | Tablets |
| **lg** | ≥ 1024px | `lg:` | Desktops |
| **xl** | ≥ 1280px | `xl:` | Large desktops |
| **2xl** | ≥ 1536px | `2xl:` | Ultra-wide screens |

### Example: Responsive Layout

```html
<!-- Single column mobile, 2 columns tablet, 3 columns desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
</div>
```

---

## 🎭 Component Specifications

### Header/Navbar

```html
<header class="sticky top-0 z-[1060] bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 py-4">
  <!-- Content -->
</header>
```

**Specs:**
- Sticky positioning (stays at top while scrolling)
- Dark background with 95% opacity
- Backdrop blur for glassmorphism effect
- Border divider at bottom
- Vertical padding: 1rem (py-4)

### Buttons

#### Primary Button
```html
<button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-full hover:opacity-90 transition-opacity duration-300">
  Primary Action
</button>
```

#### Secondary Button
```html
<button class="bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300">
  Secondary Action
</button>
```

#### Outline Button
```html
<button class="border-2 border-blue-500 text-blue-500 font-semibold py-2 px-4 rounded-lg hover:bg-blue-500/10 transition-colors duration-300">
  Outline Action
</button>
```

### Cards

```html
<div class="bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-700/50">
  <!-- Card Content -->
</div>
```

**Specs:**
- Background: `bg-slate-900`
- Padding: `p-6` (1.5rem)
- Border radius: `rounded-xl` (16px)
- Shadow: `shadow-sm` (subtle)
- Border: `border border-slate-700/50` (divider)

### Modal Windows

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-[1040] bg-black/50 backdrop-blur-sm"></div>

<!-- Modal -->
<div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1050] bg-slate-900 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
  <!-- Modal Content -->
</div>
```

### Form Inputs

```html
<input type="text" placeholder="Enter text..." class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300">
```

---

## 🌍 Internationalization (RTL Support)

The design system supports both LTR (English) and RTL (Arabic) layouts.

### Directional Utilities

Use logical properties instead of physical directions:

| Physical | Logical | Meaning |
|----------|---------|---------|
| `left`, `ml`, `pl` | `start`, `ms`, `ps` | Start side (left in LTR, right in RTL) |
| `right`, `mr`, `pr` | `end`, `me`, `pe` | End side (right in LTR, left in RTL) |

### Example

```html
<!-- Wrong (breaks in RTL) -->
<div class="pl-6 ml-4"></div>

<!-- Correct (works in both LTR/RTL) -->
<div class="ps-6 ms-4"></div>
```

---

## ✅ Usage Guidelines

### Do's ✅

- Use design tokens from `_theme.scss` instead of hardcoding values
- Apply classes in order: `position` → `sizing` → `spacing` → `colors` → `effects`
- Test components in both LTR and RTL modes
- Use semantic color names (error, success, warning) for consistency
- Leverage Tailwind utilities for rapid development

### Don'ts ❌

- Don't hardcode color hex values in components
- Don't use arbitrary z-index values (always use the z-index scale)
- Don't apply inconsistent spacing across similar components
- Don't use `left`/`right` classes (use `start`/`end` for RTL compatibility)
- Don't override Tailwind utility values without updating config

---

## 🔄 Updating the Design System

When making changes to the design system:

1. **Update `_theme.scss`** - Add/modify SCSS variables
2. **Update Tailwind config** - Extend Tailwind if needed
3. **Update this document** - Document changes with examples
4. **Test thoroughly** - Verify in all browsers and RTL mode
5. **Communicate changes** - Notify team of deprecations

---

## 📚 Related Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Accessible Colors](https://www.a11y-101.com/design/color-contrast)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📞 Support

For questions or suggestions about the design system, contact the development team or create an issue in the repository.

