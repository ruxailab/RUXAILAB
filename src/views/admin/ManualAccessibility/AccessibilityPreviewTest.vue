<template>
  <v-app>
    <v-overlay v-model="isLoading" class="align-center justify-center" opacity="0.8">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <div class="mt-4 text-h6">Loading WCAG Data...</div>
    </v-overlay>

    <v-alert v-if="error" type="error" class="ma-2" closable @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- Full width container without padding -->
    <v-container fluid class="pa-0 ma-0 fill-height">
      <v-row no-gutters class="fill-height">
        <!-- Left Sidebar Navigation - Reduced width -->
        <v-col cols="2" class="sidebar fill-height">
          <v-card flat class="h-100" color="grey-lighten-4">
            <v-card-title class="text-subtitle-1 pa-3 font-weight-bold">WCAG Principles</v-card-title>
            <v-list density="compact" class="pa-0" v-if="principles.length > 0">
              <v-list-group v-for="(principle, pIdx) in principles" :key="principle.id || pIdx"
                :value="(principle?.title || '').toLowerCase()" :prepend-icon="getPrincipleIcon(pIdx)"
                :class="{ 'active-principle': selectedPrincipleIdx === pIdx }" :active="selectedPrincipleIdx === pIdx">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" :title="principle?.title || 'Untitled Principle'"
                    @click="selectPrinciple(pIdx)" class="text-body-2" />
                </template>
                <v-list-item v-for="(guideline, gIdx) in principle?.Guidelines || []" :key="guideline?.id || gIdx"
                  prepend-icon="mdi-circle-outline" :title="(guideline?.id || '') + ' ' + (guideline?.title || '')
                    " class="ml-3 text-caption" :active="selectedGuidelineIdx === gIdx &&
                      selectedPrincipleIdx === pIdx
                      " @click="selectGuideline(gIdx, pIdx)" />
              </v-list-group>
            </v-list>
            <v-list v-else>
              <v-list-item>
                <v-list-item-title class="text-grey text-body-2">
                  {{ isLoading ? 'Loading...' : 'No principles available' }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content Area - Optimized for laptop -->
        <v-col cols="7" class="main-content fill-height">
          <v-card flat class="h-100 pa-4 scrollable-content">
            <!-- Compact Breadcrumb -->
            <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-3" density="compact">
              <template #divider>
                <v-icon icon="mdi-chevron-right" size="small" />
              </template>
            </v-breadcrumbs>

            <!-- Compact Page Header -->
            <div class="mb-4">
              <h1 class="text-h5 font-weight-bold mb-2">
                {{ currentRule?.id }} {{ currentRule?.title }}
              </h1>
              <!-- Compact chips -->
              <div class="d-flex gap-1 mb-3">
                <v-chip color="primary" variant="flat" size="x-small" prepend-icon="mdi-numeric" class="text-caption">
                  Level {{ currentRule?.level || 'N/A' }}
                </v-chip>
                <v-chip color="secondary" variant="flat" size="x-small" prepend-icon="mdi-tag" class="text-caption">
                  v{{ currentRule?.version || 'N/A' }}
                </v-chip>
                <v-chip v-if="currentRule?.conformanceLevel" color="success" variant="flat" size="x-small"
                  prepend-icon="mdi-check-circle" class="text-caption">
                  {{ currentRule.conformanceLevel }}
                </v-chip>
              </div>
            </div>

            <!-- Compact Guideline Box -->
            <v-alert variant="tonal" color="info" class="mb-4 pa-3">
              <div class="d-flex align-start">
                <v-icon class="mr-2 mt-1" size="small">mdi-information-outline</v-icon>
                <div>
                  <div class="font-weight-medium mb-1 text-body-2">
                    {{ currentGuideline?.title || 'No guideline selected' }}
                  </div>
                  <div v-if="currentGuideline" class="text-caption">
                    {{
                      currentGuideline.description || 'No description available'
                    }}
                  </div>
                </div>
              </div>
            </v-alert>

            <!-- Compact Success Criterion Section -->
            <div class="mb-4">
              <h2 class="text-h6 font-weight-bold mb-2">Success Criterion</h2>
              <v-card variant="outlined" class="mb-2" style="border: 2px solid #4caf50">
                <v-card-text class="pa-3">
                  <div v-if="!currentRule?.criteria?.length" class="text-caption text-grey">
                    No success criteria available for this rule.
                  </div>
                  <ul v-else class="criteria-list pl-3 mb-0">
                    <li v-for="(crit, cIdx) in currentRule.criteria" :key="cIdx" class="mb-1">
                      <pre class="criterion-pre mb-0 text-body-2" style="
                          white-space: pre-wrap;
                          font-family: inherit;
                          line-height: 1.4;
                        ">{{ crit }}</pre>
                    </li>
                  </ul>
                </v-card-text>
              </v-card>
            </div>

            <!-- Compact Appraiser Notes Section -->
            <div class="my-4">
              <h2 class="text-h6 font-weight-bold mb-2">Appraiser Notes</h2>
              <v-tabs v-model="activeNoteTab" class="mb-2" density="compact" show-arrows>
                <v-tab v-for="(note, idx) in notes" :key="'note-tab-' + idx" :value="idx" class="text-caption">
                  Note {{ idx + 1 }}
                  <v-btn v-if="notes.length > 1" icon="mdi-close" size="x-small" variant="plain" class="ml-1"
                    @click.stop="removeNote(idx)" />
                </v-tab>
                <v-tab key="add-note" @click.stop="addNote" class="add-note-tab">
                  <v-icon size="small">mdi-plus</v-icon>
                </v-tab>
              </v-tabs>
              <v-window v-model="activeNoteTab">
                <v-window-item v-for="(note, idx) in notes" :key="'note-window-' + idx" :value="idx">
                  <v-textarea v-model="note.text" variant="outlined" rows="3" placeholder="Enter your notes here..."
                    hide-details class="mb-2" density="compact" />
                  <div class="d-flex align-center mb-2">
                    <v-file-input v-model="note.image" accept="image/*" label="Attach image" prepend-icon="mdi-image"
                      show-size hide-details @change="onImageChange(idx)" class="mr-3" style="max-width: 250px"
                      density="compact" />
                    <div v-if="note.imagePreview" class="note-image-preview d-flex align-center">
                      <img :src="note.imagePreview" alt="Notes attachment" style="
                          max-width: 80px;
                          max-height: 60px;
                          border-radius: 4px;
                        " />
                      <v-btn icon="mdi-close" size="x-small" variant="plain" class="ml-1" @click="removeImage(idx)" />
                    </div>
                  </div>
                </v-window-item>
              </v-window>
            </div>

            <!-- Compact Assessment Section -->
            <v-row class="mb-4">
              <v-col cols="6">
                <h2 class="text-h6 font-weight-bold mb-2">Severity</h2>
                <v-radio-group v-model="severity" density="compact" class="mt-0">
                  <v-radio label="High" value="high" color="error" density="compact" />
                  <v-radio label="Medium" value="medium" color="warning" density="compact" />
                  <v-radio label="Low" value="low" color="success" density="compact" />
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <h2 class="text-h6 font-weight-bold mb-2">Status</h2>
                <v-radio-group v-model="status" density="compact" class="mt-0">
                  <v-radio label="Pass" value="pass" color="success" density="compact" />
                  <v-radio label="Fail" value="fail" color="error" density="compact" />
                  <v-radio label="N/A" value="na" color="grey" density="compact" />
                </v-radio-group>
              </v-col>
            </v-row>

            <!-- Compact Save Button -->
            <div class="mb-4">
              <v-btn prepend-icon="mdi-content-save" size="default" color="success" @click="saveAssessment"
                :loading="isLoading" :disabled="!currentRule?.id" variant="flat">
                Save Assessment
              </v-btn>
            </div>

            <!-- Compact Navigation -->
            <v-card flat class="pa-3" color="grey-lighten-4" style="border-radius: 8px">
              <div class="d-flex justify-space-between align-center">
                <v-btn variant="text" prepend-icon="mdi-chevron-left" color="grey-darken-2" @click="prevRule"
                  size="small">
                  Previous
                </v-btn>
                <div class="text-body-2 text-grey-darken-1">
                  {{ selectedRuleIdx + 1 }} / {{ rules?.length || 0 }}
                </div>
                <v-btn variant="flat" append-icon="mdi-chevron-right" color="amber" class="text-black" @click="nextRule"
                  size="small">
                  Next
                </v-btn>
              </div>
            </v-card>
          </v-card>
        </v-col>

        <!-- Right Sidebar - Compact Table of Contents -->
        <v-col cols="3" class="toc-sidebar fill-height">
          <v-card flat class="h-100" color="grey-lighten-5">
            <v-card-title class="text-subtitle-1 pa-3 font-weight-bold">On this page</v-card-title>
            <v-list density="compact" class="pa-1">
              <template v-if="principles.length > 0">
                <template v-for="(principle, pIdx) in principles">
                  <v-list-subheader v-if="principles.length > 1" :key="'principle-subheader-' + pIdx">{{ principle.title
                  }}</v-list-subheader>
                  <template v-for="(guideline, gIdx) in principle.Guidelines">
                    <v-list-subheader v-if="principle.Guidelines.length > 1" :key="'guideline-subheader-' + gIdx">{{
                      guideline.title }}</v-list-subheader>
                    <v-list-item v-for="(rule, rIdx) in guideline.rules" :key="rule.id || rIdx"
                      prepend-icon="mdi-circle-outline" :title="(rule?.id || '') + ' ' + (rule?.title || '')" :active="selectedPrincipleIdx === pIdx &&
                        selectedGuidelineIdx === gIdx &&
                        selectedRuleIdx === rIdx
                        " class="text-caption pa-2" @click="selectRule(rIdx, gIdx, pIdx)" :class="{
                          'v-list-item--active':
                            selectedPrincipleIdx === pIdx &&
                            selectedGuidelineIdx === gIdx &&
                            selectedRuleIdx === rIdx,
                        }" />
                  </template>
                </template>
              </template>
              <v-list-item v-else>
                <v-list-item-title class="text-grey text-caption">No rules available</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Compact Floating Action Button -->
    <v-tooltip location="left">
      <template #activator="{ props }">
        <v-btn data-testid="create-test-btn" size="default" icon position="fixed" location="bottom right"
          color="#F9A826" variant="elevated" class="mr-3 mb-4 floating-save-btn" rounded="circle" v-bind="props"
          @click="viewAssessmentDocument" elevation="4">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
      <span>View Assessment</span>
    </v-tooltip>

    <!-- Compact Assessment Data Dialog -->
    <v-dialog v-model="showAssessmentDialog" max-width="1000" max-height="700">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-3">
          <span class="text-h6">Assessment Data</span>
          <v-btn icon size="small" @click="showAssessmentDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-data-table :headers="[
            { title: 'Rule ID', key: 'ruleId', width: '100px' },
            { title: 'Title', key: 'ruleTitle', width: '200px' },
            { title: 'Principle', key: 'principle', width: '120px' },
            { title: 'Guideline', key: 'guideline', width: '120px' },
            { title: 'Level', key: 'level', width: '80px' },
            { title: 'Status', key: 'status', width: '80px' },
            { title: 'Severity', key: 'severity', width: '80px' },
          ]" :items="Object.values(assessmentData)" :items-per-page="15" class="elevation-1" height="60vh"
            density="compact">
            <template #item.notes="{ item }">
              <v-tooltip bottom max-width="400">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon size="small" v-bind="attrs" v-on="on">
                    <v-icon size="small">mdi-note-text</v-icon>
                  </v-btn>
                </template>
                <div>
                  <div v-for="(note, index) in item.notes" :key="index" class="mb-2">
                    <strong>Note {{ index + 1 }}:</strong>
                    <div>{{ note.text }}</div>
                    <div v-if="note.imageName" class="mt-1">
                      <v-chip size="small" color="grey lighten-2">
                        <v-icon left size="small">mdi-image</v-icon>
                        {{ note.imageName }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showAssessmentDialog = false">Close</v-btn>
          <v-btn color="primary" variant="text" @click="downloadAssessmentData">
            <v-icon left>mdi-download</v-icon>
            Export JSON
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const store = useStore()
const route = useRoute()
const error = ref('')
const selectedCriteria = ref([])
const user = computed(() => store.getters.user)
// Computed properties from store
const isLoading = computed(() => store.state.Assessment?.isLoading || false)
// Use filteredWcagData so only selected guidelines/rules are shown
const principles = computed(
  () => store.state.Assessment?.filteredWcagData?.principles || [],
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

// Use filtered data for current principle/guideline/rule
const currentPrinciple = computed(() => {
  return principles.value[store.state.Assessment.selectedPrincipleIdx] || {}
})
const guidelines = computed(() => currentPrinciple.value?.Guidelines || [])
const currentGuideline = computed(() => {
  return guidelines.value[store.state.Assessment.selectedGuidelineIdx] || {}
})
const rules = computed(() => currentGuideline.value?.rules || [])
const currentRule = computed(() => {
  return rules.value[store.state.Assessment.selectedRuleIdx] || {}
})

// Notes as array of objects: [{ text: '', image: null, imagePreview: '' }]
const notes = ref([{ text: '', image: null, imagePreview: '' }])
const activeNoteTab = ref(0)

// Local refs for form inputs
const severity = ref('')
const status = ref('')

// Get current assessment data
const currentAssessment = computed(() => {
  const ruleId = currentRule.value?.id
  return ruleId ? store.getters['Assessment/getRuleAssessment'](ruleId) : {}
})

// Helper to restore notes from store (including tabs)
function restoreNotesFromAssessment(assessment) {
  if (
    assessment &&
    Array.isArray(assessment.notes) &&
    assessment.notes.length > 0
  ) {
    notes.value = assessment.notes.map((n) => ({
      text: n.text || '',
      image: null,
      imagePreview: '', // imagePreview will be set on upload only
      imageName: n.imageName || null,
    }))
  } else {
    notes.value = [{ text: '', image: null, imagePreview: '', imageName: null }]
  }
  activeNoteTab.value = 0
}

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

    // Initialize the assessment
    await store.dispatch('Assessment/initializeAssessment')

    // Get the current user
    const user = store.state.Auth.user
    if (!user || !user.id) {
      throw new Error('User not authenticated')
    }

    // Get the test ID from route or use a default
    const testId = route.params.testId || 'default-test-id'

    // Load the assessment data from Firestore
    const loadedAssessment = await store.dispatch('Assessment/loadAssessment', {
      userId: user.id,
      testId,
    })

    // If we have a loaded assessment, update the UI
    if (loadedAssessment && loadedAssessment.assessmentData) {
      const currentRuleId = currentRule.value?.id
      if (currentRuleId) {
        const assessment =
          store.getters['Assessment/getRuleAssessment'](currentRuleId)
        if (assessment) {
          severity.value = assessment.severity || ''
          status.value = assessment.status || ''
          restoreNotesFromAssessment(assessment)
        }
      }
    }
  } catch (err) {
    console.error('Failed to initialize assessment:', err)
    error.value =
      'Failed to load assessment data. Please try refreshing the page.'
  } finally {
    isLoading.value = false
  }
})

