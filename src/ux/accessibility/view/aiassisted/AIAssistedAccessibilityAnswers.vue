<template>
  <PageWrapper
    title="Analysis Results"
    :loading="loading"
    loading-text="Loading analysis results..."
  >
    <template #subtitle>
      <p class="page-subtitle">View and analyze accessibility findings from AI-powered tools</p>
    </template>

    <div class="apple-content">
      <!-- Error State -->
      <div v-if="error" class="error-banner">
        <v-icon icon="mdi-alert-circle" size="20" />
        <span>{{ error }}</span>
      </div>

      <!-- No Analysis Yet -->
      <div v-if="!loading && !analysisResult" class="empty-state-card">
        <div class="empty-icon">
          <v-icon icon="mdi-clipboard-text-search-outline" size="48" />
        </div>
        <h2 class="empty-title">No Analysis Results Yet</h2>
        <p class="empty-description">
          Start by examining your webpage with one of the available AI tools
        </p>
        <button class="primary-btn primary-btn-purple" @click="goToExamine">
          <v-icon icon="mdi-arrow-right" size="20" />
          <span>Go to Examine</span>
        </button>
      </div>

      <!-- Analysis Results -->
      <div v-if="analysisResult && !loading">
        <!-- Progress Card -->
        <div class="progress-card">
          <div class="progress-header">
            <div class="progress-info">
              <h3 class="progress-title">Analysis Progress</h3>
              <p class="progress-source">
                <v-icon :icon="analysisResult.inputType === 'url' ? 'mdi-web' : 'mdi-file-code-outline'" size="16" />
                <span v-if="analysisResult.inputType === 'url'">{{ analysisResult.url }}</span>
                <span v-else>{{ analysisResult.sourceFileName }}</span>
              </p>
            </div>
            <div :class="['progress-badge', getProgressBadgeClass()]">
              {{ completionPercentage }}% Complete
            </div>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: completionPercentage + '%' }" :class="getProgressBarClass()"></div>
          </div>
        </div>

        <!-- Tool Selection (if no tool selected) -->
        <ToolSelector 
          v-if="!selectedTool"
          :tool-status="toolStatus"
          :results="{
            chroma_check: chromaCheckResults,
            anchor_sense: anchorSenseResults,
            img_tip: imgTipResults
          }"
          @select-tool="selectTool"
          @run-analysis="goToExamine"
        />

        <!-- ChromaCheck Results -->
        <div v-if="selectedTool === 'chroma_check' && chromaCheckResults" class="results-section">
          <!-- Actions Card -->
          <div v-if="chromaCheckResults?.marked_html" class="actions-card">
            <div class="actions-header">
              <div class="actions-icon">
                <v-icon icon="mdi-palette" size="20" />
              </div>
              <h3 class="actions-title">ChromaCheck Results</h3>
            </div>
            <div class="actions-buttons">
              <button class="action-btn action-btn-green" @click="showMarkedHtml(chromaCheckResults?.marked_html)">
                <v-icon icon="mdi-eye" size="18" />
                <span>Inspect Webpage</span>
              </button>
              <button class="action-btn action-btn-blue" @click="downloadMarkedHtmlFromAnswers">
                <v-icon icon="mdi-download" size="18" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="stats-grid stats-grid-4">
            <div :class="['stat-card', chromaCheckResults.passed ? 'stat-success' : 'stat-error']">
              <div class="stat-icon">
                <v-icon :icon="chromaCheckResults.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" size="24" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ chromaCheckResults.passed ? 'Passed' : 'Failed' }}</span>
                <span class="stat-label">Status</span>
              </div>
            </div>

            <div class="stat-card stat-warning">
              <div class="stat-icon">
                <v-icon icon="mdi-alert" size="24" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ chromaCheckResults.total_issues }}</span>
                <span class="stat-label">Total Issues</span>
              </div>
            </div>

            <div class="stat-card stat-blue">
              <div class="stat-icon">
                <v-icon icon="mdi-file-document" size="24" />
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ chromaCheckResults.violations?.length || 0 }}</span>
                <span class="stat-label">Violations</span>
              </div>
            </div>

            <div class="stat-card stat-purple">
              <div class="stat-icon">
                <v-icon icon="mdi-eye" size="24" />
              </div>
              <div class="stat-content">
                <span class="stat-value">WCAG 2.1</span>
                <span class="stat-label">Standard</span>
              </div>
            </div>
          </div>

          <!-- Violations Table -->
          <div v-if="(chromaCheckResults.violations?.length || 0) > 0" class="section-card">
            <div class="section-header">
              <div class="section-header-left">
                <div class="section-icon section-icon-error">
                  <v-icon icon="mdi-alert-circle" size="20" />
                </div>
                <h3 class="section-title">Color Contrast Issues</h3>
                <span class="section-count section-count-error">{{ chromaCheckResults.violations.length }}</span>
              </div>
            </div>

            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Impact</th>
                    <th>Description</th>
                    <th>Element</th>
                    <th>Help</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedRowsCC" :key="index">
                    <td>
                      <span :class="['impact-badge', 'impact-' + item.impact]">{{ item.impact }}</span>
                    </td>
                    <td class="description-cell">{{ item.description }}</td>
                    <td>
                      <pre class="element-code">{{ truncateHtml(item.elementHtml) }}</pre>
                    </td>
                    <td>
                      <a :href="item.help_url" target="_blank" class="help-link">
                        Guide <v-icon icon="mdi-open-in-new" size="14" />
                      </a>
                    </td>
                    <td>
                      <button class="details-btn" @click="openViolationDialogCC(item.violation)">
                        Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-footer">
              <v-pagination v-model="pageCC" :length="pageCountCC" density="comfortable" rounded="lg" />
            </div>
          </div>

          <!-- Navigation -->
          <div class="nav-bar">
            <button class="secondary-btn" @click="selectedTool = null">
              <v-icon icon="mdi-arrow-left" size="18" />
              <span>Back</span>
            </button>
            <button class="secondary-btn" @click="goToExamine">
              <v-icon icon="mdi-refresh" size="18" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        <!-- AnchorSense Results -->
        <div v-if="selectedTool === 'anchor_sense' && anchorSenseResults" class="results-section">
          <AnchorSenseResult
            :results="anchorSenseResults"
            @back="selectedTool = null"
          />

          <div class="actions-bar">
            <button class="primary-btn primary-btn-blue" @click="downloadAnchorSenseReport">
              <v-icon icon="mdi-download" size="18" />
              <span>Export Report</span>
            </button>
            <button class="secondary-btn" @click="selectedTool = null">
              <v-icon icon="mdi-arrow-left" size="18" />
              <span>Back to Tools</span>
            </button>
            <button class="secondary-btn" @click="goToExamine">
              <v-icon icon="mdi-refresh" size="18" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        <!-- ImgTagTip Results -->
        <div v-if="selectedTool === 'img_tip' && imgTipResults" class="results-section">
          <ImgTagTipResult
            :results="imgTipResults"
            @back="selectedTool = null"
          />

          <div class="actions-bar">
            <button class="primary-btn primary-btn-green" @click="downloadImgTipReport">
              <v-icon icon="mdi-download" size="18" />
              <span>Export Report</span>
            </button>
            <button class="secondary-btn" @click="selectedTool = null">
              <v-icon icon="mdi-arrow-left" size="18" />
              <span>Back to Tools</span>
            </button>
            <button class="secondary-btn" @click="goToExamine">
              <v-icon icon="mdi-refresh" size="18" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-actions">
        <button class="ghost-btn" @click="goBack">
          <v-icon icon="mdi-arrow-left" size="18" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>

    <!-- Marked HTML Dialog -->
    <v-dialog v-model="showingMarkedHtmlDialog" fullscreen>
      <div class="fullscreen-dialog">
        <div class="dialog-header">
          <div class="dialog-title-section">
            <div class="dialog-icon">
              <v-icon icon="mdi-magnify" size="20" />
            </div>
            <h3 class="dialog-title">Marked HTML Preview</h3>
          </div>
          <button class="dialog-close" @click="showingMarkedHtmlDialog = false">
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>
        <div class="dialog-alert">
          <v-icon icon="mdi-information" size="18" />
          <span>🔴 Red outlines indicate contrast issues. 🎯 Look for the pulsing red highlight for the specific issue.</span>
        </div>
        <div class="dialog-content">
          <iframe
            v-if="currentMarkedHtml"
            :srcdoc="currentMarkedHtml"
            frameborder="0"
            class="preview-iframe"
          />
        </div>
      </div>
    </v-dialog>

    <!-- Violation Details Dialog -->
    <v-dialog v-model="showViolationDialogCC" max-width="900">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-section">
            <span :class="['impact-badge', 'impact-' + selectedViolationCC?.impact]">{{ selectedViolationCC?.impact }}</span>
            <h3 class="modal-title">Issue Details</h3>
          </div>
          <button class="modal-close" @click="showViolationDialogCC = false">
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-description">{{ selectedViolationCC?.description }}</p>
          <p class="modal-help">{{ selectedViolationCC?.help }}</p>

          <div class="detail-block">
            <span class="detail-label">HTML Element</span>
            <pre class="code-block">{{ selectedViolationCC?.element?.html }}</pre>
          </div>

          <div v-if="selectedViolationCC?.failure_summary" class="info-banner">
            <v-icon icon="mdi-information" size="18" />
            <span>{{ selectedViolationCC?.failure_summary }}</span>
          </div>

          <div class="modal-actions">
            <button class="primary-btn primary-btn-green" @click="showMarkedHtmlWithSpecificIssue(selectedViolationCC)">
              <v-icon icon="mdi-crosshairs-gps" size="18" />
              <span>Inspect This Issue</span>
            </button>
            <a v-if="selectedViolationCC?.help_url" :href="selectedViolationCC?.help_url" target="_blank" class="help-link-btn">
              Learn More <v-icon icon="mdi-open-in-new" size="14" />
            </a>
            <button class="secondary-btn" @click="showViolationDialogCC = false">
              Close
            </button>
          </div>
        </div>
      </div>
    </v-dialog>
  </PageWrapper>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import ToolSelector from '@/ux/accessibility/components/aiassisted/ToolSelector.vue';
