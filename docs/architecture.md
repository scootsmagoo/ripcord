# Ripcord Baseline Architecture

## Goals

- Web-first messaging client with production-ready foundation.
- WCAG-first UX defaults and secure-by-default backend integration.
- Spacebar-compatible API client layer for future mobile reuse.

## Current Structure

- `src/app`: Next.js App Router UI and API routes.
- `src/lib`: Shared infrastructure code (env validation, future API client/services).
- `src/proxy.ts`: Cross-site mutation defense and request ID propagation.

## Baseline Security Design

- Strict CSP + security headers configured in `next.config.ts`.
- Cross-site `POST/PUT/PATCH/DELETE` blocked in proxy when origin mismatches.
- Typed and validated environment variables using Zod.
- Health endpoint at `/api/health` for readiness and uptime checks.

## Accessibility Baseline

- Skip link in root layout for keyboard users.
- Global visible focus ring and reduced-motion support.
- Semantic landmarks (`main`, `header`, `section`) and heading hierarchy.

## Next Implementation Layer

1. Build a typed API gateway for Spacebar-compatible REST calls.
2. Add websocket event service for live channels/messages.
3. Implement secure cookie-based auth + CSRF token strategy for same-site clients.
4. Add test suites for accessibility, auth controls, and API hardening.
