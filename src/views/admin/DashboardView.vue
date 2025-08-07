<template>
  <div class="dashboard-layout">
    <v-navigation-drawer width="280" class="sidebar" elevation="0">

      <v-divider class="mb-4" />

      <!-- Navigation -->
      <v-list class="pa-4" nav>
        <template v-for="item in navigationItems" :key="item.id">
          <v-list-group v-if="item.children" :value="activeSection === item.id">
            <template #activator="{ props }">
              <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" class="section-header mb-2"
                rounded="lg" />
            </template>
            <v-list-item v-for="child in item.children" :key="child.id" :title="child.title" :prepend-icon="child.icon"
              :active="activeSection === item.id && activeSubSection === child.id" class="subsection-item ml-4 mb-1"
              rounded="lg" @click="selectNavigation(item.id, child.id)" />
          </v-list-group>

          <v-list-item v-else :title="item.title" :prepend-icon="item.icon" :active="activeSection === item.id"
            class="section-header mb-2" rounded="lg" @click="selectNavigation(item.id)" />
        </template>
      </v-list>

      <!-- Create Button -->
      <div class="px-4 pb-4 mt-auto">
        <v-btn color="primary" block size="large" prepend-icon="mdi-plus" rounded="lg" elevation="1"
          class="create-button" @click="goToCreateTestRoute">
          Create New Test
        </v-btn>
      </div>
    </v-navigation-drawer>

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
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import List from '@/components/atoms/ListComponent.vue';
import TempDialog from '@/components/molecules/TemplateInfoDialog.vue';
import ProfileView from './ProfileView.vue';
import NotificationPage from './NotificationPage.vue';

const store = useStore();
const router = useRouter();

const search = ref('');
const activeSection = ref('dashboard');
const activeSubSection = ref(null);
const tempDialog = ref(false);
const temp = ref({});
const filteredModeratedSessions = ref([]);
const selectedMethodFilter = ref('all');

const navigationItems = [
  { id: 'dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard' },
  { id: 'studies', title: 'Studies', icon: 'mdi-flask' },
  { id: 'sessions', title: 'Sessions', icon: 'mdi-calendar-clock' },
  { id: 'templates', title: 'Templates', icon: 'mdi-clipboard-text' },
  { id: 'notifications', title: 'Notifications', icon: 'mdi-bell' },
  { id: 'profile', title: 'Profile', icon: 'mdi-account-circle' },
  {
    id: 'community',
    title: 'Community',
    icon: 'mdi-earth',
    children: [
      { id: 'community-studies', title: 'Studies', icon: 'mdi-flask-outline' },
      { id: 'community-templates', title: 'Templates', icon: 'mdi-file-document' }
    ]
  }
];

const methodOptions = [
  { value: 'all', title: 'All Methods' },
  { value: 'User', title: 'Usability Test' },
  { value: 'HEURISTICS', title: 'Heuristic Evaluation' },
  { value: 'MANUAL', title: 'MANUAL' },
  { value: 'AUTOMATIC', title: 'AUTOMATIC' }
];

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

const selectNavigation = (sectionId, childId = null) => {
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

onMounted(() => {
  filterModeratedSessions();
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.sidebar {
  background-color: white !important;
  border-right: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.sidebar .sidebar-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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



.study-card,
.template-card {
  border-radius: 16px !important;
  border: 2px solid transparent !important;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.study-card:hover,
.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border-color: #00213F !important;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.create-button {
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 600 !important;
  transition: transform 0.2s ease-in-out !important;
}

.create-button:hover {
  transform: translateY(-2px);
}

/* Navigation Styling */
.v-list {
  padding: 0.5rem !important;
}

.v-list-group__items .v-list-item {
  margin-bottom: 4px;
  transition: all 0.2s ease-in-out;
}

.v-list-group__items .v-list-item.v-list-item--active {
  background-color: var(--v-primary-lighten-5, rgba(0, 33, 63, 0.1)) !important;
  color: var(--v-primary-base, #00213F) !important;
  font-weight: 600 !important;
}

.v-list-group__items .v-list-item.v-list-item--active .v-list-item__prepend .v-icon {
  color: var(--v-primary-base, #00213F) !important;
}

.v-list-group__items .v-list-item:hover:not(.v-list-item--active) {
  background-color: rgba(0, 0, 0, 0.03) !important;
  transform: translateX(4px);
}
</style>
