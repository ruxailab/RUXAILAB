import { createI18n } from 'vue-i18n'

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /\.json$/i)
  const messages = {}
  locales.keys().forEach((key) => {
    const filename = key.split('/').pop() || ''
    if (!filename.toLowerCase().endsWith('.json')) return
    const locale = filename.slice(0, -'.json'.length)
    if (locale) messages[locale] = locales(key)
  })
  console.info('Loaded locale messages:', Object.keys(messages))
  return messages
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
})

export default i18n
