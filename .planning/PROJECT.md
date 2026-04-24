# Project: Velocity App

## What This Is
Velocity is a premium mobile-first application designed for riders (motorcyclists, cyclists) to organize, track, and share group rides ("formations"). It features real-time audio/video communication, live GPS tracking, payment splitting, and ride analytics.

## Core Value
Providing a unified, high-performance platform for rider communities that combines logistics, communication, and safety.

## Context
The project is a React + Capacitor application integrated with Supabase for the backend and Stripe for payments. It is currently in a "brownfield" state with a solid foundation of core features already implemented.

## Requirements

### Validated
- ✓ **Authentication**: Secure user login/signup via Supabase.
- ✓ **Real-time Comms**: Integrated LiveKit for high-quality audio/video during rides.
- ✓ **Map Logistics**: Leaflet-powered maps for route preview and live tracking.
- ✓ **Group Management**: Creating, joining, and managing riding squads.
- ✓ **Payments & Wallet**: Stripe integration for wallet funding and split payments.
- ✓ **Ride Telemetry**: Tracking distance, speed, and duration.
- ✓ **Premium UI**: Modern, animated interface with dark mode support.
- ✓ **Offline Resilience**: Basic support for offline operation with notification.

### Active
- [ ] **Automated Testing**: Implement unit and E2E tests for critical flows.
- [ ] **Routing Refactor**: Transition from manual state-based routing to a robust router.
- [ ] **Native Stability**: Enhance Capacitor plugin reliability across different devices.
- [ ] **Performance Optimization**: Optimize asset loading and real-time data sync.

### Out of Scope
- **Web-only Version**: The app is strictly mobile-first via Capacitor; full desktop web support is not a current priority.
- **Hardware Integration**: Integration with specific bike sensors (OBD-II) is deferred to future milestones.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Capacitor | Cross-platform mobile development using web technologies. | Validated |
| Supabase | All-in-one backend for database, auth, and real-time. | Validated |
| LiveKit | Superior performance for real-time audio/video over custom WebRTC. | Validated |
| Manual Routing | Quick development of single-page view transitions. | Needs Review |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---
*Last updated: 2026-04-24 after initialization*
