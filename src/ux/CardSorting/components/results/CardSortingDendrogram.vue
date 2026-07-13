<template>
  <v-card flat rounded="xl" class="pa-4">
    <div class="mb-3">
      <h3 class="text-h6 mb-1">{{ $t('CardSorting.dendrogram') }}</h3>
      <p class="text-caption text-medium-emphasis mb-0">
        {{ $t('CardSorting.dendrogramHint') }}
      </p>
    </div>

    <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
      <v-icon size="48" color="grey-lighten-1">mdi-file-tree-outline</v-icon>
      <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
    </div>

    <div v-else class="dendrogram-scroll">
      <svg
        :viewBox="`0 0 ${layout.width} ${layout.height}`"
        :width="layout.width"
        :height="layout.height"
        class="dendrogram-svg"
        role="img"
        :aria-label="$t('CardSorting.dendrogram')"
        preserveAspectRatio="xMinYMin meet"
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
          <circle :cx="node.x" :cy="node.y" r="4" class="dendrogram-node" />
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
          <text x="0" y="16" class="dendrogram-axis-label">100%</text>
          <text
            :x="layout.heightScale"
            y="16"
            text-anchor="end"
            class="dendrogram-axis-label"
          >
            0%
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
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import {
  getCardTitles,
  getSubmittedAnswers,
  buildDendrogramTree,
  layoutDendrogram,
} from '../../utils/cardSortingAnalytics'

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

const LABEL_WIDTH = 180
const HEIGHT_SCALE = 360
const MAX_LABEL_CHARS = 22

const cardTitles = computed(() => getCardTitles(props.test))
const submittedAnswers = computed(() => getSubmittedAnswers(props.answers))

const hasData = computed(
  () => cardTitles.value.length > 1 && submittedAnswers.value.length > 0,
)

const layout = computed(() => {
  if (!hasData.value) {
    return {
      nodes: [],
      links: [],
      width: 0,
      height: 0,
      maxHeight: 0,
      plotOriginX: 0,
      heightScale: 0,
    }
  }

  const tree = buildDendrogramTree(cardTitles.value, submittedAnswers.value)
  return layoutDendrogram(tree, {
    labelWidth: LABEL_WIDTH,
    heightScale: HEIGHT_SCALE,
    leafGap: 36,
    paddingTop: 20,
    paddingBottom: 56,
    paddingLeft: 16,
    paddingRight: 40,
  })
})

const axisY = computed(() => {
  if (!layout.value.nodes.length) return 0
  const lastY = Math.max(...layout.value.nodes.map((n) => n.y))
  return lastY + 28
})

const truncateLabel = (text) => {
  if (!text) return ''
  return text.length > MAX_LABEL_CHARS
    ? `${text.slice(0, MAX_LABEL_CHARS - 1)}…`
    : text
}
</script>

<style scoped>
.dendrogram-scroll {
  overflow: auto;
  max-width: 100%;
  max-height: min(70vh, 720px);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  padding: 8px;
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
</style>
