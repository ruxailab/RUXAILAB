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
        <!-- Search + Filters for studies -->
        <v-card v-if="['studies', 'community'].includes(activeSection)" class="mb-4 pa-4 elevation-2 overflow-hidden">
          <!-- 🔹 Barra superior -->
          <div class="d-flex align-center mb-3 flex-wrap button-bar">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Search studies..."
              class="flex-grow-1"
            />
            <v-btn
              color="primary"
              class="search-btn"
              prepend-icon="mdi-filter-remove"
              :disabled="!hasActiveFilters"
              @click="clearFilters"
            >
              Reset
            </v-btn>

            <v-btn
              :color="showFilters ? 'primary' : 'grey'"
              variant="tonal"
              icon
              size="small"
              :title="showFilters ? 'Hide filters' : 'Show filters'"
              @click="toggleFilters"
            >
              <v-icon>{{ showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant' }}</v-icon>
            </v-btn>
          </div>

          <!-- 🔹 Filtros expandidos -->
          <v-expand-transition>
            <div v-show="showFilters">
              <v-row dense>
                <!-- 📅 Creation date -->
                <v-col cols="12" sm="6" md="3">
                  <div class="filter-label">Creation date</div>
                  <v-menu
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        readonly
                        variant="outlined"
                        density="compact"
                        hide-details
                        :placeholder="creationDateRange.length > 1
                          ? `${new Date(creationDateRange[0]).toLocaleDateString()} - ${new Date(creationDateRange[1]).toLocaleDateString()}`
                          : 'Select range'"
                        :model-value="creationDateRange[0] && creationDateRange[1]
                          ? `${new Date(creationDateRange[0]).toLocaleDateString()} - ${new Date(creationDateRange[1]).toLocaleDateString()}`
                          : ''"
                        prepend-inner-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker v-model="creationDateRange" multiple="range" />
                  </v-menu>
                </v-col>

                <!-- ⚙️ Status -->
                <v-col cols="12" sm="6" md="3">
                  <div class="filter-label">Status</div>
                  <v-select
                    v-model="selectedStatusFilter"
                    :items="statusOptions"
                    item-title="text"
                    item-value="value"
                    multiple
                    chips
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>

                <!-- 🔓 Visibility -->
                <v-col cols="12" sm="6" md="3" v-if="activeSection == 'studies'">
                  <div class="filter-label">Visibility</div>
                  <v-select
                    v-model="selectedVisibilityFilter"
                    :items="visibilityOptions"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>

                <!-- 🔹 Method -->
                <v-col cols="12" sm="6" md="3" v-if="activeSection === 'studies'">
                  <div class="filter-label">Method</div>
                  <v-select
                    v-model="selectedMethodFilter"
                    :items="methodOptions"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>

                <!-- 👥 Ownership -->
                <v-col cols="12" sm="6" md="3">
                  <div class="filter-label">Ownership</div>
                  <v-select
                    v-model="selectedOwnershipFilter"
                    :items="ownershipOptions"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>

                <!-- 👤 Participants -->
                <v-col cols="12" sm="6" md="3">
                  <div class="filter-label">Participants</div>
                  <v-select
                    v-model="selectedParticipantsFilter"
                    :items="participantsOptions"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </v-card>
       
        <!-- Render Sections -->
        <div v-if="activeSection === 'dashboard'">
          <!-- Placeholder -->
          <DashboardView :items="filteredTests" :sessions="filteredModeratedSessions" />
        </div>

        <div v-if="activeSection === 'studies'">
          <List
            :items="filteredTests"
            type="myTests"
            @clicked="goTo"
          />
        </div>

        <div v-if="activeSection === 'sessions'">
         <SessionsSection />
        </div>

        <div v-if="activeSection === 'templates'">
         <TemplatesSection />
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

       
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import List from '@/shared/components/tables/ListComponent.vue';
import ProfileView from '@/features/auth/views/ProfileView.vue';
import NotificationPage from '@/features/notifications/views/NotificationPage.vue';
import { DashboardSidebar } from '@/features/navigation/utils';
import { getMethodManagerView, getMethodOptions, METHOD_DEFINITIONS, METHOD_STATUSES, STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions';
import DashboardView from '@/features/dashboard/views/DashboardView.vue';
import { getSessionStatus, SESSION_STATUSES } from '@/shared/utils/sessionsUtils';
import SessionsSection from '../components/navbarSections/SessionsSection.vue';
import TemplatesSection from '../components/navbarSections/TemplatesSection.vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

const search = ref('');
const activeSection = ref('dashboard');
const activeSubSection = ref(null);
const tempDialog = ref(false);
const temp = ref({});
const filteredModeratedSessions = ref([]);

// ===== Filters =====
const selectedMethodFilter = ref('all');
const creationDateRange = ref([]);
const selectedStatusFilter = ref(['all']);
const selectedVisibilityFilter = ref('all');
const selectedOwnershipFilter = ref('all'); // my tests / cooperator
const selectedParticipantsFilter = ref(['all']);

const statusOptions = [
  { value: 'all', text: 'All Statuses' },
  { value: 'active', text: 'Active' },
  { value: 'draft', text: 'Draft' },
  { value: 'completed', text: 'Completed' },
];

const visibilityOptions = [
  { value: 'all', text: 'All Visibility' },
  { value: 'public', text: 'Public' },
  { value: 'private', text: 'Private' },
];

const ownershipOptions = [
  { value: 'all', text: 'All Studies' },
  { value: 'mine', text: 'My Studies' },
  { value: 'cooperator', text: 'Where I Collaborate' },
];

const participantsOptions = [
  { text: 'All', value: 'all' },
  { text: '< 10 participants', value: 'lt10' },
  { text: '10 – 50 participants', value: 'btw10_50' },
  { text: '> 50 participants', value: 'gt50' },
];

const showFilters = ref(false)
const toggleFilters = () => (showFilters.value = !showFilters.value)

const clearFilters = () => {
  search.value = '';
  selectedStatusFilter.value = ['all'];
  selectedVisibilityFilter.value = 'all';
  selectedOwnershipFilter.value = 'all';
  selectedParticipantsFilter.value = 'all';
  selectedMethodFilter.value = 'all';
  creationDateRange.value = [];
  showFilters.value = false;
};

const hasActiveFilters = computed(() => {
  return !!(
    search.value ||
    creationDateRange.value.length > 0 ||
    selectedStatusFilter.value.length > 1 ||
    selectedVisibilityFilter.value != 'all' ||
    selectedOwnershipFilter.value != 'all' ||
    selectedParticipantsFilter.value != 'all' ||
    selectedMethodFilter.value != 'all'
  );
});

// session filters
// Filters específicos de sessions
const selectedSessionOwnershipFilter = ref('all');
const selectedSessionEvaluatorFilter = ref('all');
const selectedSessionStatusFilter = ref(['all']);
const selectedSessionDateRange = ref([]);
const searchSessions = ref('');

// Opções
const evaluatorOptions = computed(() => {
  const evaluatorsSet = new Set();
  filteredModeratedSessions.value.forEach(s => evaluatorsSet.add(s.evaluator));
  return [{ text: 'All', value: 'all' }, ...Array.from(evaluatorsSet).map(ev => ({ text: ev, value: ev }))];
});

const sessionStatusOptions = [
  { value: 'all', text: 'All Statuses' },
  { value: 'today', text: 'Today' },
  { value: 'upcoming', text: 'Upcoming' },
  { value: 'completed', text: 'Completed' },
];


const hasActiveSessionFilters = computed(() => {
  return (
    searchSessions.value.length > 0 ||
    (selectedSessionStatusFilter.value.length > 1 &&
     !selectedSessionStatusFilter.value.includes('all')) ||
    (selectedSessionEvaluatorFilter.value !== 'all' &&
     selectedSessionEvaluatorFilter.value?.length > 0) ||
    selectedSessionOwnershipFilter.value !== 'all' ||
    selectedSessionDateRange.value.length === 2
  );
});

// ===== end filter options ======

const drawerOpen = ref(false);
// const studyController = new StudyController()

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
  if (!tests.value) return [];

  return tests.value.filter(test => {
    const title = (test.testTitle || test.title || '').toLowerCase();
    const query = (search.value || '').toLowerCase();
    const matchesSearch = !query || title.includes(query);

    // 🔹 Method
    let matchesMethod = true;
    if (activeSection.value === 'studies' && test.testType) {
      const method = selectedMethodFilter.value;
      const testType = test.testType;
      const subType = test.subType;

      matchesMethod =
        method === 'all' ||
        (method === METHOD_DEFINITIONS.HEURISTICS.id && testType === STUDY_TYPES.HEURISTIC) ||
        (method === METHOD_DEFINITIONS.USER_UNMODERATED.id &&
          testType === STUDY_TYPES.USER &&
          subType === USER_STUDY_SUBTYPES.UNMODERATED) ||
        (method === METHOD_DEFINITIONS.USER_MODERATED.id &&
          testType === STUDY_TYPES.USER &&
          subType === USER_STUDY_SUBTYPES.MODERATED) ||
        (method === 'MANUAL' && testType === 'MANUAL') ||
        (method === 'AUTOMATIC' && testType === 'AUTOMATIC');
    }

    // 🟩 Status (multi)
    const matchesStatus =
      !selectedStatusFilter.value?.length ||
      selectedStatusFilter.value.includes('all') ||
      selectedStatusFilter.value.includes(test.status);

    // 🔓 Visibility (único)
    const visibility = test.isPublic ? 'public' : 'private';
    const matchesVisibility =
    selectedVisibilityFilter.value === 'all' ||
    selectedVisibilityFilter.value === visibility;

    // 👤 Ownership
    const isMine = test.testAdmin?.userDocId === user.value?.id;
    const isCooperator = test.cooperators?.some(c => c.userDocId === user.value?.id);
    const ownership =
      isMine ? 'mine' : isCooperator ? 'cooperator' : 'other';
    const matchesOwnership =
      !selectedOwnershipFilter.value ||
      selectedOwnershipFilter.value === 'all' ||
      selectedOwnershipFilter.value === ownership;

    // 👥 Participants
    const participants = test.cooperators?.length || 0;
    let matchesParticipants = true;
    switch (selectedParticipantsFilter.value) {
      case 'lt10':
        matchesParticipants = participants < 10;
        break;
      case 'btw10_50':
        matchesParticipants = participants >= 10 && participants <= 50;
        break;
      case 'gt50':
        matchesParticipants = participants > 50;
        break;
      default:
        matchesParticipants = true;
    }

    // 📅 Creation date
    let inCreationRange = true;
    if (creationDateRange.value?.length > 2 && test.creationDate) {
      const creation = new Date(test.creationDate);
      const start = new Date(creationDateRange.value[0]);
      const end = new Date(creationDateRange.value[creationDateRange.value.length -1]);
      inCreationRange = creation >= start && creation <= end;
    }

    return (
      matchesSearch &&
      matchesMethod &&
      matchesStatus &&
      matchesVisibility &&
      matchesOwnership &&
      matchesParticipants &&
      inCreationRange
    );
  });
});

const filteredSessions = computed(() => {
  return filteredModeratedSessions.value.filter(session => {
    // 🔍 Search
    const matchesSearch = !searchSessions.value || session.testTitle.toLowerCase().includes(searchSessions.value.toLowerCase());

    // ⚙️ Status
    const sessionStatus = getSessionStatus(session.testDate).status
    const matchesStatus =
      !selectedSessionStatusFilter.value.length ||
      selectedSessionStatusFilter.value.includes('all') ||
      selectedSessionStatusFilter.value.includes(sessionStatus);

    // 👤 Ownership
    const isMine = session.testAdmin.userDocId === user.value?.id;
    const isCooperator = session.userDocId === user.value?.id;
    const ownership = isMine ? 'mine' : isCooperator ? 'cooperator' : 'other';
    const matchesOwnership =
      selectedSessionOwnershipFilter.value === 'all' || selectedSessionOwnershipFilter.value === ownership;

    // 👥 Evaluator
    const matchesEvaluator =
      selectedSessionEvaluatorFilter.value === 'all' || selectedSessionEvaluatorFilter.value === session.evaluator;

    // 📅 Session date
    let inDateRange = true;
    if (selectedSessionDateRange.value.length > 2 && session.testDate) {
      const date = new Date(session.testDate);
      const start = new Date(selectedSessionDateRange.value[0]);
      const end = new Date(selectedSessionDateRange.value[selectedSessionDateRange.value.length -1]);
      inDateRange = date >= start && date <= end;
    }

    return matchesSearch && 
    matchesStatus && 
    matchesOwnership && 
    matchesEvaluator &&
    inDateRange;
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

const filterModeratedSessions = () => {
  const cooperatorArray = [];

  // Iterate directly through the user's complete tests
  tests.value.forEach((testObj) => {
    if (!testObj) return;

    // If the user is a cooperator in the test
    const cooperatorObj = testObj.cooperators?.find(
      (coop) => coop.userDocId === user.value?.id
    );
    if (cooperatorObj && testObj.subType === USER_STUDY_SUBTYPES.MODERATED) {
      cooperatorArray.push({
        ...cooperatorObj,
        testTitle: testObj.testTitle,
        testAdmin: testObj.testAdmin,
        id: testObj.id,
        testType: testObj.testType,
        subType: testObj.subType,
        testDescription: testObj.testDescription,
        evaluator: cooperatorObj.email,
      });
    }

    // If the user is the test administrator
    if (testObj.testAdmin?.userDocId === user.value?.id && testObj.subType === USER_STUDY_SUBTYPES.MODERATED) {
      testObj.cooperators?.forEach((coop) => {
        cooperatorArray.push({
          ...coop,
          testTitle: testObj.testTitle,
          testAdmin: testObj.testAdmin,
          id: testObj.id,
          testType: testObj.testType,
          subType: testObj.subType,
          evaluator: coop.email, // keeps the evaluator field
          testDescription: testObj.testDescription, // keeps the test description field
        });
      });
    }
  });

  filteredModeratedSessions.value = cooperatorArray;
};

const reloadMyTemplates = async () => {
  tempDialog.value = false
  await getMyTemplates()
}

watch([activeSection, activeSubSection], async ([section, sub]) => {
  switch (section) {
    case 'studies': await getMyPersonalTests(); break;
    case 'sessions': filterModeratedSessions(); break;
    case 'templates': await getMyTemplates(); break;
    case 'community':
      if (sub === 'community-studies') await getPublicStudies();
      else if (sub === 'community-templates') await getPublicTemplates();
      break;
  }
});

onMounted(async () => {
  await getMyPersonalTests();
  filterModeratedSessions()
});

// Event handler function
const handleToggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

onMounted(() => {
  filterModeratedSessions();

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

.button-bar {
  gap: 14px;
}

.search-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
  letter-spacing: .3px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 4px;
  line-height: 1.15;
  color: #475569;
}

.filter-field :deep(.v-field__input) {
  min-height: 36px;
}

.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(11px * 1.15 * 2);
  max-height: calc(11px * 1.15 * 2);
}
</style>
