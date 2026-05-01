<template>
  <v-card
    flat
    rounded="xl"
    class="summary-root"
    :class="{ 'summary-root--single': isSingleEvaluator }"
  >
    <v-card-title class="summary-title">
      {{ summaryTitle }}
    </v-card-title>
    <v-divider class="summary-divider" />

    <v-row class="ma-0 pa-4 summary-grid" dense>
      <v-col cols="12" md="12">
        <v-card flat rounded="lg" class="stat-tile stat-tile--hero pa-5 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center ga-3">
              <div class="stat-icon stat-icon--blue">%</div>
              <div>
                <div class="text-subtitle-2 text-medium-emphasis">
                  {{ t('HeuristicsTestAnswer.summary.usabilityAverageTest') }}
                </div>
                <div
                  class="hero-value"
                  :style="metricColor(result.average, 'average')"
                >
                  {{ result.average || '0.00%' }}
                </div>
              </div>
            </div>
            <div class="summary-evaluator-meta">
              <v-chip
                size="small"
                color="#E9EEF5"
                variant="flat"
                class="text-slate-700"
              >
                {{ evaluatorsLabel }}
              </v-chip>
              <div
                v-if="isSingleEvaluator && evaluatorIdentityLabel"
                class="single-evaluator-identity"
                :title="evaluatorIdentityLabel"
              >
                {{ evaluatorIdentityLabel }}
              </div>
            </div>
          </div>

          <v-progress-linear
            class="mt-3"
            rounded
            height="10"
            :color="metricColorValue(result.average, 'average')"
            :model-value="toPercent(result.average)"
          />

          <v-row v-if="!isSingleEvaluator" class="mt-4 metrics-mini" dense>
            <v-col cols="4">
              <div class="mini-label">
                {{ t('HeuristicsTestAnswer.summary.max') }}
              </div>
              <div class="mini-value">{{ result.max || '0.00%' }}</div>
            </v-col>
            <v-col cols="4">
              <div class="mini-label">
                {{ t('HeuristicsTestAnswer.summary.min') }}
              </div>
              <div class="mini-value">{{ result.min || '0.00%' }}</div>
            </v-col>
            <v-col cols="4">
              <div class="mini-label">
                {{ t('HeuristicsTestAnswer.summary.std') }}
              </div>
              <div class="mini-value">{{ result.sd || '0.00%' }}</div>
            </v-col>
          </v-row>

          <div class="single-evaluator-caption warning-summary-inline mt-6">
            <div class="single-evaluator-title">
              {{ t('HeuristicsTestAnswer.summary.warningSummary') }}
            </div>
            <div class="warning-summary-description">
              {{ t('HeuristicsTestAnswer.summary.warningExplanation') }}
            </div>
            <div class="single-evaluator-row mt-2">
              <div class="single-evaluator-item">
                <div class="mini-label">
                  {{ t('HeuristicsTestAnswer.summary.averageMaxWarning') }}
                </div>
                <div
                  class="mini-value warning-summary-value"
                  :style="metricColor(result.avrgmaxWarning, 'average')"
                >
                  {{ result.avrgmaxWarning || '0.00%' }}
                </div>
              </div>
              <div class="single-evaluator-item">
                <div class="mini-label">
                  {{ t('HeuristicsTestAnswer.summary.averageMinWarning') }}
                </div>
                <div
                  class="mini-value warning-summary-value"
                  :style="metricColor(result.avrgminWarning, 'average')"
                >
                  {{ result.avrgminWarning || '0.00%' }}
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card flat rounded="lg" class="summary-panel pa-5 h-100">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ t('HeuristicsTestAnswer.summary.imagesByHeuristic') }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ t('HeuristicsTestAnswer.summary.imagesSubtitle') }}
              </div>
            </div>
            <v-chip
              size="small"
              color="#E9EEF5"
              variant="flat"
              class="text-slate-700"
            >
              {{ imageTotalsByHeuristic.length }}
              {{ t('HeuristicsTestAnswer.titles.heuristics') }}
            </v-chip>
          </div>

          <div v-if="imageTotalsByHeuristic.length" class="images-chart-center">
            <div class="image-stat-grid">
              <div
                v-for="item in imageTotalsByHeuristic"
                :key="item.heuristic"
                class="image-stat-item"
              >
                <div class="image-stat-header">
                  <span class="image-stat-tag">{{ item.heuristic }}</span>
                  <span class="image-stat-count">{{ item.totalImages }}</span>
                </div>
                <div class="image-stat-track">
                  <div
                    class="image-stat-fill"
                    :style="{
                      width: `${toRatio(item.totalImages, maxImagesTotal)}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-body-2 text-medium-emphasis">
            {{ t('HeuristicsTestAnswer.summary.noImageData') }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card flat rounded="lg" class="summary-panel pa-5 h-100">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ t('HeuristicsTestAnswer.summary.responsesByOption') }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ t('HeuristicsTestAnswer.summary.responsesSubtitle') }}
              </div>
            </div>
          </div>

          <SelectionPieChart
            v-if="optionLabels.length"
            question-title=""
            :options="optionLabels"
            :counts="optionCounts"
            canvas-id="summary-options-pie"
            :chart-colors="optionColors"
            :show-percentages="true"
          />

          <div v-else class="text-body-2 text-medium-emphasis">
            {{ t('HeuristicsTestAnswer.summary.noOptionData') }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import SelectionPieChart from '@/shared/components/charts/SelectionPieChart.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  result: {
    type: Object,
    required: true,
    default: () => ({ average: '0%', max: '0%', min: '0%', sd: '0%' }),
  },
  imageTotalsByHeuristic: {
    type: Array,
    default: () => [],
  },
  optionResponseTotals: {
    type: Array,
    default: () => [],
  },
  testTitle: {
    type: String,
    default: '',
  },
  evaluatorIdentity: {
    type: String,
    default: '',
  },
})

const optionColors = [
  '#8EA8C3',
  '#C7AE79',
  '#D8DEE8',
  '#A9C5A9',
  '#B7A7D8',
  '#D8B08B',
]

const toPercent = (value) => {
  const parsed = parseFloat(
    String(value || '0')
      .replace('%', '')
      .replace(',', '.'),
  )
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

const toRatio = (value, total) => {
  const safeValue = Number(value) || 0
  if (!total) return 0
  return (safeValue * 100) / total
}

const evaluatorsCount = computed(() => Number(props.result?.evaluators) || 0)

const isSingleEvaluator = computed(() => evaluatorsCount.value === 1)

const evaluatorsLabel = computed(() => {
  const suffix = evaluatorsCount.value === 1 ? 'Evaluator' : 'Evaluators'
  return `${evaluatorsCount.value} ${suffix}`
})

const evaluatorIdentityLabel = computed(() =>
  String(props.evaluatorIdentity || '').trim(),
)

const metricColor = (value, kind) => {
  const percent = toPercent(value)
  if (kind === 'average') {
    if (percent >= 75) return { color: '#6FAF94' }
    if (percent >= 50) return { color: '#84BDA4' }
    return { color: '#A37153' }
  }

  if (kind === 'warningResolvedTotal') {
    if (percent <= 20) return { color: '#B24C45' }
    if (percent <= 40) return { color: '#C96148' }
    if (percent <= 60) return { color: '#D58A4D' }
    if (percent <= 80) return { color: '#9FB870' }
    return { color: '#6FAF94' }
  }

  return {}
}

const metricColorValue = (value, kind) => metricColor(value, kind).color || ''

const maxImagesTotal = computed(() => {
  if (!props.imageTotalsByHeuristic.length) return 0
  return Math.max(
    ...props.imageTotalsByHeuristic.map(
      (item) => Number(item.totalImages) || 0,
    ),
  )
})

const optionLabels = computed(() =>
  props.optionResponseTotals.map((item) => item.text),
)

const optionCounts = computed(() =>
  props.optionResponseTotals.reduce((accumulator, item) => {
    accumulator[item.text] = Number(item.total) || 0
    return accumulator
  }, {}),
)

const summaryTitle = computed(
  () => `Evaluation Test : ${props.testTitle || '-'}`,
)
</script>

<style scoped>
.summary-root {
  background: #ffffff;
}

.summary-root--single .stat-tile--hero {
  background: linear-gradient(180deg, #fefefe 0%, #f8fbff 100%);
}

.summary-title {
  justify-content: center;
  font-size: 2rem;
  font-weight: 500;
  color: #4b5563;
  padding-top: 1.25rem;
  padding-bottom: 1rem;
}

.summary-divider {
  opacity: 0.4;
}

.summary-grid {
  gap: 18px 0;
}

.summary-panel,
.stat-tile {
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.summary-panel {
  display: flex;
  flex-direction: column;
}

.stat-tile--hero {
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
}

.stat-tile--soft {
  background: linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%);
}

.stat-tile--square {
  min-height: 170px;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}

.stat-icon--blue {
  background: #dbeafe;
  color: #355c89;
}

.stat-icon--slate {
  background: #edf2f7;
  color: #64748b;
}

.hero-value {
  font-size: 3.25rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}

.metrics-mini {
  margin-top: 0.75rem;
}

.mini-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mini-value {
  margin-top: 0.25rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
}

.single-evaluator-caption {
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: 14px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.9);
}

.warning-summary-inline {
  margin-inline: -2px;
  padding: 16px;
}

.single-evaluator-title {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.warning-summary-description {
  margin-top: 6px;
  width: 100%;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
}

.single-evaluator-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.single-evaluator-item {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 14px 16px;
  min-height: 84px;
}

.warning-summary-value {
  font-size: 1.75rem;
  line-height: 1.05;
}

.images-chart-center {
  width: 100%;
  flex: 1;
  margin-top: 12px;
}

.image-stat-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.image-stat-item {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  padding: 10px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.image-stat-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #355c89;
  font-family: 'Courier New', monospace;
}

.image-stat-count {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.image-stat-track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  overflow: hidden;
  flex-grow: 1;
}

.image-stat-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
  background: linear-gradient(90deg, #6d8fb3 0%, #adc4da 100%);
}

.text-slate-700 {
  color: #334155;
}

.summary-evaluator-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  max-width: 48%;
}

.single-evaluator-identity {
  font-size: 0.98rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.2;
  text-align: right;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 960px) {
  .image-stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .image-stat-item {
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .summary-title {
    font-size: 1.5rem;
  }

  .image-stat-grid {
    grid-template-columns: 1fr;
  }

  .single-evaluator-row {
    grid-template-columns: 1fr;
  }

  .warning-summary-value {
    font-size: 1.45rem;
  }

  .summary-evaluator-meta {
    max-width: 52%;
  }

  .single-evaluator-identity {
    font-size: 0.9rem;
  }
}
</style>
