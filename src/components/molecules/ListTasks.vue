<template>
  <div class="ma-0 pa-0">
    <v-data-table
      height="420"
      style="background: #f5f7ff; border-radius: 20px;"
      :headers="headers"
      :items="allTasks"
      :items-per-page="5"
      class="elevation-1"
    >
      <!-- Table Header -->
      <template v-slot:top>
        <v-row align="center" class="ma-0">
          <v-col class="ml-2 mb-1 pa-4 pb-0">
            <p class="subtitleView">
              {{ $t('UserTestTable.titles.currentTasks') }}
            </p>
          </v-col>
          <v-col>
            <v-row justify="end" class="mx-0">
              <v-btn
                depressed
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
      <!-- Checkbox Columns -->
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
      <template v-slot:[`item.postQuestion`]="{ item }">
        <v-checkbox v-model="item.postQuestion" disabled />
      </template>
      <template v-slot:[`item.taskTip`]="{ item }">
        <v-checkbox v-model="item.taskTip" disabled />
      </template>
      <template v-slot:[`item.taskDescription`]="{ item }">
        <v-checkbox v-model="item.taskDescription" disabled />
      </template>
      <!-- Edit and Delete icons -->
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
import FormDialog from './FormDialog'

export default {
  components: {
    FormDialog,
  },
  props: {
    tasks: {
      type: Array,
      requeired: true,
      default: function() {
        return []
      },
    },
  },
  data: () => ({
    dialog: false,
    itemsTasks: [],
    allTasks: [],
    editedIndex: -1,
    //set headers properties
    headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: false,
        value: 'taskName',
      },
      { text: 'Description', value: 'taskDescription' },
      { text: 'Tip', value: 'taskTip' },
      { text: 'Post question', value: 'postQuestion' },
      { text: 'Screen Record', value: 'hasScreenRecord' },
      { text: 'Camera', value: 'hasCamRecord' },
      { text: 'Eye Tracker', value: 'hasEye' },
      { text: 'Audio Record', value: 'hasAudioRecord' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    // initialize task properties
    task: {
      taskName: '',
      taskDescription: null,
      taskTip: null,
      postQuestion: null,
      taskType: null,
      hasAudioRecord: false,
      hasScreenRecord: false,
      hasCamRecord: false,
    },
  }),
  watch: {
    tasks() {
      this.$emit('change')
    },
  },
  mounted() {
    this.setAllTasks()
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.allTasks.indexOf(item)
      this.task = JSON.parse(JSON.stringify(item)) // Deep copy to avoid reference issues
      this.dialog = true
    },
    deleteItem(item) {
      const index = this.allTasks.indexOf(item)
      if (confirm('Are you sure you want to delete this task?')) {
        // Show toast notification for deletion
        this.$toast.info('Deleting task...', { timeout: 3000 })
        
        // Remove from local array
        this.allTasks.splice(index, 1)
        
        // Save changes
        this.saveTaskChanges('Task deleted successfully!')
      }
    },
    addTask() {
      // Show appropriate toast message
      const actionMsg = this.editedIndex > -1 ? 'Updating task...' : 'Adding new task...'
      this.$toast.info(actionMsg, { timeout: 3000 })

      if (this.editedIndex > -1) {
        // Update existing task
        // First make a copy of the current tasks array
        const updatedTasks = [...this.allTasks]
        // Replace the task at the specified index
        updatedTasks[this.editedIndex] = JSON.parse(JSON.stringify(this.task))
        // Update the allTasks array
        this.allTasks = updatedTasks
        
        // Save changes
        this.saveTaskChanges('Task updated successfully!')
      } else {
        // Add new task
        const newTask = JSON.parse(JSON.stringify(this.task))
        this.allTasks.push(newTask)
        // Update store
        this.$store.dispatch('addItemsTasks', newTask)
        
        // Save changes
        this.saveTaskChanges('Task added successfully!')
      }
      
      // Reset form
      this.resetForm()
    },
    resetForm() {
      this.task = {
        taskName: '',
        taskDescription: null,
        taskTip: null,
        postQuestion: null,
        taskType: null,
        hasAudioRecord: false,
        hasScreenRecord: false,
        hasCamRecord: false,
        hasEye: false
      }
      this.editedIndex = -1
      this.dialog = false
    },
    saveTaskChanges(successMessage) {
      // Update the store
      this.$store.dispatch('setTasks', this.allTasks)
      
      // Update the test structure
      this.$store.commit('SET_TEST_STRUCTURE', { userTasks: this.allTasks })
      
      // Save changes to database - get current test and update it
      const currentTest = this.$store.getters.test
      if (currentTest) {
        // Update test structure with modified tasks
        currentTest.testStructure = {
          ...currentTest.testStructure,
          userTasks: this.allTasks
        }
        // Update the test's updateDate
        currentTest.updateDate = Date.now()
        
        // Save to database
        this.$store.dispatch('updateTest', currentTest)
          .then(() => {
            this.$toast.success(successMessage, { timeout: 3000 })
          })
          .catch(error => {
            this.$toast.error(`Error: ${error.message}`, { timeout: 5000 })
          })
      }
    },
    setAllTasks() {
      this.allTasks = Object.assign(
        this.$store.getters.tasks,
        this.$store.state.Tests.Test.testStructure.userTasks,
      )
      this.itemsTasks = [...this.tasks]
    },
  },
}
</script>

<style scoped>
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
</style>
