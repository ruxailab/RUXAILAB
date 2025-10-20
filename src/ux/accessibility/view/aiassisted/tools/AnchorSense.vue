<template>
  <PageWrapper
    title="AnchorSense - Link Accessibility Analyzer"
    subtitle="AI-powered anchor tag analysis with intelligent fix suggestions"
  >
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text class="pa-6">
            <!-- Step 1: Input Method Selection -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="bg-blue-lighten-5">
                <v-icon icon="mdi-numeric-1-circle" class="mr-2" />
                Step 1: Choose Input Method
              </v-card-title>
              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card 
                      :class="{ 'selected-input': inputMethod === 'url' }" 
                      variant="outlined"
                      hover
                      @click="inputMethod = 'url'"
                      class="input-card"
                    >
                      <v-card-text class="text-center pa-4">
                        <v-icon icon="mdi-web" size="x-large" color="blue" />
                        <h4 class="text-h6 mt-2">Webpage URL</h4>
                        <p class="text-caption">Enter a website URL to analyze</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card 
                      :class="{ 'selected-input': inputMethod === 'file' }" 
                      variant="outlined"
                      hover
                      @click="inputMethod = 'file'"
                      class="input-card"
                    >
                      <v-card-text class="text-center pa-4">
                        <v-icon icon="mdi-file-code" size="x-large" color="blue" />
                        <h4 class="text-h6 mt-2">HTML File</h4>
                        <p class="text-caption">Upload an HTML file</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- URL Input -->
                <v-expand-transition>
                  <div v-if="inputMethod === 'url'" class="mt-4">
                    <v-text-field
                      v-model="urlInput"
                      label="Enter Website URL"
                      placeholder="https://example.com"
                      variant="outlined"
                      prepend-inner-icon="mdi-link"
                      @keyup.enter="startAnalysis"
                    />
                  </div>
                </v-expand-transition>

                <!-- File Input -->
                <v-expand-transition>
                  <div v-if="inputMethod === 'file'" class="mt-4">
                    <v-file-input
                      v-model="selectedFile"
                      label="Upload HTML File"
                      accept=".html,.htm"
                      variant="outlined"
                      prepend-icon="mdi-paperclip"
                    />
                  </div>
                </v-expand-transition>

                <div class="text-center mt-4">
                  <v-btn
                    color="blue"
                    size="large"
                    :loading="loading"
                    :disabled="!canAnalyze"
                    prepend-icon="mdi-play"
                    @click="startAnalysis"
                  >
                    Start Analysis
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

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

            <!-- Error Display -->
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
              <strong>Error:</strong> {{ error }}
            </v-alert>

            <!-- Results (Demo) -->
            <v-expand-transition>
              <div v-if="showResults && !loading">
                <!-- Summary -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="bg-blue-lighten-5">
                    <v-icon icon="mdi-chart-box" class="mr-2" />
                    Analysis Results
                  </v-card-title>
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="blue-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-link-variant" color="blue" size="x-large" />
                            <h3 class="text-h3">{{ demoResults.totalLinks }}</h3>
                            <p class="text-caption">Total Links</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="orange-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-alert" color="orange" size="x-large" />
                            <h3 class="text-h3">{{ demoResults.issuesFound }}</h3>
                            <p class="text-caption">Issues Found</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="green-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-check-circle" color="green" size="x-large" />
                            <h3 class="text-h3">{{ demoResults.aiSuggestions }}</h3>
                            <p class="text-caption">AI Suggestions</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <v-card color="purple-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-auto-fix" color="purple" size="x-large" />
                            <h3 class="text-h3">{{ demoResults.autoFixable }}</h3>
                            <p class="text-caption">Auto-Fixable</p>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Issues List -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="bg-orange-lighten-5">
                    <v-icon icon="mdi-alert-circle" class="mr-2" />
                    Anchor Tag Issues ({{ demoResults.issues.length }})
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="(issue, index) in demoResults.issues"
                        :key="index"
                      >
                        <v-expansion-panel-title>
                          <div class="d-flex align-center gap-3">
                            <v-chip :color="issue.severity" size="small">
                              {{ issue.severity }}
                            </v-chip>
                            <span class="font-weight-medium">{{ issue.type }}</span>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="pa-2">
                            <p class="text-body-2 mb-3">{{ issue.description }}</p>
                            
                            <v-card variant="outlined" class="mb-3">
                              <v-card-text>
                                <strong>Current HTML:</strong>
                                <pre class="mt-2 pa-2 bg-grey-lighten-4 rounded">{{ issue.html }}</pre>
                              </v-card-text>
                            </v-card>

                            <v-card color="green-lighten-5" variant="outlined" class="mb-3">
                              <v-card-text>
                                <div class="d-flex align-center mb-2">
                                  <v-icon icon="mdi-robot" color="green" class="mr-2" />
                                  <strong>AI Suggestion:</strong>
                                </div>
                                <p class="text-body-2">{{ issue.aiSuggestion }}</p>
                                <pre class="mt-2 pa-2 bg-white rounded">{{ issue.suggestedFix }}</pre>
                              </v-card-text>
                            </v-card>

                            <div class="d-flex gap-2">
                              <v-btn color="green" size="small" prepend-icon="mdi-check">
                                Apply Fix
                              </v-btn>
                              <v-btn color="grey" size="small" variant="outlined">
                                Ignore
                              </v-btn>
                            </div>
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
                      <v-btn color="green" prepend-icon="mdi-download">
                        Export Report
                      </v-btn>
                      <v-btn color="blue" prepend-icon="mdi-code-tags">
                        Generate Fixed HTML
                      </v-btn>
                      <v-btn color="grey" variant="outlined" prepend-icon="mdi-refresh" @click="resetAnalysis">
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

