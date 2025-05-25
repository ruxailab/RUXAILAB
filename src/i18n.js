import { createI18n } from 'vue-i18n'

function loadLocaleMessages() {
  const locales = import.meta.glob('./locales/*.json', { eager: true })
  const messages = {}
  
  for (const path in locales) {
    const matched = path.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales[path].default
    }
  }
  return messages
}

export default createI18n({
  legacy: false, // Set to false to use Composition API
  locale: import.meta.env.VITE_I18N_LOCALE || 'en',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
  globalInjection: true, // Makes $t available globally
})