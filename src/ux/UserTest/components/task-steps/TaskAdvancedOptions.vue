<template>
  <div class="task-advanced-options">
    <div class="step-header mb-6">
      <h3 class="text-h6 font-weight-bold mb-2">Step 3: Advanced Options</h3>
      <p class="text-body-2 text-grey-darken-1 mb-0">
        Enable additional data collection methods to gather deeper insights. All options are optional but can provide valuable behavioral data and user feedback.
      </p>
    </div>

    <div class="options-grid">
      <!-- Eye Tracking -->
      <v-card class="option-card" elevation="0">
        <v-card-text class="d-flex align-center">
          <div class="option-icon mr-4">
            <v-icon 
              :color="localTask.hasEye ? 'primary' : 'grey-lighten-1'"
              size="32"
            >
              mdi-eye-outline
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <div class="flex-grow-1 mr-4">
                <h4 class="text-subtitle-1 font-weight-medium">{{ $t('switches.eyeTracker') }}</h4>
                <p class="text-caption text-grey-darken-1 mt-1">
                  Track where participants look during the task. Provides heatmaps and gaze patterns to understand visual attention and navigation behavior.
                </p>
              </div>
              <div class="switch-container">
                <v-switch
                  v-model="localTask.hasEye"
                  color="primary"
                  hide-details
                  @change="validateStep"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Screen Recording -->
      <v-card class="option-card" elevation="0">
        <v-card-text class="d-flex align-center">
          <div class="option-icon mr-4">
            <v-icon 
              :color="localTask.hasScreenRecord ? 'primary' : 'grey-lighten-1'"
              size="32"
            >
              mdi-monitor-screenshot
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <div class="flex-grow-1 mr-4">
                <h4 class="text-subtitle-1 font-weight-medium">{{ $t('switches.screenRecord') }}</h4>
                <p class="text-caption text-grey-darken-1 mt-1">
                  Record the participant's screen activity. Captures clicks, scrolling, and interactions to analyze user behavior and identify pain points.
                </p>
              </div>
              <div class="switch-container">
                <v-switch
                  v-model="localTask.hasScreenRecord"
                  color="primary"
                  hide-details
                  @change="validateStep"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Camera Recording -->
      <v-card class="option-card" elevation="0">
        <v-card-text class="d-flex align-center">
          <div class="option-icon mr-4">
            <v-icon 
              :color="localTask.hasCamRecord ? 'primary' : 'grey-lighten-1'"
              size="32"
            >
              mdi-video-outline
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <div class="flex-grow-1 mr-4">
                <h4 class="text-subtitle-1 font-weight-medium">{{ $t('switches.camera') }}</h4>
                <p class="text-caption text-grey-darken-1 mt-1">
                  Record participant's facial expressions and reactions. Captures emotions, confusion, and satisfaction to understand user experience beyond interactions.
                </p>
              </div>
              <div class="switch-container">
                <v-switch
                  v-model="localTask.hasCamRecord"
                  color="primary"
                  hide-details
                  @change="validateStep"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Audio Recording -->
      <v-card class="option-card" elevation="0">
        <v-card-text class="d-flex align-center">
          <div class="option-icon mr-4">
            <v-icon 
              :color="localTask.hasAudioRecord ? 'primary' : 'grey-lighten-1'"
              size="32"
            >
              mdi-microphone-outline
            </v-icon>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <div class="flex-grow-1 mr-4">
                <h4 class="text-subtitle-1 font-weight-medium">{{ $t('switches.audioRecord') }}</h4>
                <p class="text-caption text-grey-darken-1 mt-1">
                  Record participant's verbal feedback and comments. Captures think-aloud protocols, frustrations, and insights that reveal thought processes.
                </p>
              </div>
              <div class="switch-container">
                <v-switch
                  v-model="localTask.hasAudioRecord"
                  color="primary"
                  hide-details
                  @change="validateStep"
                />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Privacy Notice -->
    <v-alert
      v-if="hasAnyRecording"
      type="info"
      variant="tonal"
      class="mt-6"
      icon="mdi-shield-account-outline"
    >
      <v-alert-title>Privacy Notice</v-alert-title>
      <div class="text-body-2 mt-2">
        Recording features require explicit consent from participants. Make sure to:
        <ul class="mt-2">
          <li>Clearly inform participants about data collection</li>
          <li>Obtain proper consent before starting the test</li>
          <li>Follow data protection regulations (GDPR, etc.)</li>
          <li>Secure storage and handling of recorded data</li>
        </ul>
      </div>
    </v-alert>

    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'validate']);
const { t } = useI18n();

const localTask = ref({ ...props.modelValue });

const hasAnyRecording = computed(() => {
  return localTask.value.hasEye || 
         localTask.value.hasScreenRecord || 
         localTask.value.hasCamRecord || 
         localTask.value.hasAudioRecord;
});

const enabledFeatures = computed(() => {
  const features = [];
  
  if (localTask.value.hasEye) {
    features.push({ key: 'eye', label: 'Eye Tracking', icon: 'mdi-eye-outline' });
  }
  if (localTask.value.hasScreenRecord) {
    features.push({ key: 'screen', label: 'Screen Recording', icon: 'mdi-monitor-screenshot' });
  }
  if (localTask.value.hasCamRecord) {
    features.push({ key: 'camera', label: 'Camera Recording', icon: 'mdi-video-outline' });
  }
  if (localTask.value.hasAudioRecord) {
    features.push({ key: 'audio', label: 'Audio Recording', icon: 'mdi-microphone-outline' });
  }
  
  return features;
});

const validateStep = () => {
  // Advanced options are always valid (they're optional)
  emit('validate', true);
};

// Watch for local changes and emit
watch(
  localTask,
  (newValue) => {
    emit('update:modelValue', { ...newValue });
    validateStep();
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.task-advanced-options {
  max-width: 100%;
}

.step-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.option-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
  transition: all 0.2s ease;
  background: white;
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.option-icon .v-icon {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
}

.switch-container {
  flex-shrink: 0;
  min-width: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.summary-card {
  background: linear-gradient(135deg, #f0f4ff 0%, #e3f2fd 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .step-header {
    padding: 16px;
  }
  
  .option-icon {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
  }
  
  .option-icon .v-icon {
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    min-height: 24px !important;
    font-size: 24px !important;
  }
}
</style>