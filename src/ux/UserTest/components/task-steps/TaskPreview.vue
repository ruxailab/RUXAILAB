<template>
  <div class="task-preview">
    <!-- Task Summary Card -->
    <v-card
      class="task-summary-card mb-6"
      elevation="2"
    >
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="mr-2">
          mdi-clipboard-check-outline
        </v-icon>
        Task Summary
      </v-card-title>
      
      <v-card-text class="pa-6">
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <div class="task-details">
              <h4 class="text-h6 font-weight-bold mb-3">
                {{ (task && task.taskName) || 'Untitled Task' }}
              </h4>
              
              <div class="task-description mb-4">
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Description:
                </div>
                <div 
                  class="description-content"
                  v-html="(task && task.taskDescription) || 'No description provided'"
                />
              </div>

              <div
                v-if="task && task.taskTip"
                class="task-tip mb-4"
              >
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Participant Tip:
                </div>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  icon="mdi-lightbulb-outline"
                >
                  {{ task.taskTip }}
                </v-alert>
              </div>

              <div
                v-if="task && task.taskLink"
                class="task-link mb-4"
              >
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Task URL:
                </div>
                <v-chip
                  :href="task.taskLink"
                  target="_blank"
                  prepend-icon="mdi-open-in-new"
                  color="primary"
                  variant="outlined"
                  class="text-decoration-none"
                >
                  {{ task.taskLink }}
                </v-chip>
              </div>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <div class="task-config">
              <!-- Answer Type -->
              <div class="config-section mb-4">
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Answer Type:
                </div>
                <v-chip
                  :prepend-icon="getAnswerTypeIcon(task && task.taskType)"
                  :color="isSystemChoice(task && task.taskType) ? 'secondary' : 'grey-lighten-1'"
                  variant="tonal"
                >
                  {{ getAnswerTypeLabel(task && task.taskType) }}
                </v-chip>
              </div>

              <!-- Recording Features -->
              <div
                v-if="recordingFeatures.length > 0"
                class="config-section mb-4"
              >
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Recording Features:
                </div>
                <div class="feature-chips">
                  <v-chip
                    v-for="feature in recordingFeatures"
                    :key="feature.key"
                    :prepend-icon="feature.icon"
                    color="success"
                    variant="tonal"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ feature.label }}
                  </v-chip>
                </div>
              </div>

              <!-- Additional Fields -->
              <div
                v-if="task && task.postQuestion"
                class="config-section mb-4"
              >
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Post-Task Question:
                </div>
                <div class="text-body-2">
                  {{ task.postQuestion }}
                </div>
              </div>

              <div
                v-if="task && task.postForm"
                class="config-section mb-4"
              >
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Post-Task Form:
                </div>
                <v-chip
                  :href="task.postForm"
                  target="_blank"
                  prepend-icon="mdi-form-select"
                  color="info"
                  variant="outlined"
                  size="small"
                  class="text-decoration-none"
                >
                  External Form
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Validation Status -->
    <v-alert
      :type="isTaskComplete ? 'success' : 'warning'"
      variant="tonal"
      class="mt-6"
      :icon="isTaskComplete ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
    >
      <v-alert-title>
        {{ isTaskComplete ? 'Task Ready!' : 'Review Required' }}
      </v-alert-title>
      <div class="text-body-2 mt-2">
        {{ isTaskComplete 
          ? 'Your task is properly configured and ready to be used in your study.' 
          : 'Please review the previous steps to ensure all required fields are completed.' 
        }}
      </div>
    </v-alert>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['validate']);

const recordingFeatures = computed(() => {
  if (!props.task) return [];
  
  const features = [];
  
  if (props.task.hasEye) {
    features.push({ key: 'eye', label: 'Eye Tracking', icon: 'mdi-eye-outline' });
  }
  if (props.task.hasScreenRecord) {
    features.push({ key: 'screen', label: 'Screen Recording', icon: 'mdi-monitor-screenshot' });
  }
  if (props.task.hasCamRecord) {
    features.push({ key: 'camera', label: 'Camera', icon: 'mdi-video-outline' });
  }
  if (props.task.hasAudioRecord) {
    features.push({ key: 'audio', label: 'Audio', icon: 'mdi-microphone-outline' });
  }
  
  return features;
});

const isTaskComplete = computed(() => {
  if (!props.task) return false;
  return !!(props.task.taskName?.trim() && 
           props.task.taskDescription?.trim() && 
           props.task.taskType);
});

const getAnswerTypeIcon = (type) => {
  if (!type) return 'mdi-help-circle-outline';
  const icons = {
    'no-answer': 'mdi-close-circle-outline',
    'text-area': 'mdi-text-box-outline',
    'post-test': 'mdi-comment-question-outline',
    'post-form': 'mdi-form-select',
    'nasa-tlx': 'mdi-rocket-launch-outline',
    'sus': 'mdi-chart-line',
    'sart': 'mdi-eye-areaspline'
  };
  return icons[type] || 'mdi-help-circle-outline';
};

const getAnswerTypeLabel = (type) => {
  if (!type) return 'No Type Selected';
  const labels = {
    'no-answer': 'No Answer Required',
    'text-area': 'Text Area',
    'post-test': 'Post-Test Questions',
    'post-form': 'External Form',
    'nasa-tlx': 'NASA-TLX',
    'sus': 'System Usability Scale',
    'sart': 'SART'
  };
  return labels[type] || 'Unknown';
};

const isSystemChoice = (type) => {
  if (!type) return false;
  // System choices are standardized questionnaires/scales
  return ['nasa-tlx', 'sus', 'sart'].includes(type);
};

// Always emit validation as true since this is just a preview
watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      emit('validate', true);
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.task-preview {
  max-width: 100%;
}

.step-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-radius: 12px;
  border: 1px solid rgba(156, 39, 176, 0.2);
}

.task-summary-card {
  overflow: hidden;
}

.experience-preview-card {
  border-radius: 16px;
  overflow: hidden;
}

.config-section {
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.config-section:last-child {
  border-bottom: none;
}

.feature-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.description-content {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.preview-mockup {
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed rgba(var(--v-theme-outline), 0.3);
  overflow: hidden;
}

.mockup-header {
  background: rgba(var(--v-theme-primary), 0.1);
  padding: 16px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.mockup-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.mockup-content {
  padding: 20px;
}

.mockup-description {
  margin-bottom: 16px;
  line-height: 1.6;
}

.mockup-tip {
  background: rgba(255, 193, 7, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.mockup-link {
  text-align: center;
  margin-top: 20px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .step-header {
    padding: 16px;
  }
  
  .mockup-content {
    padding: 16px;
  }
}
</style>
