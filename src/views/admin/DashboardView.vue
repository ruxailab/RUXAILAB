<template>
  <div class="dashboard-layout">
    <DashboardSidebar v-model="drawerOpen" :active-section="activeSection" :active-sub-section="activeSubSection"
      @navigate="selectNavigation" @create-test="goToCreateTestRoute" />

    <v-main class="main-content">
      <v-container fluid class="pa-8">
        <!-- Header -->
        <div class="content-header">
          <h1 class="text-h4 font-weight-bold text-grey-darken-4">
            {{ currentPageTitle }}
          </h1>
          <p class="text-h6 text-grey-darken-1">
            {{
              activeSection === 'studies'
                ? 'Manage your research studies'
                : activeSection === 'templates'
                  ? 'Access your saved templates'
                  : ''
            }}
          </p>
        </div>

        <!-- Search + Filters -->
        <v-card v-if="['studies', 'community'].includes(activeSection)" class="mb-5 search-filters-card">
          <v-row class="pa-4" justify="space-between" no-gutters>
            <v-col cols="12" md="8" class="pr-md-4">
              <v-text-field v-model="search" width="full" prepend-inner-icon="mdi-magnify"
                placeholder="Search in your research..." variant="outlined" density="comfortable" hide-details
                bg-color="white" rounded="lg" />
            </v-col>
            <v-col cols="12" md="4" class="mt-3 mt-md-0">
              <v-select v-model="selectedMethodFilter" :items="methodOptions" label="Research Method" variant="outlined"
                density="comfortable" hide-details bg-color="white" rounded="lg" />
            </v-col>
          </v-row>
        </v-card>

        <!-- Render Sections -->
        <div v-if="activeSection === 'dashboard'">
          <!-- Placeholder -->
        </div>

        <div v-if="activeSection === 'studies'">
          <List :items="filteredTests" type="myTests" @clicked="goTo" />
        </div>

        <div v-if="activeSection === 'sessions'">
          <List v-if="filteredModeratedSessions.length > 0" :items="filteredModeratedSessions" type="sessions"
            @clicked="goTo" />
          <div v-else class="empty-state">
            <v-icon icon="mdi-clock-remove-outline" size="48" color="grey-lighten-1" class="mb-2" />
            <p class="text-h6">
              You don't have active sessions
            </p>
          </div>
        </div>

        <div v-if="activeSection === 'templates'">
          <List :items="filteredTemplates" type="myTemplates" @clicked="setupTempDialog" />
        </div>

        <div v-if="activeSection === 'community' && activeSubSection === 'community-studies'">
          <List :items="filteredTests" type="publicTests" @clicked="goTo" />
        </div>

        <div v-if="activeSection === 'community' && activeSubSection === 'community-templates'">
          <List :items="filteredTemplates" type="publicTemplates" @clicked="setupTempDialog" />
        </div>

        <div v-if="activeSection === 'notifications'">
          <NotificationPage />
        </div>

        <div v-if="activeSection === 'profile'">
          <ProfileView />
        </div>

        <TempDialog v-model:dialog="tempDialog" :template="temp" :allow-create="true" @close="tempDialog = false" />
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import List from '@/components/atoms/ListComponent.vue';
import TempDialog from '@/components/molecules/TemplateInfoDialog.vue';
import ProfileView from './ProfileView.vue';
import NotificationPage from './NotificationPage.vue';
import { DashboardSidebar } from '@/components/navigation';
import { methodOptions } from '@/constants/researchMethods';

const store = useStore();
const router = useRouter();

const search = ref('');
const activeSection = ref('dashboard');
const activeSubSection = ref(null);
const tempDialog = ref(false);
const temp = ref({});
const filteredModeratedSessions = ref([]);
const selectedMethodFilter = ref('all');
const drawerOpen = ref(false);

// Computed
const currentPageTitle = computed(() => {
  switch (activeSection.value) {
    case 'dashboard': return 'Dashboard';
    case 'studies': return 'Studies';
    case 'sessions': return 'Sessions';
    case 'templates': return 'Templates';
    case 'notifications': return 'Notifications';
    case 'profile': return 'Profile';
    case 'community':
      return activeSubSection.value === 'community-templates' ? 'Community Templates' : 'Community Studies';
    default: return 'RUXAI Lab';
  }
});

