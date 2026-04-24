# Requirements

## Milestone 1: Baseline & Optimization
The goal of this milestone is to stabilize the existing codebase, add testing, and prepare for new feature development.

### 1. Robust Routing
- [ ] Implement `react-router-dom` or similar to replace manual state-based routing.
- [ ] Preserve `framer-motion` transitions between views.
- [ ] Ensure Capacitor back-button integration works with the new router.

### 2. Testing Foundation
- [ ] Configure `vitest` for unit testing.
- [ ] Add tests for `src/lib/utils.ts` and `src/lib/insights.ts`.
- [ ] Configure `Playwright` for basic E2E smoke tests.

### 3. Native Polish
- [ ] Audit all Capacitor plugin usages for proper error handling (especially when running in web).
- [ ] Improve Geolocation reliability in background mode.

### 4. Code Health
- [ ] Refactor large components (e.g., `Profile.tsx`) into smaller sub-components.
- [ ] Remove `devModeBypass` and implement a proper administrative/debug mode if needed.

---
*Last updated: 2026-04-24*
