import { mount } from '@vue/test-utils'
import SusRatingChart from '@/ux/UserTest/SusRatingChart.vue'

it('counts a 67.5 score in the OK bucket', () => {
  const wrapper = mount(SusRatingChart, {
    props: { scores: [50, 67.5, 75, 100] },
  })

  const counts = wrapper
    .findAll('.distribution-row')
    .map((row) => row.find('.progress-text').text())

  expect(counts).toEqual(['1', '1', '1', '1'])
})
