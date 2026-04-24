---
wave: 1
depends_on: []
files_modified: [package.json, src/App.tsx, src/components/BottomNav.tsx]
autonomous: true
---

# Plan 1: Router Integration

Install `react-router-dom` and establish the core routing structure in `App.tsx`, replacing the primary `currentView` state.

## Tasks

### 1. Install react-router-dom
<read_first>
- `package.json`
</read_first>
<action>
Install `react-router-dom` as a dependency.
</action>
<acceptance_criteria>
- `package.json` contains `react-router-dom`.
</acceptance_criteria>

### 2. Setup BrowserRouter in App.tsx
<read_first>
- `src/App.tsx`
</read_first>
<action>
- Wrap the main application export in `BrowserRouter`.
- Import `Routes`, `Route`, and `useLocation` from `react-router-dom`.
- Define the base routes for `home`, `maps`, `start`, `groups`, `profile`.
- Use `useLocation` and `AnimatePresence` to maintain view transitions.
</action>
<acceptance_criteria>
- `src/App.tsx` uses `<Routes>` instead of the `renderView` switch statement for main views.
- `AnimatePresence` is still present and functioning.
</acceptance_criteria>

### 3. Update BottomNav
<read_first>
- `src/components/BottomNav.tsx`
</read_first>
<action>
- Update `BottomNav` to use `useNavigate` and `useLocation`.
- Remove the `setCurrentView` and `currentView` props.
- Ensure active tab styling is based on the current route.
</action>
<acceptance_criteria>
- `BottomNav.tsx` no longer receives navigation props.
- Clicking nav items changes the URL and view.
</acceptance_criteria>

## Verification
- App launches and displays the Home view by default.
- Navigation via the bottom bar works as before.
