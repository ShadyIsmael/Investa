# Investa Client Portal — Light Theme Final Pass

## Visual system
- Unified light palette: soft gray page, white surfaces, charcoal primary actions, green progress/accent.
- Centralized semantic page, card, button, input, badge, tab, progress, modal, radius and shadow primitives.
- Kept existing dark-theme token support.

## Shell and navigation
- Removed the admin shell dark parent background dependency.
- Aligned the admin navbar and public header with the light palette.
- Standardized active navigation, focus, dropdown and notification surfaces.

## Opportunity experience
- Updated Opportunity Browse source classes for light surfaces, charcoal CTAs, green progress and neutral text/borders.
- Updated Public Opportunity Details page background/header/surfaces and removed blue-purple CTA language.
- Updated Project Room remaining blue status styling to semantic green tokens.

## Shared controls
- Rebuilt the shared Button component to use semantic variants rather than blue-purple Tailwind gradients.
- Added legacy Sass compatibility mixins and variables required by existing components.

## Validation
- `npm ci --no-audit --no-fund`: passed.
- `npm run build`: passed.
