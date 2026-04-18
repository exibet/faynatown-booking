<script setup lang="ts">
import { dayLongName, dayRelation, fmtMonthDay } from '~/utils/datetime'

const props = defineProps<{
  date: Date
}>()

const { t } = useI18n()
const appLocale = useAppLocale()

const title = computed(() => {
  const relation = dayRelation(props.date)
  if (relation === 'today') return t('calendar.today')
  if (relation === 'tomorrow') return t('calendar.tomorrow')
  return dayLongName(props.date, appLocale.value)
})
const dateStr = computed(() => fmtMonthDay(props.date, appLocale.value))
</script>

<template>
  <div class="mt">
    <h1>{{ title }}</h1>
    <span class="mt-date">{{ dateStr }}</span>
  </div>
</template>
