<template>
  <ShowInfo>
    <template #content>
      <div class="test-content pa-6 rounded-xl text-center fade-in">
        <h2 class="text-h5 font-weight-bold mb-4 text-primary">
          {{ $t('UserTestView.WelcomeStep.welcome') }}
        </h2>
        <div
          v-if="welcomeMessage"
          class="text-body-1 mb-4 text-grey-darken-3"
          v-html="welcomeMessage"
        ></div>
        <p v-else class="text-body-1 mb-4 text-grey-darken-3">
          {{ $t('UserTestView.WelcomeStep.description') }}
        </p>
        <h2 class="text-h5 font-weight-bold mb-4 text-primary">
          {{ $t('UserTestView.WelcomeStep.howItWorks') }}
        </h2>
        <p class="text-body-1 mb-4 text-grey-darken-3">
          {{ $t('UserTestView.WelcomeStep.phases') }}
        </p>
        <p class="text-body-1 mb-4 text-grey-darken-3">
          {{ $t('UserTestView.WelcomeStep.summary') }}
        </p>
        <v-stepper
          v-if="!smAndDown"
          :model-value="stepperValue"
          class="bg-white rounded-xl elevation-3 my-6"
          style="overflow-y: visible; max-height: none"
        >
          <v-stepper-header>
            <v-stepper-item
              value="1"
              :title="$t('UserTestView.WelcomeStep.steps.consent')"
            />
            <v-divider />

            <v-stepper-item
              value="2"
              :title="$t('UserTestView.WelcomeStep.steps.preQuestions')"
            />
            <v-divider />
            <v-stepper-item
              v-if="hasEyeTracking"
              value="3"
              title="Calibration"
            />
            <v-divider v-if="hasEyeTracking" />
            <v-stepper-item
              :value="hasEyeTracking ? '4' : '3'"
              :title="$t('UserTestView.WelcomeStep.steps.tasks')"
            />
            <v-divider />
            <v-stepper-item
              :value="hasEyeTracking ? '5' : '4'"
              :title="$t('UserTestView.WelcomeStep.steps.postQuestions')"
            />
            <v-divider />
            <v-stepper-item
              :value="hasEyeTracking ? '6' : '5'"
              :title="$t('UserTestView.WelcomeStep.steps.submission')"
            />
          </v-stepper-header>
        </v-stepper>
        <v-stepper-vertical
          v-else
          :items="[
            $t('UserTestView.WelcomeStep.steps.consent'),
            ...(hasEyeTracking ? ['Calibration'] : []),
            $t('UserTestView.WelcomeStep.steps.preQuestions'),
            $t('UserTestView.WelcomeStep.steps.tasks'),
            $t('UserTestView.WelcomeStep.steps.postQuestions'),
            $t('UserTestView.WelcomeStep.steps.submission'),
          ]"
          hide-actions
          class="my-6"
        />
        <p class="text-body-1 mb-6 text-grey-darken-3">
          {{ $t('UserTestView.WelcomeStep.ready') }}
        </p>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          @click="$emit('start')"
        >
          {{ $t('UserTestView.WelcomeStep.startTest') }}
        </v-btn>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { VStepperVertical } from 'vuetify/labs/VStepperVertical'
import { useDisplay } from 'vuetify'
const props = defineProps({
  stepperValue: { type: Number, required: true },
  welcomeMessage: { type: String, default: '' },
  hasEyeTracking: { type: Boolean, default: false },
})
const emit = defineEmits(['start'])
const { smAndDown } = useDisplay()
</script>

<style scoped>
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

:deep(.v-stepper-vertical-item__avatar.v-avatar) {
  background: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

:deep(.v-stepper-vertical-item__avatar.v-avatar.v-avatar--density-default) {
  background: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

:deep(.v-stepper-item__avatar.v-avatar) {
  background: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

:deep(.v-stepper-item__title) {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
}

:deep(.v-stepper-item) {
  opacity: 1;
}
</style>