// Get saved input from sessionStorage
const inputType = ref('')
const inputUrl = ref('')
const inputFileName = ref('')
const inputFileContent = ref('')

const inputMethod = ref('url')
const urlInput = ref('')
const selectedFile = ref(null)
const loading = ref(false)
const error = ref(null)
const showResults = ref(false)
const saving = ref(false)

const testId = computed(() => route.params.id)

// Load saved input on mount
onMounted(() => {
  inputType.value = sessionStorage.getItem('ai_examine_input_type') || ''
  
  if (inputType.value === 'url') {
    inputUrl.value = sessionStorage.getItem('ai_examine_url') || ''
    urlInput.value = inputUrl.value
    inputMethod.value = 'url'
  } else if (inputType.value === 'file') {
    inputFileName.value = sessionStorage.getItem('ai_examine_file_name') || ''
    inputFileContent.value = sessionStorage.getItem('ai_examine_file_content') || ''
    inputMethod.value = 'file'
  }

  // Redirect back if no input provided
  if (!inputType.value) {
    router.push({
      name: 'AIAssistedAccessibilityExamine',
      params: { id: testId.value }
    })
  }
})

const canAnalyze = computed(() => {
  if (inputMethod.value === 'url') return urlInput.value.trim() !== ''
  if (inputMethod.value === 'file') return selectedFile.value !== null
  return false
})

// Demo results
const demoResults = ref({
  totalLinks: 24,
  issuesFound: 5,
  aiSuggestions: 5,
  autoFixable: 3,
  issues: [
    {
      type: 'Missing aria-label',
      severity: 'orange',
      description: 'Link has no descriptive text or aria-label for screen readers',
      html: '<a href="/products"><i class="icon-cart"></i></a>',
      aiSuggestion: 'Add an aria-label attribute to describe the link purpose',
      suggestedFix: '<a href="/products" aria-label="View shopping cart"><i class="icon-cart"></i></a>'
    },
    {
      type: 'Non-descriptive link text',
      severity: 'yellow',
      description: 'Link text "click here" is not descriptive',
      html: '<a href="/about">Click here</a>',
      aiSuggestion: 'Replace generic text with descriptive content about the destination',
      suggestedFix: '<a href="/about">Learn more about our company</a>'
    },
    {
      type: 'Empty link',
      severity: 'red',
      description: 'Link has no content and no aria-label',
      html: '<a href="/search"></a>',
      aiSuggestion: 'Add descriptive text or icon with aria-label',
      suggestedFix: '<a href="/search" aria-label="Search"><i class="icon-search"></i></a>'
    }
  ]
})

const startAnalysis = async () => {
  if (!canAnalyze.value) return

  loading.value = true
  error.value = null
  showResults.value = false

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))

  loading.value = false
  showResults.value = true
  
  // Save results to Firebase after demo analysis
  await saveResultsToFirebase(demoResults.value)
}

const saveResultsToFirebase = async (anchorData) => {
  if (!anchorData || saving.value) return

  saving.value = true
  try {
    await store.dispatch('aiAssistedResults/saveAnchorSenseResult', {
      testId: testId.value,
      anchorData: {
        issues: anchorData.issues,
        total_issues: anchorData.issuesFound,
        passed: anchorData.issuesFound === 0
      }
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

const resetAnalysis = () => {
  urlInput.value = ''
  selectedFile.value = null
  showResults.value = false
  error.value = null
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

const goBack = () => {
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
