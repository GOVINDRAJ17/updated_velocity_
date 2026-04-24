# Phase 1: Infrastructure & Testing - Research

## Testing Ecosystem
- **Vitest**: The recommended test runner for Vite projects. It supports Vite's configuration out-of-the-box and is much faster than Jest.
- **Playwright**: Modern E2E testing framework. Better for mobile-web simulation than Cypress.

## Implementation Details

### Vitest Setup
- Dependencies: `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom`.
- Config: Add `test` object to `vite.config.ts`.
- Mocking: Use `vi.mock()` for Supabase and Capacitor calls.

### Playwright Setup
- Dependencies: `npm install -D @playwright/test`.
- Initialization: `npx playwright install --with-deps`.
- Config: `playwright.config.ts`.

### Capacitor Safety
- Pattern for native calls:
  ```typescript
  import { Capacitor } from '@capacitor/core';
  if (Capacitor.isNativePlatform()) {
    // native only
  } else {
    // web fallback or error
  }
  ```

### Code Cleanup
- **Target**: `src/App.tsx`.
- **Remove**: `devModeBypass` state, `onDevBypass` prop from `Auth`, and the hidden context menu `div` on line 261-268.

## Validation Architecture
- **Unit Tests**: Pass if all tests in `src/lib/__tests__` exit 0.
- **E2E Tests**: Pass if `npx playwright test` exits 0.
- **Build**: `npm run build` must succeed.
- **Manual Verification**: Check that `devModeBypass` is gone and `Auth` works as expected.

---
*Date: 2026-04-24*
