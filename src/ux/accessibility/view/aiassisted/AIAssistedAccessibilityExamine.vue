<template>
  <PageWrapper
    title="AI-Assisted Examination"
    subtitle="Step 1: Provide your webpage or HTML file for analysis"
  >
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card>
          <v-card-text class="pa-6">
            <!-- Step 1: Input Method Selection -->
            <v-card variant="outlined" class="mb-4">
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

            <!-- Step 2: Tool Selection (Only shows after input is provided) -->
            <v-expand-transition>
              <v-card v-if="inputProvided" variant="outlined" class="mb-4">
                <v-card-title class="bg-green-lighten-5">
                  <v-icon icon="mdi-numeric-2-circle" class="mr-2" />
                  Step 2: Select Analysis Tool
                </v-card-title>
                <v-card-text class="pa-6">
                  <v-alert type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-information" class="mr-2" />
                      <div>
                        <strong>Input saved:</strong>
                        <span v-if="savedInputType === 'url'"> {{ savedUrl }}</span>
                        <span v-else> {{ savedFileName }}</span>
                      </div>
                    </div>
                  </v-alert>

                  <h4 class="text-h6 mb-4 text-center">Choose an AI-powered tool to analyze your input</h4>
                  
                  <v-row>
                    <!-- ChromaCheck Tool -->
                    <v-col cols="12" md="4">
                      <v-card 
                        class="tool-card" 
                        color="purple-lighten-5" 
                        hover
                        @click="navigateToTool('chroma')"
                      >
                        <v-card-text class="text-center pa-6">
                          <v-avatar size="80" color="purple" class="mb-4">
                            <v-icon icon="mdi-palette" size="x-large" color="white" />
                          </v-avatar>
                          <h4 class="text-h6 mb-2">ChromaCheck</h4>
                          <p class="text-body-2 mb-3">
                            Detect and analyze color contrast issues to ensure WCAG compliance
                          </p>
                          <v-chip color="purple" variant="tonal" size="small">
                            Color Contrast
                          </v-chip>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-4">
                          <v-btn 
                            color="purple" 
                            variant="elevated"
                            prepend-icon="mdi-arrow-right"
                          >
                            Analyze
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>

                    <!-- AnchorSense Tool -->
                    <v-col cols="12" md="4">
                      <v-card 
                        class="tool-card" 
                        color="blue-lighten-5" 
                        hover
                        @click="navigateToTool('anchorsense')"
                      >
                        <v-card-text class="text-center pa-6">
                          <v-avatar size="80" color="blue" class="mb-4">
                            <v-icon icon="mdi-link-variant" size="x-large" color="white" />
                          </v-avatar>
                          <h4 class="text-h6 mb-2">AnchorSense</h4>
                          <p class="text-body-2 mb-3">
                            AI-powered analysis of anchor tags with intelligent fix suggestions
                          </p>
                          <v-chip color="blue" variant="tonal" size="small">
                            Link Analysis
                          </v-chip>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-4">
                          <v-btn 
                            color="blue" 
                            variant="elevated"
                            prepend-icon="mdi-arrow-right"
                          >
                            Analyze
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>

                    <!-- ImgTagTip Tool -->
                    <v-col cols="12" md="4">
                      <v-card 
                        class="tool-card" 
                        color="green-lighten-5" 
                        hover
                        @click="navigateToTool('imgtip')"
                      >
                        <v-card-text class="text-center pa-6">
                          <v-avatar size="80" color="green" class="mb-4">
                            <v-icon icon="mdi-image-text" size="x-large" color="white" />
                          </v-avatar>
                          <h4 class="text-h6 mb-2">ImgTagTip</h4>
                          <p class="text-body-2 mb-3">
                            AI-generated alt text suggestions for images to improve screen reader support
                          </p>
                          <v-chip color="green" variant="tonal" size="small">
                            Image Alt Text
                          </v-chip>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-4">
                          <v-btn 
                            color="green" 
                            variant="elevated"
                            prepend-icon="mdi-arrow-right"
                          >
                            Analyze
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>

                  <div class="text-center mt-4">
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
            </v-expand-transition>

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
import { ref, computed } from 'vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const route = useRoute()
const router = useRouter()

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
  
  router.push({
    name: `AIAssistedAccessibilityExamine${tool.charAt(0).toUpperCase() + tool.slice(1)}`,
    params: { id: testId.value }
  })
}

const goBack = () => {
  resetInput()
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } })
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
</style>