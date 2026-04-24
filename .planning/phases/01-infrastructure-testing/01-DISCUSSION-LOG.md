# Phase 1: Infrastructure & Testing - Discussion Log

## 01. Testing Framework Choice
- **Options**: Vitest, Jest.
- **Decision**: Vitest.
- **Rationale**: Project uses Vite 6; Vitest provides the fastest and most compatible testing experience.

## 02. E2E Framework Choice
- **Options**: Playwright, Cypress.
- **Decision**: Playwright.
- **Rationale**: Superior performance and modern features compared to Cypress.

## 03. Native Stability Strategy
- **Decision**: Platform-aware checks before Capacitor calls. Use existing Toast system for user feedback.

## 04. Code Cleanup
- **Decision**: Immediate removal of `devModeBypass` to ensure security integrity.

---
*Date: 2026-04-24*
