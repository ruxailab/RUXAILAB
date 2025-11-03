<template>
  <PageWrapper
    title="AnchorSense - Link Accessibility Analyzer"
    subtitle="AI-powered anchor tag analysis with intelligent fix suggestions"
  >
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text class="pa-6">
            <!-- Input Display -->
            <v-alert type="info" variant="tonal" class="mb-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <strong>Analyzing:</strong>
                  <span v-if="inputType === 'url'"> {{ inputUrl }}</span>
                  <span v-else> {{ inputFileName }}</span>
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  prepend-icon="mdi-arrow-left"
                  @click="goBackToInputSelection"
                >
                  Change Input
                </v-btn>
              </div>
            </v-alert>

            <!-- Start Analysis Button -->
            <v-card v-if="!loading && !results" variant="outlined" class="mb-4">
              <v-card-text class="text-center pa-8">
                <v-icon icon="mdi-link-variant" size="80" color="blue" class="mb-4" />
                <h3 class="text-h5 mb-3">Ready to Analyze Anchor Tags</h3>
                <p class="text-body-1 mb-6">
                  AnchorSense will scan your {{ inputType === 'url' ? 'webpage' : 'HTML file' }} for link accessibility issues
                </p>
                <v-btn
                  color="blue"
                  size="x-large"
                  prepend-icon="mdi-play"
                  @click="startAnalysis"
                >
                  Start AnchorSense Analysis
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Error Display -->
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
              <strong>Error:</strong> {{ error }}
            </v-alert>

            <!-- Loading State -->
            <v-card v-if="loading" variant="outlined" class="mb-4">
              <v-card-text class="text-center pa-8">
                <v-progress-circular
                  indeterminate
                  color="blue"
                  size="64"
                  class="mb-4"
                />
                <h4 class="text-h6">Analyzing anchor tags with AI...</h4>
                <p class="text-body-2">Detecting issues and generating suggestions</p>
              </v-card-text>
            </v-card>

            <!-- Results Display -->
            <v-expand-transition>
              <div v-if="results && !loading">
                <!-- Summary Stats -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="bg-blue-lighten-5">
                    <v-icon icon="mdi-chart-box" class="mr-2" />
                    Analysis Summary
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <div class="d-flex flex-wrap align-center gap-3">
                      <div class="d-flex align-center px-3 py-2 rounded" :class="results.passed ? 'bg-green-lighten-5' : 'bg-red-lighten-5'">
                        <v-icon :icon="results.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" :color="results.passed ? 'green' : 'red'" class="mr-2" />
                        <div class="text-body-2">
                          <div class="font-weight-medium">Overall Status</div>
                          <div>{{ results.passed ? 'Passed' : 'Issues Found' }}</div>
                        </div>
                      </div>

                      <div class="d-flex align-center px-3 py-2 rounded bg-orange-lighten-5">
                        <v-icon icon="mdi-alert" color="orange" class="mr-2" />
                        <div class="text-body-2">
                          <div class="font-weight-medium">Total Issues</div>
                          <div>{{ results.total_issues }}</div>
                        </div>
                      </div>

                      <div class="d-flex align-center px-3 py-2 rounded bg-blue-lighten-5">
                        <v-icon icon="mdi-link-variant" color="blue" class="mr-2" />
                        <div class="text-body-2">
                          <div class="font-weight-medium">Links Analyzed</div>
                          <div>{{ results.issues?.length || 0 }}</div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Issues List -->
                <v-card v-if="(results.issues?.length || 0) > 0" variant="outlined" class="mb-4">
                  <v-card-title class="bg-orange-lighten-5">
                    <v-icon icon="mdi-alert-circle" class="mr-2" />
                    Anchor Tag Issues ({{ results.issues.length }})
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="(issue, index) in results.issues"
                        :key="index"
                      >
                        <v-expansion-panel-title>
                          <div class="d-flex align-center gap-3">
                            <v-chip color="orange" size="small">
                              {{ issue.module || 'linkalt' }}
                            </v-chip>
                            <span class="font-weight-medium">{{ issue.issue }}</span>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="pa-2">
                            <p class="text-body-2 mb-3"><strong>Issue:</strong> {{ issue.issue }}</p>
                            
                            <v-card variant="outlined" class="mb-3">
                              <v-card-text>
                                <strong>Current HTML:</strong>
                                <pre class="mt-2 pa-2 bg-grey-lighten-4 rounded">{{ issue.element }}</pre>
                              </v-card-text>
                            </v-card>

                            <v-card color="green-lighten-5" variant="outlined" class="mb-3">
                              <v-card-text>
                                <div class="d-flex align-center mb-2">
                                  <v-icon icon="mdi-lightbulb" color="green" class="mr-2" />
                                  <strong>How to Fix:</strong>
                                </div>
                                <p class="text-body-2">{{ issue.help }}</p>
                              </v-card-text>
                            </v-card>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card-text>
                </v-card>

                <!-- No Issues Found -->
                <v-card v-else variant="outlined" class="mb-4">
                  <v-card-text class="text-center pa-8">
                    <v-icon icon="mdi-check-circle" size="80" color="green" class="mb-4" />
                    <h3 class="text-h5 mb-3">No Issues Found!</h3>
                    <p class="text-body-1">All anchor tags are properly accessible.</p>
                  </v-card-text>
                </v-card>

                <!-- Action Buttons -->
                <v-card variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="d-flex flex-wrap gap-2">
                      <v-btn color="green" prepend-icon="mdi-download" @click="downloadReport">
                        Export Report
                      </v-btn>
                      <v-btn
                        color="grey"
                        variant="outlined"
                        prepend-icon="mdi-refresh"
                        @click="resetAnalysis"
                      >
                        New Analysis
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-expand-transition>

            <!-- Back Button -->
            <div class="text-center mt-6">
              <v-btn
                color="grey"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                @click="goBack"
              >
                Back to Tools
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
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const API_BASE_URL = process.env.VUE_APP_AI_ACCESSIBILITY_API

