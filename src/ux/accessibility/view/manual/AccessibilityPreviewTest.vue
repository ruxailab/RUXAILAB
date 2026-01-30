<template>
  <PageWrapper
    title="Accessibility Test Preview"
    :loading="isLoading"
    loading-text="Loading WCAG Data..."
    :side-gap="false"
  >
    <v-alert
      v-if="error"
      type="error"
      class="ma-2"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <!-- User viewing mode indicator -->
    <v-alert
      v-if="viewingUserType === 'other-user'"
      type="info"
      variant="tonal"
      class="ma-2 mb-4"
      prepend-icon="mdi-eye"
    >
      <v-alert-title>Viewing Mode</v-alert-title>
      You are viewing assessment data for user ID:
      <strong>{{ viewingUserId }}</strong
      >. This is read-only mode - you cannot save changes to another user's
      assessment.
    </v-alert>

    <!-- Debug Panel (only show if there are issues) -->
    <v-alert
      v-if="principles.length === 0 && !isLoading"
      type="warning"
      class="ma-2"
      variant="outlined"
    >
      <div class="text-subtitle-2 font-weight-bold mb-2">Information</div>
      <div class="text-caption">
        <div><strong>Viewing User ID:</strong> {{ viewingUserId }}</div>
        <div><strong>Viewing Mode:</strong> {{ viewingUserType }}</div>
        <div><strong>User Role:</strong> {{ currentUserRole }}</div>
        <div><strong>Can Save:</strong> {{ canSaveAssessments }}</div>
        <div><strong>Compliance Level:</strong> {{ complianceLevel }}</div>
        <div>
          <strong>Principles Available:</strong> {{ principles.length }}
        </div>
        <div>
          <strong>Selected Guidelines:</strong>
          {{ configuration.selectedGuidelines?.length || 0 }}
        </div>
        <div>
          <strong>Raw WCAG Data Available:</strong>
          {{ store.state.Assessment?.wcagData?.principles?.length || 0 }}
        </div>
        <div>
          <strong>Filtered WCAG Data Available:</strong>
          {{
            store.state.Assessment?.filteredWcagData?.principles?.length || 0
          }}
        </div>
        <div>
          <strong>Configuration:</strong>
          {{ JSON.stringify(configuration, null, 2) }}
        </div>
      </div>
    </v-alert>
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Evaluate the accessibility of your project based on selected WCAG
        guidelines
      </p>
    </template>
    <!-- Full width container without padding -->
    <v-container fluid class="pa-0 ma-0 fill-height">
      <v-row no-gutters class="fill-height">
        <!-- Left Sidebar Navigation - Reduced width -->
        <div class="v-col v-col-2 sidebar fill-height">
          <div class="h-100" style="background-color: #f5f5f5">
            <div class="text-subtitle-1 pa-3 font-weight-bold">
              WCAG Principles
            </div>

            <div v-if="principles.length > 0" class="pa-0">
              <div
                v-for="(principle, pIdx) in principles"
                :key="principle.id || pIdx"
              >
                <div
                  :class="{ 'active-principle': selectedPrincipleIdx === pIdx }"
                  class="d-flex align-center justify-space-between pa-2 text-body-2 principle-item"
                  @click="selectPrinciple(pIdx)"
                >
                  <div class="d-flex align-center">
                    <i class="mdi mdi-circle-medium mr-1" />
                    <span>{{ principle?.title || 'Untitled Principle' }}</span>
                  </div>
                  <i class="mdi mdi-chevron-down chevron-icon" />
                </div>

                <div
                  class="guidelines-container"
                  :class="{ 'is-open': selectedPrincipleIdx === pIdx }"
                >
                  <div
                    v-for="(guideline, gIdx) in principle?.Guidelines || []"
                    :key="guideline?.id || gIdx"
                    :class="{
                      'active-guideline':
                        selectedGuidelineIdx === gIdx &&
                        selectedPrincipleIdx === pIdx,
                    }"
                    class="d-flex align-center ml-3 pa-2 text-caption guideline-item"
                    @click="selectGuideline(gIdx, pIdx)"
                  >
                    <i class="mdi mdi-circle-outline mr-3" />
                    <span>{{
                      (guideline?.id || '') + ' ' + (guideline?.title || '')
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="pa-4">
              <div class="text-grey text-body-2">
                {{ isLoading ? 'Loading...' : 'No principles available' }}
              </div>
            </div>
          </div>
        </div>
        <!-- Main Content Area - Optimized for laptop -->
        <v-col cols="7" class="main-content fill-height">
          <v-card
            v-if="currentRule.title"
            flat
            class="h-100 pa-4 scrollable-content"
          >
            <!-- Compact Breadcrumb -->
            <v-breadcrumbs
              :items="breadcrumbs"
              class="pa-0 mb-3"
              density="compact"
            >
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
                <v-chip
                  color="primary"
                  variant="flat"
                  size="x-small"
                  prepend-icon="mdi-numeric"
                  class="text-caption"
                >
                  Level {{ currentRule?.level || 'N/A' }}
                </v-chip>
                <v-chip
                  color="secondary"
                  variant="flat"
                  size="x-small"
                  prepend-icon="mdi-tag"
                  class="text-caption"
                >
                  v{{ currentRule?.version || 'N/A' }}
                </v-chip>
                <v-chip
                  v-if="currentRule?.conformanceLevel"
                  color="success"
                  variant="flat"
                  size="x-small"
                  prepend-icon="mdi-check-circle"
                  class="text-caption"
                >
                  {{ currentRule.conformanceLevel }}
                </v-chip>
              </div>
            </div>

            <!-- Compact Guideline Box -->
            <v-alert variant="tonal" color="info" class="mb-4 pa-3">
              <div class="d-flex align-start">
                <v-icon class="mr-2 mt-1" size="small">
                  mdi-information-outline
                </v-icon>
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
                  <ul v-else class="criteria-list pl-3 mb-0">
                    <li
                      v-for="(crit, cIdx) in currentRule.criteria"
                      :key="cIdx"
                      class="mb-1"
                    >
                      <pre
                        class="criterion-pre mb-0 text-body-2"
                        style="
                          white-space: pre-wrap;
                          font-family: inherit;
                          line-height: 1.4;
                        "
                        >{{ crit }}</pre
                      >
                    </li>
                  </ul>
                </v-card-text>
              </v-card>
            </div>

            <!-- Compact Appraiser Notes Section -->
            <div class="my-4">
              <h2 class="text-h6 font-weight-bold mb-2">Appraiser Notes</h2>
              <v-tabs
                v-model="activeNoteTab"
                class="mb-2"
                density="compact"
                show-arrows
              >
                <v-tab
                  v-for="(note, idx) in notes"
                  :key="'note-tab-' + idx"
                  :value="idx"
                  class="text-caption"
                >
                  Note {{ idx + 1 }}
                  <v-btn
                    v-if="notes.length > 1"
                    icon="mdi-close"
                    size="x-small"
                    variant="plain"
                    class="ml-1"
                    @click.stop="removeNote(idx)"
                  />
                </v-tab>
                <v-tab
                  key="add-note"
                  class="add-note-tab"
                  @click.stop="addNote"
                >
                  <v-icon size="small"> mdi-plus </v-icon>
                </v-tab>
              </v-tabs>
              <v-window v-model="activeNoteTab">
                <v-window-item
                  v-for="(note, idx) in notes"
                  :key="'note-window-' + idx"
                  :value="idx"
                >
                  <v-textarea
                    v-model="note.text"
                    variant="outlined"
                    rows="3"
                    placeholder="Enter your notes here..."
                    hide-details
                    class="mb-2"
                    density="compact"
                  />
                  <div class="d-flex align-center mb-2">
                    <v-file-input
                      v-model="note.image"
                      accept="image/*"
                      label="Attach image"
                      prepend-icon="mdi-image"
                      show-size
                      hide-details
                      class="mr-3"
                      style="max-width: 250px"
                      density="compact"
                      @change="onImageChange(idx)"
                    />
                    <div
                      v-if="note.imagePreview"
                      class="note-image-preview d-flex align-center"
                    >
                      <img
                        :src="note.imagePreview"
                        alt="Notes attachment"
                        style="
                          max-width: 80px;
                          max-height: 60px;
                          border-radius: 4px;
                        "
                      />
                      <v-btn
                        icon="mdi-close"
                        size="x-small"
                        variant="plain"
                        class="ml-1"
                        @click="removeImage(idx)"
                      />
                    </div>
                  </div>
                </v-window-item>
              </v-window>
            </div>

            <!-- Compact Assessment Section -->
            <v-row class="mb-4">
              <v-col cols="6">
                <h2 class="text-h6 font-weight-bold mb-2">Severity</h2>
                <v-radio-group
                  v-model="severity"
                  density="compact"
                  class="mt-0"
                >
                  <v-radio
                    label="High"
                    value="high"
                    color="error"
                    density="compact"
                  />
                  <v-radio
                    label="Medium"
                    value="medium"
                    color="warning"
                    density="compact"
                  />
                  <v-radio
                    label="Low"
                    value="low"
                    color="success"
                    density="compact"
                  />
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <h2 class="text-h6 font-weight-bold mb-2">Status</h2>
                <v-radio-group v-model="status" density="compact" class="mt-0">
                  <v-radio
                    label="Pass"
                    value="pass"
                    color="success"
                    density="compact"
                  />
                  <v-radio
                    label="Fail"
                    value="fail"
                    color="error"
                    density="compact"
                  />
                  <v-radio
                    label="N/A"
                    value="na"
                    color="grey"
                    density="compact"
                  />
                </v-radio-group>
              </v-col>
            </v-row>

            <!-- Compact Save Button -->
            <div class="mb-4">
              <v-btn
                prepend-icon="mdi-content-save"
                size="default"
                color="success"
                :loading="isLoading"
                :disabled="!currentRule?.id || !canSaveAssessments"
                variant="flat"
                @click="saveAssessment"
              >
                {{ canSaveAssessments ? 'Save Assessment' : 'Sign In to Save' }}
              </v-btn>
            </div>

            <!-- Compact Navigation -->
            <v-card
              flat
              class="pa-3"
              color="grey-lighten-4"
              style="border-radius: 8px"
            >
              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="text"
                  prepend-icon="mdi-chevron-left"
                  color="grey-darken-2"
                  size="small"
                  @click="prevRule"
                >
                  Previous
                </v-btn>
                <div class="text-body-2 text-grey-darken-1">
                  {{ selectedRuleIdx + 1 }} / {{ rules?.length || 0 }}
                </div>
                <v-btn
                  variant="flat"
                  append-icon="mdi-chevron-right"
                  color="amber"
                  class="text-black"
                  size="small"
                  @click="nextRule"
                >
                  Next
                </v-btn>
              </div>
            </v-card>
          </v-card>
          <v-card v-else flat class="h-100">
            <div
              class="d-flex flex-column align-center justify-center h-100 text-center fill-height pa-4"
            >
              <v-icon
                icon="mdi-information-outline"
                color="blue-lighten-2"
                size="48"
                class="mb-4"
              />

              <h2 class="text-h6 font-weight-regular text-grey-darken-2 mb-1">
                Ready to Evaluate
              </h2>

              <p class="text-body-2 text-medium-emphasis">
                Select a principle from the list to view its guidelines and
                rules.
              </p>
            </div>
          </v-card>
        </v-col>

        <!-- Right Sidebar - Compact Table of Contents -->
        <v-col cols="3" class="toc-sidebar fill-height">
          <v-card flat class="h-100" color="grey-lighten-5">
            <v-card-title class="text-subtitle-1 pa-3 font-weight-bold">
              Rules
            </v-card-title>
            <v-list density="compact" class="pa-1">
              <template v-if="guidelines.length > 0">
                <template v-for="(rule, rIdx) in rules" :key="rule.id || rIdx">
                  <v-list-item
                    prepend-icon="mdi-circle-outline"
                    :title="(rule?.id || '') + ' ' + (rule?.title || '')"
                    :active="selectedRuleIdx === rIdx"
                    class="text-caption pa-2"
                    :class="{ 'v-list-item--active': selectedRuleIdx === rIdx }"
                    @click="
                      selectRule(
                        rIdx,
                        selectedGuidelineIdx,
                        selectedPrincipleIdx,
                      )
                    "
                  />
                </template>
              </template>
              <v-list-item v-else>
                <v-list-item-title class="text-grey text-caption">
                  No rules available
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Compact Floating Action Button -->
    <v-tooltip location="left">
      <template #activator="{ props }">
        <v-btn
          data-testid="create-test-btn"
          size="default"
          icon
          position="fixed"
          location="bottom right"
          color="#F9A826"
          variant="elevated"
          class="mr-3 mb-4 floating-save-btn"
          rounded="circle"
          v-bind="props"
          elevation="4"
          @click="viewAssessmentDocument"
        >
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
          <v-data-table
            :headers="[
              { title: 'Rule ID', key: 'ruleId', width: '100px' },
              { title: 'Title', key: 'ruleTitle', width: '200px' },
              { title: 'Principle', key: 'principle', width: '120px' },
              { title: 'Guideline', key: 'guideline', width: '120px' },
              { title: 'Level', key: 'level', width: '80px' },
              { title: 'Status', key: 'status', width: '80px' },
              { title: 'Severity', key: 'severity', width: '80px' },
            ]"
            :items="Object.values(assessmentData)"
            :items-per-page="15"
            class="elevation-1"
            height="60vh"
            density="compact"
          >
            <template #item.notes="{ item }">
              <v-tooltip location="bottom" max-width="400">
                <template #activator="{ props }">
                  <v-btn icon size="small" v-bind="props">
                    <v-icon size="small"> mdi-note-text </v-icon>
                  </v-btn>
                </template>
                <div>
                  <div
                    v-for="(note, index) in item.notes"
                    :key="index"
                    class="mb-2"
                  >
                    <strong>Note {{ index + 1 }}:</strong>
                    <div>{{ note.text }}</div>
                    <div v-if="note.imageName" class="mt-1">
                      <v-chip size="small" color="grey-lighten-2">
                        <v-icon start size="small"> mdi-image </v-icon>
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
          <v-spacer />
          <v-btn color="primary" @click="showAssessmentDialog = false">
            Close
          </v-btn>
          <v-btn color="primary" variant="text" @click="downloadAssessmentData">
            <v-icon start> mdi-download </v-icon>
            Export JSON
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { showSuccess, showError } from '@/shared/utils/toast'

const store = useStore()
const route = useRoute()
const error = ref('')
const selectedCriteria = ref([])
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)
// Computed properties from store
const isLoading = computed(() => store.getters.loading || false)

