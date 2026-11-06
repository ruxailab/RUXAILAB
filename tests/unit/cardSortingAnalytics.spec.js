import {
  colorDendrogramLayout,
  cutDendrogramTree,
  getDendrogramGroupColor,
  layoutDendrogram,
} from '@/ux/CardSorting/utils/cardSortingAnalytics'

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

  describe('colorDendrogramLayout', () => {
    const tree = {
      height: 1,
      left: {
        height: 0.4,
        left: { label: 'Card A', height: 0, left: null, right: null },
        right: { label: 'Card B', height: 0, left: null, right: null },
      },
      right: { label: 'Card C', height: 0, left: null, right: null },
    }

    const colorAtCut = (cut) => {
      const layout = layoutDendrogram(tree)
      const groups = cutDendrogramTree(tree, cut)
      const x = layout.plotOriginX + cut * layout.heightScale
      return { ...colorDendrogramLayout(layout, groups, x), x }
    }

    it('colors clusters and splits branches at the cut, leaving shared links neutral', () => {
      const { nodes, links, x } = colorAtCut(0.5)
      expect(nodes.map((node) => node.color)).toEqual([
        getDendrogramGroupColor(0),
        getDendrogramGroupColor(0),
        getDendrogramGroupColor(1),
      ])
      expect(
        links.filter((link) => link.type === 'v').map((link) => link.color),
      ).toEqual(['#767676', getDendrogramGroupColor(0)])
      const crossing = links.filter(
        (link) => link.type === 'h' && link.x2 === x,
      )
      expect(crossing.map((link) => link.color)).toEqual([
        getDendrogramGroupColor(0),
        getDendrogramGroupColor(1),
      ])
      expect(
        links
          .filter((link) => link.type === 'h' && link.x1 === x)
          .every((link) => link.color === '#767676'),
      ).toBe(true)
    })

    it('updates colors at the merge boundary and for a single group', () => {
      expect(colorAtCut(0.39).nodes.map((node) => node.color)).toEqual([
        getDendrogramGroupColor(0),
        getDendrogramGroupColor(1),
        getDendrogramGroupColor(2),
      ])
      expect(colorAtCut(0.4).nodes[1].color).toBe(getDendrogramGroupColor(0))
      const merged = colorAtCut(1)
      expect(
        merged.nodes.every((node) => node.color === getDendrogramGroupColor(0)),
      ).toBe(true)
      expect(
        merged.links.every((link) => link.color === getDendrogramGroupColor(0)),
      ).toBe(true)
    })

    it('supports empty layouts and more groups than the initial palette', () => {
      expect(colorDendrogramLayout(layoutDendrogram(null), [], 0)).toEqual({
        nodes: [],
        links: [],
      })
      expect(getDendrogramGroupColor(8)).toMatch(/^#[0-9a-f]{6}$/)
      expect(
        new Set(Array.from({ length: 24 }, (_, i) => getDendrogramGroupColor(i)))
          .size,
      ).toBe(24)
    })
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
