import { mount } from '@vue/test-utils'
import DateChart from '@/ux/UserTest/components/answers/DateChart.vue'

jest.mock('vue-chartjs', () => ({
  Line: {
    props: ['data'],
    template:
      '<ul><li v-for="label in data.labels" :key="label">{{ label }}</li></ul>',
  },
}))

jest.mock('chartjs-adapter-date-fns', () => ({}))

jest.mock('@/shared/composables/useDateLocale', () => ({
  useDateLocale: () => ({ intlLocale: { value: 'en-US' } }),
}))

it('labels each day with the date the answers were saved, in any timezone', () => {
  const toLocaleDateString = Date.prototype.toLocaleDateString
  jest
    .spyOn(Date.prototype, 'toLocaleDateString')
    .mockImplementation(function (locale, options) {
      return toLocaleDateString.call(this, locale, {
        timeZone: 'America/Sao_Paulo',
        ...options,
      })
    })

  const wrapper = mount(DateChart, {
    props: {
      taskAnswers: [
        { lastUpdate: '2024-03-10T15:00:00Z' },
        { lastUpdate: '2024-03-12T13:00:00Z' },
      ],
    },
  })

  expect(wrapper.findAll('li').map((li) => li.text())).toEqual([
    '03/10/2024',
    '03/12/2024',
  ])
})
