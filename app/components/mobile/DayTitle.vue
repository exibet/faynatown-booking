<script setup lang="ts">
import { dayTitle, fmtMonthDay } from '~/utils/datetime'

const props = defineProps<{
  date: Date
}>()

const appLocale = useAppLocale()

const title = computed(() => dayTitle(props.date, appLocale.value))
const dateStr = computed(() => fmtMonthDay(props.date, appLocale.value))
</script>

<template>
  <div class="mt">
    <h1>{{ title }}</h1>
    <span class="mt-date">{{ dateStr }}</span>
  </div>
</template>
