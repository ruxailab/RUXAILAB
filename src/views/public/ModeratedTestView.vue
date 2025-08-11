<template>
  <div>
    <h1>Test</h1>
    {{ test }}

    <h1>User</h1>
    {{ user }}

    <h1>Current User Test Answer</h1>
    {{ currentUserTestAnswer }}

    <VideoCall :roomId="roomId" :caller="isUserTestAdmin" />

    <!-- Dialog for user to continue or change account -->
    <v-dialog :model-value="!loggedIn" width="500" persistent>
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar class="justify-center" color="orange-lighten-4" size="150">
            <v-icon size="120">
              mdi-account
            </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn class="text-white bg-orange" @click="setTestAnswer()">
            Continue as {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            Not {{ user.email }}?
            <a style="color: #f9a826; cursor: pointer;" @click="signOut()">Change account</a>
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