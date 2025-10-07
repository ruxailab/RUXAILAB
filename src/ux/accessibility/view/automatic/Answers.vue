<template>
  <PageWrapper
    title="Accessibility Test Answers"
    :loading="loading"
    loading-text="Loading accessibility test results..."
  >
    <template #subtitle>
      <p class="text-body-1 text-medium-emphasis">
        View detailed accessibility issues and recommendations to improve your
        web content.
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
        <span class="text-h6 font-weight-bold mb-2">Information</span>
        <span class="text-body-1">No Assessment Available for this Test</span>
      </div>
    </v-alert>

    <!-- Main Report Content -->
    <div v-else-if="report">
      <!-- Report Header -->
      <v-card
        class="mb-6 rounded-lg"
        elevation="2"
      >
        <v-card-title class="text-h6 py-4 px-6 bg-primary">
          <v-icon
            icon="mdi-web-check"
            class="me-3"
            size="28"
          />
          <span class="text-white">Accessibility Report</span>
        </v-card-title>
        <v-card-text class="py-4 px-6">
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-link-variant" class="me-2" color="primary" />
                <span class="text-caption text-medium-emphasis">URL</span>
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ report.ReportUrl }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-calendar-clock" class="me-2" color="primary" />
                <span class="text-caption text-medium-emphasis">Report Date</span>
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ formatDate(report.ReportDateTime) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

  

  <!-- Tabs -->
      <v-card class="rounded-lg" elevation="2">
        <v-tabs
          v-model="currentTab"
          bg-color="grey-lighten-5"
          color="primary"
          height="64"
        >
          <v-tab
            v-for="(tab, index) in tabs"
            :key="index"
            :value="index"
            class="text-none text-subtitle-1 px-6"
          >
            <v-icon
              :icon="getTabIcon(index)"
              class="me-2"
              size="20"
            />
            {{ tab }}
          </v-tab>
        </v-tabs>

        <v-divider />

        <v-window v-model="currentTab">
          <!-- Summary Tab -->
          <v-window-item :value="0">
            <v-container fluid class="pa-6">
              <v-alert
                type="success"
                variant="tonal"
                class="rounded-lg"
                prominent
              >
                <div class="text-h6 mb-2">Summary Overview</div>
                <div class="text-body-1">
                  This report contains {{ getIssueCounts().errors + getIssueCounts().warnings + getIssueCounts().notices }} total accessibility issues.
                  Review the "Issues & Details" tab for comprehensive information.
                </div>
              </v-alert>

              <!-- Metrics & Insights -->
              <v-row class="mt-6">
                <v-col cols="12" sm="4">
                  <v-card class="rounded-lg" elevation="3">
                    <v-card-text class="d-flex flex-column align-center py-8">
                      <div class="text-subtitle-2 text-medium-emphasis mb-3">Accessibility Score</div>
                      <v-progress-circular
                        :model-value="accessibilityScore"
                        :color="getScoreColor(accessibilityScore)"
                        size="120"
                        width="12"
                      >
                        <span class="text-h5 font-weight-bold">{{ accessibilityScore }}%</span>
                      </v-progress-circular>
                      <div class="text-caption text-medium-emphasis mt-3">
                        Based on issue counts and severity
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-card class="rounded-lg" elevation="3">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" sm="6" class="py-3">
                          <div class="text-caption text-medium-emphasis">Total Issues</div>
                          <div class="text-h6">{{ totalIssues }}</div>
                        </v-col>
                        <v-col cols="12" sm="6" class="py-3">
                          <div class="text-caption text-medium-emphasis">Unique Rules Impacted</div>
                          <div class="text-h6">{{ uniqueRulesCount }}</div>
                        </v-col>
                        <v-col cols="12" sm="6" class="py-3">
                          <div class="text-caption text-medium-emphasis">Affected Elements</div>
                          <div class="text-h6">{{ uniqueSelectorsCount }}</div>
                        </v-col>
                        <v-col cols="12" sm="6" class="py-3">
                          <div class="text-caption text-medium-emphasis">Most Common Type</div>
                          <div class="d-flex align-center">
                            <v-chip v-if="mostCommonType && mostCommonType.type" :color="getIssueColor(mostCommonType.type)" size="small" class="me-2">
                              {{ (mostCommonType.type || '').toUpperCase() }}
                            </v-chip>
                            <span class="text-body-2" v-if="mostCommonType && mostCommonType.percent !== null">{{ mostCommonType.percent }}%</span>
                            <span class="text-body-2" v-else>—</span>
                          </div>
                        </v-col>
                        <v-col cols="12" class="py-3">
                          <div class="text-caption text-medium-emphasis">Top Issue</div>
                          <div class="d-flex align-center">
                            <v-chip v-if="topIssueCode" variant="outlined" size="small" class="me-2">{{ topIssueCode.code }}</v-chip>
                            <span class="text-body-2" v-if="topIssueCode">{{ topIssueCode.count }} occurrences</span>
                            <span class="text-body-2" v-else>—</span>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-6">
                <v-col cols="12" sm="4">
                  <v-card
                    :color="getIssueCounts().errors > 0 ? 'error' : 'grey-lighten-4'"
                    class="rounded-lg"
                    elevation="3"
                  >
                    <v-card-text class="text-center py-6">
                      <v-icon
                        :icon="getIssueCounts().errors > 0 ? 'mdi-alert-circle' : 'mdi-check-circle'"
                        :color="getIssueCounts().errors > 0 ? 'white' : 'success'"
                        size="48"
                        class="mb-3"
                      />
                      <div
                        class="text-h3 font-weight-bold mb-2"
                        :class="getIssueCounts().errors > 0 ? 'text-white' : 'text-medium-emphasis'"
                      >
                        {{ getIssueCounts().errors }}
                      </div>
                      <div 
                        class="text-subtitle-1 font-weight-medium"
                        :class="getIssueCounts().errors > 0 ? 'text-white' : 'text-medium-emphasis'"
                      >
                        Errors
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-card
                    :color="getIssueCounts().warnings > 0 ? 'warning' : 'grey-lighten-4'"
                    class="rounded-lg"
                    elevation="3"
                  >
                    <v-card-text class="text-center py-6">
                      <v-icon
                        :icon="getIssueCounts().warnings > 0 ? 'mdi-alert' : 'mdi-check-circle'"
                        :color="getIssueCounts().warnings > 0 ? 'white' : 'success'"
                        size="48"
                        class="mb-3"
                      />
                      <div
                        class="text-h3 font-weight-bold mb-2"
                        :class="getIssueCounts().warnings > 0 ? 'text-white' : 'text-medium-emphasis'"
                      >
                        {{ getIssueCounts().warnings }}
                      </div>
                      <div 
                        class="text-subtitle-1 font-weight-medium"
                        :class="getIssueCounts().warnings > 0 ? 'text-white' : 'text-medium-emphasis'"
                      >
                        Warnings
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-card
                    :color="getIssueCounts().notices > 0 ? 'info' : 'grey-lighten-4'"
                    class="rounded-lg"
                    elevation="3"
                  >
                    <v-card-text class="text-center py-6">
                      <v-icon
                        :icon="getIssueCounts().notices > 0 ? 'mdi-information' : 'mdi-check-circle'"
                        :color="getIssueCounts().notices > 0 ? 'white' : 'success'"
                        size="48"
                        class="mb-3"
                      />
                      <div
                        class="text-h3 font-weight-bold mb-2"
                        :class="getIssueCounts().notices > 0 ? 'text-white' : 'text-medium-emphasis'"
                      >
                        {{ getIssueCounts().notices }}
                      </div>
                      <div 
                        class="text-subtitle-1 font-weight-medium"
                        :class="getIssueCounts().notices > 0 ? 'text-white' : 'text-medium-emphasis'"
                      >
                        Notices
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Issues & Details Tab -->
          <v-window-item :value="1">
            <div class="d-flex flex-column" style="min-height: 600px;">
              <div class="py-4 px-6 bg-grey-lighten-5 d-flex align-center">
                <v-icon icon="mdi-format-list-bulleted" class="me-2" size="24" />
                <span class="text-h6">Issues ({{ filteredIssueCounts.total }})</span>
              </div>

              <div class="pa-4">
                <v-data-table
                  :headers="tableHeaders"
                  :items="tableItems"
                  item-key="rowKey"
                  class="rounded-lg border"
                  density="comfortable"
                  :items-per-page="10"
                >
                  <template #top>
                    <div class="d-flex flex-wrap align-center justify-space-between px-2 pt-2 pb-1">
                      <div class="d-flex align-center flex-wrap">
                        <span class="text-caption text-medium-emphasis me-3">Filter by type:</span>
                        <v-chip-group v-model="activeFilters" multiple class="me-2">
                          <v-chip value="error" color="error" variant="outlined" filter>
                            <v-icon start icon="mdi-alert-circle" />
                            Errors ({{ getIssueCounts().errors }})
                          </v-chip>
                          <v-chip value="warning" color="warning" variant="outlined" filter>
                            <v-icon start icon="mdi-alert" />
                            Warnings ({{ getIssueCounts().warnings }})
                          </v-chip>
                          <v-chip value="notice" color="info" variant="outlined" filter>
                            <v-icon start icon="mdi-information" />
                            Notices ({{ getIssueCounts().notices }})
                          </v-chip>
                        </v-chip-group>
                      </div>
                      <div class="d-flex align-center">
                        <v-btn size="small" variant="text" prepend-icon="mdi-broom" :disabled="isNoneSelected" @click="clearAllFilters">
                          Clear all
                        </v-btn>
                        <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-select-all" :disabled="isAllSelected" class="ms-2" @click="selectAllFilters">
                          Select all
                        </v-btn>
                      </div>
                    </div>
                    <v-divider class="mt-1" />
                  </template>
                  <template #no-data>
                    <div class="pa-6">
                      <v-alert
                        v-if="activeFilters.length === 0"
                        type="info"
                        variant="tonal"
                        class="rounded-lg"
                        prominent
                      >
                        <div class="text-body-2">No filters selected. Use the chips above to select issue types.</div>
                      </v-alert>
                      <v-alert
                        v-else-if="(issuesCounts.errors + issuesCounts.warnings + issuesCounts.notices) > 0"
                        type="info"
                        variant="tonal"
                        class="rounded-lg"
                        prominent
                      >
                        <div class="text-body-2">No issues match the current filters.</div>
                      </v-alert>
                      <v-alert
                        v-else
                        type="success"
                        variant="tonal"
                        class="rounded-lg"
                        prominent
                      >
                        <div class="text-body-2">No accessibility issues found!</div>
                      </v-alert>
                    </div>
                  </template>
                  <template #item.type="{ item }">
                    <v-chip :color="getIssueColor((item?.raw?.type ?? item?.type) || '')" size="small">
                      {{ ((item?.raw?.type ?? item?.type) || '').toUpperCase() }}
                    </v-chip>
                  </template>
                  <template #item.message="{ item }">
                    <span
                      class="text-body-2"
                      style="display:inline-block; max-width: 420px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                      :title="item?.raw?.message ?? item?.message"
                    >
                      {{ item?.raw?.message ?? item?.message }}
                    </span>
                  </template>
                  <template #item.selector="{ item }">
                    <span
                      class="text-body-2"
                      style="display:inline-block; max-width: 300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                      :title="item?.raw?.selector ?? item?.selector"
                    >
                      {{ item?.raw?.selector ?? item?.selector }}
                    </span>
                  </template>
                  <template #item.actions="{ item }">
                    <v-btn
                      size="small"
                      variant="outlined"
                      color="primary"
                      prepend-icon="mdi-eye"
                      @click="openIssueDialog(item?.raw ?? item)"
                    >
                      View
                    </v-btn>
                  </template>
                </v-data-table>
              </div>

              <!-- Issue Detail Dialog -->
              <v-dialog v-model="issueDialog" max-width="800">
                <v-card class="rounded-lg">
                  <v-card-title class="d-flex align-center">
                    <v-icon :icon="getIssueIcon(selectedIssueObj?.type)" class="me-2" />
                    <span>Issue Details</span>
                    <v-spacer />
                    <v-btn icon="mdi-close" variant="text" @click="issueDialog=false" />
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-4">
                    <div class="mb-4">
                      <div class="text-caption text-medium-emphasis mb-2">TYPE</div>
                      <v-chip :color="getIssueColor(selectedIssueObj?.type)" size="large">
                        <v-icon start :icon="getIssueIcon(selectedIssueObj?.type)" />
                        {{ (selectedIssueObj?.type || '').toUpperCase() }}
                      </v-chip>
                    </div>
                    <v-divider class="my-4" />
                    <div class="mb-4">
                      <div class="text-caption text-medium-emphasis mb-2">CODE</div>
                      <code class="bg-grey-lighten-4 pa-2 rounded text-body-2 d-inline-block">
                        {{ selectedIssueObj?.code }}
                      </code>
                    </div>
                    <v-divider class="my-4" />
                    <div class="mb-4">
                      <div class="text-caption text-medium-emphasis mb-2">MESSAGE</div>
                      <div class="text-body-1">
                        {{ selectedIssueObj?.message }}
                      </div>
                    </div>
                    <v-divider class="my-4" />
                    <div class="mb-4">
                      <div class="text-caption text-medium-emphasis mb-2">CONTEXT</div>
                      <v-sheet color="grey-lighten-5" class="pa-3 rounded-lg">
                        <pre class="text-body-2 ma-0">{{ selectedIssueObj?.context }}</pre>
                      </v-sheet>
                    </div>
                    <v-divider v-if="selectedIssueObj?.selector" class="my-4" />
                    <div v-if="selectedIssueObj?.selector" class="mb-4">
                      <div class="text-caption text-medium-emphasis mb-2">SELECTOR</div>
                      <code class="bg-grey-lighten-4 pa-2 rounded text-body-2 d-inline-block">
                        {{ selectedIssueObj?.selector }}
                      </code>
                    </div>
                    <v-divider v-if="selectedIssueObj?.runnerExtras" class="my-4" />
                    <div v-if="selectedIssueObj?.runnerExtras">
                      <div class="text-caption text-medium-emphasis mb-2">WCAG REFERENCE</div>
                      <v-btn
                        :href="selectedIssueObj?.runnerExtras?.wcagReference"
                        target="_blank"
                        variant="outlined"
                        color="primary"
                        prepend-icon="mdi-open-in-new"
                      >
                        View WCAG Guidelines
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </div>
          </v-window-item>
        </v-window>
      </v-card>
    </div>
    <div v-else>
      <v-alert
        type="info"
        variant="tonal"
        class="rounded-lg"
        prominent
      >
        No report data available.
      </v-alert>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

