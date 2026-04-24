# Phase 2: Routing Refactor - Validation Strategy

## 1. Goal-Backward Verification
- **Goal**: Implement a standard router for better maintainability.
- **Must-Have 1**: `react-router-dom` is the source of truth for navigation.
- **Must-Have 2**: URL paths map to all major views.
- **Must-Have 3**: Component interfaces are simplified (no `onNavigate` drilling).
- **Must-Have 4**: Framer Motion transitions remain smooth.

## 2. Automated Validation
- [ ] Routes are registered in `App.tsx`.
- [ ] `useNavigate` is present in `BottomNav.tsx`.
- [ ] No `useState<View>` remains in `AppContent`.

## 3. Dimension 8 Compliance
- **Safety**: Verify that invalid routes redirect to `/` or a 404 page.
- **Performance**: Ensure route changes don't cause excessive re-renders of the root `App` component.

---
*Date: 2026-04-24*
