<script setup lang="ts">
import type { BookingItem } from '#shared/types'
import { fmtBookingWhen } from '~/utils/datetime'

const props = defineProps<{
  booking: BookingItem
  variant: 'upcoming' | 'past'
}>()

const emit = defineEmits<{
  (e: 'cancel', id: number): void
}>()

const { t } = useI18n()
const appLocale = useAppLocale()

const when = computed(() => fmtBookingWhen(props.booking, appLocale.value))
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
