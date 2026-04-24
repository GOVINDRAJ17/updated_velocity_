# Roadmap

## Milestone 1: Baseline & Optimization

### Phase 1: Infrastructure & Testing
- **Goal**: Setup testing and improve architectural robustness.
- **Plans**:
  - Plan 1: Configure Vitest and Playwright.
  - Plan 2: Add initial unit tests for core libraries.
  - Plan 3: Audit and fix Capacitor plugin error handling.

### Phase 2: Routing Refactor
- **Goal**: Implement a standard router for better maintainability.
- **Plans**:
  - Plan 1: Integrate `react-router-dom`.
  - Plan 2: Migrate current views to routes.
  - Plan 3: Verify animations and back-button behavior.

### Phase 3: Component Deconstruction
- **Goal**: Refactor monolithic components for better readability.
- **Plans**:
  - Plan 1: Refactor `Profile.tsx`.
  - Plan 2: Refactor `Home.tsx`.
  - Plan 3: Refactor `Groups.tsx`.

### Phase 4: Production Readiness
- **Goal**: Clean up hacks and prepare for deployment.
- **Plans**:
  - Plan 1: Remove `devModeBypass`.
  - Plan 2: Review environment variable usage.
  - Plan 3: Perform a final performance audit.

---
*Last updated: 2026-04-24*
