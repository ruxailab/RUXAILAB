<template>
  <div class="dashboard-layout">
    <DashboardSidebar
      v-model="drawerOpen"
      :active-section="activeSection"
      :active-sub-section="activeSubSection"
      @navigate="selectNavigation"
      @create-test="goToCreateTestRoute"
    />

    <v-main class="main-content">
      <v-container
        fluid
        class="pa-8"
      >
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
        <v-card
          v-if="['studies', 'community'].includes(activeSection)"
          class="mb-5 search-filters-card"
        >
          <v-row
            class="pa-4"
            justify="space-between"
            no-gutters
          >
            <v-col
              cols="12"
              md="8"
              class="pr-md-4"
            >
              <v-text-field
                v-model="search"
                width="full"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search in your research..."
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="white"
                rounded="lg"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              class="mt-3 mt-md-0"
            >
              <v-select
                v-model="selectedMethodFilter"
                :items="methodOptions"
                item-title="text"
                item-value="value"
                label="Research Method"
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="white"
                rounded="lg"
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- Render Sections -->
        <div v-if="activeSection === 'dashboard'">
          <!-- Placeholder -->
          <DashboardView :items="tests" :sessions="nextModeratedSessions" />
        </div>

        <div v-if="activeSection === 'studies'">
          <List
            :items="filteredTests"
            type="myTests"
            @clicked="goTo"
          />
        </div>

        <div v-if="activeSection === 'sessions'">
          <List
            v-if="filteredModeratedSessions.length > 0"
            :items="filteredModeratedSessions"
            type="sessions"
            :sort-by="[{ key: 'testDate', order: 'desc' }]"
            @clicked="goTo"
          />
          <div
            v-else
            class="empty-state"
          >
            <v-icon
              icon="mdi-clock-remove-outline"
              size="48"
              color="grey-lighten-1"
              class="mb-2"
            />
            <p class="text-h6">
              You don't have active sessions
            </p>
          </div>
        </div>

        <div v-if="activeSection === 'templates'">
          <List
            :items="filteredTemplates"
            type="myTemplates"
            @clicked="setupTempDialog"
          />
        </div>

        <div v-if="activeSection === 'community' && activeSubSection === 'community-studies'">
          <List
            :items="filteredTests"
            type="publicTests"
            @clicked="goTo"
          />
        </div>

        <div v-if="activeSection === 'community' && activeSubSection === 'community-templates'">
          <List
            :items="filteredTemplates.sort((a, b) => (b.header.creationDate || 0) - (a.header.creationDate || 0))"
            type="publicTemplates"
            @clicked="setupTempDialog"
          />
        </div>

        <div v-if="activeSection === 'notifications'">
          <NotificationPage />
        </div>

        <div v-if="activeSection === 'profile'">
          <ProfileView />
        </div>

        <TempDialog
          v-model:dialog="tempDialog"
          :template="temp"
          :allow-create="true"
          @close="reloadMyTemplates()"
        />
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import List from '@/shared/components/tables/ListComponent.vue';
import TempDialog from '@/shared/components/dialogs/TemplateInfoDialog.vue';
import ProfileView from '@/features/auth/views/ProfileView.vue';
import NotificationPage from '@/features/notifications/views/NotificationPage.vue';
import { DashboardSidebar } from '@/features/navigation/utils';
import { getMethodManagerView, getMethodOptions, METHOD_DEFINITIONS, METHOD_STATUSES, STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions';
import DashboardView from '@/features/dashboard/views/DashboardView.vue';
import StudyController from '@/controllers/StudyController';
import { getSessionStatus, SESSION_STATUSES } from '@/shared/utils/sessionsUtils';

const store = useStore();
const router = useRouter();
const route = useRoute();

const search = ref('');
const activeSection = ref('dashboard');
const activeSubSection = ref(null);
const tempDialog = ref(false);
const temp = ref({});
const filteredModeratedSessions = ref([]);
const nextModeratedSessions = ref([]);
const selectedMethodFilter = ref('all');
const drawerOpen = ref(false);
const studyController = new StudyController()

// Opciones de métodos usando el nuevo sistema - solo métodos disponibles
const methodOptions = computed(() => {
  const options = getMethodOptions('es', METHOD_STATUSES.AVAILABLE.id) // Solo métodos disponibles

  return [
    { value: 'all', text: 'All Methods' },
    ...options.map(option => ({
      value: option.value,
      text: option.text
    }))
  ]
})

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

const tests = computed(() => store.getters.tests || []);
const templates = computed(() => store.state.Templates.templates || []);
const user = computed(() => store.getters.user);

const filteredTests = computed(() => {
  const allTests = tests.value;

  return allTests?.filter(test => {
    const matchesSearch = (test.testTitle || test.title || '').toLowerCase().includes(search.value.toLowerCase());

    const method = selectedMethodFilter.value;
    const testType = test.testType;
    const subType = test.subType;

    const matchesMethod =
      method === 'all' ||
      (method === METHOD_DEFINITIONS.HEURISTICS.id && testType === STUDY_TYPES.HEURISTIC) ||
      (method === METHOD_DEFINITIONS.USER_UNMODERATED.id && testType === STUDY_TYPES.USER && subType == USER_STUDY_SUBTYPES.UNMODERATED) ||
      (method === METHOD_DEFINITIONS.USER_MODERATED.id && testType === STUDY_TYPES.USER && subType == USER_STUDY_SUBTYPES.MODERATED) ||
      (method === METHOD_DEFINITIONS.ACCESSIBILITY_MANUAL.id && testType === STUDY_TYPES.ACCESSIBILITY_MANUAL) ||
      (method === METHOD_DEFINITIONS.ACCESSIBILITY_AUTOMATIC.id && testType === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC);

    return matchesSearch && matchesMethod;
  });
});

const filteredTemplates = computed(() => {
  return templates.value?.filter(temp => {
    // Search filter
    const matchesSearch = temp.header.templateTitle
      .toLowerCase()
      .includes(search.value.toLowerCase());

    const method = selectedMethodFilter.value;
    const testType = temp.header.templateType;
    const subType = temp.header.templateSubType;

    // Method filter (mesma lógica de tests, mas usando temp.header)
    const matchesMethod =
      method === 'all' ||
      (method === METHOD_DEFINITIONS.HEURISTICS.id &&
        testType === STUDY_TYPES.HEURISTIC) ||
      (method === METHOD_DEFINITIONS.USER_UNMODERATED.id &&
        testType === STUDY_TYPES.USER &&
        subType === USER_STUDY_SUBTYPES.UNMODERATED) ||
      (method === METHOD_DEFINITIONS.USER_MODERATED.id &&
        testType === STUDY_TYPES.USER &&
        subType === USER_STUDY_SUBTYPES.MODERATED) ||
      (method === 'MANUAL' && testType === 'MANUAL') ||
      (method === 'AUTOMATIC' && testType === 'AUTOMATIC');

    return matchesSearch && matchesMethod;
  });
});

const selectNavigation = (navigationData) => {
  const { sectionId, childId } = navigationData;
  activeSection.value = sectionId;
  activeSubSection.value = sectionId === 'community' ? childId : null;
};

const goToCreateTestRoute = () => {
  router.push('/choose');
};

const goTo = (test) => {
  // Handle MANUAL and AUTOMATIC tests with router navigation
  if (test.testType === STUDY_TYPES.ACCESSIBILITY_MANUAL) {
    const baseUrl = activeSection.value === 'studies' ? test.testDocId || test.id : test.id;
    router.push(`/accessibility/manual/${baseUrl}`);
    return;
  }

  if (test.testType === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC) {
    const baseUrl = activeSection.value === 'studies' ? test.testDocId || test.id : test.id;
    router.push(`/accessibility/automatic/${baseUrl}`);
    return;
  }

  // Handle other test types based on section
  switch (activeSection.value) {
    case 'studies':
      const methodView = getMethodManagerView(test.testType, test.subType);
      router.push({ name: methodView, params: { id: test.testDocId || test.id } });
      break;

    case 'sessions':
      const canNavigateToSession = (testDate) => {
        return getSessionStatus(testDate) === SESSION_STATUSES.TODAY;
      };
      if (canNavigateToSession(test.testDate)) {
        router.push(`testview/${test.id}/${user.value.id}`);
      }
      break;

    case 'community':
      if (activeSubSection.value === 'community-studies') {
        navigateToCommunityStudy(test);
      }
      break;
  }
};

const navigateToCommunityStudy = (test) => {
  switch (test.testType) {
    case STUDY_TYPES.HEURISTIC:
      router.push({ name: 'HeuristicManagerView', params: { id: test.id } });
      break;
    case STUDY_TYPES.CARD_SORTING:
      router.push({ name: 'CardSortingManagerView', params: { id: test.id } });
      break;
    case STUDY_TYPES.USER:
      if (test.subType === USER_STUDY_SUBTYPES.UNMODERATED) {
        router.push({ name: 'UserUnmoderatedManagerView', params: { id: test.id } });
      } else if (test.subType === USER_STUDY_SUBTYPES.MODERATED) {
        router.push({ name: 'UserModeratedManagerView', params: { id: test.id } });
      }
      break;
  }
};

const setupTempDialog = (template) => {
  if (!template?.header || !template?.body) return;
  temp.value = { ...template };
  tempDialog.value = true;
};

const getMyPersonalTests = () => store.dispatch('getTestsAdminByUser');
const getPublicStudies = () => store.dispatch('getPublicStudies');
const getMyTemplates = () => store.dispatch('getTemplatesOfUser');
const getPublicTemplates = () => store.dispatch('getPublicTemplates');

const filterModeratedSessions = async () => {
  const userModeratedTestsAnswers = Object.values(user.value.myAnswers).filter(
    (answer) => answer.subType === USER_STUDY_SUBTYPES.MODERATED
  );

  const userModeratedTestsAsModerator = Object.values(user.value.myTests).filter(
    (test) => test.subType === USER_STUDY_SUBTYPES.MODERATED
  );

  const cooperatorArray = [];
  for (const test of userModeratedTestsAnswers) {
    const testObj = await studyController.getStudy({ id: test.testDocId });
    if (testObj) {
      const cooperatorObj = testObj.cooperators?.find(coop => coop.userDocId == user.value.id);
      if (cooperatorObj) {
        Object.assign(cooperatorObj, {
          testTitle: testObj.testTitle,
          testAdmin: testObj.testAdmin,
          id: testObj.id,
          testType: testObj.testType,
          subType: testObj.subType
        });
        cooperatorArray.push(cooperatorObj);
      }
    }
  }

  for (const test of userModeratedTestsAsModerator) {
    const testObj = await studyController.getStudy({ id: test.testDocId });
    if (testObj) {
      testObj.cooperators?.forEach(cooperatorObj => {
       const obj = Object.assign(cooperatorObj, {
          testTitle: testObj.testTitle,
          testAdmin: testObj.testAdmin,
          id: testObj.id,
          testType: testObj.testType,
          subType: testObj.subType,
          evaluator: cooperatorObj.email
        });
        cooperatorArray.push(obj);
      });
    }
  }

  filteredModeratedSessions.value = cooperatorArray
};

const filterNextModeratedSessions = async () => {
  const userModeratedTests = Object.values(user.value?.notifications || {});

  const results = await Promise.all(
    userModeratedTests.map(async (test) => {
      const testObj = await studyController.getStudy({ id: test.testId });
      if (!testObj) return null;

      const cooperatorObj = (testObj.cooperators || []).find(
        (coop) => coop.userDocId == user.value.id
      );
      if (!cooperatorObj) return null;

      return {
        ...cooperatorObj,
        testTitle: testObj.testTitle,
        testAdmin: testObj.testAdmin,
        id: testObj.id,
        testType: testObj.testType,
        subType: testObj.subType,
        redirectsTo: test.redirectsTo,
      };
    })
  );

  // Remove nulos e aplica os mesmos filtros de antes
  const cooperatorArray = results.filter(Boolean);

  nextModeratedSessions.value = cooperatorArray
    .filter((answer) => answer.subType === USER_STUDY_SUBTYPES.MODERATED)
    .filter((val, index, self) => index === self.findIndex((m) => m.id === val.id));

  console.log("nextModeratedSessions.value", nextModeratedSessions.value);
};

// const filterNextModeratedSessions = async () => {
//   const userModeratedTests = Object.values(user.value.notifications)
//   const cooperatorArray = [];
//   for (const test of userModeratedTests) {
//     console.log("test", test)
//     const testObj = await studyController.getStudy({ id: test.testId });
//     if (testObj) {
//       const cooperatorObj = testObj.cooperators?.find(coop => coop.userDocId == user.value.id);
//       if (cooperatorObj) {
//         Object.assign(cooperatorObj, {
//           testTitle: testObj.testTitle,
//           testAdmin: testObj.testAdmin,
//           id: testObj.id,
//           testType: testObj.testType,
//           subType: testObj.subType,
//           redirectsTo: test.redirectsTo
//         });
//         cooperatorArray.push(cooperatorObj);
//       }
//     }
//   }
//   nextModeratedSessions.value = cooperatorArray
//   .filter(
//     (answer) => answer.subType === USER_STUDY_SUBTYPES.MODERATED
//   )
//   .filter(
//     (val, index, self) => index === self.findIndex(m => m.id === val.id)
//   );
//   console.log("nextModeratedSessions.value", nextModeratedSessions.value)
// };

const reloadMyTemplates = async () => {
  tempDialog.value = false
  await getMyTemplates()
}

watch([activeSection, activeSubSection], async ([section, sub]) => {
  switch (section) {
    case 'studies': await getMyPersonalTests(); break;
    case 'sessions': await filterModeratedSessions(); break;
    case 'templates': await getMyTemplates(); break;
    case 'community':
      if (sub === 'community-studies') await getPublicStudies();
      else if (sub === 'community-templates') await getPublicTemplates();
      break;
  }
});

onMounted(async () => {
  await getMyPersonalTests();
});

// Event handler function
const handleToggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

onMounted(() => {
  filterModeratedSessions();
  filterNextModeratedSessions()

  // Handle query parameters for section navigation
  if (route.query.section) {
    activeSection.value = route.query.section;
    if (route.query.subsection) {
      activeSubSection.value = route.query.subsection;
    }
  }

  // Escuchar evento del toolbar para toggle del drawer
  window.addEventListener('toggle-dashboard-drawer', handleToggleDrawer);
});

// Watch for route changes to handle navigation
watch(
  () => route.query.section,
  (newSection) => {
    if (newSection) {
      activeSection.value = newSection;
    }
  },
  { immediate: true }
);

watch(
  () => route.query.subsection,
  (newSubSection) => {
    if (newSubSection) {
      activeSubSection.value = newSubSection;
    }
  },
  { immediate: true }
);

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