import ChromaCheckResult from '@/ux/accessibility/components/aiassisted/ChromaCheckResult.vue';
import AnchorSenseResult from '@/ux/accessibility/components/aiassisted/AnchorSenseResult.vue';
import ImgTagTipResult from '@/ux/accessibility/components/aiassisted/ImgTagTipResult.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const testId = computed(() => route.params.id);
const loading = ref(false);
const error = ref(null);
const showingMarkedHtmlDialog = ref(false);
const currentMarkedHtml = ref('');
const selectedTool = ref(null);

// Get analysis result from store
const analysisResult = computed(() => store.getters['aiAssistedResults/currentResult']);
const toolStatus = computed(() => store.getters['aiAssistedResults/toolStatus']);
const completionPercentage = computed(() => store.getters['aiAssistedResults/completionPercentage']);

// Get individual tool results with proper null handling
const chromaCheckResults = computed(() => {
  const result = store.getters['aiAssistedResults/chromaCheckResults'];
  console.log('ChromaCheck Results:', result);
  return result;
});

const anchorSenseResults = computed(() => {
  const result = store.getters['aiAssistedResults/anchorSenseResults'];
  console.log('AnchorSense Results:', result);
  return result;
});

const imgTipResults = computed(() => {
  const result = store.getters['aiAssistedResults/imgTipResults'];
  console.log('ImgTagTip Results:', result);
  return result;
});

