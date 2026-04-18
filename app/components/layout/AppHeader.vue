<script setup lang="ts">
import { BOOKING_TYPES, HIDDEN_TYPE_IDS } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'
import type { CalendarWeek } from '#shared/types'
import { addDays, fmtMonthDay } from '~/utils/datetime'

defineProps<{
  week: CalendarWeek
}>()

const { t, locale, setLocale } = useI18n()

const calendar = useCalendar()
const flat = useFlat()
const theme = useTheme()
const auth = useAuth()

const flatOpen = ref(false)
const typeOpen = ref(false)
const profileOpen = ref(false)

function closeAll(except?: 'flat' | 'type' | 'profile') {
  if (except !== 'flat') flatOpen.value = false
  if (except !== 'type') typeOpen.value = false
  if (except !== 'profile') profileOpen.value = false
}

const flatOptions = computed(() => flat.flats.value.map(f => ({
  value: f.flatId,
  label: f.address,
})))

const typeOptions = computed(() => BOOKING_TYPES
  .filter(b => !HIDDEN_TYPE_IDS.includes(b.id))
  .map((b) => {
    const unitsLabel = b.unitLabel === 'court' ? t('types.courts') : t('types.zones')
    return {
      value: b.param,
      label: t(`types.${b.i18nKey}`),
      meta: `${b.unitCount} ${unitsLabel}`,
    }
  }))

const selectedTypeMeta = computed(() => BOOKING_TYPES.find(b => b.param === calendar.selectedType.value))
const selectedTypeLabel = computed(() => selectedTypeMeta.value
  ? t(`types.${selectedTypeMeta.value.i18nKey}`)
  : '')

const range = computed(() => {
  const start = calendar.weekAnchor.value
  const end = addDays(start, 6)
  const lc = locale.value === 'uk' ? 'uk' : 'en'
  return `${fmtMonthDay(start, lc)} — ${fmtMonthDay(end, lc)}`
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

function onFlatSelect(value: string | number) {
  if (typeof value !== 'string') return
  flat.select(value)
  closeAll()
}

function onTypeSelect(value: string | number) {
  if (typeof value !== 'string') return
  calendar.setType(value as BookingTypeParam)
  closeAll()
}

function toggleLocale() {
  setLocale(locale.value === 'uk' ? 'en' : 'uk')
}

function toggleFlat() {
  if (!flat.hasMultiple.value) return
  closeAll('flat')
  flatOpen.value = !flatOpen.value
}

function toggleType() {
  closeAll('type')
  typeOpen.value = !typeOpen.value
}

function toggleProfile() {
  closeAll('profile')
  profileOpen.value = !profileOpen.value
}

// Icon shows the theme the user will get on click — i.e. the opposite of
// the current resolved theme. System default applies until the user picks
// once; from then on we honour the explicit choice.
const themeIcon = computed(() => theme.resolved.value === 'dark' ? 'sun' : 'moon')

function onThemeClick() {
  theme.toggle()
}
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
          :open="flatOpen"
          :options="flatOptions"
          :selected-value="flat.selectedFlat.value.flatId"
          @select="onFlatSelect"
          @close="flatOpen = false"
        />
      </div>

      <div
        class="ft-pill"
        @click="toggleType"
      >
        <span class="ft-pill-label">{{ t('header.type') }}</span>
        <span class="ft-pill-value">{{ selectedTypeLabel }}</span>
        <Icon
          name="chevron-down"
          class="ft-pill-chev"
          :size="12"
        />
        <Dropdown
          :open="typeOpen"
          :options="typeOptions"
          :selected-value="calendar.selectedType.value"
          @select="onTypeSelect"
          @close="typeOpen = false"
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
        @click="onThemeClick"
      >
        <Icon :name="themeIcon" />
      </button>
      <div
        style="position: relative;"
      >
        <button
          type="button"
          class="ft-icon-btn"
          :aria-label="t('common.profile')"
          @click="toggleProfile"
        >
          <Icon name="user" />
        </button>
        <div
          v-if="profileOpen"
          class="ft-menu"
          style="right: 0; left: auto;"
          @click="profileOpen = false"
        >
          <button
            type="button"
            class="ft-menu-item"
            @click="auth.logout"
          >
            {{ t('auth.logout') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
