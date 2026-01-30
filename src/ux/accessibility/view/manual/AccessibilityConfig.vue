<template>
  <PageWrapper
    title="Accessibility Configuration"
    :loading="isLoading"
    loading-text="Loading accessibility configuration..."
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Set up and customize your accessibility test parameters
      </p>
    </template>

    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Compact Header -->
        <v-card class="mb-3" elevation="2" rounded="lg">
          <v-card-title
            class="text-h6 font-weight-bold pa-4 d-flex align-center"
          >
            <v-icon color="primary" class="mr-2" size="24"> mdi-cog </v-icon>
            Accessibility Configuration
            <v-spacer />
            <v-chip
              :color="step === 1 ? 'primary' : 'success'"
              variant="flat"
              size="small"
            >
              Step {{ step }}/2
            </v-chip>
          </v-card-title>
        </v-card>

        <!-- Step 1: Compliance Level Selection -->
        <v-card v-if="step === 1" elevation="2" rounded="lg" class="mb-3">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-2">
            <v-icon color="primary" class="mr-2" size="18">
              mdi-shield-check
            </v-icon>
            WCAG Compliance Level
          </v-card-title>

          <v-card-text class="pa-4 pt-1">
            <v-alert
              color="info"
              variant="tonal"
              class="mb-4"
              density="compact"
            >
              <template #prepend>
                <v-icon size="18"> mdi-information </v-icon>
              </template>
              <div class="text-body-2">
                Select the WCAG compliance level for your accessibility
                requirements.
              </div>
            </v-alert>

            <v-radio-group v-model="selectedCompliance" class="mb-4">
              <v-row dense>
                <v-col
                  v-for="level in complianceLevels"
                  :key="level.value"
                  cols="12"
                  sm="6"
                  md="4"
                  class="pa-1"
                >
                  <v-card
                    :class="[
                      'compliance-card cursor-pointer',
                      selectedCompliance === level.value
                        ? 'selected-compliance'
                        : '',
                    ]"
                    :variant="
                      selectedCompliance === level.value ? 'flat' : 'outlined'
                    "
                    elevation="1"
                    hover
                    @click="selectedCompliance = level.value"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-radio
                          :value="level.value"
                          :color="level.color"
                          hide-details
                          class="mr-2"
                          readonly
                        />
                        <v-chip
                          :color="level.color"
                          :variant="
                            selectedCompliance === level.value
                              ? 'flat'
                              : 'outlined'
                          "
                          size="small"
                          class="font-weight-bold"
                        >
                          {{ level.value }}
                        </v-chip>
                      </div>

                      <div class="mb-2">
                        <h4 class="text-subtitle-2 font-weight-bold mb-1">
                          {{ level.title }}
                        </h4>
                        <p class="text-caption text-medium-emphasis">
                          {{ level.description }}
                        </p>
                      </div>

                      <div class="d-flex align-center">
                        <v-icon :color="level.color" size="14" class="mr-1">
                          mdi-check-circle
                        </v-icon>
                        <span class="text-caption"
                          >{{ level.ruleCount }} rules</span
                        >
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-radio-group>

            <v-alert
              v-if="selectedLevel"
              :color="selectedLevel.color"
              variant="tonal"
              class="mb-4"
              density="compact"
            >
              <template #prepend>
                <v-icon size="18"> mdi-information </v-icon>
              </template>
              <div>
                <div class="font-weight-bold text-body-2">
                  Selected: WCAG {{ selectedLevel.value }} -
                  {{ selectedLevel.title }}
                </div>
                <div class="text-caption">
                  {{ selectedLevel.ruleCount }} rules for
                  {{ selectedLevel.value }} compliance.
                </div>
              </div>
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-4 pt-2">
            <v-btn
              variant="outlined"
              :disabled="isLoading"
              prepend-icon="mdi-refresh"
              size="small"
              @click="resetToDefaults"
            >
              Reset
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="isLoading"
              :disabled="!selectedCompliance"
              append-icon="mdi-arrow-right"
              @click="saveComplianceAndContinue"
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Step 2: Guidelines Selection -->
        <v-card v-else-if="step === 2" elevation="2" rounded="lg" class="mb-3">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-2">
            <v-icon color="primary" class="mr-2" size="18">
              mdi-format-list-checks
            </v-icon>
            Guidelines Selection
          </v-card-title>

          <v-card-text class="pa-4 pt-1">
            <v-alert
              color="info"
              variant="tonal"
              class="mb-4"
              density="compact"
            >
              <template #prepend>
                <v-icon size="18"> mdi-information </v-icon>
              </template>
              <div class="text-body-2">
                Select guidelines for your assessment. Filter by principle using
                tabs.
              </div>
            </v-alert>

            <!-- Validation Error Alert -->
            <v-alert
              v-if="showValidationErrors && validationErrors.length > 0"
              color="error"
              variant="tonal"
              class="mb-4"
              density="compact"
            >
              <template #prepend>
                <v-icon size="18"> mdi-alert-circle </v-icon>
              </template>
              <div class="text-body-2 font-weight-bold">
                Please fix the following issues:
              </div>
              <ul class="text-caption mt-1 ml-4">
                <li v-for="error in validationErrors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </v-alert>

            <!-- Compact Principle Tabs -->
            <v-tabs
              v-model="selectedPrincipleTab"
              class="mb-3"
              color="primary"
              slider-color="primary"
              show-arrows
              density="compact"
            >
              <v-tab
                v-for="(principle, idx) in filteredPrinciples"
                :key="principle.id || idx"
                class="text-capitalize"
                size="small"
              >
                <v-icon
                  :color="getPrincipleIcon(idx).color"
                  class="mr-1"
                  size="16"
                >
                  {{ getPrincipleIcon(idx).icon }}
                </v-icon>
                {{ principle.title || `P${idx + 1}` }}
              </v-tab>
            </v-tabs>

            <!-- Scrollable Guidelines Container -->
            <div class="guidelines-container">
              <v-window v-model="selectedPrincipleTab">
                <v-window-item
                  v-for="(principle, pIdx) in filteredPrinciples"
                  :key="principle.id || pIdx"
                >
                  <v-card variant="outlined" class="mb-3">
                    <v-list density="compact">
                      <v-list-item
                        v-for="guideline in principle.Guidelines || []"
                        :key="guideline.id"
                        class="pa-2"
                        :class="{
                          'guideline-error': isGuidelineInvalid(guideline.id),
                        }"
                      >
                        <template #prepend>
                          <v-checkbox
                            v-model="selectedGuidelines"
                            :value="guideline.id"
                            hide-details
                            density="compact"
                            color="primary"
                            @update:model-value="onGuidelineCheck(guideline.id)"
                          />
                        </template>

                        <v-list-item-title
                          class="text-body-2 font-weight-bold text-primary"
                        >
                          {{ guideline.id }} {{ guideline.title }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption mb-1">
                          {{ guideline.description }}
                        </v-list-item-subtitle>

                        <!-- Compact Rules Selection -->
                        <div
                          v-if="
                            selectedGuidelines.includes(guideline.id) &&
                            guideline.rules &&
                            guideline.rules.length > 0
                          "
                          class="mt-2"
                        >
                          <v-select
                            v-model="selectedRulesByGuideline[guideline.id]"
                            :items="
                              guideline.rules.map((r) => ({
                                title: r.title,
                                value: r.id,
                              }))
                            "
                            item-title="title"
                            item-value="value"
                            label="Select specific rules (required)"
                            multiple
                            chips
                            clearable
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="rules-select"
                            :error="
                              showValidationErrors &&
                              isGuidelineInvalid(guideline.id)
                            "
                            :error-messages="
                              showValidationErrors &&
                              isGuidelineInvalid(guideline.id)
                                ? ['At least one rule must be selected']
                                : []
                            "
                          >
                            <template #chip="{ props, item }">
                              <v-chip
                                v-bind="props"
                                color="primary"
                                size="x-small"
                                variant="outlined"
                              >
                                {{ item.title }}
                              </v-chip>
                            </template>
                          </v-select>
                        </div>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-window-item>
              </v-window>
            </div>

            <!-- Compact Selection Summary -->
            <v-card
              v-if="selectedGuidelines.length > 0"
              color="success"
              variant="tonal"
              class="mt-3"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center">
                  <v-icon color="success" class="mr-2" size="18">
                    mdi-check-circle
                  </v-icon>
                  <span class="font-weight-bold text-body-2">
                    {{ selectedGuidelines.length }} guideline(s) selected
                  </span>
                </div>
                <div class="text-caption mt-1">
                  Total rules: {{ getTotalSelectedRules() }}
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>

          <v-card-actions class="pa-4 pt-2">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              size="small"
              @click="step = 1"
            >
              Back
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="isLoading"
              :disabled="!isValidConfiguration"
              append-icon="mdi-content-save"
              @click="saveConfiguration"
            >
              Save Config
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { showSuccess, showError, showInfo } from '@/shared/utils/toast'

const route = useRoute()
const store = useStore()
const router = useRouter()
const testId = ref(route.params.testId || route.params.id || '')

// Stepper state
const step = ref(1)

// Reactive state
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const selectedCompliance = ref('AA') // Default to AA
const includeNonInterference = ref(true)
const showExperimentalRules = ref(false)
const enableAutomaticSave = ref(true)
const selectedGuidelines = ref([])
const selectedRulesByGuideline = ref({})
const selectedPrincipleTab = ref(0)
const showValidationErrors = ref(false) // Only show errors after save attempt

// Principle icons mapping
const principleIcons = [
  { icon: 'mdi-eye', color: 'blue-lighten-2' }, // Perceivable
  { icon: 'mdi-cursor-default', color: 'green-lighten-2' }, // Operable
  { icon: 'mdi-brain', color: 'purple-lighten-2' }, // Understandable
  { icon: 'mdi-shield-check', color: 'orange-lighten-2' }, // Robust
]

// Get principle icon based on index
const getPrincipleIcon = (index) => {
  return principleIcons[index % principleIcons.length]
}

// Validation computed properties
const validationErrors = computed(() => {
  const errors = []

  for (const guidelineId of selectedGuidelines.value) {
    const selectedRules = selectedRulesByGuideline.value[guidelineId]
    if (!selectedRules || selectedRules.length === 0) {
      // Find guideline title for better error message
      const principle = filteredPrinciples.value.find((p) =>
        p.Guidelines.some((g) => g.id === guidelineId),
      )
      if (principle) {
        const guideline = principle.Guidelines.find((g) => g.id === guidelineId)
        if (guideline) {
          errors.push(
            `Guideline "${guideline.id}" requires at least one rule to be selected`,
          )
        }
      }
    }
  }

  return errors
})

const isValidConfiguration = computed(() => {
  if (selectedGuidelines.value.length === 0) return false
  return validationErrors.value.length === 0
})

// Check if a specific guideline is invalid (only show when validation is enabled)
const isGuidelineInvalid = (guidelineId) => {
  if (!showValidationErrors.value) return false
  if (!selectedGuidelines.value.includes(guidelineId)) return false
  const selectedRules = selectedRulesByGuideline.value[guidelineId]
  return !selectedRules || selectedRules.length === 0
}

// When a guideline is unchecked, clear its selected rules
function onGuidelineCheck(guidelineId) {
  if (!selectedGuidelines.value.includes(guidelineId)) {
    selectedRulesByGuideline.value[guidelineId] = []
  }
  // Clear validation errors when user makes changes
  showValidationErrors.value = false
}

// Get total selected rules count
function getTotalSelectedRules() {
  let total = 0
  for (const guidelineId of selectedGuidelines.value) {
    const rules = selectedRulesByGuideline.value[guidelineId]
    if (rules && rules.length > 0) {
      total += rules.length
    } else {
      // If no specific rules selected, count all rules for this guideline
      const principle = filteredPrinciples.value.find((p) =>
        p.Guidelines.some((g) => g.id === guidelineId),
      )
      if (principle) {
        const guideline = principle.Guidelines.find((g) => g.id === guidelineId)
        if (guideline && guideline.rules) {
          total += guideline.rules.length
        }
      }
    }
  }
  return total
}

// Compliance levels configuration
const complianceLevels = [
  {
    value: 'A',
    title: 'Minimum',
    description:
      'Basic/Minimum compliance for accessibility features essential for any website.',
    color: 'blue',
    textColor: 'Black',
    ruleCount: 25,
  },
  {
    value: 'AA',
    title: 'Standard',
    description:
      'Recommended/Standard level that most organizations should aim for.',
    color: 'orange',
    textColor: 'Black',
    ruleCount: 50,
  },
  {
    value: 'AAA',
    title: 'Enhanced',
    description:
      'Optimum/Highest level of accessibility for specialized applications.',
    color: 'green',
    textColor: 'black',
    ruleCount: 78,
  },
]

// Computed properties
const selectedLevel = computed(() => {
  return complianceLevels.find(
    (level) => level.value === selectedCompliance.value,
  )
})

// Always show all guidelines/rules for the selected compliance level on config page
const filteredPrinciples = computed(() => {
  const wcagData = store.state.Assessment.wcagData
  if (!wcagData || !wcagData.principles) return []
  // Use the same compliance filtering as Assessment.js, but ignore selectedGuidelines/selectedRulesByGuideline
  let allowedLevels = []
  if (selectedCompliance.value === 'A') allowedLevels = ['A']
  else if (selectedCompliance.value === 'AA') allowedLevels = ['A', 'AA']
  else if (selectedCompliance.value === 'AAA')
    allowedLevels = ['A', 'AA', 'AAA']
  else allowedLevels = ['A', 'AA', 'AAA']
  return wcagData.principles
    .map((principle) => {
      const filteredGuidelines = (principle.Guidelines || [])
        .map((guideline) => {
          const filteredRules = (guideline.rules || []).filter((rule) =>
            allowedLevels.includes(rule.level),
          )
          if (!filteredRules.length) return null
          return { ...guideline, rules: filteredRules }
        })
        .filter((g) => g && g.rules && g.rules.length > 0)
      if (!filteredGuidelines.length) return null
      return { ...principle, Guidelines: filteredGuidelines }
    })
    .filter((p) => p && p.Guidelines && p.Guidelines.length > 0)
})

// Methods
const saveComplianceAndContinue = async () => {
  try {
    isLoading.value = true

    if (!testId.value) {
      // Try to get testId from route params again
      testId.value = route.params.testId || route.params.id || ''
    }

    if (!testId.value) {
      throw new Error('Test ID is missing from route parameters')
    }

    // Ensure WCAG data is loaded
    if (!store.state.Assessment.wcagData) {
      await store.dispatch('Assessment/initializeAssessment')
    }
    // Save compliance config and filter WCAG data
    const configData = {
      complianceLevel: selectedCompliance.value,
      includeNonInterference: includeNonInterference.value,
      showExperimentalRules: showExperimentalRules.value,
      enableAutomaticSave: enableAutomaticSave.value,
      updatedAt: new Date().toISOString(),
    }
    await store.dispatch('Assessment/updateConfiguration', {
      configData,
      testId: testId.value,
    })
    await store.dispatch(
      'Assessment/filterByComplianceLevel',
      selectedCompliance.value,
    )

    // Also save to the test document
    await store.dispatch('updateStudy', {
      id: testId.value,
      configData: configData,
    })

    // Pre-select all guidelines and rules based on compliance level
    preselectGuidelinesForComplianceLevel()

    showSuccess(
      `WCAG ${selectedCompliance.value} compliance level saved! All guidelines pre-selected - deselect what you don't need.`,
    )
    step.value = 2
  } catch {
    showError('Failed to save compliance level')
  } finally {
    isLoading.value = false
  }
}

const saveConfiguration = async () => {
  // Show validation errors and check if valid
  showValidationErrors.value = true

  // Small delay to ensure validation UI updates
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (!isValidConfiguration.value) {
    showError('Please fix validation errors before saving')
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    success.value = ''

    if (!testId.value) {
      // Try to get testId from route params again
      testId.value = route.params.testId || route.params.id || ''
    }

    if (!testId.value) {
      throw new Error('Test ID is missing from route parameters')
    }

    // Prepare configuration data
    const configData = {
      complianceLevel: selectedCompliance.value,
      includeNonInterference: includeNonInterference.value,
      showExperimentalRules: showExperimentalRules.value,
      enableAutomaticSave: enableAutomaticSave.value,
      selectedGuidelines: selectedGuidelines.value,
      selectedRulesByGuideline: { ...selectedRulesByGuideline.value },
      updatedAt: new Date().toISOString(),
    }

    // Save to Assessment store for immediate use
    await store.dispatch('Assessment/updateConfiguration', {
      configData,
      testId: testId.value,
    })

    // Also save to the test document in Firestore so it persists
    await store.dispatch('updateStudy', {
      id: testId.value,
      configData: configData,
    })

    success.value = `Configuration saved successfully! WCAG ${selectedCompliance.value} compliance level selected.`
    showSuccess(`WCAG ${selectedCompliance.value} configuration saved!`)

    // Optionally redirect to assessment page after a delay
    setTimeout(() => {
      router.push(`/accessibility/manual/preview/${testId.value}`)
    }, 1000)
  } catch {
    error.value = 'Failed to save configuration. Please try again.'
    showError('Failed to save configuration')
  } finally {
    isLoading.value = false
  }
}

// Pre-select all guidelines and rules based on the selected compliance level
const preselectGuidelinesForComplianceLevel = () => {
  // Determine which levels to include based on compliance level
  let allowedLevels = []
  if (selectedCompliance.value === 'A') allowedLevels = ['A']
  else if (selectedCompliance.value === 'AA') allowedLevels = ['A', 'AA']
  else if (selectedCompliance.value === 'AAA')
    allowedLevels = ['A', 'AA', 'AAA']
  else allowedLevels = ['A', 'AA', 'AAA']

  // Reset selections
  const newSelectedGuidelines = []
  const newSelectedRulesByGuideline = {}

  // Iterate through filtered principles to get all applicable guidelines and rules
  filteredPrinciples.value.forEach((principle) => {
    principle.Guidelines.forEach((guideline) => {
      // Select the guideline
      newSelectedGuidelines.push(guideline.id)

      // Select all rules for this guideline that match the compliance level
      const applicableRules = guideline.rules
        ? guideline.rules
            .filter((rule) => allowedLevels.includes(rule.level))
            .map((rule) => rule.id)
        : []

      if (applicableRules.length > 0) {
        newSelectedRulesByGuideline[guideline.id] = applicableRules
      }
    })
  })

  // Update reactive state
  selectedGuidelines.value = newSelectedGuidelines
  selectedRulesByGuideline.value = newSelectedRulesByGuideline
}

// Watch for compliance level changes on step 2 to re-preselect guidelines
watch(selectedCompliance, (newLevel, oldLevel) => {
  // Only auto-reselect if we're on step 2 and the level actually changed
  if (
    step.value === 2 &&
    newLevel !== oldLevel &&
    filteredPrinciples.value.length > 0
  ) {
    preselectGuidelinesForComplianceLevel()
  }
})

// Watch for route parameter changes to update testId
watch(
  () => route.params,
  (newParams) => {
    const newTestId = newParams.testId || newParams.id || ''
    if (newTestId && newTestId !== testId.value) {
      testId.value = newTestId
    }
  },
  { immediate: true },
)

const resetToDefaults = () => {
  selectedCompliance.value = 'AA'
  includeNonInterference.value = true
  showExperimentalRules.value = false
  enableAutomaticSave.value = true
  showValidationErrors.value = false

  if (step.value === 2) {
    // If we're on step 2, pre-select guidelines for the compliance level
    preselectGuidelinesForComplianceLevel()
    success.value =
      'Configuration reset to defaults with pre-selected guidelines'
    showInfo('Configuration reset to defaults with pre-selected guidelines')
  } else {
    // If we're on step 1, clear selections and go back to step 1
    selectedGuidelines.value = []
    selectedRulesByGuideline.value = {}
    step.value = 1
    success.value = 'Configuration reset to defaults'
    showInfo('Configuration reset to defaults')
  }
}

const loadExistingConfiguration = async () => {
  try {
    if (!testId.value) {
      // Try to get testId from route params again
      testId.value = route.params.testId || route.params.id || ''
    }

    if (!testId.value) {
      return
    }

    // First load the test data to get the saved configuration
    await store.dispatch('getStudy', { id: testId.value })
    const testData = store.getters.test

    let config = null

    // Try to get configuration from test data first
    if (testData && testData.configData) {
      config = testData.configData
    } else {
      // Fallback to Assessment store
      config = await store.dispatch('Assessment/getConfiguration')
    }

    if (config) {
      selectedCompliance.value = config.complianceLevel || 'AA'
      includeNonInterference.value = config.includeNonInterference ?? true
      showExperimentalRules.value = config.showExperimentalRules ?? false
      enableAutomaticSave.value = config.enableAutomaticSave ?? true
      selectedGuidelines.value = config.selectedGuidelines || []
      selectedRulesByGuideline.value = config.selectedRulesByGuideline
        ? { ...config.selectedRulesByGuideline }
        : {}

      // If we have selected guidelines, go to step 2
      if (selectedGuidelines.value.length > 0) {
        step.value = 2
      }
    }
  } catch {
    // Failed to load configuration
  }
}

// Lifecycle
onMounted(async () => {
  // Always ensure WCAG data is loaded before config UI
  if (!store.state.Assessment.wcagData) {
    await store.dispatch('Assessment/initializeAssessment')
  }
  loadExistingConfiguration()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.compliance-card {
  min-height: 140px;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

.selected-compliance {
  border: 2px solid currentColor !important;
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.compliance-card:hover:not(.selected-compliance) {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08) !important;
}

.rules-select {
  max-width: 100%;
}

/* Scrollable guidelines container */
.guidelines-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  scroll-behavior: smooth;
  /* Fix for ResizeObserver loop error */
  contain: layout style paint;
}

/* Custom scrollbar for webkit browsers */
.guidelines-container::-webkit-scrollbar {
  width: 6px;
}

.guidelines-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.guidelines-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.guidelines-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Guideline error styling */
.guideline-error {
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-left: 3px solid #f44336 !important;
}

/* Compact tab styling */
.v-tabs :deep(.v-tab) {
  text-transform: none !important;
  font-weight: 500;
  min-width: 80px;
  padding: 0 12px;
}

/* Compact alert styling */
.v-alert {
  border-radius: 6px !important;
}

/* Compact card styling */
.v-card {
  border-radius: 8px !important;
}

/* Compact button styling */
.v-btn {
  border-radius: 6px !important;
  text-transform: none !important;
  font-weight: 500;
}

/* Compact list styling */
.v-list-item {
  min-height: auto !important;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .compliance-card {
    min-height: 120px;
  }

  .text-caption {
    font-size: 0.7rem !important;
  }

  .v-tabs :deep(.v-tab) {
    min-width: 60px;
    padding: 0 8px;
  }

  .guidelines-container {
    max-height: 400px;
  }
}

/* Extra small screens */
@media (max-width: 400px) {
  .compliance-card {
    min-height: 100px;
  }

  .pa-4 {
    padding: 12px !important;
  }

  .pa-3 {
    padding: 8px !important;
  }

  .guidelines-container {
    max-height: 350px;
  }
}

/* Focus styling for accessibility */
.guidelines-container:focus-within {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}
</style>
