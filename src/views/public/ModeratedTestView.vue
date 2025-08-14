<template>
  <div>
    <v-container fluid class="pa-0">

      <!-- Start Screen -->
      <v-row v-if="test && start" class="start-screen background-img pa-0 ma-0" align="center">
        <v-col md="8" class="ma-5 pa-5">
          <img src="@/assets/ruxailab-long-crop-white.png" alt="RUXAILAB" class="mb-10" style="max-width: 300px;" />
          <h1 class="text-h2 font-weight-bold text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body-1 mb-5 text-white text-justify">
            {{ test.testDescription }}
          </p>
          <v-btn color="white" variant="outlined" rounded x-large @click="startTest">
            Start Test
          </v-btn>
        </v-col>
      </v-row>

      <!--Answer Test Screen-->
      <v-row v-else class="main-test-interface pa-0 ma-0">
        <v-col ref="rightView" class="right-view pa-6">
          <!-- Video Call Component -->
          <div v-if="displayVideoCallComponent">
            <VideoCall :roomId="roomId" :caller="isUserTestAdmin" />
            <v-btn @click="displayVideoCallComponent = false">
              Proceed to next step
            </v-btn>
          </div>

          <!--Sticky Stepper to follow Progress-->
          <v-row v-if="globalIndex >= 1 || displayVideoCallComponent" class="stepper-row sticky-stepper">
            <v-col cols="12">
              <v-stepper :model-value="stepperValue" class="main-stepper rounded-xl elevation-3"
                :class="{ 'stepper-animate': globalIndex === 4 && test?.testStructure?.userTasks?.length > 1 }"
                style="visibility:visible">
                <v-stepper-header>
                  <v-stepper-item color="white" value="1" title="Consent" :complete="stepperValue >= 1"
                    :color="stepperValue < 1 ? 'primary' : 'success'" complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item color="white" value="2" title="Pre-test" :complete="stepperValue >= 2"
                    :color="stepperValue < 2 ? 'primary' : 'success'" complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item color="white" value="3" title="Tasks" :complete="stepperValue >= 3"
                    :color="stepperValue < 3 ? 'primary' : 'success'" complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item color="white" value="4" title="Post-test" :complete="stepperValue >= 4"
                    :color="stepperValue < 4 ? 'primary' : 'success'" complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item color="white" value="5" title="Completion" :complete="stepperValue === 5"
                    :color="stepperValue < 5 ? 'primary' : 'success'" complete-icon="mdi-check" />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <!--Step 0: Welcome -->
          <WelcomeStep v-if="globalIndex === 0" :stepper-value="stepperValue"
            @start="displayVideoCallComponent = true; globalIndex = 1" />

          <!--Step 1: Consent -->
          <ConsentStep v-if="globalIndex === 1 && taskIndex === 0" :test-title="test.testTitle"
            :pre-test-title="$t('UserTestView.titles.preTest')" :consent-text="test.testStructure.consent"
            :full-name-model="fullName" :consent-completed-model="localTestAnswer.consentCompleted"
            @update:fullNameModel="val => fullName = val"
            @update:consentCompletedModel="val => localTestAnswer.consentCompleted = val"
            @continue="completeStep(taskIndex, 'consent')" />

          <!--Step 2: Pre-test -->

        </v-col>
      </v-row>
    </v-container>


    <!-- Dialog for user to continue or change account -->
    <v-dialog :model-value="!loggedIn" width="500" persistent>
      <v-card v-if="user" class="rounded-xl pa-6">
        <v-row class="ma-0 pa-0" justify="center">
          <v-avatar color="primary-lighten-4" size="120">
            <v-icon size="80">mdi-account-circle</v-icon>
          </v-avatar>
        </v-row>
        <v-card-title class="text-center text-h6 font-weight-bold mt-4">
          Welcome back!
        </v-card-title>
        <v-card-text class="text-center text-body-1">
          <p class="font-weight-medium">
            {{ user.email }}
          </p>
        </v-card-text>
        <v-card-actions class="d-flex flex-column pa-0">
          <v-btn color="primary" block variant="flat" class="my-2" @click="setTestAnswer()">
            Continue as {{ user.email }}
          </v-btn>
          <p class="text-caption mt-2">
            Not you?
            <a href="#" class="text-primary font-weight-medium" @click.prevent="signOut">Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import VideoCall from '@/components/molecules/VideoCall.vue';
