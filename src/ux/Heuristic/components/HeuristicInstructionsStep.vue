<template>
  <ShowInfo hide-col>
    <template #content>
      <div
        class="heuristic-instructions-page test-content pa-6 rounded-xl text-center fade-in"
      >
        <div class="heuristic-instructions-content">
          <h1 class="text-h5 font-weight-bold mb-4 text-primary">
            {{ $t('HeuristicsTestView.InstructionsStep.welcomeTitle') }}
          </h1>

          <div v-if="sections.length" class="custom-instructions">
            <section
              v-for="(section, index) in sections"
              :key="section.id || index"
              class="custom-instruction-section"
            >
              <h2
                v-if="section.title"
                class="text-h5 font-weight-bold mb-4 text-primary"
              >
                {{ section.title }}
              </h2>
              <div
                class="text-body-1 mb-4 text-grey-darken-3 ql-content"
                v-html="section.content"
              />
            </section>
          </div>

          <p v-else class="text-body-1 mb-4 text-grey-darken-3">
            {{ $t('HeuristicsTestView.InstructionsStep.defaultDescription') }}
          </p>

          <h2 class="text-h5 font-weight-bold mb-4 text-primary">
            {{ $t('HeuristicsTestView.InstructionsStep.howItWorks') }}
          </h2>

          <p class="text-body-1 mb-4 text-grey-darken-3">
            {{ $t('HeuristicsTestView.InstructionsStep.phases') }}
          </p>

          <p class="text-body-1 mb-4 text-grey-darken-3">
            {{ $t('HeuristicsTestView.InstructionsStep.summary') }}
          </p>

          <v-stepper
            v-if="!smAndDown"
            :model-value="1"
            class="bg-white rounded-xl elevation-3 my-6"
            style="overflow-y: visible; max-height: none"
          >
            <v-stepper-header>
              <v-stepper-item
                value="1"
                :title="
                  $t('HeuristicsTestView.InstructionsStep.steps.instructions')
                "
              />
              <v-divider />
              <v-stepper-item
                value="2"
                :title="
                  $t('HeuristicsTestView.InstructionsStep.steps.evaluation')
                "
              />
              <v-divider />
              <v-stepper-item
                value="3"
                :title="
                  $t('HeuristicsTestView.InstructionsStep.steps.submission')
                "
              />
            </v-stepper-header>
          </v-stepper>

          <v-stepper-vertical
            v-else
            :items="[
              $t('HeuristicsTestView.InstructionsStep.steps.instructions'),
              $t('HeuristicsTestView.InstructionsStep.steps.evaluation'),
              $t('HeuristicsTestView.InstructionsStep.steps.submission'),
            ]"
            hide-actions
            class="my-6"
          />

          <p class="text-body-1 mb-6 text-grey-darken-3">
            {{ $t('HeuristicsTestView.InstructionsStep.ready') }}
          </p>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            :disabled="disabled"
            @click="$emit('start')"
          >
            {{ $t('HeuristicsTestView.InstructionsStep.startButton') }}
          </v-btn>
        </div>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { VStepperVertical } from 'vuetify/labs/VStepperVertical'
import ShowInfo from '@/shared/components/ShowInfo.vue'

defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['start'])

const { smAndDown } = useDisplay()
</script>

<style scoped>
:deep(.dataCard) {
  background: transparent !important;
}

.fade-in {
  animation: fadeIn 2s ease-in-out;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.heuristic-instructions-page {
  width: 100%;
  background: #fff;
}

.heuristic-instructions-content {
  width: 100%;
  text-align: center;
}

.custom-instruction-section + .custom-instruction-section {
  margin-top: 16px;
}

:deep(.v-stepper-vertical-item__avatar.v-avatar),
:deep(.v-stepper-vertical-item__avatar.v-avatar.v-avatar--density-default),
:deep(.v-stepper-item__avatar.v-avatar) {
  background: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

:deep(.v-stepper-item) {
  opacity: 1;
}

:deep(.v-stepper-item__title) {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
}
</style>
