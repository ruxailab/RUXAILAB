<template>
  <ShowInfo>
    <template #content>
      <div
        ref="preTasksContent"
        class="test-content pre-tasks-content pa-6 rounded-xl text-center"
        :class="{ 'pre-tasks-content--recording': showRecordingInfo }"
      >
        <template v-if="showIntroScreen && !showRecordingInfo">
          <p class="split welcome-body text-h6 mb-6 text-grey-darken-3">
            {{ $t('UserTestView.PreTasksStep.description') }}
            <strong class="mx-1">{{ numTasks }}</strong>
            {{ $t('UserTestView.PreTasksStep.tasksSuffix') }}
          </p>

          <p class="pre-tasks-instruction mb-6 text-grey-darken-3">
            {{ $t('UserTestView.PreTasksStep.instruction') }}
          </p>

          <div v-if="showMobileTaskInstructions" class="pre-tasks-qr mb-6">
            <MobileTaskCompanionPanel
              :busy="mobileInstructionsBusy"
              :error="mobileInstructionsError"
              :pairing-path="mobileCompanionPairingPath"
              :connected="mobilePhoneConnected"
            />
          </div>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="onContinue"
          >
            {{
              hasRecording
                ? $t('UserTestView.PreTasksStep.nextButton')
                : $t('UserTestView.PreTasksStep.startButton')
            }}
          </v-btn>
        </template>

        <v-expand-transition>
          <div
            v-if="hasRecording && showRecordingInfo"
            class="recording-content"
          >
            <!-- Recording Information Card -->
            <v-card
              variant="outlined"
              class="my-6 mx-auto recording-info-card"
              max-width="760"
            >
              <v-card-text class="pa-5 pa-sm-8">
                <div class="d-flex align-center justify-center mb-3">
                  <h3 class="text-h5 font-weight-bold text-primary">
                    {{ $t('UserTestView.PreTasksStep.recordingTitle') }}
                  </h3>
                </div>
                <p class="mb-3 recording-disclaimer-text">
                  {{ $t('UserTestView.PreTasksStep.recordingDescription') }}
                </p>

                <!-- Recording Types -->
                <div class="d-flex flex-wrap justify-center" style="gap: 12px">
                  <v-chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-monitor-screenshot"
                    class="recording-type-chip"
                  >
                    {{ $t('UserTestView.PreTasksStep.screenRecording') }}
                  </v-chip>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    class="recording-type-chip"
                  >
                    {{ $t('UserTestView.PreTasksStep.webcamRecording') }}
                  </v-chip>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-microphone"
                    class="recording-type-chip"
                  >
                    {{ $t('UserTestView.PreTasksStep.audioRecording') }}
                  </v-chip>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-eye"
                    class="recording-type-chip"
                  >
                    {{ $t('UserTestView.PreTasksStep.eyeTracking') }}
                  </v-chip>
                </div>

                <p class="text-grey-darken-3 mt-3 recording-disclaimer-text">
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
import MobileTaskCompanionPanel from '@/ux/UserTest/components/MobileTaskCompanionPanel.vue'
import { animateWelcomeText } from '@/shared/utils/animations'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  numTasks: Number,
  hasPreTest: {
    type: Boolean,
    default: true,
  },
  hasRecording: {
    type: Boolean,
    default: true,
  },
  showMobileTaskInstructions: {
    type: Boolean,
    default: false,
  },
  mobileInstructionsBusy: {
    type: Boolean,
    default: false,
  },
  mobileInstructionsError: {
    type: Boolean,
    default: false,
  },
  mobileCompanionPairingPath: {
    type: String,
    default: '',
  },
  mobilePhoneConnected: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['startTasks'])

const showIntroScreen = computed(
  () => props.hasPreTest || props.showMobileTaskInstructions,
)

const preTasksContent = ref(null)
const showRecordingInfo = ref(
  props.hasRecording && !props.hasPreTest && !props.showMobileTaskInstructions,
)
let cleanupSplitAnimation = () => {}

function onContinue() {
  if (props.hasRecording) {
    showRecordingInfo.value = true
    return
  }
  emit('startTasks')
}

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
  if (showIntroScreen.value) await runSplitAnimation()
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

.pre-tasks-content--recording {
  min-height: max(32rem, calc(100svh - 12rem));
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
  width: min(100%, 760px);
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}

.recording-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
}

.recording-type-chip :deep(.v-icon) {
  font-size: 24px;
}

.recording-disclaimer-text {
  font-size: 1.4rem;
  line-height: 1.6;
  text-align: center;
}

.pre-tasks-qr {
  width: 100%;
  max-width: 28rem;
}
</style>
