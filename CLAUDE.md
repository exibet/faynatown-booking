# Faynatown Booking

Web calendar for viewing booking availability at Faynatown residential complex (Kyiv).

## Project Docs

- `docs/SUMMARY.md` — full project summary, scope, API details, tech stack, architecture patterns
- `docs/PLAN.md` — detailed 7-phase implementation plan with checkpoints
- `docs/API.md` — complete Faynatown API documentation (reverse-engineered via mitmproxy)
- `conductor/` — Conductor project-management artifacts (product, tech-stack, workflow, tracks)

Read these files before starting any implementation work.

## Tech Stack

- **Nuxt 4** (SSR)
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **PrimeVue 4** (Aura preset, `@primevue/nuxt-module`)
- **tailwindcss-primeui** — official PrimeVue + Tailwind integration plugin
- **FullCalendar** (`@fullcalendar/vue3`, timeGridWeek view)
- **Zod** — server-side validation
- **@nuxtjs/i18n** — Ukrainian (default) + English
- **TypeScript** — strict, no `any`/`unknown`/`as`

## Architecture

Layering:

- `shared/` — types, constants, API route definitions, fetch keys
- `server/` — API proxy to `webapi.faynatown.com.ua`, auth via httpOnly cookie, Zod validation
- `app/` — composables with `useState`, `$api` with global error toast, PrimeVue components

### botc-tracker as reference

`~/Development/botc-tracker/` is a **structural/architectural reference only** — not a dependency, not a 1:1 template. Use it as the canonical source for:

- Layering of `shared/` / `server/` / `app/` and how types flow between them
- API proxy pattern (server utils, `requireAuth`, Zod `validateBody`)
- `$api` client with global error toast
- Composables with `useState` + `useAsyncData` keyed by `FETCH_KEY.*`
- Emit + refresh pattern (instead of `clearNuxtData`)

Do not copy files verbatim. Domain, routes, and components here are different — replicate the *approach*, adapt the code.

## Code Quality Rules

- Zero `any`, `unknown`, `as` casts
- Zero hardcoded UI strings — all text via i18n (`$t()`)
- `$api` global error handler with PrimeVue Toast
- No reactive object mutation — always spread-replace
- No `clearNuxtData` — use emit + refresh pattern
- Guard skeleton components with proper loading states
- Use `useAsyncData` with `FETCH_KEY.*` — never raw `$fetch` in components
- Server routes must call `requireAuth(event)` first, then `$faynatown()` — never raw `$fetch` to the upstream API

## API Proxy

All requests to Faynatown API go through Nuxt server routes:
- Server adds `version: 45` header (required by API)
- Server adds `Authorization: Bearer <token>` from httpOnly cookie
- This avoids CORS and keeps token secure

## API Quirks (MUST-HAVE — easy to miss, hard to debug)

These are non-obvious behaviors of the upstream Faynatown API. Getting any of these wrong produces silent bugs or 400s with unhelpful messages.

- **`version: 45` header is mandatory on every request** — otherwise API returns 400. Centralize in `$faynatown()` util, never send a request without it.
- **Login returns plain-string JWT**, not JSON. Do NOT parse `response.json()` — read as text. Token is ~90-day validity.
- **Field name typo: `isAvaliable`** (not `isAvailable`) — preserve as-is in types. Do not "fix" it, API will not match.
- **Unavailability is encoded by FIELD ABSENCE, not `false`.** When a slot/zone is unavailable, the `isAvaliable` field is **omitted** from the JSON (API never returns `isAvaliable: false`). The text also gets `(недоступно)` / `(зайнято)` suffixed, but that's for display only — **do not use the text to validate availability**. Wording is localized and could change across API versions; field presence is the contract. Correct check: `item.isAvaliable === true`. Strip the text suffix with `stripUnavailableSuffix` before rendering.
- **Dates have no timezone.** Responses return `2026-04-17T00:00:00` — parse as local time. Never treat as UTC or ISO with Z.
- **`/booking/zones` `slot` param is URL-encoded Ukrainian text** like `з 07:00 по 08:00`. Use `encodeURIComponent()` — it is NOT a time range in standard format.

## PrimeVue + Tailwind v4 Integration (CRITICAL)

Both the CSS file AND `nuxt.config.ts` must reference the **same full layer list**, otherwise Tailwind's preflight (in the `base` layer) strips PrimeVue component styles and buttons/inputs render unstyled.

```css
/* app/assets/css/main.css */
@layer theme, base, primevue, components, utilities;

@import "tailwindcss";
@import "tailwindcss-primeui";
@import "primeicons/primeicons.css";
```

```typescript
// nuxt.config.ts — cssLayer ordering MUST mirror the CSS @layer declaration
cssLayer: {
  name: 'primevue',
  order: 'theme, base, primevue, components, utilities',
}
```

Common mistakes:
- Using only `'primevue, tailwind-utilities'` as the order — missing `theme` and `base` means Tailwind's preflight has no declared slot and leaks into the default cascade, overriding PrimeVue styles. Symptom: PrimeVue buttons show labels only, no background/padding.
- Omitting the top-level `@layer` declaration in CSS — layer ordering becomes file-order-dependent and breaks on HMR.
- Splitting `@import "tailwindcss"` into preflight/theme/utilities — use the single import.

Components are auto-imported by `@primevue/nuxt-module` — do NOT add `import Button from 'primevue/button'` in components, just use `<Button>` in the template.

## Commit Rules

- Never add `Co-Authored-By` line
- Never auto-commit — wait for explicit user request
- Use rebase strategy, no merge commits

## Language

Respond in Ukrainian. Technical terms and code identifiers remain in English.
