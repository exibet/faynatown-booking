<script setup lang="ts">
import type { CalendarSlot, ZoneItem } from '#shared/types'
import { BOOKING_TYPES } from '#shared/constants'
import type { BookingTypeId, BookingTypeParam } from '#shared/constants'
import { fmtMonthDay, fmtTimeHHMM, parseLocalDate } from '~/utils/datetime'
import { groupZones } from '~/utils/zone-grouping'

const props = defineProps<{
  open: boolean
  cell: CalendarSlot | null
  date: string | null
  type: BookingTypeParam
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const { t, locale } = useI18n()
const zones = useZones()
const bookings = useBookings()

const meta = computed(() => BOOKING_TYPES.find(b => b.param === props.type))
const unitLabel = computed(() => {
  if (props.type === 'BBQ') return 'BBQ'
  return meta.value?.unitLabel === 'court' ? t('zones.court') : t('zones.zone')
})
const headerLabel = computed(() => {
  if (props.type === 'BBQ') return t('zones.chooseGazebo')
  return meta.value?.unitLabel === 'court' ? t('zones.chooseCourt') : t('zones.chooseZone')
})

const sheetTitle = computed(() => {
  if (!props.cell || !props.date) return ''
  const d = parseLocalDate(props.date)
  const lc = locale.value === 'uk' ? 'uk' : 'en'
  const start = fmtTimeHHMM(props.cell.startHour * 60)
  const end = fmtTimeHHMM(props.cell.endHour * 60)
  return `${start}–${end} · ${fmtMonthDay(d, lc)}`
})

const items = ref<ZoneItem[]>([])
const loading = ref(false)
const fetchError = ref(false)

const availableCount = computed(() => items.value.filter(z => z.available).length)
const groups = computed(() => groupZones(items.value))

const typeId = computed<BookingTypeId>(() => meta.value?.id ?? 6)
const myKeys = computed(() => {
  if (!props.cell || !props.date) return new Set<string>()
  return bookings.myUnitKeysForSlot(
    parseLocalDate(props.date),
    props.cell.startHour,
    props.cell.endHour,
    typeId.value,
  )
})

function isYours(area: number, unit: number): boolean {
  return myKeys.value.has(`${area}-${unit}`)
}

async function load() {
  if (!props.cell || !props.date) return
  loading.value = true
  fetchError.value = false
  try {
    items.value = await zones.fetchZones({
      type: props.type,
      date: props.date,
      slot: props.cell.rawLabel,
    })
  }
  catch {
    fetchError.value = true
  }
  finally {
    loading.value = false
  }
}

watch(() => [props.open, props.cell?.startHour, props.date], () => {
  if (props.open) load()
})
</script>

<template>
  <BottomSheet
    :open="open"
    :title="sheetTitle"
    @close="emit('close')"
  >
    <div class="sh-section-label">
      <span>{{ headerLabel }}</span>
      <span
        v-if="!loading"
        class="sh-section-meta"
      >{{ availableCount }} {{ t('zones.available') }}</span>
    </div>

    <div
      v-if="loading"
      class="sh-units"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="ft-skel"
        style="height: 60px;"
      />
    </div>

    <div
      v-else-if="fetchError || items.length === 0"
      class="sh-empty"
    >
      {{ t('zones.noZones') }}
    </div>

    <template v-else>
      <div
        v-for="group in groups"
        :key="group.area"
        class="sh-zone-group"
      >
        <div
          v-if="groups.length > 1"
          class="sh-zone-label"
        >
          {{ t('zones.zonePrefix') }} {{ group.area }}
        </div>
        <div class="sh-units">
          <div
            v-for="tile in group.units"
            :key="tile.id"
            :class="[
              'sh-unit',
              isYours(group.area, tile.unit) ? 'is-yours' : (tile.available ? '' : 'is-busy'),
            ]"
          >
            <span class="sh-unit-num">{{ tile.unit }}</span>
            <span class="sh-unit-label">{{ unitLabel }}</span>
          </div>
        </div>
      </div>
    </template>

    <button
      type="button"
      class="sh-confirm"
      @click="emit('close')"
    >
      {{ t('common.close') }}
    </button>
  </BottomSheet>
</template>
