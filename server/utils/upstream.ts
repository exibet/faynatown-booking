/**
 * Server-side adapters for the Faynatown upstream API.
 *
 * These transformations only matter when talking to the upstream and would
 * confuse app-layer callers if placed in `#shared/utils/*`.
 */

/**
 * Converts a `YYYY-MM-DD` date into the upstream API's `bookingDate` format:
 * `2026-04-20T00:00:00Z`. The timezone marker is ignored upstream — our
 * internal dates stay local.
 */
export function toUpstreamBookingDate(isoDate: string): string {
  return `${isoDate}T00:00:00Z`
}
