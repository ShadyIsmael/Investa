# 🚀 Quick Start Guide - Use New Components & Design System

**Updated:** January 25, 2025  
**For:** Investa Client Portal Team

---

## 📋 What Changed

Your client portal code has been **deeply analyzed, cleaned, and refactored** following global standards:

✅ **Dead code removed** - Mobile menu logic (unused)  
✅ **Design system created** - Centralized color, spacing, z-index  
✅ **Reusable button component** - Use instead of inline button HTML  
✅ **Documentation added** - DESIGN_SYSTEM.md for reference  
✅ **Code quality improved** - JSDoc comments throughout  

---

## 🎯 Key Files to Know

| File | Purpose | Action |
|------|---------|--------|
| `src/styles/_theme.scss` | All design tokens | Use variables in your SCSS |
| `src/styles/DESIGN_SYSTEM.md` | Design reference | Read for color/spacing/z-index |
| `src/app/shared/components/button/` | Reusable button | Import & use in templates |
| `src/app/components/header/` | Main navigation | Already cleaned up |
| `src/app/components/admin-navbar/` | Auth'd nav bar | Well documented |

---

## 🎨 How to Use Design Tokens

### 1. In SCSS Files (Component Styles)

**Before:**
```scss
// ❌ Hardcoded values
button {
  background-color: #3b82f6;
  color: #f1f5f9;
  padding: 10px 16px;
  z-index: 1050;
}
```

**After:**
```scss
// ✅ Using design tokens
@import '../../styles/theme';

button {
  background-color: $color-accent;
  color: $color-text-primary;
  padding: $spacing-button-py $spacing-button-px;
  z-index: $z-modal;
}
```

### 2. In HTML Templates (Tailwind Classes)

**Before:**
```html
<!-- ❌ Scattered colors & spacing -->
<div class="bg-slate-900 px-6 py-4 text-slate-100">
  Content
</div>
```

**After (using design tokens):**
```html
<!-- ✅ Still Tailwind, but following design system -->
<div class="bg-slate-900 ps-6 pe-6 py-4 text-slate-100">
  Content (note: ps/pe for RTL support)
</div>
```

### 3. Color Reference

```scss
@import '../../styles/theme';

// Use these instead of hardcoding hex values:

// Backgrounds
$color-background      // #0f172a - page background
$color-surface         // #1e293b - cards, modals
$color-surface-light   // #334155 - hover states

// Text
$color-text-primary    // #f1f5f9 - main text
$color-text-secondary  // #cbd5e1 - secondary text

// Actions
$color-accent          // #3b82f6 - primary button (blue)
$color-accent-alt      // #a855f7 - secondary action (purple)
$color-error           // #ef4444 - errors
$color-success         // #10b981 - success
$color-warning         // #f59e0b - warnings
```

---

## 🔘 How to Use New Button Component

### Import the Component

```typescript
import { ButtonComponent } from 'src/app/shared/components';

@Component({
  standalone: true,
  imports: [ButtonComponent, ...],
  template: `...`
})
export class MyComponent { }
```

### Usage Examples

```html
<!-- Basic primary button -->
<app-button (clicked)="onSubmit()">
  Submit Form
</app-button>

<!-- Secondary button, medium size -->
<app-button variant="secondary" (clicked)="onCancel()">
  Cancel
</app-button>

<!-- Large danger button, full width -->
<app-button 
  variant="danger" 
  size="lg" 
  [fullWidth]="true"
  (clicked)="onDelete()">
  Delete Account
</app-button>

<!-- Small outline button, disabled -->
<app-button 
  variant="outline" 
  size="sm"
  [disabled]="!canSubmit">
  Learn More
</app-button>

<!-- Disabled state -->
<app-button [disabled]="isLoading">
  {{ isLoading ? 'Saving...' : 'Save' }}
</app-button>
```

### Button Variants

| Variant | Usage | Color |
|---------|-------|-------|
| `primary` | Main actions, CTAs | Blue → Purple gradient |
| `secondary` | Alternative actions | Slate gray |
| `danger` | Destructive actions | Red |
| `outline` | Less important, text only | Blue border + text |

### Button Sizes

| Size | Padding | Font | Best for |
|------|---------|------|----------|
| `sm` | Small | 14px | Compact spaces, secondary |
| `md` | Normal | 16px | Most buttons (default) |
| `lg` | Large | 18px | Hero section, important CTAs |

### Button Inputs

```typescript
@Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' = 'primary';
@Input() size: 'sm' | 'md' | 'lg' = 'md';
@Input() disabled: boolean = false;
@Input() fullWidth: boolean = false;
@Output() clicked = new EventEmitter<void>();
```

---

## 📱 Important: RTL/LTR Support

The design system supports both **English (LTR)** and **Arabic (RTL)** layouts.

### Key Rules

✅ **Use logical properties:**
- `ms` (margin-start) instead of `ml` (margin-left)
- `me` (margin-end) instead of `mr` (margin-right)
- `ps` (padding-start) instead of `pl` (padding-left)
- `pe` (padding-end) instead of `pr` (padding-right)

❌ **Avoid physical properties in new code:**
- ~~`ml`~~ → use `ms`
- ~~`mr`~~ → use `me`
- ~~`left`~~ → use `start`
- ~~`right`~~ → use `end`

### Example

```html
<!-- ✅ Correct - works in both LTR and RTL -->
<div class="ps-6 me-4">Content</div>

<!-- ❌ Wrong - breaks when language is Arabic -->
<div class="pl-6 mr-4">Content</div>
```

---

## 🎨 Z-Index Layer System

Use the correct z-index layer for your component:

