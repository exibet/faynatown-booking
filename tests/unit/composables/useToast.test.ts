import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STATE_KEY } from '#shared/state-keys'

describe('useToast', () => {
  beforeEach(() => {
    useState(STATE_KEY.TOASTS).value = []
    vi.useFakeTimers()
  })

  it('show() appends an info item and dismisses after the default TTL', () => {
    const { items, show } = useToast()
    show('hello')
    expect(items.value).toHaveLength(1)
    expect(items.value[0]?.variant).toBe('info')
    vi.advanceTimersByTime(2400)
    expect(items.value).toHaveLength(0)
  })

  it('error() uses the error variant and a longer TTL', () => {
    const { items, error } = useToast()
    error('nope')
    expect(items.value[0]?.variant).toBe('error')
    vi.advanceTimersByTime(2400)
    // Still present at the info TTL.
    expect(items.value).toHaveLength(1)
    vi.advanceTimersByTime(2400)
    expect(items.value).toHaveLength(0)
  })

  it('dismiss() removes the matching toast immediately', () => {
    const { items, show, dismiss } = useToast()
    show('first')
    show('second')
    const id = items.value[0]?.id ?? 0
    dismiss(id)
    expect(items.value.map(i => i.message)).toEqual(['second'])
  })

  it('show() no-ops on empty message', () => {
    const { items, show } = useToast()
    show('')
    expect(items.value).toHaveLength(0)
  })
})
