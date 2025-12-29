<template>
  <div class="task-preview">
    <!-- Task Summary Card -->
    <v-card class="task-summary-card mb-3 mb-sm-4 mb-md-6" elevation="1">
      <v-card-title class="card-header d-flex align-center bg-primary text-white py-2 py-sm-3 min-h-[40px]">
        <v-icon size="18" class="mr-1 mr-sm-2 flex-shrink-0">mdi-clipboard-check-outline</v-icon>
        <span class="card-title-text text-wrap">Task Summary</span>
      </v-card-title>
      
      <v-card-text class="pa-2 pa-sm-3 pa-md-4 pa-lg-6">
        <v-row dense>
          <!-- Left Column - Main Details -->
          <v-col cols="12" md="8" class="mb-3 mb-md-0">
            <div class="task-details">
              <!-- Task Name -->
              <h4 class="task-name text-subtitle-1 text-sm-h6 text-md-h5 font-weight-bold mb-2 mb-sm-3 text-wrap break-words">
                {{ (task && task.taskName) || 'Untitled Task' }}
              </h4>
              
              <!-- Task Description -->
              <div class="task-description mb-3 mb-sm-4">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1 mb-sm-2">
                  Description:
                </div>
                <div 
                  class="description-content min-h-[60px]"
                  v-html="(task && task.taskDescription) || '<p class=\'no-description\'>No description provided</p>'"
                />
              </div>

              <!-- Participant Tip -->
              <div v-if="task && task.taskTip" class="task-tip mb-3 mb-sm-4">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1 mb-sm-2">
                  Participant Tip:
                </div>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="comfortable"
                  icon="mdi-lightbulb-outline"
                  class="tip-alert py-1 py-sm-2 px-2 px-sm-3 min-h-0"
                  :icon-size="18"
                >
                  <span class="tip-text text-caption-sm text-wrap break-words">{{ task.taskTip }}</span>
                </v-alert>
              </div>

              <!-- Task URL -->
              <div v-if="task && task.taskLink" class="task-link mb-2 mb-sm-3">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1 mb-sm-2">
                  Task URL:
                </div>
                <v-chip
                  :href="task.taskLink"
                  target="_blank"
                  prepend-icon="mdi-open-in-new"
                  color="primary"
                  variant="outlined"
                  class="link-chip text-decoration-none w-full min-h-[28px]"
                  size="small"
                >
                  <span class="link-text break-all whitespace-normal">{{ formatUrl(task.taskLink) }}</span>
                </v-chip>
              </div>
            </div>
          </v-col>

          <!-- Right Column - Configuration -->
          <v-col cols="12" md="4">
            <div class="task-config">
              <!-- Answer Type -->
              <div class="config-section mb-2 mb-sm-3">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1">
                  Answer Type:
                </div>
                <v-chip
                  :prepend-icon="getAnswerTypeIcon(task && task.taskType)"
                  :color="isSystemChoice(task && task.taskType) ? 'secondary' : 'grey-lighten-1'"
                  variant="tonal"
                  size="small"
                  class="answer-chip w-full justify-start min-h-[28px]"
                >
                  <span class="chip-label text-wrap break-words">
                    {{ getAnswerTypeLabel(task && task.taskType) }}
                  </span>
                </v-chip>
              </div>

              <!-- Recording Features -->
              <div v-if="recordingFeatures.length > 0" class="config-section mb-2 mb-sm-3">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1">
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
                    class="feature-chip mb-1 mr-1 min-h-[26px]"
                  >
                    <span class="feature-label text-wrap break-words">{{ getShortLabel(feature.label) }}</span>
                  </v-chip>
                </div>
              </div>

              <!-- Post-Task Question -->
              <div v-if="task && task.postQuestion" class="config-section mb-2 mb-sm-3">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1">
                  Post-Task Question:
                </div>
                <div class="post-question text-caption-sm text-body-2 text-wrap break-words min-h-[40px]">
                  {{ task.postQuestion }}
                </div>
              </div>

              <!-- Post-Task Form -->
              <div v-if="task && task.postForm" class="config-section mb-2 mb-sm-3">
                <div class="section-label text-caption-xs text-caption-sm text-grey-darken-1 mb-1">
                  Post-Task Form:
                </div>
                <v-chip
                  :href="task.postForm"
                  target="_blank"
                  prepend-icon="mdi-form-select"
                  color="info"
                  variant="outlined"
                  size="small"
                  class="form-chip text-decoration-none w-full min-h-[28px]"
                >
                  <span class="chip-label text-wrap">External Form</span>
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
      class="mt-3 mt-sm-4 mt-md-6 validation-alert min-h-0"
      :icon="isTaskComplete ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
      density="comfortable"
      :icon-size="20"
    >
      <div class="alert-content">
        <div class="alert-title text-caption-sm text-subtitle-2 text-sm-subtitle-1 font-weight-medium text-wrap break-words">
          {{ isTaskComplete ? 'Task Ready!' : 'Review Required' }}
        </div>
        <div class="alert-message text-caption-xs text-caption-sm text-body-2 mt-1 text-wrap break-words">
          {{ isTaskComplete 
            ? 'Your task is properly configured and ready to be used in your study.' 
            : 'Please review the previous steps to ensure all required fields are completed.' 
          }}
        </div>
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
    features.push({ key: 'screen', label: 'Screen Record', icon: 'mdi-monitor-screenshot' });
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
    'sus': 'mdi-chart-line'
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
    'sus': 'System Usability Scale'
  };
  return labels[type] || 'Unknown';
};

