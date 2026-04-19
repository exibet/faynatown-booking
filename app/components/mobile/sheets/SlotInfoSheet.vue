<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import type { BookingTypeParam } from '#shared/constants'
import { parseLocalDate } from '#shared/utils/datetime'
import { fmtMonthDay, fmtTimeHHMM } from '~/utils/datetime'

const props = defineProps<{
  open: boolean
  cell: CalendarSlot | null
  date: string | null
  type: BookingTypeParam
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const appLocale = useAppLocale()

const {
  loading,
  unitLabel,
  headerLabel,
  availableLabel,
  groups,
  hasError,
  isYours,
  load,
} = useZonesForSlot({
  cell: toRef(props, 'cell'),
  date: toRef(props, 'date'),
  type: toRef(props, 'type'),
})

const { picked, noticeOpen, pick, requestBooking, reset } = useBookingPicker()

const sheetTitle = computed(() => {
  if (!props.cell || !props.date) return ''
  const d = parseLocalDate(props.date)
  const start = fmtTimeHHMM(props.cell.startHour * 60)
  const end = fmtTimeHHMM(props.cell.endHour * 60)
  return `${start}–${end} · ${fmtMonthDay(d, appLocale.value)}`
})

watch(() => [props.open, props.cell?.startHour, props.date], () => {
  // Reset pick state whenever the sheet opens on a different slot.
  reset()
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
      >{{ availableLabel }}</span>
    </div>

    <ZoneUnitsGrid
      variant="mobile"
      :loading="loading"
      :has-error="hasError"
      :groups="groups"
      :unit-label="unitLabel"
      :zone-prefix="t('zones.zonePrefix')"
      :empty-label="t('zones.noZones')"
      :is-yours="isYours"
      :picked="picked"
      :skeleton-count="8"
      @pick="pick"
    />

    <CaptchaNotice
      v-if="noticeOpen"
      variant="mobile"
    />

    <button
      v-if="noticeOpen"
      type="button"
      class="sh-confirm"
      @click="emit('close')"
    >
      {{ t('common.ok') }}
    </button>
    <button
      v-else
      type="button"
      class="sh-confirm"
      :disabled="!picked"
      @click="requestBooking"
    >
      {{ t('zones.book') }}
    </button>
  </BottomSheet>
</template>
