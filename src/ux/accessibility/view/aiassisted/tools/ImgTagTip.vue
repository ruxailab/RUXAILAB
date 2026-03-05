<template>
  <PageWrapper
    title="ImgTagTip"
    :loading="loading"
    loading-text="Analyzing images and generating alt text..."
  >
    <template #subtitle>
      <p class="page-subtitle">AI-powered alternative text suggestions for images</p>
    </template>

    <div class="apple-content">
      <!-- Input Display Banner -->
      <div class="input-banner">
        <div class="banner-content">
          <div class="banner-icon">
            <v-icon :icon="inputType === 'url' ? 'mdi-web' : 'mdi-file-code-outline'" size="20" />
          </div>
          <div class="banner-text">
            <span class="banner-label">Analyzing</span>
            <span class="banner-value">{{ inputType === 'url' ? inputUrl : inputFileName }}</span>
          </div>
        </div>
        <button class="change-btn" @click="goBackToInputSelection">
          <v-icon icon="mdi-swap-horizontal" size="16" />
          <span>Change</span>
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-banner">
        <v-icon icon="mdi-alert-circle" size="20" />
        <span>{{ error }}</span>
      </div>

      <!-- Start Analysis Card -->
      <div v-if="!loading && !results" class="start-card">
        <div class="start-icon start-icon-green">
          <v-icon icon="mdi-image-outline" size="40" />
        </div>
        <h2 class="start-title">Ready to Analyze Images</h2>
        <p class="start-description">
          ImgTagTip will scan your {{ inputType === 'url' ? 'webpage' : 'HTML file' }} for images and provide AI-generated alt text suggestions.
        </p>
        <button class="primary-btn primary-btn-green" @click="startAnalysis">
          <v-icon icon="mdi-play" size="20" />
          <span>Start Analysis</span>
        </button>
      </div>

      <!-- Results Display -->
      <div v-if="results && !loading" class="results-container">
        <!-- Summary Stats -->
        <div class="stats-grid">
          <div :class="['stat-card', results.passed ? 'stat-success' : 'stat-error']">
            <div class="stat-icon">
              <v-icon :icon="results.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" size="24" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ results.passed ? 'Passed' : 'Issues Found' }}</span>
              <span class="stat-label">Status</span>
            </div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <v-icon icon="mdi-alert" size="24" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ results.total_issues }}</span>
              <span class="stat-label">Total Issues</span>
            </div>
          </div>

          <div class="stat-card stat-green">
            <div class="stat-icon">
              <v-icon icon="mdi-image-multiple" size="24" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ results.issues?.length || 0 }}</span>
              <span class="stat-label">Images Analyzed</span>
            </div>
          </div>
        </div>

        <!-- Issues List -->
        <div v-if="(results.issues?.length || 0) > 0" class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon section-icon-warning">
                <v-icon icon="mdi-image-off-outline" size="20" />
              </div>
              <h3 class="section-title">Image Alt Text Issues</h3>
              <span class="section-count">{{ results.issues.length }}</span>
            </div>
          </div>

          <div class="issues-list">
            <div 
              v-for="(issue, index) in results.issues" 
              :key="index"
              class="issue-item"
            >
              <div class="issue-header" @click="toggleIssue(index)">
                <div class="issue-header-left">
                  <span class="issue-number">{{ index + 1 }}</span>
                  <span class="issue-module">{{ issue.module || 'imagealt' }}</span>
                  <span class="issue-title">{{ issue.issue }}</span>
                </div>
                <v-icon 
                  :icon="expandedIssues.includes(index) ? 'mdi-chevron-up' : 'mdi-chevron-down'" 
                  size="20" 
                  class="issue-chevron"
                />
              </div>

              <v-expand-transition>
                <div v-if="expandedIssues.includes(index)" class="issue-details">
                  <div class="detail-block">
                    <span class="detail-label">Current HTML</span>
                    <pre class="code-block">{{ issue.element }}</pre>
                  </div>

                  <div class="detail-block detail-block-success">
                    <div class="detail-header">
                      <v-icon icon="mdi-lightbulb-outline" size="18" />
                      <span class="detail-label">How to Fix</span>
                    </div>
                    <p class="detail-text">{{ issue.help }}</p>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </div>
        </div>

        <!-- No Issues Found -->
        <div v-else class="success-card">
          <div class="success-icon">
            <v-icon icon="mdi-check-circle" size="48" />
          </div>
          <h3 class="success-title">All Clear!</h3>
          <p class="success-description">All images have proper alternative text.</p>
        </div>

        <!-- Action Buttons -->
        <div class="actions-bar">
          <button class="primary-btn primary-btn-green" @click="downloadReport">
            <v-icon icon="mdi-download" size="18" />
            <span>Export Report</span>
          </button>
          <button class="secondary-btn" @click="resetAnalysis">
            <v-icon icon="mdi-refresh" size="18" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="footer-actions">
        <button class="ghost-btn" @click="goBack">
          <v-icon icon="mdi-arrow-left" size="18" />
          <span>Back to Tools</span>
        </button>
      </div>
    </div>
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
const expandedIssues = ref([])

