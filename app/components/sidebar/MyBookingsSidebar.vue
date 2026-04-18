<script setup lang="ts">
const { t } = useI18n()
const { upcoming, past, upcomingCount, cancelWithConfirm, pending } = useBookings()
</script>

<template>
  <aside class="ft-side">
    <div class="ft-side-head">
      <h2>{{ t('bookings.title') }}</h2>
      <span class="ft-side-count">{{ upcomingCount }}</span>
    </div>

    <div class="ft-side-section">
      <div class="ft-side-label">
        {{ t('bookings.upcoming') }}
      </div>

      <template v-if="pending && upcoming.length === 0">
        <div
          v-for="n in 2"
          :key="n"
          class="ft-skel"
          style="height: 64px;"
        />
      </template>

      <div
        v-else-if="upcoming.length === 0"
        class="ft-side-empty"
      >
        {{ t('bookings.noBookings') }}
      </div>

      <BookingCard
        v-for="b in upcoming"
        v-else
        :key="b.id"
        :booking="b"
        variant="upcoming"
        @cancel="cancelWithConfirm"
      />
    </div>

    <div
      v-if="past.length > 0"
      class="ft-side-section"
    >
      <div class="ft-side-label">
        {{ t('bookings.past') }}
      </div>
      <BookingCard
        v-for="b in past.slice(0, 5)"
        :key="b.id"
        :booking="b"
        variant="past"
      />
    </div>
  </aside>
</template>