// Watch for rule changes to update form and notes
watch(
  () => currentRule.value?.id,
  (newRuleId, oldRuleId) => {
    if (newRuleId && newRuleId !== oldRuleId) {
      const assessment =
        store.getters['Assessment/getRuleAssessment'](newRuleId)
      severity.value = assessment.severity || ''
      status.value = assessment.status || ''
      selectedCriteria.value = []
      restoreNotesFromAssessment(assessment)
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
const selectPrinciple = (pIdx) => {
  if (pIdx >= 0 && pIdx < principles.value.length) {
    store.dispatch('Assessment/selectPrinciple', pIdx)
    // Always reset guideline and rule to first available for this principle
    const newGuidelines = principles.value[pIdx]?.Guidelines || []
    if (newGuidelines.length > 0) {
      store.dispatch('Assessment/selectGuideline', 0)
      const newRules = newGuidelines[0]?.rules || []
      if (newRules.length > 0) {
        store.dispatch('Assessment/selectRule', 0)
      }
    }
  }
}

const selectGuideline = (gIdx, pIdx = null) => {
  // If pIdx is provided, switch principle first
  if (pIdx !== null && pIdx >= 0 && pIdx < principles.value.length) {
    store.dispatch('Assessment/selectPrinciple', pIdx)
  }
  const guidelinesArr =
    pIdx !== null ? principles.value[pIdx]?.Guidelines || [] : guidelines.value
  if (gIdx >= 0 && gIdx < guidelinesArr.length) {
    store.dispatch('Assessment/selectGuideline', gIdx)
    // Always reset rule to first available for this guideline
    const newRules = guidelinesArr[gIdx]?.rules || []
    if (newRules.length > 0) {
      store.dispatch('Assessment/selectRule', 0)
    }
  }
}

// Accept optional guideline/principle indices for direct navigation
const selectRule = (rIdx, gIdx = null, pIdx = null) => {
  // Defensive: always use the latest data for the indices
  let p = pIdx !== null ? pIdx : selectedPrincipleIdx.value
  let g = gIdx !== null ? gIdx : selectedGuidelineIdx.value
  // Validate principle
  if (p < 0 || p >= principles.value.length) return
  // Validate guideline
  const guidelinesArr = principles.value[p]?.Guidelines || []
  if (g < 0 || g >= guidelinesArr.length) return
  // Validate rule
  const rulesArr = guidelinesArr[g]?.rules || []
  if (rIdx < 0 || rIdx >= rulesArr.length) return
  // Set all three indices in order
  store.commit('Assessment/SET_SELECTED_PRINCIPLE', p)
  store.commit('Assessment/SET_SELECTED_GUIDELINE', g)
  store.commit('Assessment/SET_SELECTED_RULE', rIdx)
}

// Next/Previous navigation
const nextRule = () => {
  // Try next rule in current guideline
  if (selectedRuleIdx.value + 1 < rules.value.length) {
    store.dispatch('Assessment/selectRule', selectedRuleIdx.value + 1)
    return
  }
  // Try next guideline in current principle
  if (selectedGuidelineIdx.value + 1 < guidelines.value.length) {
    store.dispatch('Assessment/selectGuideline', selectedGuidelineIdx.value + 1)
    if (guidelines.value[selectedGuidelineIdx.value + 1]?.rules?.length > 0) {
      store.dispatch('Assessment/selectRule', 0)
    }
    return
  }
  // Try next principle
  if (selectedPrincipleIdx.value + 1 < principles.value.length) {
    store.dispatch('Assessment/selectPrinciple', selectedPrincipleIdx.value + 1)
    if (
      principles.value[selectedPrincipleIdx.value + 1]?.Guidelines?.length > 0
    ) {
      store.dispatch('Assessment/selectGuideline', 0)
      if (
        principles.value[selectedPrincipleIdx.value + 1]?.Guidelines[0]?.rules
          ?.length > 0
      ) {
        store.dispatch('Assessment/selectRule', 0)
      }
    }
    return
  }
}

const prevRule = () => {
  // Try previous rule in current guideline
  if (selectedRuleIdx.value > 0) {
    store.dispatch('Assessment/selectRule', selectedRuleIdx.value - 1)
    return
  }
  // Try previous guideline in current principle
  if (selectedGuidelineIdx.value > 0) {
    const prevGuideline = guidelines.value[selectedGuidelineIdx.value - 1]
    if (
      prevGuideline &&
      prevGuideline.rules &&
      prevGuideline.rules.length > 0
    ) {
      store.dispatch(
        'Assessment/selectGuideline',
        selectedGuidelineIdx.value - 1,
      )
      store.dispatch('Assessment/selectRule', prevGuideline.rules.length - 1)
      return
    }
  }
  // Try previous principle
  if (selectedPrincipleIdx.value > 0) {
    const prevPrinciple = principles.value[selectedPrincipleIdx.value - 1]
    if (
      prevPrinciple &&
      prevPrinciple.Guidelines &&
      prevPrinciple.Guidelines.length > 0
    ) {
      const lastGuidelineIdx = prevPrinciple.Guidelines.length - 1
      const lastGuideline = prevPrinciple.Guidelines[lastGuidelineIdx]
      if (
        lastGuideline &&
        lastGuideline.rules &&
        lastGuideline.rules.length > 0
      ) {
        store.dispatch(
          'Assessment/selectPrinciple',
          selectedPrincipleIdx.value - 1,
        )
        store.dispatch('Assessment/selectGuideline', lastGuidelineIdx)
        store.dispatch('Assessment/selectRule', lastGuideline.rules.length - 1)
      }
    }
  }
}

// Add a new note tab
const addNote = () => {
  notes.value.push({ text: '', image: null, imagePreview: '', imageName: null })
  activeNoteTab.value = notes.value.length - 1
}

// Remove a note tab
const removeNote = (idx) => {
  if (notes.value.length > 1) {
    notes.value.splice(idx, 1)
    if (activeNoteTab.value >= notes.value.length) {
      activeNoteTab.value = notes.value.length - 1
    }
  }
}

// Handle image upload and preview
const onImageChange = (idx) => {
  const file = notes.value[idx].image
  if (file && file instanceof File) {
    notes.value[idx].imageName = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      notes.value[idx].imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    notes.value[idx].imagePreview = ''
    notes.value[idx].imageName = null
  }
}

// Remove image from note
const removeImage = (idx) => {
  notes.value[idx].image = null
  notes.value[idx].imagePreview = ''
  notes.value[idx].imageName = null
}

// Download assessment data as JSON file
const downloadAssessmentData = () => {
  try {
    const dataStr = JSON.stringify(assessmentData.value, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `assessment-data-${new Date().toISOString().split('T')[0]
      }.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast.success('Assessment data exported successfully')
  } catch (error) {
    console.error('Error exporting assessment data:', error)
    toast.error('Failed to export assessment data')
  }
}
// View Assessment Document all rules
// Dialog state
const showAssessmentDialog = ref(false)
const assessmentData = ref({})

// View all assessment data
const viewAssessmentDocument = () => {
  try {
    // Get all assessments from the store
    const allAssessments = store.getters['Assessment/getAllAssessments']
    assessmentData.value = allAssessments

    // Log to console for debugging
    console.log('All Assessment Data:', JSON.stringify(allAssessments, null, 2))

    // Show the dialog
    showAssessmentDialog.value = true
  } catch (error) {
    console.error('Error fetching assessment data:', error)
    toast.error('Failed to load assessment data')
  }
}

// Save assessment
const saveAssessment = async () => {
  try {
    const ruleId = currentRule.value?.id
    if (!ruleId) {
      throw new Error('No rule selected')
    }

    // Get the current test ID from route or props
    const testId = route.params.testId || 'default-test-id'

    // Prepare the assessment data
    const notesToSave = notes.value
      .filter((note) => note.text.trim() !== '') // Only save non-empty notes
      .map(({ text, imageName }) => ({
        text,
        imageName: imageName || null,
      }))

    const assessmentData = {
      ruleId,
      ruleTitle: currentRule.value?.title,
      principle: currentPrinciple.value?.title,
      guideline: currentGuideline.value?.title,
      level: currentRule.value?.level,
      version: currentRule.value?.version,
      notes: notesToSave,
      severity: severity.value,
      status: status.value,
      updatedAt: new Date().toISOString(),
    }

    console.log('Saving assessment data:', assessmentData)

    // Save to Firestore via Vuex
    await store.dispatch('Assessment/updateRuleAssessment', {
      userId: user.value.id,
      testId,
      ruleId,
      assessment: {
        ...assessmentData,
        // Include any additional metadata you need
      },
    })

    // Also update the local store
    await store.dispatch('Assessment/saveAssessment', {
      userId: user.value.id,
      testId,
      testType: 'manual', // or get this from props/route
    })

    toast.success('Assessment saved successfully')
  } catch (err) {
    console.error('Failed to save assessment:', err)
    error.value = err.message || 'Failed to save assessment. Please try again.'
    toast.error(error.value)
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
.scrollable-content {
  overflow-y: auto;
  height: 100vh;
}

.criteria-list {
  list-style-type: disc;
  margin: 0;
}

.criterion-pre {
  font-family: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
}

.note-image-preview {
  position: relative;
  display: inline-block;
}

.floating-save-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-list-item--active {
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
}

.active-principle {
  background-color: rgba(33, 150, 243, 0.05);
}

.add-note-tab {
  min-width: 48px !important;
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

.v-radio-group {
  margin-top: 0 !important;
}

.v-radio {
  margin-bottom: 4px !important;
}

/* Hover effects for better UX */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.floating-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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
</style>