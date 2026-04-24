# Conventions

## Coding Style
- **Components**: Functional components with TypeScript.
- **State Management**: Local `useState` for UI state, React Context for global application state (Auth, Theme, Ride, etc.).
- **Routing**: Internal view-based routing using `useState<View>` in `App.tsx` and `framer-motion` for transitions.
- **Asynchronous Code**: `async/await` preferred over raw promises.
- **Error Handling**: Use of `safeFetch` wrapper in `src/lib/utils.ts` to catch and log errors, and dispatch global toasts.

## Naming Conventions
- **Files**: PascalCase for React components (`Home.tsx`), camelCase for logic/utils (`supabase.ts`).
- **Variables/Functions**: camelCase.
- **Types/Interfaces**: PascalCase.
- **CSS Classes**: Tailwind utility classes.

## UI/UX Patterns
- **Animations**: `framer-motion` used for view transitions and micro-interactions.
- **Feedback**: `sonner` and `ToastContext` for user notifications.
- **Mobile First**: Design optimized for small screens with `safe-area-inset` support.
- **Accessibility**: Use of Radix UI primitives.

## Testing
- No explicit test framework detected in `package.json` (e.g., Vitest, Jest). Testing appears to be manual or handled via Capacitor integration.

---
*Last updated: 2026-04-24*
