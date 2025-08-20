<template>
  <PageWrapper title="Accessibility Test Settings" :loading="loadingPage" loading-text="Loading Test Settings"
    :side-gap="true">
    <!-- Actions Slot for Save Button -->
    <template #actions>
      <v-btn color="primary" variant="flat" size="large" class="text-none font-weight-semibold rounded-l px-6"
        :loading="loading" @click="submit()" :disabled="!localChanges">
        <v-icon start size="18">mdi-check</v-icon>
        Save Changes
      </v-btn>
    </template>

    <!-- Subtitle Slot -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Configure your accessibility test settings and preferences
      </p>
    </template>

    <!-- Main Content -->
    <Snackbar />
    <LeaveAlert @submit="onSubmit" />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDel" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-start ga-4 pa-6 pb-0">
          <div class="dialog-icon bg-red-lighten-5 rounded-lg d-flex align-center justify-center">
            <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
          </div>
          <div>
            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mb-1">Confirm Deletion</h3>
            <p class="text-subtitle-2 text-grey-darken-1">This action cannot be undone</p>
          </div>
        </v-card-title>
        <v-card-text class="py-4 px-6">
          <p class="text-body-2 text-grey-darken-1">
            {{ dialogText }} All associated data, results, and configurations will be lost forever.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 d-flex justify-end ga-3">
          <v-btn variant="outlined" color="grey-darken-2" @click="dialogDel = false" :disabled="loading"
            class="text-none rounded-lg px-6" height="44">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" @click="deleteTest(test)" :loading="loading"
            class="text-none rounded-lg px-6" height="44">
            <v-icon start size="16">mdi-delete</v-icon>
            Delete Forever
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="settings-layout">
      <div class="content-wrapper">
        <div class="left-column">
          <!-- Basic Information Card -->
          <v-card class="info-card" elevation="0" height="100%">
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div class="header-icon bg-grey-lighten-4 rounded-lg d-flex align-center justify-center">
                <v-icon color="primary" size="20">mdi-information-outline</v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">Basic Information</h3>
                <p class="text-caption text-grey-darken-1">Configure the fundamental details of your accessibility test
                </p>
              </div>
            </div>
            <v-card-text class="py-6">
              <AccessibilityTestForm v-if="safeTest" ref="testForm" :test="safeTest" @update:test="updateTest"
                @validate="validate" />
            </v-card-text>
          </v-card>
        </div>

        <div class="right-column">
          <!-- Accessibility Configuration Card -->
          <v-card class="config-card" elevation="0">
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div class="header-icon bg-blue-lighten-5 rounded-lg d-flex align-center justify-center">
                <v-icon color="secondary" size="20">mdi-accessibility</v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">Accessibility Settings</h3>
                <p class="text-caption text-grey-darken-1">Configure WCAG compliance and testing parameters</p>
              </div>
            </div>
            <v-card-text class="py-6">
              <div v-if="safeTest && safeTest.configData" class="d-flex flex-column ga-5">
                <!-- Compliance Level -->
                <div class="pa-5 border rounded-lg bg-grey-lighten-5">
                  <div class="d-flex align-center ga-2 mb-3">
                    <v-icon color="primary" size="18">mdi-certificate</v-icon>
                    <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">Compliance Level</span>
                  </div>
                  <v-select v-model="safeTest.configData.complianceLevel" :items="complianceLevels" density="compact"
                    variant="outlined" hide-details @update:model-value="updateComplianceLevel" />
                </div>

                <!-- Public Access -->
                <div class="pa-5 border rounded-lg bg-grey-lighten-5 position-relative">
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-icon color="primary" size="18">mdi-earth</v-icon>
                    <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">Public Access</span>
                  </div>
                  <p class="text-caption text-grey-darken-1 mb-4">Allow other users to view this test</p>
                  <v-switch v-model="safeTest.isPublic" color="primary" hide-details inset class="position-absolute"
                    style="top: 20px; right: 20px;" @update:model-value="updatePublicAccess" />
                </div>

                <!-- Include Non-Interference -->
                <div class="pa-5 border rounded-lg bg-grey-lighten-5 position-relative">
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-icon color="primary" size="18">mdi-shield-check</v-icon>
                    <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">Non-Interference</span>
                  </div>
                  <p class="text-caption text-grey-darken-1 mb-4">Include non-interference requirements</p>
                  <v-switch v-model="safeTest.configData.includeNonInterference" color="primary" hide-details inset
                    class="position-absolute" style="top: 20px; right: 20px;"
                    @update:model-value="updateNonInterference" />
                </div>
              </div>
              <div v-else class="d-flex align-center justify-center py-8">
                <v-progress-circular indeterminate color="primary" size="24" class="mr-3" />
                <span class="text-body-2">Loading accessibility settings...</span>
              </div>
            </v-card-text>
          </v-card>

          <!-- Quick Actions Card -->
          <v-card class="actions-card" elevation="0">
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div class="header-icon bg-amber-lighten-5 rounded-lg d-flex align-center justify-center">
                <v-icon color="amber-darken-2" size="20">mdi-lightning-bolt</v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">Quick Actions</h3>
                <p class="text-caption text-grey-darken-1">Perform common tasks instantly</p>
              </div>
            </div>
            <v-card-text class="py-6">
              <div class="d-flex flex-column ga-3">
                <v-btn color="orange-darken-1" variant="flat" class="text-none font-weight-semibold rounded-l py-3"
                  height="48" :disabled="!safeTest" block @click="duplicateTest()">
                  <v-icon start size="18">mdi-content-duplicate</v-icon>
                  Duplicate Test
                </v-btn>
                <v-btn color="success" variant="flat" class="text-none font-weight-semibold rounded-l py-3" height="48"
                  :disabled="!safeTest" block @click="exportTest()">
                  <v-icon start size="18">mdi-download</v-icon>
                  Export Test
                </v-btn>
                <v-btn color="error" variant="flat" class="text-none font-weight-semibold rounded-l py-3" height="48"
                  :disabled="!safeTest" @click="dialogDel = true" block>
                  <v-icon start size="18">mdi-delete-outline</v-icon>
                  Delete Test
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>

    <AccessNotAllowed v-if="!loadingPage && !safeTest" />
  </PageWrapper>
