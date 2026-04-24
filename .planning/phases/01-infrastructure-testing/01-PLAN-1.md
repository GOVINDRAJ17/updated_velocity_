---
wave: 1
depends_on: []
files_modified: [package.json, vite.config.ts]
autonomous: true
---

# Plan 1: Testing Setup

Configure the project for automated testing using Vitest (unit/integration) and Playwright (E2E).

## Tasks

### 1. Install Dependencies
<read_first>
- `package.json`
</read_first>
<action>
Install the following dev dependencies:
- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@playwright/test`
</action>
<acceptance_criteria>
- `package.json` contains the requested dependencies in `devDependencies`.
</acceptance_criteria>

### 2. Configure Vitest
<read_first>
- `vite.config.ts`
</read_first>
<action>
Add `test` configuration to `vite.config.ts`:
- Environment: `jsdom`
- Globals: true
- Setup files: None for now
</action>
<acceptance_criteria>
- `vite.config.ts` contains a `test` property in the `defineConfig` object.
</acceptance_criteria>

### 3. Initialize Playwright
<action>
Run `npx playwright install --with-deps` to initialize the E2E environment.
</action>
<acceptance_criteria>
- Playwright browsers and dependencies are installed.
</acceptance_criteria>

### 4. Add Test Scripts
<read_first>
- `package.json`
</read_first>
<action>
Add the following scripts to `package.json`:
- `"test": "vitest"`
- `"test:e2e": "playwright test"`
</action>
<acceptance_criteria>
- `package.json` has `"test"` and `"test:e2e"` scripts.
</acceptance_criteria>

## Verification
- `npm test -- --run` should execute vitest (even if no tests yet).
- `npx playwright --version` should return a version.
