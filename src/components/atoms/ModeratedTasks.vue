<template>
  <div>
    <v-card
      v-if="tasks.length === 0"
      style="background: #f5f7ff; min-height: 150px"
      flat
      class="cards mt-2"
    >
      <v-row justify="center">
        <v-col cols="12" class="pa-5">
          <span class="cardsTitle ml-5">Tasks</span>
          <br />
          <span class="cardsSubtitle ml-5 mb-1"
            >Create tasks for your evaluators</span
          >
          <v-row justify="center">
            <v-col cols="8">
              <v-card
                class="mt-4"
                rounded="xl"
                @click="openAddTaskModal"
                outlined
                elevation="0"
                color="grey lighten-2"
              >
                <p class="text-subtitle-1 text-center ma-2">
                  <v-icon>mdi-plus-circle</v-icon>
                  Add your first task
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
    <draggable
      v-model="tasks"
      group="people"
      @start="drag = true"
      @end="drag = false"
    >
      <v-card
        v-for="(task, index) in tasks"
        :key="index"
        style="background: #f5f7ff"
        flat
        class="cards mb-5"
      >
        <v-col cols="12" class="pb-0 px-5 pt-4">
          <v-icon style="cursor: pointer;">mdi-drag</v-icon>
          <span class="cardsTitle ml-3">{{ task.name }}</span>
          <br />
          <span class="cardsSubtitle ml-9">Task Description</span>
          <v-icon class="delete-icon" @click="deleteTask(index)"
            >mdi-delete</v-icon
          >
        </v-col>
        <v-textarea
          draggable="false"
          v-model="task.description"
          rows="3"
          outlined
          color="orange"
          class="mx-14 mt-3"
          placeholder="Write what you want to task..."
        ></v-textarea>
        <v-row justify="center">
          <v-btn
            fab
            depressed
            dark
            color="rgb(249, 168, 38)"
            style="margin-bottom: -30px; z-index: 3;"
            @click="openAddTaskModal(index)"
          >
            <v-icon size="35">mdi-plus</v-icon>
          </v-btn>
        </v-row>
      </v-card>
    </draggable>

    <!-- Modal for adding a new task -->
    <v-dialog v-model="addTaskModal" max-width="600">
      <v-card class="cards">
        <v-col> </v-col>
        <v-card-text>
          <v-text-field
            v-model="newTask.name"
            outlined
            label="Task Name"
            color="orange"
          ></v-text-field>
          <v-textarea
            v-model="newTask.description"
            outlined
            label="Task Description"
            color="orange"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="addTask" dark color="orange">Add Task</v-btn>
          <v-btn @click="closeAddTaskModal" dark color="red">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  data: () => ({
    tasks: [],
    drag: false,
    addTaskModal: false,
    taskIndex: null,
    newTask: {
      name: '',
      description: '',
    },
  }),

  components: { draggable },

  computed: {
    tasksStore() {
      return this.$store.getters.tasks
    },
    testStructure() {
      return this.$store.state.Tests.Test.testStructure
    },
  },

  mounted() {
    this.getTasks()
  },

  methods: {
    openAddTaskModal(taskIndex) {
      this.taskIndex = taskIndex
      this.addTaskModal = true
    },
    closeAddTaskModal() {
      this.taskIndex = null
      this.addTaskModal = false
      this.newTask = { name: '', description: '' }
    },
    addTask() {
      if (
        this.newTask.name.trim() !== '' &&
        this.newTask.description.trim() !== ''
      ) {
        const insertIndex =
          this.taskIndex !== null ? this.taskIndex + 1 : this.tasks.length

        this.tasks.splice(insertIndex, 0, {
          name: this.newTask.name,
          description: this.newTask.description,
        })
        this.closeAddTaskModal()
      }
    },

    getTasks() {
      if (this.testStructure.userTasks) {
        this.$store.dispatch('setTasks', this.testStructure.userTasks)
        this.tasks = this.testStructure.userTasks
      } else if (this.tasksStore) {
        this.tasks = this.tasksStore
      }
    },

    saveTasks() {
      this.$store.dispatch('setTasks', this.tasks)
      this.test.testStructure.userTasks = this.tasks
    },

    deleteTask(index) {
      this.tasks.splice(index, 1)
    },
  },
  watch: {
    tasks: {
      handler() {
        this.saveTasks()
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
.cards {
  border-radius: 20px;
}
.cardsTitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardsSubtitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.delete-icon {
  position: absolute;
  top: 20px;
  right: 25px;
  cursor: pointer;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
