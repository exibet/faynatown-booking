import type { ZoneItem } from '#shared/types'

/**
 * Some upstream booking types (notably BBQ) split their zones into multiple
 * physical areas that reuse the same gazebo numbers. The API encodes the
 * area as a `(зона BBQ - N)` suffix in `name`. Without grouping, the popover
 * shows duplicate "1, 2, 3, … 1, 2, 3" tiles with no way to tell them apart.
 *
 * `groupZones` parses the suffix, strips it from the display label, and
 * returns one group per area sorted by area number.
 */

export interface UnitTile {
  id: number
  unit: number
  available: boolean
}

export interface ZoneGroup {
  area: number
  units: UnitTile[]
}

const AREA_RE = /\s*\(\s*зона\s*BBQ\s*[-–]\s*(\d+)\s*\)/i

export function parseArea(name: string): number {
  const match = AREA_RE.exec(name)
  return match?.[1] ? Number.parseInt(match[1], 10) : 1
}

export function parseUnitNumber(name: string): number {
  const cleaned = name.replace(AREA_RE, '')
  const match = /(\d+)(?!.*\d)/.exec(cleaned)
  return match?.[1] ? Number.parseInt(match[1], 10) : 0
}

export function groupZones(items: ZoneItem[]): ZoneGroup[] {
  const map = new Map<number, ZoneGroup>()
  for (const item of items) {
    const area = parseArea(item.name)
    const unit = parseUnitNumber(item.name)
    if (!map.has(area)) map.set(area, { area, units: [] })
    const tiles = map.get(area)
    if (!tiles) continue
    tiles.units.push({
      id: item.id,
      unit,
      available: item.available,
    })
  }
  for (const g of map.values()) {
    g.units.sort((a, b) => a.unit - b.unit)
  }
  return Array.from(map.values()).sort((a, b) => a.area - b.area)
}
