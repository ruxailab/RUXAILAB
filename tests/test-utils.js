import { render as vtlRender } from '@testing-library/vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'
import en from '@/locales/en.json'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import Vuetify from 'vuetify'
import { createVuetify } from 'vuetify'

export * from '@testing-library/vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [], // Add your routes here if needed
})

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
})

const vuetify = createVuetify()

export function render(component, options = {}, { customStore } = {}) {
  const store = customStore || createStore({})

  return vtlRender(component, {
    global: {
      plugins: [router, i18n, store, vuetify, Toast],
      ...options?.global,
    },
    ...options,
  })
}

export function renderWithMockStore(component, options = {}) {
  const signin = jest.fn(() => Promise.resolve())

  const customStore = createStore({
    actions: {
      signin,
    },
    getters: {
      loading: () => false,
      user: () => ({ email: 'mock@example.com' }),
    },
  })

  return {
    ...render(component, options, { customStore }),
    signin,
  }
}