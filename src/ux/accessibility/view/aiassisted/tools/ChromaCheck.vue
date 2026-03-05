<template>
  <PageWrapper
    title="ChromaCheck"
    :loading="loading"
    loading-text="Analyzing color contrast..."
  >
    <template #subtitle>
      <p class="page-subtitle">AI-powered color contrast analysis for WCAG compliance</p>
    </template>

    <div class="apple-content">
      <!-- Input Display Banner -->
      <div class="input-banner">
        <div class="banner-content">
          <div class="banner-icon banner-icon-purple">
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
        <div class="start-icon start-icon-purple">
          <v-icon icon="mdi-palette" size="40" />
        </div>
        <h2 class="start-title">Ready to Analyze Colors</h2>
        <p class="start-description">
          ChromaCheck will scan your {{ inputType === 'url' ? 'webpage' : 'HTML file' }} for color contrast issues and ensure WCAG compliance.
        </p>
        <button class="primary-btn primary-btn-purple" @click="startAnalysis">
          <v-icon icon="mdi-play" size="20" />
          <span>Start Analysis</span>
        </button>
      </div>

      <!-- Results Display -->
      <div v-if="results && !loading" class="results-container">
        <!-- Primary Actions -->
        <div v-if="results?.marked_html" class="actions-card">
          <div class="actions-card-header">
            <div class="actions-icon">
              <v-icon icon="mdi-magnify" size="20" />
            </div>
            <span class="actions-title">Inspect & Export</span>
          </div>
          <div class="actions-buttons">
            <button class="action-btn action-btn-green" @click="showMarkedHtml">
              <v-icon icon="mdi-eye" size="18" />
              <span>Inspect Webpage</span>
            </button>
            <button class="action-btn action-btn-blue" @click="downloadMarkedHtml">
              <v-icon icon="mdi-download" size="18" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="stats-grid">
          <div :class="['stat-card', results.passed ? 'stat-success' : 'stat-error']">
            <div class="stat-icon">
              <v-icon :icon="results.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" size="24" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ results.passed ? 'Passed' : 'Failed' }}</span>
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

          <div class="stat-card stat-info">
            <div class="stat-icon">
              <v-icon icon="mdi-file-document" size="24" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ results.violations?.length || 0 }}</span>
              <span class="stat-label">Violations</span>
            </div>
          </div>

          <div class="stat-card stat-purple">
            <div class="stat-icon">
              <v-icon icon="mdi-check-decagram" size="24" />
            </div>
            <div class="stat-content">
              <span class="stat-value">WCAG 2.1</span>
              <span class="stat-label">Standard</span>
            </div>
          </div>
        </div>

        <!-- Violations Table -->
        <div v-if="(results.violations?.length || 0) > 0" class="section-card">
          <div class="section-header">
            <div class="section-header-left">
              <div class="section-icon section-icon-error">
                <v-icon icon="mdi-alert-circle-outline" size="20" />
              </div>
              <h3 class="section-title">Color Contrast Issues</h3>
              <span class="section-count">{{ results.violations.length }}</span>
            </div>
          </div>

          <div class="table-container">
            <v-data-table
              :headers="violationHeaders"
              :items="paginatedRows"
              class="modern-table"
              hide-default-footer
            >
              <template #item.impact="{ value }">
                <span :class="['impact-badge', `impact-${value}`]">{{ value }}</span>
              </template>
              <template #item.elementHtml="{ value }">
                <pre class="code-preview">{{ truncateHtml(value) }}</pre>
              </template>
              <template #item.help_url="{ value }">
                <a :href="value" target="_blank" class="help-link">
                  Guide <v-icon icon="mdi-open-in-new" size="14" />
                </a>
              </template>
              <template #item.actions="{ item }">
                <button class="details-btn" @click="openViolationDialog(item.violation)">
                  Details
                </button>
              </template>
            </v-data-table>
          </div>

          <div class="table-footer">
            <v-pagination v-model="page" :length="pageCount" density="comfortable" rounded />
          </div>
        </div>

        <!-- Actions Bar -->
        <div class="actions-bar">
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

    <!-- Marked HTML Dialog -->
    <v-dialog v-model="showingMarkedHtml" fullscreen>
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3 class="dialog-title">Webpage Preview</h3>
          <button class="dialog-close" @click="showingMarkedHtml = false">
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>
        <div class="dialog-alert">
          <v-icon icon="mdi-information" size="18" />
          <span>Red outlines indicate contrast issues. Hover over them for details.</span>
        </div>
        <iframe
          v-if="results?.marked_html"
          :srcdoc="results.marked_html"
          frameborder="0"
          class="preview-iframe"
        />
      </v-card>
    </v-dialog>

    <!-- Violation Details Dialog -->
    <v-dialog v-model="showViolationDialog" max-width="700">
      <v-card class="details-dialog">
        <div class="dialog-header">
          <h3 class="dialog-title">Issue Details</h3>
          <button class="dialog-close" @click="showViolationDialog = false">
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>
        <div class="details-content">
          <div class="details-top">
            <span :class="['impact-badge', `impact-${selectedViolation?.impact}`]">{{ selectedViolation?.impact }}</span>
            <span class="details-description">{{ selectedViolation?.description }}</span>
          </div>
          <p class="details-help">{{ selectedViolation?.help }}</p>

          <div class="detail-block">
            <span class="detail-label">HTML Element</span>
            <pre class="code-block">{{ selectedViolation?.element?.html }}</pre>
          </div>

          <div v-if="selectedViolation?.failure_summary" class="info-block">
            <v-icon icon="mdi-information" size="18" />
            <span>{{ selectedViolation?.failure_summary }}</span>
          </div>

          <div class="details-actions">
            <a v-if="selectedViolation?.help_url" :href="selectedViolation?.help_url" target="_blank" class="learn-more-link">
              Learn More <v-icon icon="mdi-open-in-new" size="14" />
            </a>
            <button class="secondary-btn" @click="showViolationDialog = false">Close</button>
          </div>
        </div>
      </v-card>
    </v-dialog>
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
const showingMarkedHtml = ref(false)
const saving = ref(false)

