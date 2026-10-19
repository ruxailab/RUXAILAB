<template>
  <ShowInfo>
    <template #content>
      <div
        ref="preTasksContent"
        class="test-content pre-tasks-content pa-6 rounded-xl text-center"
      >
        <template v-if="!showRecordingInfo">
          <p class="split welcome-body text-h6 mb-6 text-grey-darken-3">
            {{ $t('UserTestView.PreTasksStep.description') }}
            <strong class="mx-1">{{ numTasks }}</strong>
            {{ $t('UserTestView.PreTasksStep.tasksSuffix') }}
          </p>

          <p class="pre-tasks-instruction mb-6 text-grey-darken-3">
            {{ $t('UserTestView.PreTasksStep.instruction') }}
          </p>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="showRecordingInfo = true"
          >
            {{ $t('UserTestView.PreTasksStep.nextButton') }}
          </v-btn>
        </template>

        <v-expand-transition>
          <div v-if="showRecordingInfo">
            <!-- Recording Information Card -->
            <v-card
              variant="outlined"
              color="secondary"
              class="my-6 mx-auto recording-info-card"
              max-width="600"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-3">
                  <h3 class="text-h6 font-weight-bold text-secondary">
                    {{ $t('UserTestView.PreTasksStep.recordingTitle') }}
                  </h3>
                </div>
                <p class="text-left mb-3 recording-disclaimer-text">
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

                <p
                  class="text-grey-darken-3 mt-3 text-left recording-disclaimer-text"
                >
                  {{ $t('UserTestView.PreTasksStep.recordingNote') }}
                </p>
              </v-card-text>
            </v-card>

            <p class="pre-tasks-instruction mb-6 text-grey-darken-3">
              {{ $t('UserTestView.PreTasksStep.afterRecordingInstruction') }}
            </p>
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              @click="$emit('startTasks')"
            >
              {{ $t('UserTestView.PreTasksStep.startButton') }}
            </v-btn>
          </div>
        </v-expand-transition>
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { animateWelcomeText } from '@/shared/utils/animations'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  numTasks: Number,
})
const emit = defineEmits(['startTasks'])

const preTasksContent = ref(null)
const showRecordingInfo = ref(false)
let cleanupSplitAnimation = () => {}

async function runSplitAnimation() {
  if (typeof cleanupSplitAnimation === 'function') {
    cleanupSplitAnimation()
  }

  await nextTick()
  cleanupSplitAnimation = await animateWelcomeText(
    preTasksContent.value?.querySelectorAll('.split'),
    preTasksContent.value,
  )
}

onMounted(async () => {
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
.pre-tasks-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: clamp(20rem, 60vh, 40rem);
  margin-inline: auto;
}

.split {
  opacity: 0;
  font-weight: 300;
}

.welcome-body {
  width: 100%;
  max-width: 56rem;
  font-size: 1.75rem !important;
  line-height: 1.5;
}

.pre-tasks-instruction {
  width: 100%;
  max-width: 56rem;
  font-size: 1.25rem;
  line-height: 1.6;
}

.recording-info-card {
  background: #fff !important;
}

.recording-disclaimer-text {
  font-size: 1.4rem;
  line-height: 1.6;
}
</style>
