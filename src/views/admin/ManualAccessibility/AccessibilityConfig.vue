<template>
  <v-app>
    <v-container class="pa-3">
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <!-- Compact Header -->
          <v-card class="mb-3" elevation="2" rounded="lg">
            <v-card-title class="text-h6 font-weight-bold pa-4 d-flex align-center">
              <v-icon color="primary" class="mr-2" size="24">mdi-cog</v-icon>
              Accessibility Configuration
              <v-spacer />
              <v-chip :color="step === 1 ? 'primary' : 'success'" variant="flat" size="small">
                Step {{ step }}/2
              </v-chip>
            </v-card-title>
          </v-card>

          <!-- Step 1: Compliance Level Selection -->
          <v-card v-if="step === 1" elevation="2" rounded="lg" class="mb-3">
            <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-2">
              <v-icon color="primary" class="mr-2" size="18">mdi-shield-check</v-icon>
              WCAG Compliance Level
            </v-card-title>
            
            <v-card-text class="pa-4 pt-1">
              <v-alert color="info" variant="tonal" class="mb-4" density="compact">
                <v-icon slot="prepend" size="18">mdi-information</v-icon>
                <div class="text-body-2">
                  Select the WCAG compliance level for your accessibility requirements.
                </div>
              </v-alert>

              <v-radio-group v-model="selectedCompliance" class="mb-4">
                <v-row dense>
                  <v-col v-for="level in complianceLevels" :key="level.value" cols="12" sm="6" md="4" class="pa-1">
                    <v-card 
                      :class="[
                        'compliance-card cursor-pointer',
                        selectedCompliance === level.value ? 'selected-compliance' : ''
                      ]"
                     
                      :variant="selectedCompliance === level.value ? 'flat' : 'outlined'"
                      @click="selectedCompliance = level.value"
                      elevation="1"
                      hover
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
                            :variant="selectedCompliance === level.value ? 'flat' : 'outlined'" 
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
                          <span class="text-caption">{{ level.ruleCount }} rules</span>
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
                <v-icon slot="prepend" size="18">mdi-information</v-icon>
                <div>
                  <div class="font-weight-bold text-body-2">
                    Selected: WCAG {{ selectedLevel.value }} - {{ selectedLevel.title }}
                  </div>
                  <div class="text-caption">
                    {{ selectedLevel.ruleCount }} rules for {{ selectedLevel.value }} compliance.
                  </div>
                </div>
              </v-alert>
            </v-card-text>

            <v-card-actions class="pa-4 pt-2">
              <v-btn 
                variant="outlined" 
                @click="resetToDefaults" 
                :disabled="isLoading"
                prepend-icon="mdi-refresh"
                size="small"
              >
                Reset
              </v-btn>
              <v-spacer />
              <v-btn 
                color="primary" 
                @click="saveComplianceAndContinue" 
                :loading="isLoading"
                :disabled="!selectedCompliance"
                append-icon="mdi-arrow-right"
              >
                Continue
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Step 2: Guidelines Selection -->
          <v-card v-else-if="step === 2" elevation="2" rounded="lg" class="mb-3">
            <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-2">
              <v-icon color="primary" class="mr-2" size="18">mdi-format-list-checks</v-icon>
              Guidelines Selection
            </v-card-title>
            
            <v-card-text class="pa-4 pt-1">
              <v-alert color="info" variant="tonal" class="mb-4" density="compact">
                <v-icon slot="prepend" size="18">mdi-information</v-icon>
                <div class="text-body-2">
                  Select guidelines for your assessment. Filter by principle using tabs.
                </div>
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
                  <v-icon class="mr-1" size="16">mdi-bookmark</v-icon>
                  {{ principle.title || `P${idx + 1}` }}
                </v-tab>
              </v-tabs>

              <!-- Compact Guidelines -->
              <v-window v-model="selectedPrincipleTab">
                <v-window-item 
                  v-for="(principle, pIdx) in filteredPrinciples" 
                  :key="principle.id || pIdx"
                >
                  <v-card variant="outlined" class="mb-3">
                    <v-list density="compact">
                      <v-list-item 
                        v-for="(guideline, gIdx) in principle.Guidelines || []" 
                        :key="guideline.id"
                        class="pa-2"
                      >
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="selectedGuidelines"
                            :value="guideline.id"
                            hide-details
                            density="compact"
                            color="primary"
                            @update:modelValue="onGuidelineCheck(guideline.id)"
                          />
                        </template>
                        
                        <v-list-item-content>
                          <v-list-item-title class="text-body-2 font-weight-bold text-primary mb-1">
                            {{ guideline.id }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption mb-1">
                            {{ guideline.title }}
                          </v-list-item-subtitle>
                          <v-list-item-subtitle class="text-caption text-medium-emphasis">
                            {{ guideline.description }}
                          </v-list-item-subtitle>
                          
                          <!-- Compact Rules Selection -->
                          <div 
                            v-if="selectedGuidelines.includes(guideline.id) && guideline.rules && guideline.rules.length > 0"
                            class="mt-2"
                          >
                            <v-select
                              v-model="selectedRulesByGuideline[guideline.id]"
                              :items="guideline.rules.map(r => ({ title: r.title, value: r.id }))"
                              item-title="title"
                              item-value="value"
                              label="Select specific rules (optional)"
                              multiple
                              chips
                              clearable
                              density="compact"
                              variant="outlined"
                              hide-details
                              class="rules-select"
                            >
                              <template v-slot:chip="{ props, item }">
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
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-window-item>
              </v-window>

              <!-- Compact Selection Summary -->
              <v-card v-if="selectedGuidelines.length > 0" color="success" variant="tonal" class="mt-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-icon color="success" class="mr-2" size="18">mdi-check-circle</v-icon>
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
                @click="step = 1"
                prepend-icon="mdi-arrow-left"
                size="small"
              >
                Back
              </v-btn>
              <v-spacer />
              <v-btn 
                color="primary" 
                @click="saveConfiguration" 
                :loading="isLoading"
                :disabled="selectedGuidelines.length === 0"
                append-icon="mdi-content-save"
              >
                Save Config
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const route = useRoute()
const store = useStore()
const router = useRouter()
const toast = useToast()
const testId = ref(route.params.testId || '');

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

// When a guideline is unchecked, clear its selected rules
function onGuidelineCheck(guidelineId) {
  if (!selectedGuidelines.value.includes(guidelineId)) {
    selectedRulesByGuideline.value[guidelineId] = []
  }
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
      const principle = filteredPrinciples.value.find(p => 
        p.Guidelines.some(g => g.id === guidelineId)
      )
      if (principle) {
        const guideline = principle.Guidelines.find(g => g.id === guidelineId)
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
    description: 'Basic/Minimum compliance for accessibility features essential for any website.',
    color: 'blue',
    textColor: 'Black',
    ruleCount: 25
  },
  {
    value: 'AA',
    title: 'Standard',
    description: 'Recommended/Standard level that most organizations should aim for.',
    color: 'orange',
    textColor: 'Black',
    ruleCount: 50
  },
  {
    value: 'AAA',
    title: 'Enhanced',
    description: 'Optimum/Highest level of accessibility for specialized applications.',
    color: 'green',
    textColor: 'black',
    ruleCount: 78
  }
]

// Computed properties
const selectedLevel = computed(() => {
  return complianceLevels.find(level => level.value === selectedCompliance.value)
})

// Always show all guidelines/rules for the selected compliance level on config page
const filteredPrinciples = computed(() => {
  const wcagData = store.state.Assessment.wcagData
  if (!wcagData || !wcagData.principles) return []
  // Use the same compliance filtering as Assessment.js, but ignore selectedGuidelines/selectedRulesByGuideline
  let allowedLevels = []
  if (selectedCompliance.value === 'A') allowedLevels = ['A']
  else if (selectedCompliance.value === 'AA') allowedLevels = ['A', 'AA']
  else if (selectedCompliance.value === 'AAA') allowedLevels = ['A', 'AA', 'AAA']
  else allowedLevels = ['A', 'AA', 'AAA']
  return wcagData.principles.map(principle => {
    const filteredGuidelines = (principle.Guidelines || []).map(guideline => {
      const filteredRules = (guideline.rules || []).filter(rule => allowedLevels.includes(rule.level))
      if (!filteredRules.length) return null
      return { ...guideline, rules: filteredRules }
    }).filter(g => g && g.rules && g.rules.length > 0)
    if (!filteredGuidelines.length) return null
    return { ...principle, Guidelines: filteredGuidelines }
  }).filter(p => p && p.Guidelines && p.Guidelines.length > 0)
})

// Methods
const saveComplianceAndContinue = async () => {
  try {
    isLoading.value = true
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
      updatedAt: new Date().toISOString()
    }
    await store.dispatch('Assessment/updateConfiguration', configData)
    await store.dispatch('Assessment/filterByComplianceLevel', selectedCompliance.value)
    // Reset guideline selection
    selectedGuidelines.value = []
    toast.success(`WCAG ${selectedCompliance.value} compliance level saved! Now select guidelines.`)
    step.value = 2
  } catch (err) {
    toast.error('Failed to save compliance level')
  } finally {
    isLoading.value = false
  }
}

