<script setup lang="ts">
import { dayTitle, fmtMonthDay } from '~/utils/datetime'

const props = defineProps<{
  date: Date
}>()

const { locale } = useI18n()
const lc = computed(() => locale.value === 'uk' ? 'uk' : 'en')

const title = computed(() => dayTitle(props.date, lc.value))
const dateStr = computed(() => fmtMonthDay(props.date, lc.value))
</script>

<template>
  <div class="mt">
    <h1>{{ title }}</h1>
    <span class="mt-date">{{ dateStr }}</span>
  </div>
</template>
