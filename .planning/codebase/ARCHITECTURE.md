# Architecture

## System Design
The application is a **Client-First Mobile Web App** built with React and Capacitor. It follows a **Service-Based Architecture** where the frontend communicates with various external services (Supabase, Stripe, LiveKit) directly or via thin library wrappers.

## Core Patterns
- **Context-API State Management**: Global state is likely managed via React Contexts (e.g., `src/contexts/`).
- **Hooks-based Logic**: Functional components with custom hooks for side effects and data fetching.
- **Component-based UI**: Reusable UI components in `src/components/ui`.
- **Direct Service Integration**: Components often interact with service clients in `src/lib` directly.

## Key Layers
1. **Presentation Layer**: React components in `src/components`.
2. **Logic/State Layer**: Contexts in `src/contexts` and custom hooks.
3. **Service Layer**: Utility functions and client initializers in `src/lib`.
4. **Native Bridge**: Capacitor plugins for hardware access (GPS, Camera, Voice).

## Data Flow
- **Authentication**: `Auth.tsx` -> Supabase Auth.
- **Ride State**: `LiveGroupRide.tsx` -> Supabase Realtime / Socket.io.
- **Payments**: `StripePaymentForm.tsx` -> `src/lib/payments.ts` -> Stripe API.
- **Location**: Capacitor Geolocation -> Map State -> Supabase (for sharing).

## Entry Points
- `src/main.tsx`: React application mount point.
- `src/App.tsx`: Main routing and layout wrapper.
- `index.html`: Base HTML template.

---
*Last updated: 2026-04-24*
