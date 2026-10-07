import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { enUS, es } from 'date-fns/locale'
import { useDateLocale } from '@/shared/composables/useDateLocale'

jest.mock('vue-i18n', () => ({
  useI18n: jest.fn(),
}))

describe('useDateLocale', () => {
  it('maps the "en" i18n locale to the English date-fns and Intl locales', () => {
    useI18n.mockReturnValue({ locale: ref('en') })

    const { dateFnsLocale, intlLocale } = useDateLocale()

    expect(dateFnsLocale.value).toBe(enUS)
    expect(intlLocale.value).toBe('en-US')
  })

  it('maps the "es" i18n locale to the Spanish date-fns and Intl locales', () => {
    useI18n.mockReturnValue({ locale: ref('es') })

    const { dateFnsLocale, intlLocale } = useDateLocale()

    expect(dateFnsLocale.value).toBe(es)
    expect(intlLocale.value).toBe('es-ES')
  })

  it('falls back to English for a locale it does not recognize', () => {
    useI18n.mockReturnValue({ locale: ref('fr') })

    const { dateFnsLocale, intlLocale } = useDateLocale()

    expect(dateFnsLocale.value).toBe(enUS)
    expect(intlLocale.value).toBe('en-US')
  })

  it('stays reactive when the i18n locale changes', () => {
    const locale = ref('en')
    useI18n.mockReturnValue({ locale })

    const { dateFnsLocale, intlLocale } = useDateLocale()

    expect(intlLocale.value).toBe('en-US')

    locale.value = 'es'

    expect(dateFnsLocale.value).toBe(es)
    expect(intlLocale.value).toBe('es-ES')
  })
})
