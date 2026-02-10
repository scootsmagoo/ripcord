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

## Learn More

To learn more about Next.js, review:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
