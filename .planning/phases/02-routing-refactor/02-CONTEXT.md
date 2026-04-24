# Phase 2: Routing Refactor - Context

**Gathered**: 2026-04-24
**Status**: Ready for planning
**Source**: Auto-generated via GSD orchestrator

<domain>
## Phase Boundary
This phase focuses on replacing the manual `useState`-based routing in `AppContent` with a formal routing library (`react-router-dom`). It aims to improve code organization, enable URL-based navigation (even if primarily used as a mobile app), and simplify component props.

### Deliverables
- `react-router-dom` integration.
- Defined routes for all current views: `/home`, `/maps`, `/start`, `/groups`, `/profile`, `/allposts`, `/settings`, `/chat`, `/rideroom`, `/privacy`.
- Refactored `AppContent` to use `<Routes>` and `<Route>`.
- Refactored `BottomNav` and other components to use `useNavigate`.
- Preserved `framer-motion` view transitions.
</domain>

<decisions>
## Implementation Decisions

### Routing Library
- **Library**: `react-router-dom` v7 (latest stable).
- **Router Type**: `BrowserRouter` (aliased for mobile web).

### Component Refactor
- **Pattern**: Replace `onNavigate` props with the `useNavigate` hook from `react-router-dom`.
- **Global Props**: Many components receive `onNavigate` as a drilling prop; this will be removed to flatten component interfaces.

### Animation Persistence
- **Approach**: Wrap `<Routes>` in `<AnimatePresence mode="wait">`. Use `useLocation()` to provide a `location.pathname` key to the `motion.div` wrapper in `App.tsx`. This ensures that route changes trigger the same transitions as the current state changes.

### the agent's Discretion
- Choice of exact path strings (e.g., `/groups` vs `/formation`).
- Handling of "back" logic (using `navigate(-1)` vs specific path navigation).
</decisions>

<canonical_refs>
## Canonical References
- `src/App.tsx` — Current routing implementation (to be replaced).
- `src/components/BottomNav.tsx` — Key consumer of navigation logic.
- `package.json` — For dependency management.
</canonical_refs>

<specifics>
## Specific Ideas
- Implement a `ProtectedRoute` wrapper if we want to centralize the session check, though the current layout in `App.tsx` already handles this.
</specifics>

<deferred>
## Deferred Ideas
- **Deep Linking**: While the router supports it, full deep-linking integration with Capacitor (App URL Open) is deferred to Milestone 2.
</deferred>

---
*Phase: 02-routing-refactor*
*Context gathered: 2026-04-24 via Auto-mode*
