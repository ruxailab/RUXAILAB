import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import NotificationItem from '@/features/notifications/components/NotificationItem.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

const typeLabel = (locale, type) => {
  const wrapper = mount(NotificationItem, {
    props: { notification: { type, read: true } },
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale,
          fallbackLocale: 'en',
          messages: { en, es },
        }),
      ],
      stubs: {
        'v-avatar': true,
        'v-icon': true,
        'v-chip': { template: '<span class="chip"><slot /></span>' },
      },
    },
  })
  return wrapper.find('.chip').text()
}

it.each([
  ['Session', 'Sesión'],
  ['Message', 'Mensaje'],
  ['Collaboration', 'Colaboración'],
  ['Participant', 'Participante'],
  ['Other', 'Notificación'],
])('shows the %s type label in Spanish as %s', (type, label) => {
  expect(typeLabel('es', type)).toBe(label)
})

it('shows the type label in English', () => {
  expect(typeLabel('en', 'Session')).toBe('Session')
})
