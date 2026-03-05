<template>
  <PageWrapper
    title="AI-Assisted Examination"
    :loading="loading"
    loading-text="Checking for existing analysis..."
  >
    <template #subtitle>
      <p class="page-subtitle">Analyze your webpage for accessibility issues with intelligent AI tools</p>
    </template>

    <div class="apple-content">
      <!-- Existing Input Alert -->
      <div v-if="hasAnyCompletedTools" class="existing-alert">
        <div class="alert-icon">
          <v-icon icon="mdi-information-outline" size="20" />
        </div>
        <div class="alert-content">
          <span class="alert-title">Existing Analysis Found</span>
          <span class="alert-description">
            <span v-if="savedInputType === 'url'">URL: <strong>{{ savedUrl }}</strong></span>
            <span v-else>File: <strong>{{ savedFileName }}</strong></span>
          </span>
        </div>
      </div>

      <!-- Step 1: Input Method Selection -->
      <div v-if="!hasAnyCompletedTools" class="section-card">
        <div class="section-header">
          <span class="step-indicator">1</span>
          <div class="section-title-group">
            <h2 class="section-title">Choose Input Method</h2>
            <p class="section-subtitle">Select how you'd like to provide your content for analysis</p>
          </div>
        </div>

        <div class="input-options">
          <div 
            :class="['input-option', { 'input-option-selected': inputMethod === 'url' }]"
            @click="selectInputMethod('url')"
          >
            <div class="option-icon option-icon-url">
              <v-icon icon="mdi-web" size="24" />
            </div>
            <div class="option-content">
              <h3 class="option-title">Webpage URL</h3>
              <p class="option-description">Analyze a live website by entering its URL</p>
            </div>
            <div class="option-check" v-if="inputMethod === 'url'">
              <v-icon icon="mdi-check" size="16" />
            </div>
          </div>

          <div 
            :class="['input-option', { 'input-option-selected': inputMethod === 'file' }]"
            @click="selectInputMethod('file')"
          >
            <div class="option-icon option-icon-file">
              <v-icon icon="mdi-file-code-outline" size="24" />
            </div>
            <div class="option-content">
              <h3 class="option-title">HTML File</h3>
              <p class="option-description">Upload an HTML file from your computer</p>
            </div>
            <div class="option-check" v-if="inputMethod === 'file'">
              <v-icon icon="mdi-check" size="16" />
            </div>
          </div>
        </div>

        <!-- URL Input -->
        <v-expand-transition>
          <div v-if="inputMethod === 'url'" class="input-field-container">
            <div class="custom-input">
              <v-icon icon="mdi-link-variant" size="20" class="input-icon" />
              <input
                v-model="urlInput"
                type="url"
                placeholder="https://example.com"
                class="url-input"
                @keyup.enter="saveInputAndProceed"
              />
            </div>
          </div>
        </v-expand-transition>

        <!-- File Input -->
        <v-expand-transition>
          <div v-if="inputMethod === 'file'" class="input-field-container">
            <div class="file-drop-zone" @click="triggerFileInput">
              <input
                ref="fileInputRef"
                type="file"
                accept=".html,.htm"
                class="hidden-file-input"
                @change="handleFileInputChange"
              />
              <div class="drop-zone-content">
                <v-icon icon="mdi-cloud-upload-outline" size="32" class="drop-icon" />
                <p class="drop-text">Click to upload or drag and drop</p>
                <p class="drop-hint">HTML files only</p>
              </div>
            </div>
            <div v-if="fileContent" class="file-success">
              <v-icon icon="mdi-check-circle" size="18" class="success-icon" />
              <span>{{ selectedFile?.name }} ({{ fileSize }})</span>
            </div>
          </div>
        </v-expand-transition>

        <div v-if="inputMethod" class="action-container">
          <button
            :class="['primary-btn', { 'btn-disabled': !canProceed }]"
            :disabled="!canProceed"
            @click="saveInputAndProceed"
          >
            <span>Continue</span>
            <v-icon icon="mdi-arrow-right" size="18" />
          </button>
        </div>
      </div>

      <!-- Step 2: Tool Selection -->
      <div v-if="inputProvided || hasAnyCompletedTools" class="section-card">
        <div class="section-header">
          <span class="step-indicator">2</span>
          <div class="section-title-group">
            <h2 class="section-title">Select Analysis Tool</h2>
            <p class="section-subtitle">Choose an AI-powered tool to examine your content</p>
          </div>
        </div>

        <!-- All Tools Completed -->
        <div v-if="allToolsCompleted" class="success-banner">
          <v-icon icon="mdi-check-circle" size="20" />
          <span>All tools completed! View your comprehensive results below.</span>
        </div>

        <div class="tools-grid">
          <!-- ChromaCheck -->
          <div 
            :class="['tool-card', { 'tool-completed': completedTools.chroma }]"
            @click="navigateToTool('chroma')"
          >
            <div class="tool-header">
              <div :class="['tool-icon', completedTools.chroma ? 'tool-icon-completed' : 'tool-icon-purple']">
                <v-icon :icon="completedTools.chroma ? 'mdi-check' : 'mdi-palette'" size="24" />
              </div>
              <span v-if="completedTools.chroma" class="completed-badge">Completed</span>
            </div>
            <h3 class="tool-title">ChromaCheck</h3>
            <p class="tool-description">Analyze color contrast for WCAG compliance</p>
            <div class="tool-tag tool-tag-purple">Color Contrast</div>
          </div>

          <!-- AnchorSense -->
          <div 
            :class="['tool-card', { 'tool-completed': completedTools.anchorsense }]"
            @click="navigateToTool('anchorsense')"
          >
            <div class="tool-header">
              <div :class="['tool-icon', completedTools.anchorsense ? 'tool-icon-completed' : 'tool-icon-blue']">
                <v-icon :icon="completedTools.anchorsense ? 'mdi-check' : 'mdi-link-variant'" size="24" />
              </div>
              <span v-if="completedTools.anchorsense" class="completed-badge">Completed</span>
            </div>
            <h3 class="tool-title">AnchorSense</h3>
            <p class="tool-description">Smart analysis of links with fix suggestions</p>
            <div class="tool-tag tool-tag-blue">Link Analysis</div>
          </div>

          <!-- ImgTagTip -->
          <div 
            :class="['tool-card', { 'tool-completed': completedTools.imgtip }]"
            @click="navigateToTool('imgtip')"
          >
            <div class="tool-header">
              <div :class="['tool-icon', completedTools.imgtip ? 'tool-icon-completed' : 'tool-icon-green']">
                <v-icon :icon="completedTools.imgtip ? 'mdi-check' : 'mdi-image-outline'" size="24" />
              </div>
              <span v-if="completedTools.imgtip" class="completed-badge">Completed</span>
            </div>
            <h3 class="tool-title">ImgTagTip</h3>
            <p class="tool-description">AI-generated alt text for better accessibility</p>
            <div class="tool-tag tool-tag-green">Image Alt Text</div>
          </div>
        </div>

        <div class="tools-actions">
          <button
            v-if="hasAnyCompletedTools"
            class="primary-btn"
            @click="goToResults"
          >
            <v-icon icon="mdi-chart-box-outline" size="18" />
            <span>View Results</span>
          </button>
          <button class="secondary-btn" @click="resetInput">
            <v-icon icon="mdi-refresh" size="18" />
            <span>Change Input</span>
          </button>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="footer-actions">
        <button class="ghost-btn" @click="goBack">
          <v-icon icon="mdi-arrow-left" size="18" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
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
const fileInputRef = ref(null)

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

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileInputChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      fileContent.value = e.target.result
    }
    reader.readAsText(file)
  }
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
/* Apple/Notion Inspired Design System */
.page-subtitle {
  font-size: 15px;
  color: #6b6b6b;
  margin-top: 4px;
  font-weight: 400;
}

