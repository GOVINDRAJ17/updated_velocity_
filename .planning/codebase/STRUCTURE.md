# Structure

## Directory Layout
- `.planning/`: GSD planning and codebase mapping (Project initialization in progress).
- `src/`: Main source code.
  - `components/`: React components.
    - `ui/`: Shadcn/Generic UI components.
    - `figma/`: Likely design-to-code components or references.
  - `contexts/`: React context providers.
  - `lib/`: Service clients and utility functions.
  - `styles/`: Global and component-specific styles.
  - `guidelines/`: Project-specific development guidelines.
- `supabase/`: Supabase migrations, functions, and configuration.
- `android/`: Capacitor Android project files.
- `public/`: Static assets (images, icons).
- `server/`: Backend/Proxy server code (if applicable, separate from Supabase).

## Key Files
- `src/App.tsx`: Root component with routing.
- `src/main.tsx`: Entry point.
- `vite.config.ts`: Build configuration.
- `package.json`: Dependency manifest.
- `capacitor.config.json`: Mobile bridge config.

## Naming Conventions
- **Components**: PascalCase (e.g., `LiveGroupRide.tsx`).
- **Hooks/Utilities**: camelCase (e.g., `useAuth.ts`, `utils.ts`).
- **Directories**: lowercase (e.g., `components`, `lib`).

---
*Last updated: 2026-04-24*
