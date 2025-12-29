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
        placeholder="Search templates..."
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

          <!-- 🧭 Method -->
          <v-col cols="12" sm="6" md="3">
            <div class="filter-label">Method</div>
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import List from '@/shared/components/tables/ListComponent.vue'
import { METHOD_DEFINITIONS, STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'
import TemplateInfoDialog from '@/shared/components/dialogs/TemplateInfoDialog.vue'

const store = useStore()

const tempDialog = ref(false)
const temp = ref({})
const templates = computed(() => store.state.Templates.templates || [])

// ===== Filters =====
const methodOptions = [
  { title: 'All', value: 'all' },
  { title: 'Heuristic Evaluation', value: METHOD_DEFINITIONS.HEURISTICS.id },
  { title: 'User Study (Unmoderated)', value: METHOD_DEFINITIONS.USER_UNMODERATED.id },
  { title: 'User Study (Moderated)', value: METHOD_DEFINITIONS.USER_MODERATED.id },
  { title: 'Manual Accessibility', value: 'MANUAL' },
  { title: 'Automatic Accessibility', value: 'AUTOMATIC' }
]

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

const hasActiveFilters = computed(() =>
  !!(search.value || selectedMethodFilter.value !== 'all' || creationDateRange.value.length)
)

// ===== Filtered templates =====
const filteredTemplates = computed(() =>
  templates.value?.filter(temp => {
    const matchesSearch = temp.header.templateTitle
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const method = selectedMethodFilter.value
    const testType = temp.header.templateType
    const subType = temp.header.templateSubType

    const matchesMethod =
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

    const creationDate = temp.header?.creationDate
    let inDateRange = true;
    if (creationDateRange.value.length > 1 && creationDate) {
      const date = new Date(creationDate);
      const start = new Date(creationDateRange.value[0]);
      const end = new Date(creationDateRange.value[creationDateRange.value.length - 1]);
      inDateRange = date >= start && date <= end;
    }

    return matchesSearch && matchesMethod && inDateRange
  })
)

// ===== Methods =====
const setupTempDialog = template => {
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
</style>
