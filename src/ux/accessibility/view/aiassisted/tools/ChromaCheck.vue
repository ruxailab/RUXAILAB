<template>
  <PageWrapper
    title="ChromaCheck - Color Contrast Analyzer"
    subtitle="AI-powered color contrast analysis for WCAG compliance"
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
                <v-icon icon="mdi-palette" size="80" color="purple" class="mb-4" />
                <h3 class="text-h5 mb-3">Ready to Analyze Color Contrast</h3>
                <p class="text-body-1 mb-6">
                  ChromaCheck will scan your {{ inputType === 'url' ? 'webpage' : 'HTML file' }} for color contrast issues
                </p>
                <v-btn
                  color="purple"
                  size="x-large"
                  prepend-icon="mdi-play"
                  @click="startAnalysis"
                >
                  Start ChromaCheck Analysis
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
                  color="purple"
                  size="64"
                  class="mb-4"
                />
                <h4 class="text-h6">Analyzing color contrast...</h4>
                <p class="text-body-2">This may take a moment</p>
              </v-card-text>
            </v-card>

            <!-- Results Display -->
            <v-expand-transition>
              <div v-if="results && !loading">
                <!-- Summary Stats -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="bg-purple-lighten-5">
                    <v-icon icon="mdi-chart-box" class="mr-2" />
                    Analysis Results
                  </v-card-title>
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" sm="6" md="3">
                        <v-card :color="results.passed ? 'green-lighten-5' : 'red-lighten-5'" class="pa-4">
                          <div class="text-center">
                            <v-icon 
                              :icon="results.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" 
                              :color="results.passed ? 'green' : 'red'"
                              size="x-large"
                            />
                            <h3 class="text-h6 mt-2">{{ results.passed ? 'Passed' : 'Failed' }}</h3>
                            <p class="text-caption">Overall Status</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="orange-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-alert" color="orange" size="x-large" />
                            <h3 class="text-h3">{{ results.total_issues }}</h3>
                            <p class="text-caption">Total Issues</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="blue-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-file-document" color="blue" size="x-large" />
                            <h3 class="text-h3">{{ results.violations?.length || 0 }}</h3>
                            <p class="text-caption">Violations Found</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="purple-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-eye" color="purple" size="x-large" />
                            <h3 class="text-h6 mt-2">WCAG 2.1</h3>
                            <p class="text-caption">Standard</p>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Violations List -->
                <v-card v-if="results.violations?.length > 0" variant="outlined" class="mb-4">
                  <v-card-title class="bg-red-lighten-5">
                    <v-icon icon="mdi-alert-circle" class="mr-2" />
                    Color Contrast Issues ({{ results.violations.length }})
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="(violation, index) in results.violations"
                        :key="index"
                      >
                        <v-expansion-panel-title>
                          <div class="d-flex align-center gap-3">
                            <v-chip 
                              :color="getImpactColor(violation.impact)" 
                              size="small"
                            >
                              {{ violation.impact }}
                            </v-chip>
                            <span class="font-weight-medium">{{ violation.description }}</span>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="pa-2">
                            <p class="text-body-2 mb-3">{{ violation.help }}</p>
                            
                            <v-card variant="outlined" class="mb-3">
                              <v-card-text>
                                <strong>HTML Element:</strong>
                                <pre class="mt-2 pa-2 bg-grey-lighten-4 rounded">{{ violation.element?.html }}</pre>
                              </v-card-text>
                            </v-card>

                            <v-alert type="info" variant="tonal" density="compact">
                              {{ violation.failure_summary }}
                            </v-alert>

                            <v-btn
                              :href="violation.help_url"
                              target="_blank"
                              color="purple"
                              variant="text"
                              size="small"
                              class="mt-2"
                            >
                              Learn More
                              <v-icon icon="mdi-open-in-new" end />
                            </v-btn>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card-text>
                </v-card>

                <!-- Action Buttons -->
                <v-card variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="d-flex flex-wrap gap-2">
                      <v-btn
                        v-if="results.marked_html"
                        color="green"
                        prepend-icon="mdi-eye"
                        @click="showMarkedHtml"
                      >
                        View Marked HTML
                      </v-btn>
                      <v-btn
                        v-if="results.marked_html"
                        color="blue"
                        prepend-icon="mdi-download"
                        @click="downloadMarkedHtml"
                      >
                        Download Report
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

    <!-- Marked HTML Dialog -->
    <v-dialog v-model="showingMarkedHtml" fullscreen>
      <v-card>
        <v-toolbar color="purple">
          <v-toolbar-title>Marked HTML Preview</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showingMarkedHtml = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-alert type="warning" variant="tonal" class="ma-4">
            🔴 Red outlines indicate contrast issues. Hover over them to see details.
          </v-alert>
          <iframe
            v-if="results?.marked_html"
            :srcdoc="results.marked_html"
            frameborder="0"
            style="width: 100%; height: calc(100vh - 140px);"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const route = useRoute()
const router = useRouter()

const API_BASE_URL = 'http://localhost:8000'

// Get saved input from sessionStorage
const inputType = ref('')
const inputUrl = ref('')
const inputFileName = ref('')
const inputFileContent = ref('')

const loading = ref(false)
const error = ref(null)
const results = ref(null)
const showingMarkedHtml = ref(false)

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
    const response = await fetch(`${API_BASE_URL}/colorsense/examine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: inputUrl.value,
        add_markers: true
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    results.value = await response.json()
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
    formData.append('add_markers', 'true')

    const response = await fetch(`${API_BASE_URL}/colorsense/examinehtml/`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    results.value = await response.json()
  } catch (err) {
    error.value = `Failed to connect to AI service: ${err.message}. Please ensure the backend API is running on ${API_BASE_URL}`
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}

const getImpactColor = (impact) => {
  const colors = {
    critical: 'red',
    serious: 'orange',
    moderate: 'yellow-darken-2',
    minor: 'blue'
  }
  return colors[impact] || 'grey'
}

const showMarkedHtml = () => {
  showingMarkedHtml.value = true
}

const downloadMarkedHtml = () => {
  if (!results.value?.marked_html) return

  const blob = new Blob([results.value.marked_html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'chromacheck_report.html'
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
