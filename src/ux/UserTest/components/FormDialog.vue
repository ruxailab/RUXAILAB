<template>
  <v-dialog :model-value="dialog" width="80%" persistent @update:model-value="$emit('update:dialog', $event)">
    <v-card class="dataCard pa-sm-6">
      <v-card-title class="form-header d-flex align-center">
        <v-icon color="primary" size="28" class="mr-3">
          mdi-clipboard-text-outline
        </v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold">
            Create New Task
          </h2>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            Configure your task step by step
          </p>
        </div>
      </v-card-title>
      <v-card-text>
        <FormTask ref="form" :task="localTask" @update:task="Object.assign(localTask, $event)" @validate="submit" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="red-lighten-1" variant="text" @click="$emit('update:dialog', false); reset()">
          {{ $t('buttons.cancel') }}
        </v-btn>
        <v-btn class="text-white bg-orange" @click="validate">
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import FormTask from '@/ux/UserTest/components/FormTask.vue';
import Task from '../models/Task';

const props = defineProps({
  dialog: Boolean,
  task: Object,
});

const emit = defineEmits(['update:dialog', 'update:task', 'addTask']);

// Make a local copy of task
const localTask = reactive(Task.fromJson({ ...props.task }));

// Sync props.task -> localTask whenever dialog opens
watch(() => props.dialog, (val) => {
  if (val) Object.assign(localTask, props.task);
});

// Form reference
const form = ref(null);

// Emit validated task on submit
const validate = () => {
  form.value?.valida();
};

const submit = (task) => {
  emit('addTask', task);
  emit('update:dialog', false);
  reset();
};

const reset = () => {
  form.value?.resetVal();
};
</script>
