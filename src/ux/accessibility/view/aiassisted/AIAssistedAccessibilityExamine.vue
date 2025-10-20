<template>
  <PageWrapper
    title="AI-Assisted Examination"
    subtitle="Step 1: Provide your webpage or HTML file for analysis"
  >
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <!-- Loading State -->
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="purple" size="64" class="mb-4" />
          <p>Checking for existing analysis...</p>
        </div>

        <v-card v-else>
          <v-card-text class="pa-6">
            <!-- Alert for Existing Input -->
            <v-alert 
              v-if="hasAnyCompletedTools" 
              type="info" 
              variant="tonal" 
              class="mb-4"
              prominent
            >
              <v-icon icon="mdi-information" class="mr-2" />
              <strong>Existing Input Detected:</strong>
              An analysis has already been performed using 
              <span v-if="savedInputType === 'url'">URL: <strong>{{ savedUrl }}</strong></span>
              <span v-else>File: <strong>{{ savedFileName }}</strong></span>
              <br>
              <small>You can continue with additional tools below, or change the input if needed.</small>
            </v-alert>

            <!-- Step 1: Input Method Selection - Show only if no tools completed -->
            <v-card v-if="!hasAnyCompletedTools" variant="outlined" class="mb-4">
              <v-card-title class="bg-purple-lighten-5">
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
                      @click="selectInputMethod('url')"
                      class="input-card"
                    >
                      <v-card-text class="text-center pa-6">
                        <v-icon icon="mdi-web" size="x-large" color="purple" />
                        <h4 class="text-h6 mt-3">Webpage URL</h4>
                        <p class="text-body-2">Analyze a live website</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card 
                      :class="{ 'selected-input': inputMethod === 'file' }" 
                      variant="outlined"
                      hover
                      @click="selectInputMethod('file')"
                      class="input-card"
                    >
                      <v-card-text class="text-center pa-6">
                        <v-icon icon="mdi-file-code" size="x-large" color="purple" />
                        <h4 class="text-h6 mt-3">HTML File</h4>
                        <p class="text-body-2">Upload an HTML file</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- URL Input -->
                <v-expand-transition>
                  <div v-if="inputMethod === 'url'" class="mt-6">
                    <v-text-field
                      v-model="urlInput"
                      label="Enter Website URL"
                      placeholder="https://example.com"
                      variant="outlined"
                      prepend-inner-icon="mdi-link"
                      :rules="[v => !!v || 'URL is required']"
                      @keyup.enter="saveInputAndProceed"
                    />
                  </div>
                </v-expand-transition>

                <!-- File Input -->
                <v-expand-transition>
                  <div v-if="inputMethod === 'file'" class="mt-6">
                    <v-file-input
                      v-model="selectedFile"
                      label="Upload HTML File"
                      accept=".html,.htm"
                      variant="outlined"
                      prepend-icon="mdi-paperclip"
                      :rules="[v => !!v || 'File is required']"
                      @update:model-value="handleFileChange"
                    />
                    <v-alert v-if="fileContent" type="success" variant="tonal" density="compact" class="mt-2">
                      File loaded: {{ selectedFile?.[0]?.name || selectedFile?.name }} ({{ fileSize }})
                    </v-alert>
                  </div>
                </v-expand-transition>

                <div v-if="inputMethod" class="text-center mt-6">
                  <v-btn
                    color="purple"
                    size="large"
                    :disabled="!canProceed"
                    prepend-icon="mdi-arrow-right"
                    @click="saveInputAndProceed"
                  >
                    Continue to Tool Selection
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Step 2: Tool Selection - Show when input is provided OR when tools have been completed -->
            <v-card v-if="inputProvided || hasAnyCompletedTools" variant="outlined" class="mb-4">
              <v-card-title class="bg-green-lighten-5">
                <v-icon icon="mdi-numeric-2-circle" class="mr-2" />
                Select Analysis Tool
              </v-card-title>
                <v-card-text class="pa-6">
                  <!-- All Tools Completed Alert -->
                  <v-alert v-if="allToolsCompleted" type="success" variant="tonal" class="mb-4" prominent>
                    <v-icon icon="mdi-check-all" class="mr-2" />
                    <strong>All tools completed!</strong> You can view the results or change the input to analyze a different source.
                  </v-alert>

                  <h4 class="text-h6 mb-4 text-center">Choose an AI-powered tool to analyze your input</h4>
                  
                  <v-row>
                    <!-- ChromaCheck Tool -->
                    <v-col cols="12" md="4">
                      <v-card 
                        :class="['tool-card', { 'tool-disabled': completedTools.chroma }]" 
                        :color="completedTools.chroma ? 'grey-lighten-3' : 'purple-lighten-5'" 
                        hover
                        :disabled="completedTools.chroma"
                        @click="navigateToTool('chroma')"
                      >
                        <v-card-text class="text-center pa-6">
                          <v-avatar size="80" :color="completedTools.chroma ? 'grey' : 'purple'" class="mb-4">
                            <v-icon 
                              :icon="completedTools.chroma ? 'mdi-check-circle' : 'mdi-palette'" 
                              size="x-large" 
                              color="white" 
                            />
                          </v-avatar>
                          <h4 class="text-h6 mb-2">ChromaCheck</h4>
                          <p class="text-body-2 mb-3">
                            Detect and analyze color contrast issues to ensure WCAG compliance
                          </p>
                          <v-chip 
                            :color="completedTools.chroma ? 'green' : 'purple'" 
                            variant="tonal" 
                            size="small"
                          >
                            {{ completedTools.chroma ? '✓ Completed' : 'Color Contrast' }}
                          </v-chip>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-4">
                          <v-btn 
                            :color="completedTools.chroma ? 'grey' : 'purple'" 
                            variant="elevated"
                            :prepend-icon="completedTools.chroma ? 'mdi-check' : 'mdi-arrow-right'"
                            :disabled="completedTools.chroma"
                          >
                            {{ completedTools.chroma ? 'Completed' : 'Analyze' }}
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>

                    <!-- AnchorSense Tool -->
                    <v-col cols="12" md="4">
                      <v-card 
                        :class="['tool-card', { 'tool-disabled': completedTools.anchorsense }]" 
                        :color="completedTools.anchorsense ? 'grey-lighten-3' : 'blue-lighten-5'" 
                        hover
                        :disabled="completedTools.anchorsense"
                        @click="navigateToTool('anchorsense')"
                      >
                        <v-card-text class="text-center pa-6">
                          <v-avatar size="80" :color="completedTools.anchorsense ? 'grey' : 'blue'" class="mb-4">
                            <v-icon 
                              :icon="completedTools.anchorsense ? 'mdi-check-circle' : 'mdi-link-variant'" 
                              size="x-large" 
                              color="white" 
                            />
                          </v-avatar>
                          <h4 class="text-h6 mb-2">AnchorSense</h4>
                          <p class="text-body-2 mb-3">
                            AI-powered analysis of anchor tags with intelligent fix suggestions
                          </p>
                          <v-chip 
                            :color="completedTools.anchorsense ? 'green' : 'blue'" 
                            variant="tonal" 
                            size="small"
                          >
                            {{ completedTools.anchorsense ? '✓ Completed' : 'Link Analysis' }}
                          </v-chip>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-4">
                          <v-btn 
                            :color="completedTools.anchorsense ? 'grey' : 'blue'" 
                            variant="elevated"
                            :prepend-icon="completedTools.anchorsense ? 'mdi-check' : 'mdi-arrow-right'"
                            :disabled="completedTools.anchorsense"
                          >
                            {{ completedTools.anchorsense ? 'Completed' : 'Analyze' }}
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>

                    <!-- ImgTagTip Tool -->
                    <v-col cols="12" md="4">
                      <v-card 
                        :class="['tool-card', { 'tool-disabled': completedTools.imgtip }]" 
                        :color="completedTools.imgtip ? 'grey-lighten-3' : 'green-lighten-5'" 
                        hover
                        :disabled="completedTools.imgtip"
                        @click="navigateToTool('imgtip')"
                      >
                        <v-card-text class="text-center pa-6">
                          <v-avatar size="80" :color="completedTools.imgtip ? 'grey' : 'green'" class="mb-4">
                            <v-icon 
                              :icon="completedTools.imgtip ? 'mdi-check-circle' : 'mdi-image-text'" 
                              size="x-large" 
                              color="white" 
                            />
                          </v-avatar>
                          <h4 class="text-h6 mb-2">ImgTagTip</h4>
                          <p class="text-body-2 mb-3">
                            AI-generated alt text suggestions for images to improve screen reader support
                          </p>
                          <v-chip 
                            :color="completedTools.imgtip ? 'green' : 'green'" 
                            variant="tonal" 
                            size="small"
                          >
                            {{ completedTools.imgtip ? '✓ Completed' : 'Image Alt Text' }}
                          </v-chip>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-4">
                          <v-btn 
                            :color="completedTools.imgtip ? 'grey' : 'green'" 
                            variant="elevated"
                            :prepend-icon="completedTools.imgtip ? 'mdi-check' : 'mdi-arrow-right'"
                            :disabled="completedTools.imgtip"
                          >
                            {{ completedTools.imgtip ? 'Completed' : 'Analyze' }}
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>

                  <div class="text-center mt-4">
                    <v-btn
                      v-if="hasAnyCompletedTools"
                      color="purple"
                      variant="elevated"
                      size="large"
                      prepend-icon="mdi-chart-box"
                      class="mr-2"
                      @click="goToResults"
                    >
                      View Results
                    </v-btn>
                    <v-btn
                      color="grey"
                      variant="text"
                      prepend-icon="mdi-refresh"
                      @click="resetInput"
                    >
                      Change Input
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

            <v-divider class="my-6" />

            <div class="text-center">
              <v-btn 
                color="grey" 
                variant="outlined" 
                prepend-icon="mdi-arrow-left" 
                @click="goBack"
              >
                Back to Home
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </PageWrapper>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const testId = computed(() => route.params.id)

