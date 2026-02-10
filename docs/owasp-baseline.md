# OWASP Baseline (ASVS-inspired)

Use this checklist for every feature and pull request.

## Identity and Access

- [ ] Authentication is server-validated (never trust client role claims).
- [ ] Session cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter.
- [ ] Authorization checks happen on every privileged API route.
- [ ] Role/permission changes are audited.

## Input and Output Handling

- [ ] All user input is validated with explicit schema rules.
- [ ] Rich text and uploads are sanitized and content-scanned.
- [ ] No dynamic code execution from user input.
- [ ] Error responses avoid leaking internals, stack traces, or secrets.

## API and Transport Security

- [ ] HTTPS everywhere in production.
- [ ] CSRF protections are active for cookie-authenticated mutation routes.
- [ ] CORS is deny-by-default and explicitly allowlisted.
- [ ] Security headers are present and verified in CI.

## Secrets and Configuration

- [ ] No secrets committed to source control.
- [ ] Required environment variables are validated at boot.
- [ ] Credentials are rotated and managed with a secret manager.
- [ ] Dependency updates are regularly applied.

## Observability and Abuse Protection

- [ ] Auth and admin actions emit structured audit logs.
- [ ] Rate limiting applied to auth, invite, and messaging endpoints.
- [ ] Monitoring/alerts configured for auth spikes and 4xx/5xx anomalies.
- [ ] Incident response runbook is documented.