import ConsentStep from '@/components/UserTest/steps/ConsentStep.vue';
import WelcomeStep from '@/components/UserTest/steps/WelcomeStep.vue';
import TaskAnswer from '@/models/TaskAnswer';
import UserTask from '@/models/UserTask';
import { ref, computed, watch, onMounted, reactive, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Data variables
const loggedIn = ref(null);
const sessionCooperator = ref(null);
const testDate = ref(null);
const start = ref(true);
const globalIndex = ref(null);
const taskIndex = ref(0);
const localTestAnswer = reactive(new TaskAnswer());
const rightView = ref(null); // For scroll effect
const fullName = ref(''); // For consent form component
const items = ref([]);
const doneTaskDisabled = ref(false); // ?
const displayVideoCallComponent = ref(false);
const preTestIndex = ref(null);

// Computed properties
const test = computed(() => store.getters.test);
const user = computed(() => {
  return store.getters.user;
});
const isUserTestAdmin = computed(() => {
  return test.value.testAdmin.userDocId === user.value?.id
});

const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer);

const roomId = computed(() => {
  return test.value.id; // Assuming we will use the test ID as the room ID
});

const stepperValue = computed(() => {
  if (globalIndex.value === 0) return -1;
  if (globalIndex.value === 1 && taskIndex.value === 0) return 0;
  if (globalIndex.value === 2 && taskIndex.value === 0) return 1;
  if (globalIndex.value === 3 && taskIndex.value === 0) return 2; // 👈 PANTALLA INFORMATIVA
  if (globalIndex.value === 4 && taskIndex.value >= 0) return 2;   // 👈 TAREAS
  if (globalIndex.value === 5 && !localTestAnswer.postTestCompleted) return 3;
  if (globalIndex.value === 6 && localTestAnswer.postTestCompleted) return 4;
  return 0;
});

// Watchers
watch(user, async () => {
  if (user.value) {
    if (loggedIn.value) await setTestAnswer();
  }
});

watch(
  () => [globalIndex.value, taskIndex.value],
  () => {
    scrollToTop();
  }
);

watchEffect(() => {

  const index = taskIndex.value;

  const taskList = test.value?.testStructure?.userTasks;
  const task = Array.isArray(taskList) ? taskList[index] : undefined;

  const answers = localTestAnswer?.tasks?.[index]?.susAnswers;

  if (task?.taskType === 'sus') {
    const validCount = answers?.filter(v => typeof v === 'number').length ?? 0;
    doneTaskDisabled.value = validCount < 10;
    console.log('SUS respostas válidas:', validCount);
  } else {
    doneTaskDisabled.value = false;
  }
});

watch(
  () => test.value,
  async () => {
    await mappingSteps();
  },
  { deep: true }
);

watch(
  () => items.value,
  () => {
    if (items.value.length && globalIndex.value === null) {
      globalIndex.value = items.value[0].id;
      if (items.value.find((obj) => obj.id === 0)) {
        preTestIndex.value = items.value[0].value[0].id;
      }
    }
  },
  { deep: true }
);

// Methods
const setTestAnswer = async () => {
  loggedIn.value = true;
  await store.dispatch('getCurrentTestAnswerDoc');
};

const signOut = async () => {
  await store.dispatch('signOut');
  router.push('/signin');
};

const startTest = () => {
  // Check if the test has no tasks
  if (!test.value.testStructure || test.value.testStructure.length === 0) {
    store.commit('SET_TOAST', { type: 'info', message: "This test doesn't have any tasks." });
    router.push(`/missions/${test.value.id}`);
    return;
  }

  // First, add the class for the exit animation
  const startScreen = document.querySelector('.start-screen');
  if (startScreen) {
    startScreen.classList.add('leaving');
  }

  // Wait for the animation to finish before changing the state
  setTimeout(() => {
    start.value = false;
  }, 1000);
};

// Scroll to top of the page when step changes
const scrollToTop = () => {
  // For most browsers
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // For rightView (in case of overflow)
  if (rightView.value) {
    rightView.value.scrollTop = 0;
  }
};