// Step 1: Input data
const inputMethod = ref('')
const urlInput = ref('')
const selectedFile = ref(null)
const fileContent = ref('')

// Step 2: Saved input for tool selection
const inputProvided = ref(false)
const savedInputType = ref('')
const savedUrl = ref('')
const savedFileName = ref('')
const savedFileContent = ref('')

const loading = ref(true)

// Track which tools have been completed
const completedTools = ref({
  chroma: false,
  anchorsense: false,
  imgtip: false
})

const canProceed = computed(() => {
  if (inputMethod.value === 'url') return urlInput.value.trim() !== ''
  if (inputMethod.value === 'file') return selectedFile.value && fileContent.value
  return false
})

const fileSize = computed(() => {
  if (!selectedFile.value) return ''
  const bytes = selectedFile.value.size
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
})

const hasAnyCompletedTools = computed(() => {
  return completedTools.value.chroma || completedTools.value.anchorsense || completedTools.value.imgtip
})

const allToolsCompleted = computed(() => {
  return completedTools.value.chroma && completedTools.value.anchorsense && completedTools.value.imgtip
})

// Load existing input data from Firebase on mount
onMounted(async () => {
  loading.value = true
  try {
    // Try to load existing result from Firebase
    await store.dispatch('aiAssistedResults/loadResult', testId.value)
    const existingResult = store.getters['aiAssistedResults/currentResult']
    
    // If any tool has been completed, use the existing input source
    if (existingResult && existingResult.toolsCompleted && existingResult.toolsCompleted.length > 0) {
      console.log('Found existing analysis with input source, loading...')
      
      // Track which tools have been completed
      completedTools.value = {
        chroma: existingResult.toolsCompleted.includes('chroma_check'),
        anchorsense: existingResult.toolsCompleted.includes('anchor_sense'),
        imgtip: existingResult.toolsCompleted.includes('img_tip')
      }
      
      // Set the input method and data
      if (existingResult.inputType === 'url' && existingResult.url) {
        inputMethod.value = 'url'
        urlInput.value = existingResult.url
        savedInputType.value = 'url'
        savedUrl.value = existingResult.url
        
        // Store in sessionStorage for tools to access
        sessionStorage.setItem('ai_examine_input_type', 'url')
        sessionStorage.setItem('ai_examine_url', existingResult.url)
        
        // Auto-proceed to step 2
        inputProvided.value = true
        
        console.log('Loaded existing URL input:', existingResult.url)
      } else if (existingResult.inputType === 'file' && existingResult.sourceFileName) {
        inputMethod.value = 'file'
        savedInputType.value = 'file'
        savedFileName.value = existingResult.sourceFileName
        
        // Try to download the file content from Firebase Storage
        try {
          if (existingResult.sourceFile) {
            const { storage } = await import('@/app/plugins/firebase')
            const { ref: storageRef, getDownloadURL } = await import('firebase/storage')
            
            // Get download URL
            const fileRef = storageRef(storage, existingResult.sourceFile)
            const downloadUrl = await getDownloadURL(fileRef)
            
            // Fetch the file content
            const response = await fetch(downloadUrl)
            const content = await response.text()
            
            savedFileContent.value = content
            
            // Store in sessionStorage for tools to access
            sessionStorage.setItem('ai_examine_input_type', 'file')
            sessionStorage.setItem('ai_examine_file_name', existingResult.sourceFileName)
            sessionStorage.setItem('ai_examine_file_content', content)
            
            console.log('Downloaded existing file content from storage')
          } else {
            // Fallback if no storage reference
            sessionStorage.setItem('ai_examine_input_type', 'file')
            sessionStorage.setItem('ai_examine_file_name', existingResult.sourceFileName)
          }
        } catch (downloadError) {
          console.error('Error downloading file from storage:', downloadError)
          // Continue without file content - tools can still work with the reference
          sessionStorage.setItem('ai_examine_input_type', 'file')
          sessionStorage.setItem('ai_examine_file_name', existingResult.sourceFileName)
        }
        
        // Auto-proceed to step 2
        inputProvided.value = true
        
        console.log('Loaded existing file input:', existingResult.sourceFileName)
      }
    } else {
      console.log('No existing analysis found, starting fresh')
    }
  } catch (error) {
    console.error('Error loading existing result:', error)
    // Continue normally if there's an error
  } finally {
    loading.value = false
  }
})

