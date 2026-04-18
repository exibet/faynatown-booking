import { findBookingType } from '#shared/constants'
import type { BookingTypeParam } from '#shared/constants'

/**
 * Returns the translated label for a booking type param. Centralises the
 * `findBookingType → t('types.${i18nKey}')` pattern that three components
 * inlined independently.
 */
export function useBookingTypeLabel() {
  const { t } = useI18n()
  return (param: BookingTypeParam): string => {
    const meta = findBookingType(param)
    return meta ? t(`types.${meta.i18nKey}`) : ''
  }
}
