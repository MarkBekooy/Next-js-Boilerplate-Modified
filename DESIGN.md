# Design system

## Current foundation

- shadcn/ui `base-nova` style with Base UI components, configured in `components.json`.
- Tailwind CSS v4 with light and dark OKLCH tokens in `src/app/globals.css`. Use semantic classes such as `bg-background`, `text-foreground`, `bg-card`, and `text-muted-foreground`.
- Geist for interface text and Geist Mono for code. The base radius is `0.625rem`.
- Lucide React for icons.

## UI conventions

- Reuse and compose components from `src/components/ui` before adding new primitives.
- Use existing component variants for appearance. Keep `className` focused on layout and sizing.
- Use `gap-*` for spacing between flex and grid children. Use the shared radius tokens instead of one-off radius values.
- Let the theme tokens handle dark mode. Add or change tokens in `globals.css` when the design needs a new semantic color.
- Keep controls keyboard-accessible, labeled, and visibly focused. Use the existing `Skeleton` component for pending content.