```scss
@import '../../styles/theme';

// Header/navbar (stays visible while scrolling)
.header {
  z-index: $z-sticky;  // 1020
}

// Dropdowns (above most content)
.dropdown {
  z-index: $z-dropdown; // 1000
}

// Modals (high layer)
.modal-backdrop {
  z-index: $z-modal-backdrop; // 1040
}

.modal-window {
  z-index: $z-modal; // 1050
}

// Tooltips (topmost)
.tooltip {
  z-index: $z-tooltip; // 1070
}
```

**Don't hardcode values like `z-50`, `z-[99]`, or `z-[9999]`!**

---

## 📐 Spacing Guide

Use the spacing scale consistently:

| Scale | Size | Use for |
|-------|------|---------|
| `xs` | 4px | Minimal gaps |
| `sm` | 8px | Tight spacing |
| `md` | 16px | Standard spacing |
| `lg` | 24px | Generous spacing |
| `xl` | 32px | Large sections |
| `2xl` | 48px | Page-level spacing |

### In Templates
```html
<!-- Padding -->
<div class="p-6">Regular padding</div>        <!-- 24px all sides -->
<div class="px-4 py-2">Button padding</div>  <!-- 16px horizontal, 8px vertical -->
<div class="ps-6">Padding on start</div>     <!-- 24px at start (left/right) -->

<!-- Margins -->
<div class="mb-4">Bottom margin</div>         <!-- 16px margin bottom -->
<div class="space-y-6">Vertical gap</div>    <!-- 24px between items -->
```

### In SCSS
```scss
@import '../../styles/theme';

.card {
  padding: $spacing-card-p;           // 24px
  margin-bottom: $spacing-lg;         // 24px
  gap: $spacing-md;                   // 16px between children
}

.button {
  padding: $spacing-button-py $spacing-button-px;  // 10px Y, 16px X
}
```

---

## 🎯 Common Scenarios

### Scenario 1: Create a New Form Component

```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from 'src/app/shared/components';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent],  // Add button
  template: `
    <form class="space-y-6 bg-slate-900 p-6 rounded-xl">
      <!-- Form inputs -->
      <input class="w-full px-4 py-2 bg-slate-800 rounded-lg text-white" />
      
      <!-- Use new button component -->
      <app-button (clicked)="onSubmit()" [fullWidth]="true">
        Submit
      </app-button>
    </form>
  `
})
export class MyFormComponent {
  onSubmit() {
    // Handle submission
  }
}
```

### Scenario 2: Update Existing Button HTML

**Before (hardcoded styles):**
```html
<button class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-full hover:opacity-90 transition-opacity duration-300">
  Login
</button>
```

**After (using component):**
```html
<app-button (clicked)="openLoginModal()">
  Login
</app-button>
```

### Scenario 3: Apply Design Token Colors

**Before:**
```scss
.dashboard {
  background-color: #1e293b;
  color: #f1f5f9;
  border: 1px solid #475569;
}
```

**After:**
```scss
@import '../../styles/theme';

.dashboard {
  background-color: $color-surface;
  color: $color-text-primary;
  border: 1px solid $color-surface-lighter;
}
```

---

## ✅ Checklist: Code Quality

When adding new code, ensure:

- [ ] Using logical properties (ms/me/ps/pe, not ml/mr/pl/pr)
- [ ] Colors from design tokens ($color-*), not hardcoded
- [ ] Spacing from scale ($spacing-*), not arbitrary values
- [ ] Z-index from layers ($z-*), not hardcoded numbers
- [ ] Button component used instead of inline styles
- [ ] Components have JSDoc documentation
- [ ] OnPush change detection enabled
- [ ] No unused imports or variables

---

## 📚 Reference Files

### Need Color Reference?
→ `src/styles/DESIGN_SYSTEM.md` (search "Color Palette")

### Need Spacing Guide?
→ `src/styles/DESIGN_SYSTEM.md` (search "Spacing Scale")

### Need Z-Index Layers?
→ `src/styles/DESIGN_SYSTEM.md` (search "Z-Index")

### Need to Update Design System?
→ `src/styles/_theme.scss` + `src/styles/DESIGN_SYSTEM.md`

### Want to Create New Component?
→ Follow pattern in `src/app/shared/components/button/`

---

## 🐛 Common Mistakes (Don't Do These)

```typescript
// ❌ Hardcoded colors
.button { background: #3b82f6; }
// ✅ Use tokens
.button { background: $color-accent; }

// ❌ Left/right properties
<div class="ml-4 mr-8"></div>
// ✅ Use start/end
<div class="ms-4 me-8"></div>

// ❌ Arbitrary z-index
.modal { z-index: 9999; }
// ✅ Use system
.modal { z-index: $z-modal; }

// ❌ Duplicate button HTML
<button class="...long list of classes...">Click</button>
// ✅ Use component
<app-button>Click</app-button>

// ❌ No documentation
export class MyComponent { }
// ✅ Add JSDoc
/** Component purpose and usage */
export class MyComponent { }
```

---

## 🚀 Next Steps

1. **Review** `src/styles/DESIGN_SYSTEM.md` for full reference
2. **Use** ButtonComponent in new features
3. **Import** `_theme.scss` in component SCSS files
4. **Replace** hardcoded colors/spacing with tokens
5. **Follow** RTL guidelines (use ms/me/ps/pe)
6. **Document** new components with JSDoc
7. **Test** in both LTR (English) and RTL (Arabic)

---

## 💬 Questions?

Check these files:
- Design questions → `src/styles/DESIGN_SYSTEM.md`
- Code pattern → `src/app/shared/components/button/button.component.ts`
- Issues found → `CODE_REVIEW_ANALYSIS.md`
- Implementation details → `REFACTORING_IMPLEMENTATION_SUMMARY.md`

**Happy coding!** 🎉

