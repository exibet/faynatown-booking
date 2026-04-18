import { beforeEach, describe, expect, it } from 'vitest'
import { STATE_KEY } from '#shared/state-keys'

describe('useConfirm', () => {
  beforeEach(() => {
    useState(STATE_KEY.CONFIRM_DIALOG).value = null
  })

  const opts = {
    title: 'Skasuvaty?',
    confirmLabel: 'Так',
    cancelLabel: 'Ні',
  }

  it('ask() resolves true when answer(true) is called', async () => {
    const { ask, answer } = useConfirm()
    const promise = ask(opts)
    answer(true)
    await expect(promise).resolves.toBe(true)
  })

  it('ask() resolves false when answer(false) is called', async () => {
    const { ask, answer } = useConfirm()
    const promise = ask(opts)
    answer(false)
    await expect(promise).resolves.toBe(false)
  })

  it('opening a second confirm resolves the previous with false', async () => {
    const { ask, answer } = useConfirm()
    const first = ask(opts)
    const second = ask({ ...opts, title: 'Другий' })
    // first was displaced → resolved false
    await expect(first).resolves.toBe(false)
    answer(true)
    await expect(second).resolves.toBe(true)
  })

  it('answer() is a no-op when no dialog is open', () => {
    const { answer, state } = useConfirm()
    answer(true)
    expect(state.value).toBeNull()
  })
})
