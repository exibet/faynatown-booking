<script setup lang="ts">
import type { BookingItem } from '#shared/types'
import { fmtMonthDay, fmtTimeHHMM, parseLocalDateTime } from '~/utils/datetime'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t, locale } = useI18n()
const { upcoming, past, upcomingCount, cancel, pending } = useBookings()
const confirm = useConfirm()

function whenLabel(b: BookingItem): string {
  const start = parseLocalDateTime(b.start)
  const end = parseLocalDateTime(b.end)
  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin = end.getHours() * 60 + end.getMinutes()
  return `${fmtMonthDay(start, locale.value === 'uk' ? 'uk' : 'en')} · ${fmtTimeHHMM(startMin)}–${fmtTimeHHMM(endMin)}`
}

async function onCancel(id: number) {
  const ok = await confirm.ask({
    title: t('bookings.cancelTitle'),
    confirmLabel: t('bookings.cancelConfirm'),
    cancelLabel: t('bookings.keep'),
    variant: 'danger',
  })
  if (!ok) return
  await cancel(id)
}
</script>

<template>
  <BottomSheet
    :open="open"
    :title="t('bookings.title')"
    @close="emit('close')"
  >
    <div class="sh-section-label">
      <span>{{ t('bookings.upcoming') }}</span>
      <span class="sh-section-meta">{{ upcomingCount }}</span>
    </div>

    <template v-if="pending && upcoming.length === 0">
      <div
        v-for="n in 2"
        :key="n"
        class="ft-skel"
        style="height: 64px; margin-bottom: 8px;"
      />
    </template>

    <div
      v-else-if="upcoming.length === 0"
      class="sh-empty"
    >
      {{ t('bookings.noBookings') }}
    </div>

    <div
      v-for="b in upcoming"
      v-else
      :key="b.id"
      class="sh-bk"
    >
      <div class="sh-bk-body">
        <div class="sh-bk-title">
          {{ b.zoneName }}
        </div>
        <div class="sh-bk-when">
          {{ whenLabel(b) }}
        </div>
      </div>
      <button
        v-if="b.canCancel"
        type="button"
        class="sh-bk-cancel"
        @click="onCancel(b.id)"
      >
        {{ t('bookings.cancel') }}
      </button>
    </div>

    <div
      v-if="past.length > 0"
      class="sh-section-label"
      style="margin-top: 16px;"
    >
      <span>{{ t('bookings.past') }}</span>
    </div>
    <div
      v-for="b in past.slice(0, 8)"
      :key="b.id"
      class="sh-bk is-past"
    >
      <div class="sh-bk-body">
        <div class="sh-bk-title">
          {{ b.zoneName }}
        </div>
        <div class="sh-bk-when">
          {{ whenLabel(b) }}
        </div>
      </div>
    </div>
  </BottomSheet>
</template>
