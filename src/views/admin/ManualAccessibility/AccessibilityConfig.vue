<template>
  <v-app>
    <v-container class="pa-8">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <!-- Configuration Card -->
          <v-card class="pa-6" elevation="8" rounded="lg">
            <v-card-title class="text-h5 font-weight-bold pb-4">
              <v-icon color="primary" class="mr-3">mdi-cog</v-icon>
              Compliance Level Selection
            </v-card-title>

            <v-card-text class="pa-0">
              <div class="mb-6">
                <p class="text-body-1 text-grey-darken-1 mb-4">
                  Select the WCAG compliance level that matches your accessibility requirements. 
                  Only rules matching your selected level will be shown during assessment.
                </p>
              </div>

              <!-- Compliance Level Selection -->
              <v-radio-group v-model="selectedCompliance" class="mb-6">
                <template v-for="level in complianceLevels" :key="level.value">
                  <v-card 
                    :class="[
                      'mb-4 cursor-pointer transition-all',
                      selectedCompliance === level.value ? 'selected-level' : 'hover-card'
                    ]"
                    :color="selectedCompliance === level.value ? level.color : 'grey-lighten-5'"
                    :variant="selectedCompliance === level.value ? 'flat' : 'outlined'"
                    @click="selectedCompliance = level.value"
                  >
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center">
                        <v-radio 
                          :value="level.value"
                          :color="level.color"
                          hide-details
                          class="mr-4"
                        />
                        <div class="flex-grow-1">
                          <div class="d-flex align-center mb-2">
                            <v-chip 
                              :color="level.color" 
                              :text-color="level.textColor"
                              size="small" 
                              class="mr-3 font-weight-bold"
                            >
                              Level {{ level.value }}
                            </v-chip>
                            <span class="text-h6 font-weight-bold">{{ level.title }}</span>
                          </div>
                          <p class="text-body-2 text-grey-darken-1 mb-2">
                            {{ level.description }}
                          </p>
                          <div class="d-flex align-center">
                            <v-icon :color="level.color" size="small" class="mr-1">
                              mdi-check-circle
                            </v-icon>
                            <span class="text-caption">{{ level.ruleCount }} rules included</span>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </template>
              </v-radio-group>

             

              <!-- Selected Level Summary -->
              <v-alert 
                v-if="selectedLevel" 
                :color="selectedLevel.color" 
                variant="tonal" 
                class="mb-6"
              >
                <template #prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                <div>
                  <div class="font-weight-bold mb-2">
                    Selected: WCAG {{ selectedLevel.value }} - {{ selectedLevel.title }}
                  </div>
                  <div class="text-body-2">
                    You will be assessing {{ selectedLevel.ruleCount }} rules that meet 
                    {{ selectedLevel.value }} compliance standards.
                  </div>
                </div>
              </v-alert>
            </v-card-text>

            <v-card-actions class="pt-4">
              <v-spacer />
              <v-btn 
                variant="outlined" 
                @click="resetToDefaults"
                :disabled="isLoading"
              >
                Reset to Defaults
              </v-btn>
              <v-btn 
                color="primary" 
                @click="saveConfiguration"
                :loading="isLoading"
                :disabled="!selectedCompliance"
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

.selected-level {
  border: 2px solid currentColor !important;
  transform: scale(1.02);
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.transition-all {
  transition: all 0.3s ease;
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
</style>