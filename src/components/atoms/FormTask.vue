<template>
  <v-form ref="form">
    <v-row justify="space-around">
      <v-col
        class="mt-4"
        cols="5"
      >
        <v-text-field
          v-model="localTask.taskName"
          :label="$t('common.name')"
          :rules="requiredRule"
          variant="outlined"
          density="compact"
        />
        <quill-editor
          v-model:value="localTask.taskDescription"
          class="mb-5"
          style="height: 40%;"
        />
        <v-text-field
          v-model="localTask.taskTip"
          :label="$t('buttons.tip')"
          variant="outlined"
          density="compact"
        />
      </v-col>

      <v-col
        class="mt-4"
        cols="5"
      >
        <v-text-field
          v-model="localTask.taskLink"
          label="Link"
          variant="outlined"
          density="compact"
        />
        <span class="text-subtitle-1">{{ $t('titles.answerType') }}</span>
        <v-select
          v-model="localTask.taskType"
          :items="selectItems"
          item-title="label"
          item-value="value"
          :label="$t('titles.answerType')"
          :rules="requiredRule"
          variant="outlined"
          density="compact"
          class="mt-4"
        />

        <v-text-field
          v-if="localTask.taskType === 'form'"
          v-model="localTask.postQuestion"
          :label="$t('switches.postTest')"
          variant="outlined"
          density="compact"
        />
        <v-text-field
          v-if="task.taskType === 'post-form'"
          v-model="localTask.postForm"
          :label="$t('switches.postForm')"
          variant="outlined"
          density="compact"
          :rules="[(v) => !!v && v.startsWith('http') || 'Field must be a valid URL']"
        />

        <v-checkbox
          v-model="localTask.hasScreenRecord"
          :label="$t('switches.screenRecord')"
        />
        <v-checkbox
          v-model="localTask.hasCamRecord"
          :label="$t('switches.camera')"
        />
        <v-checkbox
          v-model="localTask.hasAudioRecord"
          :label="$t('switches.audioRecord')"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

const selectItems = [
  { label: t('switches.noAnswer'), value: 'no-answer' },
  { label: t('switches.textArea'), value: 'text-area' },
  { label: t('switches.postTest'), value: 'post-test' },
  { label: t('switches.postForm'), value: 'post-form' },
  { label: t('switches.nasa'), value: 'nasa-tlx' },
  { label: 'System Usability Scale', value: 'sus' }
];

const emit = defineEmits(['validate', 'update:task']);

const form = ref(null);
const requiredRule = [(v) => !!v || 'Field Required'];
const localTask = ref({ ...props.task });

// Watch for changes in the task prop
watch(
  () => props.task,
  (newTask) => {
    localTask.value = { ...newTask };
  },
  { deep: true }
);

// Watch for changes in localTask and emit update
watch(
  localTask,
  (newLocalTask) => {
    emit('update:task', { ...newLocalTask });
  },
  { deep: true }
);

// Methods
const valida = () => {
  const valid = form.value.validate();
  emit('validate', valid);
};

const resetVal = () => {
  form.value.resetValidation();
};

// Expose methods to parent if needed
defineExpose({
  valida,
  resetVal,
});
</script>

<style></style>
