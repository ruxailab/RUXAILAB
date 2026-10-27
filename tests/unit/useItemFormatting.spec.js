import { createI18n } from 'vue-i18n'
import { useItemFormatting } from '@/shared/composables/useItemFormatting'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

let mockI18n

jest.mock('vue-i18n', () => ({
  ...jest.requireActual('vue-i18n'),
  useI18n: () => mockI18n.global,
}))

it.each([
  ['en', 'Unknown'],
  ['es', 'Desconocido'],
])('names a public template owner without an email in %s', (locale, name) => {
  mockI18n = createI18n({ legacy: false, locale, messages: { en, es } })
  const { getOwnerName } = useItemFormatting({ value: 'publicTemplates' })

  expect(getOwnerName({ header: { templateAuthor: {} } })).toBe(name)
})