// Watch for route changes and reload data
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadAnalysisResults();
  }
}, { immediate: false });

// Load analysis result on mount
onMounted(async () => {
  await loadAnalysisResults();
});

const loadAnalysisResults = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await store.dispatch('aiAssistedResults/loadResult', testId.value);
    
    // Debug: Log the loaded result
    console.log('Analysis Result Loaded:', analysisResult.value);
    console.log('Tool Status:', toolStatus.value);
    
    // Auto-select tool if only one is completed
    if (!selectedTool.value) {
      const completedTools = Object.entries(toolStatus.value)
        .filter(([_, completed]) => completed)
        .map(([tool, _]) => tool);
      
      if (completedTools.length === 1) {
        selectedTool.value = completedTools[0];
      }
    }
  } catch (err) {
    console.error('Error loading analysis result:', err);
    error.value = 'Failed to load analysis results. Please try again.';
  } finally {
    loading.value = false;
  }
};

const getProgressColor = () => {
  const percentage = completionPercentage.value;
  if (percentage === 100) return 'green-lighten-5';
  if (percentage >= 50) return 'yellow-lighten-5';
  return 'red-lighten-5';
};

const getProgressIconColor = () => {
  const percentage = completionPercentage.value;
  if (percentage === 100) return 'green';
  if (percentage >= 50) return 'yellow-darken-2';
  return 'red';
};

