<template>
  <v-container class="mt-8">
    <Snackbar />

    <!-- CREATE TEST BTN -->
    <v-tooltip location="left">
      <template #activator="{ props }">
        <v-btn
          data-testid="create-test-btn"
          size="large"
          icon
          position="fixed"
          location="bottom right"
          color="#F9A826"
          variant="elevated"
          class="mr-4 mb-5"
          rounded="circle"
          v-bind="props"
          @click="goToCreateTestRoute"
        >
          <v-icon size="large">
            mdi-plus
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('Dashboard.createNewTest') }}</span>
    </v-tooltip>

    <!-- LOADING -->
    <v-overlay v-model="loading">
      <v-progress-circular
        indeterminate
        size="64"
      />
    </v-overlay>

    <div>
      <v-row
        justify="center"
        class="fill-height"
      >
        <v-col cols="10">
          <!-- Mobile search button -->
          <v-row
            v-if="!searching"
            align="center"
          >
            <span class="titleText ml-3 mb-2">{{ $t('Dashboard.tests') }}</span>
            <v-spacer />
            <v-btn
              class="mr-3 hidden-md-and-up"
              icon
              @click="searching = true"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-row>
          <v-text-field
            v-else
            v-model="search"
            :autofocus="searching"
            density="compact"
            :label="$t('Dashboard.search')"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            color="grey-darken-2"
            @blur="searching = false"
          />
          <v-divider class="mb-1" />

          <!-- Desktop Main Tabs -->
          <v-tabs
            v-model="mainIndex"
            bg-color="transparent"
            color="black"
            class="hidden-sm-and-down mt-4"
          >
            <v-tab>{{ $t('Dashboard.tests') }}</v-tab>
            <v-tab>{{ $t('Dashboard.templates') }}</v-tab>

            <v-spacer />

            <v-text-field
              v-model="search"
              density="compact"
              class="mt-1"
              :label="$t('Dashboard.search')"
              prepend-inner-icon="mdi-magnify"
              :disabled="mainIndex == 2 && subIndex == 1 ? true : false"
              variant="outlined"
              color="grey-darken-2"
            />
          </v-tabs>
          <v-divider class="hidden-sm-and-down" />

          <!-- Desktop Tests/Answers Sub tabs -->
          <v-tabs
            v-if="mainIndex === 0"
            v-model="subIndex"
            bg-color="transparent"
            color="black"
            class="hidden-sm-and-down"
          >
            <v-tab>{{ $t('Dashboard.myTests') }}</v-tab>
            <v-tab>{{ $t('Dashboard.sharedWithMe') }}</v-tab>
            <v-tab>{{ $t('Dashboard.publicTests') }}</v-tab>
            <v-tab>{{ $t('Dashboard.sessions') }}</v-tab>

            <v-spacer />
          </v-tabs>
          <v-divider class="hidden-sm-and-down" />

          <!-- Desktop Templates Sub tabs -->
          <v-tabs
            v-if="mainIndex == 1"
            v-model="subIndex"
            bg-color="transparent"
            color="black"
            class="hidden-sm-and-down"
          >
            <v-tab>{{ $t('Dashboard.personal') }}</v-tab>
            <v-tab>{{ $t('Dashboard.explore') }}</v-tab>

            <v-spacer />
          </v-tabs>
          <v-divider class="hidden-sm-and-down" />
          <!-- Mobile Main Button -->
          <v-select
            v-model="mainIndex"
            density="compact"
            variant="outlined"
            class="hidden-md-and-up mx-2 mt-4"
            :items="buttonItems"
          />

          <!-- Mobile Sub Buttons -->
          <v-select
            v-if="mainIndex == 1"
            v-model="subIndex"
            density="compact"
            variant="outlined"
            class="hidden-md-and-up mx-2"
            :items="templateButtonItems"
          />
          <v-select
            v-else
            v-model="subIndex"
            density="compact"
            variant="outlined"
            class="hidden-md-and-up mx-2"
            :items="testButtonItems"
          />

          <!-- Tests -> Personal  -->
          <List
            v-if="mainIndex == 0 && subIndex == 0"
            :items="filteredTests"
            type="myTests"
            @clicked="goTo"
          />

          <!-- Tests -> Others  -->
          <List
            v-if="mainIndex == 0 && subIndex == 1"
            :items="filteredTests"
            type="sharedWithMe"
            @clicked="goTo"
          />

          <!-- Tests -> Public Tests -->
          <List
            v-if="filteredTests != null && mainIndex == 0 && subIndex == 2"
            :items="filteredTests"
            type="publicTests"
            @clicked="goTo"
          />

          <!-- Tests -> Sessions -->
          <List
            v-if="filteredModeratedSessions.length > 0 && mainIndex == 0 && subIndex == 3"
            :items="filteredModeratedSessions"
            type="sessions"
            @clicked="goTo"
          />
          <v-col
            v-if="filteredModeratedSessions.length == 0 && mainIndex == 0 && subIndex == 3"
            align="center"
            class="my-5"
          >
            <span style="color: #575757; font-size: 1.25rem !important;">
              You don't have active sessions
            </span>
            <br>
            <v-icon
              style="color: #575757;"
              class="mt-2"
              size="large"
            >
              mdi-clock-remove-outline
            </v-icon>
          </v-col>

          <!-- Templates -> Personal -->
          <List
            v-if="mainIndex == 1 && subIndex == 0"
            :items="filteredTemplates"
            type="myTemplates"
            @clicked="setupTempDialog"
          />

          <!-- Templates -> Public Templates -->
          <List
            v-if="mainIndex == 1 && subIndex == 1"
            :items="filteredTemplates"
            type="publicTemplates"
            @clicked="setupTempDialog"
          />
        </v-col>
      </v-row>

      <TempDialog
        v-model:dialog="tempDialog"
        :template="temp"
        :allow-create="true"
        @close="tempDialog = false"
      />
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Snackbar from '@/components/atoms/Snackbar.vue';
import List from '@/components/atoms/ListComponent.vue';
import TempDialog from '@/components/molecules/TemplateInfoDialog.vue';

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const search = ref('');
const mainIndex = ref(0);
const subIndex = ref(0);
const searching = ref(false);
const tempDialog = ref(false);
const temp = ref({});
const filteredModeratedSessions = ref([]);
const page = ref(1);
const lastPage = ref(1);
const itemsPerPage = ref(4);
const exploreTemplates = ref([]);
const disableNext = ref(false);
const disablePrevious = ref(true);

