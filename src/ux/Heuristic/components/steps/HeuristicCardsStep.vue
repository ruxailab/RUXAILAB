<template>
  <ShowInfo hide-col class="heuristic-cards-panel">
    <template #content>
      <div class="heuristic-cards-content">
        <div class="heuristic-cards-header">
          <div>
            <p class="text-overline text-primary mb-1">
              {{ $t('HeuristicsTestView.flow.reviewHeuristics') }}
            </p>
            <h1 class="heuristic-cards-title">
              {{ $t('HeuristicsTestView.cards.title') }}
            </h1>
          </div>
          <v-progress-circular
            rotate="-90"
            :model-value="calculatedProgress"
            :size="58"
            :width="5"
            color="primary"
          >
            <span class="text-caption font-weight-bold">
              {{ Math.round(calculatedProgress) }}%
            </span>
          </v-progress-circular>
        </div>

        <p class="heuristic-cards-description">
          {{ $t('HeuristicsTestView.cards.description') }}
        </p>

        <v-row class="heuristic-card-grid">
          <v-col
            v-for="(heuristic, i) in heuristics"
            :key="heuristic.id || i"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card
              class="heuristic-card h-100"
              elevation="0"
              role="button"
              tabindex="0"
              @click="$emit('select-heuristic', i)"
              @keydown.enter="$emit('select-heuristic', i)"
              @keydown.space.prevent="$emit('select-heuristic', i)"
            >
              <div class="heuristic-card-accent" />
              <v-card-title class="heuristic-card-title">
                <div class="heuristic-card-copy">
                  <div class="heuristic-card-kicker">
                    {{
                      $t('HeuristicsTestView.cards.questionsCount', {
                        count: heuristic.questions?.length || 0,
                      })
                    }}
                  </div>
                  <h2 class="text-h6 font-weight-bold text-primary mb-0">
                    {{
                      heuristic.title ||
                      $t('HeuristicsTestView.unknownHeuristic')
                    }}
                  </h2>
                </div>
                <v-progress-circular
                  rotate="-90"
                  :model-value="
                    perHeuristicProgress(
                      currentUserTestAnswer.heuristicQuestions[i],
                    )
                  "
                  :size="52"
                  :width="5"
                  color="primary"
                  class="heuristic-card-progress"
                >
                  <span class="text-caption font-weight-bold">
                    {{
                      Math.round(
                        perHeuristicProgress(
                          currentUserTestAnswer.heuristicQuestions[i],
                        ),
                      )
                    }}%
                  </span>
                </v-progress-circular>
              </v-card-title>

              <v-card-text class="heuristic-card-body">
                <p class="heuristic-card-description">
                  {{ heuristicDescription(heuristic) }}
                </p>
                <div class="heuristic-card-storage">
                  <v-icon size="16">mdi-database-outline</v-icon>
                  <span>
                    {{
                      $t('HeuristicsTestView.cards.storage', {
                        value: heuristicStorage(
                          currentUserTestAnswer.heuristicQuestions[i],
                        ),
                      })
                    }}
                  </span>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  class="heuristic-card-action"
                >
                  {{ $t('HeuristicsTestView.cards.open') }}
                  <v-icon end>mdi-chevron-right</v-icon>
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <div class="d-flex justify-center mt-6">
          <v-btn
            color="primary"
            variant="flat"
            :disabled="calculatedProgress < 100"
            @click="$emit('finish-evaluation')"
          >
            <v-icon start>mdi-send</v-icon>
            {{ $t('HeuristicsTestView.flow.finishEvaluation') }}
          </v-btn>
        </div>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'

defineProps({
  heuristics: { type: Array, required: true },
  currentUserTestAnswer: { type: Object, required: true },
  calculatedProgress: { type: Number, required: true },
  perHeuristicProgress: { type: Function, required: true },
  heuristicDescription: { type: Function, required: true },
  heuristicStorage: { type: Function, required: true },
})

defineEmits(['select-heuristic', 'finish-evaluation'])
</script>

<style scoped>
.heuristic-cards-panel :deep(.dataCard) {
  background: transparent !important;
}

.heuristic-cards-content {
  padding: 1.5rem 0 0;
}

.heuristic-cards-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.heuristic-cards-title {
  color: #00213f;
  font-size: 2.25rem;
  font-weight: 300;
  line-height: 1.15;
  margin: 0;
}

.heuristic-cards-description {
  color: #4d4d4d;
  font-size: 1.05rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  max-width: 780px;
}

.heuristic-card-grid {
  margin-top: 0.25rem;
}

.heuristic-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(0, 33, 63, 0.12);
  border-radius: 12px !important;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), #ffffff),
    radial-gradient(circle at 100% 0%, rgba(0, 33, 63, 0.08), transparent 42%);
  box-shadow: 0 10px 26px rgba(0, 33, 63, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.heuristic-card:hover,
.heuristic-card:focus {
  border-color: rgba(0, 33, 63, 0.28);
  box-shadow: 0 16px 34px rgba(0, 33, 63, 0.14) !important;
  transform: translateY(-3px);
}

.heuristic-card-accent {
  height: 5px;
  background: linear-gradient(90deg, #00213f, #ff4d67);
}

.heuristic-card-title {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
}

.heuristic-card-copy {
  flex: 1 1 auto;
  min-width: 0;
}

.heuristic-card-copy h2 {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.heuristic-card-kicker {
  color: #5f6b7a;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.heuristic-card-progress {
  background: #f4f7fb;
  border-radius: 999px;
  flex: 0 0 auto;
}

.heuristic-card-body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 92px);
  padding: 0 1.25rem 1.25rem !important;
}

.heuristic-card-description {
  color: #4d4d4d;
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.45;
  margin-bottom: 1rem;
}

.heuristic-card-storage {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.35rem;
  margin-bottom: 0.8rem;
  padding: 0.25rem 0.55rem;
  border: 1px solid rgba(0, 33, 63, 0.12);
  border-radius: 4px;
  color: #00213f;
  background: #f4f7fb;
  font-size: 0.8rem;
  font-weight: 700;
}

.heuristic-card-action {
  align-self: flex-start;
  font-weight: 700;
  letter-spacing: 0.08em;
}
</style>
