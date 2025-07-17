<template>
  <v-app>
    <v-container class="pa-4">
      <v-row justify="center">
        <v-col cols="12" md="12" lg="10" xl="8">
          <v-card class="pa-4" elevation="4" rounded="lg">
            <v-card-title class="text-h6 font-weight-bold pb-3 d-flex align-center">
              <v-icon color="primary" class="mr-2" size="24">mdi-cog</v-icon>
              Compliance Level Selection
            </v-card-title>

            <v-card-text class="pa-0">
              <div class="mb-4">
                <p class="text-body-2 text-medium-emphasis mb-3">
                  Select the WCAG compliance level that matches your accessibility requirements.
                  Only rules matching your selected level will be shown during assessment.
                </p>
              </div>

              <v-radio-group v-model="selectedCompliance" class="mb-4">
                <v-row>
                  <v-col 
                    v-for="level in complianceLevels" 
                    :key="level.value"
                    cols="12" 
                    md="4"
                    class="py-2"
                  >
                    <v-card
                      :class="[
                        'h-100 cursor-pointer transition-all level-card',
                        selectedCompliance === level.value ? 'selected-level' : 'hover-card'
                      ]"
                      :color="selectedCompliance === level.value ? level.selectedBg : 'surface'"
                      :variant="selectedCompliance === level.value ? 'flat' : 'outlined'"
                      @click="selectedCompliance = level.value"
                      elevation="2"
                    >
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center mb-2">
                          <v-radio
                            :value="level.value"
                            :color="level.color"
                            hide-details
                            class="mr-3"
                          />
                          <v-chip
                            :color="level.color"
                            :variant="selectedCompliance === level.value ? 'flat' : 'outlined'"
                            size="small"
                            class="font-weight-bold level-chip"
                          >
                            Level {{ level.value }}
                          </v-chip>
                        </div>
                        
                        <div class="mb-2">
                          <div class="text-subtitle-1 font-weight-bold mb-1">
                            {{ level.title }}
                          </div>
                          <p class="text-body-2 text-medium-emphasis mb-2 description-text">
                            {{ level.description }}
                          </p>
                        </div>
                        
                        <div class="d-flex align-center">
                          <v-icon :color="level.color" size="16" class="mr-1">
                            mdi-check-circle
                          </v-icon>
                          <span class="text-caption text-medium-emphasis">{{ level.ruleCount }} rules</span>
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
                  <v-icon size="20">mdi-information</v-icon>
                </template>
                <div>
                  <div class="font-weight-bold mb-1">
                    Selected: WCAG {{ selectedLevel.value }} - {{ selectedLevel.title }}
                  </div>
                  <div class="text-body-2">
                    You will be assessing {{ selectedLevel.ruleCount }} rules that meet
                    {{ selectedLevel.value }} compliance standards.
                  </div>
                </div>
              </v-alert>
            </v-card-text>

            <v-card-actions class="pt-3 px-0">
              <v-spacer />
              <v-btn
                variant="outlined"
                @click="resetToDefaults"
                :disabled="isLoading"
                size="small"
              >
                Reset to Defaults
              </v-btn>
              <v-btn
                color="primary"
                @click="saveConfiguration"
                :loading="isLoading"
                :disabled="!selectedCompliance"
                size="small"
              >
                Save Configuration
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
import { useRouter,useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const route=useRoute()
const store = useStore()
const router = useRouter()
const toast = useToast()
const testId = ref(route.params.testId || '');

// Reactive state
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const selectedCompliance = ref('AA') // Default to AA
const includeNonInterference = ref(true)
const showExperimentalRules = ref(false)
const enableAutomaticSave = ref(true)

// Compliance levels configuration
const complianceLevels = [
  {
    value: 'A',
    title: 'Minimum',
    description: 'Basic accessibility features that are essential for any website. Includes fundamental requirements for keyboard navigation, alternative text, and basic structure.',
    color: 'blue',
    textColor: 'white',
    ruleCount: 25
  },
  {
    value: 'AA',
    title: 'Standard',
    description: 'Standard level that most organizations should aim for. Includes color contrast, text resizing, and enhanced keyboard support requirements.',
    color: 'orange',
    textColor: 'white',
    ruleCount: 50
  },
  {
    value: 'AAA',
    title: 'Enhanced',
    description: 'Highest level of accessibility for specialized applications. Includes stringent color contrast, comprehensive keyboard support, and advanced user control features.',
    color: 'green',
    textColor: 'white',
    ruleCount: 78
  }
]

// Computed properties
const selectedLevel = computed(() => {
  return complianceLevels.find(level => level.value === selectedCompliance.value)
})

// Methods
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
      updatedAt: new Date().toISOString()
    }

    // Save to store (you would typically save to your backend/Firestore here)
    await store.dispatch('Assessment/updateConfiguration', configData)

    // Filter WCAG data based on selected compliance level
    await store.dispatch('Assessment/filterByComplianceLevel', selectedCompliance.value)

    success.value = `Configuration saved successfully! WCAG ${selectedCompliance.value} compliance level selected.`
    
    toast.success(`WCAG ${selectedCompliance.value} configuration saved successfully!`)

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
    }
  } catch (err) {
    console.error('Failed to load configuration:', err)
  }
}

// Lifecycle
onMounted(() => {
  loadExistingConfiguration()
})
</script>
<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.level-card {
  min-height: 160px;
  border-radius: 12px !important;
}

.selected-level {
  border: 2px solid currentColor !important;
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.h-100 {
  height: 100%;
}

/* Custom radio button styling */
.v-radio-group .v-radio {
  pointer-events: none;
}

.v-card .v-card-text {
  position: relative;
}

.description-text {
  font-size: 0.75rem !important;
  line-height: 1.3 !important;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.level-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
}

/* Ensure good contrast for selected cards */
.selected-level .v-chip {
  color: white !important;
  background-color: currentColor !important;
}

.selected-level .text-subtitle-1,
.selected-level .text-body-2,
.selected-level .text-caption {
  color: rgba(0, 0, 0, 0.87) !important;
}

.selected-level .text-medium-emphasis {
  color: rgba(0, 0, 0, 0.6) !important;
}
</style>