---
wave: 2
depends_on: [02-PLAN-1.md, 02-PLAN-2.md]
files_modified: [src/App.tsx]
autonomous: true
---

# Plan 3: Back-Button & Animation Polish

Finalize the routing behavior for native platforms and cleanup technical debt.

## Tasks

### 1. Fix Native Back Button
<read_first>
- `src/App.tsx`
</read_first>
<action>
Update the `CapApp.addListener("backButton", ...)` logic:
- Use `navigate(-1)` if there is history.
- Check if the current route is `/` (home) to exit the app.
- Ensure the listener has access to the latest router state.
</action>
<acceptance_criteria>
- The physical back button (Android) correctly navigates back through routes.
</acceptance_criteria>

### 2. Cleanup Dead Code
<read_first>
- `src/App.tsx`
</read_first>
<action>
- Delete `currentView`, `viewHistory`, `navigateTo`, and `renderView` from `AppContent`.
- Remove any remaining unused imports related to manual routing.
</action>
<acceptance_criteria>
- No more state-based routing logic remains in `App.tsx`.
</acceptance_criteria>

## Verification
- `npm test` still passes.
- App feels snappy and animations are consistent with the previous version.
