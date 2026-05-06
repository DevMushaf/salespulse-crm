# Style Guide

## Design Principles

1. **Dark-first design** — The entire UI uses a dark color palette for a premium, modern feel
2. **Glassmorphism accents** — Subtle transparency and blur effects on overlays
3. **Micro-animations** — Hover effects, transitions, and loading states
4. **Consistent spacing** — 8px grid system throughout
5. **High contrast** — Text meets WCAG AA contrast ratios on dark backgrounds

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0b0f1a` | Page background |
| `--bg-secondary` | `#111827` | Sidebar, cards |
| `--bg-card` | `#1e293b` | Card backgrounds |
| `--bg-input` | `#0f172a` | Input fields |
| `--border` | `#334155` | Borders |
| `--text-primary` | `#f1f5f9` | Headings, primary text |
| `--text-secondary` | `#94a3b8` | Body text, labels |
| `--text-muted` | `#64748b` | Helper text |
| `--accent` | `#6366f1` | Primary actions, links |
| `--success` | `#22c55e` | Won deals, positive |
| `--warning` | `#f59e0b` | Proposal sent, caution |
| `--danger` | `#ef4444` | Lost deals, destructive |
| `--info` | `#3b82f6` | Contacted, informational |

## Typography

- **Font Family:** Inter (Google Fonts) with system fallbacks
- **Weights used:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Heading sizes:** 26px (page), 18px (card), 16px (section), 14px (body)

## Component Patterns

### Buttons
- `.btn-primary` — Indigo background, white text, glow on hover
- `.btn-outline` — Transparent with border, accent on hover
- `.btn-ghost` — No background, subtle hover
- `.btn-danger` — Red for destructive actions
- `.btn-sm` — Compact sizing for inline actions

### Status Badges
Color-coded pills with translucent backgrounds:
- New → Indigo
- Contacted → Blue
- Qualified → Teal
- Proposal Sent → Amber
- Won → Green
- Lost → Red

### Cards
- Dark background (`--bg-card`)
- 1px border with `--border`
- 12px border radius
- Hover lift effect (translateY -2px)

### Form Inputs
- Dark input background (`--bg-input`)
- Accent border + glow on focus
- Icon prefix for login inputs
- Inline validation errors in red

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
- `--radius` (12px) — Cards, panels
- `--radius-sm` (8px) — Buttons, inputs
- 20px — Status badges (pill shape)
- 50% — Avatars, dots
