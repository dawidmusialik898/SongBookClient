# 11 - Production Readiness

## Goal

Turn the finished learning application into a deliberately deployable service.
"Production ready" does not mean adding every possible technology. It means
making explicit decisions about hosting, data, security, monitoring, and
failure recovery before real users depend on the application.

Do this only after the local CRUD workflow from the earlier guides is complete.
The current global `lite-server`, in-memory repository, local certificate, and
localhost CORS policy are development tools, not a production deployment.

## Start with product decisions

Before choosing infrastructure, answer these questions:

1. Who may read songs?
2. Who may create, edit, or delete songs?
3. Is song content private, public, or shared with a known group?
4. Must data survive server restarts and deployments?
5. How much downtime or data loss is acceptable?
6. Which domain name will users visit?
7. Who receives alerts when the API is unavailable?

The answers determine which security, authentication, backup, and hosting work
is necessary. Do not copy a production checklist blindly into a small personal
project.

## Recommended deployment shape

For this small application, prefer one public HTTPS origin:

```text
https://songbook.example
  -> static client files
  -> /api/... requests handled by the SongBook API
```

With a single origin, the browser does not need CORS for normal application
requests. The frontend can use a relative API base URL such as `/api/songs`
instead of a localhost URL.

If the frontend and API must be hosted separately, use two fixed HTTPS origins:

```text
https://app.example
  -> browser client

https://api.example
  -> SongBook API
```

In that design, the API CORS policy must allow exactly
`https://app.example`. Do not carry `localhost` development origins or
`AllowAnyOrigin()` into production.

## Required areas of work

| Area | What needs to change | Why it matters |
| --- | --- | --- |
| Hosting | Replace lite-server with a real static host, reverse proxy, or ASP.NET Core static-file hosting. | Lite-server is a local development server, not a hardened public web server. |
| Frontend configuration | Remove hard-coded localhost URLs from release code; use a relative path or deployment-specific configuration. | A browser in production cannot reach your development machine. |
| Persistence | Replace `InMemorySongRepository` with a database-backed repository and migrations. | Server restarts currently erase songs. |
| Data protection | Back up the database and practice restoring a backup. | A database without tested restores is not reliable storage. |
| API validation | Use request DTOs and validate every create/update request on the server. | Browsers are not the only possible API callers. |
| Identity | Add authentication and authorization before allowing untrusted people to write or delete data. | `POST`, `PUT`, and `DELETE` must not be publicly writable by accident. |
| Secrets | Put connection strings, signing keys, and credentials in deployment secrets or environment variables. | Source control and frontend JavaScript cannot safely hold secrets. |
| Transport security | Use a trusted HTTPS certificate, redirect HTTP, and enable HSTS only after HTTPS is working. | Protects data and login sessions in transit. |
| Browser security | Configure precise CORS, security headers, and a Content Security Policy that matches the actual site. | Reduces cross-origin and script-injection risk. |
| Reliability | Add structured logs, health checks, safe error responses, and monitoring. | Operators need to discover and diagnose failures. |
| Delivery | Add repeatable build, test, migration, and deployment steps. | Manual releases are hard to reproduce and roll back. |

## Frontend changes

### 1. Make API configuration deployable

The local `SongsApiUrl` is correct for development. For a release, choose one
of these approaches:

- **Same origin, recommended:** use a relative API URL such as `/api/songs`.
- **Separate origins:** generate or serve a small public configuration file
  containing the production API URL.
- **Build-time replacement:** use a build tool to replace a placeholder URL
  during deployment.

Do not place secrets in `config.js`. A browser user can read every JavaScript
file and every public configuration value.

### 2. Serve static files correctly

Deploy the client as static files through a production web server, a CDN, or
the API host. Configure:

- HTTPS for the public domain.
- Cache headers for versioned CSS and JavaScript assets.
- A non-cached or short-cached HTML entry page so new releases are found.
- A fallback/error page appropriate for the hosting model.

Vanilla JavaScript does not require a bundler to deploy. Minification or asset
fingerprinting can be added later when caching and payload size justify it.

### 3. Keep user feedback safe

Continue showing useful error messages, but never display stack traces,
connection strings, raw exception details, or authorization tokens. Log
technical detail on the server instead.

## API and data changes

### 1. Persist songs

