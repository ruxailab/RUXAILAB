<template>
  <v-row justify="center">
    <v-col
      lg="12"
      class="px-0 py-5"
    >
      <v-card class="elevation-2 rounded-lg pa-md-6">
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
            class="text-sm-right"
          >
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              class="text-capitalize w-100 w-md-auto"
              rounded="lg"
              @click="() => { dialog = true; task = new Task(); }"
            >
              <v-icon start>
                mdi-plus-circle
              </v-icon>
              {{ $t('buttons.addNewTask') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="allTasks"
            :items-per-page="5"
            class="elevation-0"
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
              <span
                v-else
                class="text-grey-400"
              >{{ $t('UserTestTable.headers.na') }}</span>
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
import { useI18n } from 'vue-i18n';
import FormDialog from './FormDialog.vue';
import Task from '../models/Task';

const emit = defineEmits(['change']);
const store = useStore();
const { t } = useI18n();

const dialog = ref(false);
const allTasks = ref([]);
const editedIndex = ref(-1);
const task = ref(new Task());

const headers = ref([
  { title: t('UserTestTable.headers.name'), align: 'start', sortable: false, value: 'taskName', width: '10%' },
  { title: t('UserTestTable.headers.type'), value: 'taskType', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.estimatedTime'), value: 'estimatedTime', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.tip'), value: 'taskTip', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.screenRecord'), value: 'hasScreenRecord', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.camera'), value: 'hasCamRecord', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.eyeTracker'), value: 'hasEye', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.audioRecord'), value: 'hasAudioRecord', sortable: false, align: 'center' },
  { title: t('UserTestTable.headers.actions'), value: 'actions', sortable: false, align: 'center', width: '150px' },
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
      await store.dispatch('UserStudy/setTasks', allTasks.value);
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
    await store.dispatch('UserStudy/setTasks', allTasks.value);
    task.value = new Task();
    dialog.value = false;
  } catch (error) {
    console.error('Error adding/updating task:', error.message);
  }
};

const setAllTasks = () => {
  allTasks.value = Object.assign(
    store.getters['UserStudy/tasks'],
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
    'sus': 'info',
    'sart': 'deep blue'
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
    'sus': 'mdi-account-check',
    'sart': 'mdi-chart-areaspline'
  };
  return icons[taskType] || 'mdi-help-circle';
};

const getTaskTypeLabel = (taskType) => {
  const labels = {
    'no-answer': t('switches.noAnswer'),
    'text-area': t('switches.textArea'),
    'post-test': t('switches.postTest'),
    'post-form': t('switches.postForm'),
    'nasa-tlx': t('switches.nasa'),
    'sus': t('switches.sus'),
    'sart': t('switches.sart')
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
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12) !important;
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table :deep(.v-data-table__td) {
  padding: 12px;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.v-data-table :deep(.v-data-table__th) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.v-data-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.v-data-table :deep(.v-data-table__tr:nth-child(even)) {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

:global(.v-theme--dark) .v-data-table :deep(.v-data-table__tr:nth-child(even)) {
  background-color: rgba(var(--v-theme-on-surface), 0.03);
}

.v-data-table :deep(.v-data-table__tr:nth-child(even):hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.v-data-table :deep(.v-data-table__no-data) {
  color: rgba(var(--v-theme-on-surface), 0.6);
  padding: 48px 16px;
}

.v-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.v-chip {
  color: rgb(var(--v-theme-on-surface));
}

.v-data-table :deep(.v-icon) {
  transition: color 0.2s ease;
}

/* Dark mode specific adjustments */
@media (prefers-color-scheme: dark) {
  .v-data-table {
    border-color: rgba(var(--v-theme-on-surface), 0.24) !important;
  }
  
  .v-data-table :deep(.v-data-table__th) {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
    border-bottom-color: rgba(var(--v-theme-on-surface), 0.24);
  }
  
  .v-data-table :deep(.v-data-table__tr:hover) {
    background-color: rgba(var(--v-theme-on-surface), 0.06);
  }
  
  .v-data-table :deep(.v-data-table__tr:nth-child(even)) {
    background-color: rgba(var(--v-theme-on-surface), 0.03);
  }
}

:global(.v-theme--dark) {
  .v-data-table {
    border-color: rgba(var(--v-theme-on-surface), 0.24) !important;
  }
  
  .v-data-table :deep(.v-data-table__th) {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
    border-bottom-color: rgba(var(--v-theme-on-surface), 0.24);
  }
  
  .v-data-table :deep(.v-data-table__tr:hover) {
    background-color: rgba(var(--v-theme-on-surface), 0.06);
  }
  
  .v-data-table :deep(.v-data-table__tr:nth-child(even)) {
    background-color: rgba(var(--v-theme-on-surface), 0.03);
  }
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}

.v-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.v-data-table :deep(.v-data-table-footer) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.v-data-table :deep(.v-data-table__tr--selected) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.v-data-table :deep(.v-data-table__tr--selected:hover) {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
}

.v-data-table :deep(.v-data-table__loading) {
  background-color: rgba(var(--v-theme-surface), 0.8);
  color: rgb(var(--v-theme-on-surface));
}

.v-data-table :deep(.v-data-table-header__sort-badge) {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

@media (max-width: 768px) {
  .v-data-table {
    border: none !important;
  }
  
  .v-data-table :deep(.v-data-table__wrapper) {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
  }
  
  .v-data-table :deep(.v-data-table__td) {
    padding: 8px 12px;
  }
}
</style>