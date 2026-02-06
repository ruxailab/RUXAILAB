<template>
  <!-- 🔹 Search & Filters Card -->
  <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
    <div class="d-flex align-center mb-3 flex-wrap button-bar">
      <!-- 🔍 Search bar -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        variant="outlined"
        :placeholder="$t('community.templates.searchPlaceholder')"
        class="flex-grow-1"
      />

      <!-- ♻️ Reset filters button -->
      <v-btn
        color="primary"
        class="search-btn"
        prepend-icon="mdi-filter-remove"
        :disabled="!hasActiveFilters"
        @click="clearFilters"
      >
        {{ $t('community.reset') }}
      </v-btn>

      <!-- 🎛️ Toggle filter visibility button -->
      <v-btn
        :color="showFilters ? 'primary' : 'grey'"
        variant="tonal"
        icon
        size="small"
        :title="
          showFilters
            ? $t('community.hideFilters')
            : $t('community.showFilters')
        "
        @click="toggleFilters"
      >
        <v-icon>{{
          showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
        }}</v-icon>
      </v-btn>
    </div>

    <!-- 🔽 Expandable filter section -->
    <v-expand-transition>
      <div v-show="showFilters">
        <v-row dense>
          <!-- 📅 Filter by creation date range -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">
              {{ $t('community.filters.creationDate') }}
            </div>
            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ props }">
                <!-- Shows the selected date range -->
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
                      : $t('community.selectRange')
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
              <!-- Vuetify date picker with range selection -->
              <v-date-picker v-model="creationDateRange" multiple="range" />
            </v-menu>
          </v-col>

          <!-- 🧭 Filter by method -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">{{ $t('community.filters.method') }}</div>
            <v-select
              v-model="selectedMethodFilter"
              :items="methodOptions"
              item-title="title"
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

  <!-- 📋 Template list table -->
  <ListComponent
    :items="
      filteredTemplates.sort(
        (a, b) => (b.header.creationDate || 0) - (a.header.creationDate || 0),
      )
    "
    type="publicTemplates"
    @clicked="setupTempDialog"
  />

  <!-- 🪟 Template details dialog -->
  <TemplateInfoDialog
    v-model:dialog="tempDialog"
    :template="temp"
    :allow-create="true"
    @close="reloadMyTemplates()"
  />
</template>

<script setup>
/**
 * This component displays a list of public templates with
 * a search bar, filter controls, and a dialog for viewing template details.
 */
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import {
  METHOD_DEFINITIONS,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import ListComponent from '@/shared/components/tables/ListComponent.vue'
import TemplateInfoDialog from '@/shared/components/dialogs/TemplateInfoDialog.vue'
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

// ===== State =====
const temp = ref({}) // Current selected template
const tempDialog = ref(false) // Controls dialog visibility
const templates = computed(() => store.state.Templates.templates || []) // All templates from Vuex

// ===== Filter controls =====
const search = ref('')
const showFilters = ref(false)
const selectedMethodFilter = ref('all')
const creationDateRange = ref([])

// Available filtering options for method types
const methodOptions = computed(() => [
  { title: t('community.method.all'), value: 'all' },
  {
    title: t('community.method.heuristicEvaluation'),
    value: METHOD_DEFINITIONS.HEURISTICS.id,
  },
  {
    title: t('community.method.unmoderatedUserTest'),
    value: METHOD_DEFINITIONS.USER_UNMODERATED.id,
  },
  {
    title: t('community.method.moderatedUserTest'),
    value: METHOD_DEFINITIONS.USER_MODERATED.id,
  },
  { title: t('community.method.accessibilityManual'), value: 'MANUAL' },
  { title: t('community.method.accessibilityAutomatic'), value: 'AUTOMATIC' },
])

// ===== Filter logic =====
const toggleFilters = () => (showFilters.value = !showFilters.value)

const clearFilters = () => {
  search.value = ''
  selectedMethodFilter.value = 'all'
  creationDateRange.value = []
}

// Determines whether there are any active filters
const hasActiveFilters = computed(
  () =>
    !!(
      search.value ||
      selectedMethodFilter.value !== 'all' ||
      creationDateRange.value.length
    ),
)

// ===== Template filtering =====
const filteredTemplates = computed(() =>
  templates.value?.filter((temp) => {
    // 🔍 Text search filter
    const matchesSearch = temp.header.templateTitle
      .toLowerCase()
      .includes(search.value.toLowerCase())

    // 🎛️ Method filter
    const method = selectedMethodFilter.value
    const testType = temp.header.templateType
    const subType = temp.header.templateSubType

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
      (method === 'AUTOMATIC' && testType === 'AUTOMATIC')

    // 📅 Date range filter
    const creationDate = temp.header?.creationDate
    let inDateRange = true
    if (creationDateRange.value.length > 1 && creationDate) {
      const date = new Date(creationDate)
      const start = new Date(creationDateRange.value[0])
      const end = new Date(
        creationDateRange.value[creationDateRange.value.length - 1],
      )
      inDateRange = date >= start && date <= end
    }

    return matchesSearch && matchesMethod && inDateRange
  }),
)

// ===== Dialog handling =====
const setupTempDialog = (template) => {
  if (!template?.header || !template?.body) return
  temp.value = { ...template }
  tempDialog.value = true
}

// ===== Data fetching =====
const getPublicTemplates = () => store.dispatch('getPublicTemplates')

const reloadMyTemplates = async () => {
  tempDialog.value = false
  await getPublicTemplates()
}
</script>

<style scoped>
/* === General styles for layout and filters === */
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

/* Truncate long text in 2 lines */
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
