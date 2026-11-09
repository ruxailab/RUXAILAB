<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <v-card
        ref="fullscreenCard"
        class="pa-4 elevation-4 rounded-xl chart-card"
      >
        <div class="mb-4">
          <div class="d-flex align-center justify-space-between ga-2 mb-1">
            <h3 class="text-h5 font-weight-bold text-on-surface">
              {{ $t('CardSorting.dendrogram') }}
            </h3>
            <div class="d-flex align-center">
              <v-tooltip
                :text="$t('CardSorting.dendrogramInteractionHelp')"
                :attach="isFullscreen ? fullscreenContainer : undefined"
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
              <v-btn
                v-if="hasData"
                :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
                variant="text"
                density="comfortable"
                size="small"
                :aria-label="
                  $t(
                    isFullscreen
                      ? 'CardSorting.exitFullscreen'
                      : 'CardSorting.enterFullscreen',
                  )
                "
                data-test="dendrogram-fullscreen"
                @click="toggleFullscreen"
              />
              <v-menu :attach="isFullscreen ? fullscreenContainer : undefined">
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
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ $t('CardSorting.dendrogramHint') }}
          </p>
        </div>

        <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
          <v-icon size="48" color="grey-lighten-1">
            mdi-file-tree-outline
          </v-icon>
          <div class="text-body-2 mt-2">
            {{ $t('CardSorting.noAnswers') }}
          </div>
        </div>

        <div v-else class="dendrogram-results">
          <div ref="dendrogramChart" class="dendrogram-chart">
            <div v-if="showCutTooltip" class="cut-line-tooltip" role="tooltip">
              {{
                $t('CardSorting.cutSimilarityValue', {
                  value: similarityValue,
                })
              }}
            </div>
            <div class="dendrogram-scroll">
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
                <g v-if="layout.maxHeight > 0" class="dendrogram-grid">
                  <text
                    :x="layout.plotOriginX - 12"
                    :y="gridLabelY"
                    text-anchor="end"
                    class="dendrogram-grid-label"
                  >
                    {{ $t('CardSorting.distanceScale') }}
                  </text>
                  <g v-for="tick in gridTicks" :key="tick">
                    <line
                      :x1="layout.plotOriginX + tick * layout.heightScale"
                      :x2="layout.plotOriginX + tick * layout.heightScale"
                      :y1="gridTopY"
                      :y2="axisY - 16"
                      class="dendrogram-grid-line"
                    />
                    <text
                      :x="layout.plotOriginX + tick * layout.heightScale"
                      :y="gridLabelY"
                      text-anchor="middle"
                      class="dendrogram-grid-tick"
                    >
                      {{ tick }}
                    </text>
                  </g>
                </g>
                <g
                  v-for="(link, index) in coloredLayout.links"
                  :key="`link-${index}`"
                >
                  <line
                    :x1="link.x1"
                    :y1="link.y1"
                    :x2="link.x2"
                    :y2="link.y2"
                    class="dendrogram-link"
                    :style="{ stroke: link.color }"
                  />
                </g>

                <g
                  v-for="(node, index) in coloredLayout.nodes"
                  :key="`node-${index}`"
                >
                  <circle
                    :cx="node.x"
                    :cy="node.y"
                    r="4"
                    class="dendrogram-node"
                    :style="{ fill: node.color }"
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
                  @focus="isCutLineFocused = true"
                  @blur="isCutLineFocused = false"
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
          </div>

          <aside class="dendrogram-groups">
            <section class="dendrogram-tools mb-3">
              <h4 class="text-subtitle-2 font-weight-bold mb-1">
                {{ $t('CardSorting.dendrogramTools') }}
              </h4>
              <p class="text-caption text-medium-emphasis mb-2">
                {{ $t('CardSorting.dendrogramToolsTemporary') }}
              </p>
              <label class="dendrogram-tools__checkbox">
                <input v-model="mergeCategoryCase" type="checkbox" />
                <span>{{ $t('CardSorting.mergeCategoryCase') }}</span>
              </label>
              <label class="dendrogram-tools__threshold">
                <span>{{ $t('CardSorting.minimumCategoryParticipants') }}</span>
                <input
                  :value="minimumCategoryInput"
                  type="number"
                  min="1"
                  step="1"
                  :aria-invalid="!minimumCategoryValid"
                  :aria-describedby="
                    !minimumCategoryValid ? minimumErrorId : undefined
                  "
                  data-test="category-minimum"
                  @input="updateMinimumCategory"
                />
              </label>
              <p class="text-caption text-medium-emphasis mt-1 mb-0">
                {{ $t('CardSorting.groupOrderingHint') }}
              </p>
              <p
                v-if="!minimumCategoryValid"
                :id="minimumErrorId"
                class="dendrogram-tools__error"
                role="alert"
              >
                {{ $t('CardSorting.minimumCategoryError') }}
              </p>
            </section>
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
                v-for="group in displayedGroups"
                :key="group.key"
                class="group-summary"
                :style="{ borderLeftColor: group.color }"
              >
                <div
                  class="d-flex align-center justify-space-between ga-2 mb-1"
                >
                  <input
                    v-if="editingGroupKey === group.key"
                    ref="groupNameInput"
                    v-model="groupNameDraft"
                    class="group-name-input text-body-2"
                    :placeholder="$t('CardSorting.groupNamePlaceholder')"
                    :aria-label="
                      $t('CardSorting.groupNameForNumber', {
                        number: group.number,
                      })
                    "
                    data-test="group-name"
                    type="text"
                    @keydown.enter.prevent="finishGroupName"
                    @keydown.esc.stop.prevent="cancelGroupName"
                    @blur="finishGroupName"
                  />
                  <button
                    v-else
                    type="button"
                    class="group-name-button text-body-2 font-weight-medium"
                    :aria-label="
                      $t('CardSorting.editGroupName', {
                        name:
                          groupNames[group.key] ||
                          $t('CardSorting.groupNumber', {
                            number: group.number,
                          }),
                      })
                    "
                    data-test="edit-group-name"
                    @click="startGroupName(group.key)"
                  >
                    <span>{{
                      groupNames[group.key] ||
                      $t('CardSorting.groupNumber', { number: group.number })
                    }}</span>
                    <v-icon size="16" aria-hidden="true"
                      >mdi-pencil-outline</v-icon
                    >
                  </button>
                  <span class="text-caption text-medium-emphasis">
                    {{
                      $t('CardSorting.cardsInGroup', {
                        count: group.cards.length,
                      })
                    }}
                  </span>
                </div>
                <div
                  class="group-cards-title text-caption text-medium-emphasis mb-1"
                >
                  {{ $t('CardSorting.cardsInSelectedGroup') }}
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
                <v-divider class="my-2" />
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
                <p
                  v-else-if="group.hasCategoryNames"
                  class="text-caption text-medium-emphasis mb-0"
                >
                  {{ $t('CardSorting.noCategoriesAtMinimum') }}
                </p>
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
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useId,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getCardTitles,
  getSubmittedAnswers,
  buildDendrogramTree,
  cutDendrogramTree,
  layoutDendrogram,
  colorDendrogramLayout,
  getDendrogramGroupColor,
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
const gridTicks = [0, 0.25, 0.5, 0.75, 1]
const gridLabelY = 22
const gridTopY = 32

