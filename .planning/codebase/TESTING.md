# Testing

## Automated Testing
*No automated testing framework (Jest, Vitest, Cypress) is currently configured in `package.json`.*

## Manual Testing Strategy
Given the mobile nature of the app (Capacitor), testing currently involves:
1. **Web Preview**: Running `npm run dev` and testing in a browser (typically Chrome with mobile emulation).
2. **Native Simulation**: Running on Android Emulator via Capacitor (`npx cap open android`).
3. **Live Testing**: Real-time testing of Supabase integrations and LiveKit sessions.

## Key Test Areas
- **Authentication**: Sign-up, login, and session persistence.
- **Ride Lifecycle**: Group creation, joining, live tracking, and completion.
- **Real-time**: LiveKit audio/video stability and message delivery.
- **Payments**: Stripe Checkout flow and wallet balance updates.
- **Offline Mode**: Behavior when network connectivity is lost.

## Future Recommendations
- **Unit Testing**: Add `vitest` for library functions in `src/lib`.
- **Component Testing**: Add `React Testing Library` for critical UI components.
- **E2E Testing**: Add `Playwright` or `Cypress` for critical flows (Ride booking, Payment).

---
*Last updated: 2026-04-24*