const tests = computed(() => store.state.Tests.tests);
const templates = computed(() => store.state.Templates.templates || []);
const user = computed(() => store.getters.user);

const filteredTests = computed(() => {
  return tests.value?.filter(test => {
    const matchesSearch = test.testTitle.toLowerCase().includes(search.value.toLowerCase());

    const method = selectedMethodFilter.value;
    const testType = test.testType;

    const matchesMethod =
      method === 'all' ||
      (method === 'HEURISTICS' && testType === 'HEURISTICS') ||
      (method === 'User' && testType === 'User') ||
      (method === 'MANUAL' && testType === 'MANUAL') ||
      (method === 'AUTOMATIC' && testType === 'AUTOMATIC');

    return matchesSearch && matchesMethod;
  });
});

const filteredTemplates = computed(() => templates.value.filter(temp =>
  temp.header.templateTitle.toLowerCase().includes(search.value.toLowerCase())
));

const selectNavigation = (navigationData) => {
  const { sectionId, childId } = navigationData;
  activeSection.value = sectionId;
  activeSubSection.value = sectionId === 'community' ? childId : null;
};

const goToCreateTestRoute = () => {
  router.push('/choose');
};

const goTo = (test) => {
  if (activeSection.value === 'studies') {
    router.push({ name: 'ManagerView', params: { id: test.testDocId || test.id } });
  } else if (activeSection.value === 'sessions') {
    router.push(`testview/${test.id}/${user.value.id}`);
  }
};

const setupTempDialog = (template) => {
  if (!template?.header || !template?.body) return;
  temp.value = { ...template };
  tempDialog.value = true;
};

const getMyPersonalTests = () => store.dispatch('getTestsAdminByUser');
const getPublicTests = () => store.dispatch('getPublicTests');
const getMyTemplates = () => store.dispatch('getTemplatesOfUser');
const getPublicTemplates = () => store.dispatch('getPublicTemplates');
const cleanTestStore = () => store.dispatch('cleanTest');

const filterModeratedSessions = async () => {
  const userModeratedTests = Object.values(user.value.myAnswers).filter(
    (answer) => answer.userTestType === 'moderated'
  );
  const cooperatorArray = [];
  for (const test of userModeratedTests) {
    const testObj = await store.dispatch('getTest', { id: test.testDocId });
    if (testObj) {
      const cooperatorObj = testObj.cooperators?.find(coop => coop.userDocId == user.value.id);
      if (cooperatorObj) {
        Object.assign(cooperatorObj, {
          testTitle: testObj.testTitle,
          testAdmin: testObj.testAdmin,
          id: testObj.id
        });
        const today = new Date(), testDate = new Date(cooperatorObj.testDate);
        if (testDate.getDate() === today.getDate()) cooperatorArray.push(cooperatorObj);
      }
    }
  }
  filteredModeratedSessions.value = cooperatorArray;
};

watch([activeSection, activeSubSection], async ([section, sub]) => {
  switch (section) {
    case 'studies': await getMyPersonalTests(); break;
    case 'sessions': await filterModeratedSessions(); break;
    case 'templates': await getMyTemplates(); break;
    case 'community':
      if (sub === 'community-studies') await getPublicTests();
      else if (sub === 'community-templates') await getPublicTemplates();
      break;
  }
});

onBeforeMount(async () => {
  await getMyPersonalTests();
  await cleanTestStore();
});

// Event handler function
const handleToggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

onMounted(() => {
  filterModeratedSessions();

  // Escuchar evento del toolbar para toggle del drawer
  window.addEventListener('toggle-dashboard-drawer', handleToggleDrawer);
});

onUnmounted(() => {
  window.removeEventListener('toggle-dashboard-drawer', handleToggleDrawer);
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.main-content {
  padding: 0;
  flex: 1;
  background-color: #fff;
}

.content-header {
  background-color: transparent;
  border-radius: 16px;
  padding: 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
