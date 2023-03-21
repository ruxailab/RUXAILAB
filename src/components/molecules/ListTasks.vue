<template>
  <div class="ma-0 pa-0">
    <v-data-table 
      height="420"
      style="background: #f5f7ff"
      :headers="headers"
      :items="itemsTasks"
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
      <template v-slot:[`item.hasEye`]="{ item }">
        <v-simple-checkbox v-model="item.hasEye" disabled />
      </template>
      <template v-slot:[`item.hasCamRecord`]="{ item }">
        <v-simple-checkbox v-model="item.hasCamRecord" disabled />
      </template>
      <template v-slot:[`item.hasAudioRecord`]="{ item }">
        <v-simple-checkbox v-model="item.hasAudioRecord" disabled />
      </template>
      <template v-slot:[`item.hasScreenRecord`]="{ item }">
        <v-simple-checkbox v-model="item.hasScreenRecord" disabled />
      </template>
      <template v-slot:[`item.hasTimer`]="{ item }">
        <v-simple-checkbox v-model="item.hasTimer" disabled />
      </template>
      <template v-slot:[`item.hasPost`]="{ item }">
        <v-checkbox v-model="item.hasPost" disabled />
      </template>
      <template v-slot:[`item.taskTip`]="{ item }">
        <v-checkbox v-model="item.taskTip" disabled />
      </template>
      <template v-slot:[`item.taskDescription`]="{ item }">
        <v-checkbox v-model="item.taskDescription" disabled />
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
    itemsTasks: [],
    editedItem: -1,
    headers: [
      {
        text: "Name",
        align: "start",
        sortable: false,
        value: "taskName"
      },
      { text: "Description", value: "taskDescription" },
      { text: "Tip", value: "taskTip" },
      { text: "Post Test", value: "hasPost" },
      { text: "Timer", value: "hasTimer" },
      { text: "Screen Record", value: "hasScreenRecord" },
      { text: "Camera", value: "hasCamRecord" },
      { text: "Eye Tracker", value: "hasEye" },
      { text: "Audio Record", value: "hasAudioRecord" },
      { text: "Actions", value: "actions", sortable: false }
    ],
    task: {
      taskName: "",
      taskDescription: null,
      taskTip: null,
      hasPost: null,
      taskType: null,
      hasTimer: false,
      hasAudioRecord: false,
      hasScreenRecord: false,
      hasCamRecord: false
    },
  }),
  computed: {
    allTasks() {
      return this.$store.getters.tasks
    }
  },
  watch: {
    tasks() {
      this.$emit("change")
    }
  },
  mounted() {
    this.itemsTasks = [...this.tasks]
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
        //this.itemsTasks.push(this.task)
        //console.log("itemsTasks", this.itemsTasks)
        this.$store.dispatch('addItemsTasks', this.task).then( () => {
          console.log("allTasks", this.allTasks)
        })
                 
      }
      this.task = {
        taskName: "",
        taskDescription: null,
        taskTip: null,
        hasPost: false,
        taskType: null,
        hasTimer: false,
        hasAudioRecord: false,
        hasScreenRecord: false,
        hasCamRecord: false
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