const dendrogramSvg = ref(null)
const dendrogramChart = ref(null)
const fullscreenCard = ref(null)
const fullscreenContainer = computed(() => fullscreenCard.value?.$el)
const isFullscreen = ref(false)
const fullscreenScale = ref(HEIGHT_SCALE)
const cutPosition = ref(0.5)
const isDraggingCutLine = ref(false)
const isCutLineHovered = ref(false)
const isCutLineFocused = ref(false)
const mergeCategoryCase = ref(false)
const minimumCategoryInput = ref('1')
const minimumCategory = ref(1)
const groupNames = ref({})
const editingGroupKey = ref(null)
const groupNameDraft = ref('')
const groupNameInput = ref([])
const minimumErrorId = useId()

const minimumCategoryValid = computed(
  () =>
    /^[1-9]\d*$/.test(minimumCategoryInput.value) &&
    Number.isSafeInteger(Number(minimumCategoryInput.value)),
)

const updateMinimumCategory = (event) => {
  minimumCategoryInput.value = event.target.value
  if (minimumCategoryValid.value) {
    minimumCategory.value = Number(minimumCategoryInput.value)
  }
}

const startGroupName = async (key) => {
  editingGroupKey.value = key
  groupNameDraft.value = groupNames.value[key] || ''
  await nextTick()
  groupNameInput.value[0]?.focus()
}

