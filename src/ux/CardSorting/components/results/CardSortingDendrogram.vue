<template>
  <v-row class="mb-8">
    <v-col cols="12">
      <v-card class="pa-8 elevation-4 rounded-xl chart-card">
        <div class="mb-6">
          <div class="d-flex align-center justify-space-between ga-2 mb-2">
            <h3 class="text-h4 font-weight-bold text-on-surface">
              {{ $t('CardSorting.dendrogram') }}
            </h3>
            <div class="d-flex align-center">
              <v-tooltip
                :text="$t('CardSorting.dendrogramInteractionHelp')"
                location="top"
                max-width="320"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-bind="tooltipProps"
                    icon="mdi-help-circle-outline"
                    variant="text"
                    density="comfortable"
                    size="small"
                    :aria-label="$t('CardSorting.dendrogramInteractionHelp')"
                  />
                </template>
              </v-tooltip>
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    icon="mdi-dots-vertical"
                    variant="text"
                    density="comfortable"
                    size="small"
                    :aria-label="$t('CardSorting.exportDendrogram')"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-image-outline"
                    :title="$t('CardSorting.exportAsPng')"
                    @click="exportAsPng"
                  />
                  <v-list-item
                    prepend-icon="mdi-code-braces"
                    :title="$t('CardSorting.exportAsLatex')"
                    @click="exportAsLatex"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ $t('CardSorting.dendrogramHint') }}
          </p>
        </div>

        <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
          <v-icon size="48" color="grey-lighten-1">
            mdi-file-tree-outline
          </v-icon>
          <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
        </div>

        <div v-else class="dendrogram-results">
          <div ref="dendrogramScroll" class="dendrogram-scroll">
            <div
              v-if="showCutTooltip"
              class="cut-line-tooltip"
              role="tooltip"
              :style="cutTooltipStyle"
            >
              {{
                $t('CardSorting.cutSimilarityValue', {
                  value: similarityValue,
                })
              }}
            </div>
            <svg
              ref="dendrogramSvg"
              :viewBox="`0 0 ${layout.width} ${layout.height}`"
              :width="layout.width"
              :height="layout.height"
              class="dendrogram-svg"
              role="group"
              :aria-label="$t('CardSorting.dendrogram')"
              preserveAspectRatio="xMinYMin meet"
              @pointermove="moveCutLine"
              @pointerup="stopCutDrag"
              @pointercancel="stopCutDrag"
            >
              <g v-for="(link, index) in layout.links" :key="`link-${index}`">
                <line
                  :x1="link.x1"
                  :y1="link.y1"
                  :x2="link.x2"
                  :y2="link.y2"
                  class="dendrogram-link"
                />
              </g>

              <g v-for="(node, index) in layout.nodes" :key="`node-${index}`">
                <circle
                  :cx="node.x"
                  :cy="node.y"
                  r="4"
                  class="dendrogram-node"
                />
                <title>{{ node.label }}</title>
                <text
                  :x="node.x - 12"
                  :y="node.y"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="dendrogram-label"
                >
                  {{ truncateLabel(node.label) }}
                </text>
              </g>

              <line
                v-if="layout.maxHeight > 0"
                :x1="cutLineX"
                :y1="layout.nodes[0]?.y - 18"
                :x2="cutLineX"
                :y2="axisY - 16"
                class="dendrogram-cut-line"
              />
              <line
                v-if="layout.maxHeight > 0"
                :x1="cutLineX"
                :y1="layout.nodes[0]?.y - 18"
                :x2="cutLineX"
                :y2="axisY - 16"
                class="dendrogram-cut-line-hit-area"
                :aria-label="$t('CardSorting.cutLineLabel')"
                role="slider"
                tabindex="0"
                :aria-valuemin="0"
                :aria-valuemax="100"
                :aria-valuenow="similarityValue"
                :aria-valuetext="
                  $t('CardSorting.cutSimilarityValue', {
                    value: similarityValue,
                  })
                "
                @pointerdown.stop.prevent="startCutDrag"
                @keydown.left.prevent="adjustCutLine(-0.02)"
                @keydown.right.prevent="adjustCutLine(0.02)"
                @keydown.down.prevent="adjustCutLine(-0.02)"
                @keydown.up.prevent="adjustCutLine(0.02)"
                @pointerenter="showCutLineTooltip"
                @pointerleave="hideCutLineTooltip"
              />

              <g
                v-if="layout.maxHeight > 0"
                :transform="`translate(${layout.plotOriginX}, ${axisY})`"
              >
                <line
                  x1="0"
                  y1="0"
                  :x2="layout.heightScale"
                  y2="0"
                  class="dendrogram-axis"
                />
                <text x="0" y="16" class="dendrogram-axis-label">
                  {{ $t('CardSorting.similarityMaximum') }}
                </text>
                <text
                  :x="layout.heightScale"
                  y="16"
                  text-anchor="end"
                  class="dendrogram-axis-label"
                >
                  {{ $t('CardSorting.similarityMinimum') }}
                </text>
                <text
                  :x="layout.heightScale / 2"
                  y="16"
                  text-anchor="middle"
                  class="dendrogram-axis-label"
                >
                  {{ $t('CardSorting.similarityScale') }}
                </text>
              </g>
            </svg>
          </div>

          <aside class="dendrogram-groups">
            <div class="d-flex align-center justify-space-between mb-1">
              <h4 class="text-subtitle-2 font-weight-bold">
                {{ $t('CardSorting.groupsForSelection') }}
              </h4>
              <v-chip size="x-small" color="primary" variant="tonal">
                {{
                  $t('CardSorting.groupCount', {
                    count: selectedGroups.length,
                  })
                }}
              </v-chip>
            </div>
            <p class="text-caption text-medium-emphasis mb-2">
              {{ $t('CardSorting.cutLineHint') }}
            </p>

            <div class="groups-grid">
              <div
                v-for="(group, index) in selectedGroups"
                :key="`group-${index}`"
                class="group-summary"
              >
                <div
                  class="d-flex align-center justify-space-between ga-2 mb-1"
                >
                  <span class="text-body-2 font-weight-medium">
                    {{ $t('CardSorting.groupNumber', { number: index + 1 }) }}
                  </span>
                  <span class="text-caption text-medium-emphasis">
                    {{
                      $t('CardSorting.cardsInGroup', {
                        count: group.cards.length,
                      })
                    }}
                  </span>
                </div>
                <div class="d-flex flex-wrap ga-1 mb-1">
                  <v-chip
                    v-for="card in group.cards"
                    :key="card"
                    size="x-small"
                    variant="outlined"
                    class="compact-chip"
                  >
                    {{ card }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t('CardSorting.categoryNames') }}
                </div>
                <div
                  v-if="group.categoryNames.length"
                  class="d-flex flex-wrap ga-1"
                >
                  <v-chip
                    v-for="category in group.categoryNames"
                    :key="category.name"
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                    class="compact-chip"
                  >
                    {{
                      $t('CardSorting.categoryNameSummary', {
                        name: category.name,
                        count: category.count,
                      })
                    }}
                  </v-chip>
                </div>
                <p v-else class="text-caption text-medium-emphasis mb-0">
                  {{ $t('CardSorting.noCategoryNames') }}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getCardTitles,
  getSubmittedAnswers,
  buildDendrogramTree,
  cutDendrogramTree,
  layoutDendrogram,
  UNASSIGNED_KEY,
} from '../../utils/cardSortingAnalytics'
import { showError } from '@/shared/utils/toast'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  answers: {
    type: Array,
    default: () => [],
  },
})

