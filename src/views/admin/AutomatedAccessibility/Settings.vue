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
    <DeleteConfirmationDialog
      v-model="dialogDel"
      :item-name="safeTest?.title || 'this test'"
      item-type="automated accessibility test"
      :loading="loading"
      @confirm="deleteTest(test)"
      @cancel="dialogDel = false"
    />

    <div class="settings-layout">
      <div class="content-wrapper">
        <div class="left-column">
          <!-- Basic Information Card -->
          <TestSettingsCard
            title="Basic Information"
            subtitle="View and edit the fundamental details of your automated accessibility test"
            icon="mdi-information-outline"
            card-class="info-card"
          >
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
          </TestSettingsCard>
        </div>

        <div class="right-column">
          <!-- Accessibility Configuration Card -->
          <TestSettingsCard
            title="Test Configuration"
            subtitle="Configure automated testing parameters and settings"
            icon="mdi-accessibility"
            icon-color="secondary"
            icon-bg-class="bg-blue-lighten-5"
            card-class="config-card"
          >
            <div v-if="safeTest" class="d-flex flex-column ga-5">
              <!-- Status -->
              <ConfigurationSection
                title="Test Status"
                :icon="getStatusIcon(safeTest.status)"
                :icon-color="getStatusColor(safeTest.status)"
              >
                <v-chip
                  :color="getStatusColor(safeTest.status)"
                  variant="flat"
                  size="small"
                >
                  {{ safeTest.status.toUpperCase() }}
                </v-chip>
              </ConfigurationSection>

              <!-- Public Access -->
              <ConfigurationSection
                title="Public Access"
                description="Allow other users to view this test"
                icon="mdi-earth"
                has-switch
                :switch-value="safeTest.isPublic"
                @update:switch-value="updatePublicAccess"
              />

              <!-- Test Admin -->
              <ConfigurationSection
                title="Test Admin"
                icon="mdi-account-circle"
                icon-color="red"
              >
                <p class="text-body-2 text-grey-darken-2">{{ safeTest.testAdmin?.email || 'Unknown' }}</p>
              </ConfigurationSection>

              <!-- Created Date -->
              <ConfigurationSection
                title="Created"
                icon="mdi-calendar"
                icon-color="grey"
              >
                <p class="text-body-2 text-grey-darken-2">{{ formatDate(safeTest.createdAt) }}</p>
              </ConfigurationSection>
            </div>
            <div v-else class="d-flex align-center justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="24" class="mr-3" />
              <span class="text-body-2">Loading configuration...</span>
            </div>
          </TestSettingsCard>

          <!-- Quick Actions Card -->
          <QuickActionsCard
            :has-data="!!safeTest"
            @duplicate="duplicateTest"
            @export="exportTest"
            @delete="dialogDel = true"
          />

          <!-- Collaborators Card -->
          <TestSettingsCard
            v-if="safeTest && safeTest.collaborators"
            title="Collaborators"
            :subtitle="`${Object.keys(safeTest.collaborators).length} member(s)`"
            icon="mdi-account-multiple"
            icon-color="green-darken-2"
            icon-bg-class="bg-green-lighten-5"
            card-class="collaborators-card"
          >
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
          </TestSettingsCard>
        </div>
      </div>
    </div>

    <AccessNotAllowed v-if="!loadingPage && !safeTest" />
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/components/template/PageWrapper.vue'
import Snackbar from '@/components/atoms/Snackbar.vue'
import LeaveAlert from '@/components/atoms/LeaveAlert.vue'
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue'
import TestSettingsCard from '@/components/molecules/TestSettingsCard.vue'
import DeleteConfirmationDialog from '@/components/molecules/DeleteConfirmationDialog.vue'
import QuickActionsCard from '@/components/molecules/QuickActionsCard.vue'
import ConfigurationSection from '@/components/molecules/ConfigurationSection.vue'
import { useTestSettings } from '@/composables/useTestSettings'

const store = useStore()
const toast = useToast()
const { t } = useI18n()

// Use the shared composable
const {
  loading,
  loadingPage,
  test,
  error,
  dialogDel,
  testId,
  localChanges,
  updateTest,
  submit,
  onSubmit,
  deleteTest,
  duplicateTest,
  exportTest,
  getStatusColor,
  getStatusIcon,
  formatDate
} = useTestSettings({
  getTestByIdGetter: 'automaticAccessibility/getTestById',
  updateAction: 'automaticAccessibility/updateTest',
  deleteAction: 'automaticAccessibility/deleteTest',
  createAction: 'automaticAccessibility/createTest',
  homeRouteName: 'AutomatedAccessibilityHome',
  testType: 'automated-accessibility'
})

// Computed properties specific to this component
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

// Methods specific to this component
const updatePublicAccess = (value) => {
  if (!test.value) return
  test.value.isPublic = value
  updateTest()
}

// Enhanced fetchTest to fetch from store if needed
const fetchTestData = async () => {
  if (!testId.value) return

  loading.value = true
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

// Lifecycle hooks
onMounted(async () => {
  if (testId.value) {
    await fetchTestData()
  } else {
    console.warn('No testId found in route params')
  }
  loadingPage.value = false
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