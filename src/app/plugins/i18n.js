import { createI18n } from 'vue-i18n'

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /\.json$/i)
  const messages = {}
  locales.keys().forEach((key) => {
    const filename = key.split('/').pop() || ''
    const match = filename.match(/^([A-Za-z0-9-_]+)\.json$/i)
    if (!match) return
    const locale = match[1]
    if (locale) messages[locale] = locales(key)
  })
  return messages
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
})

export default i18n
