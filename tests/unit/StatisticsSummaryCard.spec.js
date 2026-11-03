import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import StatisticsSummaryCard from '@/ux/Heuristic/components/statistics/StatisticsSummaryCard.vue'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

const slot = { template: '<div><slot /></div>' }

const mountCard = (locale, result) => {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { en, es },
  })
  const wrapper = mount(StatisticsSummaryCard, {
    props: {
      result: {
        average: '72.50%',
        max: '90.00%',
        min: '55.00%',
        sd: '8.00%',
        avrgmaxWarning: '80.00%',
        avrgminWarning: '60.00%',
        evaluators: 2,
        totalComments: 3,
        totalImages: 0,
        ...result,
      },
    },
    global: {
      plugins: [i18n],
      stubs: {
        'v-card': slot,
        'v-row': slot,
        'v-col': slot,
        'v-chip': { template: '<span><slot /></span>' },
        'v-list': slot,
        'v-list-item': slot,
        'v-avatar': slot,
        'v-icon': true,
        'v-progress-linear': true,
        'v-progress-circular': slot,
        SelectionPieChart: true,
        UxMetricCard: true,
      },
    },
  })
  return { wrapper, i18n }
}

describe('StatisticsSummaryCard', () => {
  it('shows the average, warnings and images labels in Spanish', () => {
    const text = mountCard('es').wrapper.text()

    expect(text).toContain('Promedio')
    expect(text).toContain('Impacto de las advertencias')
    expect(text).toContain('Umbral promedio máximo de advertencias')
    expect(text).toContain('Umbral promedio mínimo de advertencias')
    expect(text).toContain('Imágenes por heurística')
    expect(text).toContain('Sin datos de imágenes')
    expect(text).not.toContain('Impact of warnings')
    expect(text).not.toContain('Images by Heuristic')
    expect(text).not.toContain('No image data')
  })

  it('pluralizes the evaluator chip in Spanish', () => {
    expect(mountCard('es').wrapper.text()).toContain('2 Evaluadores')
    expect(mountCard('es', { evaluators: 1 }).wrapper.text()).toContain(
      '1 Evaluador',
    )
  })

  it('translates the evaluator table headers in Spanish', () => {
    const { i18n } = mountCard('es')
    const t = i18n.global.t

    expect(t('HeuristicsTestAnswer.titles.evaluatorNumber', { n: 2 })).toBe(
      'Evaluador 2',
    )
    expect(t('HeuristicsTestAnswer.titles.averageTime')).toBe(
      'Tiempo promedio por evaluador',
    )
    expect(t('HeuristicsTestAnswer.titles.timeStdDev')).toBe(
      'Desviación estándar del tiempo',
    )
  })

  it('keeps the English labels in English', () => {
    const text = mountCard('en').wrapper.text()

    expect(text).toContain('Impact of warnings')
    expect(text).toContain('Images by Heuristic')
    expect(text).toContain('2 Evaluators')
  })
})
