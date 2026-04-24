# Integrations

## External Services

### Supabase
- **Role**: Primary backend, database, authentication, and storage.
- **Client**: `src/lib/supabase.ts`
- **Usage**:
  - User Authentication (Email/Password)
  - Real-time ride state synchronization
  - File storage for profiles/media

### Stripe
- **Role**: Payment gateway for wallet funding and ride payments.
- **Client**: `src/lib/payments.ts`
- **Components**: `src/components/StripePaymentForm.tsx`, `src/components/PaymentPortal.tsx`
- **Usage**: Handling transactions and split payments.

### LiveKit
- **Role**: Real-time audio and video conferencing during rides.
- **Usage**: `LiveGroupRide.tsx` and `RideRoom.tsx` for communication between riders.

### OpenWeatherMap (Inferred)
- **Role**: Weather updates for ride planning.
- **Client**: `src/lib/weather.ts`
- **Usage**: Displaying weather conditions during rides.

### Capacitor Plugins
- **Geolocation**: `@capacitor/geolocation`, `@capacitor-community/background-geolocation` for tracking rides.
- **App**: `@capacitor/app` for app lifecycle.
- **Voice Recorder**: `capacitor-voice-recorder` for voice messages/notes.

## Local Integrations
- **Socket.io-client**: `socket.io-client` likely used for custom real-time events outside of Supabase.
- **Leaflet**: Integrated for map rendering and route previews.

---
*Last updated: 2026-04-24*
