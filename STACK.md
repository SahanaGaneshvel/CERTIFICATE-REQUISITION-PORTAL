# Certificate Requisition Portal — Stack & Implementation Notes

This document explains the technology stack, what was built, and how the pieces fit
together, for the Hindustan Institute of Technology & Science (HITS) Certificate
Requisition Portal.

## What the system does

Students log in, apply for transcripts or other certificates (with document uploads),
pay a fee, and the request goes to the admin office. The admin office reviews the
request, generates the certificate, and uploads it back for the student to download.

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Pre-existing; only the data layer was rewired, no UI redesign |
| Backend | Node.js + Express + TypeScript | New |
| ORM / DB access | Prisma | New |
| Database | PostgreSQL 16 | New |
| File storage | MinIO (S3-compatible) | New — ID proofs, mark sheets, generated certificates |
| Auth | JWT (jsonwebtoken) + bcrypt | New — student (register no. + DOB) and admin (register no. + password) roles |
| Reverse proxy | Nginx | New — routes `/api/*` to the backend, everything else to the frontend |
| Containerization | Docker + Docker Compose | New — 5 services: postgres, minio, backend, frontend, nginx |

## Backend structure (`backend/`)

```
backend/
  src/
    index.ts              Express app entrypoint
    lib/
      env.ts               typed environment variable loading
      prisma.ts             Prisma client singleton
      storage.ts            MinIO client + upload/presign helpers
      audit.ts               audit log writer
    middleware/
      auth.ts                 JWT verification + role guard
      upload.ts                multer (memory storage, type/size limited)
      errorHandler.ts           centralized error + 404 handling
    routes/
      auth.ts                    student/admin login, /me
      profile.ts                   registration completion, profile updates
      transcript.ts                  transcript application CRUD + file upload
      certificate.ts                   certificate request CRUD
      payment.ts                        initiate/callback/status/history + dev mock gateway
      admin.ts                           review queues, status updates, certificate upload, student creation
      files.ts                            presigned download URL issuance
  prisma/
    schema.prisma        data model (see below)
    migrations/            generated SQL migrations (checked in)
    seed.ts                 demo admin + student accounts
  Dockerfile
  .env.example
```

## Data model

- **User** — students and admins in one table, distinguished by `role`. Students log
  in with register number + date of birth (hashed and stored as their password).
  Admins log in with register number + a real password.
- **TranscriptApplication** — sets/envelopes requested, collection mode, authorized
  person details, uploaded document keys, fee, status (`PENDING → APPLIED →
  PROCESSING → READY → COLLECTED`, or `REJECTED`), payment status.
- **CertificateRequest** — certificate type + purpose, status (`PENDING → GENERATED
  → DOWNLOADED`, or `REJECTED`), payment status.