const completeStep = (id, type, userCompleted = true) => {
  try {
    if (type === 'consent') {
      localTestAnswer.consentCompleted = true;
      items.value[0].value[id].icon = 'mdi-check-circle-outline';
      if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted) {
        items.value[0].icon = 'mdi-check-circle-outline';
      }
      globalIndex.value = 2;

    }
    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true;
      items.value[0].value[id].icon = 'mdi-check-circle-outline';
      if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted) {
        items.value[0].icon = 'mdi-check-circle-outline';
      }
      globalIndex.value = 3;
    }
    if (type === 'tasks') {
      if (!Array.isArray(localTestAnswer.tasks)) {
        console.error('localTestAnswer.tasks is not an array:', localTestAnswer.tasks);
        return;
      }
      localTestAnswer.tasks[id].completed = userCompleted;
      items.value[1].value[id].icon = 'mdi-check-circle-outline';
      allTasksCompleted.value = true;

      for (let i = 0; i < items.value[1].value.length; i++) {
        if (!localTestAnswer.tasks[i]?.completed) {
          allTasksCompleted.value = false;
          break;
        }
      }
      if (allTasksCompleted.value) {
        items.value[1].icon = 'mdi-check-circle-outline';
      }
      if (id < localTestAnswer.tasks.length - 1) {
        taskIndex.value = id + 1;
        startTimer();
      } else {
        console.log('All tasks completed, moving to post-test');
        globalIndex.value = 5;
      }
      if (userCompleted) {
        store.commit('SET_TOAST', {
          type: 'success',
          message: `Task "${test.value.testStructure.userTasks[id].taskName}" completed successfully!`,
          timeout: 3000,
        });
      }
    }
    if (type === 'postTest') {
      localTestAnswer.postTestCompleted = true;
      items.value[2].icon = 'mdi-check-circle-outline';
      globalIndex.value = 6;

    }
    calculateProgress();
  } catch (error) {
    console.error('Error in completeStep:', error);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to complete step. Please try again.' });
  }
};

const mappingSteps = async () => {
  try {
    items.value = [];

    // PreTest
    if (validate(test.value?.testStructure?.preTest)) {
      items.value.push({
        title: 'Pre-test',
        icon: 'mdi-check-bold',
        value: [
          {
            title: 'Consent',
            icon: 'mdi-check-bold',
            id: 0,
          },
          {
            title: 'Form',
            icon: 'mdi-check-bold',
            id: 1,
          },
        ],
        id: 0,
      });
      if (!localTestAnswer.preTestAnswer.length && Array.isArray(test.value.testStructure.preTest)) {
        localTestAnswer.preTestAnswer = test.value.testStructure.preTest.map(() => ({
          answer: '',
        }));
      }
    }

    // Tasks
    if (validate(test.value?.testStructure?.userTasks)) {
      items.value.push({
        title: 'Tasks',
        icon: 'mdi-check-bold',
        value: test.value.testStructure.userTasks.map((task, index) => ({
          title: task.taskName,
          icon: 'mdi-check-bold',
          id: index,
        })),
        id: 1,
      });
      if (!localTestAnswer.tasks.length && Array.isArray(test.value.testStructure.userTasks)) {
        localTestAnswer.tasks = test.value.testStructure.userTasks.map((task, i) => {
          const newTask = new UserTask({
            taskId: task.id || i,
            taskAnswer: '',
            taskObservations: '',
            postAnswer: '',
            taskTime: 0,
            completed: false,
            susAnswers: [],
            nasaTlxAnswers: {}
          });
          console.log('Nueva tarea creada:', i, newTask);
          return newTask;
        });
      }
    }

    // PostTest
    if (validate(test.value?.testStructure?.postTest)) {
      items.value.push({
        title: 'Post Test',
        icon: 'mdi-check-bold',
        value: test.value.testStructure.postTest,
        id: 2,
      });
      if (!localTestAnswer.postTestAnswer.length && Array.isArray(test.value.testStructure.postTest)) {
        localTestAnswer.postTestAnswer = test.value.testStructure.postTest.map(() => ({
          answer: '',
        }));
      }
    }
  } catch (error) {
    console.error('Error mapping steps:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to initialize test data. Please try again.' });
  }
};

