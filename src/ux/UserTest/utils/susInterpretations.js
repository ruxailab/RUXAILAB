function createSegments(definitions) {
  return definitions.map(([min, max, category]) => ({
    min,
    max,
    category,
    width: max - min,
  }))
}

const gradeBands = [
  [0, 51.65, 'gradeF'],
  [51.65, 62.65, 'gradeD'],
  [62.65, 64.95, 'gradeCMinus'],
  [64.95, 71.05, 'gradeC'],
  [71.05, 72.55, 'gradeCPlus'],
  [72.55, 74.05, 'gradeBMinus'],
  [74.05, 77.15, 'gradeB'],
  [77.15, 78.85, 'gradeBPlus'],
  [78.85, 80.75, 'gradeAMinus'],
  [80.75, 84.05, 'gradeA'],
  [84.05, 100, 'gradeAPlus'],
]

const gradeBandsByLetter = {
  gradeA: gradeBands.slice(8),
  gradeB: gradeBands.slice(5, 8),
  gradeC: gradeBands.slice(2, 5),
  gradeD: gradeBands.slice(1, 2),
  gradeF: gradeBands.slice(0, 1),
}

export const SUS_INTERPRETATION_VISUALIZATIONS = [
  {
    key: 'npsCategories',
    axisLabel: 'scoreAxis',
    segments: createSegments([
      [0, 62.65, 'detractor'],
      [62.65, 78.85, 'passive'],
      [78.85, 100, 'promoter'],
    ]),
  },
  {
    key: 'acceptabilityRanges',
    axisLabel: 'scoreAxis',
    segments: createSegments([
      [0, 51.65, 'notAcceptable'],
      [51.65, 71.05, 'marginal'],
      [71.05, 100, 'acceptable'],
    ]),
  },
  {
    key: 'adjectiveRating',
    axisLabel: 'scoreAxis',
    segments: createSegments([
      [0, 25.05, 'worstImaginable'],
      [25.05, 51.65, 'poorAdjective'],
      [51.65, 71.05, 'fairOkAdjective'],
      [71.05, 80.75, 'goodAdjective'],
      [80.75, 84.05, 'excellentAdjective'],
      [84.05, 100, 'bestImaginable'],
    ]),
  },
  {
    key: 'curvedGradingScale',
    axisLabel: 'scoreAxis',
    segments: ['gradeF', 'gradeD', 'gradeC', 'gradeB', 'gradeA'].map(
      (category) => {
        const bands = gradeBandsByLetter[category]
        const [min] = bands[0]
        const max = bands[bands.length - 1][1]

        return {
          min,
          max,
          category,
          width: max - min,
          details: createSegments(
            bands.map(([detailMin, detailMax, detailCategory]) => [
              detailMin,
              detailMax,
              detailCategory,
            ]),
          ),
        }
      },
    ),
  },
  {
    key: 'percentileRank',
    axisLabel: 'percentileAxis',
    segments: createSegments(
      gradeBands.map(([min, max], index) => [
        min,
        max,
        [
          'percentile0to14',
          'percentile15to34',
          'percentile35to40',
          'percentile41to59',
          'percentile60to64',
          'percentile65to69',
          'percentile70to79',
          'percentile80to84',
          'percentile85to89',
          'percentile90to95',
          'percentile96to100',
        ][index],
      ]),
    ),
  },
]

export function getActiveInterpretationSegment(visualization, score) {
  if (score < 0 || score > 100) return undefined

  return visualization.segments.find(
    (segment) =>
      score >= segment.min &&
      (score < segment.max || (segment.max === 100 && score <= segment.max)),
  )
}

export function getInterpretationRange(segment, locale) {
  const min = formatSUSScore(segment.min, locale)
  const formattedUpperBound =
    segment.max === 100 ? '100' : `<${formatSUSScore(segment.max, locale)}`
  return `${min}–${formattedUpperBound}`
}

export function getInterpretationTooltip(segment, locale, translate) {
  const label = translate(segment.category)
  if (!segment.details) {
    return `${label} — ${getInterpretationRange(segment, locale)}`
  }

  const details = segment.details
    .map(
      (detail) =>
        `${translate(detail.category)} ${getInterpretationRange(detail, locale)}`,
    )
    .join(' · ')
  return details
}

export function formatSUSScore(score, locale) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 15,
  }).format(score)
}
