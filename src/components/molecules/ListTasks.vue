<template>
  <div class="ma-0 pa-0">
    <v-data-table height="420" style="background: #f5f7ff; border-radius: 20px;" :headers="headers" :items="allTasks"
      :items-per-page="5" class="elevation-1">
      <!-- Table Header -->
      <template #top>
        <v-row
          align="center"
          class="ma-0"
        >
          <v-col class="ml-2 mb-1 pa-4 pb-0">
            <p class="subtitleView">
              {{ $t('UserTestTable.titles.currentTasks') }}
            </p>
          </v-col>
          <v-col>
            <v-row
              justify="end"
              class="mx-0"
            >
              <v-btn
                variant="flat"
                rounded
                color="#f9a826"
                class="text-white"
                size="small"
                @click="dialog = true"
              >
                Add new task
              </v-btn>
              <FormDialog
                v-model:dialog="dialog"
                v-model:task="task"
                @add-task="addTask"
              />
            </v-row>
          </v-col>
        </v-row>
        <v-divider class="mb-4" />
      </template>
      <!-- Checkbox Columns -->
      <template #[`item.hasEye`]="{ item }">
        <v-checkbox-btn
          v-model="item.hasEye"
          disabled
        />
      </template>
      <template #[`item.hasCamRecord`]="{ item }">
        <v-checkbox-btn
          v-model="item.hasCamRecord"
          disabled
        />
      </template>
      <template #[`item.hasAudioRecord`]="{ item }">
        <v-checkbox-btn
          v-model="item.hasAudioRecord"
          disabled
        />
      </template>
      <template #[`item.hasScreenRecord`]="{ item }">
        <v-checkbox-btn
          v-model="item.hasScreenRecord"
          disabled
        />
      </template>
      <!-- Text Columns -->
      <template #[`item.taskDescription`]="{ item }">
        {{ item.taskDescription || '-' }}
      </template>
      <template #[`item.taskTip`]="{ item }">
        {{ item.taskTip || '-' }}
      </template>
      <template #[`item.postQuestion`]="{ item }">
        {{ item.postQuestion || '-' }}
      </template>
      <!-- Edit and Delete Icons -->
      <template #[`item.actions`]="{ item }">
        <v-icon
          size="small"
          @click="deleteItem(item)"
        >
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
      required: true,
      default: function() {
        return []
      },
    },
  },
  emits: ['change'],
  data: () => ({
    dialog: false,
    itemsTasks: [],
    allTasks: [],
    editedItem: -1,
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
      taskLink: null,
      postQuestion: null,
      postForm: null,
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
      this.task = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      const index = this.allTasks.indexOf(item)
      if (confirm('Are you sure you want to delete this task?')) {
        this.allTasks.splice(index, 1)
      }
    },
    addTask(newTask) {
      if (this.editedIndex > -1) {
        Object.assign(this.tasks[this.editedIndex], newTask)
        this.$emit('change')
      } else {
        this.$store.dispatch('addItemsTasks', newTask).then(() => {})
        this.allTasks = Object.assign(
          this.$store.getters.tasks,
          this.$store.state.Tests.Test.testStructure.userTasks,
        )
      }
      this.task = {
        taskName: '',
        taskDescription: null,
        taskTip: null,
        postQuestion: null,
        taskType: null,
        hasAudioRecord: false,
        hasScreenRecord: false,
        hasCamRecord: false,
      }
      this.dialog = false
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