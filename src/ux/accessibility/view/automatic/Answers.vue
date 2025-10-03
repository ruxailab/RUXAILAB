<template>
  <PageWrapper
    title="Accessibility Test Answers"
    :loading="loading"
    loading-text="Loading accessibility test results..."
  >
    <!-- Error State -->
    <!-- if the data not available  -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        View detailed accessibility issues and recommendations to improve your
        web content.
      </p>
    </template>
    <v-alert
      v-if="error"
      type="info"
      variant="tonal"
      closable
      class="mb-2 text-body-2 pa-2 "
    >
      <div class="d-flex flex-column align-center justify-center">
        <v-icon
          color="info"
          size="48"
          class="mb-2"
        >
          mdi-info-circle
        </v-icon>
        <span class="text-h6 font-weight-bold mb-1">Infomation</span>
        <span class="text-body-1">No Assessment Available for this Test</span>
      </div>
    </v-alert>

    <!-- Main Report Content -->
    <div v-else-if="report">
      <!-- Report Header -->
      <v-card
        class="mb-2"
        density="compact"
      >
        <v-card-title class="text-body-1 py-2">
          <v-icon
            icon="mdi-web-check"
            class="me-2"
            color="primary"
            size="20"
          />
          Accessibility Report
        </v-card-title>
        <v-card-text class="py-1">
          <v-row
            class="ma-0"
            dense
          >
            <v-col
              cols="12"
              md="6"
              class="py-0"
            >
              <v-chip
                prepend-icon="mdi-link"
                variant="outlined"
                color="primary"
                class="mb-1 text-caption"
                size="small"
              >
                {{ report.ReportUrl }}
              </v-chip>
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="py-0"
            >
              <v-chip
                prepend-icon="mdi-calendar"
                variant="outlined"
                color="secondary"
                class="mb-1 text-caption"
                size="small"
              >
                {{ formatDate(report.ReportDateTime) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Tabs -->
      <v-card density="compact">
        <v-tabs
          v-model="currentTab"
          bg-color="primary"
          align-tabs="center"
          color="white"
          density="compact"
          class="text-caption"
        >
          <v-tab
            v-for="(tab, index) in tabs"
            :key="index"
            :value="index"
            class="text-none px-2"
          >
            <v-icon
              :icon="getTabIcon(index)"
              class="me-1"
              size="16"
            />
            {{ tab }}
          </v-tab>
        </v-tabs>

        <v-window v-model="currentTab">
          <!-- Summary & Issues Tab -->
          <v-window-item :value="0">
            <v-container
              fluid
              class="pa-1"
            >
              <!-- Summary Cards -->
              <v-row
                class="mb-2"
                dense
              >
                <v-col
                  cols="12"
                  sm="4"
                  class="py-0"
                >
                  <v-card
                    :color="
                      getIssueCounts().errors > 0 ? 'error' : 'grey-lighten-3'
                    "
                    :variant="
                      getIssueCounts().errors > 0 ? 'elevated' : 'outlined'
                    "
                    density="compact"
                  >
                    <v-card-text class="text-center py-2 px-1">
                      <div
                        class="text-h5 font-weight-bold mb-0"
                        style="font-size: 1.3rem"
                      >
                        {{ getIssueCounts().errors }}
                      </div>
                      <div class="text-caption">
                        Errors
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                  class="py-0"
                >
                  <v-card
                    :color="
                      getIssueCounts().warnings > 0
                        ? 'warning'
                        : 'grey-lighten-3'
                    "
                    :variant="
                      getIssueCounts().warnings > 0 ? 'elevated' : 'outlined'
                    "
                    density="compact"
                  >
                    <v-card-text class="text-center py-2 px-1">
                      <div
                        class="text-h5 font-weight-bold mb-0"
                        style="font-size: 1.3rem"
                      >
                        {{ getIssueCounts().warnings }}
                      </div>
                      <div class="text-caption">
                        Warnings
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col
                  cols="12"
                  sm="4"
                  class="py-0"
                >
                  <v-card
                    :color="
                      getIssueCounts().notices > 0 ? 'info' : 'grey-lighten-3'
                    "
                    :variant="
                      getIssueCounts().notices > 0 ? 'elevated' : 'outlined'
                    "
                    density="compact"
                  >
                    <v-card-text class="text-center py-2 px-1">
                      <div
                        class="text-h5 font-weight-bold mb-0"
                        style="font-size: 1.3rem"
                      >
                        {{ getIssueCounts().notices }}
                      </div>
                      <div class="text-caption">
                        Notices
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Issues List -->
              <v-card density="compact">
                <v-card-title class="py-2 px-3 text-body-2">
                  <v-icon
                    icon="mdi-alert-circle"
                    class="me-1"
                    size="18"
                  />
                  Issues
                </v-card-title>
                <v-card-text class="py-1 px-2">
                  <v-list density="compact">
                    <v-list-item
                      v-for="(issue, index) in paginatedIssues"
                      :key="(page - 1) * itemsPerPage + index"
                      :active="
                        selectedIssue === (page - 1) * itemsPerPage + index
                      "
                      class="mb-1 py-1 px-1"
                      style="min-height: 36px"
                      @click="selectIssue((page - 1) * itemsPerPage + index)"
                    >
                      <template #prepend>
                        <v-avatar
                          :color="getIssueColor(issue.type)"
                          size="x-small"
                        >
                          {{ (page - 1) * itemsPerPage + index + 1 }}
                        </v-avatar>
                      </template>
                      <v-list-item-title class="text-caption">
                        <v-chip
                          :color="getIssueColor(issue.type)"
                          size="x-small"
                          class="me-1"
                        >
                          {{ issue.type }}
                        </v-chip>
                        <v-chip
                          variant="outlined"
                          size="x-small"
                          class="me-1"
                        >
                          {{ issue.code }}
                        </v-chip>
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ issue.message }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <v-pagination
                    v-if="totalPages > 1"
                    v-model="page"
                    :length="totalPages"
                    class="mt-1"
                    color="primary"
                    size="small"
                  />
                </v-card-text>
              </v-card>
            </v-container>
          </v-window-item>

          <!-- Issues & Preview Tab -->
          <v-window-item :value="1">
            <v-row no-gutters>
              <v-col
                cols="12"
                md="5"
              >
                <v-card
                  height="100%"
                  class="d-flex flex-column"
                  density="compact"
                >
                  <v-card-title class="py-2 px-3 text-body-2">
                    <v-icon
                      icon="mdi-alert-circle"
                      class="me-1"
                      size="18"
                    />
                    Issues
                  </v-card-title>
                  <v-card-text
                    class="flex-grow-1 overflow-y-auto py-1 px-2"
                    @scroll="onInfiniteScroll"
                  >
                    <v-list density="compact">
                      <v-list-item
                        v-for="(issue, index) in infiniteIssues"
                        :key="index"
                        :active="selectedIssue === index"
                        class="mb-1 py-1 px-1"
                        style="min-height: 36px"
                        rounded
                        @click="selectIssue(index)"
                      >
                        <template #prepend>
                          <v-avatar
                            :color="getIssueColor(issue.type)"
                            size="x-small"
                          >
                            {{ index + 1 }}
                          </v-avatar>
                        </template>
                        <v-list-item-title class="text-caption">
                          <v-chip
                            :color="getIssueColor(issue.type)"
                            size="x-small"
                            class="me-1"
                          >
                            {{ issue.type }}
                          </v-chip>
                          <v-chip
                            variant="outlined"
                            size="x-small"
                            class="me-1"
                          >
                            {{ issue.code }}
                          </v-chip>
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                          {{ issue.message }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                    <div
                      v-if="
                        infiniteIssues.length <
                          (report?.ReportIssues?.length || 0)
                      "
                      class="text-center py-2 text-caption grey-text"
                    >
                      Loading more...
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                md="7"
              >
                <v-card
                  height="100%"
                  class="d-flex flex-column"
                  density="compact"
                >
                  <v-card-title class="py-2 px-3 text-body-2">
                    <v-icon
                      icon="mdi-web"
                      class="me-1"
                      size="18"
                    />
                    Webpage Preview
                  </v-card-title>
                  <v-card-text
                    v-if="report.ReportModifiedHtml"
                    class="flex-grow-1 pa-1"
                  >
                    <iframe
                      ref="previewFrame"
                      class="preview-frame"
                      sandbox="allow-same-origin allow-scripts allow-popups"
                      title="Modified webpage preview with accessibility issues highlighted"
                      :srcdoc="report?.ReportModifiedHtml"
                      style="
                        width: 100%;
                        height: 100%;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        min-height: 320px;
                      "
                    />
                  </v-card-text>
                  <v-card-text v-else>
                    <v-alert
                      type="info"
                      variant="tonal"
                      class="pa-2 text-caption"
                      text="No modified HTML content available."
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Issues & Details Tab -->
          <v-window-item :value="2">
            <v-row no-gutters>
              <v-col
                cols="12"
                md="5"
              >
                <v-card
                  height="100%"
                  class="d-flex flex-column"
                  density="compact"
                >
                  <v-card-title class="py-2 px-3 text-body-2">
                    <v-icon
                      icon="mdi-alert-circle"
                      class="me-1"
                      size="18"
                    />
                    Issues
                  </v-card-title>
                  <v-card-text
                    class="flex-grow-1 overflow-y-auto py-1 px-2"
                    style="max-height: 400px"
                    @scroll="onInfiniteScroll"
                  >
                    <v-list density="compact">
                      <v-list-item
                        v-for="(issue, index) in infiniteIssues"
                        :key="index"
                        :active="selectedIssue === index"
                        class="mb-1 py-1 px-1"
                        style="min-height: 36px"
                        rounded
                        @click="selectIssue(index)"
                      >
                        <template #prepend>
                          <v-avatar
                            :color="getIssueColor(issue.type)"
                            size="x-small"
                          >
                            {{ index + 1 }}
                          </v-avatar>
                        </template>
                        <v-list-item-title class="text-caption">
                          <v-chip
                            :color="getIssueColor(issue.type)"
                            size="x-small"
                            class="me-1"
                          >
                            {{ issue.type }}
                          </v-chip>
                          <v-chip
                            variant="outlined"
                            size="x-small"
                            class="me-1"
                          >
                            {{ issue.code }}
                          </v-chip>
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                          {{ issue.message }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                    <div
                      v-if="
                        infiniteIssues.length <
                          (report?.ReportIssues?.length || 0)
                      "
                      class="text-center py-2 text-caption grey-text"
                    >
                      Loading more...
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                md="7"
              >
                <v-card
                  height="100%"
                  class="d-flex flex-column"
                  density="compact"
                >
                  <v-card-title class="py-2 px-3 text-body-2">
                    <v-icon
                      icon="mdi-information"
                      class="me-1"
                      size="18"
                    />
                    Issue Details
                  </v-card-title>
                  <v-card-text class="flex-grow-1 overflow-y-auto py-1 px-2">
                    <div v-if="selectedIssue !== null">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                          >
                            Type
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip
                              :color="
                                getIssueColor(
                                  report.ReportIssues[selectedIssue].type,
                                )
                              "
                              size="x-small"
                            >
                              {{ report.ReportIssues[selectedIssue].type }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                          >
                            Code
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <code
                              class="bg-grey-lighten-4 pa-1 rounded text-caption"
                            >{{
                              report.ReportIssues[selectedIssue].code
                            }}</code>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                          >
                            Message
                          </v-list-item-title>
                          <v-list-item-subtitle class="mt-1 text-caption">
                            {{ report.ReportIssues[selectedIssue].message }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                          >
                            Context
                          </v-list-item-title>
                          <v-list-item-subtitle class="mt-1">
                            <v-sheet
                              color="grey-lighten-5"
                              class="pa-1 rounded"
                            >
                              <pre
                                class="text-caption"
                                style="font-size: 11px"
                              >{{
                                  report.ReportIssues[selectedIssue].context
                                }}
                    </pre>
                            </v-sheet>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="report.ReportIssues[selectedIssue].selector"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                          >
                            Selector
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <code
                              class="bg-grey-lighten-4 pa-1 rounded text-caption"
                            >{{
                              report.ReportIssues[selectedIssue].selector
                            }}</code>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="report.ReportIssues[selectedIssue].runnerExtras"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                          >
                            WCAG Reference
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <v-btn
                              :href="
                                report.ReportIssues[selectedIssue].runnerExtras
                                  .wcagReference
                              "
                              target="_blank"
                              variant="outlined"
                              size="x-small"
                              prepend-icon="mdi-open-in-new"
                            >
                              View WCAG Guidelines
                            </v-btn>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </div>
                    <v-alert
                      v-else
                      type="info"
                      variant="tonal"
                      class="pa-2 text-caption"
                      text="Select an issue from the list to view details"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card>
    </div>
    <div v-else>
      <v-alert
        type="info"
        variant="tonal"
        class="mb-2 text-body-2 pa-2"
      >
        No report data available.
      </v-alert>
    </div>
  </PageWrapper>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

export default {
  name: 'ReportDetail',
  components: {
    PageWrapper
  },
  data() {
    const testId = this.$route.params.testId || this.$route.params.id
    return {
      selectedIssue: null,
      testId,
      tabs: ['Summary & Issues', 'Issues & Preview', 'Issues & Details'],
      currentTab: 0,
      page: 1,
      itemsPerPage: 10,
      infiniteScrollCount: 20, // Number of issues to show initially in infinite scroll
    }
  },
  computed: {
    ...mapState('automaticReport', ['report']),
    loading() {
      return this.$store.getters.loading;
    },
    error() {
      return this.$store.getters.getError;
    },
    paginatedIssues() {
      if (!this.report || !this.report.ReportIssues) return []
      const start = (this.page - 1) * this.itemsPerPage
      return this.report.ReportIssues.slice(start, start + this.itemsPerPage)
    },
    totalPages() {
      if (!this.report || !this.report.ReportIssues) return 1
      return Math.ceil(this.report.ReportIssues.length / this.itemsPerPage) || 1
    },
    infiniteIssues() {
      if (!this.report || !this.report.ReportIssues) return []
      return this.report.ReportIssues.slice(0, this.infiniteScrollCount)
    },
  },
    mounted() {
    if (!this.testId) {
      this.$store.commit('setError', {
        errorCode: 'NO_TEST_ID',
        message: 'No testId provided in route.'
      })
      return
    }
    this.fetchReport(this.testId).then(() => {
      this.$nextTick(() => {
        setTimeout(() => {
          this.renderModifiedHtml()
        }, 100)
      })
    })
  },
  methods: {
    ...mapActions('automaticReport', ['fetchReport']),
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    getIssueCounts() {
      if (
        !this.report ||
        !this.report.ReportIssues ||
        !Array.isArray(this.report.ReportIssues)
      ) {
        return { errors: 0, warnings: 0, notices: 0 }
      }
      return {
        errors: this.report.ReportIssues.filter(
          (issue) => issue && issue.type === 'error',
        ).length,
        warnings: this.report.ReportIssues.filter(
          (issue) => issue && issue.type === 'warning',
        ).length,
        notices: this.report.ReportIssues.filter(
          (issue) => issue && issue.type === 'notice',
        ).length,
      }
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
    getTabIcon(index) {
      const icons = ['mdi-chart-pie', 'mdi-web', 'mdi-information']
      return icons[index] || 'mdi-tab'
    },
    selectIssue(index) {
      this.selectedIssue = index
      this.scrollToIssue(index)
    },
    renderModifiedHtml() {
      if (
        !this.$refs.previewFrame ||
        !this.$refs.previewFrame.parentNode ||
        !this.report?.modifiedHtml
      ) {
        console.warn('Required data or elements not available')
        return
      }
      try {
        const frame = this.$refs.previewFrame
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
              this.selectIssue(index)
            }
          })
        })
      } catch (error) {
        console.error('Error setting up iframe:', error)
      }
    },
    scrollToIssue(index) {
      if (
        !this.$refs.previewFrame ||
        !this.$refs.previewFrame.parentNode ||
        !this.report
      )
        return
      const frame = this.$refs.previewFrame
      const frameDoc = frame.contentDocument || frame.contentWindow.document
      const element = frameDoc.querySelector(`[data-issue-id="issue-${index}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        this.highlightElement(`issue-${index}`)
      }
    },
    highlightElement(issueId) {
      if (!this.$refs.previewFrame || !this.$refs.previewFrame.parentNode)
        return
      const frame = this.$refs.previewFrame
      const frameDoc = frame.contentDocument || frame.contentWindow.document
      this.unhighlightElements()
      const element = frameDoc.querySelector(`[data-issue-id="${issueId}"]`)
      if (element) {
        element.style.boxShadow = '0 0 0 4px rgba(255, 0, 0, 0.5)'
        element.style.zIndex = '1000'
      }
    },
    unhighlightElements() {
      if (!this.$refs.previewFrame || !this.$refs.previewFrame.parentNode)
        return
      const frame = this.$refs.previewFrame
      const frameDoc = frame.contentDocument || frame.contentWindow.document
      const elements = frameDoc.querySelectorAll('.a11y-issue')
      elements.forEach((el) => {
        el.style.boxShadow = ''
        el.style.zIndex = ''
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
.preview-frame {
  background-color: #fff;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

code {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
}

/* Custom scrollbar for better aesthetics */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.error-alert-center {
  text-align: center;
}
</style>