const finishGroupName = () => {
  if (editingGroupKey.value === null) return
  const name = groupNameDraft.value.trim()
  if (name) groupNames.value[editingGroupKey.value] = name
  else delete groupNames.value[editingGroupKey.value]
  editingGroupKey.value = null
}

const cancelGroupName = () => {
  editingGroupKey.value = null
}

watch(
  () => props.test,
  () => {
    groupNames.value = {}
    editingGroupKey.value = null
    mergeCategoryCase.value = false
    minimumCategoryInput.value = '1'
    minimumCategory.value = 1
  },
)

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
    heightScale: isFullscreen.value ? fullscreenScale.value : HEIGHT_SCALE,
    leafGap: 36,
    paddingTop: 64,
    paddingBottom: 56,
    paddingLeft: 16,
    paddingRight: 40,
    maxDistance: 1,
  }),
)

const updateFullscreenScale = () => {
  if (!isFullscreen.value || !dendrogramChart.value) return
  fullscreenScale.value = Math.max(
    HEIGHT_SCALE,
    dendrogramChart.value.clientWidth - LABEL_WIDTH - 72,
  )
}

const onFullscreenChange = async () => {
  isFullscreen.value = document.fullscreenElement === fullscreenContainer.value
  await nextTick()
  updateFullscreenScale()
}

const toggleFullscreen = async () => {
  try {
    if (isFullscreen.value) {
      await document.exitFullscreen()
    } else {
      await fullscreenContainer.value.requestFullscreen()
    }
  } catch {
    showError('CardSorting.fullscreenError')
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('resize', updateFullscreenScale)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.removeEventListener('resize', updateFullscreenScale)
})

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
  () =>
    isCutLineHovered.value || isDraggingCutLine.value || isCutLineFocused.value,
)

const selectedGroups = computed(() =>
  cutDendrogramTree(tree.value, cutPosition.value * layout.value.maxHeight).map(
    (cards, index) => {
      const cardSet = new Set(cards)
      const categoryCounts = new Map()

      submittedAnswers.value.forEach((answer) => {
        const seen = new Set()
        Object.entries(answer?.sorting || {}).forEach(
          ([category, sortedCards]) => {
            if (category === UNASSIGNED_KEY || !Array.isArray(sortedCards))
              return
            if (!sortedCards.some((card) => cardSet.has(card))) return
            const key = mergeCategoryCase.value
              ? category.toLowerCase()
              : category
            if (seen.has(key)) return
            seen.add(key)
            const entry = categoryCounts.get(key)
            if (entry) entry.count += 1
            else categoryCounts.set(key, { name: category, count: 1 })
          },
        )
      })

      return {
        cards,
        number: index + 1,
        key: JSON.stringify([...cards].sort()),
        color: getDendrogramGroupColor(index),
        hasCategoryNames: categoryCounts.size > 0,
        categoryNames: Array.from(categoryCounts.values())
          .filter((category) => category.count >= minimumCategory.value)
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      }
    },
  ),
)

const displayedGroups = computed(() => {
  const matching = []
  const other = []
  selectedGroups.value.forEach((group) => {
    ;(group.categoryNames.length ? matching : other).push(group)
  })
  return [...matching, ...other]
})

watch(selectedGroups, (groups) => {
  if (
    editingGroupKey.value !== null &&
    !groups.some((group) => group.key === editingGroupKey.value)
  ) {
    finishGroupName()
  }
})

