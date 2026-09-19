# VaultBank

Your financial credentials. Secured.

VaultBank is a full-stack, production-ready secure credential manager. Account and card
details are encrypted **in your browser** with AES-256-GCM client-side and only ciphertext is
ever sent to the server. The server never sees — and is cryptographically unable to read —
your secrets.

Built with a React + TypeScript SPA, an Express + TypeScript API, and MongoDB.

---

## Highlights

- **Client-side encryption** — secrets are encrypted with AES-256-GCM using a 256-bit vault key
  that is generated and held in the browser, never in the backend.
- **Unlock PIN** — the vault key is wrapped with a user-chosen PIN via PBKDF2-SHA256
  (210,000 iterations). The wrapped blob is the only key material stored server-side, and it is
  additionally encrypted at rest with the server `ENCRYPTION_KEY` (defense in depth).
- **Nevers** — CVV/CVC, card PIN, OTP and 3DS codes are **never stored**. Audit activity logs
  never contain secret values. Logs are redacted of secrets by default.
- **Multi-tenant isolation** — every query is scoped to the verified Clerk `userId` of the
  requesting session; cross-user access (IDOR) is covered by integration tests.
- **Auto-lock** — hidden after a configurable idle timeout (1m / 5m / 15m / 30m / never);
  sensitive reveals are gated behind a confirmation dialog and auto-hide.
- **Security activity** — a non-sensitive audit trail of logins, unlocks, creates/updates,
  reveals and copies.
- **Production hygiene** — helmet, strict CORS by origin list, rate limiting by route class,
  zod validation on every endpoint, sanitization, PIN/password length limits, and an error
  handler that never leaks stack traces.

---

## Monorepo layout

```
bank/
├── package.json          # npm workspaces + scripts
├── client/               # React + Vite SPA
│   ├── src/crypto/       # vaultCrypto (AES-GCM), sessionKey (in-memory key holder)
│   ├── src/contexts/     # VaultProvider, ToastProvider
│   ├── src/pages/        # Dashboard, Banks, Cards, Search, Activity, Security, Settings
│   └── tests/            # client-side crypto tests (vitest)
└── server/               # Express API
    ├── src/modules/      # vault, keys, activity, security
    ├── src/services/     # crypto (AES-GCM at rest), audit
    └── tests/            # crypto, schemas, auth, API, authorization (IDOR) tests
```

---

## Tech stack

| Area     | Stack |
|----------|-------|
| Frontend | React 18, TypeScript, Vite 6, MUI v7, Tailwind 3, React Router 6, React Hook Form + zod, TanStack Query, Clerk React, lucide-react |
| Backend  | Node 20+, Express 4, TypeScript (NodeNext), Mongoose 8, `@clerk/express` JWT verification, zod, helmet, cors, express-rate-limit, pino, compression |
| Data     | MongoDB, `mongodb-memory-server` for tests |
| Tests    | Vitest (server + client) |

---

## Prerequisites

- Node.js 20+ and npm 11+
- A MongoDB instance (local `mongod`, Atlas, or compatible)
- A Clerk application (free tier works) — https://dashboard.clerk.com

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Clerk app

1. Create an application in the Clerk dashboard.
2. Copy the **Publishable Key** (for the client) and the **Secret Key** (for the server).
3. Add `http://localhost:5173` to the app's **Allowed origins**.

### 3. Configure environment

Copy the example env files to real ones:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Fill in:

- `CLERK_SECRET_KEY` — server (found in Clerk dashboard → API Keys)
- `VITE_CLERK_PUBLISHABLE_KEY` — client
- `MONGODB_URI` — Mongo connection string
- `ENCRYPTION_KEY` — generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ Keep `ENCRYPTION_KEY` secret and stable. Rotating it re-encrypts wrapped vault keys.

### 4. Run it

```bash
npm run dev
```

- Client: http://localhost:5173 (proxies `/api` and `/health` to port 5000)
- Server: http://localhost:5000 — health check at http://localhost:5000/health

Sign up in the app → you'll be guided through setting your unlock PIN.

---

## Scripts (run from the repo root)

```bash
npm run dev            # server + client concurrently
npm run build          # build both workspaces        (outputs: server/dist, client/dist)
npm run start          # run the built server
npm run typecheck      # TypeScript check in both workspaces
npm run test           # vitest, server + client
npm run lint           # eslint, server + client
npm run dev:server     # API only
npm run dev:client     # SPA only
```

---

## API overview

All routes (except `/health`) require a valid Clerk JWT (`Authorization: Bearer <token>`).
Responses are wrapped as `{ success, data, message? }`.

