<template>
  <PageWrapper
    title="Accessibility Report"
    :loading="loading"
    loading-text="Loading accessibility test results..."
  >
    <template #subtitle>
      <p class="text-body-2 text-grey-darken-1">
        {{ $t('Accessibility.viewDetailedIssues') }}
      </p>
    </template>

    <!-- Error / Empty States -->
    <v-alert
      v-if="error"
      type="info"
      variant="tonal"
      class="mb-4 rounded-xl"
      icon="mdi-information-outline"
    >
      {{ $t('Accessibility.noAssessmentAvailable') }}
    </v-alert>

    <v-alert
      v-else-if="!report"
      type="info"
      variant="tonal"
      class="mb-4 rounded-xl"
    >
      {{ $t('Accessibility.noReportData') }}
    </v-alert>

    <!-- Main Report -->
    <template v-else>
      <v-card class="mb-4 rounded-xl" elevation="2">
        <v-card-text class="pa-4">
          <div class="d-flex align-center flex-wrap gap-3 mb-3">
            <v-icon color="primary" size="28">mdi-web-check</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">
                {{ $t('Accessibility.accessibilityReport') }}
              </div>
              <div class="text-caption text-grey">
                {{ formatDate(report.ReportDateTime) }}
              </div>
            </div>
            <v-spacer />
            <v-chip
              prepend-icon="mdi-link-variant"
              variant="outlined"
              color="primary"
              class="text-caption"
            >
              {{ report.ReportUrl }}
            </v-chip>
          </div>

          <!-- Summary stat cards -->
          <v-row dense>
            <v-col v-for="stat in summaryStats" :key="stat.label" cols="4">
              <v-card
                :color="stat.count > 0 ? stat.color : undefined"
                :variant="stat.count > 0 ? 'tonal' : 'outlined'"
                class="rounded-lg text-center pa-2"
                elevation="0"
              >
                <div
                  class="text-h5 font-weight-black"
                  :class="stat.count > 0 ? `text-${stat.color}` : 'text-grey'"
                >
                  {{ stat.count }}
                </div>
                <div
                  class="text-caption font-weight-medium"
                  :class="stat.count > 0 ? `text-${stat.color}` : 'text-grey'"
                >
                  {{ stat.label }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="rounded-xl" elevation="2">
        <v-tabs
          v-model="currentTab"
          bg-color="primary"
          color="white"
          align-tabs="center"
          density="comfortable"
        >
          <v-tab
            v-for="(tab, idx) in tabs"
            :key="idx"
            :value="idx"
            class="text-none text-caption font-weight-medium"
          >
            <v-icon :icon="tabIcons[idx]" class="me-1" size="16" />
            {{ tab }}
          </v-tab>
        </v-tabs>

        <v-window v-model="currentTab">
          <!-- ── Tab 0 : Summary & Issues ──────────────────────── -->
          <v-window-item :value="0">
            <v-container fluid class="pa-3">
              <div
                class="text-body-2 font-weight-medium mb-2 d-flex align-center gap-1"
              >
                <v-icon size="16" color="primary"
                  >mdi-format-list-bulleted</v-icon
                >
                All Issues
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="ms-1"
                  >{{ report.ReportIssues.length }}</v-chip
                >
              </div>
              <v-list lines="two" class="pa-0">
                <v-list-item
                  v-for="(issue, idx) in paginatedIssues"
                  :key="(page - 1) * itemsPerPage + idx"
                  :active="selectedIssue === (page - 1) * itemsPerPage + idx"
                  :active-color="getIssueColor(issue.type)"
                  class="issue-row rounded-lg mb-2 pa-2"
                  @click="selectedIssue = (page - 1) * itemsPerPage + idx"
                >
                  <template #prepend>
                    <v-avatar
                      :color="getIssueColor(issue.type)"
                      size="32"
                      class="me-2 text-caption font-weight-bold text-white"
                    >
                      {{ (page - 1) * itemsPerPage + idx + 1 }}
                    </v-avatar>
                  </template>

                  <v-list-item-title
                    class="text-caption mb-1 d-flex align-center flex-wrap gap-1"
                  >
                    <v-chip
                      :color="getIssueColor(issue.type)"
                      size="x-small"
                      variant="elevated"
                      class="text-uppercase font-weight-bold"
                      >{{ issue.type }}</v-chip
                    >
                    <v-chip
                      v-if="issue.code"
                      variant="tonal"
                      color="grey"
                      size="x-small"
                      class="font-weight-medium"
                      >{{ issue.code }}</v-chip
                    >
                    <v-chip
                      v-if="issue.wcag"
                      variant="outlined"
                      color="primary"
                      size="x-small"
                      >WCAG {{ issue.wcag }}</v-chip
                    >
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{
                    issue.message
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-pagination
                v-if="totalPages > 1"
                v-model="page"
                :length="totalPages"
                class="mt-3"
                color="primary"
                size="small"
                density="compact"
              />
            </v-container>
          </v-window-item>

          <!-- ── Tab 1 : Issues & Preview ──────────────────────── -->
          <v-window-item :value="1">
            <v-row no-gutters style="min-height: 520px">
              <v-col cols="12" md="4" class="border-e">
                <div class="pa-2 border-b">
                  <div
                    class="text-caption font-weight-medium text-grey-darken-2 d-flex align-center gap-1"
                  >
                    <v-icon size="14">mdi-alert-circle-outline</v-icon>
                    Issues
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="ms-1"
                      >{{ report.ReportIssues.length }}</v-chip
                    >
                  </div>
                </div>
                <div
                  class="overflow-y-auto"
                  style="max-height: 480px"
                  @scroll="onInfiniteScroll"
                >
                  <v-list lines="two" density="compact" class="pa-1">
                    <v-list-item
                      v-for="(issue, idx) in infiniteIssues"
                      :key="idx"
                      :active="selectedIssue === idx"
                      :active-color="getIssueColor(issue.type)"
                      class="rounded-lg mb-1"
                      @click="selectIssue(idx)"
                    >
                      <template #prepend>
                        <v-avatar
                          :color="getIssueColor(issue.type)"
                          size="24"
                          class="me-2 text-white"
                          style="font-size: 10px; font-weight: 700"
                          >{{ idx + 1 }}</v-avatar
                        >
                      </template>
                      <v-list-item-title
                        class="text-caption d-flex align-center gap-1 flex-wrap mb-1"
                      >
                        <v-chip
                          :color="getIssueColor(issue.type)"
                          size="x-small"
                          variant="elevated"
                          >{{ issue.type }}</v-chip
                        >
                        <v-chip
                          v-if="issue.code"
                          size="x-small"
                          variant="tonal"
                          color="grey"
                          >{{ issue.code }}</v-chip
                        >
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{
                        issue.message
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <div
                    v-if="
                      infiniteIssues.length <
                      (report?.ReportIssues?.length || 0)
                    "
                    class="text-center text-caption text-grey pa-2"
                  >
                    Loading more...
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="8">
                <div class="pa-2 border-b">
                  <div
                    class="text-caption font-weight-medium text-grey-darken-2 d-flex align-center gap-1"
                  >
                    <v-icon size="14">mdi-monitor-screenshot</v-icon>
                    Page Snapshot
                    <v-chip
                      v-if="selectedIssue !== null"
                      size="x-small"
                      variant="tonal"
                      :color="
                        getIssueColor(report.ReportIssues[selectedIssue]?.type)
                      "
                      >Issue #{{ selectedIssue + 1 }} highlighted</v-chip
                    >
                  </div>
                </div>
                <div class="pa-2" style="height: 480px">
                  <iframe
                    v-if="report.ReportModifiedHtml"
                    ref="previewFrame"
                    class="preview-frame"
                    sandbox="allow-same-origin allow-scripts allow-popups"
                    title="Page snapshot with highlighted accessibility issues"
                    :srcdoc="markedUpHtml"
                    style="
                      width: 100%;
                      height: 100%;
                      border: 1px solid #e0e0e0;
                      border-radius: 8px;
                    "
                  />
                  <v-alert
                    v-else
                    type="info"
                    variant="tonal"
                    class="ma-2 rounded-lg"
                    text="No snapshot available for this report."
                  />
                </div>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- ── Tab 2 : Issues & Details ──────────────────────── -->
          <v-window-item :value="2">
            <v-row no-gutters style="min-height: 520px">
              <v-col cols="12" md="4" class="border-e">
                <div class="pa-2 border-b">
                  <div
                    class="text-caption font-weight-medium text-grey-darken-2 d-flex align-center gap-1"
                  >
                    <v-icon size="14">mdi-alert-circle-outline</v-icon>
                    Issues
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      class="ms-1"
                      >{{ report.ReportIssues.length }}</v-chip
                    >
                  </div>
                </div>
                <div
                  class="overflow-y-auto"
                  style="max-height: 480px"
                  @scroll="onInfiniteScroll"
                >
                  <v-list lines="two" density="compact" class="pa-1">
                    <v-list-item
                      v-for="(issue, idx) in infiniteIssues"
                      :key="idx"
                      :active="selectedIssue === idx"
                      :active-color="getIssueColor(issue.type)"
                      class="rounded-lg mb-1"
                      @click="selectedIssue = idx"
                    >
                      <template #prepend>
                        <v-avatar
                          :color="getIssueColor(issue.type)"
                          size="24"
                          class="me-2 text-white"
                          style="font-size: 10px; font-weight: 700"
                          >{{ idx + 1 }}</v-avatar
                        >
                      </template>
                      <v-list-item-title
                        class="text-caption d-flex align-center gap-1 flex-wrap mb-1"
                      >
                        <v-chip
                          :color="getIssueColor(issue.type)"
                          size="x-small"
                          variant="elevated"
                          >{{ issue.type }}</v-chip
                        >
                        <v-chip
                          v-if="issue.code"
                          size="x-small"
                          variant="tonal"
                          color="grey"
                          >{{ issue.code }}</v-chip
                        >
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">{{
                        issue.message
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <div
                    v-if="
                      infiniteIssues.length <
                      (report?.ReportIssues?.length || 0)
                    "
                    class="text-center text-caption text-grey pa-2"
                  >
                    Loading more...
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="8">
                <div class="pa-2 border-b">
                  <div
                    class="text-caption font-weight-medium text-grey-darken-2 d-flex align-center gap-1"
                  >
                    <v-icon size="14">mdi-information-outline</v-icon>
                    Issue Detail
                  </div>
                </div>

                <div
                  v-if="selectedIssue === null"
                  class="d-flex flex-column align-center justify-center text-grey"
                  style="height: 460px"
                >
                  <v-icon size="48" class="mb-3" color="grey-lighten-2"
                    >mdi-cursor-pointer</v-icon
                  >
                  <div class="text-body-2">Select an issue to view details</div>
                </div>

                <div
                  v-else
                  class="pa-4 overflow-y-auto"
                  style="max-height: 480px"
                >
                  <v-alert
                    :color="getIssueColor(activeIssue.type)"
                    variant="tonal"
                    class="mb-4 rounded-xl"
                    :icon="getSeverityIcon(activeIssue.type)"
                  >
                    <div class="d-flex align-center gap-2 flex-wrap">
                      <v-chip
                        :color="getIssueColor(activeIssue.type)"
                        variant="elevated"
                        size="small"
                        class="text-uppercase font-weight-bold"
                        >{{ activeIssue.type }}</v-chip
                      >
                      <v-chip
                        v-if="activeIssue.code"
                        variant="tonal"
                        color="grey"
                        size="small"
                        >{{ activeIssue.code }}</v-chip
                      >
                      <v-chip
                        v-if="activeIssue.wcag"
                        variant="outlined"
                        color="primary"
                        size="small"
                        >WCAG {{ activeIssue.wcag }}</v-chip
                      >
                    </div>
                  </v-alert>

                  <div class="mb-4">
                    <div
                      class="text-caption text-grey font-weight-medium mb-1 text-uppercase tracking-wider"
                    >
                      Message
                    </div>
                    <div class="text-body-2">{{ activeIssue.message }}</div>
                  </div>

                  <div v-if="activeIssue.selector" class="mb-4">
                    <div
                      class="text-caption text-grey font-weight-medium mb-1 text-uppercase tracking-wider"
                    >
                      CSS Selector
                    </div>
                    <v-sheet color="grey-lighten-5" class="pa-2 rounded-lg">
                      <code
                        class="text-caption"
                        style="word-break: break-all"
                        >{{ activeIssue.selector }}</code
                      >
                    </v-sheet>
                  </div>

                  <div v-if="activeIssue.context" class="mb-4">
                    <div
                      class="text-caption text-grey font-weight-medium mb-1 text-uppercase tracking-wider"
                    >
                      HTML Context
                    </div>
                    <v-sheet
                      color="grey-lighten-5"
                      class="pa-2 rounded-lg"
                      style="overflow-x: auto"
                    >
                      <pre
                        class="text-caption ma-0"
                        style="
                          font-size: 11px;
                          white-space: pre-wrap;
                          word-break: break-all;
                        "
                        >{{ activeIssue.context }}</pre
                      >
                    </v-sheet>
                  </div>

                  <div v-if="activeIssue.runnerExtras?.wcagReference">
                    <div
                      class="text-caption text-grey font-weight-medium mb-2 text-uppercase tracking-wider"
                    >
                      WCAG Reference
                    </div>
                    <v-btn
                      :href="activeIssue.runnerExtras.wcagReference"
                      target="_blank"
                      variant="outlined"
                      color="primary"
                      size="small"
                      prepend-icon="mdi-open-in-new"
                      class="rounded-lg"
                    >
                      View WCAG Guidelines
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card>
    </template>
  </PageWrapper>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { createManagedListeners } from '@/shared/composables/useManagedListeners'

export default {
  name: 'ReportDetail',
  components: { PageWrapper },

  data() {
    const testId = this.$route.params.testId || this.$route.params.id
    return {
      selectedIssue: null,
      testId,
      tabs: ['Summary & Issues', 'Issues & Preview', 'Issues & Details'],
      tabIcons: ['mdi-view-list', 'mdi-monitor-eye', 'mdi-information-outline'],
      currentTab: 0,
      page: 1,
      itemsPerPage: 15,
      infiniteScrollCount: 20,
      iframeListeners: createManagedListeners(),
    }
  },

  computed: {
    ...mapState('automaticReport', ['report']),

    loading() {
      return this.$store.getters.loading
    },
    error() {
      return this.$store.getters.getError
    },

    paginatedIssues() {
      if (!this.report?.ReportIssues) return []
      const start = (this.page - 1) * this.itemsPerPage
      return this.report.ReportIssues.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      if (!this.report?.ReportIssues) return 1
      return Math.ceil(this.report.ReportIssues.length / this.itemsPerPage) || 1
    },

    infiniteIssues() {
      if (!this.report?.ReportIssues) return []
      return this.report.ReportIssues.slice(0, this.infiniteScrollCount)
    },

    activeIssue() {
      if (this.selectedIssue === null || !this.report?.ReportIssues) return null
      return this.report.ReportIssues[this.selectedIssue] ?? null
    },

    summaryStats() {
      const issues = this.report?.ReportIssues ?? []
      const count = (type) => issues.filter((i) => i?.type === type).length
      return [
        { label: 'Errors', color: 'error', count: count('error') },
        { label: 'Warnings', color: 'warning', count: count('warning') },
        { label: 'Notices', color: 'info', count: count('notice') },
      ]
    },

    markedUpHtml() {
      const html = this.report?.ReportModifiedHtml
      const issues = this.report?.ReportIssues
      if (!html || !issues?.length) return html ?? ''

      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const severityColor = {
          error: 'rgba(239,68,68,0.75)',
          warning: 'rgba(245,158,11,0.75)',
          notice: 'rgba(59,130,246,0.6)',
        }

        issues.forEach((issue, index) => {
          if (!issue?.selector) return
          try {
            doc.querySelectorAll(issue.selector).forEach((el) => {
              el.setAttribute('data-issue-id', `issue-${index}`)
              el.classList.add('a11y-marker')
              el.style.outline = `3px solid ${severityColor[issue.type] ?? severityColor.notice}`
              el.style.outlineOffset = '2px'
              el.style.cursor = 'pointer'
            })
          } catch {
            /* skip invalid selector */
          }
        })

        const style = doc.createElement('style')
        style.textContent = [
          '.a11y-marker { transition: box-shadow 0.2s; }',
          '.a11y-marker:hover { box-shadow: 0 0 0 4px rgba(99,102,241,0.35); }',
          '.a11y-marker--active { box-shadow: 0 0 0 6px rgba(99,102,241,0.8) !important; position: relative; z-index: 9999; }',
        ].join('\n')
        doc.head.appendChild(style)
        return doc.documentElement.outerHTML
      } catch {
        return html
      }
    },
  },

  mounted() {
    if (!this.testId) {
      this.$store.commit('setError', {
        errorCode: 'NO_TEST_ID',
        message: 'No testId provided in route.',
      })
      return
    }
    this.fetchReport(this.testId)
  },

  beforeUnmount() {
    this.iframeListeners.removeListeners()
  },

  methods: {
    ...mapActions('automaticReport', ['fetchReport']),

    formatDate(dateString) {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleString()
    },

    getIssueColor(type) {
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
    },

    getSeverityIcon(type) {
      switch (type) {
        case 'error':
          return 'mdi-alert-circle'
        case 'warning':
          return 'mdi-alert'
        case 'notice':
          return 'mdi-information'
        default:
          return 'mdi-help-circle'
      }
    },

    selectIssue(index) {
      this.selectedIssue = index
      this.$nextTick(() => this.scrollToIssue(index))
    },

    scrollToIssue(index) {
      const frame = this.$refs.previewFrame
      if (!frame?.contentDocument) return
      const el = frame.contentDocument.querySelector(
        `[data-issue-id="issue-${index}"]`,
      )
      if (!el) return

      frame.contentDocument
        .querySelectorAll('.a11y-marker--active')
        .forEach((e) => e.classList.remove('a11y-marker--active'))
      el.classList.add('a11y-marker--active')
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },

    onInfiniteScroll(e) {
      const el = e.target
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        this.infiniteScrollCount = Math.min(
          this.infiniteScrollCount + 20,
          this.report?.ReportIssues?.length ?? 0,
        )
      }
    },
  },
}
</script>

<style scoped>
.issue-row {
  border: 1px solid transparent;
  transition:
    border-color 0.15s,
    background-color 0.15s;
  cursor: pointer;
}
.issue-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.15);
}
.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}
.border-e {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.tracking-wider {
  letter-spacing: 0.08em;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