// Composables
const route = useRoute()
const store = useStore()

// Reactive data
const selectedIssue = ref(null)
const currentTab = ref(0)
const infiniteScrollCount = ref(20)
const activeFilters = ref(['error', 'warning', 'notice'])
const issueDialog = ref(false)
const selectedIssueObj = ref(null)

// Constants
const testId = computed(() => route.params.testId || route.params.id)
const tabs = ['Summary', 'Issues & Details']

// Store getters
const report = computed(() => store.getters['automaticReport/report'])
const isLoading = computed(() => store.getters.isLoading)
const issuesSummary = computed(() => store.getters['automaticReport/issuesSummary'])
// Do we have report data?
const hasReport = computed(() => !!(report.value && Array.isArray(report.value.ReportIssues) && report.value.ReportIssues.length))

// Local bootstrapping state for initial fetch/polling
const isBootstrapping = ref(true)
const pageLoading = computed(() => isLoading.value || isBootstrapping.value)

// Computed properties
const loading = computed(() => store.getters.isLoading)

const error = computed(() => store.getters.getError)

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
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getIssueColor = (type) => {
  switch (type) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'notice':
      return 'info'
    default:
      return 'grey'
  }
}

const getTabIcon = (index) => {
  const icons = ['mdi-chart-pie', 'mdi-web', 'mdi-information']
  return icons[index] || 'mdi-tab'
}

