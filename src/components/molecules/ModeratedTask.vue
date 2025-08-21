<template>
  <v-container
    fluid
    class="pa-0"
  >
    <v-card class="elevation-2 rounded-lg pa-6">
      <v-row
        align="center"
        class="pa-4"
      >
        <v-col
          cols="12"
          sm="6"
        >
          <v-card-title
            class="text-h5 font-weight-bold mb-4"
            :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
          >
            {{ $t('UserTestTable.titles.currentTasks') }}
          </v-card-title>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          class="text-right"
        >
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            class="px-6 text-capitalize"
            rounded="lg"
            @click="dialog = true"
          >
            <v-icon start>
              mdi-plus-circle
            </v-icon>
            Add New Task
          </v-btn>
        </v-col>
      </v-row>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="allTasks"
          :items-per-page="5"
          class="elevation-0 rounded-lg"
          style="background: #FFFFFF; border: 1px solid #E5E7EB;"
          :no-data-text="$t('noTasks')"
        >
          <!-- Custom Column Templates -->
          <template #item.taskDescription="{ item }">
            <v-icon :color="item.taskDescription ? 'success' : 'error'">
              {{ item.taskDescription ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
            </v-icon>
          </template>

          <template #item.hasEye="{ item }">
            <v-icon :color="item.hasEye ? 'success' : 'error'">
              {{ item.hasEye ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
            </v-icon>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              color="accent"
              class="mr-2"
              @click="editItem(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              color="error"
              @click="deleteItem(item)"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <CreateTasksModeratedForm
        v-model:dialog="dialog"
        :task="task"
        @add-task="addTask"
      />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import CreateTasksModeratedForm from '../dialogs/CreateTasksModeratedForm.vue'

const store = useStore()

// Variables
const dialog = ref(false)
const allTasks = ref([])
const editedIndex = ref(-1)
const task = ref({})

const headers = ref([
  { title: 'Name', align: 'start', sortable: false, value: 'taskName', width: '10%' },
  { title: 'Description', value: 'taskDescription', sortable: false, align: 'center' },
  { title: 'Link', value: 'taskLink', sortable: false, align: 'center' },
  { title: 'Eye Tracker', value: 'hasEye', sortable: false, align: 'center' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '150px' },
])

// Computed
const test = computed(() => store.getters.test)

// Methods
const editItem = (item) => {
  editedIndex.value = allTasks.value.indexOf(item);
  task.value = { ...item };
  dialog.value = true;
}

const deleteItem = async (item) => {
  const index = allTasks.value.indexOf(item);
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      allTasks.value.splice(index, 1);
      await store.dispatch('setTasks', allTasks.value);
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  }
}

const addTask = async (newTask) => {
  try {
    if (editedIndex.value > -1) {
      Object.assign(allTasks.value[editedIndex.value], newTask)
      editedIndex.value = -1
      task.value = {}
    } else {
      allTasks.value.push(newTask)
    }

    await store.dispatch('setTasks', allTasks.value)
    dialog.value = false
  } catch (error) {
    console.error('Error adding/updating task:', error.message);
  }
}

const setAllTasks = () => {
  allTasks.value = test.value.testStructure.userTasks;
};

onMounted(() => {
  setAllTasks();
});
</script>

<style scoped>
.v-data-table {
  transition: all 0.3s ease;
}

.v-data-table :deep(.v-data-table__td) {
  padding: 12px;
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #1F2937;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}

.v-data-table :deep(.v-data-table__tr:hover) {
  background-color: #F8FAFC;
}
</style>
