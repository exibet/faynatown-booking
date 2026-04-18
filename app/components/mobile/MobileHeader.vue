<script setup lang="ts">
import { findBookingType } from '#shared/constants'

const emit = defineEmits<{
  (e: 'open-type' | 'open-bookings'): void
}>()

const { t } = useI18n()
const calendar = useCalendar()
const { upcomingCount } = useBookings()

const typeName = computed(() => {
  const meta = findBookingType(calendar.selectedType.value)
  return meta ? t(`types.${meta.i18nKey}`) : ''
})
</script>

<template>
  <header class="mh">
    <button
      type="button"
      class="mh-type"
      @click="emit('open-type')"
    >
      <span class="mh-type-name">{{ typeName }}</span>
      <Icon
        name="chevron-down"
        class="mh-type-chev"
        :size="14"
      />
    </button>
    <button
      type="button"
      class="mh-iconbtn"
      :aria-label="t('bookings.title')"
      @click="emit('open-bookings')"
    >
      <Icon name="calendar" />
      <span
        v-if="upcomingCount > 0"
        class="mh-badge"
      >{{ upcomingCount }}</span>
    </button>
  </header>
</template>
