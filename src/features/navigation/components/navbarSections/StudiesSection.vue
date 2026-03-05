<template>
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
        :placeholder="$t('pages.studies.searchPlaceholder')"
        class="flex-grow-1"
      />
      <v-btn
        color="primary"
        class="search-btn"
        prepend-icon="mdi-filter-remove"
        :disabled="!hasActiveFilters"
        @click="clearFilters"
      >
        {{ $t('pages.studies.reset') }}
      </v-btn>

      <v-btn
        :color="showFilters ? 'primary' : 'grey'"
        variant="tonal"
        icon
        size="small"
        :title="
          showFilters
            ? $t('pages.studies.hideFilters')
            : $t('pages.studies.showFilters')
        "
        @click="toggleFilters"
      >
        <v-icon>{{
          showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
        }}</v-icon>
      </v-btn>
    </div>

    <!-- 🔹 Expanded filters -->
    <v-expand-transition>
      <div v-show="showFilters">
        <v-row dense>
          <!-- 📅 Creation date -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">
              {{ $t('pages.studies.creationDate') }}
            </div>
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
                    creationDateRange.length > 1
                      ? `${new Date(
                          creationDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          creationDateRange[creationDateRange.length - 1],
                        ).toLocaleDateString()}`
                      : $t('pages.studies.selectRange')
                  "
                  prepend-inner-icon="mdi-calendar"
                  :model-value="
                    creationDateRange.length > 1
                      ? `${new Date(
                          creationDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          creationDateRange[creationDateRange.length - 1],
                        ).toLocaleDateString()}`
                      : ''
                  "
                />
              </template>
              <v-date-picker v-model="creationDateRange" multiple="range" />
            </v-menu>
          </v-col>

          <!-- ⚙️ Status -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">
              {{ $t('pages.studies.statusLabel') }}
            </div>
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
            <div class="filter-label">{{ $t('pages.studies.visibility') }}</div>
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
            <div class="filter-label">{{ $t('pages.studies.method') }}</div>
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
            <div class="filter-label">{{ $t('pages.studies.ownership') }}</div>
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
            <div class="filter-label">
              {{ $t('pages.studies.participants') }}
            </div>
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
  <List
    :items="filteredTests"
    type="myTests"
    :is-filtered="hasActiveFilters"
    @clicked="goTo"
  />
</template>

<script setup>
// ===== Imports =====
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import List from '@/shared/components/tables/ListComponent.vue'
import {
  getMethodManagerView,
  getMethodOptions,
  METHOD_DEFINITIONS,
  METHOD_STATUSES,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

// ===== Setup =====
const store = useStore()
const router = useRouter()
const { t } = useI18n()
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

// ===== Filter options =====
const statusOptions = computed(() => [
  { value: 'all', text: t('pages.studies.filters.allStatuses') },
  { value: 'active', text: t('pages.studies.filters.active') },
  { value: 'draft', text: t('pages.studies.filters.draft') },
  { value: 'completed', text: t('pages.studies.filters.completed') },
])

const visibilityOptions = computed(() => [
  { value: 'all', text: t('pages.studies.filters.allVisibility') },
  { value: 'public', text: t('pages.studies.filters.public') },
  { value: 'private', text: t('pages.studies.filters.private') },
])

const ownershipOptions = computed(() => [
  { value: 'all', text: t('pages.studies.filters.allStudies') },
  { value: 'mine', text: t('pages.studies.filters.myStudies') },
  { value: 'cooperator', text: t('pages.studies.filters.whereICollaborate') },
])

const participantsOptions = computed(() => [
  { text: t('common.all'), value: 'all' },
  { text: t('pages.studies.filters.lessThan10'), value: 'lt10' },
  { text: t('pages.studies.filters.between10And50'), value: 'btw10_50' },
  { text: t('pages.studies.filters.moreThan50'), value: 'gt50' },
])

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

const hasActiveFilters = computed(
  () =>
    !!(
      search.value ||
      creationDateRange.value.length > 0 ||
      selectedStatusFilter.value.length > 1 ||
      selectedVisibilityFilter.value != 'all' ||
      selectedOwnershipFilter.value != 'all' ||
      selectedParticipantsFilter.value != 'all' ||
      selectedMethodFilter.value != 'all'
    ),
)

// ===== Method options =====
const methodOptions = computed(() => {
  const options = getMethodOptions(t.value, METHOD_STATUSES.AVAILABLE.id)
  return [
    { value: 'all', text: t('pages.studies.filters.allMethods') },
    ...options.map((opt) => ({
      ...opt,
      text: t(`methods.definitions.${opt.value}`),
    })),
  ]
})

// ===== Filtered list =====
const tests = computed(() => store.getters.tests || [])
const user = computed(() => store.getters.user)

const filteredTests = computed(() => {
  if (!tests.value) return []

  return tests.value.filter((test) => {
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
        (method === METHOD_DEFINITIONS.HEURISTICS.id &&
          testType === STUDY_TYPES.HEURISTIC) ||
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
    const isCooperator = test.cooperators?.some(
      (c) => c.userDocId === user.value?.id,
    )
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
      const end = new Date(
        creationDateRange.value[creationDateRange.value.length - 1],
      )
      inCreationRange =
        new Date(test.creationDate) >= start &&
        new Date(test.creationDate) <= end
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
const goTo = (test) => {
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
</script>

<style scoped>
.button-bar {
  gap: 14px;
}
.search-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  color: #475569;
}
.filter-field :deep(.v-field__input) {
  min-height: 36px;
}
</style>
