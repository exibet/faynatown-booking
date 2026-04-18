/**
 * Localised "updated X min ago" label that ticks once a minute. Extracted
 * from `useCalendar` so the ticker's lifetime matches the component that
 * renders it (HeaderActions) — the calendar state composable stays focused
 * on week/type/pending state.
 *
 * `useI18n()` must run inside a component setup, which is also where the
 * label is consumed, so co-locating the ticker here is the natural fit.
 */
export function useUpdatedAgo(lastUpdated: Readonly<Ref<Date | null>>) {
  const { t } = useI18n()
  const tick = ref(0)

  useInterval(() => {
    tick.value += 1
  }, 60_000)

  return computed(() => {
    void tick.value
    const last = lastUpdated.value
    if (!last) return ''
    const minutes = Math.floor((Date.now() - last.getTime()) / 60_000)
    if (minutes <= 0) return t('calendar.updatedJustNow')
    return t('calendar.updatedAgo', { minutes })
  })
}
