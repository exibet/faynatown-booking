<script setup lang="ts">
import type { ZoneGroup } from '~/utils/zone-grouping'

/**
 * Shared presenter for the zone-tile grid shown in the desktop booking
 * popover and the mobile slot sheet. Keeps the loading / error / group /
 * tile markup in one place so a11y, skeleton sizing, and tile states stay
 * aligned between the two surfaces.
 *
 * Variant switches the CSS class prefix:
 *   desktop → .ft-pop-units / .ft-pop-zone-* / .ft-unit / is-free|busy|yours
 *   mobile  → .sh-units    / .sh-zone-*    / .sh-unit / is-busy|yours
 * The mobile variant has no `is-free` state class (accent comes from base).
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
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  skeletonCount: 6,
})

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

function tileClass(available: boolean, yours: boolean): string[] {
  const base = classes.value.tile
  if (yours) return [base, 'is-yours']
  if (!available) return [base, 'is-busy']
  // Desktop marks free tiles explicitly; mobile uses base styling.
  return props.variant === 'desktop' ? [base, 'is-free'] : [base]
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
        <div
          v-for="tile in group.units"
          :key="tile.id"
          :class="tileClass(tile.available, isYours(group.area, tile.unit))"
        >
          <span :class="classes.num">{{ tile.unit }}</span>
          <span :class="classes.caption">{{ unitLabel }}</span>
        </div>
      </div>
    </div>
  </template>
</template>
