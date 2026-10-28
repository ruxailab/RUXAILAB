import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'
import FinalReportView from '@/ux/Heuristic/views/FinalReportView.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

jest.mock(
  '@/ux/Heuristic/components/final_report/FinalReportSelectionBox.vue',
  () => ({ template: '<div />' }),
)

jest.mock('vue-router', () => ({
  ...jest.requireActual('vue-router'),
  useRouter: () => ({ push: jest.fn() }),
}))

const mountView = (locale) =>
  mount(FinalReportView, {
    global: {
      plugins: [
        createI18n({ legacy: false, locale, messages: { en, es } }),
        createStore({
          getters: {
            test: () => ({ id: 'study-1' }),
            testAnswerDocument: () => ({ heuristicAnswers: { a: {} } }),
          },
        }),
      ],
      stubs: {
        PageWrapper: {
          props: ['title'],
          template: '<h1>{{ title }}</h1>',
        },
      },
    },
  })

it.each([
  ['en', 'Final Report'],
  ['es', 'Informe final'],
])('titles the page in %s', (locale, title) => {
  expect(mountView(locale).text()).toBe(title)
})
