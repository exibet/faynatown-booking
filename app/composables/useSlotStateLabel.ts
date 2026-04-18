import type { SlotState } from '#shared/types'

export type SlotLabelVariant = 'desktop' | 'mobile'

/**
 * Maps a slot's `SlotState` to a localised label. Two variants because desktop
 * and mobile use slightly different wording for the same state:
 *   - busy → desktop "Зайнято", mobile "Усі зайнято" (card CTA)
 *   - past → desktop empty (slot is dashed), mobile "Зайнято" (card text)
 * The rest overlaps, so consolidating prevents drift between the two trees.
 */
export function useSlotStateLabel() {
  const { t } = useI18n()
  return function label(state: SlotState, variant: SlotLabelVariant): string {
    switch (state) {
      case 'free': return t('calendar.available')
      case 'yours': return t('calendar.mine')
      case 'busy': return variant === 'mobile' ? t('calendar.allOccupied') : t('calendar.unavailable')
      case 'past': return variant === 'mobile' ? t('calendar.unavailable') : ''
    }
  }
}
