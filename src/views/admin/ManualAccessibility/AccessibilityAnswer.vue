<template>
  <v-container
    fluid
    class="pa-6"
  >
    <v-row>
      <v-col cols="12">
        <!-- User Selection Dropdown -->
        <v-select
          v-model="selectedUserId"
          :items="userDetails.map(user => user.email)"
          label="Select User by Email"
          variant="outlined"
          density="compact"
          class="mb-4"
        />

        <v-card v-if="selectedUserId">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Accessibility Assessment Results</span>
            <div>
              <v-btn
                color="primary"
                prepend-icon="mdi-download"
                class="mr-2"
                :loading="isLoading"
                @click="downloadAssessmentData"
              >
                Export JSON
              </v-btn>
              <v-btn
                color="secondary"
                :loading="isLoading"
                prepend-icon="mdi-refresh"
                @click="loadAssessmentData"
              >
                Refresh
              </v-btn>
            </div>
          </v-card-title>

          <!-- Level Filter -->
          <v-card-subtitle class="pb-2">
            <v-row
              align="center"
              class="ma-0"
            >
              <v-col
                cols="auto"
                class="pa-0"
              >
                <span class="text-subtitle-2 font-weight-medium">WCAG Level Filter:</span>
              </v-col>
              <v-col
                cols="auto"
                class="pa-0 ml-3"
              >
                <v-btn-toggle
                  v-model="selectedLevel"
                  mandatory
                  color="primary"
                  variant="outlined"
                  divided
                  density="compact"
                >
                  <v-btn
                    value="A"
                    size="small"
                    :class="{ 'level-a': selectedLevel === 'A' }"
                  >
                    A
                  </v-btn>
                  <v-btn
                    value="AA"
                    size="small"
                    :class="{ 'level-aa': selectedLevel === 'AA' }"
                  >
                    AA
                  </v-btn>
                  <v-btn
                    value="AAA"
                    size="small"
                    :class="{ 'level-aaa': selectedLevel === 'AAA' }"
                  >
                    AAA
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              <v-col
                cols="auto"
                class="pa-0 ml-3"
              >
                <v-chip
                  size="small"
                  :color="getLevelChipColor(selectedLevel)"
                  variant="outlined"
                >
                  {{ getLevelDescription(selectedLevel) }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-subtitle>

          <!-- Tabs for Principles -->
          <v-tabs
            v-model="activeTab"
            grow
            show-arrows
            class="principle-tabs"
          >
            <v-tab
              v-for="(principle, index) in principles"
              :key="index"
              :value="index"
              :class="`principle-tab principle-${index}`"
            >
              <v-icon start>
                {{ getPrincipleIcon(index) }}
              </v-icon>
              {{ principle.title }}
              <v-chip
                size="x-small"
                class="ml-2"
                color="primary"
                variant="outlined"
              >
                {{ getFilteredRulesCount(index) }}
              </v-chip>
            </v-tab>
          </v-tabs>

          <v-card-text class="pa-0">
            <v-window v-model="activeTab">
              <v-window-item
                v-for="(principle, pIndex) in principles"
                :key="pIndex"
                :value="pIndex"
              >
                <v-data-table
                  :headers="headers"
                  :items="getRulesForPrinciple(pIndex)"
                  :items-per-page="10"
                  :loading="isLoading"
                  class="elevation-1"
                  height="65vh"
                >
                  <template #item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      class="text-uppercase"
                      size="small"
                    >
                      {{ item.status || 'Not Set' }}
                    </v-chip>
                  </template>

                  <template #item.severity="{ item }">
                    <v-chip
                      :color="getSeverityColor(item.severity)"
                      class="text-uppercase"
                      size="small"
                      variant="outlined"
                    >
                      {{ item.severity || 'Not Set' }}
                    </v-chip>
                  </template>

                  <template #item.level="{ item }">
                    <v-chip
                      :color="getLevelChipColor(item.level)"
                      class="text-uppercase"
                      size="small"
                      variant="tonal"
                    >
                      {{ item.level || 'N/A' }}
                    </v-chip>
                  </template>

                  <template #item.notes="{ item }">
                    <v-btn
                      v-if="item.notes && item.notes.length > 0"
                      icon
                      size="small"
                      @click="openNotesDialog(item)"
                    >
                      <v-icon size="small">
                        mdi-note-text-outline
                      </v-icon>
                    </v-btn>
                    <span
                      v-else
                      class="text-grey"
                    >-</span>
                  </template>
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
        <v-card v-if="!selectedUserId">
          <v-card-text class="text-center">
            <v-alert
              v-if="!selectedUserId"
              type="info"
            >
              Please select a user to view their accessibility assessment results.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Notes Dialog -->
  <v-dialog
    v-model="notesDialog.show"
    max-width="800px"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Notes for {{ notesDialog.ruleId }} -
          {{ notesDialog.ruleTitle }}</span>
        <v-btn
          icon
          @click="notesDialog.show = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-list>
          <v-list-item
            v-for="(note, index) in notesDialog.notes"
            :key="index"
            class="mb-4"
          >
            <template #prepend>
              <v-avatar
                color="primary"
                size="40"
                class="mr-4"
              >
                <span class="text-white">{{ index + 1 }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-h6 mb-2">
              Note {{ index + 1 }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-1 mb-2">
              {{ note.text }}
            </v-list-item-subtitle>
            <v-img
              v-if="note.imagePreview"
              :src="note.imagePreview"
              max-height="300"
              cover
              class="mt-2 mb-2 rounded"
            />
            <v-chip
              v-if="note.imageName"
              size="small"
              color="grey-lighten-2"
              class="mt-2"
            >
              <v-icon
                size="small"
                class="mr-1"
              >
                mdi-image
              </v-icon>
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
        <v-spacer />
        <v-btn
          color="primary"
          @click="notesDialog.show = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
const selectedLevel = ref('AA') // Default to AA level

// Notes dialog state
const notesDialog = ref({
  show: false,
  ruleId: '',
  ruleTitle: '',
  notes: [],
})

// Add state for user selection
const selectedUserId = ref(null);
const userIds = ref([]);

// Update userIds to store user details
const userDetails = ref([]);

//life cycle
onMounted(async () => {
  await loadWcagData()
  await fetchUserIdsForTest();
  await fetchUserEmails();
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

// Level filter functions
const getLevelChipColor = (level) => {
  switch (level?.toUpperCase()) {
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

const getLevelDescription = (level) => {
  switch (level?.toUpperCase()) {
    case 'A':
      return 'Level A rules only'
    case 'AA':
      return 'Level A + AA rules'
    case 'AAA':
      return 'All levels (A + AA + AAA)'
    default:
      return 'No level selected'
  }
}

const shouldIncludeRule = (ruleLevel) => {
  if (!ruleLevel) return true // Include rules without level specified

  const level = ruleLevel.toUpperCase()
  const selected = selectedLevel.value.toUpperCase()

  // Cumulative behavior: A shows only A, AA shows A+AA, AAA shows all
  switch (selected) {
    case 'A':
      return level === 'A'
    case 'AA':
      return level === 'A' || level === 'AA'
    case 'AAA':
      return level === 'A' || level === 'AA' || level === 'AAA'
    default:
      return true
  }
}

const getFilteredRulesCount = (principleIndex) => {
  const principle = principles.value?.[principleIndex]
  if (!principle) return 0

  const principleRules = allRules.value.filter(
    (rule) => rule.principleId === principle.id || rule.principle === principle.title
  )

  return principleRules.filter(rule => shouldIncludeRule(rule.level)).length
}

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

// Get rules for the current principle (with level filtering)
const getRulesForPrinciple = (principleIndex) => {
  try {
    const principle = principles.value?.[principleIndex];
    if (!principle) {
      console.error(`No principle found at index ${principleIndex}`);
      return [];
    }

    const principleRules = allRules.value.filter(
      (rule) =>
        rule.principleId === principle.id || rule.principle === principle.title
    );

    // Apply level filtering
    const filteredRules = principleRules.filter(rule => shouldIncludeRule(rule.level));

    return filteredRules.map((rule) => {
      const assessment = assessmentRules.value[rule.id] || {
        status: 'Not Set',
        severity: 'Not Set',
        notes: [],
      };

      let normalizedNotes = [];
      if (Array.isArray(assessment.notes)) {
        normalizedNotes = assessment.notes;
      } else if (assessment.notes) {
        normalizedNotes = [assessment.notes];
      }

      return {
        ruleId: rule.id,
        ruleTitle: rule.title || rule.id,
        principle: rule.principle,
        guideline: rule.guideline,
        level: rule.level || 'N/A',
        status: assessment.status,
        severity: assessment.severity,
        notes: normalizedNotes,
        criteria: rule.criteria || [],
      };
    });
  } catch (error) {
    console.error('Error getting rules for principle:', error);
    return [];
  }
};

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

// Fetch all user IDs for the given testId
const fetchUserIdsForTest = async () => {
  try {
    const { query, where, getDocs, collection } = await import('firebase/firestore');
    const { db } = await import('@/firebase');

    const q = query(
      collection(db, 'assessments'),
      where('testId', '==', route.params.testId || 'default-test-id')
    );

    const querySnapshot = await getDocs(q);
    userIds.value = querySnapshot.docs.map((doc) => doc.data().userId);
  } catch (error) {
    console.error('Error fetching user IDs:', error);
    toast.error('Failed to fetch user IDs.');
  }
};

// Fetch user emails for the given user IDs
const fetchUserEmails = async () => {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('@/firebase');

    const userPromises = userIds.value.map(async (userId) => {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userId, email: userSnap.data().email };
      }
      return null;
    });

    userDetails.value = (await Promise.all(userPromises)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching user emails:', error);
    toast.error('Failed to fetch user emails.');
  }
};



// Watch for changes in selectedUserId and load the corresponding assessment
watch(selectedUserId, async (newEmail) => {
  const user = userDetails.value.find(user => user.email === newEmail);
  if (user) {
    await loadAssessmentData(user.id);
  }
});

// Update loadAssessmentData to accept userId as a parameter
const loadAssessmentData = async (userId) => {
  try {
    isLoading.value = true;

    // Get the test ID from route or use a default
    const testId = route.params.testId || 'default-test-id';

    // Get the assessment document from Firestore
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('@/firebase');

    const docId = `${userId}_${testId}`;
    const docRef = doc(db, 'assessments', docId);
    const docSnap = await getDoc(docRef);

    const assessmentLookup = {};

    if (docSnap.exists()) {
      const assessment = docSnap.data();

      if (assessment?.assessmentData) {
        assessment.assessmentData.forEach((item) => {
          assessmentLookup[item.ruleId] = {
            status: item.status || 'Not Set',
            severity: item.severity || 'Not Set',
            notes: item.notes || [],
          };
        });
      }
    } else {
      toast.info('No assessment data found for the selected user.');
    }

    // Merge with all rules
    const mergedData = {};
    if (allRules.value && allRules.value.length > 0) {
      allRules.value.forEach((rule) => {
        const assessment = assessmentLookup[rule.id] || {
          status: 'Not Set',
          severity: 'Not Set',
          notes: [],
        };

        mergedData[rule.id] = {
          ...rule,
          ...assessment,
        };
      });
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
  background-color: #e3f2fd;
  /* Perceivable - Light Blue */
  color: #0d47a1;
}

.principle-tab.principle-1 {
  background-color: #e8f5e9;
  /* Operable - Light Green */
  color: #1b5e20;
}

.principle-tab.principle-2 {
  background-color: #fff8e1;
  /* Understandable - Light Amber */
  color: #e65100;
}

.principle-tab.principle-3 {
  background-color: #fce4ec;
  /* Robust - Light Pink */
  color: #880e4f;
}

.principle-tab.v-tab--selected {
  font-weight: 600;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.principle-0.v-tab--selected {
  background-color: #bbdefb !important;
  /* Perceivable - Blue */
}

.principle-1.v-tab--selected {
  background-color: #c8e6c9 !important;
  /* Operable - Green */
}

.principle-2.v-tab--selected {
  background-color: #fff176 !important;
  /* Understandable - Amber */
}

.principle-3.v-tab--selected {
  background-color: #f8bbd0 !important;
  /* Robust - Pink */
}

/* Level filter styling */
.level-a {
  background-color: #e8f5e9 !important;
  color: #2e7d32 !important;
}

.level-aa {
  background-color: #fff8e1 !important;
  color: #f57c00 !important;
}

.level-aaa {
  background-color: #ffebee !important;
  color: #c62828 !important;
}

.v-btn-toggle .v-btn {
  border-radius: 4px !important;
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