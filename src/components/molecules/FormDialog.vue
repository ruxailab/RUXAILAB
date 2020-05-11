<template>
  <v-dialog v-model="dialog" width="70%" persistent
>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>New task</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <FormTask :task="task" />
      </v-card-text>
      <v-card-actions>
        <v-row justify="center">
          <v-col>
            <v-btn color="success" @click="$emit('addTask'),$emit('closeDialog')">Save</v-btn>
            <v-btn color="error" text @click="$emit('closeDialog')">Cancel</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FormTask from "../atoms/FormTask";

export default {
  props: ['dialog','task'],
  components: {
    FormTask
  },
  data: () => ({
   
  })
};
</script>

<style>
</style>