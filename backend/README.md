# Certificate Portal Backend

Express + TypeScript + Prisma (PostgreSQL) + MinIO (S3-compatible file storage).

## Run everything with Docker (recommended)

From the repo root:

```bash
cp .env.example .env   # edit JWT_SECRET, POSTGRES_PASSWORD, MINIO_SECRET_KEY
docker compose up --build
```

This starts: Postgres, MinIO, the backend API, the built frontend, and an Nginx
reverse proxy on port 80 (`/api/*` → backend, everything else → frontend).

Seed a demo admin + student account:

```bash
docker compose exec backend npm run seed:prod
```

Admin login: `ADMIN001` / `ChangeMe123!`
Student login: `24CU0310001` / DOB `15-03-2005` (as entered on the login form)

**Change the seeded admin password immediately in any real deployment.**

## Local development (without Docker)

Requires a local Postgres and MinIO (or point `DATABASE_URL`/`MINIO_*` at hosted ones).

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

The frontend's `vite.config.ts` proxies `/api` to `http://localhost:4000` in dev, so
`npm run dev` in the repo root works against this backend unchanged.

## API surface

- `POST /api/auth/login` — student login (registerNo + dateOfBirth)
- `POST /api/auth/admin/login` — admin login (registerNo + password)
- `GET /api/auth/me`
- `POST /api/profile/complete-registration`, `PATCH /api/profile`
- `POST/GET /api/transcripts` (multipart file uploads for ID proof, mark sheet, etc.)
- `POST/GET /api/certificates`
- `POST /api/payments/initiate`, `POST /api/payments/callback` (gateway webhook — the
  only place a payment is marked SUCCESS/FAILED), `GET /api/payments/status/:id`,
  `GET /api/payments/history`
- `GET/PATCH /api/admin/transcripts`, `GET/PATCH /api/admin/certificate-requests`,
  `POST /api/admin/*/upload-certificate`, `POST /api/admin/students`
- `GET /api/files?entity=&id=&field=` — issues a short-lived presigned download URL

## Payment gateway integration

`POST /api/payments/callback` is a server-to-server webhook. Wire your real payment
gateway (the frontend types already assume an SRM-style gateway with `srmTransId` /
`pgTransId`) to call this endpoint on completion, signing the payload with
`PAYMENT_GATEWAY_CALLBACK_SECRET` (HMAC-SHA256 of `srmTransId|pgTransId|status`,
sent as `signature`). The frontend must never be trusted to report payment success.
