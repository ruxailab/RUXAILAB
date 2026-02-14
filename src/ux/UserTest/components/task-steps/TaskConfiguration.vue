<template>
  <div class="task-configuration">
    <div class="step-header mb-6">
      <h3 class="text-h6 font-weight-bold mb-2">
        {{ $t('CreateTask.configuration.stepTitle') }}
      </h3>
      <p class="text-body-2 text-grey-darken-1 mb-0">
        {{ $t('CreateTask.configuration.stepDescription') }}
      </p>
    </div>

    <v-row>
      <v-col cols="12" md="4">
        <p class="text-subtitle-2 font-weight-medium mb-2">
          {{ $t('CreateTask.configuration.taskLink') }}
          <!-- <span class="text-error">*</span> -->
        </p>
        <p class="text-caption text-grey-darken-1 mb-3">
          <v-icon size="14" class="mr-1"> mdi-information-outline </v-icon>
          {{ $t('CreateTask.configuration.taskLinkHint') }}
        </p>
        <v-text-field
          v-model="localTask.taskLink"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-link"
          :placeholder="$t('CreateTask.configuration.taskLinkPlaceholder')"
          :rules="linkRules"
          @update:model-value="validateStep"
        />
      </v-col>

      <v-col cols="12" md="4">
        <p class="text-subtitle-2 font-weight-medium mb-2">
          {{ $t('CreateTask.configuration.estimatedTime') }}
          <!-- <span class="text-error">*</span> -->
        </p>
        <p class="text-caption text-grey-darken-1 mb-3">
          <v-icon size="14" class="mr-1"> mdi-information-outline </v-icon>
          {{ $t('CreateTask.configuration.estimatedTimeHint') }}
        </p>
        <v-text-field
          v-model="localTask.estimatedTime"
          type="number"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-clock-outline"
          :placeholder="$t('CreateTask.configuration.estimatedTimePlaceholder')"
          :rules="timeRules"
          @update:model-value="validateStep"
        />
      </v-col>

      <v-col cols="12" md="4">
        <p class="text-subtitle-2 font-weight-medium mb-2">
          {{ $t('titles.answerType') }}
          <!-- <span class="text-error">*</span> -->
        </p>
        <p class="text-caption text-grey-darken-1 mb-3">
          <v-icon size="14" class="mr-1"> mdi-information-outline </v-icon>
          {{ $t('CreateTask.configuration.answerTypeHint') }}
        </p>
        <v-select
          v-model="localTask.taskType"
          :items="selectItems"
          item-title="label"
          item-value="value"
          :rules="validationRules"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-format-list-bulleted"
          @update:model-value="validateStep"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" class="answer-type-item">
              <template #prepend>
                <v-icon :icon="getAnswerTypeIcon(item.raw.value)" size="20" />
              </template>
              <v-list-item-subtitle>{{
                getAnswerTypeDescription(item.raw.value)
              }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>
      </v-col>

      <!-- Conditional Fields -->
      <v-col v-if="localTask.taskType === 'post-test'" cols="12">
        <p class="text-subtitle-2 font-weight-medium mb-2">
          {{ $t('switches.postTest') }}
          <!-- <span class="text-error">*</span> -->
        </p>
        <p class="text-caption text-grey-darken-1 mb-3">
          <v-icon size="14" class="mr-1"> mdi-information-outline </v-icon>
          {{ $t('CreateTask.configuration.postTestHint') }}
        </p>
        <v-text-field
          v-model="localTask.postQuestion"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-help-circle-outline"
          :placeholder="$t('CreateTask.configuration.postTestPlaceholder')"
          @update:model-value="validateStep"
        />
      </v-col>

      <v-col v-if="localTask.taskType === 'post-form'" cols="12">
        <p class="text-subtitle-2 font-weight-medium mb-2">
          {{ $t('switches.postForm') }}
          <!-- <span class="text-error">*</span> -->
        </p>
        <p class="text-caption text-grey-darken-1 mb-3">
          <v-icon size="14" class="mr-1"> mdi-information-outline </v-icon>
          {{ $t('CreateTask.configuration.postFormHint') }}
        </p>
        <v-text-field
          v-model="localTask.postForm"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-form-select"
          :placeholder="$t('CreateTask.configuration.postFormPlaceholder')"
          :rules="urlRules"
          @update:model-value="validateStep"
        />
      </v-col>
    </v-row>

    <!-- Answer Type Preview -->
    <v-card
      v-if="localTask.taskType"
      class="mt-6 answer-preview-card"
      elevation="0"
    >
      <v-card-title
        class="text-subtitle-1 font-weight-medium d-flex align-center"
      >
        <v-icon :icon="getAnswerTypeIcon(localTask.taskType)" class="mr-2" />
        {{ $t('CreateTask.configuration.answerTypePreview') }}
      </v-card-title>
      <v-card-text>
        <AnswerTypePreview :task-type="localTask.taskType" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AnswerTypePreview from './AnswerTypePreview.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  selectItems: {
    type: Array,
    required: true,
  },
  validationRules: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'validate'])

