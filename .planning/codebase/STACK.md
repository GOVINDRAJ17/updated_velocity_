# Stack

## Overview
- **Type**: Mobile-first Web Application (Capacitor)
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## Core Technologies
| Category | Technology | Purpose |
|----------|------------|---------|
| Frontend Framework | React 18 | UI logic and component lifecycle |
| Build Tool | Vite 6 | Development server and bundling |
| Mobile Bridge | Capacitor 8 | Native functionality (Android/iOS) |
| Database/Auth | Supabase | Persistence, user management, real-time |
| Styling | Tailwind CSS 4 | Atomic CSS styling |
| Mapping | Leaflet / React Leaflet | Map visualization and interactions |
| Components | Radix UI / Shadcn | Accessible UI primitives |
| Animation | Framer Motion | Fluid transitions and micro-interactions |
| Real-time | LiveKit / Socket.io | Audio/Video and real-time messaging |
| Payments | Stripe | Payment processing and wallet funding |

## Key Dependencies
- `@capacitor/core`, `@capacitor/android`: Native bridge
- `@supabase/supabase-js`: Backend interaction
- `framer-motion`: Animations
- `leaflet`, `react-leaflet`: Maps
- `recharts`: Data visualization (Ride Analytics)
- `lucide-react`: Iconography
- `sonner`: Toast notifications
- `livekit-client`: Audio/Video conferencing

## Development Configuration
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration
- `capacitor.config.json`: Capacitor mobile settings
- `.env.local`: Environment variables (Supabase, Stripe, etc.)

---
*Last updated: 2026-04-24*
