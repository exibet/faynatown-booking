# Faynatown Booking

Web calendar for viewing booking availability at Faynatown residential complex (Kyiv).

## Project Docs

- `docs/SUMMARY.md` — full project summary, scope, API details, tech stack, architecture patterns
- `docs/PLAN.md` — detailed 7-phase implementation plan with checkpoints
- `docs/API.md` — complete Faynatown API documentation (reverse-engineered via mitmproxy)
- `docs/design_handoff/` — hifi design reference (desktop + mobile)
- `conductor/` — Conductor project-management artifacts (product, tech-stack, workflow, tracks)

Read these files before starting any implementation work.

## Tech Stack

- **Nuxt 4** (SPA mode, `ssr: false` in `nuxt.config.ts` — residents-only tool, Bearer-only auth, SSR gave no user-visible win) + **Vue 3.5**
- **Pure CSS** on OKLCH tokens (`app/assets/css/{tokens,base,desktop,mobile}.css`) — no PrimeVue, no Tailwind, no UI framework
- **Custom calendar grid** (`app/components/calendar/WeekGrid.vue` + `SlotButton.vue`) — no FullCalendar
- **Zod** — server-side query/body validation
- **@nuxtjs/i18n** — Ukrainian (default) + English, lazy JSON locales
- **@nuxtjs/google-fonts** — Inter Tight (UI), JetBrains Mono (numerics)
- **Vitest** (node + nuxt projects) + **Playwright** for e2e
- **TypeScript** — strict, see Code Quality Rules below

## Architecture

Layering:

- `shared/` — types (`BookingItem`, `CalendarWeek`, ...), constants (`BOOKING_TYPES`, `FAYNATOWN_API_VERSION`), API route strings (`API.*`), fetch keys (`FETCH_KEY.*`), state keys (`STATE_KEY.*`), pure date utils (`shared/utils/datetime.ts`)
- `server/` — API proxy to `webapi.faynatown.com.ua`, auth via `Authorization: Bearer` header (client-attached from localStorage — no cookies), Zod validation, upstream adapters (`server/utils/upstream.ts`, `server/utils/slot-parser.ts`)
- `app/` — composables (`useCalendar`, `useBookings`, `useFlat`, `useZones`, `useTheme`, `useToast`, `useConfirm`, ...), pure-CSS components, `createApi()` with global error toast
- Theme switch via `[data-theme="light|dark"]` on `<html>`; `public/theme-init.js` runs pre-hydration to avoid FOUC

### Desktop vs Mobile

Both `DesktopApp` and `MobileApp` are rendered simultaneously; CSS `@media (max-width: 799px)` toggles which one is visible. `pages/index.vue` calls the SYNC composables (`useCalendarSync`, `useBookingsSync`, `useFlatSync`) **exactly once** so each useAsyncData fetch fires once for both layouts. Nested components call the plain `useCalendar` / `useBookings` / `useFlat` accessors, which read via `useNuxtData` (hydration-safe).

### botc-tracker as reference

`~/Development/botc-tracker/` is a **structural/architectural reference only** — not a dependency, not a 1:1 template. Adapt the *approach* (layering, API proxy, `$api` with global error toast, `useAsyncData` + `FETCH_KEY.*`, emit+refresh instead of `clearNuxtData`) — domain and components differ.

## Code Quality Rules

- **Zero `any`/`unknown`/`as` casts in app code.** The two narrow exceptions are:
  - `app/utils/async-data.ts` — Nuxt payload store is typed `unknown`; generic T is a documented trust boundary.
  - `server/utils/faynatown.ts` — upstream JSON isn't runtime-validated (no Zod on response); `as T` is the trust boundary at that API edge.
  Any new `as` cast must sit at a third-party boundary and carry a justification comment.
- **Zero hardcoded UI strings** — every user-visible string flows through `t('...')`. Pluralisation uses `app/utils/plural.ts#pluralUk` for UA (one/few/many).
- **Idiomatic truthy checks** — write `!!x` or `if (x)`, not `x === true` (especially for optional booleans like `isAvaliable?`).
- **No reactive object mutation** — always spread-replace (`state.value = { ...state.value, key: v }`).
- **No `clearNuxtData`** — use emit + refresh tick pattern (see `useBookings.cancel`).
- **Guard skeleton components** with proper loading states (`.ft-skel` primitive lives in `base.css`).
- **Use `useAsyncData` with `FETCH_KEY.*`** — never raw `$fetch` in components. Auth is the single exception: `useAuth.login` calls `$fetch` directly because login doesn't need the async-data caching layer.
- **Server routes** must call `requireAuth(event)` first, then `$faynatown()` — never raw `$fetch` to the upstream API.
- **State keys** live in `shared/state-keys.ts#STATE_KEY` — adding a `useState(<string-literal>)` is forbidden.
- **Fetch keys** live in `shared/fetch-keys.ts#FETCH_KEY`.

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
- **Unavailability is encoded by FIELD ABSENCE, not `false`.** When a slot/zone is unavailable, the `isAvaliable` field is **omitted** from the JSON (API never returns `isAvaliable: false`). The text also gets `(недоступно)` / `(зайнято)` suffixed, but that's for display only — **do not use the text to validate availability**. Wording is localized and could change across API versions; field presence is the contract. Correct check: `!!item.isAvaliable` (after which the value is strict `boolean` in app types). Strip the text suffix with `stripUnavailableSuffix` before rendering.
- **Dates have no timezone.** Responses return `2026-04-17T00:00:00` — parse as local time via `parseLocalDate` / `parseLocalDateTime`. Never `new Date(str)` on these (silent UTC coercion).
- **`/booking/zones` `slot` param is URL-encoded Ukrainian text** like `з 07:00 по 08:00`. `URLSearchParams` handles the encoding — it is NOT a time range in standard format.
- **`toUpstreamBookingDate`** (`server/utils/upstream.ts`) wraps a local date into `YYYY-MM-DDT00:00:00Z` — the trailing `Z` is ignored upstream but the API rejects bare dates. This adapter is server-only and must not leak into `shared/utils/datetime.ts`.

## CSS Layout

Styles split across four files loaded in Nuxt config order:

1. `app/assets/css/tokens.css` — OKLCH colour tokens per `[data-theme]`, radii, row-h variable, font stacks
2. `app/assets/css/base.css` — reset, body defaults, focus ring, scrollbars, shared primitives (`.ft-skel` skeleton + `@keyframes ftProgress` / `ftShimmer` / `ftToastIn` — used by both desktop and mobile)
3. `app/assets/css/desktop.css` — `.ft-*` classes for header / week grid / popover / sidebar / toast host
4. `app/assets/css/mobile.css` — `.mob`, `.mh`, `.ms`, `.mt`, `.ml`, `.mc`, `.sh-*` for the `<800px` layout

CSS-driven layout switch (not UA detection) — both component trees always mount; `pages/index.vue` only hides one via `@media`.

## Commit Rules

- Never add `Co-Authored-By` line
- Never auto-commit — wait for explicit user request
- PRs with 1 commit → `--rebase`, 2+ commits → `--squash`. No merge commits.

## Language

Respond in Ukrainian. Technical terms and code identifiers remain in English.
