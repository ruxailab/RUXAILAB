<template>
  <v-form ref="form">
    <v-row justify="space-around">
      <v-col cols="5">
        <v-text-field
          label="Name"
          v-model="task.name"
          :rules="requiredRule"
          outlined
          dense
        ></v-text-field>
        <v-textarea
          label="Description"
          v-model="task.description"
          :rules="requiredRule"
          outlined
          dense
        ></v-textarea>
        <v-text-field
          label="Tip"
          v-model="task.tip"
          outlined
          dense
        ></v-text-field>
      </v-col>
      <v-col cols="5">
        <v-radio-group
          v-model="task.answer"
          label="Answer type:"
          :mandatory="false"
          :rules="requiredRule"
        >
          <v-radio label="No answer" value="null"></v-radio>
          <v-radio label="Text Area" value="textArea"></v-radio>
          <v-radio label="Post Test" value="form"></v-radio>
        </v-radio-group>
        <v-text-field
          v-if="task.answer === 'form'"
          label="Post-test"
          v-model="task.postTest"
          outlined
          dense
        ></v-text-field>
        <v-row align="center">
          Timer:
          <v-switch class="ml-2" v-model="task.timer"></v-switch>
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
    };
  },
  methods: {
    valida() {
      let valid = this.$refs.form.validate();
      this.$emit("validate", valid);
    },
    resetVal() {
      this.$refs.form.resetValidation();
    }
  }
};
</script>

<style>
</style>