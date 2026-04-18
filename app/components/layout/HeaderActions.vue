<script setup lang="ts">
defineProps<{
  profileOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-profile' | 'close'): void
}>()

const { t, locale, setLocale } = useI18n()
const calendar = useCalendar()
const theme = useTheme()
const auth = useAuth()

const profileOptions = computed(() => [{
  value: 'logout',
  label: t('auth.logout'),
}])

// "Updated X min ago" — tick once a minute so the label stays accurate
// without re-rendering the whole tree.
const tick = ref(0)
useInterval(() => {
  tick.value++
}, 60_000)

const updatedLabel = computed(() => {
  void tick.value
  const last = calendar.lastUpdated.value
  if (!last) return ''
  const minutes = Math.floor((Date.now() - last.getTime()) / 60_000)
  if (minutes <= 0) return t('calendar.updatedJustNow')
  return t('calendar.updatedAgo', { minutes })
})

function onProfileSelect(value: string) {
  emit('close')
  if (value === 'logout') auth.logout()
}

function toggleLocale() {
  setLocale(locale.value === 'uk' ? 'en' : 'uk')
}

// Icon shows the theme the user will get on click — i.e. the opposite of
// the current resolved theme. System default applies until the user picks
// once; from then on we honour the explicit choice.
const themeIcon = computed(() => theme.resolved.value === 'dark' ? 'sun' : 'moon')
</script>

<template>
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
        @click="emit('toggle-profile')"
      >
        <Icon name="user" />
      </button>
      <Dropdown
        :open="profileOpen"
        :options="profileOptions"
        style="right: 0; left: auto;"
        @select="onProfileSelect"
        @close="emit('close')"
      />
    </div>
  </div>
</template>
