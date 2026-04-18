import type { CalendarSlot, ZoneItem } from '#shared/types'
import type { BookingTypeParam } from '#shared/constants'
import { findBookingType, typeIdOf } from '#shared/constants'
import { parseLocalDate } from '#shared/utils/datetime'
import { groupZones } from '~/utils/zone-grouping'

interface Args {
  cell: Ref<CalendarSlot | null>
  date: Ref<string | null>
  type: Ref<BookingTypeParam>
}

/**
 * Shared zone-fetch state for the desktop popover and the mobile slot sheet.
 * Both views render identical data from the same `/api/zones` call — keeping
 * the logic in one place means a change in grouping / labelling / error
 * handling applies to both automatically.
 */
export function useZonesForSlot({ cell, date, type }: Args) {
  const zones = useZones()
  const bookings = useBookings()
  const { t } = useI18n()

  const items = ref<ZoneItem[]>([])
  const loading = ref(false)
  const fetchError = ref(false)

  const meta = computed(() => findBookingType(type.value))
  const unitLabel = computed(() => {
    // BBQ tiles label as "BBQ" instead of the generic "Зона" — users think
    // of the upstream "Бесідка N" in product terms.
    if (type.value === 'BBQ') return 'BBQ'
    return meta.value?.unitLabel === 'court' ? t('zones.court') : t('zones.zone')
  })
  const headerLabel = computed(() => {
    if (type.value === 'BBQ') return t('zones.chooseGazebo')
    return meta.value?.unitLabel === 'court' ? t('zones.chooseCourt') : t('zones.chooseZone')
  })

  const availableCount = computed(() => items.value.filter(z => z.available).length)
  const groups = computed(() => groupZones(items.value))

  const myKeys = computed(() => {
    if (!cell.value || !date.value) return new Set<string>()
    return bookings.myUnitKeysForSlot(
      parseLocalDate(date.value),
      cell.value.startHour,
      cell.value.endHour,
      typeIdOf(type.value),
    )
  })

  function isYours(area: number, unit: number): boolean {
    return myKeys.value.has(`${area}-${unit}`)
  }

  async function load(): Promise<void> {
    if (!cell.value || !date.value) return
    loading.value = true
    fetchError.value = false
    try {
      items.value = await zones.fetchZones({
        type: type.value,
        date: date.value,
        slot: cell.value.rawLabel,
      })
    }
    catch {
      fetchError.value = true
    }
    finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    fetchError,
    meta,
    unitLabel,
    headerLabel,
    availableCount,
    groups,
    isYours,
    load,
  }
}
