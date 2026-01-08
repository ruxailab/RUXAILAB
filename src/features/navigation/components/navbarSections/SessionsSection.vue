<template>
  <!-- 🔍 Search + Filters for sessions -->
  <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
    <div class="d-flex align-center mb-3 flex-wrap button-bar">
      <!-- Search input -->
      <v-text-field
        v-model="searchSessions"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        variant="outlined"
        placeholder="Search sessions..."
        class="flex-grow-1"
      />

      <!-- Reset filters button -->
      <v-btn
        color="primary"
        class="search-btn"
        prepend-icon="mdi-filter-remove"
        :disabled="!hasActiveSessionFilters"
        @click="
          () => {
            searchSessions = ''
            selectedSessionStatusFilter = ['all']
            selectedSessionOwnershipFilter = 'all'
            selectedSessionEvaluatorFilter = 'all'
            selectedSessionDateRange = []
          }
        "
      >
        Reset
      </v-btn>

      <!-- Toggle filters visibility -->
      <v-btn
        :color="showFilters ? 'primary' : 'grey'"
        variant="tonal"
        icon
        size="small"
        @click="toggleFilters"
      >
        <v-icon>{{
          showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
        }}</v-icon>
      </v-btn>
    </div>

    <!-- Expandable section with filters -->
    <v-expand-transition>
      <div v-show="showFilters">
        <v-row dense>
          <!-- 👤 Ownership filter -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">Ownership</div>
            <v-select
              v-model="selectedSessionOwnershipFilter"
              :items="ownershipOptions"
              item-title="text"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- 👥 Evaluator filter -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">Evaluator</div>
            <v-select
              v-model="selectedSessionEvaluatorFilter"
              :items="evaluatorOptions"
              item-title="text"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- 📅 Session date range filter -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">Session date</div>
            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
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
                    selectedSessionDateRange.length > 1
                      ? `${new Date(
                          selectedSessionDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          selectedSessionDateRange[
                            selectedSessionDateRange.length - 1
                          ],
                        ).toLocaleDateString()}`
                      : 'Select range'
                  "
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <!-- Vuetify date picker (supports range mode) -->
              <v-date-picker
                v-model="selectedSessionDateRange"
                multiple="range"
              />
            </v-menu>
          </v-col>

          <!-- ⚙️ Status filter -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">Status</div>
            <v-select
              v-model="selectedSessionStatusFilter"
              :items="sessionStatusOptions"
              item-title="text"
              item-value="value"
              multiple
              chips
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-card>

  <!-- 🧾 Session list -->
  <List
    v-if="filteredSessions.length > 0"
    :items="filteredSessions"
    type="sessions"
    :sort-by="[{ key: 'testDate', order: 'desc' }]"
    @clicked="goTo"
  />

  <!-- 🕓 Empty state (no sessions found) -->
  <div v-else class="empty-state">
    <v-icon
      icon="mdi-clock-remove-outline"
      size="48"
      color="grey-lighten-1"
      class="mb-2"
    />
    <p class="text-h6">You don't have active sessions</p>
  </div>
</template>

<script setup>
// ===== Imports =====
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import List from '@/shared/components/tables/ListComponent.vue'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import {
  getSessionStatus,
  SESSION_STATUSES,
} from '@/shared/utils/sessionsUtils'

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
})

// ===== State and setup =====
const store = useStore()
const router = useRouter()
const activeSection = ref('dashboard')

// ===== Filter options =====

// Ownership dropdown options
const ownershipOptions = [
  { value: 'all', text: 'All Studies' },
  { value: 'mine', text: 'My Studies' },
  { value: 'cooperator', text: 'Where I Collaborate' },
]

// Filter visibility toggle
const showFilters = ref(false)
const toggleFilters = () => (showFilters.value = !showFilters.value)

// Selected filter states
const selectedSessionOwnershipFilter = ref('all')
const selectedSessionEvaluatorFilter = ref('all')
const selectedSessionStatusFilter = ref(['all'])
const selectedSessionDateRange = ref([])
const searchSessions = ref('')

