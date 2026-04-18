<script setup lang="ts">
import type { BookingItem } from '#shared/types'
import { fmtMonthDay, fmtTimeHHMM, parseLocalDateTime } from '~/utils/datetime'

const props = defineProps<{
  booking: BookingItem
  variant: 'upcoming' | 'past'
}>()

const emit = defineEmits<{
  (e: 'cancel', id: number): void
}>()

const { t, locale } = useI18n()

const when = computed(() => {
  const start = parseLocalDateTime(props.booking.start)
  const end = parseLocalDateTime(props.booking.end)
  const dateStr = fmtMonthDay(start, locale.value === 'uk' ? 'uk' : 'en')
  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin = end.getHours() * 60 + end.getMinutes()
  return `${dateStr} · ${fmtTimeHHMM(startMin)}–${fmtTimeHHMM(endMin)}`
})

const showCancel = computed(() => props.variant === 'upcoming' && props.booking.canCancel)
</script>

<template>
  <div :class="['ft-bk', { 'is-past': variant === 'past' }]">
    <div class="ft-bk-stripe" />
    <div class="ft-bk-body">
      <div class="ft-bk-title">
        {{ booking.zoneName }}
      </div>
      <div class="ft-bk-when">
        {{ when }}
      </div>
    </div>
    <button
      v-if="showCancel"
      type="button"
      class="ft-bk-cancel"
      @click="emit('cancel', booking.id)"
    >
      {{ t('bookings.cancel') }}
    </button>
  </div>
</template>
