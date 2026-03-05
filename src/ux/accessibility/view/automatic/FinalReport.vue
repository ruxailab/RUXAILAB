<template>
  <PageWrapper
    :title="$t('Accessibility.finalAccessibilityReport')"
    :loading="loading"
    :loading-text="$t('Accessibility.loadingReportData')"
  >
    <template #subtitle>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('Accessibility.downloadReportSubtitle') }}
      </p>
    </template>

    <!-- Empty State (no report after loading) -->
    <v-alert
      v-if="!pageLoading && !hasReport"
      type="info"
      variant="tonal"
      closable
      class="mb-6 rounded-lg"
      prominent
    >
      <div class="d-flex flex-column align-center justify-center">
        <v-icon
          color="info"
          size="48"
          class="mb-2"
        >
          mdi-information-outline
        </v-icon>
        <span class="text-h6 font-weight-bold mb-2">{{ $t('Accessibility.noDataAvailable') }}</span>
        <span class="text-body-1">{{ $t('Accessibility.runAccessibilityTestFirst') }}</span>
      </div>
    </v-alert>

    <!-- Main Report Content -->
    <div v-else-if="report">
      <!-- Download Actions -->
      <v-card class="mb-6 rounded-lg" elevation="2">
        <v-card-title class="text-h6 py-4 px-6 bg-grey-lighten-4">
          <v-icon icon="mdi-download" class="me-3" size="28" />
          <span>{{ $t('Accessibility.downloadOptions') }}</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="pa-4 rounded-lg border" elevation="0">
                <div class="d-flex flex-column align-center">
                  <v-icon icon="mdi-file-delimited" size="64" color="success" class="mb-4" />
                  <h3 class="text-h6 mb-2">{{ $t('Accessibility.csvExport') }}</h3>
                  <p class="text-body-2 text-center text-medium-emphasis mb-4">
                    {{ $t('Accessibility.csvExportDescription') }}
                  </p>
                  <v-btn
                    color="success"
                    variant="flat"
                    size="large"
                    prepend-icon="mdi-download"
                    :loading="downloadingCsv"
                    @click="downloadCSV"
                  >
                    {{ $t('Accessibility.downloadCsv') }}
                  </v-btn>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="pa-4 rounded-lg border" elevation="0">
                <div class="d-flex flex-column align-center">
                  <v-icon icon="mdi-file-pdf-box" size="64" color="error" class="mb-4" />
                  <h3 class="text-h6 mb-2">{{ $t('Accessibility.pdfReport') }}</h3>
                  <p class="text-body-2 text-center text-medium-emphasis mb-4">
                    {{ $t('Accessibility.pdfReportDescription') }}
                  </p>
                  <v-btn
                    color="error"
                    variant="flat"
                    size="large"
                    prepend-icon="mdi-download"
                    :loading="downloadingPdf"
                    @click="downloadPDF"
                  >
                    {{ $t('Accessibility.downloadPdf') }}
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { showError } from '@/shared/utils/toast'

// Composables
const route = useRoute()
const store = useStore()
const { t } = useI18n()

// Reactive data
const downloadingCsv = ref(false)
const downloadingPdf = ref(false)

// Constants
const testId = computed(() => route.params.testId || route.params.id)

// Store getters
const report = computed(() => store.getters['automaticReport/report'])
const isLoading = computed(() => store.getters.isLoading)

// Do we have report data?
const hasReport = computed(() => !!(report.value && Array.isArray(report.value.ReportIssues) && report.value.ReportIssues.length))

// Local bootstrapping state for initial fetch/polling
const isBootstrapping = ref(true)
const pageLoading = computed(() => isLoading.value || isBootstrapping.value)

// Computed properties
const loading = computed(() => store.getters.isLoading)

