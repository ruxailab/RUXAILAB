<template>
  <v-form ref="form">
    <v-row justify="space-around">
      <v-col class="mt-4" cols="5">
        <v-text-field v-model="localTask.taskName" :label="$t('common.name')" :rules="requiredRule" variant="outlined"
          density="compact" />
        <quill-editor v-model:value="localTask.taskDescription" class="mb-5" style="height: 40%;" />
        <v-text-field v-model="localTask.taskTip" :label="$t('buttons.tip')" variant="outlined" density="compact" />
        <v-text-field v-model="localTask.taskLink" label="Link" variant="outlined" density="compact" />
      </v-col>
      <v-col cols="5">
        <v-radio-group v-model="localTask.taskType" :label="$t('titles.answerType')" :mandatory="false"
          :rules="requiredRule">
          <v-radio :label="$t('switches.noAnswer')" value="null" />
          <v-radio :label="$t('switches.textArea')" value="textArea" />
          <v-radio :label="$t('switches.postTest')" value="form" />
          <v-radio :label="$t('switches.postForm')" value="postForm" />
        </v-radio-group>
        <v-text-field v-if="localTask.taskType === 'form'" v-model="localTask.postQuestion"
          :label="$t('switches.postTest')" variant="outlined" density="compact" />
        <v-text-field v-if="task.taskType === 'postForm'" v-model="localTask.postForm" :label="$t('switches.postForm')"
          variant="outlined" density="compact"
          :rules="[(v) => !!v && v.startsWith('http') || 'Field must be a valid URL']" />
        <v-row align="center">
          {{ $t('switches.screenRecord') }}
          <v-switch v-model="localTask.hasScreenRecord" class="ml-2" />
        </v-row>
        <v-row align="center">
          {{ $t('switches.camera') }}
          <v-switch v-model="localTask.hasCamRecord" class="ml-2" />
        </v-row>
        <v-row align="center">
          {{ $t('switches.audioRecord') }}
          <v-switch v-model="localTask.hasAudioRecord" class="ml-2" />
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

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