// Check if user has admin privileges
const isAdmin = computed(() => {
  const currentUser = user.value || store.state.Auth.user
  const currentTest = test.value

  if (!currentUser || !currentTest) return false

  // Check if user is test owner
  if (currentTest.userId === currentUser.id) return true

  // Check if user is test admin
  if (currentTest.testAdmin?.userDocId === currentUser.id) return true

  // Check if user has admin role in collaborators
  const collaborators = currentTest.collaborators || {}
  const userCollaborator = collaborators[currentUser.id]
  if (
    userCollaborator === 'admin' ||
    (userCollaborator && userCollaborator.role === 'admin')
  ) {
    return true
  }

  // Check if user has admin role in cooperators
  const cooperators = currentTest.cooperators || []
  const userCooperator = cooperators.find(
    (coop) =>
      coop.userDocId === currentUser.id || coop.email === currentUser.email,
  )
  if (
    userCooperator &&
    (userCooperator.role === 'admin' || userCooperator.accessLevel >= 999)
  ) {
    return true
  }

  return false
})

// Check if user is owner specifically
const isOwner = computed(() => {
  const currentUser = user.value || store.state.Auth.user
  const currentTest = test.value

  if (!currentUser || !currentTest) return false

  return (
    currentTest.userId === currentUser.id ||
    currentTest.testAdmin?.userDocId === currentUser.id
  )
})

