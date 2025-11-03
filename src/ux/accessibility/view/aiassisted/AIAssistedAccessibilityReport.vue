<template>
  <PageWrapper
    title="AI-Assisted Accessibility Report"
    subtitle="Generate and download comprehensive accessibility reports"
  >
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" lg="10">
          <!-- Loading State -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="purple" size="64" class="mb-4" />
            <p>Loading analysis data...</p>
          </div>

          <!-- Error State -->
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
            <strong>Error:</strong> {{ error }}
          </v-alert>

          <!-- No Data State -->
          <v-card v-if="!loading && !hasAnyResults" variant="outlined">
            <v-card-text class="text-center pa-8">
              <v-icon icon="mdi-file-document-alert-outline" size="80" color="grey" class="mb-4" />
              <h3 class="text-h5 mb-3">No Analysis Data Available</h3>
              <p class="text-body-1 mb-6">
                Please run at least one analysis tool before generating a report.
              </p>
              <v-btn
                color="purple"
                size="large"
                prepend-icon="mdi-arrow-left"
                @click="goToExamine"
              >
                Go to Examine
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Report Content -->
          <div v-if="!loading && hasAnyResults">
            <!-- Test Information Card -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="bg-purple-lighten-5">
                <v-icon icon="mdi-information" class="mr-2" />
                Test Information
              </v-card-title>
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <p><strong>Test ID:</strong> {{ testId }}</p>
                    <p><strong>Input Type:</strong> {{ analysisResult.inputType }}</p>
                    <p v-if="analysisResult.inputType === 'url'"><strong>URL:</strong> {{ analysisResult.url }}</p>
                    <p v-else><strong>File:</strong> {{ analysisResult.sourceFileName }}</p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <p><strong>Tools Completed:</strong> {{ analysisResult.toolsCompleted?.length || 0 }}/3</p>
                    <p><strong>Total Issues:</strong> {{ analysisResult.totalIssues || 0 }}</p>
                    <p><strong>Last Updated:</strong> {{ formatDate(analysisResult.updatedAt) }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Available Reports Cards -->
            <v-row class="mb-4">
              <!-- ChromaCheck Report -->
              <v-col cols="12" md="4">
                <v-card 
                  :color="analysisResult.chroma_check ? 'purple-lighten-5' : 'grey-lighten-3'" 
                  class="pa-4"
                  :class="{ 'report-available': analysisResult.chroma_check }"
                >
                  <div class="text-center">
                    <v-icon 
                      :icon="analysisResult.chroma_check ? 'mdi-palette' : 'mdi-alert-circle-outline'" 
                      size="x-large" 
                      :color="analysisResult.chroma_check ? 'purple' : 'grey'" 
                    />
                    <h3 class="text-h6 mt-2">ChromaCheck</h3>
                    <p class="text-caption mb-3">Color Contrast Analysis</p>
                    <v-chip 
                      :color="analysisResult.chroma_check ? 'green' : 'grey'" 
                      size="small"
                      class="mb-3"
                    >
                      {{ analysisResult.chroma_check ? 'Available' : 'Not Run' }}
                    </v-chip>
                    <div v-if="analysisResult.chroma_check">
                      <p class="text-body-2"><strong>{{ analysisResult.chroma_check.total_issues || 0 }}</strong> issues found</p>
                      <v-btn 
                        color="purple" 
                        size="small" 
                        class="mt-2"
                        @click="generatePDF('chroma_check')"
                        :loading="generating === 'chroma_check'"
                      >
                        <v-icon icon="mdi-download" class="mr-1" />
                        Download PDF
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <!-- AnchorSense Report -->
              <v-col cols="12" md="4">
                <v-card 
                  :color="analysisResult.anchor_sense ? 'blue-lighten-5' : 'grey-lighten-3'" 
                  class="pa-4"
                  :class="{ 'report-available': analysisResult.anchor_sense }"
                >
                  <div class="text-center">
                    <v-icon 
                      :icon="analysisResult.anchor_sense ? 'mdi-link-variant' : 'mdi-alert-circle-outline'" 
                      size="x-large" 
                      :color="analysisResult.anchor_sense ? 'blue' : 'grey'" 
                    />
                    <h3 class="text-h6 mt-2">AnchorSense</h3>
                    <p class="text-caption mb-3">Link Analysis</p>
                    <v-chip 
                      :color="analysisResult.anchor_sense ? 'green' : 'grey'" 
                      size="small"
                      class="mb-3"
                    >
                      {{ analysisResult.anchor_sense ? 'Available' : 'Not Run' }}
                    </v-chip>
                    <div v-if="analysisResult.anchor_sense">
                      <p class="text-body-2"><strong>{{ analysisResult.anchor_sense.total_issues || 0 }}</strong> issues found</p>
                      <v-btn 
                        color="blue" 
                        size="small" 
                        class="mt-2"
                        @click="generatePDF('anchor_sense')"
                        :loading="generating === 'anchor_sense'"
                      >
                        <v-icon icon="mdi-download" class="mr-1" />
                        Download PDF
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <!-- ImgTagTip Report -->
              <v-col cols="12" md="4">
                <v-card 
                  :color="analysisResult.img_tip ? 'green-lighten-5' : 'grey-lighten-3'" 
                  class="pa-4"
                  :class="{ 'report-available': analysisResult.img_tip }"
                >
                  <div class="text-center">
                    <v-icon 
                      :icon="analysisResult.img_tip ? 'mdi-image-text' : 'mdi-alert-circle-outline'" 
                      size="x-large" 
                      :color="analysisResult.img_tip ? 'green' : 'grey'" 
                    />
                    <h3 class="text-h6 mt-2">ImgTagTip</h3>
                    <p class="text-caption mb-3">Image Alt Text Analysis</p>
                    <v-chip 
                      :color="analysisResult.img_tip ? 'green' : 'grey'" 
                      size="small"
                      class="mb-3"
                    >
                      {{ analysisResult.img_tip ? 'Available' : 'Not Run' }}
                    </v-chip>
                    <div v-if="analysisResult.img_tip">
                      <p class="text-body-2"><strong>{{ analysisResult.img_tip.total_issues || 0 }}</strong> issues found</p>
                      <v-btn 
                        color="green" 
                        size="small" 
                        class="mt-2"
                        @click="generatePDF('img_tip')"
                        :loading="generating === 'img_tip'"
                      >
                        <v-icon icon="mdi-download" class="mr-1" />
                        Download PDF
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- Combined Report Option -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="bg-green-lighten-5">
                <v-icon icon="mdi-file-document-multiple" class="mr-2" />
                Combined Report
              </v-card-title>
              <v-card-text class="pa-4">
                <p class="text-body-1 mb-4">
                  Generate a comprehensive PDF report containing all completed analyses.
                </p>
                <v-btn 
                  color="green" 
                  size="large"
                  prepend-icon="mdi-download"
                  @click="generateCombinedPDF"
                  :loading="generating === 'combined'"
                  :disabled="!hasAnyResults"
                >
                  Download Combined Report
                </v-btn>
              </v-card-text>
            </v-card>
            
            <!-- Action Buttons -->
            <div class="d-flex gap-2 mb-4 justify-center">
              <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
                Back to Home
              </v-btn>
              <v-btn variant="outlined" prepend-icon="mdi-file-search" @click="router.push({ name: 'AIAssistedAccessibilityAnswers', params: { id: testId } })">
                View Detailed Results
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
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
.report-available {
  transition: transform 0.2s ease;
  cursor: default;
}

.report-available:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gap-2 {
  gap: 0.5rem;
}
</style>
