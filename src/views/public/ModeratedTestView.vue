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
      <div v-else>
        v-else
        <!-- <VideoCall :roomId="roomId" :caller="isUserTestAdmin" /> -->
      </div>
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
import { ref, computed, watch, onMounted } from 'vue';
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

// Watchers
watch(user, async () => {
  if (user.value) {
    if (loggedIn.value) await setTestAnswer();
  }
});

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