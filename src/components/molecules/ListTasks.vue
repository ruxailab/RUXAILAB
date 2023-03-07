<template>
  <div class="ma-0 pa-0">
    <v-data-table 
      height="420"
      style="background: #f5f7ff"
      :headers="headers"
      :items="tasks"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-row>
          <v-col class="ml-2 mb-1 pa-4 pb-0">
            <p class="subtitleView">
              Current Tasks
            </p>
          </v-col>
          <v-col class="mr-2 mb-1 pb-0 pa-4">
            <v-row justify="end" class="ma-0 pa-0">
              <v-btn
                rounded
                color="#f9a826"
                class="white--text"
                small
                @click="dialog = true"
              >
                Add new task
              </v-btn>
              <FormDialog
                :task="task"
                :dialog="dialog"
                @closeDialog="dialog = false"
                @addTask="addTask()"
              />
            </v-row>
          </v-col>
        </v-row>
        <v-divider class="mb-4" />
      </template>
      <template v-slot:[`item.camera`]="{ item }">
        <v-simple-checkbox v-model="item.camera" disabled />
      </template>
      <template v-slot:[`item.recordScreen`]="{ item }">
        <v-simple-checkbox v-model="item.recordScreen" disabled />
      </template>
      <template v-slot:[`item.timer`]="{ item }">
        <v-simple-checkbox v-model="item.timer" disabled />
      </template>
      <template v-slot:[`item.postTest`]="{ item }">
        <v-checkbox v-model="item.postTest" disabled />
      </template>
      <template v-slot:[`item.tip`]="{ item }">
        <v-checkbox v-model="item.tip" disabled />
      </template>
      <template v-slot:[`item.description`]="{ item }">
        <v-checkbox v-model="item.description" disabled />
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import FormDialog from "./FormDialog"

export default {
  components: {
    FormDialog
  },
  props: {
    tasks: {
      type: Array,
      requeired: true,
      default: function() {
        return []
      }
    }
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
      { text: "Record Screen", value: "recordScreen" },
      { text: "Camera", value: "camera" },
      { text: "Actions", value: "actions", sortable: false }
    ],
    task: {
      name: "",
      description: null,
      tip: null,
      postTest: null,
      answer: null,
      timer: false,
      recordScreen: false,
      camera: false
    },
    // taskUser: []
  }),
  watch: {
    tasks() {
      this.$emit("change")
    }
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.tasks.indexOf(item)
      this.task = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      const index = this.tasks.indexOf(item)
      confirm("Are you sure you want to delete this task?") &&
        this.tasks.splice(index, 1)
    },
    addTask: function() {
      if (this.editedIndex > -1) {
        Object.assign(this.tasks[this.editedIndex], this.task)
        this.$emit("change")
      } else {
        this.tasks.push(this.task)
        console.log("tasksss", this.task)
        
        // this.tasks.forEach((tests) => {
        //   const taskUser = Array.from(tests)
        //   console.log(taskUser)
        //   return taskUser
        // })

        // taskUser.push(this.tasks)
        // console.log(taskUser)

        // this.object.heuristics.forEach((heuris) => {
        //   const questions = Array.from(heuris.questions)
        //   const arrayQuestions = []

        //   questions.forEach((el) => {
        //     arrayQuestions.push(
        //       Object.assign({}, { id: el.id, res: "", com: "" })
        //     )
        //   })
      }
      this.task = {
        name: "",
        description: null,
        tip: null,
        postTest: null,
        answer: null,
        timer: false,
        recordScreen: false,
        camera: false
      }
    }
  }
}
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
</style>