<template>
  <div>
    <v-card
      v-if="tasks.length === 0"
      style="background: #f5f7ff; min-height: 150px"
      flat
      class="cards mt-2"
    >
      <v-row justify="center">
        <v-col
          cols="12"
          class="pa-5"
        >
          <span class="cardsTitle ml-5">Tasks</span>
          Got error generating code: Unexpected reserved word 'import'

          <br>
          <span class="cardsSubtitle ml-5 mb-1">Create tasks for your evaluators</span>
          <v-row justify="center">
            <v-col cols="8">
              <v-card
                class="mt-4"
                rounded="xl"
                border
                elevation="0"
                color="grey-lighten-2"
                @click="openAddTaskModal"
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
      <template #item="{ element: task, index }">
        <v-card
          :key="index"
          style="background: #f5f7ff"
          flat
          class="cards mb-5"
        >
          <v-col
            cols="12"
            class="pb-0 px-5 pt-4"
          >
            <v-icon style="cursor: pointer;">
              mdi-drag
            </v-icon>
            <span class="cardsTitle ml-3">{{ task.taskName }}</span>
            <br>
            <span class="cardsSubtitle ml-9">Task Description</span>
            <v-icon
              class="delete-icon"
              @click="deleteTask(index)"
            >
              mdi-delete
            </v-icon>
          </v-col>
          <v-textarea
            v-model="task.taskDescription"
            draggable="false"
            rows="3"
            variant="outlined"
            color="orange"
            class="mx-14 mt-3"
            placeholder="Write what you want to task..."
          />
          <v-row justify="center">
            <v-btn
              icon
              variant="flat"
              color="rgb(249, 168, 38)"
              size="50"
              style="margin-bottom: 20px; z-index: 3;"
              @click="openAddTaskModal(index)"
            >
              <v-icon size="40">
                mdi-plus
              </v-icon>
            </v-btn>
          </v-row>
        </v-card>
      </template>
    </draggable>

    <!-- Modal for adding a new task -->
    <v-dialog
      v-model="addTaskModal"
      max-width="600"
      @click:outside="resetForm"
    >
      <v-card class="cards">
        <v-col />
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-text-field
              v-model="newTask.taskName"
              variant="outlined"
              label="Task Name"
              color="orange"
              :rules="[(v) => !!v || 'Required field']"
              required
            />
            <v-textarea
              ref="taskDescription"
              v-model="newTask.taskDescription"
              variant="outlined"
              label="Task Description"
              color="orange"
              :rules="[(v) => !!v || 'Required field']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="red"
            @click="closeAddTaskModal"
          >
            <v-icon class="mr-1">
              mdi-close
            </v-icon>Cancel
          </v-btn>
          <v-btn
            color="orange"
            @click="addTask"
          >
            <v-icon class="mr-1">
              mdi-content-save
            </v-icon>Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import draggable from 'vuedraggable';

const store = useStore();

const tasks = ref([]);
const drag = ref(false);
const addTaskModal = ref(false);
const taskIndex = ref(null);
const valid = ref(false);
const newTask = ref({
  taskName: '',
  taskDescription: '',
  taskStatus: 'closed',
});
const form = ref(null);

const tasksStore = computed(() => store.getters.tasks || []);
const testStructure = computed(
  () => store.state.Tests?.Test?.testStructure || { userTasks: [] }
);

watch(
  tasks,
  () => {
    saveTasks();
  },
  { deep: true }
);

const openAddTaskModal = (index = null) => {
  taskIndex.value = index;
  addTaskModal.value = true;
};

const closeAddTaskModal = () => {
  taskIndex.value = null;
  addTaskModal.value = false;
  newTask.value = { taskName: '', taskDescription: '', taskStatus: 'closed' };
  resetForm();
};

const resetForm = () => {
  if (form.value) {
    form.value.resetValidation();
  }
};

const addTask = () => {
  if (
    newTask.value.taskName.trim() !== '' &&
    newTask.value.taskDescription.trim() !== ''
  ) {
    const insertIndex =
      taskIndex.value !== null ? taskIndex.value + 1 : tasks.value.length;

    tasks.value.splice(insertIndex, 0, {
      taskName: newTask.value.taskName,
      taskDescription: newTask.value.taskDescription,
      taskStatus: 'closed',
    });
    closeAddTaskModal();
  } else {
    form.value.validate();
  }
};

const getTasks = () => {
  if (testStructure.value?.userTasks) {
    store.dispatch('setTasks', testStructure.value.userTasks);
    tasks.value = testStructure.value.userTasks;
  } else if (tasksStore.value) {
    tasks.value = tasksStore.value;
  } else {
    tasks.value = [];
  }
};

const saveTasks = () => {
  store.dispatch('setTasks', tasks.value);
  if (store.state.Tests?.Test?.testStructure) {
    store.state.Tests.Test.testStructure.userTasks = tasks.value;
  }
};

const deleteTask = (index) => {
  tasks.value.splice(index, 1);
};

onMounted(() => {
  getTasks();
});
</script>

<style scoped>
.cards {
  border-radius: 20px;
}
.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardsSubtitle {
  color: #455a64;
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
.v-text-field--outlined :deep(fieldset) {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>