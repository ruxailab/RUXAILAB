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
          :task="task"
          @update:task="$emit('update:task', $event)"
          @validate="submit"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="red-lighten-1"
          variant="text"
          @click="$emit('update:dialog', false), reset()"
        >
          {{ $t('buttons.cancel') }}
        </v-btn>
        <v-btn
          color="#f9a826"
          class="text-white"
          @click="validate()"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FormTask from '../atoms/FormTask';

export default {
  components: {
    FormTask,
  },
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Object,
      default: () => ({
        taskName: '',
        taskDescription: '',
        taskTip: '',
        taskType: null,
        postQuestion: '',
        hasScreenRecord: false,
        hasCamRecord: false,
        hasAudioRecord: false,
      }),
    },
  },
  emits: ['update:dialog', 'update:task', 'addTask'],
  data: () => ({}),
  methods: {
    validate() {
      this.$refs.form.valida();
    },
    submit(valid) {
      if (valid) {
        this.$emit('addTask', this.task);
        this.$emit('update:dialog', false); // Close dialog
        this.reset();
      }
    },
    reset() {
      this.$refs.form.resetVal();
    },
  },
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