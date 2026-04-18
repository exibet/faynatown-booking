<script setup lang="ts">
import type { CalendarSlot } from '#shared/types'
import type { BookingTypeParam } from '#shared/constants'
import { parseLocalDate } from '#shared/utils/datetime'
import { fmtMonthDay, fmtTimeHHMM } from '~/utils/datetime'

const props = defineProps<{
  open: boolean
  cell: CalendarSlot | null
  date: string | null
  type: BookingTypeParam
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const appLocale = useAppLocale()

const {
  loading,
  fetchError,
  items,
  unitLabel,
  headerLabel,
  availableCount,
  groups,
  isYours,
  load,
} = useZonesForSlot({
  cell: toRef(props, 'cell'),
  date: toRef(props, 'date'),
  type: toRef(props, 'type'),
})

const sheetTitle = computed(() => {
  if (!props.cell || !props.date) return ''
  const d = parseLocalDate(props.date)
  const start = fmtTimeHHMM(props.cell.startHour * 60)
  const end = fmtTimeHHMM(props.cell.endHour * 60)
  return `${start}–${end} · ${fmtMonthDay(d, appLocale.value)}`
})

watch(() => [props.open, props.cell?.startHour, props.date], () => {
  if (props.open) load()
})
</script>

<template>
  <BottomSheet
    :open="open"
    :title="sheetTitle"
    @close="emit('close')"
  >
    <div class="sh-section-label">
      <span>{{ headerLabel }}</span>
      <span
        v-if="!loading"
        class="sh-section-meta"
      >{{ availableCount }} {{ t('zones.available') }}</span>
    </div>

    <div
      v-if="loading"
      class="sh-units"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="ft-skel"
        style="height: 60px;"
      />
    </div>

    <div
      v-else-if="fetchError || items.length === 0"
      class="sh-empty"
    >
      {{ t('zones.noZones') }}
    </div>

    <template v-else>
      <div
        v-for="group in groups"
        :key="group.area"
        class="sh-zone-group"
      >
        <div
          v-if="groups.length > 1"
          class="sh-zone-label"
        >
          {{ t('zones.zonePrefix') }} {{ group.area }}
        </div>
        <div class="sh-units">
          <div
            v-for="tile in group.units"
            :key="tile.id"
            :class="[
              'sh-unit',
              isYours(group.area, tile.unit) ? 'is-yours' : (tile.available ? '' : 'is-busy'),
            ]"
          >
            <span class="sh-unit-num">{{ tile.unit }}</span>
            <span class="sh-unit-label">{{ unitLabel }}</span>
          </div>
        </div>
      </div>
    </template>

    <button
      type="button"
      class="sh-confirm"
      @click="emit('close')"
    >
      {{ t('common.close') }}
    </button>
  </BottomSheet>
</template>
