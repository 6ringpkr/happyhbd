# Baby Birthday Party Invitation App – Technical Documentation (Context7)

## Overview

This Next.js application delivers a complete digital invitation workflow backed by Google Sheets:
- Personalized invite pages at `/invites/[guestId]`
- RSVP capture with status tracking
- Godparent acceptance with legal name entry
- Admin dashboard for generating invites (single/bulk), viewing stats, exporting CSV, and downloading QR codes

Key runtime ports: dev and start run on port 4000 (`package.json`).

## Stack

- Next.js 15.4.6 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui components
- SWR for client-side data fetching
- Google Sheets for persistence via `googleapis`
- `qrcode` for server-side PNG generation

## Environment

Create `.env.local`:

```
ADMIN_PASSWORD=your-strong-password
GOOGLE_SHEET_ID=...
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# optional
GOOGLE_SHEET_NAME=Sheet1
```

Share the spreadsheet with `GOOGLE_CLIENT_EMAIL`.

## Data Model (Google Sheets)

Worksheet columns A:G:
- A: `name`
- B: `uniqueId`
- C: `status` (Pending|Confirmed|Declined)
- D: `rsvpAt` (YYYY-MM-DD)
- E: `isGodparent` (TRUE|FALSE)
- F: `godparentAcceptedAt` (YYYY-MM-DD)
- G: `godparentFullName`

TypeScript interface used across the app (`src/lib/google-sheets.ts`):

```ts
export interface Guest {
  name: string;
  uniqueId: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  rsvpAt: string;
  isGodparent: boolean;
  godparentAcceptedAt: string;
  godparentFullName: string;
}
```

## Core Library: `src/lib/google-sheets.ts`

- Lazy-authenticates a JWT client using env vars (reads at request time)
- Normalizes `GOOGLE_PRIVATE_KEY` line breaks via `replace(/\\n/g, "\n")`
- Caches the Sheets client across requests in-process
- Key functions:
  - `addGuest(name, isGodparent)` → creates a slug `uniqueId`, dedupes by Column B, appends A:G
  - `addGuestsBulk(items[])` → batches multiple rows, dedupe pre-scan of Column B
  - `findGuestByUniqueId(uniqueId)` → reads grid data for A:G and returns row index
  - `updateRsvp(uniqueId, status)` → updates C:D with status and ISO date
  - `acceptGodparentRole(uniqueId, fullName)` → updates F:G with ISO date and name
  - `listGuests()` → returns all rows mapped to `Guest` objects with row index

## App Structure

- `src/app/layout.tsx`: global layout, fonts, `globals.css`
- `src/app/page.tsx`: admin login (client component)
- `src/app/admin/page.tsx`: admin dashboard (client), uses SWR to list guests, generate invites, bulk upload, and export CSV
- `src/app/invites/[guestId]/page.tsx`: server page that fetches guest via internal API using request `headers()` to compute origin; RSVP and godparent accept flows
- `src/app/thank-you/page.tsx`: server page confirming RSVP and rendering a reusable QR image
- `src/middleware.ts`: protects `/admin`, `/api/generate-invite`, `/api/bulk-invites` via `admin_session` cookie; redirects to `/` with `?next=...`

UI: shadcn components in `src/components/ui` (button, card, input, tabs, table, alert, etc.) and dashboard components in `src/app/admin/components`.

## Authentication & Middleware

- `POST /api/admin-login` compares `FormData.get('password')` to `process.env.ADMIN_PASSWORD`.
- On success, sets `admin_session` cookie `{ httpOnly: true, sameSite: 'lax', secure: false, maxAge: 8h }`.
- Middleware checks the cookie on protected paths and redirects unauthenticated users to `/` with `next` parameter.
- For production over HTTPS, set cookie option `secure: true`.

## API Reference

- `POST /api/admin-login`
  - Body: `FormData { password }`
  - Response: `{ ok: true }` and sets `admin_session` cookie

- `GET /api/guests`
  - `?id=<uniqueId>` (alias `?uniqueId=`) → `{ guest }`
  - No `id` → `{ guests }`

- `POST /api/generate-invite` (protected)
  - Body: `FormData { name, isGodparent?: 'on'|'true' }`
  - Response: `{ ok: true, inviteUrl: '/invites/<uniqueId>', guest }`

- `POST /api/bulk-invites` (protected)
  - `application/json` or `multipart/form-data`
  - Payload: `{ items: Array<{ name: string; isGodparent?: boolean }> }`
  - Response: `{ ok: true, created, links: [{ name, inviteUrl }] }`

- `POST /api/rsvp`
  - Body: `FormData { uniqueId, status: 'Confirmed'|'Declined' }`
  - Response: `{ ok: true, status }`

- `POST /api/godparent-accept`
  - Body: `FormData { uniqueId, fullName, accept: 'yes' }`
  - Response: `{ ok: true }`

- `GET /api/qr`
  - Query: `?url=/invites/<uniqueId>&size=128..1024`
  - Returns PNG with cache headers

Example usage:

```bash
curl -i -X POST -F password=secret http://localhost:4000/api/admin-login
curl -s http://localhost:4000/api/guests | jq .
curl -i -X POST -F name="Jane Doe" -F isGodparent=on http://localhost:4000/api/generate-invite
curl -i -X POST -F uniqueId=guest-1 -F status=Confirmed http://localhost:4000/api/rsvp
```

## Frontend Flows

- Invite page: shows greeting, event details, countdown, conditional godparent acceptance UI, and RSVP form. Client-side JS progressively enhances forms and redirects to `/thank-you?uniqueId=...&status=...`.
- Admin dashboard: search, sort, and auto-refresh (optional) via SWR. Single invite generation with immediate QR preview; bulk CSV upload with `name,isGodparent` headers; export CSV; per-row copy and QR download.

## Performance & Caching

- Invite and Thank You pages compute `origin` from `headers()` and use `fetch(..., { cache: 'no-store' })` to always reflect latest Sheet state.
- Using Dynamic APIs (`headers`, `searchParams`) opts routes out of Full Route Cache, ensuring dynamic rendering.

## Security Practices

- Store secrets in `.env.local`; never commit keys.
- Restrict spreadsheet access to the service account email.
- Prefer `secure: true` when deploying behind HTTPS.
- Validate CSV inputs; the server already trims and filters empty names.

## Troubleshooting

- 500 with credentials error: verify all `GOOGLE_*` envs and private key newline escaping.
- 404 Not Found for invite: verify `uniqueId` exists in Column B.
- Middleware redirect loop: confirm cookie is set and protected-list matches actual endpoints.
- Permission errors: ensure sheet is shared with the service account and correct `GOOGLE_SHEET_ID` is used.

## Build & Scripts

```
npm run dev    # Next dev on :4000
npm run build  # Production build
npm start      # Next start on :4000
npm run lint
```

## References (Context7)

- Next.js
  - App Router request data (`headers`, `cookies`) and dynamic rendering: `https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/04-functions/headers.mdx`
  - Caching and dynamic APIs: `https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/caching.mdx`
  - Route Handlers & Middleware: `https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/15-route-handlers-and-middleware.mdx`

- SWR: `https://swr.vercel.app`

- Google APIs (Node client): `https://github.com/googleapis/google-api-nodejs-client`

- node-qrcode: `https://github.com/soldair/node-qrcode`

---

This appendix documents behavior based on the current `src/` code and `package.json` scripts.

