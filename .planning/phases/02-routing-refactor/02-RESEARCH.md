# Phase 2: Routing Refactor - Research

## Routing Strategy
- **Library**: `react-router-dom` is the industry standard for React apps.
- **Migration Path**: 
    1. Install `react-router-dom`.
    2. Wrap `App` in `BrowserRouter`.
    3. Convert `currentView` logic in `AppContent` to `<Routes>`.
    4. Progressively update components to use `useNavigate` instead of `onNavigate`.

## Implementation Details

### Dependency Installation
- `npm install react-router-dom`.

### Transition Logic
To keep the smooth transitions from `App.tsx`:
```tsx
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

function AppContent() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        ...
      </Routes>
    </AnimatePresence>
  );
}
```

### Component Updates
- **BottomNav**: Use `NavLink` or `useNavigate` for active state styling.
- **Back Button**: Capacitor back button listener in `App.tsx` should use `navigate(-1)` instead of manipulating `viewHistory`.

## Validation Architecture
- **Navigation Tests**: Playwright can verify that clicking a button changes the URL and the content.
- **Build**: Ensure no dead imports or type errors after removing `onNavigate` props.

---
*Date: 2026-04-24*
