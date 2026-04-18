<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import type { BookingTypeParam } from '#shared/constants'
import { parseLocalDate } from '#shared/utils/datetime'
import { fmtMonthDay, fmtTimeHHMM } from '~/utils/datetime'

const props = defineProps<{
  cell: CalendarSlot
  date: string // YYYY-MM-DD
  type: BookingTypeParam
  anchor: DOMRect
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
const appLocale = useAppLocale()
const bookingTypeLabel = useBookingTypeLabel()

const {
  loading,
  fetchError,
  items,
  unitLabel,
  headerLabel,
  availableCount,
  groups,
  isYours,
  load,
} = useZonesForSlot({
  cell: computed<CalendarSlot | null>(() => props.cell),
  date: computed<string | null>(() => props.date),
  type: toRef(props, 'type'),
})

const typeName = computed(() => bookingTypeLabel(props.type))

const dateLabel = computed(() => {
  const d = parseLocalDate(props.date)
  const start = fmtTimeHHMM(props.cell.startHour * 60)
  const end = fmtTimeHHMM(props.cell.endHour * 60)
  return `${fmtMonthDay(d, appLocale.value)} · ${start}–${end}`
})

// Position: anchor right, flip left if it overflows. Vertical clamp 16px.
const POP_W = 340
const POP_H = 380

const pos = computed(() => {
  if (typeof window === 'undefined') return { left: 0, top: 0 }
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = props.anchor.right + 8
  let top = props.anchor.top
  if (left + POP_W > vw - 16) left = props.anchor.left - POP_W - 8
  if (left < 16) left = 16
  if (top + POP_H > vh - 16) top = vh - POP_H - 16
  if (top < 16) top = 16
  return { left, top }
})

const hasError = computed(() => fetchError.value || items.value.length === 0)

onMounted(load)
useEscape(() => emit('close'))
</script>

<template>
  <Teleport to="body">
    <div
      class="ft-pop-backdrop"
      @click="emit('close')"
    />
    <div
      class="ft-pop"
      :style="{ left: `${pos.left}px`, top: `${pos.top}px`, width: `${POP_W}px` }"
      role="dialog"
      aria-modal="true"
    >
      <div class="ft-pop-head">
        <div>
          <div class="ft-pop-type">
            {{ typeName }}
          </div>
          <div class="ft-pop-time">
            {{ dateLabel }}
          </div>
        </div>
        <button
          type="button"
          class="ft-pop-close"
          :aria-label="t('common.close')"
          @click="emit('close')"
        >
          <Icon name="close" />
        </button>
      </div>

      <div class="ft-pop-body">
        <div class="ft-pop-label">
          <span>{{ headerLabel }}</span>
          <span
            v-if="!loading"
            class="ft-pop-meta"
          >{{ availableCount }} {{ t('zones.available') }}</span>
        </div>

        <ZoneUnitsGrid
          variant="desktop"
          :loading="loading"
          :has-error="hasError"
          :groups="groups"
          :unit-label="unitLabel"
          :zone-prefix="t('zones.zonePrefix')"
          :empty-label="t('zones.noZones')"
          :is-yours="isYours"
        />
      </div>

      <div class="ft-pop-foot">
        <button
          type="button"
          class="ft-btn-ghost"
          @click="emit('close')"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