const { t } = useI18n()

const LABEL_WIDTH = 180
const HEIGHT_SCALE = 360
const MAX_LABEL_CHARS = 22

const dendrogramSvg = ref(null)
const dendrogramScroll = ref(null)
const cutPosition = ref(0.5)
const isDraggingCutLine = ref(false)
const isCutLineHovered = ref(false)
const cutTooltipPosition = ref({ left: 0, top: 0 })

const cardTitles = computed(() => getCardTitles(props.test))
const submittedAnswers = computed(() => getSubmittedAnswers(props.answers))

const hasData = computed(
  () => cardTitles.value.length > 1 && submittedAnswers.value.length > 0,
)

const tree = computed(() =>
  hasData.value
    ? buildDendrogramTree(cardTitles.value, submittedAnswers.value)
    : null,
)

const layout = computed(() =>
  layoutDendrogram(tree.value, {
    labelWidth: LABEL_WIDTH,
    heightScale: HEIGHT_SCALE,
    leafGap: 36,
    paddingTop: 20,
    paddingBottom: 56,
    paddingLeft: 16,
    paddingRight: 40,
  }),
)

const axisY = computed(() => {
  if (!layout.value.nodes.length) return 0
  const lastY = Math.max(...layout.value.nodes.map((n) => n.y))
  return lastY + 28
})

const cutLineX = computed(
  () => layout.value.plotOriginX + cutPosition.value * layout.value.heightScale,
)
const similarityValue = computed(() =>
  Math.round((1 - cutPosition.value) * 100),
)
const showCutTooltip = computed(
  () => isCutLineHovered.value || isDraggingCutLine.value,
)
const cutTooltipStyle = computed(() => ({
  left: `${cutTooltipPosition.value.left}px`,
  top: `${cutTooltipPosition.value.top}px`,
}))

