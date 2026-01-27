<template>
  <div class="task-basic-info">
    <v-form ref="basicInfoForm">
      <div class="step-header mb-6">
        <h3 class="text-h6 font-weight-bold mb-2">
          {{ $t('CreateTask.basicInfo.stepTitle') }}
        </h3>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          {{ $t('CreateTask.basicInfo.stepDescription') }}
        </p>
      </div>

      <v-row>
        <v-col cols="12" class="pb-0 mb-0">
          <p class="text-subtitle-2 font-weight-medium">
            {{ $t('CreateTask.basicInfo.taskTitle') }}
            <span class="text-error">*</span>
          </p>
          <p class="text-caption text-grey-darken-1 mb-2">
            <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
            {{ $t('CreateTask.basicInfo.taskTitleHint') }}
          </p>
          <v-text-field
            v-model="localTask.taskName"
            :rules="validationRules"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-format-title"
            :placeholder="$t('CreateTask.basicInfo.taskTitlePlaceholder')"
            @update:model-value="validateStep"
          />
        </v-col>

        <v-col cols="12">
          <p class="text-subtitle-2 font-weight-medium d-block">
            {{ $t('CreateTask.basicInfo.taskDescription') }}
            <span class="text-error">*</span>
          </p>
          <p class="text-caption text-grey-darken-1 mb-2">
            <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
            {{ $t('CreateTask.basicInfo.taskDescriptionHint') }}
          </p>
          <div
            class="description-editor"
            :class="{
              'editor-error':
                showDescriptionError && !localTask.taskDescription?.trim(),
            }"
          >
            <quill-editor
              v-model:value="localTask.taskDescription"
              :options="editorOptions"
              class="custom-editor"
              @change="onChangeEditor"
              @blur="checkDescriptionValidation"
            />
          </div>
          <span
            v-if="showDescriptionError && !localTask.taskDescription?.trim()"
            class="error-text ml-4"
          >
            {{ t('CreateTask.validation.fieldRequired') }}
          </span>
        </v-col>

        <v-col cols="12">
          <p class="text-subtitle-2 font-weight-medium">
            {{ $t('CreateTask.basicInfo.tipLabel') }}
          </p>
          <p class="text-caption text-grey-darken-1 mb-2">
            <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
            {{ $t('CreateTask.basicInfo.tipHint') }}
          </p>
          <v-text-field
            v-model="localTask.taskTip"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lightbulb-outline"
            :placeholder="$t('CreateTask.basicInfo.tipPlaceholder')"
            @update:model-value="validateStep"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  validationRules: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'validate'])
const { t } = useI18n()

const localTask = ref({ ...props.modelValue })
const basicInfoForm = ref(null)
const showDescriptionError = ref(false)

const editorOptions = computed(() => ({
  theme: 'snow',
  placeholder: t('CreateTask.basicInfo.taskDescriptionPlaceholder'),
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  },
}))

const completionPercentage = computed(() => {
  let completed = 0
  const total = 3

  if (localTask.value.taskName?.trim()) completed++
  if (localTask.value.taskDescription?.trim()) completed++
  if (localTask.value.taskTip?.trim()) completed++

  return Math.round((completed / total) * 100)
})

const isValid = computed(() => {
  basicInfoForm.value?.validate?.()

  const nameOk = !!localTask.value.taskName?.trim()
  const descOk = !!localTask.value.taskDescription?.trim()
  return nameOk && descOk
})

const onChangeEditor = (content) => {
  localTask.value.taskDescription = content.html
  validateStep()
}

const checkTaskNameValidation = () => {
  const nameOk = !!localTask.value.taskName?.trim()
  return nameOk
}

const checkDescriptionValidation = () => {
  const descOk = !!localTask.value.taskDescription?.trim()
  showDescriptionError.value = !descOk
  return descOk
}

const validateStep = () => {
  emit('validate', isValid.value)
}

defineExpose({ isValid, checkDescriptionValidation, checkTaskNameValidation })

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
.editor-error {
  border: 1px solid red !important;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 4px;
  display: block;
  font-weight: 300;
}

.task-basic-info {
  max-width: 100%;
}

.step-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.description-editor {
  border: 1px solid rgba(var(--v-theme-outline), 0.3);
  border-radius: 0px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.description-editor:focus-within {
  border-color: rgb(var(--v-theme-primary));
}

:deep(.custom-editor .ql-editor) {
  min-height: 120px;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px;
}

:deep(.custom-editor .ql-toolbar) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
  background: rgba(var(--v-theme-surface), 0.5);
}

.progress-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 16px;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .step-header {
    padding: 16px;
  }

  :deep(.custom-editor .ql-editor) {
    min-height: 100px;
  }
}
</style>
