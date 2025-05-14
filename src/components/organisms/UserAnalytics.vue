<template>
  <div v-if="answers">
    <IntroAnalytics
      v-if="answers != null && intro"
      @go-to-coops="goToCoops"
    />
    <ShowInfo
      v-if="answers != null && !intro"
      title="Analytics"
    >
      <template #content>
        <div>
          <v-card
            flat
            class="task-container"
          >
            <v-row class="ma-0 pa-0">
              <!-- Tasks List -->
              <v-col
                class="ma-0 pa-0"
                cols="3"
              >
                <v-list
                  v-model="taskSelect"
                  density="compact"
                  class="list-scroll"
                  color="#fca326"
                >
                  <v-list-subheader class="py-3 text-black">
                    Tasks
                  </v-list-subheader>
                  <v-divider />
                  <v-list-item
                    v-for="(item, i) in testTasks"
                    :key="i"
                  >
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-divider
                vertical
                inset
              />

              <!-- Answer List -->
              <v-col
                class="ma-0 pa-0"
                cols="9"
              >
                <v-data-table
                  :headers="dataHeaders"
                  :items="taskAnswers"
                  class="pa-0"
                >
                  <template #item.userDocId="{ item }">
                    <span>{{ getCooperatorEmail(item.userDocId) }}</span>
                  </template>
                  <template #item.actions="{ item }">
                    <v-btn
                      color="orange"
                      variant="text"
                      @click="viewAnswers(item)"
                    >
                      Show Answers
                    </v-btn>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </template>
    </ShowInfo>
    <template>
      <v-dialog
        v-model="showDialog"
        max-width="600"
        fullscreen
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar
            color="orange"
            class="pl-3"
          >
            <span class="text-h5">Answer and Observation</span>
            <v-btn
              class="ml-auto"
              icon
              @click="showDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text style="background-color: #E8EAF2;">
            <v-row v-if="dialogItem">
              <v-col
                v-if="dialogItem.preTestAnswer.length > 0"
                :cols="
                  dialogItem.tasks[taskSelect].taskTime != '' ? '10' : '12'
                "
                class="pt-8"
              >
                <span
                  class="cardsTitle ma-3"
                  style="color: #252525"
                >Variables</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <span
                      v-for="(question, index) in testStructure.preTest"
                      :key="index"
                      class="ma-1 text-subtitle-1"
                      style="color: #252525"
                    >
                      <strong>{{ question.title }}</strong> :
                      {{ dialogItem.preTestAnswer[index].answer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].taskTime != null"
                cols="2"
                class="pt-8"
              >
                <span
                  class="t-5 font-weight-bold text-h6"
                  style="color: #252525"
                >Task Time</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <p class="text-h6">
                      {{ formatTime(dialogItem.tasks[taskSelect].taskTime) }}
                    </p>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.postTestAnswer.length > 0"
                cols="12"
                class="pt-8"
              >
                <span
                  class="cardsTitle ma-3"
                  style="color: #252525"
                >Post-Test Answer</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <span
                      v-for="(question, index) in testStructure.postTest"
                      :key="index"
                      class="ma-1 text-subtitle-1"
                      style="color: #252525"
                    >
                      <strong>{{ question.title }}</strong> :
                      {{ dialogItem.postTestAnswer[index].answer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].taskAnswer != ''"
                :cols="
                  dialogItem.tasks[taskSelect].taskObservations != ''
                    ? '6'
                    : '12'
                "
                class="mt-4"
              >
                <span
                  class="cardsTitle ma-3"
                  style="color: #252525"
                >Answer</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <span>
                      {{ dialogItem.tasks[taskSelect].taskAnswer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].postAnswer != ''"
                cols="12"
                class="mt-4"
              >
                <span
                  class="cardsTitle ma-3"
                  style="color: #252525"
                >Post Question</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <strong>{{
                      testStructure.userTasks[taskSelect].postQuestion
                    }}</strong>
                    :
                    <span>
                      {{ dialogItem.tasks[taskSelect].postAnswer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                v-if="dialogItem.tasks[taskSelect].taskObservations != ''"
                :cols="
                  dialogItem.tasks[taskSelect].taskAnswer != '' ? '6' : '12'
                "
                class="mt-4"
              >
                <span
                  class="cardsTitle ma-3"
                  style="color: #252525"
                >Observation</span>
                <v-card
                  border
                  rounded="xl"
                >
                  <div class="ma-6">
                    <span>
                      {{ dialogItem.tasks[taskSelect].taskObservations }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <div v-if="dialogItem">
                <v-col
                  v-if="dialogItem.tasks[taskSelect].webcamRecordURL"
                  cols="12"
                  class="d-flex align-center justify-center flex-column"
                >
                  <span
                    class="cardsTitle ma-3"
                    style="color: #252525"
                  >Web Cam Record</span>
                  <video
                    v-if="dialogItem"
                    class="my-3"
                    :src="dialogItem.tasks[taskSelect].webcamRecordURL"
                    controls
                    height="260"
                  />
                </v-col>
              </div>
              <div v-if="dialogItem">
                <v-col
                  v-if="dialogItem.tasks[taskSelect].screenRecordURL"
                  cols="12"
                  class="d-flex align-center justify-center flex-column"
                >
                  <span
                    class="cardsTitle ma-3"
                    style="color: #252525"
                  >Screen Record</span>
                  <video
                    class="my-3"
                    :src="dialogItem.tasks[taskSelect].screenRecordURL"
                    controls
                    height="260"
                  />
                </v-col>
              </div>
              <div v-if="dialogItem">
                <v-col
                  v-if="dialogItem.tasks[taskSelect].audioRecordURL"
                  cols="12"
                  class="d-flex align-center justify-center flex-column"
                >
                  <span
                    class="cardsTitle ma-3"
                    style="color: #252525"
                  >
                    Audio Record
                  </span>
                  <audio
                    class="mx-auto my-3"
                    :src="dialogItem.tasks[taskSelect].audioRecordURL"
                    controls
                  />
                </v-col>
              </div>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import ShowInfo from '@/components/organisms/ShowInfo.vue';

const store = useStore();

const emit = defineEmits(['goToCoops']);

const showDialog = ref(false);
const dialogItem = ref(null);
const search = ref('');
const taskSelect = ref(0);
const testTasks = ref([]);
const taskAnswers = ref([]);
const intro = ref(null);
const dataHeaders = ref([
  {
    title: 'Email',
    value: 'userDocId',
  },
  {
    title: 'Actions',
    sortable: false,
    value: 'actions',
  },
]);

const test = computed(() => store.getters.test);
const testStructure = computed(() => store.state.Tests.Test.testStructure);
const tasksAnswer = computed(() => store.getters.testAnswerDocument);
const answers = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return [];
  }
  return store.getters.testAnswerDocument.taskAnswers;
});
const loading = computed(() => !Object.values(answers.value).length);

const formatTime = (time) => {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const goToCoops = () => {
  emit('goToCoops');
};

const getCooperatorEmail = (userDocId) => {
  let cooperatorEmail = null;
  if (test.value.cooperators && Array.isArray(test.value.cooperators)) {
    for (const element of test.value.cooperators) {
      if (element && element.email && element.userDocId === userDocId) {
        cooperatorEmail = element.email;
      }
    }
  }
  return cooperatorEmail;
};

const viewAnswers = (item) => {
  dialogItem.value = item;
  showDialog.value = true;
};

onMounted(() => {
  let i = 0;
  testStructure.value.userTasks.forEach((task) => {
    testTasks.value[i] = task.taskName;
    i++;
  });
  let c = 0;
  for (const key in answers.value) {
    taskAnswers.value[c] = answers.value[key];
    c++;
  }
});
</script>

<style scoped>
.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.list-scroll {
  height: 508px;
  overflow: auto;
}

/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}

/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}

/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
  /* background: #515069; */
}
</style>