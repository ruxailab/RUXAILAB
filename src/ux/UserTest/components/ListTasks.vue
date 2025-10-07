<template>
  <v-row justify="center">
    <v-col
      lg="12"
      class="px-0 py-5"
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
              class="text-h5 font-weight-bold pa-0"
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
              @click="() => {dialog = true; task = new Task();}"
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
            :no-data-text="$t('UserTestTable.messages.noTasks')"
          >
            <!-- Custom Column Templates -->
            <template #item.taskType="{ item }">
              <v-chip
                v-if="item.taskType"
                :color="getTaskTypeColor(item.taskType)"
                size="small"
                variant="flat"
              >
                <v-icon
                  start
                  size="small"
                >
                  {{ getTaskTypeIcon(item.taskType) }}
                </v-icon>
                {{ getTaskTypeLabel(item.taskType) }}
              </v-chip>
              <span v-else class="text-grey-400">N/A</span>
            </template>

            <template #item.taskDescription="{ item }">
              <v-icon :color="item.taskDescription ? 'success' : 'error'">
                {{ item.taskDescription ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
              </v-icon>
            </template>

            <template #item.taskTip="{ item }">
              <v-icon :color="item.taskTip ? 'success' : 'error'">
                {{ item.taskTip ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
              </v-icon>
            </template>

          

            <template #item.hasScreenRecord="{ item }">
              <v-icon :color="item.hasScreenRecord ? 'success' : 'error'">
                {{ item.hasScreenRecord ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
              </v-icon>
            </template>

            <template #item.hasCamRecord="{ item }">
              <v-icon :color="item.hasCamRecord ? 'success' : 'error'">
                {{ item.hasCamRecord ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
              </v-icon>
            </template>

            <template #item.hasEye="{ item }">
              <v-icon :color="item.hasEye ? 'success' : 'error'">
                {{ item.hasEye ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
              </v-icon>
            </template>

            <template #item.hasAudioRecord="{ item }">
              <v-icon :color="item.hasAudioRecord ? 'success' : 'error'">
                {{ item.hasAudioRecord ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
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
        <FormDialog
          v-model:dialog="dialog"
          v-model:task="task"
          @add-task="addTask"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import FormDialog from './FormDialog.vue';
import Task from '../models/Task';

const emit = defineEmits(['change']);
const store = useStore();

const dialog = ref(false);
const allTasks = ref([]);
const editedIndex = ref(-1);
const task = ref(new Task());

const headers = ref([
  { title: 'Name', align: 'start', sortable: false, value: 'taskName', width: '10%' },
  { title: 'Type', value: 'taskType', sortable: false, align: 'center' },
  { title: 'Estimated Time (min)', value: 'estimatedTime', sortable: false, align: 'center' },
  { title: 'Tip', value: 'taskTip', sortable: false, align: 'center' },
  { title: 'Screen Record', value: 'hasScreenRecord', sortable: false, align: 'center' },
  { title: 'Camera', value: 'hasCamRecord', sortable: false, align: 'center' },
  { title: 'Eye Tracker', value: 'hasEye', sortable: false, align: 'center' },
  { title: 'Audio Record', value: 'hasAudioRecord', sortable: false, align: 'center' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '150px' },
]);

const editItem = (item) => {
  editedIndex.value = allTasks.value.indexOf(item);
  task.value = item;
  dialog.value = true;
};

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
};

const addTask = async (newTask) => {
  try {
    if (editedIndex.value > -1) {

      Object.assign(allTasks.value[editedIndex.value], newTask.toFirestore());
      editedIndex.value = -1;
    } else {
      allTasks.value.push(newTask.toFirestore());
    }
    await store.dispatch('setTasks', allTasks.value);
    task.value = new Task();
    dialog.value = false;
  } catch (error) {
    console.error('Error adding/updating task:', error.message);
  }
};

const setAllTasks = () => {
  allTasks.value = Object.assign(
    store.getters.tasks,
    store.state.Tests.Test.testStructure.userTasks
  );
};

// Helper functions for task type chips
const getTaskTypeColor = (taskType) => {
  const colors = {
    'no-answer': 'grey',
    'text-area': 'primary',
    'post-test': 'secondary',
    'post-form': 'success',
    'nasa-tlx': 'warning',
    'sus': 'info'
  };
  return colors[taskType] || 'grey';
};

const getTaskTypeIcon = (taskType) => {
  const icons = {
    'no-answer': 'mdi-minus-circle',
    'text-area': 'mdi-text-box',
    'post-test': 'mdi-clipboard-check',
    'post-form': 'mdi-form-select',
    'nasa-tlx': 'mdi-rocket',
    'sus': 'mdi-account-check'
  };
  return icons[taskType] || 'mdi-help-circle';
};

const getTaskTypeLabel = (taskType) => {
  const labels = {
    'no-answer': 'No Answer',
    'text-area': 'Text Area',
    'post-test': 'Post Test',
    'post-form': 'Post Form',
    'nasa-tlx': 'NASA-TLX',
    'sus': 'SUS'
  };
  return labels[taskType] || 'Unknown';
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
