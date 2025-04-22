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
        <v-textarea
          v-model="localTask.taskDescription"
          :label="$t('common.description')"
          :rules="requiredRule"
          variant="outlined"
          density="compact"
        />
        <v-text-field
          v-model="localTask.taskTip"
          :label="$t('buttons.tip')"
          variant="outlined"
          density="compact"
        />
      </v-col>
      <v-col cols="5">
        <v-radio-group
          v-model="localTask.taskType"
          :label="$t('titles.answerType')"
          :mandatory="false"
          :rules="requiredRule"
        >
          <v-radio
            :label="$t('switches.noAnswer')"
            value="null"
          />
          <v-radio
            :label="$t('switches.textArea')"
            value="textArea"
          />
          <v-radio
            :label="$t('switches.postTest')"
            value="form"
          />
        </v-radio-group>
        <v-text-field
          v-if="localTask.taskType === 'form'"
          v-model="localTask.postQuestion"
          :label="$t('switches.postTest')"
          variant="outlined"
          density="compact"
        />
        <v-row align="center">
          {{ $t('switches.screenRecord') }}
          <v-switch
            v-model="localTask.hasScreenRecord"
            class="ml-2"
          />
        </v-row>
        <v-row align="center">
          {{ $t('switches.camera') }}
          <v-switch
            v-model="localTask.hasCamRecord"
            class="ml-2"
          />
        </v-row>
        <v-row align="center">
          {{ $t('switches.audioRecord') }}
          <v-switch
            v-model="localTask.hasAudioRecord"
            class="ml-2"
          />
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>
<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  emits: ['validate', 'update:task'],
  data() {
    return {
      requiredRule: [(v) => !!v || 'Field Required'],
      localTask: { ...this.task }, // Local copy of the task prop
    };
  },
  watch: {
    task: {
      handler(newTask) {
        this.localTask = { ...newTask };
      },
      deep: true,
    },
    localTask: {
      handler(newLocalTask) {
        this.$emit('update:task', { ...newLocalTask });
      },
      deep: true,
    },
  },
  watch: {
    'task.taskType'(newValue) {
      if (newValue !== 'form') {
        this.task.postQuestion = ''
      }
    },
  },
  methods: {
    valida() {
      const valid = this.$refs.form.validate();
      this.$emit('validate', valid);
    },
    resetVal() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>

<style></style>
