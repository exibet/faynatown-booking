/**
 * Mutually-exclusive dropdown/menu state. Opening one closes any other member
 * of the group. Replaces three parallel `ref(false)` + `closeAll(except?)`
 * blocks that had shipped inline.
 *
 * Generic on the set of keys so the caller gets compile-time narrowing in
 * `is(name)` / `open(name)` / `toggle(name)`.
 */
export function useDropdownGroup<K extends string>() {
  const current = ref<K | null>(null)

  function is(name: K): boolean {
    return current.value === name
  }

  function toggle(name: K): void {
    current.value = current.value === name ? null : name
  }

  function closeAll(): void {
    current.value = null
  }

  return { current, is, toggle, closeAll }
}
