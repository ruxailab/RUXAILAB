import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'
import FormTestDescription from '@/shared/components/FormTestDescription.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

const mountForm = (locale) =>
  mount(FormTestDescription, {
    props: {
      test: { testTitle: 'Study', testDescription: 'a'.repeat(151) },
    },
    global: {
      plugins: [
        createI18n({ legacy: false, locale, messages: { en, es } }),
        createStore({ mutations: { SET_LOCAL_CHANGES() {} } }),
      ],
      stubs: {
        VTextarea: {
          props: ['errorMessages'],
          template:
            '<p class="description-error">{{ errorMessages.join("") }}</p>',
        },
      },
    },
  })

it('shows the 150 character limit message for a long description', () => {
  expect(mountForm('en').find('.description-error').text()).toBe(
    'Max 150 characters',
  )
  expect(mountForm('es').find('.description-error').text()).toBe(
    'Máximo 150 caracteres',
  )
})
