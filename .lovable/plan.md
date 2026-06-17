# Color Scheme Update

Apply the uploaded palette across the app's design tokens.

**Palette**
- `#4E89C4` — deep blue (primary)
- `#89C8FC` — sky blue (primary-glow / chart)
- `#C2E1FC` — pale blue (accent / muted surfaces)
- `#FFC2D9` — pale pink (secondary)
- `#FF99BE` — pink (destructive-free accent / chart highlight)

## Changes

1. **`src/styles.css` — light theme (`:root`)**
   - `--primary` → `#4E89C4` (oklch equivalent), `--primary-foreground` → white
   - `--secondary` → `#FFC2D9`, `--secondary-foreground` → deep blue
   - `--accent` → `#C2E1FC`, `--accent-foreground` → deep blue
   - `--ring` → `#4E89C4`
   - `--background` stays near-white with a faint blue tint; `--foreground` deep blue-charcoal for contrast
   - `--sidebar-primary` → `#4E89C4`, `--sidebar-accent` → `#C2E1FC`
   - Chart palette → the 5 brand hues in order

2. **`src/styles.css` — dark theme (`.dark`)**
   - `--primary` → `#89C8FC` (lighter blue reads better on dark)
   - `--secondary` → `#FF99BE`
   - `--accent` → muted deep-blue surface, `--accent-foreground` → pale blue
   - `--ring` → `#89C8FC`

3. **`src/routes/_authenticated/admin.settings.tsx`**
   - Update the default `primary_color` / `secondary_color` fallbacks in the branding preview from `#6366f1`/`#0ea5e9` to `#4E89C4`/`#FFC2D9` so the admin Settings page reflects the new brand out of the box.
   - (Existing saved `platform_settings` rows can be updated by the admin via the UI, or via a small migration — confirm below.)

## Out of scope
- No layout, typography, or component-structure changes.
- No hardcoded `bg-[#...]` / `text-white` introductions — only semantic tokens.

## Question before building
Should I also run a migration to update the existing `platform_settings` row's `primary_color`/`secondary_color` to the new hexes, or leave that for you to change in **Admin → Settings**?