</template>

<script setup>
import { ref, computed,onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/components/template/PageWrapper.vue'
import AccessibilityTestForm from '@/components/atoms/AccessibilityTestForm.vue'
import Snackbar from '@/components/atoms/Snackbar.vue'
import LeaveAlert from '@/components/atoms/LeaveAlert.vue'
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue'
import ManualAccessibilityTest from '@/models/ManualAccessibilityTest'

const store = useStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

// Reactive references
const loading = ref(false)
const loadingPage = ref(true)
const test = ref(null)
const error = ref(null)
const dialogDel = ref(false)
const testForm = ref(null)
const validForm = ref(false)

// Compliance level options
const complianceLevels = [
  { title: 'Level A', value: 'A' },
  { title: 'Level AA (Recommended)', value: 'AA' },
  { title: 'Level AAA', value: 'AAA' }
]

// Computed properties
const localChanges = computed({
  get: () => store.state.localChanges,
  set: value => store.commit('SET_LOCAL_CHANGES', value),
})

const user = computed(() => store.getters.user)

const dialogText = computed(() => {
  if (test.value) {
    return `Are you sure you want to delete the accessibility test "${test.value.title}"?`
  }
  return "Are you sure you want to delete this test?"
})

const safeTest = computed(() => {
  if (!test.value) return null

  return {
    ...test.value,
    configData: test.value.configData || {
      complianceLevel: 'AA',
      includeNonInterference: true,
      showExperimentalRules: false,
      enableAutomaticSave: true,
      selectedGuidelines: [],
      selectedRulesByGuideline: {}
    }
  }
})

// Methods
const fetchTest = async () => {
  if (!route.params.testId) return

  loading.value = true
  error.value = null

  try {
    const testData = await store.dispatch('manualAccessibility/fetchTest', route.params.testId)
    test.value = new ManualAccessibilityTest(testData)

    // Ensure configData exists with default values if not present
    if (!test.value.configData) {
      test.value.configData = {
        complianceLevel: 'AA',
        includeNonInterference: true,
        showExperimentalRules: false,
        enableAutomaticSave: true,
        selectedGuidelines: [],
        selectedRulesByGuideline: {}
      }
    }
  } catch (err) {
    console.error('Error fetching test:', err)
    error.value = 'Failed to load test information'
    toast.error('Failed to load test information')
  } finally {
    loading.value = false
  }
}

const updateTest = (updatedTest) => {
  if (!test.value) return
  test.value = { ...test.value, ...updatedTest }
  markLocalChanges()
}

const markLocalChanges = () => {
  store.commit('SET_LOCAL_CHANGES', true)
}

const updateComplianceLevel = (value) => {
  if (!test.value || !test.value.configData) return
  test.value.configData.complianceLevel = value
  markLocalChanges()
}

const updatePublicAccess = (value) => {
  if (!test.value) return
  test.value.isPublic = value
  markLocalChanges()
}

const updateNonInterference = (value) => {
  if (!test.value || !test.value.configData) return
  test.value.configData.includeNonInterference = value
  markLocalChanges()
}

const validate = (valid) => {
  validForm.value = valid
}

const onSubmit = async () => {
  await submit()
  store.commit('SET_LOCAL_CHANGES', false)
  router.push({ name: store.state.pathTo })
}

const submit = async () => {
  if (!test.value || !validForm.value) {
    toast.warning('Please fill in all required fields correctly.')
    return
  }

  loading.value = true
  try {
    await store.dispatch('manualAccessibility/updateTest', {
      testId: test.value.id,
      updates: test.value
    })

    // Refresh the test data
    await fetchTest()

    store.commit('SET_LOCAL_CHANGES', false)
    toast.success('Test settings saved successfully!')
  } catch (error) {
    toast.error('Failed to save test settings.')
    console.error('Error saving test:', error)
  } finally {
    loading.value = false
  }
}

const deleteTest = async (testToDelete) => {
  if (!testToDelete) return

  loading.value = true
  try {
    await store.dispatch('manualAccessibility/deleteTest', testToDelete.id)
    toast.success('Test deleted successfully!')
    router.push({ name: 'AccessibilityHome' })
  } catch (error) {
    toast.error('Failed to delete test.')
    console.error('Error deleting test:', error)
  } finally {
    loading.value = false
    dialogDel.value = false
  }
}

const duplicateTest = async () => {
  if (!test.value) return

  loading.value = true
  try {
    const duplicatedTest = new ManualAccessibilityTest({
      ...test.value,
      id: null,
      title: `Copy of ${test.value.title}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        total: 0,
        completed: 0,
        byPrinciple: {
          perceivable: { completed: 0, total: 0 },
          operable: { completed: 0, total: 0 },
          understandable: { completed: 0, total: 0 },
          robust: { completed: 0, total: 0 }
        },
        byStatus: {
          pass: 0,
          fail: 0,
          na: 0,
          untested: 0
        }
      }
    })

    await store.dispatch('manualAccessibility/createTest', duplicatedTest)
    toast.success('Test duplicated successfully!')
    router.push({ name: 'AccessibilityHome' })
  } catch (error) {
    toast.error('Failed to duplicate test.')
    console.error('Error duplicating test:', error)
  } finally {
    loading.value = false
  }
}

const exportTest = async () => {
  if (!test.value) return

  try {
    // Create a downloadable JSON file with test configuration
    const exportData = {
      ...test.value,
      exportedAt: new Date().toISOString(),
      exportedBy: user.value?.email || 'Unknown'
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `accessibility-test-${test.value.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Test exported successfully!')
  } catch (error) {
    toast.error('Failed to export test.')
    console.error('Error exporting test:', error)
  }
}

const preventNav = (event) => {
  if (!localChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    console.error('Error formatting date:', e)
    return 'Invalid date'
  }
}

// Get color based on status
const getStatusColor = (status) => {
  const statusColors = {
    draft: 'grey',
    'in-progress': 'warning',
    completed: 'success',
    archived: 'error'
  }
  return statusColors[status?.toLowerCase()] || 'secondary'
}

// Lifecycle hooks
onBeforeMount(() => {
  store.commit('SET_LOCAL_CHANGES', false)
  store.commit('SET_DIALOG_LEAVE', false)
  window.addEventListener('beforeunload', preventNav)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', preventNav)
})

onMounted(async () => {
  if (route.params.testId) {
    await fetchTest()
  }
  loadingPage.value = false
})

// Watch for route changes to fetch new test data
onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.testId !== from.params.testId) {
    await fetchTest()
  }
  next()
})

onBeforeRouteLeave((to, from) => {
  if (localChanges.value) {
    store.commit('SET_DIALOG_LEAVE', true)
    store.commit('SET_PATH_TO', to.name)
    return false
  }
  return true
})
</script>

<style scoped>
.settings-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem 0;
}

/* Content Layout */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Styles */
.info-card,
.config-card,
.actions-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.info-card:hover,
.config-card:hover,
.actions-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-icon {
  width: 40px;
  height: 40px;
}

.dialog-icon {
  width: 48px;
  height: 48px;
}

/* Input and form styling */
.modern-input :deep(.v-field) {
  border-radius: 12px;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* Action buttons */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Configuration sections */
.config-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.config-section:hover {
  border-color: #d0d7de;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.config-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 12px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .right-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .settings-layout {
    padding: 0.25rem 0;
  }

  .content-wrapper {
    gap: 16px;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .header-icon {
    width: 36px;
    height: 36px;
  }
}

/* Loading states */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom switch styling */
.custom-switch :deep(.v-switch__track) {
  border-radius: 16px;
}

.custom-switch :deep(.v-switch__thumb) {
  border-radius: 50%;
}
</style>