const getIssueCounts = () => {
  if (
    !report.value ||
    !report.value.ReportIssues ||
    !Array.isArray(report.value.ReportIssues)
  ) {
    return { errors: 0, warnings: 0, notices: 0 }
  }
  return {
    errors: report.value.ReportIssues.filter(
      (issue) => issue && issue.type === 'error',
    ).length,
    warnings: report.value.ReportIssues.filter(
      (issue) => issue && issue.type === 'warning',
    ).length,
    notices: report.value.ReportIssues.filter(
      (issue) => issue && issue.type === 'notice',
    ).length,
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Download CSV function
const downloadCSV = () => {
  if (!report.value?.ReportIssues || report.value.ReportIssues.length === 0) {
    return
  }

  downloadingCsv.value = true

  try {
    // CSV headers
    const headers = ['Type', 'Code', 'Message', 'Context', 'Selector']
    
    // Convert issues to CSV rows
    const rows = report.value.ReportIssues.map(issue => [
      issue.type || '',
      issue.code || '',
      (issue.message || '').replace(/"/g, '""'), // Escape quotes
      (issue.context || '').replace(/"/g, '""'),
      issue.selector || ''
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    const filename = `accessibility-report-${formatDateForFilename(report.value.ReportDateTime)}.csv`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[FinalReport] downloadCSV failed:', error.message)
    }
    showError(t('Accessibility.failedGenerateCsv'))
  } finally {
    downloadingCsv.value = false
  }
}

// Download PDF function
const downloadPDF = () => {
  if (!report.value?.ReportIssues || report.value.ReportIssues.length === 0) {
    return
  }

  downloadingPdf.value = true

  try {
    const doc = new jsPDF()
    const counts = getIssueCounts()

    // Title
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text('Accessibility Test Report', 14, 20)

    // Report metadata
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`URL: ${report.value.ReportUrl || 'N/A'}`, 14, 30)
    doc.text(`Generated: ${formatDate(report.value.ReportDateTime)}`, 14, 36)

    // Summary section
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Summary', 14, 46)
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`Total Issues: ${counts.errors + counts.warnings + counts.notices}`, 14, 52)
    doc.setTextColor(220, 53, 69) // Red for errors
    doc.text(`Errors: ${counts.errors}`, 14, 58)
    doc.setTextColor(255, 193, 7) // Orange for warnings
    doc.text(`Warnings: ${counts.warnings}`, 60, 58)
    doc.setTextColor(13, 110, 253) // Blue for notices
    doc.text(`Notices: ${counts.notices}`, 106, 58)
    doc.setTextColor(0, 0, 0) // Reset to black

    // Issues table
    const tableData = report.value.ReportIssues.map(issue => [
      (issue.type || '').toUpperCase(),
      issue.code || '',
      issue.message || '',
      issue.selector || ''
    ])

    autoTable(doc, {
      startY: 66,
      head: [['Type', 'Code', 'Message', 'Selector']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [25, 118, 210], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 80 },
        3: { cellWidth: 50 }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 0) {
          const type = data.cell.raw.toLowerCase()
          if (type === 'error') {
            data.cell.styles.textColor = [220, 53, 69]
            data.cell.styles.fontStyle = 'bold'
          } else if (type === 'warning') {
            data.cell.styles.textColor = [255, 193, 7]
            data.cell.styles.fontStyle = 'bold'
          } else if (type === 'notice') {
            data.cell.styles.textColor = [13, 110, 253]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    // Save the PDF
    const filename = `accessibility-report-${formatDateForFilename(report.value.ReportDateTime)}.pdf`
    doc.save(filename)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[FinalReport] downloadPDF failed:', error.message)
    }
    showError(t('Accessibility.failedGeneratePdf'))
  } finally {
    downloadingPdf.value = false
  }
}

const formatDateForFilename = (dateString) => {
  if (!dateString) return 'unknown'
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// Lifecycle hooks
onMounted(async () => {
  if (!testId.value) {
    store.commit('setError', {
      errorCode: 'NO_TEST_ID',
      message: 'No testId provided in route.'
    })
    isBootstrapping.value = false
    return
  }
  
  try {
    await store.dispatch('automaticReport/fetchReport', testId.value)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[FinalReport] fetchReport failed:', error.message)
    }
    showError(t('Accessibility.failedFetchReport'))
  } finally {
    isBootstrapping.value = false
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