// Dynamically build evaluator dropdown based on sessions
const evaluatorOptions = computed(() => {
  const evaluatorsSet = new Set()
  props.sessions.forEach((s) => evaluatorsSet.add(s.evaluator))
  return [
    { text: 'All', value: 'all' },
    ...Array.from(evaluatorsSet).map((ev) => ({ text: ev, value: ev })),
  ]
})

// Session status options
const sessionStatusOptions = [
  { value: 'all', text: 'All Statuses' },
  { value: 'today', text: 'Today' },
  { value: 'upcoming', text: 'Upcoming' },
  { value: 'completed', text: 'Completed' },
]

// Whether filters are currently active (to enable/disable reset button)
const hasActiveSessionFilters = computed(() => {
  return (
    searchSessions.value.length > 0 ||
    (selectedSessionStatusFilter.value.length > 1 &&
      !selectedSessionStatusFilter.value.includes('all')) ||
    (selectedSessionEvaluatorFilter.value !== 'all' &&
      selectedSessionEvaluatorFilter.value?.length > 0) ||
    selectedSessionOwnershipFilter.value !== 'all' ||
    selectedSessionDateRange.value.length === 2
  )
})

// ===== Main session filtering logic =====
const user = computed(() => store.getters.user)

const filteredSessions = computed(() => {
  return props.sessions.filter((session) => {
    // 🔍 Search filter
    const matchesSearch =
      !searchSessions.value ||
      session.testTitle
        .toLowerCase()
        .includes(searchSessions.value.toLowerCase())

    // ⚙️ Status filter (based on test date)
    const sessionStatus = getSessionStatus(session.testDate).status
    const matchesStatus =
      !selectedSessionStatusFilter.value.length ||
      selectedSessionStatusFilter.value.includes('all') ||
      selectedSessionStatusFilter.value.includes(sessionStatus)

    // 👤 Ownership filter
    const isMine = session.testAdmin.userDocId === user.value?.id
    const isCooperator = session.userDocId === user.value?.id
    const ownership = isMine ? 'mine' : isCooperator ? 'cooperator' : 'other'
    const matchesOwnership =
      selectedSessionOwnershipFilter.value === 'all' ||
      selectedSessionOwnershipFilter.value === ownership

    // 👥 Evaluator filter
    const matchesEvaluator =
      selectedSessionEvaluatorFilter.value === 'all' ||
      selectedSessionEvaluatorFilter.value === session.evaluator

    // 📅 Date range filter
    let inDateRange = true
    if (selectedSessionDateRange.value.length > 1 && session.testDate) {
      const date = new Date(session.testDate)
      const start = new Date(selectedSessionDateRange.value[0])
      const end = new Date(
        selectedSessionDateRange.value[
          selectedSessionDateRange.value.length - 1
        ],
      )
      inDateRange = date >= start && date <= end
    }

    // ✅ Final inclusion condition
    return (
      matchesSearch &&
      matchesStatus &&
      matchesOwnership &&
      matchesEvaluator &&
      inDateRange
    )
  })
})

// ===== Navigation logic =====
const goTo = (test) => {
  // Open MANUAL accessibility test view
  if (test.testType === STUDY_TYPES.ACCESSIBILITY_MANUAL) {
    const baseUrl =
      activeSection.value === 'studies' ? test.testDocId || test.id : test.id
    router.push(`/accessibility/manual/${baseUrl}`)
    return
  }

  // Open AUTOMATIC accessibility test view
  if (test.testType === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC) {
    const baseUrl =
      activeSection.value === 'studies' ? test.testDocId || test.id : test.id
    router.push(`/accessibility/automatic/${baseUrl}`)
    return
  }

  // Navigate to live session view if available today
  const canNavigateToSession = (testDate) =>
    getSessionStatus(testDate) === SESSION_STATUSES.TODAY
  if (canNavigateToSession(test.testDate)) {
    router.push(`testview/${test.id}/${user.value.id}`)
  }
}
</script>

<style scoped>
/* 🧾 Empty state styling */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Filter section button bar */
.button-bar {
  gap: 14px;
}

/* Reset/Search button styling */
.search-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Filter label (small uppercase label above inputs) */
.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  line-height: 1.15;
  color: #475569;
}

/* Compact filter fields */
.filter-field :deep(.v-field__input) {
  min-height: 36px;
}

/* Utility class to truncate text to 2 lines */
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
