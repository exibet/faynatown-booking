<script setup lang="ts">
import { BOOKING_TYPES, findBookingType } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'
import type { CalendarWeek } from '#shared/types'
import { addDays } from '#shared/utils/datetime'
import { fmtMonthDay } from '~/utils/datetime'

defineProps<{
  week: CalendarWeek
}>()

const { t, locale, setLocale } = useI18n()
const appLocale = useAppLocale()

const calendar = useCalendar()
const flat = useFlat()
const theme = useTheme()
const auth = useAuth()

const dropdowns = useDropdownGroup<'flat' | 'type' | 'profile'>()

const flatOptions = computed(() => flat.flats.value.map(f => ({
  value: f.flatId,
  label: f.address,
})))

const typeOptions = computed(() => BOOKING_TYPES
  .filter(b => b.visible)
  .map((b) => {
    const unitsLabel = b.unitLabel === 'court' ? t('types.courts') : t('types.zones')
    return {
      value: b.param,
      label: t(`types.${b.i18nKey}`),
      meta: `${b.unitCount} ${unitsLabel}`,
    }
  }))

const profileOptions = computed(() => [{
  value: 'logout',
  label: t('auth.logout'),
}])

const selectedTypeMeta = computed(() => findBookingType(calendar.selectedType.value))
const selectedTypeLabel = computed(() => selectedTypeMeta.value
  ? t(`types.${selectedTypeMeta.value.i18nKey}`)
  : '')

const range = computed(() => {
  const start = calendar.weekAnchor.value
  const end = addDays(start, 6)
  return `${fmtMonthDay(start, appLocale.value)} — ${fmtMonthDay(end, appLocale.value)}`
})

// "Updated X min ago" — refreshed once a minute via a tick ref so the label
// stays accurate without re-rendering the whole tree.
const tick = ref(0)
let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickTimer = setInterval(() => {
    tick.value++
  }, 60_000)
})
onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const updatedLabel = computed(() => {
  void tick.value
  const last = calendar.lastUpdated.value
  if (!last) return ''
  const minutes = Math.floor((Date.now() - last.getTime()) / 60_000)
  if (minutes <= 0) return t('calendar.updatedJustNow')
  return t('calendar.updatedAgo', { minutes })
})

function onFlatSelect(value: string) {
  flat.select(value)
  dropdowns.closeAll()
}

function onTypeSelect(value: BookingTypeParam) {
  calendar.setType(value)
  dropdowns.closeAll()
}

function onProfileSelect(value: string) {
  dropdowns.closeAll()
  if (value === 'logout') auth.logout()
}

function toggleLocale() {
  setLocale(locale.value === 'uk' ? 'en' : 'uk')
}

function toggleFlat() {
  if (!flat.hasMultiple.value) return
  dropdowns.toggle('flat')
}

// Icon shows the theme the user will get on click — i.e. the opposite of
// the current resolved theme. System default applies until the user picks
// once; from then on we honour the explicit choice.
const themeIcon = computed(() => theme.resolved.value === 'dark' ? 'sun' : 'moon')
</script>

<template>
  <header class="ft-header">
    <div class="ft-header-left">
      <div
        v-if="flat.selectedFlat.value"
        class="ft-pill ft-pill-flat"
        :style="!flat.hasMultiple.value ? { cursor: 'default' } : undefined"
        @click="toggleFlat"
      >
        <span class="ft-pill-label">{{ t('header.flat') }}</span>
        <span class="ft-pill-value">{{ flat.selectedFlat.value.address }}</span>
        <Icon
          v-if="flat.hasMultiple.value"
          name="chevron-down"
          class="ft-pill-chev"
          :size="12"
        />
        <Dropdown
          :open="dropdowns.is('flat')"
          :options="flatOptions"
          :selected-value="flat.selectedFlat.value.flatId"
          @select="onFlatSelect"
          @close="dropdowns.closeAll"
        />
      </div>

      <div
        class="ft-pill"
        @click="dropdowns.toggle('type')"
      >
        <span class="ft-pill-label">{{ t('header.type') }}</span>
        <span class="ft-pill-value">{{ selectedTypeLabel }}</span>
        <Icon
          name="chevron-down"
          class="ft-pill-chev"
          :size="12"
        />
        <Dropdown
          :open="dropdowns.is('type')"
          :options="typeOptions"
          :selected-value="calendar.selectedType.value"
          @select="onTypeSelect"
          @close="dropdowns.closeAll"
        />
      </div>
    </div>

    <div class="ft-header-center">
      <button
        type="button"
        class="ft-icon-btn"
        :aria-label="t('calendar.prev')"
        :disabled="!calendar.canPrevWeek.value"
        @click="calendar.prevWeek"
      >
        <Icon name="chevron-left" />
      </button>
      <button
        type="button"
        class="ft-today"
        @click="calendar.goToToday"
      >
        {{ t('calendar.today') }}
      </button>
      <button
        type="button"
        class="ft-icon-btn"
        :aria-label="t('calendar.next')"
        @click="calendar.nextWeek"
      >
        <Icon name="chevron-right" />
      </button>
      <span class="ft-range">{{ range }}</span>
      <OccupancyBar :week="week" />
    </div>

    <div class="ft-header-right">
      <span
        v-if="updatedLabel"
        class="ft-range"
        style="opacity: 0.7;"
      >{{ updatedLabel }}</span>
      <button
        type="button"
        class="ft-icon-btn"
        :aria-label="t('calendar.refresh')"
        @click="() => calendar.refresh()"
      >
        <Icon name="refresh" />
      </button>
      <button
        type="button"
        class="ft-icon-btn ft-lang"
        :aria-label="t('lang.toggle')"
        @click="toggleLocale"
      >
        {{ locale === 'uk' ? 'UK' : 'EN' }}
      </button>
      <button
        type="button"
        class="ft-icon-btn"
        :aria-label="t('theme.toggle')"
        @click="theme.toggle"
      >
        <Icon :name="themeIcon" />
      </button>
      <div style="position: relative;">
        <button
          type="button"
          class="ft-icon-btn"
          :aria-label="t('common.profile')"
          @click="dropdowns.toggle('profile')"
        >
          <Icon name="user" />
        </button>
        <Dropdown
          :open="dropdowns.is('profile')"
          :options="profileOptions"
          style="right: 0; left: auto;"
          @select="onProfileSelect"
          @close="dropdowns.closeAll"
        />
      </div>
    </div>
  </header>
</template>
