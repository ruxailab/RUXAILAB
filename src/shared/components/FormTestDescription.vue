<template>
  <v-form ref="form">
    <v-row
      no-gutters
      class="px-6 py-0"
    >
      <v-col cols="12">
        <div class="input-group mb-6">
          <label class="input-label">Test Title</label>
          <v-text-field
            :model-value="test.testTitle"
            :autofocus="lock ? false : true"
            :label="$t('common.title')"
            :rules="titleRequired"
            counter="200"
            variant="outlined"
            density="comfortable"
            placeholder="Enter a descriptive title for your test"
            hide-details="auto"
            class="modern-input"
            @update:model-value="updateTestTitle($event)"
          />
        </div>

        <div class="input-group mb-6">
          <label class="input-label">Test Category</label>
          <v-select
            :model-value="test.testType"
            :disabled="lock || disableType"
            :items="types"
            :label="$t('common.type')"
            :rules="typeRequired"
            density="comfortable"
            variant="outlined"
            placeholder="Choose the type of test you're conducting"
            hide-details="auto"
            class="modern-input"
            @update:model-value="$emit('update:test', { ...test, testType: $event })"
          >
            <template #prepend-inner>
              <v-icon
                size="18"
                color="grey-500"
              >
                mdi-tag-outline
              </v-icon>
            </template>
          </v-select>
        </div>

        <div class="input-group mb-6">
          <label class="input-label">Description</label>
          <v-textarea
            :model-value="test.testDescription"
            :label="$t('common.description')"
            variant="outlined"
            rows="4"
            density="comfortable"
            placeholder="Provide detailed information about your test objectives, methodology, and expected outcomes"
            hide-details="auto"
            class="modern-input"
            @update:model-value="updateTestDescription($event)"
          />
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { STUDY_TYPES } from '../constants/methodDefinitions';

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  lock: {
    type: Boolean,
    default: false,
  },
  disableType: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:test', 'valForm']);

const store = useStore();
const { t } = useI18n();

const form = ref(null);

const titleRequired = [
  v => !!v || t('errors.fieldRequired'),
  v => (v && v.length <= 200) || 'Max 200 characters',
];
const typeRequired = [v => !!v || t('errors.fieldRequired')];

const types = [
  { title: 'Usability User Test', value: STUDY_TYPES.USER },
  { title: t('titles.heuristic'), value: STUDY_TYPES.HEURISTIC },
  { title: 'Manual Accessibility Test', value: STUDY_TYPES.MANUAL_ACCESSIBILITY },
  { title: 'Automatic Accessibility Test', value: STUDY_TYPES.AUTOMATIC_ACCESSIBILITY },
];

const validate = async () => {
  const { valid } = await form.value.validate();
  emit('valForm', valid, 0);
  return valid;
};

const resetVal = () => {
  form.value.resetValidation();
};

const updateTestTitle = value => {
  emit('update:test', { ...props.test, testTitle: value });
  store.commit('SET_LOCAL_CHANGES', true);
};

const updateTestDescription = value => {
  emit('update:test', { ...props.test, testDescription: value });
  store.commit('SET_LOCAL_CHANGES', true);
};

defineExpose({
  validate,
  resetVal,
});
</script>

<style scoped>
.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.modern-input :deep(.v-field) {
  border-radius: 12px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.modern-input :deep(.v-field__outline) {
  border-color: #e5e7eb;
}

.modern-input :deep(.v-field--focused .v-field__outline) {
  border-color: #3b82f6;
  border-width: 2px;
}

.modern-input :deep(.v-field:hover .v-field__outline) {
  border-color: #d1d5db;
}

.modern-input :deep(.v-field__input) {
  font-size: 0.875rem;
  padding: 16px;
}
</style>