const validate = (object) => {
  return (
    object !== null &&
    object !== undefined &&
    object !== '' &&
    Array.isArray(object) &&
    object.length > 0
  );
};

const calculateProgress = () => {
  try {
    if (!localTestAnswer) return 0;
    const totalSteps = 4;
    let completedSteps = 0;

    if (localTestAnswer.preTestCompleted) completedSteps++;
    if (localTestAnswer.consentCompleted) completedSteps++;

    let tasksCompleted = 0;
    if (items.value[1]?.value && Array.isArray(localTestAnswer.tasks)) {
      for (let i = 0; i < items.value[1].value.length; i++) {
        if (localTestAnswer.tasks[i]?.completed) {
          tasksCompleted++;
        }
      }
      if (tasksCompleted === items.value[1].value.length) {
        completedSteps++;
      }
    }

    if (localTestAnswer.postTestCompleted) completedSteps++;

    const progressPercentage = (completedSteps / totalSteps) * 100;
    localTestAnswer.progress = progressPercentage;
    return progressPercentage;
  } catch (error) {
    console.error('Error in calculateProgress:', error);
    return 0;
  }
};

// Lifecycle hooks
onMounted(async () => {
  if (!user.value) {
    toast.error('Login to your RUXAILAB account first to access the test!');
    router.push('/signin');
    return;
  }

  if (route.params.token) {
    if (route.params.token === test.value.id) {
      toast.info('Use a session link to access your moderated test!');
      router.push('/managerview/' + test.value.id);
      return;
    }
    sessionCooperator.value = test.value.cooperators.find(
      (user) => user.userDocId === route.params.token,
    );
    if (user.value.id !== route.params.token && !isUserTestAdmin.value) {
      toast.error(t('errors.globalError'));
      router.push('/testslist');
      return;
    }
    if (sessionCooperator.value.testDate) {
      testDate.value = sessionCooperator.value.testDate;
    } else {
      toast.warning("Your session doesn't have a scheduled date");
      router.push('/managerview/' + test.value.id);
      return;
    }
  } else {
    toast.info('Use a session link to access the test');
    router.push('/managerview/' + test.value.id);
    return;
  }

  if (!isUserTestAdmin.value) {
    await store.dispatch('acceptTestCollaboration', {
      test: test.value,
      cooperator: user.value,
    });
  }

  globalIndex.value = 0;
  await mappingSteps();
});

</script>

<style scoped>
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(160deg,
      #00213F 0%,
      #1a2f4f 35%,
      #303f9f 100%);
  transition: opacity 8s cubic-bezier(0.4, 0, 0.2, 1);
}



.start-screen.leaving,
.start-screen.leaving>*,
.start-screen.leaving::before {
  opacity: 0;
  transition-duration: 1.2s;
}

@keyframes subtleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.start-screen::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90%;
  margin-right: -100px;
  margin-top: 200px;
  background-image: url(../../assets/ruxailab-small-red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
}

.start-screen.leaving::before {
  opacity: 0;
}

/* Stepper sticky styles */
.sticky-stepper {
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
}

.main-stepper {
  background: #00213F !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
  transition: background 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}


.main-stepper.stepper-animate {
  background: #00213F !important;
  opacity: 0.3;
  filter: blur(1px);
}

/* Task stepper background */
.task-stepper {
  background: #00213F !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
}

/* Forzar tamaño grande y negrita en los números del stepper (avatar) y títulos, usando selectores globales */
:deep(.v-stepper-item__avatar) {
  font-size: 1rem !important;
  font-weight: 900 !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Aumentar el tamaño del icono de check-circle cuando el step está completo */
:deep(.v-stepper-item--complete .v-stepper-item__avatar .v-icon) {
  font-size: 1.25rem !important;
  width: 2.2rem !important;
  height: 2.2rem !important;
}

:deep(.v-stepper-item__title) {
  font-size: 1.1rem !important;
  font-weight: 300 !important;
  line-height: 0.8 !important;
}

.v-stepper-item {
  padding: 1rem;
  ;
}
</style>