// Pagination and table state
const page = ref(1)
const itemsPerPage = ref(10)
const showViolationDialog = ref(false)
const selectedViolation = ref(null)

const violationHeaders = [
  { title: 'Impact', key: 'impact' },
  { title: 'Description', key: 'description' },
  { title: 'Element', key: 'elementHtml', sortable: false },
  { title: 'Help', key: 'help_url', sortable: false },
  { title: '', key: 'actions', sortable: false }
]

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
    formData.append('add_markers', 'true')

    const response = await fetch(`${API_BASE_URL}/colorsense/examinehtml/`, {
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

const saveResultsToFirebase = async (chromaData) => {
  if (!chromaData || saving.value) return

  saving.value = true
  try {
    await store.dispatch('aiAssistedResults/saveChromaCheckResult', {
      testId: testId.value,
      chromaData: chromaData
    })
    
    console.log('ChromaCheck results saved to Firebase')
    
    // Show success toast
    store.commit('SET_TOAST', {
      message: 'ChromaCheck analysis saved successfully',
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

// Table helpers
const violationsList = computed(() => results.value?.violations || [])
const tableItems = computed(() =>
  violationsList.value.map(v => ({
    impact: v.impact,
    description: v.description,
    elementHtml: v.element?.html || '',
    help_url: v.help_url,
    violation: v,
  }))
)
const pageCount = computed(() => {
  const count = Math.ceil(tableItems.value.length / itemsPerPage.value)
  return count > 0 ? count : 1
})
const paginatedRows = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return tableItems.value.slice(start, start + itemsPerPage.value)
})

const truncateHtml = (html) => {
  if (!html) return ''
  const cleaned = String(html).replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned.length > 140 ? cleaned.slice(0, 140) + '…' : cleaned
}

const openViolationDialog = (violation) => {
  selectedViolation.value = violation
  showViolationDialog.value = true
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
/* Apple/Notion Inspired Design */
.page-subtitle {
  font-size: 15px;
  color: #6b6b6b;
  margin-top: 4px;
}

.apple-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
}

/* Input Banner */
.input-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 12px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
}

.banner-icon-purple {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.banner-label {
  font-size: 12px;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.banner-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.change-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  color: #9b59b6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-btn:hover {
  background: #faf5ff;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
}

/* Start Card */
.start-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.start-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  color: white;
  margin-bottom: 24px;
}

.start-icon-purple {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.start-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.start-description {
  font-size: 15px;
  color: #6b6b6b;
  max-width: 400px;
  margin: 0 0 28px 0;
  line-height: 1.6;
}

/* Buttons */
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.primary-btn-purple {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
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
}

.ghost-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

/* Results Container */
.results-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Actions Card */
.actions-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 12px;
}

.actions-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  border-radius: 8px;
  color: white;
}

.actions-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.actions-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn-green {
  background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
}

.action-btn-blue {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.stat-success .stat-icon {
  background: #e8f5e9;
  color: #2e7d32;
}

.stat-error .stat-icon {
  background: #ffebee;
  color: #c62828;
}

.stat-warning .stat-icon {
  background: #fff3e0;
  color: #ef6c00;
}

.stat-info .stat-icon {
  background: #e3f2fd;
  color: #1976d2;
}

.stat-purple .stat-icon {
  background: #f3e5f5;
  color: #7b1fa2;
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
  font-size: 13px;
  color: #6b6b6b;
}

/* Section Card */
.section-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
}

.section-icon-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.section-count {
  padding: 4px 10px;
  background: #fef2f2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
}

/* Table */
.table-container {
  padding: 16px;
}

.modern-table {
  background: transparent !important;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.impact-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.impact-critical {
  background: #fef2f2;
  color: #dc2626;
}

.impact-serious {
  background: #fff7ed;
  color: #ea580c;
}

.impact-moderate {
  background: #fefce8;
  color: #ca8a04;
}

.impact-minor {
  background: #eff6ff;
  color: #2563eb;
}

.code-preview {
  padding: 8px 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  max-width: 300px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #9b59b6;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.help-link:hover {
  text-decoration: underline;
}

.details-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  color: #6b6b6b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.details-btn:hover {
  background: #f5f5f5;
  color: #1a1a1a;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

/* Dialog Styles */
.dialog-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #1a1a1a;
  color: white;
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}

.dialog-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #fef3c7;
  color: #92400e;
  font-size: 13px;
}

.preview-iframe {
  width: 100%;
  flex: 1;
  border: none;
}

/* Details Dialog */
.details-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.details-content {
  padding: 24px;
}

.details-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.details-description {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}

.details-help {
  font-size: 14px;
  color: #6b6b6b;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.detail-block {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: block;
}

.code-block {
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.info-block {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #eff6ff;
  border-radius: 8px;
  color: #1e40af;
  font-size: 13px;
  margin-bottom: 20px;
}

.details-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.learn-more-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #9b59b6;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.learn-more-link:hover {
  text-decoration: underline;
}
</style>
