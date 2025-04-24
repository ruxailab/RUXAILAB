<template>
  <v-container>
    <Snackbar />
    <!-- Leave Alert Dialog -->
    <v-dialog
      v-model="dialog"
      width="600"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 bg-error-accent-4 text-white"
        >
          Are you sure you want to leave?
        </v-card-title>
        <v-card-text>All your changes will be discarded</v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="closeDialog"
          >
            Stay
          </v-btn>
          <v-btn
            class="bg-error-accent-4 text-white ml-1"
            variant="text"
            @click="leave"
          >
            Leave
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Save Button -->
    <v-tooltip
      v-if="accessLevel === 0"
      location="left"
    >
      <template #activator="{ props }">
        <v-btn
          size="large"
          icon
          color="#F9A826"
          :disabled="testAnswerDocLength > 0"
          v-bind="props"
          class="save-btn"
          @click="validateAll"
        >
          <v-icon
            size="large"
            :class="{ 'disabled-btn': testAnswerDocLength > 0 }"
          >
            mdi-content-save
          </v-icon>
        </v-btn>
      </template>
      <span>Save</span>
    </v-tooltip>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="loading"
      class="text-center"
    >
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      />
      <div class="white-text mt-3">
        Loading Test
      </div>
    </v-overlay>

    <v-row>
      <v-col
        cols="12"
        class="pb-0"
      >
        <!-- Heuristic Tests -->
        <EditHeuristicsTest
          v-if="test.testType === 'HEURISTICS'"
          type="content"
          :object="object"
          :index="index"
          @tab-clicked="setIndex"
          @change="change = true"
        >
          <template #content>
            <!-- Content slot for Heuristics Test -->
          </template>
        </EditHeuristicsTest>

        <!-- Unmoderated User Tests -->
        <EditUserTest
          v-if="test.testType === 'User' && test.userTestType === 'unmoderated'"
          type="tabs"
          @tab-clicked="setIndex"
        >
          <template #top>
            <!-- Top slot for Unmoderated User Test -->
          </template>
        </EditUserTest>
        <EditUserTest
          v-if="test.testType === 'User' && test.userTestType === 'unmoderated'"
          type="content"
          :object="object"
          :index="index"
          @val-form="validate"
        >
          <template #content>
            <!-- Content slot for Unmoderated User Test -->
          </template>
        </EditUserTest>

        <!-- Moderated User Tests -->
        <EditModeratedUserTest
          v-if="test.testType === 'User' && test.userTestType === 'moderated'"
          type="tabs"
          @tab-clicked="setIndex"
          @change="change = true"
        >
          <template #top>
            <!-- Top slot for Moderated User Test -->
          </template>
        </EditModeratedUserTest>
        <EditModeratedUserTest
          v-if="test.testType === 'User' && test.userTestType === 'moderated'"
          type="content"
          :object="object"
          :index="index"
          @change="change = true"
          @val-form="validate"
        >
          <template #content>
            <!-- Content slot for Moderated User Test -->
          </template>
        </EditModeratedUserTest>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import Snackbar from '@/components/atoms/Snackbar.vue';
import EditHeuristicsTest from '@/components/organisms/EditHeuristicsTest.vue';
import EditUserTest from '@/components/organisms/EditUserTest.vue';
import EditModeratedUserTest from '@/components/organisms/EditModeratedUserTest.vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const index = ref(0);
const object = ref({});
const valids = ref([true, true]);
const change = ref(false);
const dialog = ref(false);
const go = ref('');

const accessLevel = computed(() => {
  const user = store.getters.user;
  if (!user) return 1;
  if (user.accessLevel === 0) return 0;
  const test = store.getters.test;
  if (test.testAdmin?.userDocId === user.id) return 0;
  const coopsInfo = test.cooperators?.find(
    (coops) => coops.userDocId === user.id
  );
  return coopsInfo?.accessLevel ?? 1;
});

const testAnswerDocLength = computed(() => {
  return Object.keys(store.getters.testAnswerDocument?.heuristicAnswers ?? {}).length;
});

const loading = computed(() => {
  return store.getters.loading;
});

const user = computed(() => {
  return store.getters.user;
});

const test = computed(() => {
  return store.getters.test;
});

const answers = computed(() => {
  return store.getters.answers ?? [];
});

const totalQuestions = computed(() => {
  const items = object.value?.heuristics ?? object.value?.tasks ?? [];
  return items.reduce((sum, h) => sum + (h.total || 0), 0);
});

const setIntro = async () => {
  object.value = { ...test.value };
};

const submit = async () => {
  object.value.testStructure = store.state.Tests.Test.testStructure;
  if (test.value.testType === 'User') {
    object.value.testStructure = {
      welcomeMessage: store.getters.welcomeMessage,
      landingPage: store.getters.landingPage,
      participantCamera: store.getters.participantCamera,
      consent: store.getters.consent,
      userTasks: store.getters.tasks,
      preTest: store.getters.preTest,
      postTest: store.getters.postTest,
      finalMessage: store.getters.finalMessage,
    };
  }
  await store.dispatch('updateTest', { ...test.value, ...object.value });
};

const validate = (valid, idx) => {
  valids.value[idx] = valid;
};

const validateAll = async () => {
  await submit();
  change.value = false;
};

const preventNav = (event) => {
  if (change.value) {
    event.preventDefault();
    event.returnValue = '';
  }
};

const setIndex = (ind) => {
  index.value = ind;
};

const closeDialog = () => {
  dialog.value = false;
  go.value = '';
};

const leave = () => {
  change.value = false;
  router.push(go.value);
};

watch(
  test,
  (newTest) => {
    if (newTest) setIntro();
  },
  { immediate: true }
);

onBeforeMount(() => {
  window.addEventListener('beforeunload', preventNav);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', preventNav);
});

const init = async () => {
  try {
    await Promise.all([
      store.dispatch('getTest', { id: route.params.id }),
      store.dispatch('getCurrentTestAnswerDoc'),
    ]);
  } catch (error) {
    console.error('Failed to load test data:', error);
    // Optionally show a toast or redirect
  }
};
init();

// Route guard
onBeforeRouteLeave((to, from) => {
  if (change.value) {
    dialog.value = true;
    go.value = to.path;
    return false;
  }
  return true;
});
</script>

<style scoped>
.save-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}
.save-btn.disabled-btn,
.disabled-btn {
  color: rgba(134, 125, 125, 0.438) !important;
}
.save-btn.disabled-btn {
  background-color: rgba(185, 185, 185, 0.308) !important;
}
</style>