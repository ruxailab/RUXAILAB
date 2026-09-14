<template>
  <v-dialog
    :model-value="dialog"
    width="80%"
    persistent
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="dataCard pa-sm-6">
      <v-card-title class="form-header d-flex align-center">
        <v-icon color="primary" size="28" class="mr-3">
          mdi-clipboard-text-outline
        </v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold">
            {{ $t('CreateTask.dialog.title') }}
          </h2>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            {{ $t('CreateTask.dialog.subtitle') }}
          </p>
        </div>
      </v-card-title>
      <v-card-text>
        <FormTask
          ref="form"
          :task="localTask"
          @update:task="Object.assign(localTask, $event)"
          @update:dialog="($event) => $emit('update:dialog', $event)"
          @validate="submit"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import FormTask from '@/ux/UserTest/components/FormTask.vue'
import Task from '../models/Task'

const props = defineProps({
  dialog: Boolean,
  task: Object,
  isTemplate: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:dialog', 'update:task', 'addTask'])

// Make a local copy of task
const localTask = reactive(Task.fromJson({ ...props.task }))

// Sync props.task -> localTask whenever dialog opens
watch(
  () => props.dialog,
  (val) => {
    if (val) {
      Object.assign(localTask, Task.fromJson({}))
      Object.assign(localTask, Task.fromJson({ ...props.task }))
    }
  },
)

// Form reference
const form = ref(null)

// Emit validated task on submit
const submit = (task) => {
  emit('addTask', task)
  emit('update:dialog', false)
  reset()
}

const reset = () => {
  Object.assign(localTask, Task.fromJson({}))
  form.value?.resetVal()
}
</script>