const isSystemChoice = (type) => {
  if (!type) return false;
  return ['nasa-tlx', 'sus'].includes(type);
};

const formatUrl = (url) => {
  if (!url) return '';
  return url;
};

const getShortLabel = (label) => {
  if (!label) return '';
  return label;
};

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
  width: 100%;
}

/* Card Header */
.card-header {
  min-height: 40px;
  padding: 6px 12px;
}

.card-title-text {
  font-size: 0.875rem;
  font-weight: 600;
  word-break: break-word;
  hyphens: auto;
  line-height: 1.2;
}

/* Task Name */
.task-name {
  word-break: break-word;
  hyphens: auto;
  line-height: 1.3;
  font-size: 1.125rem;
}

/* Text wrapping classes */
.text-wrap {
  white-space: normal !important;
  overflow-wrap: break-word !important;
}

.break-words {
  word-break: break-word !important;
}

.break-all {
  word-break: break-all !important;
}

/* Section Labels */
.section-label {
  line-height: 1.2;
  font-weight: 500;
}

/* Description Content */
.description-content {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 8px 10px;
  border-radius: 4px;
  border-left: 2px solid rgb(var(--v-theme-primary));
  font-size: 0.8125rem;
  line-height: 1.4;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: anywhere;
  min-height: 60px;
  display: flex;
  align-items: center;
}

.description-content :deep(*) {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-wrap: break-word;
  margin: 0;
  padding: 0;
}

.description-content :deep(p) {
  margin-bottom: 4px;
}

.description-content :deep(p:last-child) {
  margin-bottom: 0;
}

.description-content :deep(.no-description) {
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
  margin: 0;
}

/* Tip Alert */
.tip-alert {
  border-radius: 4px;
  font-size: 0.8125rem;
  line-height: 1.3;
  min-height: auto;
}

.tip-alert :deep(.v-alert__content) {
  width: 100%;
}

.tip-text {
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: anywhere;
  display: inline-block;
  width: 100%;
}

/* Chips */
.link-chip,
.answer-chip,
.form-chip {
  max-width: 100%;
  min-height: 28px;
  justify-content: flex-start;
  border-radius: 4px;
  padding: 0 8px;
  height: auto !important;
}

