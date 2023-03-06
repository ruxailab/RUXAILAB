<template>
  <v-form ref="form">
    <v-row justify="space-around">
      <v-col cols="5">
        <v-text-field
          v-model="task.name"
          label="Name"
          :rules="requiredRule"
          outlined
          dense
        />
        <v-textarea
          v-model="task.description"
          label="Description"
          :rules="requiredRule"
          outlined
          dense
        />
        <v-text-field
          v-model="task.tip"
          label="Tip"
          outlined
          dense
        />
      </v-col>
      <v-col cols="5">
        <v-radio-group
          v-model="task.answer"
          label="Answer type:"
          :mandatory="false"
          :rules="requiredRule"
        >
          <v-radio label="No answer" value="null" />
          <v-radio label="Text Area" value="textArea" />
          <v-radio label="Post Test" value="form" />
        </v-radio-group>
        <v-text-field
          v-if="task.answer === 'form'"
          v-model="task.postTest"
          label="Post-test"
          outlined
          dense
        />
        <v-row align="center">
          Timer:
          <v-switch v-model="task.timer" class="ml-2" />
        </v-row>
        <v-row align="center">
          Record Screen:
          <v-switch v-model="task.recordScreen" class="ml-2" />
        </v-row>
        <v-row align="center">
          Camera:
          <v-switch v-model="task.camera" class="ml-2" />
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