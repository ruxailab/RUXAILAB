<template>
  <!-- 🔍 Search and Filters Card -->
  <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
    <!-- 🔹 Top bar: search, reset, toggle filters -->
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
        <v-icon>{{
          showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
        }}</v-icon>
      </v-btn>
    </div>

    <!-- 🔽 Expandable filters section -->
    <v-expand-transition>
      <div v-show="showFilters">
        <v-row dense>
          <!-- 📅 Creation date -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">Creation date</div>
            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
              location="bottom"
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
                  :placeholder="
                    creationDateRange.length > 1
                      ? `${new Date(
                          creationDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          creationDateRange[creationDateRange.length - 1],
                        ).toLocaleDateString()}`
                      : 'Select range'
                  "
                  :model-value="
                    creationDateRange.length > 1
                      ? `${new Date(
                          creationDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          creationDateRange[creationDateRange.length - 1],
                        ).toLocaleDateString()}`
                      : ''
                  "
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <v-date-picker v-model="creationDateRange" multiple="range" />
            </v-menu>
          </v-col>

          <!-- ⚙️ Status filter -->
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

          <!-- 🔹 Method filter -->
          <v-col cols="12" sm="6" md="3">
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

          <!-- 👥 Ownership filter -->
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

          <!-- 👤 Participants filter -->
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

  <!-- 🔹 Empty State (Only shown when no tests exist and not loading) -->
  <div v-if="!loadingStudy && tests && tests.length === 0" class="empty-state text-center pa-10">
    <div class="d-flex justify-center mb-6">
      <v-icon
        icon="mdi-account-group-outline"
        size="120"
        color="grey-lighten-2"
      ></v-icon>
    </div>

    <h2 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
      No community studies available yet
    </h2>
    <p class="text-body-1 text-grey-darken-1 mb-8">
      Be the first to share a study with the RUXAI community!
    </p>

    <v-btn
      color="primary"
      size="x-large"
      prepend-icon="mdi-plus"
      elevation="4"
      rounded="pill"
      height="56"
      class="px-8 font-weight-bold"
      @click="goToCreateTestRoute"
    >
      Create Your First Study
    </v-btn>
  </div>

  <!-- 📋 List of filtered studies -->
  <List v-else :items="filteredTests" type="publicTests" @clicked="goTo" />
</template>

<script setup>
// 🔧 Imports and setup
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import List from '@/shared/components/tables/ListComponent.vue';
import {
  getMethodOptions,
  METHOD_DEFINITIONS,
  METHOD_STATUSES,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES
} from '@/shared/constants/methodDefinitions';

const store = useStore()
const router = useRouter()

const loadingStudy = computed(() => store.getters.loading)

const goToCreateTestRoute = () => {
    router.push('/choose')
}

// ===== Reactive state =====
const search = ref('')
const showFilters = ref(false)

// ===== Filter controls =====
const creationDateRange = ref([])
const selectedMethodFilter = ref('all')
const selectedStatusFilter = ref(['all'])
const selectedVisibilityFilter = ref('all')
const selectedOwnershipFilter = ref('all')
const selectedParticipantsFilter = ref(['all'])

// ===== Filter options =====
const statusOptions = [
  { value: 'all', text: 'All Statuses' },
  { value: 'active', text: 'Active' },
  { value: 'draft', text: 'Draft' },
  { value: 'completed', text: 'Completed' },
]

const ownershipOptions = [
  { value: 'all', text: 'All Studies' },
  { value: 'mine', text: 'My Studies' },
  { value: 'cooperator', text: 'Where I Collaborate' },
]

const participantsOptions = [
  { text: 'All', value: 'all' },
  { text: '< 10 participants', value: 'lt10' },
  { text: '10 – 50 participants', value: 'btw10_50' },
  { text: '> 50 participants', value: 'gt50' },
]

// ===== UI actions =====
const toggleFilters = () => (showFilters.value = !showFilters.value)
const clearFilters = () => {
  // Reset all filters
  search.value = ''
  creationDateRange.value = []
  selectedMethodFilter.value = 'all'
  selectedStatusFilter.value = ['all']
  selectedVisibilityFilter.value = 'all'
  selectedOwnershipFilter.value = 'all'
  selectedParticipantsFilter.value = 'all'
  showFilters.value = false
}

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return !!(
    search.value ||
    creationDateRange.value.length > 0 ||
    selectedStatusFilter.value.length > 1 ||
    selectedOwnershipFilter.value != 'all' ||
    selectedParticipantsFilter.value != 'all' ||
    selectedMethodFilter.value != 'all'
  )
})

// ===== Method options =====
const methodOptions = computed(() => {
  const options = getMethodOptions('es', METHOD_STATUSES.AVAILABLE.id)
  return [
    { value: 'all', text: 'All Methods' },
    ...options.map((option) => ({ value: option.value, text: option.text })),
  ]
})

// ===== Data and filtering logic =====
const tests = computed(() => store.getters.publicTests || [])
const user = computed(() => store.getters.user)

