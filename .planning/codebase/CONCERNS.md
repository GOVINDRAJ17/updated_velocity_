# Concerns

## Technical Debt
- **Manual Routing**: `App.tsx` uses a manual `useState` based routing system. As the app grows, this will become difficult to manage compared to a standard router like `react-router-dom` or `TanStack Router`.
- **Large Components**: Several components are very large (e.g., `Profile.tsx` is ~50KB, `Home.tsx` is ~20KB), indicating they could be broken down into smaller, more focused components.
- **Dev Mode Hack**: `devModeBypass` in `App.tsx` allows skipping authentication via a hidden context menu. This must be removed before production.

## Security
- **API Key Management**: The app relies on `.env.local` for Supabase and Stripe keys. Ensure these are not committed and are properly injected in CI/CD.
- **Client-Side Secrets**: Any logic relying on secrets in the frontend is inherently insecure.

## Reliability
- **Testing**: Zero automated testing coverage. Critical paths like payments and ride creation are high-risk.
- **Error Handling**: While `safeFetch` exists, it relies on global custom events which might be harder to trace than a robust error reporting service.

## Performance
- **Asset Loading**: Heavy use of external images (Unsplash) and gradients might impact initial load time on slow mobile connections.
- **Real-time Overhead**: Managing multiple real-time connections (Supabase + LiveKit + Socket.io) could be taxing on mobile battery and data.

---
*Last updated: 2026-04-24*
