<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Accessibility Assessment Results</span>
            <div>
              <v-btn color="primary" prepend-icon="mdi-download" @click="downloadAssessmentData" class="mr-2"
                :loading="isLoading">
                Export JSON
              </v-btn>
              <v-btn color="secondary" @click="loadAssessmentData" :loading="isLoading" prepend-icon="mdi-refresh">
                Refresh
              </v-btn>
            </div>
          </v-card-title>

          <!-- Tabs for Principles -->
          <v-tabs v-model="activeTab" grow show-arrows class="principle-tabs">
            <v-tab 
              v-for="(principle, index) in principles" 
              :key="index" 
              :value="index"
              :class="`principle-tab principle-${index}`"
            >
              <v-icon start>{{ getPrincipleIcon(index) }}</v-icon>
              {{ principle.title }}
            </v-tab>
          </v-tabs>

          <v-card-text class="pa-0">
            <v-window v-model="activeTab">
              <v-window-item v-for="(principle, pIndex) in principles" :key="pIndex" :value="pIndex">
                <v-data-table :headers="headers" :items="getRulesForPrinciple(pIndex)" :items-per-page="10"
                  :loading="isLoading" class="elevation-1" height="65vh">
                  <template v-slot:item.status="{ item }">
                    <v-chip :color="getStatusColor(item.status)" class="text-uppercase" size="small">
                      {{ item.status || 'Not Set' }}
                    </v-chip>
                  </template>

                  <template v-slot:item.severity="{ item }">
                    <v-chip :color="getSeverityColor(item.severity)" class="text-uppercase" size="small"
                      variant="outlined">
                      {{ item.severity || 'Not Set' }}
                    </v-chip>
                  </template>

                  <template v-slot:item.notes="{ item }">
                    <v-btn v-if="item.notes && item.notes.length > 0" icon size="small" @click="openNotesDialog(item)">
                      <v-icon size="small">mdi-note-text-outline</v-icon>
                    </v-btn>
                    <span v-else class="text-grey">-</span>
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Notes Dialog -->
  <v-dialog v-model="notesDialog.show" max-width="800px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Notes for {{ notesDialog.ruleId }} -
          {{ notesDialog.ruleTitle }}</span>
        <v-btn icon @click="notesDialog.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-list>
          <v-list-item v-for="(note, index) in notesDialog.notes" :key="index" class="mb-4">
            <template v-slot:prepend>
              <v-avatar color="primary" size="40" class="mr-4">
                <span class="text-white">{{ index + 1 }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-h6 mb-2">
              Note {{ index + 1 }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-1 mb-2">
              {{ note.text }}
            </v-list-item-subtitle>
            <v-img v-if="note.imagePreview" :src="note.imagePreview" max-height="300" contain
              class="mt-2 mb-2 rounded"></v-img>
            <v-chip v-if="note.imageName" size="small" color="grey lighten-2" class="mt-2">
              <v-icon size="small" class="mr-1">mdi-image</v-icon>
              {{ note.imageName }}
            </v-chip>
          </v-list-item>
          <v-list-item v-if="!notesDialog.notes || notesDialog.notes.length === 0">
            <v-list-item-title class="text-grey">
              No notes available for this rule.
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="notesDialog.show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

// Icons for principles
const principleIcons = [
  'mdi-eye',
  'mdi-hand-wave',
  'mdi-brain',
  'mdi-dumbbell',
]

const store = useStore()
const route = useRoute()
const toast = useToast()

// State
const isLoading = ref(true)
const activeTab = ref(0)
const assessmentData = ref({})
const wcagData = ref(null)
const principles = ref([])
const allRules = ref([])
const assessmentRules = ref({})

// Notes dialog state
const notesDialog = ref({
  show: false,
  ruleId: '',
  ruleTitle: '',
  notes: [],
})

const headers = [
  { title: 'Rule ID', key: 'ruleId', sortable: true },
  { title: 'Title', key: 'ruleTitle', sortable: true },
  { title: 'Principle', key: 'principle', sortable: true },
  { title: 'Guideline', key: 'guideline', sortable: true },
  { title: 'Level', key: 'level', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Severity', key: 'severity', sortable: true },
  { title: 'Notes', key: 'notes', sortable: false, align: 'center' },
]

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pass':
      return 'success'
    case 'fail':
      return 'error'
    case 'na':
      return 'grey'
    default:
      return 'grey lighten-2'
  }
}

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'grey lighten-2'
  }
}

