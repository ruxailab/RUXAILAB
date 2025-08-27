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
      />
      <div class="mt-4 text-h6">
        Loading WCAG Data...
      </div>
    </v-overlay>

    <v-alert
      v-if="error"
      type="error"
      class="ma-2"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <!-- Full width container without padding -->
    <v-container
      fluid
      class="pa-0 ma-0 fill-height"
    >
      <v-row
        no-gutters
        class="fill-height"
      >
        <!-- Left Sidebar Navigation -->
        <div class="v-col v-col-2 sidebar fill-height">
          <div
            class="h-100"
            style="background-color: #f5f5f5"
          >
            <div class="text-subtitle-1 pa-3 font-weight-bold">
              WCAG Principles
            </div>

            <div
              v-if="principles.length > 0"
              class="pa-0"
            >
              <div
                v-for="(principle, pIdx) in principles"
                :key="principle.id || pIdx"
              >
                <!-- Principle Header -->
                <div
                  class="principle-item pa-3 d-flex align-center justify-space-between"
                  :class="{ 'active-principle': selectedPrincipleIdx === pIdx }"
                  @click="selectPrinciple(pIdx)"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="getPrincipleIcon(pIdx)"
                      class="mr-2"
                      size="small"
                    />
                    <span class="text-body-2 font-weight-medium">
                      {{ principle.title }}
                    </span>
                  </div>
                  <v-icon
                    icon="mdi-chevron-down"
                    size="small"
                    class="chevron-icon"
                  />
                </div>

                <!-- Guidelines Dropdown -->
                <div
                  class="guidelines-container"
                  :class="{ 'is-open': selectedPrincipleIdx === pIdx }"
                >
                  <div
                    v-for="(guideline, gIdx) in principle.Guidelines"
                    :key="guideline.id"
                    class="guideline-item pa-2 pl-8"
                    :class="{ 'active-guideline': selectedPrincipleIdx === pIdx && selectedGuidelineIdx === gIdx }"
                    @click.stop="selectGuideline(gIdx, pIdx)"
                  >
                    <span class="text-caption">
                      {{ guideline.id }} {{ guideline.title }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="pa-4"
            >
              <div class="text-grey text-body-2">
                {{ isLoading ? 'Loading...' : 'No principles available' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <v-col
          cols="7"
          class="main-content fill-height"
        >
          <v-card
            v-if="currentRule.title"
            flat
            class="h-100 pa-4 scrollable-content"
          >
            <!-- Breadcrumb -->
            <v-breadcrumbs
              :items="breadcrumbs"
              class="pa-0 mb-3"
              density="compact"
            >
              <template #divider>
                <v-icon
                  icon="mdi-chevron-right"
                  size="small"
                />
              </template>
            </v-breadcrumbs>

            <!-- Page Header -->
            <div class="mb-4">
              <h1 class="text-h5 font-weight-bold mb-2">
                {{ currentRule?.id }} {{ currentRule?.title }}
              </h1>
              <!-- Chips -->
              <div class="d-flex gap-1 mb-3">
                <v-chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  class="text-caption"
                >
                  Level {{ currentRule?.level }}
                </v-chip>
                <v-chip
                  size="small"
                  color="info"
                  variant="outlined"
                  class="text-caption"
                >
                  WCAG {{ currentRule?.version }}
                </v-chip>
                <v-chip
                  size="small"
                  color="success"
                  variant="outlined"
                  class="text-caption"
                >
                  {{ currentPrinciple?.title }}
                </v-chip>
              </div>
            </div>

            <!-- Guideline Box -->
            <v-alert
              variant="tonal"
              color="info"
              class="mb-4 pa-3"
            >
              <div class="d-flex align-start">
                <v-icon
                  icon="mdi-information"
                  size="small"
                  class="mr-2 mt-1"
                />
                <div>
                  <div class="font-weight-bold mb-1">
                    {{ currentGuideline?.id }} {{ currentGuideline?.title }}
                  </div>
                  <div class="text-body-2">
                    {{ currentGuideline?.description }}
                  </div>
                </div>
              </div>
            </v-alert>

            <!-- Success Criterion Section -->
            <div class="mb-4">
              <h2 class="text-h6 font-weight-bold mb-2">
                Success Criterion
              </h2>
              <v-card
                variant="outlined"
                class="mb-2"
                style="border: 2px solid #4caf50"
              >
                <v-card-text class="pa-3">
                  <div class="text-subtitle-2 font-weight-bold mb-2 text-success">
                    {{ currentRule?.id }} {{ currentRule?.title }} (Level {{ currentRule?.level }})
                  </div>
                  <div v-if="currentRule?.criteria && currentRule.criteria.length > 0">
                    <ul class="criteria-list">
                      <li
                        v-for="(criterion, idx) in currentRule.criteria"
                        :key="idx"
                        class="mb-1 text-body-2"
                      >
                        {{ criterion }}
                      </li>
                    </ul>
                  </div>
                  <div v-else class="text-body-2 text-grey-darken-1">
                    No specific criteria defined for this rule.
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Navigation -->
            <v-card
              flat
              class="pa-3"
              color="grey-lighten-4"
              style="border-radius: 8px"
            >
              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-chevron-left"
                  @click="prevRule"
                  :disabled="!hasPrevRule"
                >
                  Previous
                </v-btn>
                <div class="text-caption text-grey-darken-1">
                  Rule {{ currentRuleIndex + 1 }} of {{ totalRules }}
                </div>
                <v-btn
                  variant="outlined"
                  size="small"
                  append-icon="mdi-chevron-right"
                  @click="nextRule"
                  :disabled="!hasNextRule"
                >
                  Next
                </v-btn>
              </div>
            </v-card>
          </v-card>

          <v-card
            v-else
            flat
            class="h-100"
          >
            <div class="d-flex flex-column align-center justify-center h-100 text-center fill-height pa-4">
              <v-icon
                icon="mdi-file-document-outline"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />

              <h2 class="text-h6 font-weight-regular text-grey-darken-2 mb-1">
                Select a Rule to View Details
              </h2>

              <p class="text-body-2 text-medium-emphasis">
                Choose a principle and guideline from the left sidebar to view the success criteria.
              </p>
            </div>
          </v-card>
        </v-col>

        <!-- Right Sidebar - Table of Contents -->
        <v-col
          cols="3"
          class="toc-sidebar fill-height"
        >
          <v-card
            flat
            class="h-100"
            color="grey-lighten-5"
          >
            <v-card-title class="text-subtitle-1 pa-3 font-weight-bold">
              Rules
            </v-card-title>
            <v-list
              density="compact"
              class="pa-1"
            >
              <template v-if="currentGuideline?.Rules && currentGuideline.Rules.length > 0">
                <v-list-item
                  v-for="(rule, rIdx) in currentGuideline.Rules"
                  :key="rule.id"
                  :value="rIdx"
                  :active="selectedRuleIdx === rIdx"
                  class="text-caption"
                  @click="selectRule(rIdx)"
                >
                  <template #prepend>
                    <v-chip
                      size="x-small"
                      :color="getLevelColor(rule.level)"
                      variant="flat"
                      class="mr-2"
                    >
                      {{ rule.level }}
                    </v-chip>
                  </template>
                  <v-list-item-title class="text-caption">
                    {{ rule.id }} {{ rule.title }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-list-item v-else>
                <v-list-item-title class="text-caption text-grey">
                  No rules available
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import wcagData from '@/assets/WacgAxe.json'

// Reactive state
const isLoading = ref(true)
const error = ref('')
const selectedPrincipleIdx = ref(null)
const selectedGuidelineIdx = ref(null)
const selectedRuleIdx = ref(null)
const wcagDataParsed = ref([])

// Transform the data structure to match the expected format
const transformWcagData = (data) => {
  return data.map((item, index) => {
    const principleKey = Object.keys(item)[0]
    const principleData = item[principleKey]
    
    return {
      id: principleKey,
      title: principleData.title,
      description: principleData.description,
      Guidelines: principleData.Guidelines.map(guideline => ({
        ...guideline,
        Rules: guideline.Rules || []
      }))
    }
  })
}

// Computed properties
const principles = computed(() => wcagDataParsed.value)

const currentPrinciple = computed(() => {
  return selectedPrincipleIdx.value !== null 
    ? principles.value[selectedPrincipleIdx.value] 
    : {}
})

const currentGuideline = computed(() => {
  return selectedGuidelineIdx.value !== null && currentPrinciple.value?.Guidelines
    ? currentPrinciple.value.Guidelines[selectedGuidelineIdx.value]
    : {}
})

const currentRule = computed(() => {
  return selectedRuleIdx.value !== null && currentGuideline.value?.Rules
    ? currentGuideline.value.Rules[selectedRuleIdx.value]
    : {}
})

// Navigation helpers
const currentRuleIndex = computed(() => {
  let index = 0
  for (let pIdx = 0; pIdx < principles.value.length; pIdx++) {
    const principle = principles.value[pIdx]
    for (let gIdx = 0; gIdx < (principle.Guidelines || []).length; gIdx++) {
      const guideline = principle.Guidelines[gIdx]
      for (let rIdx = 0; rIdx < (guideline.Rules || []).length; rIdx++) {
        if (pIdx === selectedPrincipleIdx.value && 
            gIdx === selectedGuidelineIdx.value && 
            rIdx === selectedRuleIdx.value) {
          return index
        }
        index++
      }
    }
  }
  return 0
})

const totalRules = computed(() => {
  let total = 0
  principles.value.forEach(principle => {
    principle.Guidelines?.forEach(guideline => {
      total += guideline.Rules?.length || 0
    })
  })
  return total
})

const hasNextRule = computed(() => currentRuleIndex.value < totalRules.value - 1)
const hasPrevRule = computed(() => currentRuleIndex.value > 0)

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

// Helper functions
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

const getLevelColor = (level) => {
  switch (level) {
    case 'A':
      return 'success'
    case 'AA':
      return 'warning'
    case 'AAA':
      return 'error'
    default:
      return 'grey'
  }
}

// Navigation methods
const selectPrinciple = (pIdx) => {
  if (pIdx === selectedPrincipleIdx.value) {
    // Collapse if already selected
    selectedPrincipleIdx.value = null
    selectedGuidelineIdx.value = null
    selectedRuleIdx.value = null
    return
  }

  selectedPrincipleIdx.value = pIdx
  selectedGuidelineIdx.value = null
  selectedRuleIdx.value = null

  // Auto-select first guideline and rule if available
  const newPrinciple = principles.value[pIdx]
  if (newPrinciple?.Guidelines?.length > 0) {
    selectedGuidelineIdx.value = 0
    const firstGuideline = newPrinciple.Guidelines[0]
    if (firstGuideline?.Rules?.length > 0) {
      selectedRuleIdx.value = 0
    }
  }
}

const selectGuideline = (gIdx, pIdx = null) => {
  if (pIdx !== null) {
    selectedPrincipleIdx.value = pIdx
  }
  
  selectedGuidelineIdx.value = gIdx
  selectedRuleIdx.value = null

  // Auto-select first rule if available
  const guideline = currentPrinciple.value?.Guidelines?.[gIdx]
  if (guideline?.Rules?.length > 0) {
    selectedRuleIdx.value = 0
  }
}

const selectRule = (rIdx) => {
  selectedRuleIdx.value = rIdx
}

const nextRule = () => {
  const currentIdx = currentRuleIndex.value
  if (currentIdx < totalRules.value - 1) {
    navigateToRuleByIndex(currentIdx + 1)
  }
}

const prevRule = () => {
  const currentIdx = currentRuleIndex.value
  if (currentIdx > 0) {
    navigateToRuleByIndex(currentIdx - 1)
  }
}

const navigateToRuleByIndex = (targetIndex) => {
  let index = 0
  for (let pIdx = 0; pIdx < principles.value.length; pIdx++) {
    const principle = principles.value[pIdx]
    for (let gIdx = 0; gIdx < (principle.Guidelines || []).length; gIdx++) {
      const guideline = principle.Guidelines[gIdx]
      for (let rIdx = 0; rIdx < (guideline.Rules || []).length; rIdx++) {
        if (index === targetIndex) {
          selectedPrincipleIdx.value = pIdx
          selectedGuidelineIdx.value = gIdx
          selectedRuleIdx.value = rIdx
          return
        }
        index++
      }
    }
  }
}

// Initialize component
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Transform and load the WCAG data
    wcagDataParsed.value = transformWcagData(wcagData)
    
    // Auto-select first principle, guideline, and rule
    if (wcagDataParsed.value.length > 0) {
      selectedPrincipleIdx.value = 0
      const firstPrinciple = wcagDataParsed.value[0]
      
      if (firstPrinciple?.Guidelines?.length > 0) {
        selectedGuidelineIdx.value = 0
        const firstGuideline = firstPrinciple.Guidelines[0]
        
        if (firstGuideline?.Rules?.length > 0) {
          selectedRuleIdx.value = 0
        }
      }
    }
  } catch (err) {
    console.error('Failed to load WCAG data:', err)
    error.value = 'Failed to load WCAG data. Please try refreshing the page.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.principle-item,
.guideline-item {
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease-in-out, border-left-color 0.2s ease;
}

/* Hover Effect */
.principle-item:hover,
.guideline-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Active Principle State */
.active-principle {
  background-color: rgba(63, 81, 181, 0.08);
  font-weight: bold;
  border-left-color: #3f51b5;
}

/* Active Guideline State */
.active-guideline {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

/* Visual Feedback on Click */
.principle-item:active,
.guideline-item:active {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Chevron Icon for dropdown */
.chevron-icon {
  transition: transform 0.3s ease-in-out;
}

.active-principle .chevron-icon {
  transform: rotate(180deg);
}

/* Container for the guidelines to create the dropdown effect */
.guidelines-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease-in-out;
  background-color: #fafafa;
}

.guidelines-container.is-open {
  max-height: 500px;
}

.scrollable-content {
  overflow-y: auto;
  height: 100vh;
}

.criteria-list {
  list-style-type: disc;
  margin: 0;
  padding-left: 20px;
}

.criteria-list li {
  margin-bottom: 8px;
}

.sidebar {
  border-right: 1px solid #e0e0e0;
}

.toc-sidebar {
  border-left: 1px solid #e0e0e0;
}

.main-content {
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

/* Compact spacing adjustments */
.v-card-title {
  padding-bottom: 8px !important;
}

.v-breadcrumbs {
  padding-top: 0 !important;
}

/* Hover effects for better UX */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Active list item styling */
.v-list-item--active {
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
}

/* Responsive adjustments */
@media (max-width: 1366px) {
  .text-h5 {
    font-size: 1.25rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }

  .v-card-text {
    padding: 12px !important;
  }
}

/* Loading and error states */
.v-overlay {
  z-index: 1000;
}

/* Chip styling */
.v-chip {
  font-size: 0.75rem !important;
}

/* Navigation styling */
.v-btn[disabled] {
  opacity: 0.5;
}
</style>
