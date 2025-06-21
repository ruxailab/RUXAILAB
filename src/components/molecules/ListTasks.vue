<template>
  <div class="ma-0 pa-0">
    <v-data-table height="420" style="background: #f5f7ff; border-radius: 20px;" :headers="headers" :items="allTasks"
      :items-per-page="5">
      <!-- Table Header -->
      <template #top>
        <v-row class="ma-0">
          <v-col class="ml-2 mb-1 pa-4 pb-0">
            <p class="subtitleView">
              {{ $t('UserTestTable.titles.currentTasks') }}
            </p>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn variant="flat" rounded color="#f9a826" class="text-white" size="small" @click="dialog = true">
              Add new task
            </v-btn>
            <FormDialog v-model:dialog="dialog" v-model:task="task" @add-task="addTask" />
          </v-col>
        </v-row>
        <v-divider class="mb-4" />
      </template>

      <template #item.taskDescription="{ item }">
        <v-icon :color="item.taskDescription ? '#8EB995' : '#F47C7C'">
          {{ item.taskDescription ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>

      <template #item.taskTip="{ item }">
        <v-icon :color="item.taskTip ? '#8EB995' : '#F47C7C'">
          {{ item.taskTip ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>

      <template #item.postQuestion="{ item }">
        <v-icon :color="item.postQuestion ? '#8EB995' : '#F47C7C'">
          {{ item.postQuestion ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>

      <template #item.hasScreenRecord="{ item }">
        <v-icon :color="item.hasScreenRecord ? '#8EB995' : '#F47C7C'">
          {{ item.hasScreenRecord ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>

      <template #item.hasCamRecord="{ item }">
        <v-icon :color="item.hasCamRecord ? '#8EB995' : '#F47C7C'">
          {{ item.hasCamRecord ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>

      <template #item.hasEye="{ item }">
        <v-icon :color="item.hasEye ? '#8EB995' : '#F47C7C'">
          {{ item.hasEye ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>

      <template #item.hasAudioRecord="{ item }">
        <v-icon :color="item.hasAudioRecord ? '#8EB995' : '#F47C7C'">
          {{ item.hasAudioRecord ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
        </v-icon>
      </template>
      <!-- Edit and Delete Icons -->
      <template #item.actions="{ item }">
        <v-icon size="small" class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import FormDialog from './FormDialog.vue';

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['change']);

const store = useStore();

const dialog = ref(false);
const allTasks = ref([]);
const itemsTasks = ref([]);
const editedIndex = ref(-1);
const task = ref({
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
});

const headers = ref([
  {
    title: 'Name',
    align: 'start',
    sortable: false,
    value: 'taskName',
  },
  { title: 'Description', value: 'taskDescription' },
  { title: 'Tip', value: 'taskTip' },
  { title: 'Post question', value: 'postQuestion' },
  { title: 'Screen Record', value: 'hasScreenRecord' },
  { title: 'Camera', value: 'hasCamRecord' },
  { title: 'Eye Tracker', value: 'hasEye' },
  { title: 'Audio Record', value: 'hasAudioRecord' },
  { title: 'Actions', value: 'actions', sortable: false },
]);

const editItem = (item) => {
  editedIndex.value = allTasks.value.indexOf(item);
  task.value = { ...item };
  dialog.value = true;
};

const deleteItem = (item) => {
  const index = allTasks.value.indexOf(item);
  if (confirm('Are you sure you want to delete this task?')) {
    allTasks.value.splice(index, 1);
  }
};

const addTask = (newTask) => {
  if (editedIndex.value > -1) {
    Object.assign(props.tasks[editedIndex.value], newTask);
    editedIndex.value = -1
    emit('change');
  } else {
    store.dispatch('addItemsTasks', newTask).then(() => { });
    allTasks.value = Object.assign(
      store.getters.tasks,
      store.state.Tests.Test.testStructure.userTasks
    );
  }
  task.value = {
    taskName: '',
    taskDescription: null,
    taskTip: null,
    postQuestion: null,
    taskType: null,
    hasAudioRecord: false,
    hasScreenRecord: false,
    hasCamRecord: false,
  };
};

const setAllTasks = () => {
  allTasks.value = Object.assign(
    store.getters.tasks,
    store.state.Tests.Test.testStructure.userTasks
  );
  itemsTasks.value = [...props.tasks];
};

watch(
  () => props.tasks,
  () => {
    emit('change');
  },
  { deep: true }
);

onMounted(() => {
  setAllTasks();
});
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