import { beforeEach, describe, expect, it } from 'vitest'
import { FETCH_KEY } from '#shared/fetch-keys'
import { STATE_KEY } from '#shared/state-keys'
import type { Flat } from '#shared/types'

function seedFlats(flats: Flat[]) {
  // `useNuxtData` shares its ref across all callers of the same key (it reads
  // from/writes to `nuxtApp.payload.data[key]`), so we can populate it here
  // without going through `useAsyncData`.
  const { data } = useNuxtData<Flat[]>(FETCH_KEY.FLATS)
  data.value = flats
}

describe('useFlat', () => {
  beforeEach(() => {
    useState(STATE_KEY.SELECTED_FLAT).value = null
    seedFlats([])
  })

  it('selectedFlat falls back to the first flat when nothing is explicitly selected', () => {
    const flats: Flat[] = [
      { flatId: 'a', complexId: 1, address: 'Addr A', gekaNumber: '1' },
      { flatId: 'b', complexId: 1, address: 'Addr B', gekaNumber: '2' },
    ]
    seedFlats(flats)
    const { selectedFlat } = useFlat()
    expect(selectedFlat.value?.flatId).toBe('a')
  })

  it('select() picks an existing flat and ignores unknown ids', () => {
    const flats: Flat[] = [
      { flatId: 'a', complexId: 1, address: 'Addr A', gekaNumber: '1' },
      { flatId: 'b', complexId: 1, address: 'Addr B', gekaNumber: '2' },
    ]
    seedFlats(flats)
    const { select, selectedFlat } = useFlat()
    select('b')
    expect(selectedFlat.value?.flatId).toBe('b')
    select('unknown')
    // Unchanged — unknown ids are rejected silently.
    expect(selectedFlat.value?.flatId).toBe('b')
  })

  it('hasMultiple reflects flats.length > 1', () => {
    const one: Flat[] = [{ flatId: 'a', complexId: 1, address: 'A', gekaNumber: '1' }]
    seedFlats(one)
    expect(useFlat().hasMultiple.value).toBe(false)
    seedFlats([...one, { flatId: 'b', complexId: 1, address: 'B', gekaNumber: '2' }])
    expect(useFlat().hasMultiple.value).toBe(true)
  })
})
