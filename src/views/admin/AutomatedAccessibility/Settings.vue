<template>
  <PageWrapper title="Automated Accessibility Test Settings" :loading="loadingPage" loading-text="Loading Test Settings"
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
        Configure your automated accessibility test settings and preferences
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
                <p class="text-caption text-grey-darken-1">View and edit the fundamental details of your automated accessibility test</p>
              </div>
            </div>
            <v-card-text class="py-6">
              <div v-if="safeTest" class="d-flex flex-column ga-4">
                <!-- Test Title -->
                <v-text-field
                  v-model="safeTest.title"
                  label="Test Title"
                  variant="outlined"
                  density="compact"
                  @update:model-value="updateTest"
                  hide-details
                />

                <!-- Test Description -->
                <v-textarea
                  v-model="safeTest.description"
                  label="Description"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  @update:model-value="updateTest"
                  hide-details
                />

                <!-- Website URL -->
                <v-text-field
                  v-model="safeTest.websiteUrl"
                  label="Website URL"
                  variant="outlined"
                  density="compact"
                  @update:model-value="updateTest"
                  hide-details
                />

                <!-- Test Version -->
                <v-text-field
                  v-model="safeTest.version"
                  label="Version"
                  variant="outlined"
                  density="compact"
                  @update:model-value="updateTest"
                  hide-details
                />

                <!-- Test Type (Read-only) -->
                <v-text-field
                  :model-value="safeTest.testType || 'Automated Accessibility'"
                  label="Test Type"
                  variant="outlined"
                  density="compact"
                  readonly
                  hide-details
                />

                <!-- Test ID (Read-only) -->
                <v-text-field
                  :model-value="safeTest.id"
                  label="Test ID"
                  variant="outlined"
                  density="compact"
                  readonly
                  hide-details
                />
              </div>
              <div v-else class="d-flex align-center justify-center py-8">
                <v-progress-circular indeterminate color="primary" size="24" class="mr-3" />
                <span class="text-body-2">Loading test information...</span>
              </div>
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
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">Test Configuration</h3>
                <p class="text-caption text-grey-darken-1">Configure automated testing parameters and settings</p>
              </div>
            </div>
            <v-card-text class="py-6">
              <div v-if="safeTest" class="d-flex flex-column ga-5">
                <!-- Status -->
                <div class="pa-5 border rounded-lg bg-grey-lighten-5">
                  <div class="d-flex align-center ga-2 mb-3">
                    <v-icon :color="getStatusColor(safeTest.status)" size="18">{{ getStatusIcon(safeTest.status) }}</v-icon>
                    <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">Test Status</span>
                  </div>
                  <v-chip
                    :color="getStatusColor(safeTest.status)"
                    variant="flat"
                    size="small"
                  >
                    {{ safeTest.status.toUpperCase() }}
                  </v-chip>
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

                <!-- Test Admin -->
                <div class="pa-5 border rounded-lg bg-grey-lighten-5">
                  <div class="d-flex align-center ga-2 mb-3">
                    <v-icon color="red" size="18">mdi-account-circle</v-icon>
                    <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">Test Admin</span>
                  </div>
                  <p class="text-body-2 text-grey-darken-2">{{ safeTest.testAdmin?.email || 'Unknown' }}</p>
                </div>

                <!-- Created Date -->
                <div class="pa-5 border rounded-lg bg-grey-lighten-5">
                  <div class="d-flex align-center ga-2 mb-3">
                    <v-icon color="grey" size="18">mdi-calendar</v-icon>
                    <span class="font-weight-semibold text-subtitle-2 text-grey-darken-4">Created</span>
                  </div>
                  <p class="text-body-2 text-grey-darken-2">{{ formatDate(safeTest.createdAt) }}</p>
                </div>
              </div>
              <div v-else class="d-flex align-center justify-center py-8">
                <v-progress-circular indeterminate color="primary" size="24" class="mr-3" />
                <span class="text-body-2">Loading configuration...</span>
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

          <!-- Collaborators Card -->
          <v-card class="collaborators-card" elevation="0" v-if="safeTest && safeTest.collaborators">
            <div class="d-flex align-start ga-3 pa-6 pb-0">
              <div class="header-icon bg-green-lighten-5 rounded-lg d-flex align-center justify-center">
                <v-icon color="green-darken-2" size="20">mdi-account-multiple</v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-grey-darken-4 mb-1">Collaborators</h3>
                <p class="text-caption text-grey-darken-1">{{ Object.keys(safeTest.collaborators).length }} member(s)</p>
              </div>
            </div>
            <v-card-text class="py-6">
              <v-chip-group v-if="Object.keys(safeTest.collaborators).length > 0">
                <v-chip
                  v-for="(role, userId) in safeTest.collaborators"
                  :key="userId"
                  :color="role === 'admin' ? 'primary' : 'secondary'"
                  variant="outlined"
                  size="small"
                >
                  <v-icon start>
                    {{ role === 'admin' ? 'mdi-crown' : 'mdi-account' }}
                  </v-icon>
                  {{ role.toUpperCase() }}
                </v-chip>
              </v-chip-group>
              <div v-else class="text-body-2 text-disabled">
                No collaborators assigned
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
import { ref, computed, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/components/template/PageWrapper.vue'
import Snackbar from '@/components/atoms/Snackbar.vue'
import LeaveAlert from '@/components/atoms/LeaveAlert.vue'
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue'

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

// Computed properties
const testId = computed(() => route.params.testId)

const localChanges = computed({
  get: () => store.state.localChanges,
  set: value => store.commit('SET_LOCAL_CHANGES', value),
})

const user = computed(() => store.getters.user)

const dialogText = computed(() => {
  if (test.value) {
    return `Are you sure you want to delete the automated accessibility test "${test.value.title}"?`
  }
  return "Are you sure you want to delete this test?"
})

const safeTest = computed(() => {
  if (!test.value) return null
  return {
    ...test.value,
    title: test.value.title || '',
    description: test.value.description || '',
    websiteUrl: test.value.websiteUrl || '',
    version: test.value.version || '1.0',
    testType: test.value.testType || 'Automated Accessibility',
    isPublic: test.value.isPublic || false
  }
})

// Methods
const fetchTest = async () => {
  if (!testId.value) return

  loading.value = true
  error.value = null

  try {
    // Fetch tests if not already loaded
    if (!store.getters['automaticAccessibility/allTests']?.length) {
      await store.dispatch('automaticAccessibility/fetchTests')
    }

    // Get the test from store
    const fetchedTest = store.getters['automaticAccessibility/getTestById'](testId.value)
    test.value = fetchedTest

    if (!test.value) {
      error.value = 'Test not found'
      toast.error('Test not found')
    }
  } catch (err) {
    console.error('Error fetching test:', err)
    error.value = 'Failed to load test information'
    toast.error('Failed to load test information')
  } finally {
    loading.value = false
  }
}

const updateTest = () => {
  if (!test.value) return
  markLocalChanges()
}

const markLocalChanges = () => {
  store.commit('SET_LOCAL_CHANGES', true)
}

const updatePublicAccess = (value) => {
  if (!test.value) return
  test.value.isPublic = value
  markLocalChanges()
}

const onSubmit = async () => {
  await submit()
  store.commit('SET_LOCAL_CHANGES', false)
  router.push({ name: store.state.pathTo })
}

const submit = async () => {
  if (!test.value) {
    toast.warning('No test data to save.')
    return
  }

  loading.value = true
  try {
    await store.dispatch('automaticAccessibility/updateTest', {
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
    await store.dispatch('automaticAccessibility/deleteTest', testToDelete.id)
    toast.success('Test deleted successfully!')
    router.push({ name: 'AutomatedAccessibilityHome' })
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
    const duplicatedTest = {
      ...test.value,
      id: null,
      title: `Copy of ${test.value.title}`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await store.dispatch('automaticAccessibility/createTest', duplicatedTest)
    toast.success('Test duplicated successfully!')
    router.push({ name: 'AutomatedAccessibilityHome' })
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
    link.download = `automated-accessibility-test-${test.value.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
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

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'draft': 'orange',
    'active': 'green',
    'completed': 'blue',
    'failed': 'red'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    'draft': 'mdi-file-document-edit',
    'active': 'mdi-play-circle',
    'completed': 'mdi-check-circle',
    'failed': 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'
  
  let date
  if (timestamp.seconds) {
    // Firestore timestamp
    date = new Date(timestamp.seconds * 1000)
  } else {
    // Regular date
    date = new Date(timestamp)
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const preventNav = (event) => {
  if (!localChanges.value) return
  event.preventDefault()
  event.returnValue = ''
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
  if (testId.value) {
    await fetchTest()
  } else {
    console.warn('No testId found in route params')
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
.actions-card,
.collaborators-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.info-card:hover,
.config-card:hover,
.actions-card:hover,
.collaborators-card:hover {
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

/* Text fields styling */
.v-text-field :deep(.v-field) {
  border-radius: 8px;
}

.v-textarea :deep(.v-field) {
  border-radius: 8px;
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

/* Status chip styling */
.v-chip {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Border and background utilities */
.border {
  border: 1px solid #e5e7eb;
}

.bg-grey-lighten-5 {
  background-color: #f8f9fa;
}

/* Card content spacing */
.v-card-text {
  padding: 24px;
}

/* List styling */
.v-list-item-subtitle {
  opacity: 0.7;
}

.text-wrap {
  word-break: break-all;
}

/* Form field spacing */
.v-text-field,
.v-textarea {
  margin-bottom: 8px;
}

/* Chip group styling */
.v-chip-group {
  margin: 0;
}

.v-chip-group .v-chip {
  margin: 2px 4px 2px 0;
}
</style>