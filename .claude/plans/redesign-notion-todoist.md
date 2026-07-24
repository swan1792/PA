# Redesign: Notion + Todoist Inspired

## Goal
Transform the PA app from heavy neobrutalism to a clean, minimal, unified experience inspired by Notion (sidebar, whitespace, hierarchy) and Todoist (quick capture, pill filters, productivity-first).

## Files to Modify
1. `frontend/src/index.css` — redesign system tokens
2. `frontend/src/components/ui/Card.tsx` — simpler cards
3. `frontend/src/components/ui/Button.tsx` — Todoist-style buttons
4. `frontend/src/components/ui/Modal.tsx` — cleaner modal
5. `frontend/src/components/ui/Badge.tsx` — simplify
6. `frontend/src/components/layout/Sidebar.tsx` — Notion-style sidebar
7. `frontend/src/components/layout/Layout.tsx` — adjust to new sidebar
8. `frontend/src/components/ui/QuickCapture.tsx` — Todoist-style quick add
9. `frontend/tailwind.config.js` — update theme colors/shadows
10. Every page file — consistent layout patterns

## Detailed Steps

### 1. `tailwind.config.js` — Theme Update
- Replace heavy neobrutalism shadows (`shadow-neo`) with subtle layered shadows
- Change `border-3` to default `border` (1px)
- Keep neo color palette but add softer variants
- Add 'pill' border-radius utility

### 2. `index.css` — Design Token Overhaul
- Replace neobrutalism CSS variables with clean, minimal ones
- Remove heavy `neo-card`, `neo-btn`, `neo-input` component classes
- Add subtle utility classes (`.pill`, `.card-hover`)
- Keep dark mode but with softer transitions
- Add Notion-style selection colors

### 3. `Card.tsx` — Simplify
- Remove heavy `border-3` and `shadow-neo`
- Use `border` (1px) with subtle `shadow-sm`
- Remove intensive motion animations
- Keep `hover` variant with minimal lift
- Clean padding defaults

### 4. `Button.tsx` — Todoist-style
- Remove heavy neobrutalism borders (3px → 0 or 1px)
- Remove dramatic box-shadow transforms
- Primary: solid bg, rounded-lg, clean
- Secondary: outlined, thin border
- Ghost: minimal hover state
- Consistent border-radius

### 5. `Modal.tsx` — Cleaner
- Remove heavy `border-3` and `shadow-neo-lg`
- Use simpler overlay (solid white/black, lighter backdrop)
- Cleaner title bar with thin divider
- Softer spring animation

### 6. `Badge.tsx` — Simplify
- Remove border, shadow, wiggle animation
- Simple colored text on tinted background
- Pill-shaped (fully rounded)

### 7. `Sidebar.tsx` — Notion-inspired
- Thinner (w-56 from w-60)
- Darker background (like Notion sidebar)
- Remove heavy borders on nav items
- Active state: subtle tinted background, no border
- Hover state: light tint, no border
- Bottom user area: compact, clean
- Mobile: same but as overlay

### 8. `Layout.tsx`
- Adjust margin to match new sidebar width (ml-56)
- Cleaner main area padding

### 9. `QuickCapture.tsx` — Todoist-style
- Redesign floating button (more minimal, smaller)
- Modal with cleaner input
- Focus on keyboard-first interaction

### 10. All Pages — Consistent Patterns
- Unify page header pattern (title + subtitle + action)
- Replace `bg-brand-600 text-white` filter buttons with pill-shaped toggle
- Consistent empty states
- Replace `border border-gray-300` inputs with clean minimal inputs
- Consistent spacing (space-y-6 → space-y-8 with better breathing)

## Key Design Decisions
- **No more `border-3`** anywhere — all borders go to 1px
- **No more `shadow-neo`** — replaced with `shadow-sm` or `shadow-md`
- **Filter pills** — consistent pill-shaped toggle across all pages
- **Typography** — keep Inter as base, maintain Space Grotesk for display
- **Color palette** — keep the neo tokens but use them more sparingly
- **Dark mode** — keep but with subtler transitions

## Execution Plan
1. Update tailwind config
2. Rewrite index.css with new tokens
3. Redesign UI components (Card, Button, Modal, Badge)
4. Redesign Sidebar and Layout
5. Redesign QuickCapture
6. Update all pages to consistent patterns
7. Type-check and verify
