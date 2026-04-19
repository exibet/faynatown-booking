<script setup lang="ts">
import type { ZoneGroup } from '~/utils/zone-grouping'
import type { PickedTile } from '~/composables/useBookingPicker'

/**
 * Shared presenter for the zone-tile grid shown in the desktop booking
 * popover and the mobile slot sheet. Keeps the loading / error / group /
 * tile markup in one place so a11y, skeleton sizing, and tile states stay
 * aligned between the two surfaces.
 *
 * Variant switches the CSS class prefix:
 *   desktop → .ft-pop-units / .ft-pop-zone-* / .ft-unit / is-free|busy|yours|picked
 *   mobile  → .sh-units    / .sh-zone-*    / .sh-unit / is-free|busy|yours|picked
 *
 * Free (and not-yours) tiles render as real `<button>`s and emit `@pick`
 * with `{ area, unit }`. Busy / yours tiles are inert `<div>`s.
 */
interface Props {
  variant: 'desktop' | 'mobile'
  loading: boolean
  hasError: boolean
  groups: ZoneGroup[]
  unitLabel: string
  zonePrefix: string
  emptyLabel: string
  isYours: (area: number, unit: number) => boolean
  picked?: PickedTile | null
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  skeletonCount: 6,
  picked: null,
})

const emit = defineEmits<{
  (e: 'pick', payload: PickedTile): void
}>()

const classes = computed(() => {
  const prefix = props.variant === 'desktop' ? 'ft-pop' : 'sh'
  const tilePrefix = props.variant === 'desktop' ? 'ft-unit' : 'sh-unit'
  return {
    units: `${prefix}-units`,
    group: `${prefix}-zone-group`,
    label: `${prefix}-zone-label`,
    tile: tilePrefix,
    num: `${tilePrefix}-num`,
    caption: `${tilePrefix}-label`,
  }
})

function isPicked(area: number, unit: number): boolean {
  const p = props.picked
  return !!p && p.area === area && p.unit === unit
}

const skeletonHeight = computed(() => props.variant === 'desktop' ? '56px' : '60px')
</script>

<template>
  <div
    v-if="loading"
    :class="classes.units"
  >
    <div
      v-for="n in skeletonCount"
      :key="n"
      class="ft-skel"
      :style="{ height: skeletonHeight }"
    />
  </div>

  <div
    v-else-if="hasError || groups.length === 0"
    :class="variant === 'desktop' ? 'ft-pop-empty' : 'sh-empty'"
  >
    {{ emptyLabel }}
  </div>

  <template v-else>
    <div
      v-for="group in groups"
      :key="group.area"
      :class="classes.group"
    >
      <div
        v-if="groups.length > 1"
        :class="classes.label"
      >
        {{ zonePrefix }} {{ group.area }}
      </div>
      <div :class="classes.units">
        <template
          v-for="tile in group.units"
          :key="tile.id"
        >
          <button
            v-if="tile.available && !isYours(group.area, tile.unit)"
            type="button"
            :class="[
              classes.tile,
              'is-free',
              isPicked(group.area, tile.unit) ? 'is-picked' : null,
            ]"
            :aria-pressed="isPicked(group.area, tile.unit)"
            @click="emit('pick', { area: group.area, unit: tile.unit })"
          >
            <span :class="classes.num">{{ tile.unit }}</span>
            <span :class="classes.caption">{{ unitLabel }}</span>
          </button>
          <div
            v-else
            :class="[
              classes.tile,
              isYours(group.area, tile.unit) ? 'is-yours' : 'is-busy',
            ]"
          >
            <span :class="classes.num">{{ tile.unit }}</span>
            <span :class="classes.caption">{{ unitLabel }}</span>
          </div>
        </template>
      </div>
    </div>
  </template>
</template>