// Get current user role for debugging
const currentUserRole = computed(() => {
  const currentUser = user.value || store.state.Auth.user
  const currentTest = test.value

  if (!currentUser || !currentTest) return 'anonymous'

  if (isOwner.value) return 'admin'
  if (isAdmin.value) return 'admin'

  // Check cooperators
  const cooperators = currentTest.cooperators || []
  const userCooperator = cooperators.find(
    (coop) =>
      coop.userDocId === currentUser.id || coop.email === currentUser.email,
  )
  if (userCooperator) return `cooperator (${userCooperator.role || 'default'})`

  // Check legacy collaborators
  const collaborators = currentTest.collaborators || {}
  if (collaborators[currentUser.id])
    return `collaborator (${collaborators[currentUser.id]})`

  return 'no-access'
})

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

// Add a computed property to track which user's data we're viewing
const viewingUserId = computed(() => {
  return (
    route.params.userId ||
    route.query.userId ||
    user.value?.id ||
    'current-user'
  )
})

const viewingUserType = computed(() => {
  const targetUserId = route.params.userId || route.query.userId
  if (targetUserId) {
    return targetUserId === user.value?.id ? 'current-user' : 'other-user'
  }
  return 'current-user'
})

// Add a computed property to fetch configuration data from Vuex
const configuration = computed(
  () => store.getters['Assessment/getConfiguration'],
)