const saveConfiguration = async () => {
  try {
    isLoading.value = true
    error.value = ''
    success.value = ''

    // Prepare configuration data
    const configData = {
      complianceLevel: selectedCompliance.value,
      includeNonInterference: includeNonInterference.value,
      showExperimentalRules: showExperimentalRules.value,
      enableAutomaticSave: enableAutomaticSave.value,
      selectedGuidelines: selectedGuidelines.value,
      selectedRulesByGuideline: { ...selectedRulesByGuideline.value },
      updatedAt: new Date().toISOString()
    }

    // Save to store (you would typically save to your backend/Firestore here)
    await store.dispatch('Assessment/updateConfiguration', configData)

    success.value = `Configuration saved successfully! WCAG ${selectedCompliance.value} compliance level selected.`
    toast.success(`WCAG ${selectedCompliance.value} configuration saved!`)

    // Optionally redirect to assessment page after a delay
    setTimeout(() => {
      router.push(`/preview/${testId.value}`)
    }, 2000)

  } catch (err) {
    console.error('Failed to save configuration:', err)
    error.value = 'Failed to save configuration. Please try again.'
    toast.error('Failed to save configuration')
  } finally {
    isLoading.value = false
  }
}

const resetToDefaults = () => {
  selectedCompliance.value = 'AA'
  includeNonInterference.value = true
  showExperimentalRules.value = false
  enableAutomaticSave.value = true
  selectedGuidelines.value = []
  selectedRulesByGuideline.value = {}
  step.value = 1
  success.value = 'Configuration reset to defaults'
  toast.info('Configuration reset to defaults')
}

const loadExistingConfiguration = async () => {
  try {
    // Load existing configuration from store
    const config = await store.dispatch('Assessment/getConfiguration')
    if (config) {
      selectedCompliance.value = config.complianceLevel || 'AA'
      includeNonInterference.value = config.includeNonInterference ?? true
      showExperimentalRules.value = config.showExperimentalRules ?? false
      enableAutomaticSave.value = config.enableAutomaticSave ?? true
      selectedGuidelines.value = config.selectedGuidelines || []
      selectedRulesByGuideline.value = config.selectedRulesByGuideline ? { ...config.selectedRulesByGuideline } : {}
    }
  } catch (err) {
    console.error('Failed to load configuration:', err)
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

/* Compact tab styling */
.v-tabs >>> .v-tab {
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
  
  .v-tabs >>> .v-tab {
    min-width: 60px;
    padding: 0 8px;
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
}
</style>