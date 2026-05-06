# Style Guide
 
## Design Principles
 
1. **Light-first design** — The UI uses a clean light color palette for a professional, approachable feel
2. **Navy sidebar** — Deep navy sidebar provides strong visual contrast and anchors the layout
3. **Elevated cards** — White cards with subtle shadows create depth on the light background
4. **Micro-animations** — Hover lifts, transitions, and loading states throughout
5. **Consistent spacing** — 8px grid system throughout
6. **High contrast** — Text meets WCAG AA contrast ratios on light backgrounds
## Color Palette
 
### Main UI (Light Theme)
 
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#f0f2f8` | Page background |
| `--bg-secondary` | `#e8ebf4` | Hover states, table headers |
| `--bg-card` | `#ffffff` | Card backgrounds |
| `--bg-input` | `#f7f8fc` | Input fields (unfocused) |
| `--bg-input-focus` | `#ffffff` | Input fields (focused) |
| `--border` | `#e2e6f0` | Borders |
| `--border-light` | `#edf0f7` | Subtle dividers |
| `--text-primary` | `#111827` | Headings, primary text |
| `--text-secondary` | `#4b5563` | Body text, labels |
| `--text-muted` | `#9ca3af` | Helper text, placeholders |
| `--accent` | `#6366f1` | Primary actions, links, active states |
| `--accent-light` | `#ede9fe` | Accent backgrounds |
| `--accent-glow` | `rgba(99,102,241,0.15)` | Focus rings |
| `--success` | `#10b981` | Won deals, positive metrics |
| `--warning` | `#f59e0b` | Proposal sent, caution |
| `--danger` | `#ef4444` | Lost deals, destructive actions |
| `--info` | `#3b82f6` | Contacted, informational |
 
### Sidebar (Navy)
 
| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-bg` | `#141c2e` | Sidebar background |
| `--sidebar-bg-secondary` | `#1a2540` | Sidebar hover/secondary |
| `--sidebar-text` | `#8a9bc4` | Nav item text (inactive) |
| `--sidebar-text-active` | `#ffffff` | Nav item text (active) |
| `--sidebar-active-bg` | `rgba(99,102,241,0.18)` | Active nav item background |
| `--sidebar-active-accent` | `#6366f1` | Active nav left bar |
 
## Typography
 
- **Heading Font:** Plus Jakarta Sans (Google Fonts) — used for all `h1–h5`, page titles, card headings
- **Body Font:** DM Sans (Google Fonts) — used for all body text, labels, inputs, buttons
- **Weights used:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Heading sizes:** 24px (page), 17px (modal), 14.5px (card), 13.5px (body)
- **Letter spacing:** `-0.5px` on large headings for tighter, more refined look
Both fonts are loaded via `<link>` in `index.html`. Do not use Inter or system fonts in new components.
 
## Component Patterns
 
### Buttons
- `.btn-primary` — Indigo background, white text, indigo box-shadow on hover
- `.btn-outline` — White background, light border, accent color on hover
- `.btn-ghost` — Transparent, subtle gray hover
- `.btn-danger` — Red for destructive actions, red shadow
- `.btn-danger-outline` — Transparent with red border, fills red on hover
- `.btn-sm` — Compact sizing (6px/13px padding) for inline/table actions
### Status Badges
Color-coded pills with colored backgrounds and matching borders — designed for white card surfaces:
- **New** → Purple (`#ede9fe` bg, `#7c3aed` text, `#ddd6fe` border)
- **Contacted** → Blue (`#eff6ff` bg, `#1d4ed8` text, `#bfdbfe` border)
- **Qualified** → Teal (`#f0fdfa` bg, `#0f766e` text, `#99f6e4` border)
- **Proposal Sent** → Amber (`#fffbeb` bg, `#b45309` text, `#fde68a` border)
- **Won** → Green (`#ecfdf5` bg, `#065f46` text, `#6ee7b7` border)
- **Lost** → Red (`#fef2f2` bg, `#b91c1c` text, `#fca5a5` border)
### Cards
- White background (`--bg-card`)
- `1px solid var(--border-light)` border
- `14px` border radius (`--radius`)
- Hover lift effect: `translateY(-2px)` + stronger shadow
- Box shadow: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
### Sidebar Nav Items
- Inactive: `#8a9bc4` text on `#141c2e` background
- Hover: white text, `rgba(255,255,255,0.05)` background
- Active: white text, `rgba(99,102,241,0.18)` background, `3px` indigo left bar
### Form Inputs
- Unfocused: `#f7f8fc` background, `1.5px solid #e2e6f0` border
- Focused: white background, indigo border + `0 0 0 3px rgba(99,102,241,0.15)` glow ring
- Error state: `--danger-bg` background, red border
- Placeholder text: `#c4cad8`
## Shadows
 
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards, inputs, table wrapper |
| `--shadow` | `0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)` | Filter panel, dropdowns |
| `--shadow-md` | `0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)` | Hover states |
| `--shadow-lg` | `0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)` | Modals, login card |
 
## Spacing Scale
| Size | Value |
|------|-------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 20px |
| 2xl | 24px |
| 3xl | 28px |
| 4xl | 32px |
 
## Border Radius
- `--radius` (14px) — Cards, panels, chart wrappers
- `--radius-sm` (9px) — Buttons, inputs, nav items
- `--radius-xs` (6px) — Priority badges, source tags
- `20px` — Status badges (pill shape)
- `50%` — Avatars, activity dots