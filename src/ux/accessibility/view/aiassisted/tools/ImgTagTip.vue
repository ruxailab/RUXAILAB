<template>
  <PageWrapper
    title="ImgTagTip - AI Alt Text Generator"
    subtitle="AI-powered alternative text suggestions for images"
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
                <v-icon icon="mdi-image-text" size="80" color="green" class="mb-4" />
                <h3 class="text-h5 mb-3">Ready to Generate Alt Text Suggestions</h3>
                <p class="text-body-1 mb-6">
                  ImgTagTip will analyze images in your {{ inputType === 'url' ? 'webpage' : 'HTML file' }} and provide AI-generated alt text suggestions
                </p>
                <v-btn
                  color="green"
                  size="x-large"
                  prepend-icon="mdi-play"
                  @click="startAnalysis"
                >
                  Start ImgTagTip Analysis
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
                  color="green"
                  size="64"
                  class="mb-4"
                />
                <h4 class="text-h6">Analyzing images and generating alt text suggestions...</h4>
                <p class="text-body-2">This may take a moment</p>
              </v-card-text>
            </v-card>

            <!-- Results Display -->
            <v-expand-transition>
              <div v-if="results && !loading">
                <!-- Summary Stats -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="bg-green-lighten-5">
                    <v-icon icon="mdi-chart-box" class="mr-2" />
                    Analysis Results
                  </v-card-title>
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <v-card color="blue-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-image" color="blue" size="x-large" />
                            <h3 class="text-h3">{{ results.total_images || 0 }}</h3>
                            <p class="text-caption">Total Images</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-card color="red-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-alert" color="red" size="x-large" />
                            <h3 class="text-h3">{{ results.missing_alt || 0 }}</h3>
                            <p class="text-caption">Missing Alt Text</p>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-card color="green-lighten-5" class="pa-4">
                          <div class="text-center">
                            <v-icon icon="mdi-check-circle" color="green" size="x-large" />
                            <h3 class="text-h3">{{ results.has_alt || 0 }}</h3>
                            <p class="text-caption">Has Alt Text</p>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Images with Issues -->
                <v-card v-if="results.images?.length > 0" variant="outlined" class="mb-4">
                  <v-card-title class="bg-orange-lighten-5">
                    <v-icon icon="mdi-image-alert" class="mr-2" />
                    Images Requiring Alt Text ({{ results.images.length }})
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-row>
                      <v-col
                        v-for="(image, index) in results.images"
                        :key="index"
                        cols="12"
                        md="6"
                      >
                        <v-card variant="outlined" class="mb-3">
                          <v-card-text>
                            <div class="d-flex gap-3">
                              <div v-if="image.src" class="flex-shrink-0">
                                <v-img
                                  :src="image.src"
                                  width="120"
                                  height="120"
                                  cover
                                  class="rounded"
                                >
                                  <template #error>
                                    <v-icon icon="mdi-image-broken" size="large" />
                                  </template>
                                </v-img>
                              </div>
                              <div class="flex-grow-1">
                                <div class="mb-2">
                                  <v-chip
                                    :color="image.has_alt ? 'green' : 'red'"
                                    size="small"
                                    class="mr-2"
                                  >
                                    {{ image.has_alt ? 'Has Alt' : 'Missing Alt' }}
                                  </v-chip>
                                </div>
                                
                                <div class="mb-2">
                                  <strong>Current Alt:</strong>
                                  <p class="text-body-2">
                                    {{ image.current_alt || '(empty)' }}
                                  </p>
                                </div>

                                <v-divider class="my-2" />

                                <div class="mb-2">
                                  <div class="d-flex align-center mb-1">
                                    <v-icon icon="mdi-brain" size="small" color="green" class="mr-1" />
                                    <strong>AI Suggestion:</strong>
                                  </div>
                                  <v-card color="green-lighten-5" variant="flat" class="pa-2">
                                    <p class="text-body-2">
                                      {{ image.suggested_alt || 'No suggestion available' }}
                                    </p>
                                  </v-card>
                                </div>

                                <v-text-field
                                  v-if="image.src"
                                  :model-value="image.src"
                                  label="Image Source"
                                  density="compact"
                                  readonly
                                  variant="outlined"
                                  class="mt-2"
                                />
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Action Buttons -->
                <v-card variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="d-flex flex-wrap gap-2">
                      <v-btn
                        color="green"
                        prepend-icon="mdi-download"
                        @click="downloadReport"
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

const API_BASE_URL = 'http://localhost:8000'

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
    const response = await fetch(`${API_BASE_URL}/imgtagtip/analyze-url`, {
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

    results.value = await response.json()
    
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

    const response = await fetch(`${API_BASE_URL}/imgtagtip/analyze-file`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    results.value = await response.json()
    
    // Save results to Firebase
    await saveResultsToFirebase(results.value)
  } catch (err) {
    error.value = `Failed to connect to AI service: ${err.message}. Please ensure the backend API is running on ${API_BASE_URL}`
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}

const saveResultsToFirebase = async (imgTipData) => {
  if (!imgTipData || saving.value) return

  saving.value = true
  try {
    await store.dispatch('aiAssistedResults/saveImgTipResult', {
      testId: testId.value,
      imgTipData: imgTipData
    })
    
    console.log('ImgTagTip results saved to Firebase')
    
    // Show success toast
    store.commit('SET_TOAST', {
      message: 'ImgTagTip analysis saved successfully',
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
  if (!results.value) return

  const reportData = {
    analysis_date: new Date().toISOString(),
    total_images: results.value.total_images,
    missing_alt: results.value.missing_alt,
    has_alt: results.value.has_alt,
    images: results.value.images
  }

  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'imgtagtip_report.json'
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
.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}
</style>
