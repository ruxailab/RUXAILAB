import { cutDendrogramTree } from '@/ux/CardSorting/utils/cardSortingAnalytics'

describe('cutDendrogramTree', () => {
  const tree = {
    height: 1,
    left: {
      height: 0.4,
      left: { label: 'Card A', left: null, right: null },
      right: { label: 'Card B', left: null, right: null },
    },
    right: { label: 'Card C', left: null, right: null },
  }

  it('keeps clusters merged when their merge height is at the cut', () => {
    expect(cutDendrogramTree(tree, 0.4)).toEqual([
      ['Card A', 'Card B'],
      ['Card C'],
    ])
  })

  it('splits clusters whose merge height is above the cut', () => {
    expect(cutDendrogramTree(tree, 0.3)).toEqual([
      ['Card A'],
      ['Card B'],
      ['Card C'],
    ])
  })

  it('returns no groups for an empty tree', () => {
    expect(cutDendrogramTree(null, 0.5)).toEqual([])
  })
})