- **Payment** — one row per payment attempt, linked to either a transcript
  application or a certificate request, tracks `srmTransId`/`pgTransId` (matching the
  frontend's existing type definitions) and status.
- **AuditLog** — who did what, to which record, and when — written on every
  state-changing action (submission, status change, certificate upload, payment
  callback).

Files (ID proofs, mark sheets, generated certificates) are never stored in Postgres —
only their MinIO object keys are. Downloads go through a presigned URL endpoint that
checks the requester owns the record (or is an admin) before issuing a short-lived
URL.

## Payment flow

1. Student submits a transcript/certificate request → backend computes the fee
   server-side and stores the request as `PENDING`.
2. Student clicks pay → frontend calls `POST /api/payments/initiate`, which creates a
   `PENDING` Payment row and an `srmTransId`.
3. **No real payment gateway is integrated yet.** In its place, a dev-only
   `POST /api/payments/mock-complete` endpoint marks the payment SUCCESS/FAILED
   directly — the frontend calls it right after `initiate` so the flow is testable
   end-to-end. This route is compiled out whenever `NODE_ENV=production`.
4. In production, wire a real gateway to redirect the browser for payment, then call
   `POST /api/payments/callback` server-to-server with a signed payload (HMAC-SHA256
   of `srmTransId|pgTransId|status`, keyed by `PAYMENT_GATEWAY_CALLBACK_SECRET`) —
   **this callback is the only place a payment is ever marked successful.** The
   frontend is never trusted to self-report payment success.
5. `PaymentSuccess`/`PaymentFailed` pages poll `GET /api/payments/status/:srmTransId`
   to render the real outcome.

## Frontend wiring done

- `src/lib/api.ts` — fetch wrapper that attaches the JWT and normalizes errors.
- `src/context/AuthContext.tsx` — now calls the real `/api/auth/login` and
  `/api/profile/complete-registration` instead of a mocked `setTimeout`.
- `TranscriptApplication.tsx` — submits as `multipart/form-data` with real file
  uploads, computes the fee the same way the backend does, routes to Payment with a
  real `entityId`.
- `CourseCompletion.tsx` — creates real certificate requests, lists the student's
  actual requests, downloads generated certificates via presigned URLs.
- `Payment.tsx` — calls `/api/payments/initiate` (+ the dev mock-complete stand-in),
  no longer randomly succeeds/fails client-side.
- `PaymentSuccess.tsx` — polls real payment status instead of trusting router state;
  redirects to the failed page if the backend says the payment failed.
- `PaymentFailed.tsx` — shows the real transaction id when available.
- `PaymentHistory.tsx` — lists the student's actual payment history instead of eight
  hardcoded rows.
- `Dashboard.tsx` — recent applications and stat counts come from real transcript +
  certificate data instead of two hardcoded rows.
- `vite.config.ts` — dev server proxies `/api` to `http://localhost:4000`.

**Not wired**: there is no admin dashboard UI yet — admin review/approval/certificate
upload can be exercised via the API (`/api/admin/*`) but has no frontend. `Profile.tsx`
already read from `useAuth()`, so it picked up real data automatically once login
became real.

## Docker Compose stack

Root `docker-compose.yml` runs 5 services:

- `postgres` — Postgres 16, persisted volume, health-checked
- `minio` — S3-compatible object storage, persisted volume, health-checked
- `backend` — builds `backend/Dockerfile`, runs `prisma migrate deploy` on boot, then
  starts the API
- `frontend` — builds the Vite app, serves the static output via Nginx
- `nginx` — reverse proxy on port 80: `/api/*` → backend, everything else → frontend

```bash
cp .env.example .env        # fill in real secrets before any non-local use
docker compose up --build -d
docker compose exec backend npm run seed:prod   # demo admin + student accounts
```

Backend README (`backend/README.md`) has the full command reference and API surface
list.

## What was verified locally

- `npx tsc --noEmit` passes in `backend/` (no type errors)
- `npm run build` passes in the frontend (no type errors, production bundle builds)
- `docker compose build` succeeds for both `backend` and `frontend` images
- `docker compose up -d` brings up all 5 containers; `postgres` and `minio` report
  healthy
- Prisma migration `20260827141709_init` was generated against the real schema,
  applied to the running database, and baked into the backend image so
  `prisma migrate deploy` applies it automatically on any fresh container start
- `npm run seed:prod` (the compiled seed script, run inside the container) seeds a
  demo admin (`ADMIN001` / `ChangeMe123!`) and student (`RA2311003010079`, DOB
  `15-03-2005`) account
- End-to-end request flow verified via curl through the Nginx reverse proxy on port
  80: student login → JWT issued → `GET /api/auth/me` with the token → admin login →
  student creates a certificate request → admin sees it in
  `GET /api/admin/certificate-requests`. Frontend also confirmed serving (`GET /`
  returns 200 through Nginx).

**Not verified**: a full click-through in an actual browser (forms, file uploads,
the payment flow UI, admin actions) — only the API surface was exercised via curl.
Docker Desktop did crash once mid-session ("Docker Desktop is unable to start") but
recovered on restart with no state loss; a bug found afterward (the `seed:prod`
TypeScript compile step in `backend/Dockerfile` used an invalid `tsc` flag
combination, and the compiled output path didn't match `package.json`) has been
fixed and re-verified.

## Suggested next steps

1. Re-verify `docker compose up --build -d` end-to-end once Docker Desktop is stable,
   including `npm run seed:prod`.
2. Build an admin dashboard UI (list pending requests, approve/reject, upload
   generated certificates) — the API already supports all of this.
3. Integrate a real payment gateway and remove the dev-only `/payments/mock-complete`
   route's reliance once that's done (it already self-disables when
   `NODE_ENV=production`, but should be deleted once real is verified).
4. **Change the seeded admin password** before any real/shared deployment.
5. Set up automated Postgres backups (`pg_dump` on a schedule, shipped off the VPS)
   before going to production — see the earlier stack/VPS recommendation for hosting
   options (Hetzner CX22/CX32 class VPS, Nginx + Let's Encrypt for TLS, Docker Compose
   as the deployment mechanism).
