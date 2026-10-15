<template>
  <ShowInfo hide-col>
    <template #content>
      <div class="study-welcome test-content pa-6 rounded-xl text-center fade-in">
        <div class="study-welcome__content">
          <h1 class="text-h5 font-weight-bold mb-4 text-primary">
            {{ welcomeTitle }}
          </h1>

          <div v-if="sections.length" class="study-welcome__sections">
            <section
              v-for="(section, index) in sections"
              :key="section.id || index"
              class="study-welcome__section"
            >
              <h2
                v-if="section.title"
                class="text-h5 font-weight-bold mb-4 text-primary"
              >
                {{ section.title }}
              </h2>
              <div
                v-safe-html="section.content"
                class="text-body-1 mb-4 text-grey-darken-3 ql-content"
              />
            </section>
          </div>

          <p v-else class="text-body-1 mb-4 text-grey-darken-3">
            {{ description }}
          </p>

          <h2 class="text-h5 font-weight-bold mb-4 text-primary">
            {{ howItWorks }}
          </h2>

          <p class="text-body-1 mb-4 text-grey-darken-3">
            {{ phases }}
          </p>

          <p class="text-body-1 mb-4 text-grey-darken-3">
            {{ summary }}
          </p>

          <v-stepper
            v-if="!smAndDown"
            :model-value="1"
            class="bg-white rounded-xl elevation-3 my-6"
            style="overflow-y: visible; max-height: none"
          >
            <v-stepper-header>
              <template v-for="(step, index) in steps" :key="`${step}-${index}`">
                <v-divider v-if="index > 0" />
                <v-stepper-item :value="index + 1" :title="step" />
              </template>
            </v-stepper-header>
          </v-stepper>

          <v-stepper-vertical
            v-else
            :items="steps"
            hide-actions
            class="my-6"
          />

          <p class="text-body-1 mb-6 text-grey-darken-3">
            {{ ready }}
          </p>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            :disabled="disabled"
            @click="$emit('start')"
          >
            {{ startLabel }}
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
  welcomeTitle: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  howItWorks: {
    type: String,
    default: '',
  },
  phases: {
    type: String,
    default: '',
  },
  summary: {
    type: String,
    default: '',
  },
  ready: {
    type: String,
    default: '',
  },
  startLabel: {
    type: String,
    default: '',
  },
  steps: {
    type: Array,
    default: () => [],
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

.study-welcome {
  width: 100%;
  background: transparent;
}

.study-welcome__content {
  width: 100%;
  text-align: center;
}

.study-welcome__section + .study-welcome__section {
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
