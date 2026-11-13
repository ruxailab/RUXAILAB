import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'
import StudiesSection from '@/features/navigation/components/navbarSections/StudiesSection.vue'
import CommunityStudiesSection from '@/features/navigation/components/navbarSections/CommunityStudiesSection.vue'
import en from '@/app/plugins/locales/en.json'

jest.mock('@/shared/components/tables/ListComponent.vue', () => ({
  props: ['items'],
  template:
    '<ul><li v-for="item in items" :key="item.id">{{ item.testTitle }}</li></ul>',
}))

jest.mock('vue-router', () => ({
  ...jest.requireActual('vue-router'),
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/shared/utils/toast', () => ({ showInfo: jest.fn() }))

const study = (id, testTitle, testType, subType) => ({
  id,
  testTitle,
  testType,
  subType,
  status: 'active',
})

const studies = [
  study('1', 'Checkout usability test', 'USER', 'UNMODERATED'),
  study('2', 'Homepage heuristics', 'HEURISTIC'),
  study('3', 'Website contrast audit', 'MANUAL', 'MANUAL'),
  study('4', 'Landing page WCAG scan', 'AUTOMATIC'),
]

const mountSection = (component) =>
  mount(component, {
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', messages: { en } }),
        createStore({
          getters: {
            tests: () => studies,
            publicTests: () => studies,
            user: () => ({ id: 'user-1' }),
          },
        }),
      ],
      stubs: {
        VSelect: {
          props: ['modelValue', 'items'],
          emits: ['update:modelValue'],
          template:
            '<select @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="item in items" :key="item.value" :value="item.value">{{ item.value }}</option></select>',
        },
      },
    },
  })

const selectMethod = async (wrapper, method) => {
  const methodSelect = wrapper
    .findAll('select')
    .find((select) => select.find(`option[value="${method}"]`).exists())
  await methodSelect.setValue(method)
}

const listedTitles = (wrapper) => wrapper.findAll('li').map((li) => li.text())

describe.each([
  ['StudiesSection', StudiesSection],
  ['CommunityStudiesSection', CommunityStudiesSection],
])('%s method filter', (_, component) => {
  it('lists manual accessibility studies', async () => {
    const wrapper = mountSection(component)

    await selectMethod(wrapper, 'ACCESSIBILITY_MANUAL')

    expect(listedTitles(wrapper)).toEqual(['Website contrast audit'])
  })

  it('lists automatic accessibility studies', async () => {
    const wrapper = mountSection(component)

    await selectMethod(wrapper, 'ACCESSIBILITY_AUTOMATIC')

    expect(listedTitles(wrapper)).toEqual(['Landing page WCAG scan'])
  })

  it('still lists heuristic studies', async () => {
    const wrapper = mountSection(component)

    await selectMethod(wrapper, 'HEURISTICS')

    expect(listedTitles(wrapper)).toEqual(['Homepage heuristics'])
  })
})
