---
wave: 1
depends_on: []
files_modified: [src/App.tsx, src/components/Auth.tsx]
autonomous: true
---

# Plan 3: Native Stability & Cleanup

Improve the reliability of native integrations and remove development hacks.

## Tasks

### 1. Audit and Secure App.tsx
<read_first>
- `src/App.tsx`
</read_first>
<action>
Modify `src/App.tsx`:
- Import `Capacitor` from `@capacitor/core`.
- Wrap Capacitor plugin calls (like `CapApp.addListener`) in platform checks if necessary, or ensure they fail gracefully.
- Remove `devModeBypass` state and the hidden context menu `div` (lines 261-268).
- Remove `onDevBypass` from the `Auth` component call.
</action>
<acceptance_criteria>
- `src/App.tsx` no longer contains "devModeBypass".
- The hidden context menu is removed.
</acceptance_criteria>

### 2. Cleanup Auth.tsx
<read_first>
- `src/components/Auth.tsx`
</read_first>
<action>
Modify `src/components/Auth.tsx`:
- Remove the `onDevBypass` prop and any UI elements triggering it.
</action>
<acceptance_criteria>
- `src/components/Auth.tsx` no longer references "devModeBypass".
</acceptance_criteria>

## Verification
- Build the app: `npm run build` succeeds.
- Manual check: Hidden dev bypass no longer exists in the login screen.
