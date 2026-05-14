<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Color Theme

Use the SpatialOps theme for every frontend change. The source of truth is `src/app/globals.css`; do not scatter raw hex colors through components unless a third-party API, such as Leaflet, requires a literal color value.

- Base UI: `background`, `foreground`, `surface`, `surface-subtle`, `surface-elevated`, `border`, `border-strong`, `muted`, `muted-foreground`.
- Primary actions and geospatial overlays: `primary`, `primary-hover`, `primary-soft`, `primary-foreground`.
- Natural/asset-positive states: `secondary`, `secondary-soft`, `secondary-foreground`.
- Attention and review states: `accent`, `accent-soft`, `accent-foreground`.
- System states: `danger`, `warning`, `info`, and `success`, each with `*-soft` and `*-foreground` variants.

Tailwind classes should use semantic tokens, for example `bg-surface`, `text-foreground`, `border-border`, `bg-primary`, `hover:bg-primary-hover`, `text-muted-foreground`, `bg-warning-soft`, and `text-warning-foreground`.

Keep the product visually calm and operational: light map-inspired neutrals, teal/cyan for primary analysis actions, vegetation green for asset-positive signals, amber for review or medium warning states, and red only for high-risk or destructive states.
