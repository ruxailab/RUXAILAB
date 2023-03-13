<template>
  <v-form ref="form">
    <v-row justify="space-around">
      <v-col cols="5">
        <v-text-field
          v-model="task.taskName"
          label="Name"
          :rules="requiredRule"
          outlined
          dense
        />
        <v-textarea
          v-model="task.taskDescription"
          label="Description"
          :rules="requiredRule"
          outlined
          dense
        />
        <v-text-field
          v-model="task.taskTip"
          label="Tip"
          outlined
          dense
        />
      </v-col>
      <v-col cols="5">
        <v-radio-group
          v-model="task.taskType"
          label="Answer type:"
          :mandatory="false"
          :rules="requiredRule"
        >
          <v-radio label="No answer" value="null" />
          <v-radio label="Text Area" value="textArea" />
          <v-radio label="Post Test" value="form" />
        </v-radio-group>
        <v-text-field
          v-if="task.taskType === 'form'"
          v-model="task.hasPost"
          label="Post-test"
          outlined
          dense
        />
        <v-row align="center">
          Timer:
          <v-switch v-model="task.hasTimer" class="ml-2" />
        </v-row>
        <v-row align="center">
          Screen Record:
          <v-switch v-model="task.hasScreenRecord" class="ml-2" />
        </v-row>
        <v-row align="center">
          Camera:
          <v-switch v-model="task.hasCamRecord" class="ml-2" />
        </v-row>
        <v-row align="center">
          Eye Tracker:
          <v-switch v-model="task.hasEye" class="ml-2" />
        </v-row>
        <v-row align="center">
          Audio Record:
          <v-switch v-model="task.hasAudioRecord" class="ml-2" />
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
      required: true
    }
  },
  data() {
    return {
      requiredRule: [v => !!v || "Field Required"]
    }
  },
  methods: {
    valida() {
      const valid = this.$refs.form.validate()
      this.$emit("validate", valid)
    },
    resetVal() {
      this.$refs.form.resetValidation()
    }
  }
}
</script>

<style>
</style>