const buttonItems = ref([
  { title: 'Tests', value: 0 },
  { title: 'Templates', value: 1 },
]);
const testButtonItems = ref([
  { title: 'My Tests', value: 0 },
  { title: 'Shared With Me', value: 1 },
  { title: 'Public Tests', value: 2 },
]);
const templateButtonItems = ref([
  { title: 'Personal', value: 0 },
  { title: 'Explore', value: 1 },
]);

const user = computed(() => store.getters.user);
const test = computed(() => store.getters.test);
const tests = computed(() => store.state.Tests.tests);
const templates = computed(() => store.state.Templates.templates || []);
const loading = computed(() => store.getters.loading);
const showTempDetails = computed(() => !(mainIndex.value == 2 && subIndex.value == 0));

const filteredTests = computed(() => {
  if (!tests.value) return tests.value;
  return tests.value.filter(test =>
    test.testTitle.toLowerCase().includes(search.value.toLowerCase())
  );
});

const filteredTemplates = computed(() => {
  return templates.value.filter(temp =>
    temp.header.templateTitle.toLowerCase().includes(search.value.toLowerCase())
  );
});

const cleanTestStore = async () => {
  await store.dispatch('cleanTest');
};

const getMyPersonalTests = async () => {
  await store.dispatch('getTestsAdminByUser');
};

const getPublicTests = async () => {
  await store.dispatch('getPublicTests');
};

const getPublicTemplates = async () => {
  await store.dispatch('getPublicTemplates');
};

const getMyTemplates = async () => {
  await store.dispatch('getTemplatesOfUser');
};

const getSharedWithMeTests = async () => {
  await store.dispatch('getSharedWithMeTests', user.value.id);
};

const filterModeratedSessions = async () => {
  const userModeratedTests = Object.values(user.value.myAnswers).filter(
    (answer) => answer.userTestType === 'moderated'
  );

  const cooperatorArray = [];

  for (let i = 0; i < userModeratedTests.length; i++) {
    const testId = userModeratedTests[i].testDocId;
    const testObj = await store.dispatch('getTest', { id: testId });

    if (testObj) {
      const cooperatorObj = testObj.cooperators.find(
        (coop) => coop.userDocId == user.value.id
      );
      if (cooperatorObj) {
        cooperatorObj.testTitle = testObj.testTitle;
        cooperatorObj.testAdmin = testObj.testAdmin;
        cooperatorObj.id = testObj.id;

        const today = new Date();
        const testDate = new Date(cooperatorObj.testDate);

        if (testDate.getDate() === today.getDate()) {
          cooperatorArray.push(cooperatorObj);
        }
      }
    }
  }
  filteredModeratedSessions.value = cooperatorArray;
  return cooperatorArray;
};

const goToCreateTestRoute = () => {
  router.push('/createtest');
};

const goTo = (test) => {
  if (mainIndex.value === 0) {
    if (subIndex.value === 0) {
      router.push({
        name: 'ManagerView',
        params: { id: test.testDocId },
      });
    } else if (subIndex.value === 1) {
      if (test.accessLevel >= 2) {
        router.push({
          name: 'TestView',
          params: { id: test.testDocId },
        });
      } else {
        router.push({
          name: 'ManagerView',
          params: { id: test.testDocId },
        });
      }
    } else if (subIndex.value === 2) {
      router.push({
        name: 'ManagerView',
        params: { id: test.id },
      });
    } else if (subIndex.value === 3) {
      router.push(`testview/${test.id}/${user.value.id}`);
    }
  }
};

const setupTempDialog = (template) => {
  if (!template || !template.header || !template.body) {
    console.warn('Invalid template provided to setupTempDialog:', template);
    return;
  }
  temp.value = { ...template }; // Clone the template object
  tempDialog.value = true;
};

watch(mainIndex, async (val) => {
  subIndex.value = 0; // Reset subIndex when mainIndex changes
  if (val === 0) await getMyPersonalTests();
  if (val === 1) await getMyTemplates();
});

watch(subIndex, async (val) => {
  if (mainIndex.value === 0) {
    if (val === 0) await getMyPersonalTests();
    if (val === 1) await getSharedWithMeTests();
    if (val === 2) await getPublicTests();
  } else if (mainIndex.value === 1) {
    if (val === 0) await getMyTemplates();
    if (val === 1) await getPublicTemplates();
  }
});

onBeforeMount(async () => {
  await getMyPersonalTests();
  await cleanTestStore();
});

onMounted(() => {
  filterModeratedSessions();
});
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}

.v-tab--selected {
  background-color: rgba(249, 168, 38, 0.2) !important;
  border-radius: 4px;
  color: #000000 !important;
  font-weight: bold;
}
</style>