const testId = computed(() => route.params.id)

// Toggle issue expansion
const toggleIssue = (index) => {
  const idx = expandedIssues.value.indexOf(index)
  if (idx === -1) {
    expandedIssues.value.push(index)
  } else {
    expandedIssues.value.splice(idx, 1)
  }
}

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
    const response = await fetch(`${API_BASE_URL}/altsense/analyze-website-images/`, {
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

    const response = await fetch(`${API_BASE_URL}/altsense/analyze-file/`, {
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
  if (!results.value?.issues) return

  // Create a simple text report
  let report = '=== ImgTagTip / AltSense Analysis Report ===\n\n'
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
  a.download = 'imgtip_report.txt'
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
.page-subtitle {
  color: #6b6b6b;
  font-size: 15px;
  font-weight: 400;
  margin: 0;
}

.apple-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Input Banner */
.input-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.banner-text {
  display: flex;
  flex-direction: column;
}

.banner-label {
  font-size: 11px;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.banner-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: #6b6b6b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-btn:hover {
  background: #f5f5f5;
  border-color: #b0b0b0;
  color: #1a1a1a;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
  color: #b91c1c;
}

/* Start Card */
.start-card {
  text-align: center;
  padding: 60px 40px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  margin-bottom: 24px;
}

.start-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.start-icon-green {
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
}

.start-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.start-description {
  font-size: 15px;
  color: #6b6b6b;
  max-width: 400px;
  margin: 0 auto 28px;
  line-height: 1.5;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn-green {
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
}

.primary-btn-green:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: white;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-success .stat-icon {
  background: #dcfce7;
  color: #16a34a;
}

.stat-error .stat-icon {
  background: #fee2e2;
  color: #dc2626;
}

.stat-warning .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.stat-green .stat-icon {
  background: #d1fae5;
  color: #059669;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 12px;
  color: #6b6b6b;
}

/* Section Card */
.section-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.section-icon-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.section-count {
  background: #fef3c7;
  color: #92400e;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Issues List */
.issues-list {
  padding: 8px;
}

.issue-item {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.issue-item:hover {
  border-color: #d0d0d0;
}

.issue-item:last-child {
  margin-bottom: 0;
}

.issue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.2s ease;
}

.issue-header:hover {
  background: #f5f5f5;
}

.issue-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.issue-number {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #e5e5e5;
  color: #6b6b6b;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.issue-module {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  flex-shrink: 0;
}

.issue-title {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.issue-chevron {
  color: #9b9b9b;
  flex-shrink: 0;
}

.issue-details {
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.detail-block {
  margin-bottom: 16px;
}

.detail-block:last-child {
  margin-bottom: 0;
}

.detail-block-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 14px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #16a34a;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
  display: block;
}

.detail-block-success .detail-label {
  margin-bottom: 0;
  color: #16a34a;
}

.detail-text {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.5;
  margin: 0;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 14px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

/* Success Card */
.success-card {
  text-align: center;
  padding: 48px 40px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  margin-bottom: 24px;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #16a34a;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
}

.success-title {
  font-size: 22px;
  font-weight: 600;
  color: #15803d;
  margin-bottom: 8px;
}

.success-description {
  font-size: 15px;
  color: #16a34a;
  margin: 0;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  margin-bottom: 32px;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f5f5f5;
  border-color: #b0b0b0;
}

/* Footer Actions */
.footer-actions {
  padding-top: 24px;
  border-top: 1px solid #e5e5e5;
  text-align: center;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6b6b6b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  color: #1a1a1a;
}

/* Responsive */
@media (max-width: 768px) {
  .apple-content {
    padding: 0 16px 32px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .input-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .change-btn {
    width: 100%;
    justify-content: center;
  }

  .start-card {
    padding: 40px 24px;
  }

  .actions-bar {
    flex-direction: column;
  }

  .actions-bar .primary-btn,
  .actions-bar .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