const selectedGroups = computed(() =>
  cutDendrogramTree(tree.value, cutPosition.value * layout.value.maxHeight).map(
    (cards) => {
      const cardSet = new Set(cards)
      const categoryCounts = new Map()

      submittedAnswers.value.forEach((answer) => {
        Object.entries(answer?.sorting || {}).forEach(
          ([category, sortedCards]) => {
            if (category === UNASSIGNED_KEY || !Array.isArray(sortedCards))
              return
            if (!sortedCards.some((card) => cardSet.has(card))) return
            categoryCounts.set(
              category,
              (categoryCounts.get(category) || 0) + 1,
            )
          },
        )
      })

      return {
        cards,
        categoryNames: Array.from(categoryCounts, ([name, count]) => ({
          name,
          count,
        })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      }
    },
  ),
)

const setCutPositionFromPointer = (event) => {
  const svg = dendrogramSvg.value
  const screenMatrix = svg?.getScreenCTM()
  if (!svg || !screenMatrix) return

  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const localPoint = point.matrixTransform(screenMatrix.inverse())
  const position =
    (localPoint.x - layout.value.plotOriginX) / layout.value.heightScale
  cutPosition.value = Math.max(0, Math.min(1, position))
}

const updateCutTooltipPosition = () => {
  const svg = dendrogramSvg.value
  const container = dendrogramScroll.value
  const screenMatrix = svg?.getScreenCTM()
  if (!svg || !container || !screenMatrix) return

  const point = svg.createSVGPoint()
  point.x = cutLineX.value
  point.y = Math.max(8, (layout.value.nodes[0]?.y || 0) - 18)
  const screenPoint = point.matrixTransform(screenMatrix)
  const containerRect = container.getBoundingClientRect()
  cutTooltipPosition.value = {
    left: screenPoint.x - containerRect.left + container.scrollLeft + 10,
    top: screenPoint.y - containerRect.top + container.scrollTop,
  }
}

const showCutLineTooltip = () => {
  isCutLineHovered.value = true
  updateCutTooltipPosition()
}

const hideCutLineTooltip = () => {
  if (!isDraggingCutLine.value) isCutLineHovered.value = false
}

const startCutDrag = (event) => {
  isDraggingCutLine.value = true
  isCutLineHovered.value = true
  updateCutTooltipPosition()
  dendrogramSvg.value?.setPointerCapture(event.pointerId)
}

const moveCutLine = (event) => {
  if (isDraggingCutLine.value) {
    setCutPositionFromPointer(event)
    updateCutTooltipPosition()
  }
}

const stopCutDrag = (event) => {
  if (!isDraggingCutLine.value) return
  isDraggingCutLine.value = false
  updateCutTooltipPosition()
  isCutLineHovered.value = false
  if (dendrogramSvg.value?.hasPointerCapture(event.pointerId)) {
    dendrogramSvg.value.releasePointerCapture(event.pointerId)
  }
}

const adjustCutLine = (delta) => {
  cutPosition.value = Math.max(0, Math.min(1, cutPosition.value + delta))
}

const truncateLabel = (text) => {
  if (!text) return ''
  return text.length > MAX_LABEL_CHARS
    ? `${text.slice(0, MAX_LABEL_CHARS - 1)}…`
    : text
}

const downloadBlob = (blob, extension) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `card-sorting-dendrogram-${Date.now()}.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

const exportAsPng = async () => {
  const svg = dendrogramSvg.value
  if (!svg) return

  try {
    const clone = svg.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', layout.value.width)
    clone.setAttribute('height', layout.value.height)

    const originalElements = [svg, ...svg.querySelectorAll('*')]
    const clonedElements = [clone, ...clone.querySelectorAll('*')]
    originalElements.forEach((element, index) => {
      const style = getComputedStyle(element)
      clonedElements[index].style.fill = style.fill
      clonedElements[index].style.stroke = style.stroke
      clonedElements[index].style.strokeWidth = style.strokeWidth
      clonedElements[index].style.strokeDasharray = style.strokeDasharray
      clonedElements[index].style.fontSize = style.fontSize
      clonedElements[index].style.fontWeight = style.fontWeight
      clonedElements[index].style.fontFamily = style.fontFamily
    })

    const background = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect',
    )
    background.setAttribute('width', layout.value.width)
    background.setAttribute('height', layout.value.height)
    background.setAttribute('fill', '#fafafa')
    clone.prepend(background)

    const svgBlob = new Blob([new XMLSerializer().serializeToString(clone)], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const svgUrl = URL.createObjectURL(svgBlob)

    try {
      const image = new Image()
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = svgUrl
      })

      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = layout.value.width * scale
      canvas.height = layout.value.height * scale
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas context unavailable')

      context.scale(scale, scale)
      context.drawImage(image, 0, 0)
      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('PNG export failed'))
        }, 'image/png')
      })
      downloadBlob(pngBlob, 'png')
    } finally {
      URL.revokeObjectURL(svgUrl)
    }
  } catch {
    showError('CardSorting.exportError')
  }
}

const escapeLatex = (text) =>
  String(text).replace(/[\\{}$&#_%^~]/g, (character) => {
    const replacements = {
      '\\': '\\textbackslash{}',
      '{': '\\{',
      '}': '\\}',
      $: '\\$',
      '&': '\\&',
      '#': '\\#',
      _: '\\_',
      '%': '\\%',
      '^': '\\textasciicircum{}',
      '~': '\\textasciitilde{}',
    }
    return replacements[character]
  })

const exportAsLatex = () => {
  try {
    const scale = 0.01
    const y = (value) => -value * scale
    const lines = [
      '\\documentclass[tikz,border=8pt]{standalone}',
      '\\begin{document}',
      '\\begin{tikzpicture}[x=1pt,y=1pt, every node/.style={font=\\sffamily\\small}]',
      '\\fill[white] (0,0) rectangle (' +
        `${layout.value.width * scale},${-layout.value.height * scale}` +
        ');',
    ]

    layout.value.links.forEach((link) => {
      lines.push(
        `\\draw[draw={rgb,255:red,252;green,163;blue,38},line width=1.5pt] (${link.x1 * scale},${y(link.y1)}) -- (${link.x2 * scale},${y(link.y2)});`,
      )
    })

    layout.value.nodes.forEach((node) => {
      lines.push(
        `\\fill[draw={rgb,255:red,245;green,124;blue,0},fill={rgb,255:red,245;green,124;blue,0}] (${node.x * scale},${y(node.y)}) circle[radius=2pt];`,
      )
      lines.push(
        `\\node[anchor=east,text={rgb,255:red,55;green,65;blue,81}] at (${(node.x - 12) * scale},${y(node.y)}) {${escapeLatex(truncateLabel(node.label))}};`,
      )
    })

    lines.push(
      `\\draw[red!80!black,dashed,line width=1pt] (${cutLineX.value * scale},${y((layout.value.nodes[0]?.y || 0) - 18)}) -- (${cutLineX.value * scale},${y(axisY.value - 16)});`,
      `\\draw[gray] (${layout.value.plotOriginX * scale},${y(axisY.value)}) -- (${(layout.value.plotOriginX + layout.value.heightScale) * scale},${y(axisY.value)});`,
      `\\node[anchor=north west,text=gray] at (${layout.value.plotOriginX * scale},${y(axisY.value + 16)}) {${escapeLatex(t('CardSorting.similarityMaximum'))}};`,
      `\\node[anchor=north east,text=gray] at (${(layout.value.plotOriginX + layout.value.heightScale) * scale},${y(axisY.value + 16)}) {${escapeLatex(t('CardSorting.similarityMinimum'))}};`,
      `\\node[anchor=north,text=gray] at (${(layout.value.plotOriginX + layout.value.heightScale / 2) * scale},${y(axisY.value + 16)}) {${escapeLatex(t('CardSorting.similarityScale'))}};`,
      '\\end{tikzpicture}',
      '\\end{document}',
    )

    downloadBlob(
      new Blob([lines.join('\n')], { type: 'application/x-tex;charset=utf-8' }),
      'tex',
    )
  } catch {
    showError('CardSorting.exportError')
  }
}
</script>

<style scoped>
.dendrogram-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.dendrogram-scroll {
  position: relative;
  overflow: auto;
  max-width: 100%;
  min-width: 0;
  max-height: min(70vh, 720px);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  padding: 8px;
}

.cut-line-tooltip {
  position: absolute;
  z-index: 1;
  padding: 4px 8px;
  border-radius: 6px;
  background: #263238;
  color: #fff;
  font-size: 0.75rem;
  line-height: 1.25rem;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(10px, 6px);
}

.dendrogram-svg {
  display: block;
  overflow: visible;
}

.dendrogram-link {
  stroke: #fca326;
  stroke-width: 2;
  fill: none;
}

.dendrogram-node {
  fill: #f57c00;
}

.dendrogram-label {
  fill: #374151;
  font-size: 12px;
  font-weight: 500;
}

.dendrogram-axis {
  stroke: #c4c4c4;
  stroke-width: 1;
}

.dendrogram-axis-label {
  fill: #9e9e9e;
  font-size: 10px;
}

.dendrogram-cut-line {
  stroke: #d32f2f;
  stroke-width: 2;
  stroke-dasharray: 6 4;
  pointer-events: none;
}

.dendrogram-cut-line-hit-area {
  stroke: transparent;
  stroke-width: 16;
  cursor: pointer;
  pointer-events: stroke;
  touch-action: none;
}

.dendrogram-groups {
  min-width: 0;
  max-height: min(70vh, 720px);
  overflow: auto;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 6px;
  align-items: start;
}

.group-summary {
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.compact-chip {
  max-width: 100%;
}

@media (max-width: 959px) {
  .dendrogram-results {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
