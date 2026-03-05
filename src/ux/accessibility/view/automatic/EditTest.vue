<template>
  <PageWrapper 
    :title="$t('Accessibility.websiteAnalysisTitle')"
    :subtitle="$t('Accessibility.analyzeWebsiteAutomated')"
  >
  <template #subtitle>
      <p v-if="!assessmentExists" class="text-body-1 text-grey-darken-1">
        {{ $t('Accessibility.enterWebsiteUrl') }}
      </p>
      <p v-else class="text-body-1 text-grey-darken-1">
        {{ $t('Accessibility.existingAssessmentSubtitle') }}
      </p>
    </template>
    <v-row
      justify="center"
      class="min-height-screen"
    >
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
        xl="5"
      >
        <!-- Header Section -->
        <v-card
          class="header-card mb-8 text-center"
          elevation="0"
        >
          <v-card-text class="pa-8">
            <div class="icon-wrapper mb-4">
              <v-icon
                size="64"
                color="white"
                class="header-icon"
              >
                mdi-web-check
              </v-icon>
            </div>
            <h1 class="main-title mb-4">
              {{ $t('Accessibility.websiteAccessibilityTester') }}
            </h1>
            <p class="subtitle">
              {{ $t('Accessibility.analyzeWebsiteCompliance') }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Loading Assessment Check -->
        <v-card
          v-if="checkingAssessment"
          class="form-card mb-6"
          elevation="8"
          rounded="xl"
        >
          <v-card-text class="pa-8 text-center">
            <v-progress-circular
              indeterminate
              size="48"
              width="4"
              color="primary"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">{{ $t('Accessibility.checkingForExistingAssessment') }}</h3>
            <p class="text-body-2 text-grey-darken-1 mb-0">
              {{ $t('Accessibility.pleaseWaitResults') }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Existing Assessment Section -->
        <v-card
          v-else-if="assessmentExists && existingAssessment"
          class="form-card mb-6"
          elevation="8"
          rounded="xl"
          color="success"
          variant="tonal"
        >
          <v-card-text class="pa-8">
            <div class="text-center mb-6">
              <v-icon
                size="64"
                color="success"
                class="mb-4"
              >
                mdi-check-circle
              </v-icon>
              <h3 class="text-h5 font-weight-bold mb-2 text-success">
                {{ $t('Accessibility.assessmentAlreadyAvailable') }}
              </h3>
              <p class="text-body-1 text-grey-darken-1">
                {{ $t('Accessibility.alreadyHasResults') }}
              </p>
            </div>

            <!-- Assessment Details -->
            <v-row class="mb-4" dense>
              <v-col cols="12" md="6">
                <v-chip
                  prepend-icon="mdi-link"
                  variant="outlined"
                  color="success"
                  class="mb-2"
                  size="small"
                  block
                >
                  {{ existingAssessment.ReportUrl || $t('Accessibility.noUrlAvailable') }}
                </v-chip>
              </v-col>
              <v-col cols="12" md="6">
                <v-chip
                  prepend-icon="mdi-calendar"
                  variant="outlined"
                  color="success"
                  class="mb-2"
                  size="small"
                  block
                >
                  {{ formattedDate }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Issue Summary -->
            <v-row class="mb-4" dense>
              <v-col cols="4">
                <v-card variant="outlined" density="compact">
                  <v-card-text class="text-center py-2">
                    <div class="text-h6 font-weight-bold text-error">
                      {{ issuesSummary.errors }}
                    </div>
                    <div class="text-caption">{{ $t('Accessibility.errors') }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="outlined" density="compact">
                  <v-card-text class="text-center py-2">
                    <div class="text-h6 font-weight-bold text-warning">
                      {{ issuesSummary.warnings }}
                    </div>
                    <div class="text-caption">{{ $t('Accessibility.warnings') }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="outlined" density="compact">
                  <v-card-text class="text-center py-2">
                    <div class="text-h6 font-weight-bold text-info">
                      {{ issuesSummary.notices }}
                    </div>
                    <div class="text-caption">{{ $t('Accessibility.notices') }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <div class="d-flex gap-3 mb-3">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-chart-pie"
                variant="elevated"
                class="flex-fill"
                @click="goToAnswers"
              >
                {{ $t('Accessibility.viewAnswers') }}
              </v-btn>
              <v-btn
                color="success"
                size="large"
                prepend-icon="mdi-file-document-outline"
                variant="outlined"
                class="flex-fill"
                @click="goToReport"
              >
                {{ $t('Accessibility.viewReports') }}
              </v-btn>
            </div>


          </v-card-text>
        </v-card>

        <!-- Form Section (when no existing assessment) -->
        <v-card
          v-else-if="!assessmentExists"
          class="form-card mb-6"
          elevation="8"
          rounded="xl"
        >
          <v-card-text class="pa-8">
            <v-form @submit.prevent="runTest">
              <v-text-field
                v-model="url"
                :label="$t('Accessibility.websiteUrlLabel')"
                :placeholder="$t('Accessibility.websiteUrlPlaceholder')"
                type="url"
                required
                :disabled="isLoading"
                prepend-inner-icon="mdi-web"
                append-inner-icon="mdi-link"
                variant="outlined"
                color="primary"
                class="mb-4"
                :rules="[rules.required, rules.url]"
              />

              <v-btn
                type="submit"
                :disabled="isLoading || !url.trim()"
                :loading="isLoading"
                color="primary"
                size="large"
                block
                rounded="lg"
                class="text-none"
              >
                <template #prepend>
                  <v-icon v-if="!isLoading">
                    mdi-play
                  </v-icon>
                </template>
                {{ isLoading ? $t('Accessibility.testing') : $t('Accessibility.runAccessibilityTest') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Loading Section -->
        <v-card
          v-if="isLoading"
          class="loading-card mb-6"
          elevation="8"
          rounded="xl"
        >
          <v-card-text class="pa-8 text-center">
            <v-progress-circular
              indeterminate
              size="64"
              width="4"
              color="primary"
              class="mb-4"
            />

            <h3 class="loading-title mb-2">
              {{ $t('Accessibility.analyzingAccessibility') }}
            </h3>
            <p class="loading-text mb-6">
              {{ $t('Accessibility.runningComprehensiveTests') }}
            </p>

            <div class="loading-steps">
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="(step, index) in steps"
                  :key="index"
                  :class="{ 'step-active': currentStep >= index + 1 }"
                  class="step-item"
                >
                  <template #prepend>
                    <v-icon
                      :color="currentStep >= index + 1 ? 'success' : 'grey-lighten-1'
                      "
                      size="20"
                    >
                      mdi-check-circle
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ step }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>

        <!-- Error Section -->
        <v-card
          v-if="error"
          class="error-card mb-6"
          elevation="8"
          rounded="xl"
          color="error"
          variant="tonal"
        >
          <v-card-text class="pa-8">
            <div class="error-header mb-4">
              <v-icon
                size="32"
                color="error"
                class="me-3"
              >
                mdi-alert-circle
              </v-icon>
              <h3 class="error-title">
                {{ $t('Accessibility.testFailed') }}
              </h3>
            </div>

            <div class="error-content mb-6">
              <p class="error-message mb-4">
                {{ getErrorMessage() }}
              </p>

              <v-expansion-panels
                v-if="errorType"
                class="mb-4"
              >
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="me-2">
                      mdi-information
                    </v-icon>
                    {{ $t('Accessibility.commonIssuesSolutions') }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list class="bg-transparent">
                      <v-list-item
                        v-for="solution in getSolutions()"
                        :key="solution.type"
                        class="pa-3"
                      >
                        <template #prepend>
                          <v-icon
                            :color="solution.color"
                            size="20"
                          >
                            {{ solution.icon }}
                          </v-icon>
                        </template>
                        <v-list-item-title class="font-weight-medium">
                          {{ solution.title }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ solution.description }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-alert
                type="info"
                variant="tonal"
                icon="mdi-lightbulb"
                class="mb-4"
              >
                <div class="font-weight-medium mb-2">
                  {{ $t('Accessibility.troubleshootingTips') }}:
                </div>
                <ul class="ma-0 pa-0 ms-4">
                  <li>{{ $t('Accessibility.ensurePubliclyAccessible') }}</li>
                  <li>{{ $t('Accessibility.tryDifferentPage') }}</li>
                  <li>{{ $t('Accessibility.checkRequiresAuth') }}</li>
                  <li>{{ $t('Accessibility.verifyUrlCorrect') }}</li>
                </ul>
              </v-alert>
            </div>

            <div class="error-actions">
              <v-btn
                variant="outlined"
                color="error"
                class="me-2"
                @click="clearError"
              >
                <template #prepend>
                  <v-icon>mdi-close</v-icon>
                </template>
                {{ $t('Accessibility.dismiss') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="retryTest"
              >
                <template #prepend>
                  <v-icon>mdi-refresh</v-icon>
                </template>
                {{ $t('Accessibility.tryAgain') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const { t } = useI18n()

// Reactive data
const url = ref('')
const isLoading = ref(false)
const error = ref(null)
const errorType = ref('')
const currentStep = ref(0)
const assessmentExists = ref(false)
const existingAssessment = ref(null)
const checkingAssessment = ref(true)

// Constants
const steps = computed(() => [
  t('Accessibility.scanningPageStructure'),
  t('Accessibility.checkingColorContrast'),
  t('Accessibility.validatingAriaAttributes'),
  t('Accessibility.generatingReport'),
])
const rules = {
  required: (value) => !!(value && String(value).trim()) || t('Accessibility.urlRequired'),
  url: (value) => {
    const v = String(value || '').trim()
    // Be lenient in the UI: allow domains without protocol; we'll normalize on submit
    const hasProtocol = /^https?:\/\//i.test(v)
    const domainish = /^(https?:\/\/)?[\w.-]+\.[A-Za-z]{2,}([/:?#].*)?$/i.test(v)
    return (
      (hasProtocol || domainish) ||
      t('Accessibility.enterValidUrl')
    )
  },
}

// Router composables
const route = useRoute()
const router = useRouter()
const store = useStore()
const testId = ref(route.params.id || route.params.testId || '')

// Computed properties
const formattedDate = computed(() => {
  if (!existingAssessment.value?.ReportDateTime) return t('Accessibility.dateNotAvailable')
  return new Date(existingAssessment.value.ReportDateTime).toLocaleString()
})

const issuesSummary = computed(() => {
  if (!existingAssessment.value?.ReportIssues) {
    return { errors: 0, warnings: 0, notices: 0, total: 0 }
  }
  const issues = existingAssessment.value.ReportIssues
  return {
    errors: issues.filter(issue => issue.type === 'error').length,
    warnings: issues.filter(issue => issue.type === 'warning').length,
    notices: issues.filter(issue => issue.type === 'notice').length,
    total: issues.length
  }
})


// Methods
// Utilities: normalize URL for backend expectations
const ensureProtocol = (input) => (/^https?:\/\//i.test(input) ? input : `https://${input}`)
const normalizeUrl = (input) => {
  const trimmed = (input || '').trim()
  if (!trimmed) return ''
  const withProto = ensureProtocol(trimmed)
  try {
    const u = new URL(withProto)
    // ensure trailing slash optional: keep original path/query/hash
    return u.toString()
  } catch (e) {
    // Fallback to original when URL parsing fails; let backend/validation handle
    return withProto
  }
}

const runTest = async () => {
  if (!url.value.trim()) return

  // Normalize URL for backend compatibility (add protocol and www when needed)
  const normalized = normalizeUrl(url.value)
  url.value = normalized

  isLoading.value = true
  error.value = null
  errorType.value = ''
  currentStep.value = 0

  try {
    // Simulate loading steps
    for (let i = 1; i <= steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      currentStep.value = i
    }

    // Use env variable for API endpoint
    const apiUrl = process.env.VUE_APP_ACCESSIBILITY_API || process.env.VUE_APP_ACCESSIBILITY_API_LOCAL
    const response = await axios.post(apiUrl, {
      url: normalized,
    });
    
    if (response && response.data) {
      const resData = response.data;
      
      // Save the assessment data to Firestore and update the study
      try {
        await store.dispatch('automaticReport/saveAssessment', {
          testData: resData,
          testId: testId.value
        });
        
        // Redirect to the reports page
        router.push(`/accessibility/automatic/reports/${testId.value}`);
      } catch (saveError) {
        console.error('Error saving assessment:', saveError.message);
        error.value = t('Accessibility.saveFailedRetry');
        errorType.value = 'server';
      }
    }
  } catch (err) {
    console.error('Error running test:', err)
    error.value =
      err.response?.data?.error || 'Failed to run the accessibility test'
    errorType.value = determineErrorType(err)
  } finally {
    isLoading.value = false
    currentStep.value = 0
  }
}

const determineErrorType = (err) => {
  if (!err.response) return 'network'
  if (err.response.status === 400) return 'invalid-url'
  if (err.response.status === 403) return 'blocked'
  if (err.response.status === 408) return 'timeout'
  return 'server'
}

const getErrorMessage = () => {
  const messages = {
    network: t('Accessibility.errorNetwork'),
    'invalid-url': t('Accessibility.errorInvalidUrl'),
    blocked: t('Accessibility.errorBlocked'),
    timeout: t('Accessibility.errorTimeout'),
    server: t('Accessibility.errorServer'),
  }

  return (
    messages[errorType.value] ||
    error.value ||
    t('Accessibility.errorUnexpected')
  )
}

const getSolutions = () => {
  const solutions = {
    network: {
      type: 'network',
      icon: 'mdi-wifi-off',
      color: 'warning',
      title: t('Accessibility.solutionNetworkTitle'),
      description: t('Accessibility.solutionNetworkDesc'),
    },
    'invalid-url': {
      type: 'invalid-url',
      icon: 'mdi-link-off',
      color: 'error',
      title: t('Accessibility.solutionInvalidUrlTitle'),
      description: t('Accessibility.solutionInvalidUrlDesc'),
    },
    blocked: {
      type: 'blocked',
      icon: 'mdi-shield-off',
      color: 'warning',
      title: t('Accessibility.solutionBlockedTitle'),
      description: t('Accessibility.solutionBlockedDesc'),
    },
    timeout: {
      type: 'timeout',
      icon: 'mdi-clock-alert',
      color: 'info',
      title: t('Accessibility.solutionTimeoutTitle'),
      description: t('Accessibility.solutionTimeoutDesc'),
    },
    server: {
      type: 'server',
      icon: 'mdi-server-off',
      color: 'error',
      title: t('Accessibility.solutionServerTitle'),
      description: t('Accessibility.solutionServerDesc'),
    },
  }

  return errorType.value ? [solutions[errorType.value]] : []
}

const clearError = () => {
  error.value = null
  errorType.value = ''
}

const retryTest = () => {
  clearError()
  runTest()
}



// Check if assessment already exists for this test
const checkExistingAssessment = async () => {
  if (!testId.value) return

  checkingAssessment.value = true
  try {
    await store.dispatch('automaticReport/fetchReport', testId.value)
    const report = store.getters['automaticReport/report']
    
    if (report && report.ReportIssues) {
      assessmentExists.value = true
      existingAssessment.value = report
    } else {
      assessmentExists.value = false
      existingAssessment.value = null
    }
  } catch (error) {
    assessmentExists.value = false
    existingAssessment.value = null
  } finally {
    checkingAssessment.value = false
  }
}

// Navigate to answers page
const goToAnswers = () => {
  router.push(`/accessibility/automatic/answers/${testId.value}`)
}

// Navigate to report page
const goToReport = () => {
  router.push(`/accessibility/automatic/reports/${testId.value}`)
}

// Lifecycle
onMounted(() => {
  checkExistingAssessment()
})
</script>


