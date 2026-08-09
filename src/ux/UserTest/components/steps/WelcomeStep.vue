<template>
  <ShowInfo>
    <template #content>
      <div
        ref="welcomeContent"
        class="test-content pa-6 rounded-xl text-center"
        :class="{ 'welcome-centered': localStep === 0 }"
      >
        <template v-if="localStep === 0">
          <h2 class="split welcome-title text-h4 mb-4 text-primary">
            {{ $t('UserTestView.WelcomeStep.welcome') }}
          </h2>
          <div
            v-if="welcomeMessage"
            class="split welcome-body text-h6 mb-6 text-grey-darken-3"
            v-html="welcomeMessage"
          ></div>
          <p v-else class="split welcome-body text-h6 mb-6 text-grey-darken-3">
            {{ $t('UserTestView.WelcomeStep.description') }}
          </p>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="localStep = 1"
          >
            How does this test work?
          </v-btn>
        </template>

        <template v-else>
          <h2 class="split welcome-title text-h4 mb-4 text-primary">
            {{ $t('UserTestView.WelcomeStep.howItWorks') }}
          </h2>
          <p class="split welcome-body text-h6 mb-4 text-grey-darken-3">
            {{ $t('UserTestView.WelcomeStep.phases') }}
          </p>
          <p class="split welcome-body text-h6 mb-4 text-grey-darken-3">
            {{ $t('UserTestView.WelcomeStep.summary') }}
          </p>
          <v-stepper
            v-if="!smAndDown"
            :model-value="welcomeStepperValue"
            class="bg-white rounded-xl elevation-3 my-6"
            style="overflow-y: visible; max-height: none"
          >
            <v-stepper-header>
              <v-stepper-item
                :value="1"
                :title="$t('UserTestView.WelcomeStep.steps.consent')"
              />
              <v-divider />
              <template v-if="hasPreTest">
                <v-stepper-item
                  :value="2"
                  :title="$t('UserTestView.WelcomeStep.steps.preQuestions')"
                />
                <v-divider />
              </template>
              <v-stepper-item
                v-if="hasEyeTracking"
                :value="hasPreTest ? 3 : 2"
                title="Calibration"
              />
              <v-divider v-if="hasEyeTracking" />
              <v-stepper-item
                :value="
                  hasPreTest ? (hasEyeTracking ? 4 : 3) : hasEyeTracking ? 3 : 2
                "
                :title="$t('UserTestView.WelcomeStep.steps.tasks')"
              />
              <v-divider />
              <template v-if="hasPostTest">
                <v-stepper-item
                  :value="
                    hasPreTest
                      ? hasEyeTracking
                        ? 5
                        : 4
                      : hasEyeTracking
                        ? 4
                        : 3
                  "
                  :title="$t('UserTestView.WelcomeStep.steps.postQuestions')"
                />
                <v-divider />
              </template>
              <v-stepper-item
                :value="
                  hasPostTest
                    ? hasPreTest
                      ? hasEyeTracking
                        ? 6
                        : 5
                      : hasEyeTracking
                        ? 5
                        : 4
                    : hasPreTest
                      ? hasEyeTracking
                        ? 5
                        : 4
                      : hasEyeTracking
                        ? 4
                        : 3
                "
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
          <p class="split welcome-body text-h6 mb-6 text-grey-darken-3">
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
        </template>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { VStepperVertical } from 'vuetify/labs/VStepperVertical'
import { computed, onMounted, onBeforeUnmount, nextTick, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { animateWelcomeText } from '@/shared/utils/animations'

const props = defineProps({
  stepperValue: { type: Number, required: true },
  welcomeMessage: { type: String, default: '' },
  hasEyeTracking: { type: Boolean, default: false },
  hasPreTest: { type: Boolean, default: true },
  hasPostTest: { type: Boolean, default: true },
})
defineEmits(['start'])
const { smAndDown } = useDisplay()
const welcomeContent = ref(null)
const localStep = ref(0)
let cleanupSplitAnimation = () => {}

const welcomeStepperValue = computed(() => Math.max(0, props.stepperValue + 1))

async function runSplitAnimation() {
  if (typeof cleanupSplitAnimation === 'function') {
    cleanupSplitAnimation()
  }

  await nextTick()
  cleanupSplitAnimation = await animateWelcomeText(
    welcomeContent.value?.querySelectorAll('.split'),
    welcomeContent.value,
  )
}

onMounted(async () => {
  await runSplitAnimation()
})

watch(localStep, async () => {
  await runSplitAnimation()
})

onBeforeUnmount(() => {
  if (typeof cleanupSplitAnimation === 'function') {
    cleanupSplitAnimation()
    cleanupSplitAnimation = () => {}
  }
})
</script>

<style scoped>
.split {
  opacity: 0;
  font-weight: 300;
}

.welcome-title {
  font-size: clamp(2rem, 3.1vw, 2.4rem) !important;
  line-height: 1.2;
}

.welcome-body {
  font-size: clamp(1.2rem, 1.65vw, 1.4rem) !important;
  line-height: 1.65;
}

.welcome-centered {
  min-height: 62vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:deep(.line) {
  display: block;
  overflow: hidden;
}

:deep(.line > *),
:deep(.line) {
  will-change: transform, opacity;
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