const openNotesDialog = (item) => {
  notesDialog.value = {
    show: true,
    ruleId: item.ruleId,
    ruleTitle: item.ruleTitle,
    notes: item.notes || [],
  }
}

// Helper to find a rule by ID
const findRuleById = (ruleId) => {
  for (const principle of wcagData.value?.principles || []) {
    for (const guideline of principle.guidelines || []) {
      const rule = (guideline.rules || []).find((r) => r.id === ruleId)
      if (rule)
        return {
          ...rule,
          principle: principle.title,
          guideline: guideline.title,
        }
    }
  }
  return null
}

// Get all rules from WCAG data
const getAllRules = () => {
  const rules = []
  wcagData.value?.principles?.forEach((principle) => {
    principle.guidelines?.forEach((guideline) => {
      guideline.rules?.forEach((rule) => {
        rules.push({
          ...rule,
          principle: principle.title,
          guideline: guideline.title,
        })
      })
    })
  })
  return rules
}

// Get rules for the current principle
const getRulesForPrinciple = (principleIndex) => {
  try {
    const principle = principles.value?.[principleIndex]
    if (!principle) {
      console.error(`No principle found at index ${principleIndex}`)
      return []
    }

    // Get all rules that belong to this principle
    const principleRules = allRules.value.filter(
      (rule) =>
        rule.principleId === principle.id || rule.principle === principle.title,
    )

    // Map each rule with its assessment data
    return principleRules.map((rule) => {
      const assessment = assessmentRules.value[rule.id] || {
        status: 'Not Set',
        severity: 'Not Set',
        notes: [],
      }

      return {
        ruleId: rule.id,
        ruleTitle: rule.title || rule.id,
        principle: rule.principle,
        guideline: rule.guideline,
        level: rule.level || 'N/A',
        status: assessment.status,
        severity: assessment.severity,
        notes: Array.isArray(assessment.notes)
          ? assessment.notes
          : assessment.notes
            ? [assessment.notes]
            : [],
        criteria: rule.criteria || [],
      }
    })
  } catch (error) {
    console.error('Error getting rules for principle:', error)
    return []
  }
}

// Get principle icon
const getPrincipleIcon = (index) => {
  return principleIcons[index] || 'mdi-help-circle'
}

