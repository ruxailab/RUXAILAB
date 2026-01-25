<template>
  <div>
    <!-- 🔹 Empty State (Only shown when no tests exist and not loading) -->
    <div v-if="!loadingStudy && tests && tests.length === 0" class="empty-state text-center pa-10">
      <div class="d-flex justify-center mb-6">
        <v-icon
          icon="mdi-flask-empty-minus-outline"
          size="120"
          color="grey-lighten-2"
        ></v-icon>
      </div>

      <h2 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
        You haven't created any studies yet
      </h2>
      <p class="text-body-1 text-grey-darken-1 mb-8">
        Get started by creating your first study to gather insights.
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

    <!-- 🔹 Existing Content (Shown when tests exist or loading) -->
    <div v-else>
      <!-- 🔹 Search & Filters -->
      <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
        <!-- 🔹 Top bar -->
        <div class="d-flex align-center mb-3 flex-wrap button-bar">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            hide-details
            variant="outlined"
            placeholder="Search studies..."
            class="flex-grow-1"
            bg-color="white"
          />

          <!-- ✨ New Header CTA -->
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            class="create-btn"
            elevation="2"
            @click="goToCreateTestRoute"
          >
            Create New Study
          </v-btn>

          <v-divider vertical class="mx-2 my-1" inset></v-divider>

          <v-btn
            color="primary"
            class="search-btn"
            prepend-icon="mdi-filter-remove"
            variant="text"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          >
            Reset
          </v-btn>

          <v-btn
            :color="showFilters ? 'primary' : 'grey-darken-1'"
            variant="tonal"
            icon
            size="small"
            class="filter-toggle-btn"
            :title="showFilters ? 'Hide filters' : 'Show filters'"
            @click="toggleFilters"
          >
            <v-icon>{{ showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant' }}</v-icon>
          </v-btn>
        </div>

        <!-- 🔹 Expanded filters -->
        <v-expand-transition>
          <div v-show="showFilters" class="mt-4 pt-4 border-t">
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
                        ? `${new Date(creationDateRange[0]).toLocaleDateString()} - ${new Date(creationDateRange[creationDateRange.length - 1]).toLocaleDateString()}`
                        : 'Select range'"
                      :model-value="creationDateRange.length > 1
                        ? `${new Date(creationDateRange[0]).toLocaleDateString()} - ${new Date(creationDateRange[creationDateRange.length - 1]).toLocaleDateString()}`
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
              <v-col cols="12" sm="6" md="3">
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

              <!-- 🧭 Method -->
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

      <!-- 📋 Study list -->
      <List :items="filteredTests" type="myTests" @clicked="goTo" />
    </div>
  </div>
</template>

<script setup>
// ===== Imports =====
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import List from '@/shared/components/tables/ListComponent.vue'
import {
  getMethodManagerView,
  getMethodOptions,
  METHOD_DEFINITIONS,
  METHOD_STATUSES,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES
} from '@/shared/constants/methodDefinitions'

// ===== Setup =====
const store = useStore()
const router = useRouter()
const search = ref('')

// ===== Filter state =====
const selectedMethodFilter = ref('all')
const creationDateRange = ref([])
const selectedStatusFilter = ref(['all'])
const selectedVisibilityFilter = ref('all')
const selectedOwnershipFilter = ref('all')
const selectedParticipantsFilter = ref(['all'])

const showFilters = ref(false)
const toggleFilters = () => (showFilters.value = !showFilters.value)

// ===== Loading State =====
const loadingStudy = computed(() => store.getters.loading)

// ===== Filter options =====
const statusOptions = [
  { value: 'all', text: 'All Statuses' },
  { value: 'active', text: 'Active' },
  { value: 'draft', text: 'Draft' },
  { value: 'completed', text: 'Completed' }
]

const visibilityOptions = [
  { value: 'all', text: 'All Visibility' },
  { value: 'public', text: 'Public' },
  { value: 'private', text: 'Private' }
]

const ownershipOptions = [
  { value: 'all', text: 'All Studies' },
  { value: 'mine', text: 'My Studies' },
  { value: 'cooperator', text: 'Where I Collaborate' }
]

const participantsOptions = [
  { text: 'All', value: 'all' },
  { text: '< 10 participants', value: 'lt10' },
  { text: '10 – 50 participants', value: 'btw10_50' },
  { text: '> 50 participants', value: 'gt50' }
]

// ===== Helpers =====
const clearFilters = () => {
  search.value = ''
  selectedStatusFilter.value = ['all']
  selectedVisibilityFilter.value = 'all'
  selectedOwnershipFilter.value = 'all'
  selectedParticipantsFilter.value = 'all'
  selectedMethodFilter.value = 'all'
  creationDateRange.value = []
  showFilters.value = false
}

const hasActiveFilters = computed(() =>
  !!(
    search.value ||
    creationDateRange.value.length > 0 ||
    selectedStatusFilter.value.length > 1 ||
    selectedVisibilityFilter.value != 'all' ||
    selectedOwnershipFilter.value != 'all' ||
    selectedParticipantsFilter.value != 'all' ||
    selectedMethodFilter.value != 'all'
  )
)

// ===== Method options =====
const methodOptions = computed(() => {
  const options = getMethodOptions('en', METHOD_STATUSES.AVAILABLE.id)
  return [{ value: 'all', text: 'All Methods' }, ...options]
})

// ===== Filtered list =====
const tests = computed(() => store.getters.tests || [])
const user = computed(() => store.getters.user)

const filteredTests = computed(() => {
  if (!tests.value) return []

  return tests.value.filter(test => {
    const title = (test.testTitle || test.title || '').toLowerCase()
    const query = (search.value || '').toLowerCase()
    const matchesSearch = !query || title.includes(query)

    // 🔹 Method
    let matchesMethod = true
    if (test.testType) {
      const method = selectedMethodFilter.value
      const testType = test.testType
      const subType = test.subType

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
        (method === 'AUTOMATIC' && testType === 'AUTOMATIC')
    }

    // 🟩 Status
    const matchesStatus =
      !selectedStatusFilter.value?.length ||
      selectedStatusFilter.value.includes('all') ||
      selectedStatusFilter.value.includes(test.status)

    // 🔓 Visibility
    const visibility = test.isPublic ? 'public' : 'private'
    const matchesVisibility =
      selectedVisibilityFilter.value === 'all' ||
      selectedVisibilityFilter.value === visibility

    // 👤 Ownership
    const isMine = test.testAdmin?.userDocId === user.value?.id
    const isCooperator = test.cooperators?.some(c => c.userDocId === user.value?.id)
    const ownership = isMine ? 'mine' : isCooperator ? 'cooperator' : 'other'
    const matchesOwnership =
      selectedOwnershipFilter.value === 'all' ||
      selectedOwnershipFilter.value === ownership

    // 👥 Participants
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

    // 📅 Creation date
    let inCreationRange = true
    if (creationDateRange.value?.length > 1 && test.creationDate) {
      const start = new Date(creationDateRange.value[0])
      const end = new Date(creationDateRange.value[creationDateRange.value.length - 1])
      inCreationRange = new Date(test.creationDate) >= start && new Date(test.creationDate) <= end
    }

    return (
      matchesSearch &&
      matchesMethod &&
      matchesStatus &&
      matchesVisibility &&
      matchesOwnership &&
      matchesParticipants &&
      inCreationRange
    )
  })
})

// ===== Navigation =====
const goTo = test => {
  // Handle manual/automatic studies
  if (test.testType === STUDY_TYPES.ACCESSIBILITY_MANUAL) {
    router.push(`/accessibility/manual/${test.testDocId || test.id}`)
    return
  }

  if (test.testType === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC) {
    router.push(`/accessibility/automatic/${test.testDocId || test.id}`)
    return
  }

  const methodView = getMethodManagerView(test.testType, test.subType)
  router.push({ name: methodView, params: { id: test.testDocId || test.id } })
}

const goToCreateTestRoute = () => {
    router.push('/choose')
}
</script>

<style scoped>
.button-bar {
  gap: 12px;
}
.search-btn {
  /* min-width: 100px; */
  height: 40px;
  font-weight: 600;
}
.create-btn {
  height: 40px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.3px;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 4px;
  color: #475569;
}
.filter-field :deep(.v-field__input) {
  min-height: 36px;
}
.empty-state {
  margin-top: 80px;
}
</style>