const selectIssue = (index) => {
  selectedIssue.value = index
  scrollToIssue(index)
}

const previewFrame = ref(null)

const renderModifiedHtml = () => {
  if (
    !previewFrame.value ||
    !previewFrame.value.parentNode ||
    !report.value?.modifiedHtml
  ) {
    console.warn('Required data or elements not available')
    return
  }
  try {
    const frame = previewFrame.value
    frame.addEventListener('load', () => {
      if (!frame.contentWindow || !frame.contentDocument) {
        console.warn('iframe not ready')
        return
      }
      frame.contentWindow.addEventListener('click', (event) => {
        const issueMarker = event.target.closest('.a11y-issue-marker')
        if (issueMarker) {
          const issueId = issueMarker.getAttribute('data-issue-id')
          const index = parseInt(issueId.replace('issue-', ''))
          selectIssue(index)
        }
      })
    })
  } catch (error) {
    console.error('Error setting up iframe:', error)
  }
}

const scrollToIssue = (index) => {
  if (
    !previewFrame.value ||
    !previewFrame.value.parentNode ||
    !report.value
  )
    return
  const frame = previewFrame.value
  const frameDoc = frame.contentDocument || frame.contentWindow.document
  const element = frameDoc.querySelector(`[data-issue-id="issue-${index}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    highlightElement(`issue-${index}`)
  }
}

const highlightElement = (issueId) => {
  if (!previewFrame.value || !previewFrame.value.parentNode)
    return
  const frame = previewFrame.value
  const frameDoc = frame.contentDocument || frame.contentWindow.document
  unhighlightElements()
  const element = frameDoc.querySelector(`[data-issue-id="${issueId}"]`)
  if (element) {
    element.style.boxShadow = '0 0 0 4px rgba(255, 0, 0, 0.5)'
    element.style.zIndex = '1000'
  }
}

const unhighlightElements = () => {
  if (!previewFrame.value || !previewFrame.value.parentNode)
    return
  const frame = previewFrame.value
  const frameDoc = frame.contentDocument || frame.contentWindow.document
  const elements = frameDoc.querySelectorAll('.a11y-issue')
  elements.forEach((el) => {
    el.style.boxShadow = ''
    el.style.zIndex = ''
  })
}

const onInfiniteScroll = (e) => {
  const el = e.target
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    if (
      infiniteScrollCount.value < (report.value?.ReportIssues?.length || 0)
    ) {
      infiniteScrollCount.value += 20
    }
  }
}

// Lifecycle hooks
onMounted(async () => {
  if (!testId.value) {
    store.commit('setError', {
      errorCode: 'NO_TEST_ID',
      message: 'No testId provided in route.'
    })
    return
  }
  
  try {
    await store.dispatch('automaticReport/fetchReport', testId.value)
    isBootstrapping.value = false
    
    // Wait for next tick and then render
    await new Promise(resolve => setTimeout(resolve, 100))
    renderModifiedHtml()
  } catch (error) {
    console.error('Error fetching report:', error)
    isBootstrapping.value = false
  }
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Roboto Mono', monospace;
  line-height: 1.6;
}

code {
  font-family: 'Roboto Mono', monospace;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 10px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 5px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 5px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}
</style>