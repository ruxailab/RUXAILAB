<template>
  <ShowInfo>
    <template #content>
      <div class="test-content pa-6 rounded-xl text-center">
           <p class="text-h5 mt-4 mb-4 text-grey-darken-3" v-html="$t('UserTestView.PreTasksStep.description', { numTasks })"></p>

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
            <div class="d-flex flex-wrap justify-center" style="gap: 12px;">
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
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
const props = defineProps({
    numTasks: Number
});
const emit = defineEmits(['startTasks']);
</script>
