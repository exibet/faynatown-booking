<script setup lang="ts">
import { fmtTimeHHMM, nowMinutes } from '~/utils/datetime'

const props = defineProps<{
  pxPerMin: number
  startHour: number
}>()

// Mounted gate — server time and client time differ; rendering this on SSR
// would cause hydration mismatches (line at one position on server, another
// on client). We only render after the client mounts.
const mounted = ref(false)
const minutes = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  mounted.value = true
  minutes.value = nowMinutes()
  timer = setInterval(() => {
    minutes.value = nowMinutes()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const top = computed(() => (minutes.value - props.startHour * 60) * props.pxPerMin)
const visible = computed(() => mounted.value && top.value >= 0)
const label = computed(() => fmtTimeHHMM(minutes.value))
</script>

<template>
  <div
    v-if="visible"
    class="ft-now"
    :style="{ top: `${top}px` }"
  >
    <span class="ft-now-dot" />
    <span class="ft-now-label">{{ label }}</span>
  </div>
</template>
