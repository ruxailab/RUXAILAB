const UNASSIGNED_KEY = '__unassigned'

export function getCardTitles(test) {
  return (test?.testStructure?.cardSorting?.cards || []).map((c) => c.title)
}

export function getSubmittedAnswers(answers = []) {
  return answers.filter((answer) => answer?.submitted)
}

export function getCategoryTitles(test, submittedAnswers = []) {
  const predefined = (test?.testStructure?.cardSorting?.categories || []).map(
    (c) => c.title,
  )
  const fromAnswers = new Set(predefined)

  submittedAnswers.forEach((answer) => {
    Object.keys(answer?.sorting || {}).forEach((category) => {
      if (category !== UNASSIGNED_KEY) fromAnswers.add(category)
    })
  })

  return Array.from(fromAnswers)
}

/**
 * Map each card title to the category it was placed in for a single answer.
 * Unassigned cards are ignored for similarity calculations.
 */
function getCardCategoryMap(answer) {
  const map = {}
  Object.entries(answer?.sorting || {}).forEach(([category, cards]) => {
    if (category === UNASSIGNED_KEY) return
    ;(cards || []).forEach((cardTitle) => {
      map[cardTitle] = category
    })
  })
  return map
}

/**
 * Build a card×card co-occurrence matrix.
 * Absolute value = how many participants placed both cards in the same category.
 * Percentage = absolute / totalParticipants * 100.
 */
export function buildSimilarityMatrix(cardTitles, submittedAnswers) {
  const n = cardTitles.length
  const absolute = Array.from({ length: n }, () => Array(n).fill(0))
  const percentage = Array.from({ length: n }, () => Array(n).fill(0))
  const total = submittedAnswers.length

  if (!n || !total) {
    return { absolute, percentage, totalParticipants: total }
  }

  submittedAnswers.forEach((answer) => {
    const cardCategory = getCardCategoryMap(answer)

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (i === j) {
          absolute[i][j] += 1
          continue
        }

        const catI = cardCategory[cardTitles[i]]
        const catJ = cardCategory[cardTitles[j]]
        if (catI && catJ && catI === catJ) {
          absolute[i][j] += 1
          absolute[j][i] += 1
        }
      }
    }
  })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      percentage[i][j] = Math.round((absolute[i][j] / total) * 1000) / 10
    }
  }

  return { absolute, percentage, totalParticipants: total }
}

/**
 * Distance = 1 - (co-occurrence / totalParticipants). Diagonal = 0.
 */
function buildDistanceMatrix(absolute, totalParticipants) {
  const n = absolute.length
  const distance = Array.from({ length: n }, () => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distance[i][j] = 0
      } else if (totalParticipants > 0) {
        distance[i][j] = 1 - absolute[i][j] / totalParticipants
      } else {
        distance[i][j] = 1
      }
    }
  }

  return distance
}

/**
 * UPGMA (average linkage) hierarchical clustering.
 * Returns a binary tree: { left, right, height, size, label?, index? }
 */
export function buildDendrogramTree(cardTitles, submittedAnswers) {
  const { absolute, totalParticipants } = buildSimilarityMatrix(
    cardTitles,
    submittedAnswers,
  )

  if (!cardTitles.length) return null

  const distance = buildDistanceMatrix(absolute, totalParticipants)
  const n = cardTitles.length

  let clusters = cardTitles.map((label, index) => ({
    label,
    index,
    height: 0,
    size: 1,
    left: null,
    right: null,
  }))

  // Working distance matrix indexed by cluster id in `clusters`
  let dist = distance.map((row) => row.slice())

  while (clusters.length > 1) {
    let minDist = Infinity
    let minI = 0
    let minJ = 1

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        if (dist[i][j] < minDist) {
          minDist = dist[i][j]
          minI = i
          minJ = j
        }
      }
    }

    const left = clusters[minI]
    const right = clusters[minJ]
    const newSize = left.size + right.size
    const merged = {
      left,
      right,
      height: minDist,
      size: newSize,
      label: null,
      index: null,
    }

    // Build new distance row using average linkage (UPGMA)
    const newRow = []
    for (let k = 0; k < clusters.length; k++) {
      if (k === minI || k === minJ) continue
      const d =
        (dist[minI][k] * left.size + dist[minJ][k] * right.size) / newSize
      newRow.push(d)
    }

    const nextClusters = []
    const nextDist = []

    for (let i = 0; i < clusters.length; i++) {
      if (i === minI || i === minJ) continue
      nextClusters.push(clusters[i])
    }
    nextClusters.push(merged)

    for (let i = 0; i < nextClusters.length - 1; i++) {
      const row = []
      const oldI = clusters.indexOf(nextClusters[i])
      for (let j = 0; j < nextClusters.length - 1; j++) {
        const oldJ = clusters.indexOf(nextClusters[j])
        row.push(dist[oldI][oldJ])
      }
      row.push(newRow[i])
      nextDist.push(row)
    }
    nextDist.push([...newRow, 0])

    clusters = nextClusters
    dist = nextDist
  }

  return clusters[0]
}

/**
 * Assign leaf order (depth-first) and compute SVG layout coordinates.
 * Horizontal dendrogram: x = distance from similarity, y = leaf index.
 */
export function layoutDendrogram(tree, options = {}) {
  const {
    leafGap = 36,
    labelWidth = 180,
    heightScale = 360,
    paddingTop = 16,
    paddingBottom = 48,
    paddingLeft = 12,
    paddingRight = 32,
  } = options

  if (!tree) {
    return {
      nodes: [],
      links: [],
      width: 0,
      height: 0,
      maxHeight: 0,
      leaves: [],
      plotOriginX: 0,
      heightScale: 0,
    }
  }

  const leaves = []
  const collectLeaves = (node) => {
    if (!node.left && !node.right) {
      leaves.push(node)
      return
    }
    if (node.left) collectLeaves(node.left)
    if (node.right) collectLeaves(node.right)
  }
  collectLeaves(tree)

  leaves.forEach((leaf, i) => {
    leaf._y = paddingTop + i * leafGap
  })

  const maxHeight = Math.max(tree.height || 0, 0.0001)
  const plotOriginX = paddingLeft + labelWidth

  const assignCoords = (node) => {
    if (!node.left && !node.right) {
      node._x = plotOriginX
      return node._y
    }

    const yLeft = assignCoords(node.left)
    const yRight = assignCoords(node.right)
    node._y = (yLeft + yRight) / 2
    node._x = plotOriginX + (node.height / maxHeight) * heightScale
    return node._y
  }

  assignCoords(tree)

  const links = []
  const walk = (node) => {
    if (!node.left || !node.right) return

    ;[node.left, node.right].forEach((child) => {
      links.push({
        type: 'h',
        x1: child._x,
        y1: child._y,
        x2: node._x,
        y2: child._y,
      })
    })
    links.push({
      type: 'v',
      x1: node._x,
      y1: node.left._y,
      x2: node._x,
      y2: node.right._y,
    })

    walk(node.left)
    walk(node.right)
  }
  walk(tree)

  const lastLeafY = leaves.length
    ? paddingTop + (leaves.length - 1) * leafGap
    : paddingTop
  const height = lastLeafY + paddingBottom
  const width = plotOriginX + heightScale + paddingRight

  return {
    nodes: leaves.map((leaf) => ({
      label: leaf.label,
      x: leaf._x,
      y: leaf._y,
    })),
    links,
    width,
    height,
    maxHeight,
    leaves: leaves.map((l) => l.label),
    plotOriginX,
    heightScale,
  }
}

export { UNASSIGNED_KEY }
