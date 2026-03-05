<template>
  <PageWrapper
    title="Accessibility Report"
    :loading="loading"
    loading-text="Loading analysis data..."
  >
    <template #subtitle>
      <p class="page-subtitle">Generate and download comprehensive accessibility reports</p>
    </template>

    <div class="apple-content">
      <!-- Error State -->
      <div v-if="error" class="error-banner">
        <v-icon icon="mdi-alert-circle" size="20" />
        <span>{{ error }}</span>
        <button class="close-btn" @click="error = null">
          <v-icon icon="mdi-close" size="16" />
        </button>
      </div>

      <!-- No Data State -->
      <div v-if="!loading && !hasAnyResults" class="empty-state-card">
        <div class="empty-icon">
          <v-icon icon="mdi-file-document-alert-outline" size="48" />
        </div>
        <h2 class="empty-title">No Analysis Data Available</h2>
        <p class="empty-description">
          Please run at least one analysis tool before generating a report.
        </p>
        <button class="primary-btn primary-btn-purple" @click="goToExamine">
          <v-icon icon="mdi-arrow-right" size="20" />
          <span>Go to Examine</span>
        </button>
      </div>

      <!-- Report Content -->
      <div v-if="!loading && hasAnyResults">
        <!-- Test Information Card -->
        <div class="info-card">
          <div class="info-header">
            <div class="info-icon">
              <v-icon icon="mdi-information-outline" size="20" />
            </div>
            <h3 class="info-title">Test Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Test ID</span>
              <span class="info-value">{{ testId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Input Type</span>
              <span class="info-value info-badge">{{ analysisResult.inputType }}</span>
            </div>
            <div class="info-item" v-if="analysisResult.inputType === 'url'">
              <span class="info-label">URL</span>
              <span class="info-value info-url">{{ analysisResult.url }}</span>
            </div>
            <div class="info-item" v-else>
              <span class="info-label">File</span>
              <span class="info-value">{{ analysisResult.sourceFileName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tools Completed</span>
              <span class="info-value">{{ analysisResult.toolsCompleted?.length || 0 }}/3</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Issues</span>
              <span class="info-value info-issues">{{ analysisResult.totalIssues || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated</span>
              <span class="info-value">{{ formatDate(analysisResult.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Reports Grid -->
        <div class="reports-grid">
          <!-- ChromaCheck Report -->
          <div :class="['report-card', { 'report-available': analysisResult.chroma_check }]">
            <div :class="['report-icon', analysisResult.chroma_check ? 'report-icon-purple' : 'report-icon-disabled']">
              <v-icon :icon="analysisResult.chroma_check ? 'mdi-palette' : 'mdi-alert-circle-outline'" size="28" />
            </div>
            <h4 class="report-name">ChromaCheck</h4>
            <p class="report-description">Color Contrast Analysis</p>
            
            <div v-if="analysisResult.chroma_check" class="report-status report-status-available">
              <v-icon icon="mdi-check-circle" size="14" />
              <span>Available</span>
            </div>
            <div v-else class="report-status report-status-pending">
              <v-icon icon="mdi-clock-outline" size="14" />
              <span>Not Run</span>
            </div>

            <div v-if="analysisResult.chroma_check" class="report-stats">
              <span class="stat-value">{{ analysisResult.chroma_check.total_issues || 0 }}</span>
              <span class="stat-label">issues found</span>
            </div>

            <button 
              v-if="analysisResult.chroma_check" 
              class="download-btn download-btn-purple"
              @click="generatePDF('chroma_check')"
              :disabled="generating === 'chroma_check'"
            >
              <v-icon v-if="generating !== 'chroma_check'" icon="mdi-download" size="16" />
              <v-progress-circular v-else indeterminate size="16" width="2" />
              <span>Download PDF</span>
            </button>

            <button 
              v-if="analysisResult.chroma_check?.marked_html" 
              class="inspect-btn"
              @click="showMarkedHtml(analysisResult.chroma_check.marked_html)"
            >
              <v-icon icon="mdi-eye" size="16" />
              <span>Inspect Webpage</span>
            </button>
          </div>

          <!-- AnchorSense Report -->
          <div :class="['report-card', { 'report-available': analysisResult.anchor_sense }]">
            <div :class="['report-icon', analysisResult.anchor_sense ? 'report-icon-blue' : 'report-icon-disabled']">
              <v-icon :icon="analysisResult.anchor_sense ? 'mdi-link-variant' : 'mdi-alert-circle-outline'" size="28" />
            </div>
            <h4 class="report-name">AnchorSense</h4>
            <p class="report-description">Link Analysis</p>
            
            <div v-if="analysisResult.anchor_sense" class="report-status report-status-available">
              <v-icon icon="mdi-check-circle" size="14" />
              <span>Available</span>
            </div>
            <div v-else class="report-status report-status-pending">
              <v-icon icon="mdi-clock-outline" size="14" />
              <span>Not Run</span>
            </div>

            <div v-if="analysisResult.anchor_sense" class="report-stats">
              <span class="stat-value">{{ analysisResult.anchor_sense.total_issues || 0 }}</span>
              <span class="stat-label">issues found</span>
            </div>

            <button 
              v-if="analysisResult.anchor_sense" 
              class="download-btn download-btn-blue"
              @click="generatePDF('anchor_sense')"
              :disabled="generating === 'anchor_sense'"
            >
              <v-icon v-if="generating !== 'anchor_sense'" icon="mdi-download" size="16" />
              <v-progress-circular v-else indeterminate size="16" width="2" />
              <span>Download PDF</span>
            </button>
          </div>

          <!-- ImgTagTip Report -->
          <div :class="['report-card', { 'report-available': analysisResult.img_tip }]">
            <div :class="['report-icon', analysisResult.img_tip ? 'report-icon-green' : 'report-icon-disabled']">
              <v-icon :icon="analysisResult.img_tip ? 'mdi-image-text' : 'mdi-alert-circle-outline'" size="28" />
            </div>
            <h4 class="report-name">ImgTagTip</h4>
            <p class="report-description">Image Alt Text Analysis</p>
            
            <div v-if="analysisResult.img_tip" class="report-status report-status-available">
              <v-icon icon="mdi-check-circle" size="14" />
              <span>Available</span>
            </div>
            <div v-else class="report-status report-status-pending">
              <v-icon icon="mdi-clock-outline" size="14" />
              <span>Not Run</span>
            </div>

            <div v-if="analysisResult.img_tip" class="report-stats">
              <span class="stat-value">{{ analysisResult.img_tip.total_issues || 0 }}</span>
              <span class="stat-label">issues found</span>
            </div>

            <button 
              v-if="analysisResult.img_tip" 
              class="download-btn download-btn-green"
              @click="generatePDF('img_tip')"
              :disabled="generating === 'img_tip'"
            >
              <v-icon v-if="generating !== 'img_tip'" icon="mdi-download" size="16" />
              <v-progress-circular v-else indeterminate size="16" width="2" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <!-- Combined Report Card -->
        <div class="combined-card">
          <div class="combined-header">
            <div class="combined-icon">
              <v-icon icon="mdi-file-document-multiple" size="24" />
            </div>
            <div class="combined-info">
              <h3 class="combined-title">Combined Report</h3>
              <p class="combined-description">Generate a comprehensive PDF report containing all completed analyses.</p>
            </div>
          </div>
          <button 
            class="primary-btn primary-btn-green"
            @click="generateCombinedPDF"
            :disabled="generating === 'combined' || !hasAnyResults"
          >
            <v-icon v-if="generating !== 'combined'" icon="mdi-download" size="20" />
            <v-progress-circular v-else indeterminate size="20" width="2" color="white" />
            <span>Download Combined Report</span>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="actions-bar">
          <button class="secondary-btn" @click="goBack">
            <v-icon icon="mdi-arrow-left" size="18" />
            <span>Back to Home</span>
          </button>
          <button class="secondary-btn" @click="router.push({ name: 'AIAssistedAccessibilityAnswers', params: { id: testId } })">
            <v-icon icon="mdi-file-search" size="18" />
            <span>View Detailed Results</span>
          </button>
        </div>
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
            <h3 class="dialog-title">Inspect Webpage - Color Contrast Issues</h3>
          </div>
          <button class="dialog-close" @click="showingMarkedHtmlDialog = false">
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>
        <div class="dialog-alert">
          <v-icon icon="mdi-information" size="18" />
          <span>🔴 Red outlines indicate color contrast issues. Elements with insufficient contrast are highlighted.</span>
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
  </PageWrapper>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const testId = computed(() => route.params.id);
const token = computed(() => route.params.token);

const loading = ref(true);
const error = ref(null);
const analysisResult = ref(null);
const generating = ref(null);
const showingMarkedHtmlDialog = ref(false);
const currentMarkedHtml = ref('');

const hasAnyResults = computed(() => {
  if (!analysisResult.value) return false;
  return analysisResult.value.toolsCompleted && analysisResult.value.toolsCompleted.length > 0;
});

// Load analysis results on mount
onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await store.dispatch('aiAssistedResults/loadResult', testId.value);
    analysisResult.value = store.getters['aiAssistedResults/currentResult'];
    
    console.log('Loaded analysis result:', analysisResult.value);
    if (analysisResult.value?.chroma_check) {
      console.log('ChromaCheck data:', analysisResult.value.chroma_check);
      console.log('ChromaCheck violations:', analysisResult.value.chroma_check.violations);
      console.log('ChromaCheck violations count:', analysisResult.value.chroma_check.violations?.length);
    }
    if (analysisResult.value?.anchor_sense) {
      console.log('AnchorSense data:', analysisResult.value.anchor_sense);
      console.log('AnchorSense issues:', analysisResult.value.anchor_sense.issues);
    }
    if (analysisResult.value?.img_tip) {
      console.log('ImgTip data:', analysisResult.value.img_tip);
      console.log('ImgTip images:', analysisResult.value.img_tip.images);
    }
    
    if (!analysisResult.value) {
      error.value = 'No analysis data found for this test.';
    }
  } catch (err) {
    console.error('Error loading analysis results:', err);
    error.value = 'Failed to load analysis data. Please try again.';
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const goBack = () => {
  // If token is present, this might be a public view, don't navigate back
  if (token.value) {
    return;
  }
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } });
};

const goToExamine = () => {
  router.push({ name: 'AIAssistedAccessibilityExamine', params: { id: testId.value } });
};

const showMarkedHtml = (markedHtml) => {
  currentMarkedHtml.value = markedHtml;
  showingMarkedHtmlDialog.value = true;
};

// PDF Generation Functions
const generatePDF = async (toolType) => {
  generating.value = toolType;
  error.value = null;

  try {
    // Ensure we have the latest data from store
    if (!analysisResult.value) {
      await store.dispatch('aiAssistedResults/loadResult', testId.value);
      analysisResult.value = store.getters['aiAssistedResults/currentResult'];
    }

    if (!analysisResult.value) {
      throw new Error('No analysis data found');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let toolName = '';
    let toolData = null;
    let color = [0, 0, 0];

    // Set tool-specific data
    if (toolType === 'chroma_check') {
      toolName = 'ChromaCheck - Color Contrast Analysis';
      toolData = analysisResult.value.chroma_check;
      color = [156, 39, 176]; // Purple
    } else if (toolType === 'anchor_sense') {
      toolName = 'AnchorSense - Link Analysis';
      toolData = analysisResult.value.anchor_sense;
      color = [33, 150, 243]; // Blue
    } else if (toolType === 'img_tip') {
      toolName = 'ImgTagTip - Image Alt Text Analysis';
      toolData = analysisResult.value.img_tip;
      color = [76, 175, 80]; // Green
    }

    if (!toolData) {
      throw new Error(`No data available for ${toolName}. Please run the analysis first.`);
    }

    console.log('Generating PDF for:', toolName);
    console.log('Tool data:', toolData);
    console.log('Violations/Issues:', toolType === 'chroma_check' ? toolData.violations : toolType === 'anchor_sense' ? toolData.issues : toolData.images);

    // Header
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RUXAILAB', 14, 15);
    doc.setFontSize(16);
    doc.text(toolName, 14, 28);

    // Test Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Test Information', 14, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Test ID: ${testId.value}`, 14, 58);
    doc.text(`Input Type: ${analysisResult.value.inputType}`, 14, 64);
    if (analysisResult.value.inputType === 'url') {
      doc.text(`URL: ${analysisResult.value.url}`, 14, 70);
    } else {
      doc.text(`File: ${analysisResult.value.sourceFileName}`, 14, 70);
    }
    doc.text(`Date: ${formatDate(toolData.analyzed_at || analysisResult.value.updatedAt)}`, 14, 76);

    let yPos = 90;

    // Tool-specific content
    if (toolType === 'chroma_check') {
      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Total Issues: ${toolData.total_issues || 0}`, 14, yPos);
      yPos += 6;
      doc.text(`Status: ${toolData.passed ? 'PASSED' : 'FAILED'}`, 14, yPos);
      yPos += 12;

      // Violations Table
      if (toolData.violations && toolData.violations.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Violations', 14, yPos);
        yPos += 6;

        const tableData = toolData.violations.map((v, index) => [
          index + 1,
          v.element?.target?.[0] || v.selector || 'N/A',
          v.description || v.help || 'Color contrast issue',
          v.impact || 'moderate',
          v.element?.html?.substring(0, 100) || 'N/A',
          v.help_url ? 'View Guide' : 'N/A'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Target', 'Description', 'Impact', 'Element HTML', 'Help']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: color },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 50 },
            3: { cellWidth: 20 },
            4: { cellWidth: 45 },
            5: { cellWidth: 15 }
          }
        });
      }
    } else if (toolType === 'anchor_sense') {
      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Total Issues: ${toolData.total_issues || 0}`, 14, yPos);
      yPos += 12;

      // Issues Table
      if (toolData.issues && toolData.issues.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Link Issues', 14, yPos);
        yPos += 6;

        const tableData = toolData.issues.map((issue, index) => [
          index + 1,
          issue.module || 'linkalt',
          issue.issue?.substring(0, 60) || 'N/A',
          issue.element?.substring(0, 80) || 'N/A',
          issue.help?.substring(0, 80) || 'No suggestion'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Module', 'Issue', 'Element', 'How to Fix']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: color },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 45 },
            3: { cellWidth: 50 },
            4: { cellWidth: 45 }
          }
        });
      }
    } else if (toolType === 'img_tip') {
      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Total Issues: ${toolData.total_issues || 0}`, 14, yPos);
      yPos += 12;

      // Images Table
      if (toolData.issues && toolData.issues.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Image Alt Text Issues', 14, yPos);
        yPos += 6;

        const tableData = toolData.issues.map((issue, index) => [
          index + 1,
          issue.module || 'imagealt',
          issue.issue?.substring(0, 50) || 'N/A',
          issue.element?.substring(0, 60) || 'N/A',
          issue.help?.substring(0, 70) || 'No suggestion'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Module', 'Issue', 'Element', 'How to Fix']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: color },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 40 },
            3: { cellWidth: 50 },
            4: { cellWidth: 50 }
          }
        });
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated by RUXAILAB - ${new Date().toLocaleDateString()}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Save PDF
    const fileName = `${toolType}_report_${testId.value}_${Date.now()}.pdf`;
    doc.save(fileName);

    store.commit('SET_TOAST', {
      message: 'PDF report downloaded successfully',
      type: 'success'
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    error.value = `Failed to generate PDF report: ${err.message}`;
    store.commit('SET_TOAST', {
      message: 'Failed to generate PDF report',
      type: 'error'
    });
  } finally {
    generating.value = null;
  }
};

const generateCombinedPDF = async () => {
  generating.value = 'combined';
  error.value = null;

  try {
    // Ensure we have the latest data from store
    if (!analysisResult.value) {
      await store.dispatch('aiAssistedResults/loadResult', testId.value);
      analysisResult.value = store.getters['aiAssistedResults/currentResult'];
    }

    if (!analysisResult.value) {
      throw new Error('No analysis data found');
    }

    console.log('Generating combined PDF with data:', analysisResult.value);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(156, 39, 176);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RUXAILAB', 14, 15);
    doc.setFontSize(16);
    doc.text('Combined Accessibility Report', 14, 28);

    // Test Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Test Information', 14, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Test ID: ${testId.value}`, 14, 58);
    doc.text(`Input Type: ${analysisResult.value.inputType}`, 14, 64);
    if (analysisResult.value.inputType === 'url') {
      doc.text(`URL: ${analysisResult.value.url}`, 14, 70);
    } else {
      doc.text(`File: ${analysisResult.value.sourceFileName}`, 14, 70);
    }
    doc.text(`Tools Completed: ${analysisResult.value.toolsCompleted.length}/3`, 14, 76);
    doc.text(`Total Issues: ${analysisResult.value.totalIssues || 0}`, 14, 82);

    let yPos = 95;

    // Add each tool's report
    const tools = [
      { key: 'chroma_check', name: 'ChromaCheck', color: [156, 39, 176] },
      { key: 'anchor_sense', name: 'AnchorSense', color: [33, 150, 243] },
      { key: 'img_tip', name: 'ImgTagTip', color: [76, 175, 80] }
    ];

    for (const tool of tools) {
      const toolData = analysisResult.value[tool.key];
      if (toolData) {
        // Add new page if needed
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        // Tool header
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(tool.color[0], tool.color[1], tool.color[2]);
        doc.text(`${tool.name} Report`, 14, yPos);
        yPos += 8;

        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Issues Found: ${toolData.total_issues || 0}`, 14, yPos);
        yPos += 10;

        // Add detailed table for each tool
        if (tool.key === 'chroma_check' && toolData.violations && toolData.violations.length > 0) {
          const tableData = toolData.violations.slice(0, 20).map((v, index) => [
            index + 1,
            v.element?.target?.[0] || 'N/A',
            (v.description || v.help || '').substring(0, 50),
            v.impact || 'N/A'
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Target', 'Description', 'Impact']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: tool.color },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 50 },
              2: { cellWidth: 80 },
              3: { cellWidth: 25 }
            }
          });
          yPos = doc.lastAutoTable.finalY + 15;
        } else if (tool.key === 'anchor_sense' && toolData.issues && toolData.issues.length > 0) {
          const tableData = toolData.issues.slice(0, 20).map((issue, index) => [
            index + 1,
            issue.module || 'linkalt',
            (issue.issue || '').substring(0, 40),
            (issue.help || '').substring(0, 50)
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Module', 'Issue', 'How to Fix']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: tool.color },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 60 },
              3: { cellWidth: 65 }
            }
          });
          yPos = doc.lastAutoTable.finalY + 15;
        } else if (tool.key === 'img_tip' && toolData.issues && toolData.issues.length > 0) {
          const tableData = toolData.issues.slice(0, 20).map((issue, index) => [
            index + 1,
            issue.module || 'imagealt',
            (issue.issue || '').substring(0, 40),
            (issue.help || '').substring(0, 50)
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Module', 'Issue', 'How to Fix']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: tool.color },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 60 },
              3: { cellWidth: 65 }
            }
          });
          yPos = doc.lastAutoTable.finalY + 15;
        }
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated by RUXAILAB - ${new Date().toLocaleDateString()}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Save PDF
    const fileName = `combined_report_${testId.value}_${Date.now()}.pdf`;
    doc.save(fileName);

    store.commit('SET_TOAST', {
      message: 'Combined PDF report downloaded successfully',
      type: 'success'
    });
  } catch (err) {
    console.error('Error generating combined PDF:', err);
    error.value = `Failed to generate combined PDF report: ${err.message}`;
    store.commit('SET_TOAST', {
      message: 'Failed to generate combined PDF report',
      type: 'error'
    });
  } finally {
    generating.value = null;
  }
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
  max-width: 960px;
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

.error-banner .close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.error-banner .close-btn:hover {
  background: rgba(185, 28, 28, 0.1);
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

/* Info Card */
.info-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 24px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.info-badge {
  display: inline-block;
  background: #ede9fe;
  color: #7c3aed;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  width: fit-content;
}

.info-url {
  word-break: break-all;
  color: #2563eb;
}

.info-issues {
  color: #d97706;
  font-weight: 600;
}

/* Reports Grid */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* Report Card */
.report-card {
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  transition: all 0.25s ease;
}

.report-card.report-available {
  background: white;
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.1);
}

/* Report Icon */
.report-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.report-icon-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.report-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.report-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.report-icon-disabled {
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
}

/* Report Name */
.report-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
}

/* Report Description */
.report-description {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0 0 16px;
}

/* Report Status */
.report-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.report-status-available {
  background: #dcfce7;
  color: #16a34a;
}

.report-status-pending {
  background: #f3f4f6;
  color: #6b6b6b;
}

/* Report Stats */
.report-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b6b6b;
}

/* Download Button */
.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.download-btn-purple:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.download-btn-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.download-btn-blue:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.download-btn-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.download-btn-green:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* Inspect Button */
.inspect-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  background: white;
  border: 1px solid #7c3aed;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #7c3aed;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inspect-btn:hover {
  background: #ede9fe;
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

/* Combined Card */
.combined-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.combined-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.combined-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.combined-title {
  font-size: 17px;
  font-weight: 600;
  color: #15803d;
  margin: 0 0 4px;
}

.combined-description {
  font-size: 14px;
  color: #16a34a;
  margin: 0;
}

/* Buttons */
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.primary-btn-purple:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.primary-btn-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.primary-btn-green:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* Actions Bar */
.actions-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
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

/* Responsive */
@media (max-width: 900px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .combined-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .combined-card .primary-btn {
    width: 100%;
    justify-content: center;
  }

  .actions-bar {
    flex-direction: column;
  }

  .actions-bar .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .apple-content {
    padding: 0 16px 32px;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