// Example usage: Replace or augment logic to use configuration data
// For instance, if you need to use complianceLevel from the configuration:
const complianceLevel = computed(
  () => configuration.value.complianceLevel || 'AA',
)

// Check if user can save assessments
const canSaveAssessments = computed(() => {
  const currentUser = user.value || store.state.Auth.user
  const currentTest = test.value

  // Must have a user logged in
  if (!currentUser || !currentUser.id) return false

  // Must have test data
  if (!currentTest) return false

  // Cannot save when viewing another user's data
  const targetUserId = route.params.userId || route.query.userId
  if (targetUserId && targetUserId !== currentUser.id) return false

  // Check if user is owner/admin
  if (isOwner.value || isAdmin.value) return true

  // Check if user is in cooperators list (any cooperator can save assessments)
  const cooperators = currentTest.cooperators || []
  const userCooperator = cooperators.find(
    (coop) =>
      coop.userDocId === currentUser.id || coop.email === currentUser.email,
  )
  if (userCooperator) return true

  // Check legacy collaborators
  const collaborators = currentTest.collaborators || {}
  if (collaborators[currentUser.id]) return true

  return false
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

// Helper functions for initialization
const getTestId = () => {
  const testId = route.params.testId || route.params.id
  if (!testId) {
    throw new Error('Test ID is missing')
  }
  return testId
}

const getTargetUserId = () => {
  return route.params.userId || route.query.userId
}

const loadTestData = async (testId) => {
  await store.dispatch('getStudy', { id: testId })
  await new Promise((resolve) => setTimeout(resolve, 100))
  const testData = store.getters.test
  if (!testData) {
    throw new Error('Failed to load test data')
  }
  return testData
}

const initializeAssessment = async () => {
  await store.dispatch('Assessment/initializeAssessment')
}

const handleAuthentication = async () => {
  let authUser = null
  try {
    authUser = store.state.Auth.user
    if (!authUser) {
      await store.dispatch('autoSignIn')
      authUser = store.state.Auth.user
    }
  } catch {
    // Authentication not available, proceeding without user context
  }
  return authUser
}

const determineUserIdToLoad = (targetUserId, authUser) => {
  if (targetUserId) {
    return targetUserId
  } else if (authUser && authUser.id) {
    return authUser.id
  }
  return null
}

const loadAssessmentData = async (userIdToLoad, testId) => {
  if (!userIdToLoad) {
    return
  }
  try {
    const loadedAssessment = await store.dispatch('Assessment/loadAssessment', {
      userId: userIdToLoad,
      testId,
    })
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
  } catch {
    // Could not load user assessment data
  }
}

const setupConfiguration = async (testData, testId) => {
  const configData = testData.configData || {
    complianceLevel: 'AA',
    includeNonInterference: true,
    showExperimentalRules: false,
    enableAutomaticSave: true,
    selectedGuidelines: [],
    selectedRulesByGuideline: {},
  }
  await store.dispatch('Assessment/updateConfiguration', { configData, testId })
}

// Initialize the assessment when component mounts
onMounted(async () => {
  try {
    isLoading.value = true
    error.value = ''
    const testId = getTestId()
    const targetUserId = getTargetUserId()
    const testData = await loadTestData(testId)
    await initializeAssessment()
    const authUser = await handleAuthentication()
    const userIdToLoad = determineUserIdToLoad(targetUserId, authUser)
    await loadAssessmentData(userIdToLoad, testId)
    await setupConfiguration(testData, testId)
  } catch {
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

// Watch for changes in filtered WCAG data to debug
watch(
  () => store.state.Assessment?.filteredWcagData?.principles,
  () => {
    // Filtered WCAG data updated
  },
  { immediate: true, deep: true },
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
  const currentSelectedIdx = store.state.Assessment.selectedPrincipleIdx // <-- Replace with your state property

  // If the clicked principle is already selected, deselect everything to "close" it.
  if (pIdx === currentSelectedIdx) {
    store.dispatch('Assessment/selectPrinciple', null)
    store.dispatch('Assessment/selectGuideline', null)
    store.dispatch('Assessment/selectRule', null)
    return
  }

  // Otherwise, run your original logic to select the new principle and its first items.
  if (pIdx >= 0 && pIdx < principles.value.length) {
    store.dispatch('Assessment/selectPrinciple', pIdx)

    const newGuidelines = principles.value[pIdx]?.Guidelines || []
    if (newGuidelines.length > 0) {
      store.dispatch('Assessment/selectGuideline', 0)
      const newRules = newGuidelines[0]?.rules || []
      if (newRules.length > 0) {
        store.dispatch('Assessment/selectRule', 0)
      } else {
        store.dispatch('Assessment/selectRule', null)
      }
    } else {
      store.dispatch('Assessment/selectGuideline', null)
      store.dispatch('Assessment/selectRule', null)
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

const nextRule = () => {
  // Try next rule in current guideline
  if (selectedRuleIdx.value + 1 < rules.value.length) {
    store.dispatch('Assessment/selectRule', selectedRuleIdx.value + 1)
  }
  // Try next guideline in current principle
  else if (selectedGuidelineIdx.value + 1 < guidelines.value.length) {
    store.dispatch('Assessment/selectGuideline', selectedGuidelineIdx.value + 1)
    if (guidelines.value[selectedGuidelineIdx.value + 1]?.rules?.length > 0) {
      store.dispatch('Assessment/selectRule', 0)
    }
  }
  // Try next principle
  else if (selectedPrincipleIdx.value + 1 < principles.value.length) {
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

    const exportFileDefaultName = `assessment-data-${
      new Date().toISOString().split('T')[0]
    }.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    showSuccess('Assessment data exported successfully')
  } catch {
    showError('Failed to export assessment data')
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

    // Show the dialog
    showAssessmentDialog.value = true
  } catch {
    showError('Failed to load assessment data')
  }
}

// Save assessment
const saveAssessment = async () => {
  try {
    // Check if user is authenticated
    const currentUser = user.value || store.state.Auth.user
    if (!currentUser || !currentUser.id) {
      showError('You must be signed in to save assessments')
      return
    }

    // Check if we're viewing another user's data (read-only mode)
    const targetUserId = route.params.userId || route.query.userId
    if (targetUserId && targetUserId !== currentUser.id) {
      showError(
        "Cannot save changes when viewing another user's assessment data",
      )
      return
    }

    const ruleId = currentRule.value?.id
    if (!ruleId) {
      throw new Error('No rule selected')
    }

    // Get the current test ID from route
    const testId = route.params.testId || route.params.id
    if (!testId) {
      throw new Error('Test ID is missing')
    }

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

    // Save to Firestore via Vuex
    await store.dispatch('Assessment/updateRuleAssessment', {
      userId: currentUser.id,
      testId,
      ruleId,
      assessment: {
        ...assessmentData,
        // Include any additional metadata you need
      },
    })

    // Also update the local store
    await store.dispatch('Assessment/saveAssessment', {
      userId: currentUser.id,
      testId,
      testType: 'manual', // or get this from props/route
    })

    showSuccess('Assessment saved successfully')
  } catch (err) {
    error.value = err.message || 'Failed to save assessment. Please try again.'
    showError(error.value)
  }
}
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

/* -- NEW STYLES for Dropdown Effect ✨ -- */

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
  /* Adjust if content is taller */
}

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