.link-chip :deep(.v-chip__content),
.answer-chip :deep(.v-chip__content),
.form-chip :deep(.v-chip__content) {
  width: 100%;
  display: flex;
  align-items: center;
  white-space: normal;
  word-break: break-word;
  line-height: 1.2;
  padding: 4px 0;
}

.chip-label,
.link-text,
.feature-label {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  max-width: 100%;
  display: block;
  font-size: 0.75rem;
  line-height: 1.2;
  word-break: break-word;
}

.link-text {
  word-break: break-all;
}

.link-chip :deep(.v-chip__prepend),
.answer-chip :deep(.v-chip__prepend),
.form-chip :deep(.v-chip__prepend) {
  margin-inline-end: 4px;
  flex-shrink: 0;
}

.link-chip :deep(.v-icon),
.answer-chip :deep(.v-icon),
.form-chip :deep(.v-icon) {
  font-size: 14px;
}

/* Feature Chips */
.feature-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.feature-chip {
  flex: 0 1 auto;
  min-width: 0;
  border-radius: 4px;
  padding: 0 6px;
  height: auto !important;
  min-height: 26px;
}

.feature-chip :deep(.v-chip__content) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  font-size: 0.75rem;
  line-height: 1.2;
  padding: 3px 0;
  word-break: break-word;
}

.feature-chip :deep(.v-icon) {
  font-size: 12px;
  margin-right: 2px;
  flex-shrink: 0;
}

/* Post Question */
.post-question {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.5);
  word-break: break-word;
  hyphens: auto;
  line-height: 1.3;
  font-size: 0.8125rem;
  min-height: 40px;
  display: flex;
  align-items: center;
}

/* Validation Alert */
.validation-alert {
  border-radius: 6px;
  min-height: auto;
  padding: 8px 12px;
  height: auto !important;
}

.validation-alert :deep(.v-alert__content) {
  width: 100%;
}

.alert-content {
  width: 100%;
}

.alert-title {
  line-height: 1.2;
  font-size: 0.875rem;
  word-break: break-word;
}

.alert-message {
  line-height: 1.3;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: anywhere;
}

.text-caption-xs {
  font-size: 0.6875rem !important; 
  line-height: 1.2;
}

.text-caption-sm {
  font-size: 0.75rem !important; 
  line-height: 1.2;
}

/* Remove all fixed heights and allow content to expand */
.min-h-0 {
  min-height: 0 !important;
}

.min-h-\[28px\] {
  min-height: 28px !important;
}

.min-h-\[26px\] {
  min-height: 26px !important;
}

.min-h-\[40px\] {
  min-height: 40px !important;
}

.min-h-\[60px\] {
  min-height: 60px !important;
}

/* Ultra Small (230px - 279px) */
@media (max-width: 279px) {
  .card-header {
    min-height: 36px;
    padding: 4px 8px;
  }
  
  .card-title-text {
    font-size: 0.75rem;
  }
  
  .task-name {
    font-size: 0.9375rem;
  }
  
  .description-content {
    font-size: 0.75rem;
    padding: 6px 8px;
    border-left-width: 1px;
    min-height: 50px;
  }
  
  .section-label {
    font-size: 0.6875rem !important;
  }
  
  .tip-alert {
    padding: 6px 8px !important;
    font-size: 0.75rem;
  }
  
  .link-chip,
  .answer-chip,
  .form-chip {
    min-height: 24px !important;
    padding: 0 6px;
  }
  
  .chip-label,
  .link-text,
  .feature-label {
    font-size: 0.6875rem;
  }
  
  .feature-chip {
    min-height: 22px !important;
    padding: 0 4px;
    margin-right: 2px;
    margin-bottom: 2px;
  }
  
  .feature-chip :deep(.v-icon) {
    font-size: 10px;
    margin-right: 1px;
  }
  
  .post-question {
    padding: 4px 6px;
    font-size: 0.75rem;
    min-height: 35px;
  }
  
  .validation-alert {
    padding: 6px 8px;
  }
  
  .alert-title {
    font-size: 0.75rem;
  }
  
  .alert-message {
    font-size: 0.6875rem;
  }
  
  /* Stack feature chips vertically on ultra small */
  .feature-chips {
    flex-direction: column;
    gap: 2px;
  }
  
  .feature-chip {
    width: 100%;
    margin-right: 0;
  }
}

