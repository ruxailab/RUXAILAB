<template>
  <v-app>
    <v-overlay
      v-model="isLoading"
      class="align-center justify-center"
      opacity="0.8"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      ></v-progress-circular>
      <div class="mt-4 text-h6">Loading WCAG Data...</div>
    </v-overlay>

    <v-alert
      v-if="error"
      type="error"
      class="ma-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>
    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <!-- Left Sidebar Navigation -->
        <v-col cols="2" class="sidebar">
          <v-card flat class="h-100" color="grey-lighten-4">
            <v-card-title class="text-h6 pa-4">WCAG Principles</v-card-title>
            <v-list density="compact" class="pa-2" v-if="principles.length > 0">
              <v-list-group
                v-for="(principle, pIdx) in principles"
                :key="principle.id || pIdx"
                :value="(principle?.title || '').toLowerCase()"
                :prepend-icon="getPrincipleIcon(pIdx)"
                :class="{ 'active-principle': selectedPrincipleIdx === pIdx }"
                :active="selectedPrincipleIdx === pIdx"
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :title="principle?.title || 'Untitled Principle'"
                    @click="selectPrinciple(pIdx)"
                  />
                </template>
                <v-list-item
                  v-for="(guideline, gIdx) in principle?.Guidelines || []"
                  :key="guideline?.id || gIdx"
                  prepend-icon="mdi-circle-outline"
                  :title="
                    (guideline?.id || '') + ' ' + (guideline?.title || '')
                  "
                  class="ml-4"
                  :active="
                    selectedGuidelineIdx === gIdx &&
                    selectedPrincipleIdx === pIdx
                  "
                  @click="selectGuideline(gIdx)"
                />
              </v-list-group>
            </v-list>
            <v-list v-else>
              <v-list-item>
                <v-list-item-title class="text-grey">
                  {{ isLoading ? 'Loading...' : 'No principles available' }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content Area -->
        <v-col cols="7" class="main-content">
          <v-card flat class="h-100 pa-6 scrollable-content">
            <!-- Breadcrumb -->
            <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4">
              <template #divider>
                <v-icon icon="mdi-chevron-right" />
              </template>
            </v-breadcrumbs>

            <!-- Page Header -->
            <div class="mb-6">
              <h1 class="text-h4 font-weight-bold mb-2">
                {{ currentRule?.id }} {{ currentRule?.title }}
              </h1>
              <div class="d-flex gap-4 mb-4">
                <v-chip color="grey-lighten-2" variant="elevated" size="small">
                  Level {{ currentRule?.level }}
                </v-chip>
                <v-chip color="grey-lighten-2" variant="elevated" size="small">
                  Version {{ currentRule?.version }}
                </v-chip>
              </div>
            </div>

            <!-- Guideline Box -->
            <v-alert variant="outlined" color="info" class="mb-6">
              <template #prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              <div>
                <div class="font-weight-bold mb-2">
                  Guideline:
                  {{ currentGuideline?.title || 'No guideline selected' }}
                </div>
                <div v-if="currentGuideline">
                  {{
                    currentGuideline.description || 'No description available'
                  }}
                </div>
              </div>
            </v-alert>

            <!-- Success Criterion Section -->
            <div class="mb-6">
              <h2 class="text-h5 font-weight-bold mb-4">Success Criterion</h2>
              <v-card
                variant="outlined"
                class="mb-2"
                style="border: 2px solid #4caf50"
              >
                <v-card-text class="pa-3">
                  <div
                    v-if="!currentRule?.criteria?.length"
                    class="text-caption text-grey"
                  >
                    No success criteria available for this rule.
                  </div>
                  <div v-else class="criteria-list">
                    <div
                      v-for="(crit, cIdx) in currentRule.criteria"
                      :key="cIdx"
                      class="d-flex align-center mb-2"
                    >
                      <v-checkbox
                        v-model="selectedCriteria[cIdx]"
                        @change="addToNotes(crit, cIdx)"
                        hide-details
                        density="compact"
                        class="mr-2"
                      />
                      <pre
                        class="criterion-pre mb-0 text-body-2"
                        style="white-space: pre-wrap"
                        >{{ crit }}</pre
                      >
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Appraiser Notes Section -->
            <div class="my-4">
              <h2 class="text-h5 font-weight-bold mb-4">Appraiser Notes</h2>
              <v-textarea
                v-model="notes"
                variant="outlined"
                rows="6"
                placeholder="Enter your notes here..."
                hide-details
                class="mb-4"
              />
            </div>
            <!-- Severity section -->
            <div>
              <h2 class="text-h5 font-weight-bold mb-4">Severity</h2>
              <v-radio-group v-model="severity" inline>
                <v-radio label="High" value="high" />
                <v-radio label="Medium" value="medium" />
                <v-radio label="Low" value="low" />
              </v-radio-group>
            </div>
            <!-- Status Section -->
            <div>
              <h2 class="text-h5 font-weight-bold mb-4">Status</h2>
              <v-radio-group v-model="status" inline>
                <v-radio label="Pass" value="pass" />
                <v-radio label="Fail" value="fail" />
                <v-radio label="N/A" value="na" />
              </v-radio-group>
            </div>
            <div>
              <v-btn
                prepend-icon="mdi-content-save"
                size="large"
                color="success"
                @click="saveAssessment"
                :loading="isLoading"
                :disabled="!currentRule?.id"
              >
                Save Assessment
              </v-btn>
            </div>
            <v-card flat class="pa-4 mt-4" color="grey-lighten-4">
              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="text"
                  prepend-icon="mdi-chevron-left"
                  color="grey-darken-2"
                  @click="prevRule"
                >
                  Previous
                </v-btn>
                <div class="text-body-2 text-grey-darken-1">
                  Rule {{ selectedRuleIdx + 1 }} of {{ rules?.length || 0 }}
                </div>
                <v-btn
                  variant="flat"
                  append-icon="mdi-chevron-right"
                  color="amber"
                  class="text-black"
                  @click="nextRule"
                >
                  Next
                </v-btn>
              </div>
            </v-card>
          </v-card>
        </v-col>

        <!-- Right Sidebar - Table of Contents -->
        <v-col cols="3" class="toc-sidebar">
          <v-card flat class="h-100" color="grey-lighten-5">
            <v-card-title class="text-h6 pa-4">On this page</v-card-title>
            <v-list density="compact" class="pa-2">
              <template v-if="rules && rules.length > 0">
                <v-list-item
                  v-for="(rule, rIdx) in rules"
                  :key="rule.id || rIdx"
                  prepend-icon="mdi-circle-outline"
                  :title="(rule?.id || '') + ' ' + (rule?.title || '')"
                  :active="selectedRuleIdx === rIdx"
                  class="text-body-2"
                  @click="selectRule(rIdx)"
                />
              </template>
              <v-list-item v-else>
                <v-list-item-title class="text-grey"
                  >No rules available</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Floating Save Button -->
    <v-tooltip location="left">
      <template #activator="{ props }">
        <v-btn
          data-testid="create-test-btn"
          size="large"
          icon
          position="fixed"
          location="bottom right"
          color="#F9A826"
          variant="elevated"
          class="mr-4 mb-5 floating-save-btn"
          rounded="circle"
          v-bind="props"
          @click="saveAssessment"
        >
          <v-icon size="large"> mdi-content-save-outline </v-icon>
        </v-btn>
      </template>
      <span>Save Assessment</span>
    </v-tooltip>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const toast = useToast()
const store = useStore()
const error = ref('')
const selectedCriteria = ref([])

// Computed properties from store
const isLoading = computed(() => store.state.Assessment?.isLoading || false)
const principles = computed(
  () => store.state.Assessment?.wcagData?.principles || [],
)
const selectedPrincipleIdx = computed({
  get: () => store.state.Assessment.selectedPrincipleIdx,
  set: (value) => store.dispatch('Assessment/selectPrinciple', value),
})

const selectedGuidelineIdx = computed({
  get: () => store.state.Assessment.selectedGuidelineIdx,
  set: (value) => store.dispatch('Assessment/selectGuideline', value),
})

const selectedRuleIdx = computed({
  get: () => store.state.Assessment.selectedRuleIdx,
  set: (value) => store.dispatch('Assessment/selectRule', value),
})

const currentPrinciple = computed(
  () => store.getters['Assessment/currentPrinciple'] || {},
)
const currentGuideline = computed(
  () => store.getters['Assessment/currentGuideline'] || {},
)
const currentRule = computed(
  () => store.getters['Assessment/currentRule'] || {},
)
const guidelines = computed(() => currentPrinciple.value?.Guidelines || [])
const rules = computed(() => currentGuideline.value?.rules || [])

// Local refs for form inputs
const notes = ref('')
const severity = ref('')
const status = ref('')

// Get current assessment data
const currentAssessment = computed(() => {
  const ruleId = currentRule.value?.id
  return ruleId ? store.getters['Assessment/getRuleAssessment'](ruleId) : {}
})

// Helper function to get principle icon
const getPrincipleIcon = (index) => {
  switch (index) {
    case 0:
      return 'mdi-eye'
    case 1:
      return 'mdi-mouse'
    case 2:
      return 'mdi-brain'
    default:
      return 'mdi-shield-check'
  }
}

// Initialize the assessment when component mounts
onMounted(async () => {
  try {
    isLoading.value = true
    await store.dispatch('Assessment/initializeAssessment')
  } catch (err) {
    console.error('Failed to initialize assessment:', err)
    error.value =
      'Failed to load assessment data. Please try refreshing the page.'
  } finally {
    isLoading.value = false
  }
})

// Watch for rule changes to update form
watch(
  () => currentRule.value?.id,
  (newRuleId, oldRuleId) => {
    if (newRuleId && newRuleId !== oldRuleId) {
      const assessment =
        store.getters['Assessment/getRuleAssessment'](newRuleId)
      notes.value = assessment.notes || ''
      severity.value = assessment.severity || ''
      status.value = assessment.status || ''

      // Reset selected criteria when rule changes
      selectedCriteria.value = []
    }
  },
  { immediate: true },
)

// Breadcrumb items
const breadcrumbs = computed(() => {
  return [
    {
      title: 'WCAG',
      disabled: false,
      href: '#',
    },
    {
      title: currentPrinciple.value?.title || '',
      disabled: false,
      href: '#',
    },
    {
      title: currentGuideline.value?.title
        ? `${currentGuideline.value.id} ${currentGuideline.value.title}`
        : '',
      disabled: true,
    },
  ]
})

// Navigation handlers
const selectPrinciple = (idx) => {
  store.dispatch('Assessment/selectPrinciple', idx)
}

const selectGuideline = (idx) => {
  store.dispatch('Assessment/selectGuideline', idx)
}

const selectRule = (idx) => {
  store.dispatch('Assessment/selectRule', idx)
}

// Next/Previous navigation
const nextRule = () => {
  store.dispatch('Assessment/nextRule')
}

const prevRule = () => {
  store.dispatch('Assessment/prevRule')
}

// Add selected criteria to notes
const addToNotes = (criterion, index) => {
  const note = `[${index + 1}] ${criterion}\n`
  if (selectedCriteria.value[index]) {
    notes.value = notes.value ? `${notes.value}${note}` : note
  } else {
    // Remove the note if unchecked
    const noteToRemove = `[${index + 1}] ${criterion}\n`
    notes.value = notes.value.replace(noteToRemove, '')
  }
}

// Save assessment
const saveAssessment = async () => {
  try {
    const ruleId = currentRule.value?.id
    if (ruleId) {
      const assessmentData = {
        ruleId,
        notes: notes.value,
        severity: severity.value,
        status: status.value,
      }

      console.log('Saving assessment data:', {
        ruleId,
        ruleTitle: currentRule.value?.title,
        ...assessmentData,
      })

      await store.dispatch('Assessment/updateRuleAssessment', assessmentData)

      // Show success message
      toast.success('Assessment saved successfully')
    }
  } catch (err) {
    console.error('Failed to save assessment:', err)
    error.value = 'Failed to save assessment. Please try again.'
  }
}

// Reset assessment
const resetAssessment = () => {
  if (
    confirm(
      'Are you sure you want to reset all assessment progress? This cannot be undone.',
    )
  ) {
    store.dispatch('Assessment/resetAssessment')
  }
}
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #e0e0e0;
  min-height: 100vh;
  overflow: hidden;
  /* Prevent sidebar scroll */
}

.main-content {
  border-right: 1px solid #e0e0e0;
  min-height: 100vh;
  overflow: hidden;
  /* Prevent scroll on main-content wrapper */
}

.toc-sidebar {
  min-height: 100vh;
  overflow: hidden;
  /* Prevent scroll on right sidebar */
}

/* Highlight active principle tab */
.active-principle {
  background-color: #ffd643 !important;
  color: #222 !important;
}

.active-principle .v-list-item__prepend .v-icon {
  color: #222 !important;
}

.h-100 {
  height: 100%;
}

.scrollable-content {
  overflow-y: auto;
  max-height: 100vh;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 10+ */
}

.scrollable-content::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.criterion-pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  background: none;
  border: none;
  padding: 0;
}

.floating-save-btn {
  position: fixed !important;
  right: 32px;
  bottom: 32px;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>
