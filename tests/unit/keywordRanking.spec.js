import { rankKeywordCloud } from '@/ux/FocusGroup/utils/keywordRanking'

describe('rankKeywordCloud', () => {
  it('puts actionable findings ahead of neutral phrases from another topic', () => {
    const ranked = rankKeywordCloud({
      warmup: { keywords: ['color contrast', 'layout clean', 'search bar'] },
      core: {
        keywords: [
          'summary before final submit',
          'confirmation screen confusing',
          'too many steps',
          'autosave never lost progress',
          'checkout flow',
        ],
      },
    })

    expect(ranked.slice(0, 3).map(({ term }) => term)).toEqual([
      'summary before final submit',
      'confirmation screen confusing',
      'too many steps',
    ])
    expect(ranked.findIndex(({ term }) => term === 'color contrast'))
      .toBeGreaterThan(ranked.findIndex(({ term }) => term === 'too many steps'))
  })

  it('still uses the per-topic ranking within the same priority level', () => {
    const ranked = rankKeywordCloud({
      topic: { keywords: ['too many steps', 'confusing labels', 'search bar'] },
    })

    expect(ranked.map(({ term }) => term)).toEqual([
      'too many steps',
      'confusing labels',
      'search bar',
    ])
  })
})
