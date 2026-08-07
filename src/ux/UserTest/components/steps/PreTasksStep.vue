<template>
  <ShowInfo>
    <template #content>
      <div class="test-content pa-6 rounded-xl text-center">
        <template v-if="step === 0">
          <div
            ref="splitContainer"
            class="split-title mt-4 mb-6 text-grey-darken-3"
          >
            <div class="split-line-wrap">
              <p ref="introLine1" class="split-line text-h4 mb-1">
                You are going to complete <strong>{{ numTasks }}</strong> tasks
                related to using the tool.
              </p>
            </div>
            <div class="split-line-wrap">
              <p ref="introLine2" class="split-line text-h4 mb-0">
                There are no correct or incorrect answers: what matters is how
                you interact.
              </p>
            </div>
          </div>

          <v-btn color="primary" variant="flat" size="large" @click="step = 1">
            {{ $t('buttons.next') }}
          </v-btn>
        </template>

        <template v-else>
          <!-- Recording Information Card -->
          <v-card
            variant="outlined"
            color="secondary"
            class="my-6 mx-auto"
            max-width="600"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-h6 font-weight-bold text-secondary">
                  {{ $t('UserTestView.PreTasksStep.recordingTitle') }}
                </h3>
              </div>
              <p class="text-body-1 text-left mb-3">
                {{ $t('UserTestView.PreTasksStep.recordingDescription') }}
              </p>

              <!-- Recording Types -->
              <div class="d-flex flex-wrap justify-center" style="gap: 12px">
                <v-chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-monitor-screenshot"
                >
                  {{ $t('UserTestView.PreTasksStep.screenRecording') }}
                </v-chip>
                <v-chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                >
                  {{ $t('UserTestView.PreTasksStep.webcamRecording') }}
                </v-chip>
                <v-chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-microphone"
                >
                  {{ $t('UserTestView.PreTasksStep.audioRecording') }}
                </v-chip>
                <v-chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-eye"
                >
                  {{ $t('UserTestView.PreTasksStep.eyeTracking') }}
                </v-chip>
              </div>

              <p class="text-body text-grey-darken-3 mt-3 text-left">
                {{ $t('UserTestView.PreTasksStep.recordingNote') }}
              </p>
            </v-card-text>
          </v-card>

          <p class="text-body-1 mb-6 text-grey-darken-3">
            {{ $t('UserTestView.PreTasksStep.instruction') }}
          </p>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="$emit('startTasks')"
          >
            {{ $t('UserTestView.PreTasksStep.startButton') }}
          </v-btn>
        </template>
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { gsap } from 'gsap'
import { ref, nextTick, onMounted, watch } from 'vue'

const { numTasks } = defineProps({
  numTasks: Number,
})
defineEmits(['startTasks'])

const step = ref(0)
const splitContainer = ref(null)
const introLine1 = ref(null)
const introLine2 = ref(null)

function animateIntroText() {
  const lines = [introLine1.value, introLine2.value].filter(Boolean)
  if (!lines.length) return

  gsap.killTweensOf(lines)
  if (splitContainer.value) {
    gsap.set(splitContainer.value, { autoAlpha: 1 })
  }

  gsap.fromTo(
    lines,
    { yPercent: 110, autoAlpha: 0 },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.65,
      ease: 'expo.out',
      stagger: 0.1,
      clearProps: 'transform,opacity,visibility',
    },
  )
}

onMounted(async () => {
  await nextTick()
  animateIntroText()
})

watch(step, async (val) => {
  if (val === 0) {
    await nextTick()
    animateIntroText()
  }
})
</script>

<style scoped>
.split-title {
  opacity: 0;
}

.split-line-wrap {
  overflow: hidden;
}

.split-line {
  line-height: 1.2;
}
</style>
