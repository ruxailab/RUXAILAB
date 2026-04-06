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

    <!-- Main Report Content -->
    <template v-else>
      <!-- Header Summary -->
      <v-card class="mb-4 rounded-xl" elevation="1">
        <v-card-text class="pa-3">
          <div class="d-flex align-center flex-wrap gap-2 mb-3">
            <v-icon color="primary">mdi-web-check</v-icon>
            <div class="text-subtitle-1 font-weight-bold">
              Accessibility Audit
            </div>
            <v-spacer />
            <v-chip size="small" variant="outlined" color="primary">{{
              report.ReportUrl
            }}</v-chip>
            <v-chip size="small" variant="outlined" color="secondary">{{
              formatDate(report.ReportDateTime)
            }}</v-chip>
          </div>
          <v-row dense>
            <v-col v-for="s in summaryStats" :key="s.label" cols="4">
              <v-card
                :color="s.count > 0 ? s.color : 'grey-lighten-4'"
                :variant="s.count > 0 ? 'tonal' : 'outlined'"
                class="text-center py-1"
                elevation="0"
              >
                <div
                  class="text-h6 font-weight-black"
                  :class="s.count > 0 ? `text-${s.color}` : 'text-grey'"
                >
                  {{ s.count }}
                </div>
                <div class="text-caption">{{ s.label }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Interactive Tabs -->
      <v-card class="rounded-xl overflow-hidden" elevation="1">
        <v-tabs
          v-model="currentTab"
          bg-color="primary"
          color="white"
          align-tabs="center"
          density="compact"
        >
          <v-tab
            v-for="(t, i) in tabs"
            :key="i"
            :value="i"
            class="text-none px-2 text-caption"
          >
            <v-icon :icon="tabIcons[i]" class="me-1" size="16" /> {{ t }}
          </v-tab>
        </v-tabs>

        <v-window v-model="currentTab">
          <!-- Tab 0: List View -->
          <v-window-item :value="0">
            <v-container fluid class="pa-2">
              <v-list lines="two" density="compact" class="pa-0">
                <v-list-item
                  v-for="(issue, idx) in paginatedIssues"
                  :key="idx"
                  :active="selectedIssue === (page - 1) * itemsPerPage + idx"
                  class="rounded-lg mb-1"
                  @click="selectedIssue = (page - 1) * itemsPerPage + idx"
                >
                  <template #prepend>
                    <v-avatar
                      :color="getIssueColor(issue.type)"
                      size="24"
                      class="me-2 text-white text-caption"
                      >{{ (page - 1) * itemsPerPage + idx + 1 }}</v-avatar
                    >
                  </template>
                  <v-list-item-title
                    class="text-caption d-flex align-center gap-1"
                  >
                    <v-chip
                      :color="getIssueColor(issue.type)"
                      size="x-small"
                      label
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
              <v-pagination
                v-if="totalPages > 1"
                v-model="page"
                :length="totalPages"
                class="mt-2"
                color="primary"
                size="x-small"
              />
            </v-container>
          </v-window-item>

          <!-- Tab 1: Visual Preview -->
          <v-window-item :value="1">
            <v-row no-gutters>
              <v-col cols="12" md="4" style="border-right: 1px solid #eee">
                <v-list
                  density="compact"
                  class="overflow-y-auto pa-1"
                  style="max-height: 480px"
                  @scroll="onInfiniteScroll"
                >
                  <v-list-item
                    v-for="(issue, idx) in infiniteIssues"
                    :key="idx"
                    :active="selectedIssue === idx"
                    class="rounded-lg mb-1"
                    @click="selectIssue(idx)"
                  >
                    <template #prepend
                      ><v-avatar
                        :color="getIssueColor(issue.type)"
                        size="20"
                        class="me-2 text-white"
                        style="font-size: 10px"
                        >{{ idx + 1 }}</v-avatar
                      ></template
                    >
                    <v-list-item-title class="text-caption"
                      ><v-chip
                        :color="getIssueColor(issue.type)"
                        size="x-small"
                        >{{ issue.type }}</v-chip
                      >
                      {{ issue.code }}</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="8">
                <iframe
                  v-if="report.ReportModifiedHtml"
                  ref="previewFrame"
                  class="preview-frame"
                  title="Accessibility issue visual preview"
                  sandbox="allow-same-origin allow-scripts"
                  :srcdoc="markedUpHtml"
                  style="width: 100%; height: 480px; border: none"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Tab 2: Technical Detail -->
          <v-window-item :value="2">
            <v-row no-gutters>
              <v-col cols="12" md="4" style="border-right: 1px solid #eee">
                <v-list
                  density="compact"
                  class="overflow-y-auto pa-1"
                  style="max-height: 480px"
                >
                  <v-list-item
                    v-for="(issue, idx) in infiniteIssues"
                    :key="idx"
                    :active="selectedIssue === idx"
                    class="rounded-lg mb-1"
                    @click="selectedIssue = idx"
                  >
                    <template #prepend
                      ><v-avatar
                        :color="getIssueColor(issue.type)"
                        size="20"
                        class="me-2 text-white"
                        style="font-size: 10px"
                        >{{ idx + 1 }}</v-avatar
                      ></template
                    >
                    <v-list-item-title class="text-caption">{{
                      issue.message
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col
                cols="12"
                md="8"
                class="pa-4 bg-grey-lighten-5 overflow-y-auto"
                style="max-height: 480px"
              >
                <div v-if="activeIssue">
                  <v-alert
                    :color="getIssueColor(activeIssue.type)"
                    variant="tonal"
                    class="mb-4 text-caption font-weight-bold"
                    density="compact"
                    >{{ activeIssue.message }}</v-alert
                  >
                  <div class="text-caption text-grey font-weight-bold mb-1">
                    CSS SELECTOR
                  </div>
                  <v-sheet color="white" class="pa-2 border rounded-lg mb-3"
                    ><code class="text-caption">{{
                      activeIssue.selector
                    }}</code></v-sheet
                  >
                  <div class="text-caption text-grey font-weight-bold mb-1">
                    HTML CONTEXT
                  </div>
                  <v-sheet color="white" class="pa-2 border rounded-lg mb-3">
                    <pre
                      class="ma-0 text-caption"
                      style="font-size: 10px; white-space: pre-wrap"
                      >{{ activeIssue.context }}</pre
                    >
                  </v-sheet>
                  <v-btn
                    v-if="activeIssue.runnerExtras?.wcagReference"
                    :href="activeIssue.runnerExtras.wcagReference"
                    target="_blank"
                    variant="outlined"
                    size="x-small"
                    color="primary"
                    >Manual Criteria Reference</v-btn
                  >
                </div>
                <div v-else class="text-center text-grey text-caption mt-10">
                  Select an issue to view details
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
    return {
      selectedIssue: null,
      testId: this.$route.params.testId || this.$route.params.id,
      tabs: ['Summary', 'Visual Preview', 'Details'],
      tabIcons: ['mdi-chart-bar', 'mdi-monitor-eye', 'mdi-code-json'],
      currentTab: 0,
      page: 1,
      itemsPerPage: 10,
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
      const s = (this.page - 1) * this.itemsPerPage
      return this.report.ReportIssues.slice(s, s + this.itemsPerPage)
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
      if (this.selectedIssue === null || this.selectedIssue === undefined) {
        return null
      }
      return this.report?.ReportIssues[this.selectedIssue] ?? null
    },
    summaryStats() {
      const issues = this.report?.ReportIssues ?? []
      const c = (t) => issues.filter((i) => i?.type === t).length
      return [
        { label: 'Errors', color: 'error', count: c('error') },
        { label: 'Warnings', color: 'warning', count: c('warning') },
        { label: 'Notices', color: 'info', count: c('notice') },
      ]
    },
    markedUpHtml() {
      const html = this.report?.ReportModifiedHtml
      const issues = this.report?.ReportIssues
      if (!html || !issues?.length) return html ?? ''
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const colors = {
          error: 'rgba(239,68,68,0.7)',
          warning: 'rgba(245,158,11,0.7)',
          notice: 'rgba(59,130,246,0.5)',
        }
        issues.forEach((issue, idx) => {
          if (!issue?.selector) return
          try {
            doc.querySelectorAll(issue.selector).forEach((el) => {
              el.dataset.issueId = `issue-${idx}`
              el.style.outline = `3px solid ${colors[issue.type] || colors.notice}`
              el.style.outlineOffset = '2px'
            })
          } catch {
            // Malformed CSS selector — skip this issue safely.
          }
        })
        const style = doc.createElement('style')
        style.textContent =
          '.a11y-active { box-shadow: 0 0 0 6px #6366f1 !important; z-index: 9999; }'
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
        message: 'No testId in route.',
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
    formatDate(d) {
      return d ? new Date(d).toLocaleString() : '—'
    },
    getIssueColor(type) {
      const colorMap = { error: 'error', warning: 'warning', notice: 'info' }
      return colorMap[type] ?? 'grey'
    },
    selectIssue(idx) {
      this.selectedIssue = idx
      this.$nextTick(() => {
        const f = this.$refs.previewFrame
        if (!f?.contentDocument) return
        const el = f.contentDocument.querySelector(
          `[data-issue-id="issue-${idx}"]`,
        )
        if (!el) return
        f.contentDocument
          .querySelectorAll('.a11y-active')
          .forEach((e) => e.classList.remove('a11y-active'))
        el.classList.add('a11y-active')
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    },
    onInfiniteScroll(e) {
      const el = e.target
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        if (
          this.infiniteScrollCount < (this.report?.ReportIssues?.length || 0)
        ) {
          this.infiniteScrollCount += 20
        }
      }
    },
  },
}
</script>

<style scoped>
pre {
  font-family: 'Roboto Mono', monospace;
}
.preview-frame {
  background-color: #fff;
}
.overflow-y-auto::-webkit-scrollbar {
  width: 5px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
</style>
