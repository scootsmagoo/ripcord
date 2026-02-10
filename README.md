# Ripcord Web

Web-first baseline infrastructure for a Discord-style app with security and accessibility defaults.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create local env values:

```bash
cp .env.example .env.local
```

Set:

- `SPACEBAR_BASE_URL` to your Spacebar API host (example: `http://localhost:1337`)
- `SESSION_ENCRYPTION_KEY` to a 32-byte base64url key

3. Run development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Baseline Standards

- OWASP checklist: `docs/owasp-baseline.md`
- WCAG checklist: `docs/wcag-baseline.md`
- Architecture notes: `docs/architecture.md`

## Project Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run validate
```

## Security Defaults Included

- CSP and secure HTTP headers in `next.config.ts`
- Cross-site mutation request blocking in `src/proxy.ts`
- Request ID propagation for future tracing (`x-request-id`)
- Zod-based environment schema in `src/lib/env.server.ts`
- Encrypted HTTP-only session cookies in `src/lib/session.server.ts`
- Double-submit CSRF protection in `src/lib/csrf.server.ts`
- Login rate limiting in `src/lib/rate-limit.server.ts`
- Open signup route in `src/app/api/auth/register/route.ts`
- Server-side Spacebar integration routes under `src/app/api/`

## Learn More

To learn more about Next.js, review:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
