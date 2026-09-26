import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { enUS, es } from 'date-fns/locale'

const DATE_FNS_LOCALES = {
  en: enUS,
  es,
}

const INTL_LOCALES = {
  en: 'en-US',
  es: 'es-ES',
}

/**
 * Maps the app's active i18n locale to the matching date-fns and
 * Intl locale, so date/time formatting follows the user's selected
 * language instead of a locale hardcoded at the call site.
 */
export function useDateLocale() {
  const { locale } = useI18n()

  const dateFnsLocale = computed(
    () => DATE_FNS_LOCALES[locale.value] || DATE_FNS_LOCALES.en,
  )

  const intlLocale = computed(
    () => INTL_LOCALES[locale.value] || INTL_LOCALES.en,
  )

  return { dateFnsLocale, intlLocale }
}
