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
    <DeleteConfirmationDialog
      v-model="dialogDel"
      :item-name="safeTest?.title || 'this test'"
      item-type="accessibility test"
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
            subtitle="Configure the fundamental details of your accessibility test"
            icon="mdi-information-outline"
            card-class="info-card"
          >
            <AccessibilityTestForm v-if="safeTest" ref="testForm" :test="safeTest" @update:test="updateTest"
              @validate="validate" />
          </TestSettingsCard>
        </div>

        <div class="right-column">
          <!-- Accessibility Configuration Card -->
          <TestSettingsCard
            title="Accessibility Settings"
            subtitle="Configure WCAG compliance and testing parameters"
            icon="mdi-accessibility"
            icon-color="secondary"
            icon-bg-class="bg-blue-lighten-5"
            card-class="config-card"
          >
            <div v-if="safeTest && safeTest.configData" class="d-flex flex-column ga-5">
              <!-- Compliance Level -->
              <ConfigurationSection
                title="Compliance Level"
                icon="mdi-certificate"
              >
                <v-select v-model="safeTest.configData.complianceLevel" :items="complianceLevels" density="compact"
                  variant="outlined" hide-details @update:model-value="updateComplianceLevel" />
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

              <!-- Include Non-Interference -->
              <ConfigurationSection
                title="Non-Interference"
                description="Include non-interference requirements"
                icon="mdi-shield-check"
                has-switch
                :switch-value="safeTest.configData.includeNonInterference"
                @update:switch-value="updateNonInterference"
              />
            </div>
            <div v-else class="d-flex align-center justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="24" class="mr-3" />
              <span class="text-body-2">Loading accessibility settings...</span>
            </div>
          </TestSettingsCard>

          <!-- Quick Actions Card -->
          <QuickActionsCard
            :has-data="!!safeTest"
            @duplicate="duplicateTest"
            @export="exportTest"
            @delete="dialogDel = true"
          />
        </div>
      </div>
    </div>

    <AccessNotAllowed v-if="!loadingPage && !safeTest" />
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/components/template/PageWrapper.vue'
import AccessibilityTestForm from '@/components/atoms/AccessibilityTestForm.vue'
import Snackbar from '@/components/atoms/Snackbar.vue'
import LeaveAlert from '@/components/atoms/LeaveAlert.vue'
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue'
import TestSettingsCard from '@/components/molecules/TestSettingsCard.vue'
import DeleteConfirmationDialog from '@/components/molecules/DeleteConfirmationDialog.vue'
import QuickActionsCard from '@/components/molecules/QuickActionsCard.vue'
import ConfigurationSection from '@/components/molecules/ConfigurationSection.vue'
import ManualAccessibilityTest from '@/models/ManualAccessibilityTest'
import { useTestSettings } from '@/composables/useTestSettings'

const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast()
const { t } = useI18n()

// Reactive references specific to this component
const testForm = ref(null)
const validForm = ref(false)

// Compliance level options
const complianceLevels = [
  { title: 'Level A', value: 'A' },
  { title: 'Level AA (Recommended)', value: 'AA' },
  { title: 'Level AAA', value: 'AAA' }
]

// Use the shared composable with manual accessibility specific actions
const {
  loading,
  loadingPage,
  test,
  error,
  dialogDel,
  testId,
  localChanges,
  updateTest: baseUpdateTest,
  submit: baseSubmit,
  onSubmit,
  deleteTest,
  duplicateTest: baseDuplicateTest,
  exportTest
} = useTestSettings({
  fetchAction: 'manualAccessibility/fetchTest',
  updateAction: 'manualAccessibility/updateTest',
  deleteAction: 'manualAccessibility/deleteTest',
  createAction: 'manualAccessibility/createTest',
  homeRouteName: 'AccessibilityHome',
  testType: 'accessibility'
})

// Computed properties specific to this component
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

// Methods specific to this component
const fetchTest = async () => {
  if (!route.params.testId) return

  loading.value = true
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
  baseUpdateTest()
}

const updateComplianceLevel = (value) => {
  if (!test.value || !test.value.configData) return
  test.value.configData.complianceLevel = value
  baseUpdateTest()
}

const updatePublicAccess = (value) => {
  if (!test.value) return
  test.value.isPublic = value
  baseUpdateTest()
}

const updateNonInterference = (value) => {
  if (!test.value || !test.value.configData) return
  test.value.configData.includeNonInterference = value
  baseUpdateTest()
}

const validate = (valid) => {
  validForm.value = valid
}

const submit = async () => {
  if (!test.value || !validForm.value) {
    toast.warning('Please fill in all required fields correctly.')
    return
  }
  await baseSubmit()
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

// Lifecycle hooks
onMounted(async () => {
  if (route.params.testId) {
    await fetchTest()
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
