<script setup lang="ts">
import type { CalendarSlot, ZoneItem } from '#shared/types'
import { BOOKING_TYPES } from '#shared/constants'
import type { BookingTypeId, BookingTypeParam } from '#shared/constants'
import { fmtMonthDay, fmtTimeHHMM, parseLocalDate } from '~/utils/datetime'
import { groupZones } from '~/utils/zone-grouping'

const props = defineProps<{
  cell: CalendarSlot
  date: string // YYYY-MM-DD
  type: BookingTypeParam
  anchor: DOMRect
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t, locale } = useI18n()
const zones = useZones()
const bookings = useBookings()

const meta = computed(() => BOOKING_TYPES.find(b => b.param === props.type))
const typeName = computed(() => meta.value ? t(`types.${meta.value.i18nKey}`) : '')
// BBQ tiles label as "BBQ" instead of the generic "Зона" — the API returns
// "Бесідка N" but in this product the user thinks in BBQ units.
const unitLabel = computed(() => {
  if (props.type === 'BBQ') return 'BBQ'
  return meta.value?.unitLabel === 'court' ? t('zones.court') : t('zones.zone')
})
const headerLabel = computed(() => {
  if (props.type === 'BBQ') return t('zones.chooseGazebo')
  return meta.value?.unitLabel === 'court' ? t('zones.chooseCourt') : t('zones.chooseZone')
})

const dateLabel = computed(() => {
  const d = parseLocalDate(props.date)
  const lc = locale.value === 'uk' ? 'uk' : 'en'
  const start = fmtTimeHHMM(props.cell.startHour * 60)
  const end = fmtTimeHHMM(props.cell.endHour * 60)
  return `${fmtMonthDay(d, lc)} · ${start}–${end}`
})

// Position: anchor right, flip left if it overflows. Vertical clamp 16px.
const POP_W = 340
const POP_H = 380

const pos = computed(() => {
  if (typeof window === 'undefined') return { left: 0, top: 0 }
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = props.anchor.right + 8
  let top = props.anchor.top
  if (left + POP_W > vw - 16) left = props.anchor.left - POP_W - 8
  if (left < 16) left = 16
  if (top + POP_H > vh - 16) top = vh - POP_H - 16
  if (top < 16) top = 16
  return { left, top }
})

const items = ref<ZoneItem[]>([])
const loading = ref(false)
const fetchError = ref(false)

const availableCount = computed(() => items.value.filter(z => z.available).length)
const groups = computed(() => groupZones(items.value))

const typeId = computed<BookingTypeId>(() => meta.value?.id ?? 6)
const myKeys = computed(() => bookings.myUnitKeysForSlot(
  parseLocalDate(props.date),
  props.cell.startHour,
  props.cell.endHour,
  typeId.value,
))

function isYours(area: number, unit: number): boolean {
  return myKeys.value.has(`${area}-${unit}`)
}

async function load() {
  loading.value = true
  fetchError.value = false
  try {
    items.value = await zones.fetchZones({
      type: props.type,
      date: props.date,
      slot: props.cell.rawLabel,
    })
  }
  catch {
    fetchError.value = true
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      class="ft-pop-backdrop"
      @click="emit('close')"
    />
    <div
      class="ft-pop"
      :style="{ left: `${pos.left}px`, top: `${pos.top}px`, width: `${POP_W}px` }"
      role="dialog"
      aria-modal="true"
    >
      <div class="ft-pop-head">
        <div>
          <div class="ft-pop-type">
            {{ typeName }}
          </div>
          <div class="ft-pop-time">
            {{ dateLabel }}
          </div>
        </div>
        <button
          type="button"
          class="ft-pop-close"
          :aria-label="t('common.close')"
          @click="emit('close')"
        >
          <Icon name="close" />
        </button>
      </div>

      <div class="ft-pop-body">
        <div class="ft-pop-label">
          <span>{{ headerLabel }}</span>
          <span
            v-if="!loading"
            class="ft-pop-meta"
          >{{ availableCount }} {{ t('zones.available') }}</span>
        </div>

        <div
          v-if="loading"
          class="ft-pop-units"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="ft-skel"
            style="height: 56px;"
          />
        </div>

        <div
          v-else-if="fetchError || items.length === 0"
          style="font-size: 12px; color: var(--ink-3); padding: 8px 0 14px;"
        >
          {{ t('zones.noZones') }}
        </div>

        <template v-else>
          <div
            v-for="group in groups"
            :key="group.area"
            class="ft-pop-zone-group"
          >
            <div
              v-if="groups.length > 1"
              class="ft-pop-zone-label"
            >
              {{ t('zones.zonePrefix') }} {{ group.area }}
            </div>
            <div class="ft-pop-units">
              <div
                v-for="tile in group.units"
                :key="tile.id"
                :class="[
                  'ft-unit',
                  isYours(group.area, tile.unit) ? 'is-yours' : (tile.available ? 'is-free' : 'is-busy'),
                ]"
              >
                <span class="ft-unit-num">{{ tile.unit }}</span>
                <span class="ft-unit-label">{{ unitLabel }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="ft-pop-foot">
        <button
          type="button"
          class="ft-btn-ghost"
          @click="emit('close')"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
