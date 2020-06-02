<template>
  <v-dialog v-model="dialog" width="70%" persistent>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>New task</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <FormTask :task="task" ref="form" @validate="submit" />
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col>
            <v-btn color="success" @click="validate()">Save</v-btn>
            <v-btn color="error" text @click="$emit('closeDialog'), reset()">Cancel</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FormTask from "../atoms/FormTask";

export default {
  props: ["dialog", "task"],
  components: {
    FormTask
  },
  data: () => ({}),
  methods: {
    validate() {
      this.$refs.form.valida();
    },
    submit(valid) {
      if (valid) {
        this.$emit("addTask");
        this.$emit("closeDialog");
        this.reset();
      }
    },
    reset() {
      this.$refs.form.resetVal();
    }
  }
};
</script>

<style>
</style>