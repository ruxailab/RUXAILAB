import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'
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

const study = (id, testTitle) => ({ id, testTitle, status: 'active' })

it('filters the community studies by the search text', async () => {
  const wrapper = mount(CommunityStudiesSection, {
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', messages: { en } }),
        createStore({
          getters: {
            publicTests: () => [
              study('1', 'Checkout flow usability'),
              study('2', 'Onboarding heuristics'),
            ],
            user: () => ({ id: 'user-1' }),
          },
        }),
      ],
      stubs: {
        VTextField: {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
      },
    },
  })

  await wrapper.find('input').setValue('checkout')

  expect(wrapper.findAll('li').map((li) => li.text())).toEqual([
    'Checkout flow usability',
  ])
})