| Method   | Path                                  | Purpose                                    |
|----------|---------------------------------------|--------------------------------------------|
| `GET`    | `/api/v1/vault`                       | List credentials (filter: `type`, `favorite`, `q`) |
| `POST`   | `/api/v1/vault`                       | Create a credential (encrypted payload)    |
| `PATCH`  | `/api/v1/vault/:id`                   | Update a credential (re-encrypted ciphertext, new IV) |
| `DELETE` | `/api/v1/vault/:id`                   | Delete a credential                        |
| `GET`    | `/api/v1/vault/overview`              | Counts for the dashboard                   |
| `GET`    | `/api/v1/vault/:id`                   | Fetch a single credential                  |
| `GET`    | `/api/v1/keys`                        | Fetch the wrapped vault key                |
| `PUT`    | `/api/v1/keys`                        | Upsert the wrapped vault key               |
| `DELETE` | `/api/v1/keys`                        | Delete the vault key (vault reset)         |
| `GET`    | `/api/v1/activity`                    | Audit trail (non-sensitive)                |
| `POST`   | `/api/v1/activity`                    | Record an audit event                      |
| `GET`    | `/api/v1/security/status`             | Vault status (`hasUnlockKey`, audit count) |
| `GET`    | `/health`                             | Liveness (no auth)                         |

---

## Security model

### End-to-end encryption
1. On setup, the browser generates a random 32-byte vault key and wraps it with your PIN
   (PBKDF2-SHA256, 210,000 iterations) into `salt + iv + wrappedKey`.
2. The wrapped blob is stored via `PUT /api/v1/keys`. The server encrypts the blob again with
   `ENCRYPTION_KEY` (AES-256-GCM) before writing to MongoDB.
3. Credentials are encrypted client-side with AES-256-GCM using the vault key. The server stores
   only `ciphertext + iv + tag + version` plus searchable metadata.
4. To unlock, the server returns the wrapped blob, the browser unwraps it with your PIN, and the
   vault key lives **only in memory** while unlocked.

### Key recovery caveat (read carefully)
Because the vault key never leaves the client, **if you forget your PIN, your data is
unrecoverable — including by the operator**. There is no password reset for the vault (the
built-in "Reset vault" deletes the key and all credentials). This is the standard trade-off of
client-side encryption and is the reason VaultBank recommends your OS-backed password manager
store the PIN.

### What is never stored
- CVV/CVC, ATM/card PIN, OTP, and 3DS codes (cards simply don't have fields for them)
- Any plaintext secret — the API rejects payloads containing plaintext secret-shaped fields
- The raw vault key in any form the server could decrypt by itself

### Isolation & abuse protection
- Every record carries `userId` from the verified Clerk JWT; all reads/writes filter by it.
- Express-rate-limit presets: general, vault-write, sensitive-read, key, and strict limiter.
- `helmet`, strict CORS origin allow-list, pino redaction, `TRUST_PROXY` opt-in only when
  behind a trusted reverse proxy.

---

## Deployment

### Server
The server builds to `server/dist` (may be run with `npm start`). Recommended:

- **Render / Railway / Fly.io** — build command `npm run build`, start command `npm start`.
- Set all env vars from `server/.env.example`.
- Point `MONGODB_URI` at Atlas/Mongo and set `TRUST_PROXY=1` behind their proxy.
- Set `NODE_ENV=production`, narrow `CORS_ORIGINS` to your domain.

> ⚠️ The server uses Node's `globalThis.crypto` (`crypto.subtle`), which requires Node 20+
> and **Node 22+ on some CDNs/edge runtimes**. Use an LTS Node runtime (≥20) for both
> build and runtime.

### Client
`npm run build -w client` emits a static bundle in `client/dist` that can be served by any
static host (Vercel, Netlify, S3+CloudFront, nginx). Requirements:

- Set `VITE_CLERK_PUBLISHABLE_KEY` at **build time**.
- Either serve it behind the API under the same origin, or set `VITE_API_URL` to the API origin
  and configure Clerk's allowed origins accordingly.

---

## Adding more credential types

1. Add the payload type in `client/src/types/index.ts` and a zod schema in
   `client/src/schemas/vaultSchemas.ts` and `server/src/modules/vault/vault.schemas.ts`.
2. Extend `VaultItemType` and the metadata schema on both sides.
3. Add a form + list card in the client (`src/pages`, `src/components/vault`).
4. Keep the golden rules: never store CVV/PIN/OTP, keep audit logs free of secret values, and
   scope every query to `req.auth.userId`.