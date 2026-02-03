<template>
  <PageWrapper
    :title="
      currentPage === 'userSelection'
        ? 'Select User'
        : 'Accessibility Assessment Results'
    "
    :loading="isLoading"
    :loading-text="
      currentPage === 'userSelection'
        ? 'Loading users...'
        : 'Loading assessment data...'
    "
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{
          currentPage === 'userSelection'
            ? 'Select a user to view their accessibility assessment results'
            : 'Review the detailed accessibility assessment results for the selected user'
        }}
      </p>
    </template>
    <!-- Page 1: User Selection -->
    <v-row v-if="currentPage === 'userSelection'">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 pa-6">
            <v-icon start class="mr-3" color="primary">
              mdi-account-multiple
            </v-icon>
            Select a User to View Assessment Results
          </v-card-title>
          <v-card-text class="pa-6">
            <!-- Debug Information -->
            <v-alert
              v-if="!isLoadingUsers && userDetails.length === 0"
              type="info"
              variant="outlined"
              class="mb-4"
            >
              <div class="text-subtitle-2 mb-2">Information</div>
              <div>
                <strong>Found User IDs:</strong>
                {{ userIds.join(', ') || 'None' }}
              </div>
              <div>
                <strong>User Details:</strong> {{ userDetails.length }} users
                loaded
              </div>
            </v-alert>
            <!-- Loading overlay while fetching users -->
            <div v-if="isLoadingUsers" class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="48"
                class="mb-4"
              />
              <div class="text-h6 mb-2">Loading Users</div>
              <div class="text-body-2 text-grey">
                Fetching assessment participants...
              </div>
            </div>

            <!-- User table (only show when not loading) -->
            <v-card v-if="!isLoadingUsers" elevation="2">
              <v-data-table
                :headers="userHeaders"
                :items="userDetails"
                :items-per-page="10"
                :loading="isLoadingUsers"
                loading-text="Fetching users..."
                class="user-table elevation-0"
                height="50vh"
                density="compact"
                @click:row="(event, { item }) => selectUser(item)"
              >
                <!-- Email/User Info Column -->
                <template #item.email="{ item }">
                  <div
                    class="d-flex align-center py-2 cursor-pointer"
                    @click="selectUser(item)"
                  >
                    <v-avatar size="40" color="primary" class="me-3">
                      <v-icon size="20" color="white"> mdi-account </v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium text-body-1 mb-0">
                        {{ getDisplayName(item.email) }}
                      </div>
                      <div class="text-body-2 text-grey">
                        {{ item.email }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Status Column -->
                <template #item.status>
                  <v-chip color="success" size="small" variant="tonal">
                    <v-icon start size="16"> mdi-check-circle </v-icon>
                    Assessment Available
                  </v-chip>
                </template>

                <!-- Actions Column -->
                <template #item.actions="{ item }">
                  <div class="d-flex ga-2">
                    <v-btn
                      color="primary"
                      variant="flat"
                      size="small"
                      prepend-icon="mdi-eye"
                      @click="selectUser(item)"
                    >
                      View Results
                    </v-btn>
                    <v-btn
                      color="secondary"
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-test-tube"
                      @click="viewUserInPreview(item)"
                    >
                      View in Preview
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card>

            <v-alert
              v-if="userDetails.length === 0 && !isLoadingUsers"
              type="info"
              class="mt-4"
            >
              No users found for this assessment test.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Page 2: Assessment Results -->
    <v-row v-if="currentPage === 'assessmentResults'">
      <v-col cols="12">
        <!-- Back button and selected user info -->
        <v-card class="mb-4">
          <v-card-text class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                class="mr-4"
                @click="goBackToUserSelection"
              >
                Back to User Selection
              </v-btn>
              <div>
                <div class="text-h6">
                  {{ getDisplayName(selectedUser?.email) }}
                </div>
                <div class="text-body-2 text-grey">
                  {{ selectedUser?.email }}
                </div>
              </div>
            </div>
            <div class="d-flex ga-2 align-center">
              <v-btn
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-test-tube"
                @click="viewUserInPreview(selectedUser)"
              >
                View in Preview Mode
              </v-btn>
              <v-avatar color="primary" size="40">
                <v-icon color="white"> mdi-account </v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <span>Accessibility Assessment Results</span>
          </v-card-title>

          <!-- Level Filter -->
          <v-card-subtitle class="pb-2">
            <v-row align="center" class="ma-0">
              <v-col cols="auto" class="pa-0">
                <span class="text-subtitle-2 font-weight-medium"
                  >WCAG Level Filter:</span
                >
              </v-col>
              <v-col cols="auto" class="pa-0 ml-3">
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
              <v-col cols="auto" class="pa-0 ml-3">
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
          <v-tabs v-model="activeTab" grow show-arrows class="principle-tabs">
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
                      <v-icon size="small"> mdi-note-text-outline </v-icon>
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

    <!-- Notes Dialog -->
    <v-dialog v-model="notesDialog.show" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span
            >Notes for {{ notesDialog.ruleId }} -
            {{ notesDialog.ruleTitle }}</span
          >
          <v-btn icon @click="notesDialog.show = false">
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
                <v-icon size="small" class="mr-1"> mdi-image </v-icon>
                {{ note.imageName }}
              </v-chip>
            </v-list-item>
            <v-list-item
              v-if="!notesDialog.notes || notesDialog.notes.length === 0"
            >
              <v-list-item-title class="text-grey">
                No notes available for this rule.
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="notesDialog.show = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageWrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { showSuccess, showError, showInfo } from '@/shared/utils/toast'

// Icons for principles
const principleIcons = ['mdi-eye', 'mdi-hand-wave', 'mdi-brain', 'mdi-dumbbell']

const store = useStore()
const route = useRoute()

// State
const isLoading = ref(true)
const isLoadingUsers = ref(true) // Separate loading state for user fetching
const activeTab = ref(0)
const assessmentData = ref({})
const wcagData = ref(null)
const principles = ref([])
const allRules = ref([])
const assessmentRules = ref({})
const selectedLevel = ref('AA') // Default to AA level

// Two-page navigation state
const currentPage = ref('userSelection') // 'userSelection' or 'assessmentResults'
const selectedUser = ref(null)

// Notes dialog state
const notesDialog = ref({
  show: false,
  ruleId: '',
  ruleTitle: '',
  notes: [],
})

// User selection state
const selectedUserId = ref(null)
const userIds = ref([])
const userDetails = ref([])

//life cycle
onMounted(async () => {
  try {
    // Load WCAG data first (this affects general loading state)
    await loadWcagData()

    // Then fetch users (this affects user loading state)
    isLoadingUsers.value = true

    if (!route.params.id) {
      showError(
        'Test ID is missing from route parameters. Please check the URL.',
      )
      isLoadingUsers.value = false
      return
    }

    await fetchUserIdsForTest()
    await fetchUserEmails()
  } catch (error) {
    showError('Failed to load data: ' + error.message)
  } finally {
    isLoadingUsers.value = false
  }
})

// Helper function to get display name from email
const getDisplayName = (email) => {
  if (!email) return 'Unknown User'
  return (
    email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
  )
}

// Navigate to user selection page
const goBackToUserSelection = () => {
  currentPage.value = 'userSelection'
  selectedUser.value = null
  selectedUserId.value = null
}

// Select user and navigate to assessment results
const selectUser = async (user) => {
  try {
    if (!user || !user.id) {
      showError('Invalid user selection')
      return
    }

    selectedUser.value = user
    selectedUserId.value = user.email
    currentPage.value = 'assessmentResults'

    // Load assessment data for the selected user
    await loadAssessmentData(user.id)
  } catch (error) {
    showError('Failed to load user assessment data: ' + error.message)
  }
}

// Navigate to preview mode for specific user
const viewUserInPreview = (user) => {
  try {
    if (!user || !user.id) {
      showError('Invalid user selection')
      return
    }

    const testId = route.params.id
    if (!testId) {
      showError('Test ID not found')
      return
    }

    // Navigate to preview page with user ID parameter
    const previewUrl = `/accessibility/manual/preview/${testId}/${user.id}`
    window.open(previewUrl, '_blank')
    showSuccess(`Opening preview for ${getDisplayName(user.email)}`)
  } catch {
    showError('Failed to open preview mode')
  }
}

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

// Headers for user selection table
const userHeaders = [
  { title: 'User', key: 'email', sortable: true, width: '50%' },
  {
    title: 'Status',
    key: 'status',
    sortable: false,
    align: 'center',
    width: '25%',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center',
    width: '25%',
  },
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
    (rule) =>
      rule.principleId === principle.id || rule.principle === principle.title,
  )

  return principleRules.filter((rule) => shouldIncludeRule(rule.level)).length
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

// Get rules for the current principle (with level filtering)
const getRulesForPrinciple = (principleIndex) => {
  try {
    const principle = principles.value?.[principleIndex]
    if (!principle) {
      return []
    }

    const principleRules = allRules.value.filter(
      (rule) =>
        rule.principleId === principle.id || rule.principle === principle.title,
    )

    // Apply level filtering
    const filteredRules = principleRules.filter((rule) =>
      shouldIncludeRule(rule.level),
    )

    return filteredRules.map((rule) => {
      const assessment = assessmentRules.value[rule.id] || {
        status: 'Not Set',
        severity: 'Not Set',
        notes: [],
      }

      let normalizedNotes = []
      if (Array.isArray(assessment.notes)) {
        normalizedNotes = assessment.notes
      } else if (assessment.notes) {
        normalizedNotes = [assessment.notes]
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
      }
    })
  } catch {
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
      showError('Failed to load WCAG principles')
    }
  } catch (error) {
    showError(`Failed to load WCAG data: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// Fetch all user IDs for the given testId
const fetchUserIdsForTest = async () => {
  try {
    const { query, where, getDocs, collection } = await import(
      'firebase/firestore'
    )
    const { db } = await import('@/app/plugins/firebase')

    const testId = route.params.id

    if (!testId) {
      throw new Error('Test ID is required')
    }

    const q = query(
      collection(db, 'assessments'),
      where('testId', '==', testId),
    )

    const querySnapshot = await getDocs(q)
    const foundUserIds = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return data.userId
    })

    userIds.value = foundUserIds

    if (userIds.value.length === 0) {
      showInfo(
        'No assessment data found for this test. Users need to complete assessments first.',
      )
    }
  } catch (error) {
    showError('Failed to fetch user IDs: ' + error.message)
    isLoadingUsers.value = false // Stop loading on error
  }
}

// Fetch user emails for the given user IDs
const fetchUserEmails = async () => {
  try {
    const { getDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/app/plugins/firebase')

    const userPromises = userIds.value.map(async (userId) => {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const userData = { id: userId, email: userSnap.data().email }
        return userData
      }
      return null
    })

    userDetails.value = (await Promise.all(userPromises)).filter(Boolean)
  } catch {
    showError('Failed to fetch user emails.')
    isLoadingUsers.value = false // Stop loading on error
  }
}

// Update loadAssessmentData to accept userId as a parameter
const loadAssessmentData = async (userId) => {
  try {
    isLoading.value = true

    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get the test ID from route
    const testId = route.params.id

    // Get the assessment document from Firestore
    const { getDoc, doc } = await import('firebase/firestore')
    const { db } = await import('@/app/plugins/firebase')

    const docId = `${userId}_${testId}`

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
      showInfo('No assessment data found for the selected user.')
    }

    // Validate WCAG rules are loaded
    if (!allRules.value || allRules.value.length === 0) {
      showError('WCAG rules not loaded. Please refresh the page.')
      return
    }

    // Merge with all rules
    const mergedData = {}
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

    assessmentRules.value = assessmentLookup
    assessmentData.value = mergedData
  } catch (error) {
    showError(
      `Failed to load assessment data: ${error.message || 'Unknown error'}`,
    )
  } finally {
    isLoading.value = false
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

/* User Selection Table */
.user-table {
  --v-theme-surface: #ffffff;
}

.user-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
  overflow-x: hidden;
}

.user-table :deep(.v-data-table) {
  overflow-x: hidden;
}

.user-table :deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-grey-50));
}

.user-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 2px solid rgb(var(--v-theme-grey-200));
  padding: 8px 16px;
  height: 48px;
}

.user-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 64px;
}

.user-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(2px);
}

.user-table :deep(.v-data-table__td) {
  padding: 8px 16px;
  height: 64px;
  vertical-align: middle;
}

.user-table :deep(.v-data-table-rows-no-data) {
  padding: 20px;
}

.cursor-pointer {
  cursor: pointer;
}

/* Ensure no horizontal overflow */
.user-table :deep(.v-table) {
  table-layout: fixed;
  width: 100%;
}

.user-table :deep(.v-table__wrapper) {
  overflow-x: hidden;
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
