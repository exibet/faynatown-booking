/**
 * Ukrainian noun pluralisation — CLDR plural categories simplified to the
 * three forms we actually need for UI counts:
 *   one:  1, 21, 31 ... (also 101, 121, but not 11)
 *   few:  2-4, 22-24 ... (but not 12-14)
 *   many: 0, 5-20, 25-30 ...
 *
 * Example: pluralUk(n, 'доступна', 'доступні', 'доступних').
 */
export function pluralUk(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