// Get saved input from sessionStorage
const inputType = ref('')
const inputUrl = ref('')
const inputFileName = ref('')
const inputFileContent = ref('')

const loading = ref(false)
const error = ref(null)
const results = ref(null)
const saving = ref(false)

const testId = computed(() => route.params.id)

// Load saved input on mount
onMounted(() => {
  inputType.value = sessionStorage.getItem('ai_examine_input_type') || ''
  
  if (inputType.value === 'url') {
    inputUrl.value = sessionStorage.getItem('ai_examine_url') || ''
  } else if (inputType.value === 'file') {
    inputFileName.value = sessionStorage.getItem('ai_examine_file_name') || ''
    inputFileContent.value = sessionStorage.getItem('ai_examine_file_content') || ''
  }

  // Redirect back if no input provided
  if (!inputType.value) {
    router.push({
      name: 'AIAssistedAccessibilityExamine',
      params: { id: testId.value }
    })
  }
})

const startAnalysis = () => {
  if (inputType.value === 'url') {
    analyzeUrl()
  } else {
    analyzeFile()
  }
}

const analyzeUrl = async () => {
  if (!inputUrl.value) {
    error.value = 'No URL provided'
    return
  }

  loading.value = true
  error.value = null
  results.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/linksense/analyze-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: inputUrl.value
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const apiData = await response.json()
    
    // Transform API response to our format
    results.value = {
      issues: apiData,
      total_issues: apiData.length,
      passed: apiData.length === 0
    }
    
    // Save results to Firebase
    await saveResultsToFirebase(results.value)
  } catch (err) {
    error.value = `Failed to connect to AI service: ${err.message}. Please ensure the backend API is running on ${API_BASE_URL}`
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}

const analyzeFile = async () => {
  if (!inputFileContent.value) {
    error.value = 'No file content available'
    return
  }

  loading.value = true
  error.value = null
  results.value = null

  try {
    // Create a File object from the stored content
    const blob = new Blob([inputFileContent.value], { type: 'text/html' })
    const file = new File([blob], inputFileName.value, { type: 'text/html' })
    
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/linksense/analyze-file`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const apiData = await response.json()
    
    // Transform API response to our format
    results.value = {
      issues: apiData,
      total_issues: apiData.length,
      passed: apiData.length === 0
    }
    
    // Save results to Firebase
    await saveResultsToFirebase(results.value)
  } catch (err) {
    error.value = `Failed to connect to AI service: ${err.message}. Please ensure the backend API is running on ${API_BASE_URL}`
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}

const saveResultsToFirebase = async (anchorData) => {
  if (!anchorData || saving.value) return

  saving.value = true
  try {
    await store.dispatch('aiAssistedResults/saveAnchorSenseResult', {
      testId: testId.value,
      anchorData: anchorData
    })
    
    console.log('AnchorSense results saved to Firebase')
    
    // Show success toast
    store.commit('SET_TOAST', {
      message: 'AnchorSense analysis saved successfully',
      type: 'success'
    })
  } catch (err) {
    console.error('Error saving to Firebase:', err)
    // Show error toast but don't block the UI
    store.commit('SET_TOAST', {
      message: 'Warning: Could not save results to database',
      type: 'warning'
    })
  } finally {
    saving.value = false
  }
}

const downloadReport = () => {
  if (!results.value?.issues) return

  // Create a simple text report
  let report = '=== AnchorSense Analysis Report ===\n\n'
  report += `Analyzed: ${inputType.value === 'url' ? inputUrl.value : inputFileName.value}\n`
  report += `Date: ${new Date().toLocaleString()}\n`
  report += `Total Issues: ${results.value.total_issues}\n`
  report += `Status: ${results.value.passed ? 'Passed' : 'Failed'}\n\n`
  report += '=== Issues Found ===\n\n'
  
  results.value.issues.forEach((issue, index) => {
    report += `${index + 1}. ${issue.issue}\n`
    report += `   Module: ${issue.module}\n`
    report += `   Element: ${issue.element}\n`
    report += `   Help: ${issue.help}\n\n`
  })

  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'anchorsense_report.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const resetAnalysis = () => {
  results.value = null
  error.value = null
}

const goBack = () => {
  router.push({
    name: 'AIAssistedAccessibilityExamine',
    params: { id: testId.value }
  })
}

const goBackToInputSelection = () => {
  // Clear sessionStorage and go back
  sessionStorage.removeItem('ai_examine_input_type')
  sessionStorage.removeItem('ai_examine_url')
  sessionStorage.removeItem('ai_examine_file_name')
  sessionStorage.removeItem('ai_examine_file_content')
  
  router.push({
    name: 'AIAssistedAccessibilityExamine',
    params: { id: testId.value }
  })
}
</script>

<style scoped>
.input-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.input-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.selected-input {
  border: 2px solid rgb(var(--v-theme-blue)) !important;
  background-color: rgba(33, 150, 243, 0.05);
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.85rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}
</style>
