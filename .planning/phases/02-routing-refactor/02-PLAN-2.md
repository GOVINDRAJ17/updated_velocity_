---
wave: 2
depends_on: [02-PLAN-1.md]
files_modified: [src/components/Home.tsx, src/components/Profile.tsx, src/components/Settings.tsx, src/components/AllPosts.tsx, src/components/Chat.tsx]
autonomous: true
---

# Plan 2: Complete View Migration

Refactor all secondary components to remove prop-based navigation and use the router directly.

## Tasks

### 1. Refactor Component Interfaces
<read_first>
- `src/components/Home.tsx`
- `src/components/Profile.tsx`
- `src/components/Settings.tsx`
</read_first>
<action>
For each component:
- Remove `onNavigate` and `onBack` props.
- Import `useNavigate` from `react-router-dom`.
- Replace calls like `onNavigate("profile")` with `navigate("/profile")`.
- Replace calls like `onBack()` with `navigate(-1)`.
</action>
<acceptance_criteria>
- Components no longer have navigation-related props in their definitions.
- Components use `navigate()` for all transitions.
</acceptance_criteria>

### 2. Register Remaining Routes in App.tsx
<read_first>
- `src/App.tsx`
</read_first>
<action>
Add routes for:
- `/allposts`
- `/settings`
- `/chat`
- `/rideroom`
- `/privacy`
</action>
<acceptance_criteria>
- All current app views are accessible via unique URL paths.
</acceptance_criteria>

## Verification
- Deep navigation (Home -> Profile -> Settings -> Privacy) works and back button functions correctly.