// Load WCAG data from the store
const loadWcagData = async () => {
  try {
    isLoading.value = true

    // Ensure WCAG data is loaded in the store
    if (!store.state.Assessment.wcagData) {
      await store.dispatch('Assessment/initializeAssessment')
    }

    // Get WCAG data from store
    wcagData.value = store.state.Assessment.wcagData

    if (wcagData.value?.principles) {
      // Map principles for tabs
      principles.value = wcagData.value.principles.map((p, index) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        index,
      }))

      // Extract all rules with their hierarchy
      allRules.value = []

      wcagData.value.principles.forEach((principle) => {
        // Check for both Guidelines and guidelines for backward compatibility
        const guidelines = principle.Guidelines || principle.guidelines || []

        guidelines.forEach((guideline) => {
          // Check for both Rules and rules for backward compatibility
          const rules = guideline.Rules || guideline.rules || []

          rules.forEach((rule) => {
            allRules.value.push({
              ...rule,
              principle: principle.title,
              principleId: principle.id,
              guideline: guideline.title,
              guidelineId: guideline.id,
            })
          })
        })
      })
    } else {
      toast.error('Failed to load WCAG principles')
    }
  } catch (error) {
    console.error('Error loading WCAG data:', error)
    toast.error(`Failed to load WCAG data: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// Load assessment data from Firestore
const loadAssessmentData = async () => {
  try {
    isLoading.value = true

    // Get the current user
    const user = store.state.Auth.user

    if (!user || !user.id) {
      throw new Error('User not authenticated')
    }

    // Get the test ID from route or use a default
    const testId = route.params.testId || 'default-test-id'

    // Load WCAG data if not already loaded
    if (!wcagData.value) {
      await loadWcagData()
    } else {
    }

    // Get the assessment document from Firestore
    const { getDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/firebase')

    const docId = `${user.id}_${testId}`

    const docRef = doc(db, 'assessments', docId)
    const docSnap = await getDoc(docRef)

    const assessmentLookup = {}

    if (docSnap.exists()) {
      const assessment = docSnap.data()

      if (assessment?.assessmentData) {
        assessment.assessmentData.forEach((item) => {
          assessmentLookup[item.ruleId] = {
            status: item.status || 'Not Set',
            severity: item.severity || 'Not Set',
            notes: item.notes || [],
          }
        })
      }
    } else {
      toast.info('No assessment data found. Create an assessment first.')
    }

    // Merge with all rules
    const mergedData = {}
    if (allRules.value && allRules.value.length > 0) {
      allRules.value.forEach((rule) => {
        const assessment = assessmentLookup[rule.id] || {
          status: 'Not Set',
          severity: 'Not Set',
          notes: [],
        }

        mergedData[rule.id] = {
          ...rule,
          ...assessment,
        }
      })
    } else {
      toast.error('Failed to load WCAG rules')
    }

    assessmentRules.value = assessmentLookup
    assessmentData.value = mergedData
  } catch (error) {
    console.error('Error loading assessment data:', error)
    toast.error(
      `Failed to load assessment data: ${error.message || 'Unknown error'}`,
    )
  } finally {
    isLoading.value = false
  }
}

const downloadAssessmentData = () => {
  try {
    const dataStr = JSON.stringify(assessmentData.value, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `accessibility-assessment-${new Date().toISOString().split('T')[0]
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

onMounted(async () => {
  await loadWcagData()
  await loadAssessmentData()
})
</script>

<style scoped>
.v-data-table {
  --v-theme-surface: #ffffff;
}

.v-data-table-header {
  background-color: #f5f5f5;
}

/* Principle Tabs Styling */
.principle-tabs {
  background-color: #f5f5f5;
  border-radius: 4px 4px 0 0;
}

.principle-tab {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.principle-tab.principle-0 {
  background-color: #e3f2fd;  /* Perceivable - Light Blue */
  color: #0d47a1;
}

.principle-tab.principle-1 {
  background-color: #e8f5e9;  /* Operable - Light Green */
  color: #1b5e20;
}

.principle-tab.principle-2 {
  background-color: #fff8e1;  /* Understandable - Light Amber */
  color: #e65100;
}

.principle-tab.principle-3 {
  background-color: #fce4ec;  /* Robust - Light Pink */
  color: #880e4f;
}

.principle-tab.v-tab--selected {
  font-weight: 600;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.principle-0.v-tab--selected {
  background-color: #bbdefb !important;  /* Perceivable - Blue */
}

.principle-1.v-tab--selected {
  background-color: #c8e6c9 !important;  /* Operable - Green */
}

.principle-2.v-tab--selected {
  background-color: #fff176 !important;  /* Understandable - Amber */
}

.principle-3.v-tab--selected {
  background-color: #f8bbd0 !important;  /* Robust - Pink */
}

.v-data-table-header th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.v-data-table__td {
  padding: 12px 16px;
}

.v-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Custom scrollbar for notes dialog */
.v-dialog .v-card {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.v-dialog .v-card__text {
  overflow-y: auto;
  flex: 1;
}

/* Style for note items */
.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  align-items: flex-start;
}

.v-list-item:last-child {
  border-bottom: none;
}

/* Avatar styling */
.v-avatar {
  flex-shrink: 0;
}
</style>