/* Very Small (280px - 319px) */
@media (min-width: 280px) and (max-width: 319px) {
  .card-header {
    min-height: 38px;
    padding: 5px 10px;
  }
  
  .card-title-text {
    font-size: 0.8125rem; /* 13px */
  }
  
  .task-name {
    font-size: 1rem; /* 16px */
  }
  
  .description-content {
    font-size: 0.8125rem; /* 13px */
    padding: 7px 9px;
    min-height: 55px;
  }
  
  .link-chip,
  .answer-chip,
  .form-chip {
    min-height: 26px !important;
  }
  
  .chip-label,
  .link-text,
  .feature-label {
    font-size: 0.75rem; /* 12px */
  }
  
  .feature-chip {
    min-height: 24px !important;
    flex: 1 1 calc(50% - 3px);
    max-width: calc(50% - 3px);
  }
  
  .feature-chip :deep(.v-chip__content) {
    justify-content: center;
  }
}

/* Small Mobile (320px - 359px) */
@media (min-width: 320px) and (max-width: 359px) {
  .card-header {
    min-height: 40px;
    padding: 6px 12px;
  }
  
  .card-title-text {
    font-size: 0.875rem; /* 14px */
  }
  
  .task-name {
    font-size: 1.0625rem; /* 17px */
  }
  
  .description-content {
    font-size: 0.8125rem; /* 13px */
    padding: 8px 10px;
    min-height: 60px;
  }
  
  .feature-chip {
    flex: 0 1 auto;
    max-width: none;
  }
}

/* All text should wrap properly on all screens */
:deep(.v-chip__content),
:deep(.v-alert__content),
:deep(.v-card-title),
:deep(.v-card-text) {
  white-space: normal !important;
  word-break: break-word !important;
}

/* Fix for Vuetify chips text overflow */
:deep(.v-chip) {
  height: auto !important;
}

:deep(.v-chip__content) {
  line-height: 1.2 !important;
  padding: 4px 0 !important;
}

/* Make sure alerts can expand */
:deep(.v-alert) {
  height: auto !important;
}

/* Handle very long single words/URLs */
.break-all {
  word-break: break-all !important;
}

/* Ensure all text is visible */
.text-visible {
  overflow: visible !important;
  text-overflow: clip !important;
}

/* Remove any max-height restrictions */
:deep(*) {
  max-height: none !important;
}

/* Handle landscape on ultra small devices */
@media (max-height: 400px) and (orientation: landscape) {
  .task-summary-card {
    margin-bottom: 8px;
  }
  
  .card-header {
    min-height: 32px;
    padding: 4px 8px;
  }
  
  .card-title-text {
    font-size: 0.75rem;
  }
  
  .description-content {
    padding: 4px 6px;
    font-size: 0.75rem;
    min-height: 40px;
  }
  
  .post-question {
    min-height: 30px;
  }
}

/* Special fix for the specific issue shown in image */
:deep(.v-card-text) {
  overflow: visible !important;
}

:deep(.v-col) {
  overflow: visible !important;
}

:deep(.v-row) {
  overflow: visible !important;
}

/* Force all text containers to expand */
.expandable {
  flex: 1;
  min-width: 0;
}

/* Make sure nothing clips text */
.no-clip {
  overflow: visible !important;
  clip-path: none !important;
}

/* Special utility for long text in chips */
.chip-text-wrapper {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: visible;
  text-overflow: unset;
}
</style>