const selectInputMethod = (method) => {
  inputMethod.value = method
  inputProvided.value = false
}

const handleFileChange = async (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      fileContent.value = e.target.result
    }
    reader.readAsText(file)
  } else {
    fileContent.value = ''
  }
}

const saveInputAndProceed = () => {
  if (!canProceed.value) return

  // Save the input data
  savedInputType.value = inputMethod.value
  
  if (inputMethod.value === 'url') {
    savedUrl.value = urlInput.value
  } else if (inputMethod.value === 'file') {
    savedFileName.value = selectedFile.value.name
    savedFileContent.value = fileContent.value
  }

  // Store in sessionStorage for tools to access
  sessionStorage.setItem('ai_examine_input_type', savedInputType.value)
  if (savedInputType.value === 'url') {
    sessionStorage.setItem('ai_examine_url', savedUrl.value)
  } else {
    sessionStorage.setItem('ai_examine_file_name', savedFileName.value)
    sessionStorage.setItem('ai_examine_file_content', savedFileContent.value)
  }

  inputProvided.value = true
}

const resetInput = () => {
  inputMethod.value = ''
  urlInput.value = ''
  selectedFile.value = null
  fileContent.value = ''
  inputProvided.value = false
  savedInputType.value = ''
  savedUrl.value = ''
  savedFileName.value = ''
  savedFileContent.value = ''
  
  // Clear sessionStorage
  sessionStorage.removeItem('ai_examine_input_type')
  sessionStorage.removeItem('ai_examine_url')
  sessionStorage.removeItem('ai_examine_file_name')
  sessionStorage.removeItem('ai_examine_file_content')
}

const navigateToTool = (tool) => {
  if (!inputProvided.value) return
  
  // Check if tool is already completed
  if (completedTools.value[tool]) {
    console.log(`Tool ${tool} already completed`)
    return
  }
  
  router.push({
    name: `AIAssistedAccessibilityExamine${tool.charAt(0).toUpperCase() + tool.slice(1)}`,
    params: { id: testId.value }
  })
}

const goBack = () => {
  resetInput()
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } })
}

const goToResults = () => {
  router.push({ name: 'AIAssistedAccessibilityAnswers', params: { id: testId.value } })
}
</script>

<style scoped>
.input-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.input-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.selected-input {
  border: 2px solid rgb(var(--v-theme-purple)) !important;
  background-color: rgba(156, 39, 176, 0.08);
}

.tool-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.tool-card.tool-disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.tool-card.tool-disabled:hover {
  transform: none;
  box-shadow: none !important;
}
</style>