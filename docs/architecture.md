# Ripcord Baseline Architecture

## Goals

- Web-first messaging client with production-ready foundation.
- WCAG-first UX defaults and secure-by-default backend integration.
- Spacebar-compatible API client layer for future mobile reuse.

## Current Structure

- `src/app`: Next.js App Router UI and API routes.
- `src/lib`: Shared infrastructure code (env validation, future API client/services).
- `src/proxy.ts`: Cross-site mutation defense and request ID propagation.
- `src/components`: Accessible client-side UI modules.

## Baseline Security Design

- Strict CSP + security headers configured in `next.config.ts`.
- Cross-site `POST/PUT/PATCH/DELETE` blocked in proxy when origin mismatches.
- Typed and validated environment variables using Zod.
- Spacebar API calls routed server-side to keep credentials off the browser.
- Session token stored in encrypted HTTP-only cookies.
- Double-submit CSRF token required for cookie-authenticated mutation endpoints.
- In-memory rate limiting guards against login brute-force spikes.
- Health endpoint at `/api/health` for readiness and uptime checks.

## Accessibility Baseline

- Skip link in root layout for keyboard users.
- Global visible focus ring and reduced-motion support.
- Semantic landmarks (`main`, `header`, `section`) and heading hierarchy.
- Login and status messaging uses labeled controls and ARIA live regions.

## Next Implementation Layer

1. Add websocket event service for live channels/messages.
2. Add API rate limiting and login attempt throttling.
3. Implement explicit CSRF token checks for all cookie-authenticated mutations.
4. Add test suites for accessibility, auth controls, and API hardening.