// Apply filters to tests
const filteredTests = computed(() => {
  if (!tests.value) return []
  return tests.value.filter((test) => {
    const title = (test.testTitle || test.title || '').toLowerCase()
    const query = (search.value || '').toLowerCase()
    const matchesSearch = !query || title.includes(query)

    // Filter by method
    let matchesMethod = true
    if (test.testType) {
      const method = selectedMethodFilter.value
      const testType = test.testType
      const subType = test.subType

      matchesMethod =
        method === 'all' ||
        (method === METHOD_DEFINITIONS.HEURISTICS.id &&
          testType === STUDY_TYPES.HEURISTIC) ||
        (method === METHOD_DEFINITIONS.USER_UNMODERATED.id &&
          testType === STUDY_TYPES.USER &&
          subType === USER_STUDY_SUBTYPES.UNMODERATED) ||
        (method === METHOD_DEFINITIONS.USER_MODERATED.id &&
          testType === STUDY_TYPES.USER &&
          subType === USER_STUDY_SUBTYPES.MODERATED)
    }

    // Filter by status
    const matchesStatus =
      !selectedStatusFilter.value?.length ||
      selectedStatusFilter.value.includes('all') ||
      selectedStatusFilter.value.includes(test.status)

    // Filter by ownership
    const isMine = test.testAdmin?.userDocId === user.value?.id
    const isCooperator = test.cooperators?.some(
      (c) => c.userDocId === user.value?.id,
    )
    const ownership = isMine ? 'mine' : isCooperator ? 'cooperator' : 'other'
    const matchesOwnership =
      selectedOwnershipFilter.value === 'all' ||
      selectedOwnershipFilter.value === ownership

    // Filter by participants
    const participants = test.cooperators?.length || 0
    let matchesParticipants = true
    switch (selectedParticipantsFilter.value) {
      case 'lt10':
        matchesParticipants = participants < 10
        break
      case 'btw10_50':
        matchesParticipants = participants >= 10 && participants <= 50
        break
      case 'gt50':
        matchesParticipants = participants > 50
        break
    }

    // Filter by creation date range
    let inCreationRange = true
    if (creationDateRange.value?.length > 1 && test.creationDate) {
      const creation = new Date(test.creationDate)
      const start = new Date(creationDateRange.value[0])
      const end = new Date(
        creationDateRange.value[creationDateRange.value.length - 1],
      )
      inCreationRange = creation >= start && creation <= end
    }

    return (
      matchesSearch &&
      matchesMethod &&
      matchesStatus &&
      matchesOwnership &&
      matchesParticipants &&
      inCreationRange
    )
  })
})

// ===== Navigation =====
const getTestId = (test) => test.testDocId || test.id;
const canManageStudy = (test) => {
  const currentUser = user.value;
  if (!currentUser || !test) return false;
  if (currentUser.accessLevel === 0) return true;
  if (test.testAdmin?.userDocId === currentUser.id) return true;
  const coop = test.cooperators?.find(c => c.userDocId === currentUser.id);
  return coop?.accessLevel === 0;
};

const goTo = (test) => {
  const testId = getTestId(test);
  if (!testId) return;

  if (canManageStudy(test)) {
    navigateToManagerStudy(test, testId);
    return;
  }

  if (test.testType === STUDY_TYPES.ACCESSIBILITY_MANUAL) {
    router.push({ name: 'AccessibilityPreviewTest', params: { id: testId } });
    return;
  }
  if (test.testType === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC) {
    router.push({ name: 'AccessibilityReport', params: { id: testId } });
    return;
  }
  navigateToCommunityStudy(test, testId);
};

const navigateToManagerStudy = (test, testId) => {
  switch (test.testType) {
    case STUDY_TYPES.HEURISTIC:
      router.push({ name: 'HeuristicManagerView', params: { id: testId } });
      break;
    case STUDY_TYPES.CARD_SORTING:
      router.push({ name: 'CardSortingManagerView', params: { id: testId } });
      break;
    case STUDY_TYPES.USER:
      if (test.subType === USER_STUDY_SUBTYPES.UNMODERATED) {
        router.push({ name: 'UserUnmoderatedManagerView', params: { id: testId } });
      } else if (test.subType === USER_STUDY_SUBTYPES.MODERATED) {
        router.push({ name: 'UserModeratedManagerView', params: { id: testId } });
      }
      break;
    default:
      router.push({ name: 'HeuristicManagerView', params: { id: testId } });
      break;
  }
};

const navigateToCommunityStudy = (test, testId) => {
  switch (test.testType) {
    case STUDY_TYPES.HEURISTIC:
      router.push({ name: 'TestView', params: { id: testId } });
      break;
    case STUDY_TYPES.CARD_SORTING:
      router.push({ name: 'CardSortingTestView', params: { id: testId } });
      break;
    case STUDY_TYPES.USER:
      router.push({ name: 'TestView', params: { id: testId } });
      break;
    default:
      router.push({ name: 'TestView', params: { id: testId } });
      break;
  }
}
</script>

<style scoped>
/* 💅 Basic styles for layout and filters */
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
  letter-spacing: 0.3px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
}
</style>
