<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <v-card class="pa-4 elevation-4 rounded-xl chart-card">
        <div
          class="d-flex flex-wrap justify-space-between align-center mb-4 ga-2"
        >
          <div>
            <h3 class="text-h5 font-weight-bold text-on-surface mb-1">
              {{ $t('CardSorting.similarityMatrix') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ $t('CardSorting.similarityMatrixHint') }}
            </p>
          </div>
          <div class="d-flex align-center ga-1">
            <v-btn-toggle
              v-model="displayMode"
              mandatory
              density="compact"
              color="primary"
              variant="outlined"
              divided
            >
              <v-btn value="absolute" size="small">
                {{ $t('CardSorting.absoluteValues') }}
              </v-btn>
              <v-btn value="percentage" size="small">
                {{ $t('CardSorting.percentageValues') }}
              </v-btn>
            </v-btn-toggle>
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon="mdi-dots-vertical"
                  variant="text"
                  density="comfortable"
                  size="small"
                  :disabled="!hasData"
                  :aria-label="$t('CardSorting.exportSimilarityMatrix')"
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

        <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
          <v-icon size="48" color="grey-lighten-1">mdi-grid-off</v-icon>
          <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
        </div>

        <div v-else class="matrix-scroll">
          <v-table density="compact" class="matrix-table">
            <thead>
              <tr>
                <th class="text-left sticky-corner">
                  {{ $t('CardSorting.card') }}
                </th>
                <th
                  v-for="card in cardTitles"
                  :key="`h-${card}`"
                  class="text-center header-cell"
                >
                  <v-tooltip :text="card" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="header-text">
                        {{ card }}
                      </span>
                    </template>
                  </v-tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rowCard, i) in cardTitles" :key="`r-${rowCard}`">
                <td class="font-weight-medium sticky-label">
                  <v-tooltip :text="rowCard" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="row-label-text">
                        {{ rowCard }}
                      </span>
                    </template>
                  </v-tooltip>
                </td>
                <td
                  v-for="(colCard, j) in cardTitles"
                  :key="`c-${rowCard}-${colCard}`"
                  class="text-center"
                >
                  <div
                    class="matrix-cell"
                    :class="{ 'matrix-cell--diagonal': i === j }"
                    :style="
                      cellStyle(absolute[i][j], percentage[i][j], i === j)
                    "
                  >
                    {{ formatCell(absolute[i][j], percentage[i][j], i === j) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <p v-if="hasData" class="text-caption text-medium-emphasis mt-3 mb-0">
          {{
            $t('CardSorting.similarityMatrixFooter', {
              total: totalParticipants,
            })
          }}
        </p>
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
  buildSimilarityMatrix,
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
const displayMode = ref('percentage')

const cardTitles = computed(() => getCardTitles(props.test))
const submittedAnswers = computed(() => getSubmittedAnswers(props.answers))

const similarity = computed(() =>
  buildSimilarityMatrix(cardTitles.value, submittedAnswers.value),
)

const absolute = computed(() => similarity.value.absolute)
const percentage = computed(() => similarity.value.percentage)
const totalParticipants = computed(() => similarity.value.totalParticipants)

const hasData = computed(
  () => cardTitles.value.length > 0 && totalParticipants.value > 0,
)

const formatCell = (abs, pct, isDiagonal) => {
  if (isDiagonal) return '—'
  if (displayMode.value === 'percentage') return `${pct}%`
  return abs || ''
}

const cellStyle = (abs, pct, isDiagonal) => {
  if (isDiagonal) {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      color: '#9e9e9e',
    }
  }
  if (!abs || !totalParticipants.value) return {}
  const intensity = abs / totalParticipants.value
  return {
    backgroundColor: `rgba(252, 163, 38, ${0.12 + intensity * 0.7})`,
    color: intensity > 0.55 ? '#3e2723' : 'inherit',
  }
}

const downloadBlob = (blob, extension) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `card-sorting-similarity-matrix-${Date.now()}.${extension}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const escapeXml = (text) =>
  String(text).replace(/[&<>"']/g, (character) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    }
    return replacements[character]
  })

const exportAsPng = async () => {
  try {
    const labelWidth = 180
    const cellWidth = 100
    const headerHeight = 56
    const rowHeight = 36
    const width = labelWidth + cardTitles.value.length * cellWidth
    const height = headerHeight + cardTitles.value.length * rowHeight
    const measureContext = document.createElement('canvas').getContext('2d')
    if (!measureContext) throw new Error('Canvas context unavailable')

    const ellipsize = (text, maxWidth, font) => {
      measureContext.font = font
      if (measureContext.measureText(text).width <= maxWidth) return text

      const characters = Array.from(text)
      while (
        characters.length &&
        measureContext.measureText(`${characters.join('')}…`).width > maxWidth
      ) {
        characters.pop()
      }
      return `${characters.join('')}…`
    }

    const parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      '<rect width="100%" height="100%" fill="#ffffff"/>',
      '<defs>',
      ...cardTitles.value.map(
        (_, column) =>
          `<clipPath id="header-clip-${column}"><rect x="${labelWidth + column * cellWidth + 8}" y="0" width="${cellWidth - 16}" height="${headerHeight}"/></clipPath>`,
      ),
      ...cardTitles.value.map(
        (_, row) =>
          `<clipPath id="row-clip-${row}"><rect x="12" y="${headerHeight + row * rowHeight}" width="${labelWidth - 24}" height="${rowHeight}"/></clipPath>`,
      ),
      '</defs>',
      '<g font-family="Arial, sans-serif" font-size="12" fill="#222222">',
      `<rect x="0" y="0" width="${labelWidth}" height="${headerHeight}" fill="#f5f5f5" stroke="#e5e7eb"/>`,
      `<text x="12" y="34" font-weight="600">${escapeXml(t('CardSorting.card'))}</text>`,
    ]

    cardTitles.value.forEach((card, column) => {
      const x = labelWidth + column * cellWidth
      const label = ellipsize(card, cellWidth - 16, '11px Arial')
      parts.push(
        `<rect x="${x}" y="0" width="${cellWidth}" height="${headerHeight}" fill="#f5f5f5" stroke="#e5e7eb"/>`,
        `<text x="${x + 8}" y="32" font-size="11" clip-path="url(#header-clip-${column})"><title>${escapeXml(card)}</title>${escapeXml(label)}</text>`,
      )
    })

    cardTitles.value.forEach((rowCard, row) => {
      const y = headerHeight + row * rowHeight
      const label = ellipsize(rowCard, labelWidth - 24, '600 12px Arial')
      parts.push(
        `<rect x="0" y="${y}" width="${labelWidth}" height="${rowHeight}" fill="#ffffff" stroke="#e5e7eb"/>`,
        `<text x="12" y="${y + 23}" font-weight="600" clip-path="url(#row-clip-${row})"><title>${escapeXml(rowCard)}</title>${escapeXml(label)}</text>`,
      )

      cardTitles.value.forEach((_, column) => {
        const x = labelWidth + column * cellWidth
        const isDiagonal = row === column
        const abs = absolute.value[row][column]
        const pct = percentage.value[row][column]
        const style = cellStyle(abs, pct, isDiagonal)
        const fill = style.backgroundColor || '#ffffff'
        const textColor = style.color || '#222222'
        const text = formatCell(abs, pct, isDiagonal)
        parts.push(
          `<rect x="${x}" y="${y}" width="${cellWidth}" height="${rowHeight}" fill="${fill}" stroke="#e5e7eb"/>`,
          `<text x="${x + cellWidth / 2}" y="${y + 23}" text-anchor="middle" fill="${textColor}" font-weight="600">${escapeXml(text)}</text>`,
        )
      })
    })
    parts.push('</g></svg>')

    const svgBlob = new Blob([parts.join('')], {
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
      canvas.width = width * scale
      canvas.height = height * scale
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
    showError('CardSorting.similarityMatrixExportError')
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
    const columnSpec = `l|${'r'.repeat(cardTitles.value.length)}`
    const lines = [
      '\\documentclass{article}',
      '\\usepackage[margin=1in]{geometry}',
      '\\usepackage{graphicx}',
      '\\begin{document}',
      '\\begin{center}',
      '\\resizebox{\\textwidth}{!}{%',
      `\\begin{tabular}{${columnSpec}}`,
      '\\hline',
      `${escapeLatex(t('CardSorting.card'))} & ${cardTitles.value.map(escapeLatex).join(' & ')} \\\\`,
      '\\hline',
    ]

    cardTitles.value.forEach((rowCard, row) => {
      const values = cardTitles.value.map((_, column) => {
        const value = formatCell(
          absolute.value[row][column],
          percentage.value[row][column],
          row === column,
        )
        return value === '—' ? '\\textemdash{}' : escapeLatex(value)
      })
      lines.push(`${escapeLatex(rowCard)} & ${values.join(' & ')} \\\\`)
      lines.push('\\hline')
    })

    lines.push('\\end{tabular}%', '}', '\\end{center}', '\\end{document}')
    downloadBlob(
      new Blob([lines.join('\n')], { type: 'application/x-tex;charset=utf-8' }),
      'tex',
    )
  } catch {
    showError('CardSorting.similarityMatrixExportError')
  }
}
</script>

<style scoped>
.matrix-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.matrix-table {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-width: max-content;
}

.header-cell {
  writing-mode: horizontal-tb;
  max-width: 64px;
  font-size: 0.6875rem;
  white-space: nowrap;
}

.header-text {
  display: block;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-label,
.sticky-corner {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
  min-width: 96px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-label-text {
  display: block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-corner {
  z-index: 2;
}

.matrix-cell {
  min-width: 36px;
  padding: 3px 5px;
  border-radius: 6px;
  font-weight: 600;
  display: inline-block;
  font-size: 0.75rem;
}

.matrix-cell--diagonal {
  font-weight: 500;
}
</style>
