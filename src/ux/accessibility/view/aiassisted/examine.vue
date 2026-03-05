<template>
  <div class="contrast-checker">
    <h1>Color Contrast Checker</h1>
    
    <!-- URL Input Section -->
    <div class="input-section">
      <h2>Check URL</h2>
      <input 
        v-model="urlInput" 
        type="text" 
        placeholder="Enter URL (e.g., https://example.com)"
        @keyup.enter="checkUrl"
      />
      <button @click="checkUrl" :disabled="loading">
        {{ loading ? 'Analyzing...' : 'Check URL' }}
      </button>
    </div>

    <!-- File Upload Section -->
    <div class="input-section">
      <h2>Upload HTML File</h2>
      <input 
        type="file" 
        accept=".html"
        @change="handleFileUpload"
        ref="fileInput"
      />
      <button @click="checkFile" :disabled="loading || !selectedFile">
        {{ loading ? 'Analyzing...' : 'Check File' }}
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading">
      Analyzing for color contrast issues...
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Results Summary -->
    <div v-if="results && !loading" class="results-summary">
      <h2>Analysis Results</h2>
      <div class="summary-stats">
        <div class="stat" :class="results.passed ? 'pass' : 'fail'">
          <strong>Status:</strong> {{ results.passed ? '✓ Passed' : '✗ Failed' }}
        </div>
        <div class="stat">
          <strong>Total Issues:</strong> {{ results.total_issues }}
        </div>
      </div>

      <!-- Violations List -->
      <div v-if="results.violations && results.violations.length > 0" class="violations">
        <h3>Issues Found ({{ results.violations.length }})</h3>
        <div v-for="(violation, index) in results.violations" :key="index" class="violation-item">
          <div class="violation-header">
            <span class="violation-number">{{ index + 1 }}.</span>
            <span class="violation-impact" :class="violation.impact">
              {{ violation.impact.toUpperCase() }}
            </span>
          </div>
          <p class="violation-description">{{ violation.description }}</p>
          <div class="violation-element">
            <strong>Element:</strong>
            <code>{{ violation.element.html.substring(0, 100) }}{{ violation.element.html.length > 100 ? '...' : '' }}</code>
          </div>
          <div class="violation-summary">
            {{ violation.failure_summary.split('\n')[1] || violation.failure_summary }}
          </div>
          <a :href="violation.help_url" target="_blank" class="help-link">
            Learn more →
          </a>
        </div>
      </div>

      <!-- View Marked HTML Button -->
      <div v-if="results.marked_html" class="action-buttons">
        <button @click="showMarkedHtml" class="primary-btn">
          View Marked HTML
        </button>
        <button @click="downloadMarkedHtml" class="secondary-btn">
          Download Marked HTML
        </button>
      </div>
    </div>

    <!-- Marked HTML Viewer (in iframe) -->
    <div v-if="showingMarkedHtml && results?.marked_html" class="html-viewer">
      <div class="viewer-header">
        <h2>Marked HTML Preview</h2>
        <button @click="showingMarkedHtml = false" class="close-btn">✕ Close</button>
      </div>
      <div class="viewer-info">
        <p>🔴 Red outlines indicate contrast issues. Hover over them to see details.</p>
      </div>
      <iframe 
        :srcdoc="results.marked_html"
        frameborder="0"
        class="html-frame"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// API Configuration
const API_BASE_URL = process.env.VUE_APP_AI_ACCESSIBILITY_API || 'http://localhost:8000'

// Reactive State
const urlInput = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)
const loading = ref(false)
const error = ref(null)
const results = ref(null)
const showingMarkedHtml = ref(false)

// Check URL
const checkUrl = async () => {
  if (!urlInput.value) {
    error.value = 'Please enter a URL'
    return
  }

  loading.value = true
  error.value = null
  results.value = null
  showingMarkedHtml.value = false

  try {
    const response = await fetch(`${API_BASE_URL}/colorsense/examine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: urlInput.value,
        add_markers: true
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    results.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Handle File Selection
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    error.value = null
  }
}

// Check File
const checkFile = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a file'
    return
  }

  loading.value = true
  error.value = null
  results.value = null
  showingMarkedHtml.value = false

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('add_markers', 'true')

    const response = await fetch(`${API_BASE_URL}/colorsense/examinehtml/`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    results.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Show Marked HTML in viewer
const showMarkedHtml = () => {
  showingMarkedHtml.value = true
}

// Download Marked HTML
const downloadMarkedHtml = () => {
  if (!results.value?.marked_html) return

  const blob = new Blob([results.value.marked_html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'marked_contrast_issues.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.contrast-checker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.input-section {
  background: white;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

input[type="text"],
input[type="file"] {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

input[type="text"]:focus {
  outline: none;
  border-color: #0066cc;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #0052a3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px 0;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border-left: 4px solid #c62828;
}

.results-summary {
  background: white;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat {
  padding: 15px;
  border-radius: 4px;
  background: #f5f5f5;
  flex: 1;
}

.stat.pass {
  background: #e8f5e9;
  color: #2e7d32;
}

.stat.fail {
  background: #ffebee;
  color: #c62828;
}

.violations {
  margin-top: 30px;
}

.violations h3 {
  color: #c62828;
  margin-bottom: 20px;
}

.violation-item {
  background: #fafafa;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  border-left: 4px solid #ff5252;
}

.violation-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.violation-number {
  font-weight: bold;
  color: #666;
}

.violation-impact {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.violation-impact.critical {
  background: #d32f2f;
  color: white;
}

.violation-impact.serious {
  background: #f57c00;
  color: white;
}

.violation-impact.moderate {
  background: #fbc02d;
  color: #333;
}

.violation-impact.minor {
  background: #aed581;
  color: #333;
}

.violation-description {
  font-weight: 500;
  color: #333;
  margin: 10px 0;
}

.violation-element {
  margin: 10px 0;
}

.violation-element code {
  display: block;
  background: white;
  padding: 8px;
  border-radius: 3px;
  font-size: 13px;
  margin-top: 5px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
}

.violation-summary {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
  line-height: 1.5;
}

.help-link {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  display: inline-block;
  margin-top: 10px;
}

.help-link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.primary-btn {
  background: #2e7d32;
}

.primary-btn:hover {
  background: #1b5e20;
}

.secondary-btn {
  background: #666;
}

.secondary-btn:hover {
  background: #444;
}

.html-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #333;
  color: white;
}

.viewer-header h2 {
  margin: 0;
  color: white;
}

.close-btn {
  background: #ff5252;
  padding: 8px 15px;
}

.close-btn:hover {
  background: #ff1744;
}

.viewer-info {
  background: #fff3cd;
  padding: 10px 20px;
  border-bottom: 1px solid #ffc107;
}

.viewer-info p {
  margin: 0;
  color: #856404;
}

.html-frame {
  flex: 1;
  width: 100%;
  border: none;
}

@media (max-width: 768px) {
  .summary-stats {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