.apple-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
}

/* Existing Alert */
.existing-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f0f7ff;
  border: 1px solid #d0e3ff;
  border-radius: 12px;
}

.alert-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2383e2;
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.alert-description {
  color: #6b6b6b;
  font-size: 13px;
}

/* Section Card */
.section-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 24px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.step-indicator {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 14px;
  color: #6b6b6b;
  margin: 0;
}

/* Input Options */
.input-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 24px;
}

@media (max-width: 640px) {
  .input-options {
    grid-template-columns: 1fr;
  }
}

.input-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: #fafafa;
  border: 1.5px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.input-option:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.input-option-selected {
  background: #f7f7f7;
  border-color: #1a1a1a;
}

.option-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.option-icon-url {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
}

.option-icon-file {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px 0;
}

.option-description {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0;
}

.option-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border-radius: 50%;
  color: white;
}

/* Input Fields */
.input-field-container {
  padding: 0 24px 24px;
}

.custom-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fafafa;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.custom-input:focus-within {
  background: #ffffff;
  border-color: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.08);
}

.input-icon {
  color: #6b6b6b;
  flex-shrink: 0;
}

.url-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #1a1a1a;
  outline: none;
  font-family: inherit;
}

.url-input::placeholder {
  color: #a0a0a0;
}

/* File Drop Zone */
.file-drop-zone {
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.file-drop-zone:hover {
  border-color: #a0a0a0;
  background: #f5f5f5;
}

.hidden-file-input {
  display: none;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-icon {
  color: #a0a0a0;
}

.drop-text {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
}

.drop-hint {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0;
}

.file-success {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: #e8f5e9;
  border-radius: 8px;
  font-size: 13px;
  color: #2e7d32;
}

.success-icon {
  color: #2e7d32;
}

/* Action Container */
.action-container {
  padding: 0 24px 24px;
  display: flex;
  justify-content: center;
}

/* Buttons */
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary-btn:hover {
  background: #333333;
  transform: translateY(-1px);
}

.primary-btn:active {
  transform: translateY(0);
}

.btn-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-disabled:hover {
  background: #1a1a1a;
  transform: none;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  color: #6b6b6b;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.secondary-btn:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
  color: #1a1a1a;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  color: #6b6b6b;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.ghost-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

/* Success Banner */
.success-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  margin: 0 24px 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 10px;
  color: #2e7d32;
  font-size: 14px;
  font-weight: 500;
}

/* Tools Grid */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}

.tool-card {
  background: #fafafa;
  border: 1.5px solid #e5e5e5;
  border-radius: 14px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tool-card:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.tool-completed {
  opacity: 0.6;
  cursor: default;
}

.tool-completed:hover {
  transform: none;
  box-shadow: none;
}

.tool-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tool-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
}

.tool-icon-purple {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.tool-icon-blue {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.tool-icon-green {
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
}

.tool-icon-completed {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

.completed-badge {
  padding: 4px 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tool-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px 0;
}

.tool-description {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.tool-tag {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tool-tag-purple {
  background: rgba(155, 89, 182, 0.12);
  color: #8e44ad;
}

.tool-tag-blue {
  background: rgba(52, 152, 219, 0.12);
  color: #2980b9;
}

.tool-tag-green {
  background: rgba(39, 174, 96, 0.12);
  color: #219a52;
}

/* Tools Actions */
.tools-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 24px 24px;
}

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}
</style>