const getProgressBadgeClass = () => {
  const percentage = completionPercentage.value;
  if (percentage === 100) return 'badge-success';
  if (percentage >= 50) return 'badge-warning';
  return 'badge-error';
};

const getProgressBarClass = () => {
  const percentage = completionPercentage.value;
  if (percentage === 100) return 'bar-success';
  if (percentage >= 50) return 'bar-warning';
  return 'bar-error';
};

const selectTool = (toolName) => {
  selectedTool.value = toolName;
  // Scroll to top for better UX
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const showMarkedHtml = (markedHtml) => {
  currentMarkedHtml.value = markedHtml;
  showingMarkedHtmlDialog.value = true;
};

const showMarkedHtmlWithSpecificIssue = (violation) => {
  if (!chromaCheckResults.value?.marked_html) return;
  
  let modifiedHtml = chromaCheckResults.value.marked_html;
  
  // Get the element HTML from the violation
  const elementHtml = violation.element?.html;
  if (elementHtml) {
    // Create a unique highlight style for this specific issue
    const highlightStyle = `
      <style>
        .specific-issue-highlight {
          outline: 4px solid #ff1744 !important;
          outline-offset: 2px !important;
          background-color: rgba(255, 23, 68, 0.1) !important;
          animation: pulse-highlight 2s infinite;
          position: relative;
          z-index: 9999 !important;
        }
        .specific-issue-highlight::before {
          content: "🎯 CURRENT ISSUE";
          position: absolute;
          top: -30px;
          left: 0;
          background: #6228d7;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: bold;
          border-radius: 4px;
          z-index: 10000;
          animation: none;
        }
        @keyframes pulse-highlight {
          0%, 100% { outline-color: #ff1744; }
          50% { outline-color: #ff5722; }
        }
      </style>
    `;
    
    // Add the style to the head of the HTML
    modifiedHtml = modifiedHtml.replace('</head>', highlightStyle + '</head>');
    
    // Try to find and highlight the specific element
    // We'll look for the exact HTML content and add our highlight class
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementHtml;
    const tempElement = tempDiv.firstElementChild;
    
    if (tempElement) {
      const tagName = tempElement.tagName.toLowerCase();
      const attributes = Array.from(tempElement.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');
      
      // Create a pattern to find this element in the marked HTML
      const elementPattern = new RegExp(`<${tagName}[^>]*${attributes.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`, 'gi');
      
      // Replace the first occurrence with the highlighted version
      modifiedHtml = modifiedHtml.replace(elementPattern, (match) => {
        return match.replace(`<${tagName}`, `<${tagName} class="specific-issue-highlight"`);
      });
    }
  }
  
  currentMarkedHtml.value = modifiedHtml;
  showingMarkedHtmlDialog.value = true;
  
  // Auto-scroll to the highlighted element after the dialog opens
  setTimeout(() => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
      const highlightedElement = iframe.contentDocument.querySelector('.specific-issue-highlight');
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, 500);
};

// ChromaCheck table state and helpers (Answers page)
const pageCC = ref(1);
const itemsPerPageCC = ref(10);
const showViolationDialogCC = ref(false);
const selectedViolationCC = ref(null);

const violationHeaders = [
  { title: 'Impact', key: 'impact' },
  { title: 'Description', key: 'description' },
  { title: 'Element', key: 'elementHtml', sortable: false },
  { title: 'Help', key: 'help_url', sortable: false },
  { title: '', key: 'actions', sortable: false }
];

const violationsListCC = computed(() => chromaCheckResults.value?.violations || []);
const tableItemsCC = computed(() =>
  violationsListCC.value.map(v => ({
    impact: v.impact,
    description: v.description,
    elementHtml: v.element?.html || '',
    help_url: v.help_url,
    violation: v,
  }))
);
const pageCountCC = computed(() => {
  const count = Math.ceil(tableItemsCC.value.length / itemsPerPageCC.value);
  return count > 0 ? count : 1;
});
const paginatedRowsCC = computed(() => {
  const start = (pageCC.value - 1) * itemsPerPageCC.value;
  return tableItemsCC.value.slice(start, start + itemsPerPageCC.value);
});

const truncateHtml = (html) => {
  if (!html) return '';
  const cleaned = String(html).replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.length > 140 ? cleaned.slice(0, 140) + '…' : cleaned;
};

const getImpactColor = (impact) => {
  const colors = { critical: 'red', serious: 'orange', moderate: 'yellow-darken-2', minor: 'blue' };
  return colors[impact] || 'grey';
};

const openViolationDialogCC = (violation) => {
  selectedViolationCC.value = violation;
  showViolationDialogCC.value = true;
};

const downloadMarkedHtmlFromAnswers = () => {
  const marked = chromaCheckResults.value?.marked_html;
  if (!marked) return;
  const blob = new Blob([marked], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chromacheck_report.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadAnchorSenseReport = () => {
  if (!anchorSenseResults.value?.issues) return;

  // Create a comprehensive text report
  let report = '=== AnchorSense Analysis Report ===\n\n';
  report += `Analyzed: ${analysisResult.value.inputType === 'url' ? analysisResult.value.url : analysisResult.value.sourceFileName}\n`;
  report += `Date: ${new Date().toLocaleString()}\n`;
  report += `Total Issues: ${anchorSenseResults.value.total_issues}\n`;
  report += `Status: ${anchorSenseResults.value.passed ? 'Passed' : 'Failed'}\n\n`;
  report += '=== Issues Found ===\n\n';
  
  anchorSenseResults.value.issues.forEach((issue, index) => {
    report += `${index + 1}. ${issue.issue}\n`;
    report += `   Module: ${issue.module}\n`;
    report += `   Element: ${issue.element}\n`;
    report += `   Help: ${issue.help}\n\n`;
  });

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `anchorsense_report_${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadImgTipReport = () => {
  if (!imgTipResults.value?.issues) return;

  // Create a comprehensive text report
  let report = '=== ImgTagTip Analysis Report ===\n\n';
  report += `Analyzed: ${analysisResult.value.inputType === 'url' ? analysisResult.value.url : analysisResult.value.sourceFileName}\n`;
  report += `Date: ${new Date().toLocaleString()}\n`;
  report += `Total Issues: ${imgTipResults.value.total_issues || 0}\n`;
  report += `Status: ${imgTipResults.value.passed ? 'Passed' : 'Failed'}\n\n`;
  report += '=== Issues Found ===\n\n';
  
  imgTipResults.value.issues.forEach((issue, index) => {
    report += `${index + 1}. ${issue.issue}\n`;
    report += `   Module: ${issue.module}\n`;
    report += `   Element: ${issue.element}\n`;
    report += `   Help: ${issue.help}\n\n`;
  });

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `imgtip_report_${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const goToExamine = () => {
  router.push({
    name: 'AIAssistedAccessibilityExamine',
    params: { id: testId.value }
  });
};

const goBack = () => {
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } });
};
</script>

<style scoped>
.page-subtitle {
  color: #6b6b6b;
  font-size: 15px;
  font-weight: 400;
  margin: 0;
}

.apple-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px 40px;
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

/* Empty State */
.empty-state-card {
  text-align: center;
  padding: 60px 40px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  margin-bottom: 24px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #e5e5e5 0%, #d0d0d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #6b6b6b;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 15px;
  color: #6b6b6b;
  max-width: 400px;
  margin: 0 auto 28px;
  line-height: 1.5;
}

/* Progress Card */
.progress-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.progress-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b6b6b;
  margin: 0;
}

.progress-source span {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

.badge-error {
  background: #fee2e2;
  color: #dc2626;
}

.progress-bar-container {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-success {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.bar-warning {
  background: linear-gradient(90deg, #fbbf24 0%, #d97706 100%);
}

.bar-error {
  background: linear-gradient(90deg, #f87171 0%, #dc2626 100%);
}

/* Results Section */
.results-section {
  margin-bottom: 24px;
}

/* Actions Card */
.actions-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.actions-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.actions-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.actions-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.action-btn-green:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.action-btn-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.action-btn-blue:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stats-grid-4 {
  grid-template-columns: repeat(4, 1fr);
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

.stat-blue .stat-icon {
  background: #dbeafe;
  color: #2563eb;
}

.stat-purple .stat-icon {
  background: #ede9fe;
  color: #7c3aed;
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

.section-icon-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.section-count {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.section-count-error {
  background: #fee2e2;
  color: #b91c1c;
}

/* Modern Table */
.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  text-align: left;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.modern-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

.modern-table tbody tr:hover {
  background: #fafafa;
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
  background: #fee2e2;
  color: #b91c1c;
}

.impact-serious {
  background: #ffedd5;
  color: #c2410c;
}

.impact-moderate {
  background: #fef3c7;
  color: #92400e;
}

.impact-minor {
  background: #dbeafe;
  color: #1d4ed8;
}

.description-cell {
  max-width: 200px;
}

.element-code {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-family: 'SF Mono', Monaco, monospace;
  max-width: 300px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7c3aed;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
}

.details-btn {
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #7c3aed;
  cursor: pointer;
  transition: all 0.2s ease;
}

.details-btn:hover {
  background: #ede9fe;
  border-color: #7c3aed;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
}

/* Navigation Bar */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  margin-top: 20px;
}

/* Buttons */
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

.primary-btn-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.primary-btn-purple:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.primary-btn-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.primary-btn-blue:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.primary-btn-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.primary-btn-green:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
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

/* Fullscreen Dialog */
.fullscreen-dialog {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
}

.dialog-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.dialog-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: #fef3c7;
  color: #92400e;
  font-size: 14px;
}

.dialog-content {
  flex: 1;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
}

/* Modal Card */
.modal-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title-section .impact-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 24px;
}

.modal-description {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.modal-help {
  font-size: 14px;
  color: #6b6b6b;
  margin: 0 0 20px;
  line-height: 1.5;
}

.detail-block {
  margin-bottom: 20px;
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

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 14px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
  color: #1d4ed8;
  font-size: 14px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.help-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7c3aed;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
}

.help-link-btn:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 900px) {
  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .apple-content {
    padding: 0 16px 32px;
  }

  .stats-grid,
  .stats-grid-4 {
    grid-template-columns: 1fr;
  }

  .actions-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-buttons {
    width: 100%;
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .nav-bar,
  .actions-bar {
    flex-direction: column;
  }

  .nav-bar .secondary-btn,
  .actions-bar .primary-btn,
  .actions-bar .secondary-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .primary-btn,
  .modal-actions .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
