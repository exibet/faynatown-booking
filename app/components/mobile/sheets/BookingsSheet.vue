<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const { upcoming, past, upcomingCount, cancel, pending } = useBookings()
const confirm = useConfirm()

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

    <BookingCard
      v-for="b in upcoming"
      v-else
      :key="b.id"
      :booking="b"
      variant="upcoming"
      @cancel="onCancel"
    />

    <div
      v-if="past.length > 0"
      class="sh-section-label"
      style="margin-top: 16px;"
    >
      <span>{{ t('bookings.past') }}</span>
    </div>
    <BookingCard
      v-for="b in past.slice(0, 8)"
      :key="b.id"
      :booking="b"
      variant="past"
    />
  </BottomSheet>
</template>
