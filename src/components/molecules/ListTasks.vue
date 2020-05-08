<template>
  <v-row>
    <v-col>
      <v-data-table :headers="headers" :items="tasks" :items-per-page="5" class="elevation-1">
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-row justify="end">
              <v-btn color="success" dark @click="dialog = true">Add new task</v-btn>
              <FormDialog
                :task="task"
                :dialog="dialog"
                v-on:closeDialog="dialog = false"
                v-on:addTask="addTask()"
              />
            </v-row>
          </v-toolbar>
        </template>
        <template v-slot:item.timer="{ item }">
          <v-simple-checkbox v-model="item.timer" disabled></v-simple-checkbox>
        </template>
        <template v-slot:item.postTest="{ item }">
          <v-checkbox v-model="item.postTest" disabled></v-checkbox>
        </template>
        <template v-slot:item.tip="{ item }">
          <v-checkbox v-model="item.tip" disabled></v-checkbox>
        </template>
        <template v-slot:item.description="{ item }">
          <v-checkbox v-model="item.description" disabled></v-checkbox>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import FormDialog from "./FormDialog";

export default {
  props: ["tasks"],
  components: {
    FormDialog
  },
  data: () => ({
    dialog: false,
    editedItem: -1,
    headers: [
      {
        text: "Name",
        align: "start",
        sortable: false,
        value: "name"
      },
      { text: "Description", value: "description" },
      { text: "Tip", value: "tip" },
      { text: "Post Test", value: "postTest" },
      { text: "Timer", value: "timer" },
      { text: "Actions", value: "actions", sortable: false }
    ],
    task: {
      name: "",
      description: null,
      tip: null,
      postTest: null,
      timer: false
    }
  }),
  methods: {
    editItem(item) {
      this.editedIndex = this.tasks.indexOf(item);
      this.task = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      const index = this.tasks.indexOf(item);
      confirm("Are you sure you want to delete this task?") &&
        this.tasks.splice(index, 1);
    },
    addTask: function() {
      if (this.editedIndex > -1) {
        Object.assign(this.tasks[this.editedIndex], this.task);
      } else {
        this.tasks.push(this.task);
      }
      this.task = {
        name: "",
        description: null,
        tip: null,
        postTest: null,
        timer: false
      };
    }
  },
  computed: {
    exist(item) {
      if (item !== " ") return true;
      return false;
    }
  }
};
</script>

<style>
</style>