<template>
  <v-row class="ma-0 pa-0">
    <v-col class="pt-0">
      <v-data-table
        height="420px"
        class="dataCard"
        :headers="headers"
        :items="tasks"
        :items-per-page="5"
      >
        <template v-slot:top>
          <v-row>
            <v-col class="ml-2 mb-1 pa-4 pb-0">
              <p class="subtitleView">Current Tasks</p>
            </v-col>
            <v-col class="mr-2 mb-1 pb-0 pa-4">
              <v-row justify="end" class="ma-0 pa-0">
                <v-btn
                  rounded
                  color="#f9a826"
                  class="white--text"
                  small
                  @click="dialog = true"
                >Add new task</v-btn>
                <FormDialog
                  :task="task"
                  :dialog="dialog"
                  v-on:closeDialog="dialog = false"
                  v-on:addTask="addTask()"
                />
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="mb-4"></v-divider>
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
      answer: null,
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
        answer: null,
        timer: false
      };
    }
  },
  computed: {
    exist(item) {
      if (item !== " ") return true;
      return false;
    }
  },
  watch: {
    tasks() {
      this.$emit("change");
    }
  }
};
</script>

<style scoped>
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.dataCard {
  background-color: #f5f7ff !important;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
}
</style>