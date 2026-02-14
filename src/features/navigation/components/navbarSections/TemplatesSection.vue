<template>
  <!-- 🔹 Search & Filters -->
  <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
    <div class="d-flex align-center mb-3 flex-wrap button-bar">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        variant="outlined"
        :placeholder="t('pages.templates.searchPlaceholder')"
        class="flex-grow-1"
      />
      <v-btn
        color="primary"
        class="search-btn"
        prepend-icon="mdi-filter-remove"
        :disabled="!hasActiveFilters"
        @click="clearFilters"
      >
        {{ t('pages.templates.reset') }}
      </v-btn>

      <v-btn
        :color="showFilters ? 'primary' : 'grey'"
        variant="tonal"
        icon
        size="small"
        :title="
          showFilters
            ? t('pages.templates.hideFilters')
            : t('pages.templates.showFilters')
        "
        @click="toggleFilters"
      >
        <v-icon>{{
          showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
        }}</v-icon>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-show="showFilters">
        <v-row dense>
          <!-- 📅 Creation date -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">
              {{ t('pages.templates.creationDate') }}
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
                      : t('pages.templates.selectRange')
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

          <!-- 🧭 Method -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">{{ t('pages.templates.method') }}</div>
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

  <!-- 📋 Templates list -->
  <List
    :items="filteredTemplates"
    type="myTemplates"
    :is-filtered="hasActiveFilters"
    @clicked="setupTempDialog"
  />

  <!-- 🪟 Template dialog -->
  <TemplateInfoDialog
    v-model:dialog="tempDialog"
    :template="temp"
    :allow-create="true"
    @close="reloadMyTemplates()"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import List from '@/shared/components/tables/ListComponent.vue'
import {
  METHOD_DEFINITIONS,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import TemplateInfoDialog from '@/shared/components/dialogs/TemplateInfoDialog.vue'

const store = useStore()
const { t } = useI18n()

const tempDialog = ref(false)
const temp = ref({})
const templates = computed(() => store.state.Templates.templates || [])

// ===== Filters =====
const methodOptions = computed(() => [
  { title: t('pages.templates.filters.allMethods'), value: 'all' },
  {
    title: t('pages.templates.filters.heuristicEvaluation'),
    value: METHOD_DEFINITIONS.HEURISTICS.id,
  },
  {
    title: t('pages.templates.filters.userUnmoderated'),
    value: METHOD_DEFINITIONS.USER_UNMODERATED.id,
  },
  {
    title: t('pages.templates.filters.userModerated'),
    value: METHOD_DEFINITIONS.USER_MODERATED.id,
  },
  { title: t('pages.templates.filters.manualAccessibility'), value: 'MANUAL' },
  {
    title: t('pages.templates.filters.automaticAccessibility'),
    value: 'AUTOMATIC',
  },
])

const search = ref('')
const showFilters = ref(false)
const selectedMethodFilter = ref('all')
const creationDateRange = ref([])

const toggleFilters = () => (showFilters.value = !showFilters.value)
const clearFilters = () => {
  search.value = ''
  selectedMethodFilter.value = 'all'
  creationDateRange.value = []
}

const hasActiveFilters = computed(
  () =>
    !!(
      search.value ||
      selectedMethodFilter.value !== 'all' ||
      creationDateRange.value.length
    ),
)

// ===== Filtered templates =====
const filteredTemplates = computed(() =>
  templates.value?.filter((temp) => {
    const matchesSearch = temp.header.templateTitle
      .toLowerCase()
      .includes(search.value.toLowerCase())

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

// ===== Methods =====
const setupTempDialog = (template) => {
  if (!template?.header || !template?.body) return
  temp.value = { ...template }
  tempDialog.value = true
}

const getMyTemplates = () => store.dispatch('getTemplatesOfUser')

const reloadMyTemplates = async () => {
  tempDialog.value = false
  await getMyTemplates()
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
</style>
