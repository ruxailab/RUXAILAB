import {
  SUS_INTERPRETATION_VISUALIZATIONS,
  getActiveInterpretationSegment,
  getInterpretationRange,
  getInterpretationTooltip,
} from '@/ux/UserTest/utils/susInterpretations'

function getCategory(visualizationKey, score) {
  const visualization = SUS_INTERPRETATION_VISUALIZATIONS.find(
    ({ key }) => key === visualizationKey,
  )

  return getActiveInterpretationSegment(visualization, score)?.category
}

describe('SUS interpretation ranges', () => {
  it('covers the 0–100 score range without gaps or overlaps', () => {
    SUS_INTERPRETATION_VISUALIZATIONS.forEach(({ segments }) => {
      expect(segments[0].min).toBe(0)
      expect(segments[segments.length - 1].max).toBe(100)
      expect(segments.reduce((total, segment) => total + segment.width, 0)).toBe(
        100,
      )

      segments.slice(1).forEach((segment, index) => {
        expect(segment.min).toBe(segments[index].max)
      })
    })
  })

  it('classifies unrounded decimal scores across all five methods', () => {
    expect(getCategory('curvedGradingScale', 67.5)).toBe('gradeC')
    expect(getCategory('percentileRank', 67.5)).toBe('percentile41to59')
    expect(getCategory('adjectiveRating', 67.5)).toBe('fairOkAdjective')
    expect(getCategory('acceptabilityRanges', 67.5)).toBe('marginal')
    expect(getCategory('npsCategories', 67.5)).toBe('passive')

    expect(getCategory('curvedGradingScale', 78.85)).toBe('gradeA')
    expect(getCategory('percentileRank', 78.85)).toBe('percentile85to89')
    expect(getCategory('adjectiveRating', 78.85)).toBe('goodAdjective')
    expect(getCategory('acceptabilityRanges', 78.85)).toBe('acceptable')
    expect(getCategory('npsCategories', 78.85)).toBe('promoter')
  })

  it('uses the exact interval boundary without rounding the score', () => {
    const grades = SUS_INTERPRETATION_VISUALIZATIONS.find(
      ({ key }) => key === 'curvedGradingScale',
    )

    expect(getActiveInterpretationSegment(grades, 78.849999).category).toBe(
      'gradeB',
    )
    expect(getActiveInterpretationSegment(grades, 78.85).category).toBe('gradeA')
    const gradeA = grades.segments.find(({ category }) => category === 'gradeA')
    expect(getInterpretationRange(gradeA, 'en')).toBe('78.85–100')
  })

  it('shows plus and minus grades only in the grade segment tooltip', () => {
    const grades = SUS_INTERPRETATION_VISUALIZATIONS.find(
      ({ key }) => key === 'curvedGradingScale',
    )
    const gradeA = grades.segments.find(({ category }) => category === 'gradeA')
    const tooltip = getInterpretationTooltip(
      gradeA,
      'en',
      (category) => category,
    )

    expect(gradeA.category).toBe('gradeA')
    expect(tooltip).toBe(
      'gradeAMinus 78.85–<80.75 · gradeA 80.75–<84.05 · gradeAPlus 84.05–100',
    )
  })

  it('does not classify scores outside the SUS range', () => {
    const grades = SUS_INTERPRETATION_VISUALIZATIONS.find(
      ({ key }) => key === 'curvedGradingScale',
    )

    expect(getActiveInterpretationSegment(grades, -0.01)).toBeUndefined()
    expect(getActiveInterpretationSegment(grades, 100.01)).toBeUndefined()
  })
})
