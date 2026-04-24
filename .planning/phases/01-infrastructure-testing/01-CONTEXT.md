# Phase 1: Infrastructure & Testing - Context

**Gathered**: 2026-04-24
**Status**: Ready for planning
**Source**: Auto-generated via GSD orchestrator

<domain>
## Phase Boundary
This phase focuses on establishing a robust testing foundation and improving the reliability of native integrations (Capacitor). It does NOT include the routing refactor (Phase 2) or component deconstruction (Phase 3).

### Deliverables
- Vitest configuration and initial unit tests.
- Playwright configuration and initial E2E smoke tests.
- Improved error handling for Capacitor plugins (Geolocation, App).
- Removal of `devModeBypass` (cleanup).
</domain>

<decisions>
## Implementation Decisions

### Testing Frameworks
- **Unit Testing**: Vitest. Why: Seamless integration with Vite 6.
- **E2E Testing**: Playwright. Why: Best-in-class for modern web and mobile-web testing.
- **Coverage**: Aim for core logic in `src/lib/` first.

### Native Stability
- **Pattern**: Always check for platform before calling Capacitor plugins that might fail in web preview.
- **Error Feedback**: Use the existing `ToastContext` to notify users of native failures.

### Code Cleanup
- **Dev Mode**: Remove the hidden context menu bypass from `App.tsx` and the `devModeBypass` state. Authentication must be handled properly via Supabase.

### the agent's Discretion
- Choice of specific test utilities (e.g., `jsdom` for Vitest).
- Structure of test files (e.g., `*.test.ts` alongside source files).
</decisions>

<canonical_refs>
## Canonical References
- `vite.config.ts` — Build and plugin configuration.
- `package.json` — Dependency management.
- `src/lib/utils.ts` — Existing error handling patterns.
- `src/App.tsx` — Root component for E2E entry points.
</canonical_refs>

<specifics>
## Specific Ideas
- Create a `src/lib/__tests__/` directory for utility tests.
- Add a `tests/e2e/` directory for Playwright tests.
</specifics>

<deferred>
## Deferred Ideas
- **Routing Refactor**: Scheduled for Phase 2.
- **Component Refactoring**: Scheduled for Phase 3.
</deferred>

---
*Phase: 01-infrastructure-testing*
*Context gathered: 2026-04-24 via Auto-mode*