Replace the static in-memory dictionary with a persistent database. A
relational database and Entity Framework Core migrations are a common .NET
starting point, but another durable store is acceptable if it supports your
query and backup needs.

Plan these before moving data:

- Schema for songs, parts, and part ordering.
- Migration process for every deployment.
- Development, staging, and production connection configuration.
- Automated backup schedule.
- Restore procedure and a test restore.

### 2. Stabilize the API contract

Complete the route-ID and part-ID work from document 02. Define separate
request and response DTOs where useful, validate input, and document response
status codes.

Use `ProblemDetails` or another consistent JSON error shape so the client can
handle validation, not-found, conflict, and server errors predictably.

### 3. Protect write operations

If real users can access the site, decide the authorization model before
deployment:

- A single administrator account.
- Named users with roles such as reader and editor.
- An external identity provider.
- A private network application with infrastructure-level access controls.

Require authorization for every mutating endpoint. Authentication alone is not
enough; authenticated readers should not automatically be allowed to delete
songs.

### 4. Harden the service boundary

Add only controls that fit the expected use:

- Rate limiting for public or untrusted traffic.
- Request-size limits for lyrics and other text.
- Secure cookie or token settings if authentication is added.
- Explicit CORS origins when client and API are separate.
- Health endpoints for load balancers and monitoring.
- Structured logs with request context but without song text or secrets unless
  there is a justified logging policy.

## Deployment workflow

Create a repeatable release process before the first real deployment:

1. Run client and API tests.
2. Build the API and prepare static client assets.
3. Run database migrations in a controlled step.
4. Deploy to a staging environment with production-like configuration.
5. Exercise the CRUD acceptance script against staging.
6. Confirm logs, health checks, and backup status.
7. Deploy the production release.
8. Verify a basic health endpoint and one read-only user journey.
9. Monitor errors and rollback if the release is unhealthy.

Keep environment values out of source control. A deployment pipeline should
inject them from a protected secret store or hosting configuration.

## Security baseline

Before exposing the application publicly, verify:

- [ ] Production uses a trusted HTTPS certificate.
- [ ] HTTP redirects to HTTPS.
- [ ] Production CORS contains only necessary HTTPS origins.
- [ ] No development origins, wildcard CORS, or local certificates are used.
- [ ] Write endpoints require the intended authorization.
- [ ] Database credentials and signing secrets are not committed.
- [ ] Server errors return safe, consistent responses.
- [ ] Dependency vulnerability alerts are reviewed and addressed.
- [ ] Request and authentication logs do not contain secrets.
- [ ] Database backups exist and at least one restore has been tested.

## Alternatives

### Same-origin ASP.NET Core hosting

Host the static client files from the API application or a reverse proxy in
front of it.

- Good for: a small application with one deployment unit and no production
  CORS requirement.
- Trade-off: frontend and API releases are coupled.

### Separate static host and API

Host the client on a CDN or static hosting service and the API elsewhere.

- Good for: independent frontend caching and deployment.
- Trade-off: requires production CORS, cross-origin configuration, and more
  deployment coordination.

### Managed platform services

Use a managed database, identity provider, and hosted application platform.

- Good for: reducing infrastructure maintenance.
- Trade-off: platform costs, vendor-specific configuration, and a learning
  curve.

### Private deployment

Deploy only within a trusted network or VPN.

- Good for: a small group with controlled access.
- Trade-off: network restrictions do not replace application authorization,
  backups, or safe data handling.

## Resources

- [Microsoft: ASP.NET Core deployment overview](https://learn.microsoft.com/aspnet/core/host-and-deploy/)
- [Microsoft: ASP.NET Core configuration](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/)
- [Microsoft: ASP.NET Core authentication and authorization](https://learn.microsoft.com/aspnet/core/security/authentication/)
- [Microsoft: ASP.NET Core health checks](https://learn.microsoft.com/aspnet/core/host-and-deploy/health-checks)
- [Microsoft: ASP.NET Core rate limiting](https://learn.microsoft.com/aspnet/core/performance/rate-limit)
- [OWASP: Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)

## Checkpoint

This point is complete when the application has a documented production
architecture, durable and recoverable storage, protected write operations,
environment-specific configuration, a repeatable deployment process, and
enough monitoring to discover a failure before users report it.