const coloredLayout = computed(() =>
  colorDendrogramLayout(
    layout.value,
    selectedGroups.value.map((group) => group.cards),
    cutLineX.value,
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

const showCutLineTooltip = () => {
  isCutLineHovered.value = true
}

const hideCutLineTooltip = () => {
  isCutLineHovered.value = false
}

const startCutDrag = (event) => {
  isDraggingCutLine.value = true
  dendrogramSvg.value?.setPointerCapture(event.pointerId)
}

const moveCutLine = (event) => {
  if (isDraggingCutLine.value) {
    setCutPositionFromPointer(event)
  }
}

const stopCutDrag = (event) => {
  if (!isDraggingCutLine.value) return
  isDraggingCutLine.value = false
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
    const latexColor = (color) => {
      const channels = color
        .match(/[0-9a-f]{2}/gi)
        .map((value) => parseInt(value, 16))
      return `{rgb,255:red,${channels[0]};green,${channels[1]};blue,${channels[2]}}`
    }
    const lines = [
      '\\documentclass[tikz,border=8pt]{standalone}',
      '\\begin{document}',
      '\\begin{tikzpicture}[x=1pt,y=1pt, every node/.style={font=\\sffamily\\small}]',
      '\\fill[white] (0,0) rectangle (' +
        `${layout.value.width * scale},${-layout.value.height * scale}` +
        ');',
    ]

    if (layout.value.maxHeight > 0) {
      lines.push(
        `\\node[anchor=east,text=gray] at (${(layout.value.plotOriginX - 12) * scale},${y(gridLabelY)}) {${escapeLatex(t('CardSorting.distanceScale'))}};`,
      )
      gridTicks.forEach((tick) => {
        const x =
          (layout.value.plotOriginX + tick * layout.value.heightScale) * scale
        lines.push(
          `\\draw[draw={rgb,255:red,210;green,215;blue,220},line width=0.5pt] (${x},${y(gridTopY)}) -- (${x},${y(axisY.value - 16)});`,
          `\\node[anchor=base,text=gray] at (${x},${y(gridLabelY)}) {${tick}};`,
        )
      })
    }

    coloredLayout.value.links.forEach((link) => {
      lines.push(
        `\\draw[draw=${latexColor(link.color)},line width=1.5pt] (${link.x1 * scale},${y(link.y1)}) -- (${link.x2 * scale},${y(link.y2)});`,
      )
    })

    coloredLayout.value.nodes.forEach((node) => {
      lines.push(
        `\\fill[fill=${latexColor(node.color)}] (${node.x * scale},${y(node.y)}) circle[radius=2pt];`,
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
.chart-card:fullscreen {
  overflow: auto;
  background: #fff;
  min-height: 100%;
}

.chart-card:fullscreen .dendrogram-results {
  grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
}

.chart-card:fullscreen .dendrogram-scroll,
.chart-card:fullscreen .dendrogram-groups {
  max-height: max(160px, calc(100vh - 180px));
}

.dendrogram-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.dendrogram-chart {
  position: relative;
  min-width: 0;
}

.dendrogram-scroll {
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
  top: 12px;
  right: 12px;
  max-width: calc(100% - 24px);
  padding: 4px 8px;
  border-radius: 6px;
  background: #263238;
  color: #fff;
  font-size: 0.75rem;
  line-height: 1.25rem;
  overflow-wrap: anywhere;
  pointer-events: none;
}

.dendrogram-svg {
  display: block;
  overflow: visible;
}

.dendrogram-link {
  stroke-width: 2;
  fill: none;
}

.dendrogram-grid-line {
  stroke: #d2d7dc;
  stroke-width: 1;
  pointer-events: none;
}

.dendrogram-grid-label,
.dendrogram-grid-tick {
  fill: #59636e;
  font-size: 11px;
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

.dendrogram-tools {
  padding: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.dendrogram-tools__checkbox,
.dendrogram-tools__threshold {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.dendrogram-tools__threshold {
  margin-top: 8px;
  justify-content: space-between;
}

.dendrogram-tools__threshold input,
.group-name-input {
  min-width: 0;
  padding: 4px 6px;
  border: 1px solid #9ca3af;
  border-radius: 4px;
  background: #fff;
}

.dendrogram-tools__threshold input {
  width: 65px;
}

.dendrogram-tools__error {
  margin: 4px 0 0;
  color: #b3261e;
  font-size: 0.75rem;
}

.group-name-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  text-align: left;
  overflow-wrap: anywhere;
  color: #00213f;
  cursor: pointer;
}

.group-name-button:focus-visible {
  outline: 2px solid #075985;
  outline-offset: 2px;
}

.group-name-input {
  width: 100%;
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
  border-left: 4px solid;
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

  .chart-card:fullscreen .dendrogram-results {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