const localTask = ref({ ...props.modelValue })

const linkRules = computed(() => [
  (v) => !v || /^https?:\/\/.+/.test(v) || t('CreateTask.validation.validUrl'),
])

const urlRules = computed(() => [
  (v) => !!v || t('CreateTask.validation.fieldRequired'),
  (v) => /^https?:\/\/.+/.test(v) || t('CreateTask.validation.validUrl'),
])

const timeRules = computed(() => [
  (v) => !!v || t('CreateTask.validation.fieldRequired'),
  (v) => (v && v > 0) || t('CreateTask.validation.positiveNumber'),
])

const isValid = computed(() => {
  const hasTaskType = !!localTask.value.taskType
  const linkValid =
    !localTask.value.taskLink || /^https?:\/\/.+/.test(localTask.value.taskLink)
  const postFormValid =
    localTask.value.taskType !== 'post-form' ||
    (localTask.value.postForm &&
      /^https?:\/\/.+/.test(localTask.value.postForm))

  return hasTaskType && linkValid && postFormValid
})

const getAnswerTypeIcon = (type) => {
  const icons = {
    'no-answer': 'mdi-close-circle-outline',
    'text-area': 'mdi-text-box-outline',
    'post-test': 'mdi-comment-question-outline',
    'post-form': 'mdi-form-select',
    'nasa-tlx': 'mdi-rocket-launch-outline',
    sus: 'mdi-chart-line',
    'tam-1': 'mdi-chart-box',
    'tam-2': 'mdi-chart-box-multiple-outline',
    'tam-3': 'mdi-chart-donut',
    sart: 'mdi-chart-areaspline',
  }
  return icons[type] || 'mdi-help-circle-outline'
}

const getAnswerTypeDescription = (type) => {
  const descriptions = {
    'no-answer': t('CreateTask.configurationDescriptions.noAnswer'),
    'text-area': t('CreateTask.configurationDescriptions.textArea'),
    'post-test': t('CreateTask.configurationDescriptions.postTest'),
    'post-form': t('CreateTask.configurationDescriptions.postForm'),
    'nasa-tlx': t('CreateTask.configurationDescriptions.nasaTlx'),
    sus: t('CreateTask.configurationDescriptions.sus'),
    'tam-1': t('CreateTask.configurationDescriptions.tam1'),
    'tam-2': t('CreateTask.configurationDescriptions.tam2'),
    'tam-3': t('CreateTask.configurationDescriptions.tam3'),
    sart: t('CreateTask.configurationDescriptions.sart'),
  }
  return descriptions[type] || ''
}

const validateStep = () => {
  emit('validate', isValid.value)
}

// Watch for local changes and emit
watch(
  localTask,
  (newValue) => {
    emit('update:modelValue', { ...newValue })
    validateStep()
  },
  { deep: true, immediate: true },
)
</script>

<style scoped>
.task-configuration {
  max-width: 100%;
}

.step-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.answer-type-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: background-color 0.2s ease;
}

.answer-type-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.answer-preview-card {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border: 1px solid rgba(156, 39, 176, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .step-header {
    padding: 16px;
  }
}
</style>
