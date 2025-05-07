<template>
  <v-dialog
    :model-value="dialog"
    width="70%"
    persistent
    @update:model-value="$emit('update:dialog', $event)"
  >
    <v-card class="dataCard">
      <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
        New task
      </p>
      <v-divider />
      <v-card-text>
        <FormTask
          ref="form"
          :task="localTask"
          @update:task="Object.assign(localTask, $event)"
          @validate="submit"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="red-lighten-1"
          variant="text"
          @click="$emit('update:dialog', false); reset()"
        >
          {{ $t('buttons.cancel') }}
        </v-btn>
        <v-btn
          class="text-white bg-orange"
          @click="validate"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import FormTask from '../atoms/FormTask';

const props = defineProps({
  dialog: Boolean,
  task: Object,
});

const emit = defineEmits(['update:dialog', 'update:task', 'addTask']);

// Make a local copy of task
const localTask = reactive({ ...props.task });

// Sync props.task -> localTask whenever dialog opens
watch(() => props.dialog, (val) => {
  if (val) {
    Object.assign(localTask, props.task);
  }
});

// Form reference
const form = ref(null);

// Emit validated task on submit
const validate = () => {
  form.value?.valida();
};

const submit = (valid) => {
  if (valid) {
    emit('addTask', { ...localTask });
    emit('update:dialog', false);
    reset();
  }
};

const reset = () => {
  form.value?.resetVal();
};
</script>


<style scoped>
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>