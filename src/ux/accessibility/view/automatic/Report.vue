<template>
  <PageWrapper
    title="Accessibility Test Report"
    :loading="isLoading"
    loading-text="Loading WCAG Data..."
    :side-gap="false"
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Review detailed accessibility issues and success criteria based on WCAG
        guidelines.
      </p>
    </template>
    <v-alert
      v-if="error"
      type="error"
      class="ma-2"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <!-- Full width container without padding -->
    <v-container fluid class="pa-0 ma-0 fill-height">
      <v-row no-gutters class="fill-height">
        <!-- Left Sidebar Navigation -->
        <div class="v-col v-col-2 sidebar fill-height">
          <div class="h-100" style="background-color: #f5f5f5">
            <div class="text-subtitle-1 pa-3 font-weight-bold">
              WCAG Principles
            </div>

            <div v-if="principles.length > 0" class="pa-0">
              <div
                v-for="(principle, pIdx) in principles"
                :key="principle.id || pIdx"
              >
                <!-- Principle Header -->
                <div
                  class="principle-item pa-3 d-flex align-center justify-space-between"
                  :class="{ 'active-principle': selectedPrincipleIdx === pIdx }"
                  @click="selectPrinciple(pIdx)"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="getPrincipleIcon(pIdx)"
                      class="mr-2"
                      size="small"
                    />
                    <span class="text-body-2 font-weight-medium">
                      {{ principle.title }}
                    </span>
                  </div>
                  <v-icon
                    icon="mdi-chevron-down"
                    size="small"
                    class="chevron-icon"
                  />
                </div>

                <!-- Guidelines Dropdown -->
                <div
                  class="guidelines-container"
                  :class="{ 'is-open': selectedPrincipleIdx === pIdx }"
                >
                  <div
                    v-for="(guideline, gIdx) in principle.Guidelines"
                    :key="guideline.id"
                    class="guideline-item pa-2 pl-8"
                    :class="{
                      'active-guideline':
                        selectedPrincipleIdx === pIdx &&
                        selectedGuidelineIdx === gIdx,
                    }"
                    @click.stop="selectGuideline(gIdx, pIdx)"
                  >
                    <span class="text-caption">
                      {{ guideline.id }} {{ guideline.title }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="pa-4">
              <div class="text-grey text-body-2">
                {{ isLoading ? 'Loading...' : 'No principles available' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <v-col cols="7" class="main-content fill-height">
          <!-- Report Header (when report is available) -->
          <v-card
            v-if="report && !reportLoading"
            flat
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
              <v-row class="ma-0" dense>
                <v-col cols="12" md="6" class="py-0">
                  <v-chip
                    prepend-icon="mdi-link"
                    variant="outlined"
                    color="primary"
                    class="mb-1 text-caption"
                    size="small"
                  >
                    {{ report.ReportUrl || 'No URL' }}
                  </v-chip>
                </v-col>
                <v-col cols="12" md="6" class="py-0">
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

          <v-card
            v-if="currentRule.title"
            flat
            class="h-100 pa-4 scrollable-content"
          >
            <!-- Breadcrumb -->
            <v-breadcrumbs
              :items="breadcrumbs"
              class="pa-0 mb-3"
              density="compact"
            >
              <template #divider>
                <v-icon icon="mdi-chevron-right" size="small" />
              </template>
            </v-breadcrumbs>

            <!-- Page Header -->
            <div class="mb-4">
              <h1 class="text-h5 font-weight-bold mb-2">
                {{ currentRule?.id }} {{ currentRule?.title }}
              </h1>
              <!-- Chips -->
              <div class="d-flex gap-1 mb-3">
                <v-chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  class="text-caption"
                >
                  Level {{ currentRule?.level }}
                </v-chip>
                <v-chip
                  size="small"
                  color="info"
                  variant="outlined"
                  class="text-caption"
                >
                  WCAG {{ currentRule?.version }}
                </v-chip>
                <v-chip
                  size="small"
                  color="success"
                  variant="outlined"
                  class="text-caption"
                >
                  {{ currentPrinciple?.title }}
                </v-chip>
              </div>
            </div>

            <!-- Guideline Box -->
            <v-alert variant="tonal" color="info" class="mb-4 pa-3">
              <div class="d-flex align-start">
                <v-icon icon="mdi-information" size="small" class="mr-2 mt-1" />
                <div>
                  <div class="font-weight-bold mb-1">
                    {{ currentGuideline?.id }} {{ currentGuideline?.title }}
                  </div>
                  <div class="text-body-2">
                    {{ currentGuideline?.description }}
                  </div>
                </div>
              </div>
            </v-alert>

            <!-- Success Criterion Section -->
            <div class="mb-4">
              <h2 class="text-h6 font-weight-bold mb-2">Success Criterion</h2>
              <v-card
                variant="outlined"
                class="mb-2"
                style="border: 2px solid #4caf50"
              >
                <v-card-text class="pa-3">
                  <div
                    class="text-subtitle-2 font-weight-bold mb-2 text-success"
                  >
                    {{ currentRule?.id }} {{ currentRule?.title }} (Level
                    {{ currentRule?.level }})
                  </div>
                  <div
                    v-if="
                      currentRule?.criteria && currentRule.criteria.length > 0
                    "
                  >
                    <ul class="criteria-list">
                      <li
                        v-for="(criterion, idx) in currentRule.criteria"
                        :key="idx"
                        class="mb-1 text-body-2"
                      >
                        {{ criterion }}
                      </li>
                    </ul>
                  </div>
                  <div v-else class="text-body-2 text-grey-darken-1">
                    No specific criteria defined for this rule.
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Accessibility Issues Section -->
            <div class="mb-4">
              <h2 class="text-h6 font-weight-bold mb-2 d-flex align-center">
                <v-icon icon="mdi-alert-circle" class="mr-2" size="small" />
                Accessibility Issues
                <v-chip
                  v-if="currentRuleIssueCounts.total > 0"
                  :color="
                    currentRuleIssueCounts.errors > 0
                      ? 'error'
                      : currentRuleIssueCounts.warnings > 0
                      ? 'warning'
                      : 'info'
                  "
                  size="small"
                  class="ml-2"
                >
                  {{ currentRuleIssueCounts.total }}
                </v-chip>
              </h2>

              <!-- Issue Summary Cards -->
              <v-row v-if="currentRuleIssueCounts.total > 0" class="mb-3" dense>
                <v-col cols="4" class="py-1">
                  <v-card
                    :color="
                      currentRuleIssueCounts.errors > 0
                        ? 'error'
                        : 'grey-lighten-3'
                    "
                    :variant="
                      currentRuleIssueCounts.errors > 0
                        ? 'elevated'
                        : 'outlined'
                    "
                    density="compact"
                  >
                    <v-card-text class="text-center py-2 px-1">
                      <div class="text-h6 font-weight-bold mb-0">
                        {{ currentRuleIssueCounts.errors }}
                      </div>
                      <div class="text-caption">Errors</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4" class="py-1">
                  <v-card
                    :color="
                      currentRuleIssueCounts.warnings > 0
                        ? 'warning'
                        : 'grey-lighten-3'
                    "
                    :variant="
                      currentRuleIssueCounts.warnings > 0
                        ? 'elevated'
                        : 'outlined'
                    "
                    density="compact"
                  >
                    <v-card-text class="text-center py-2 px-1">
                      <div class="text-h6 font-weight-bold mb-0">
                        {{ currentRuleIssueCounts.warnings }}
                      </div>
                      <div class="text-caption">Warnings</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4" class="py-1">
                  <v-card
                    :color="
                      currentRuleIssueCounts.notices > 0
                        ? 'info'
                        : 'grey-lighten-3'
                    "
                    :variant="
                      currentRuleIssueCounts.notices > 0
                        ? 'elevated'
                        : 'outlined'
                    "
                    density="compact"
                  >
                    <v-card-text class="text-center py-2 px-1">
                      <div class="text-h6 font-weight-bold mb-0">
                        {{ currentRuleIssueCounts.notices }}
                      </div>
                      <div class="text-caption">Notices</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Issues List -->
              <v-card
                v-if="currentRuleIssues.length > 0"
                variant="outlined"
                class="mb-2"
              >
                <v-card-title class="py-2 px-3 text-body-2">
                  Issues Found ({{ currentRuleIssues.length }})
                </v-card-title>
                <v-card-text class="py-1 px-2">
                  <v-list density="compact">
                    <v-list-item
                      v-for="(issue, index) in currentRuleIssues"
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
                        <v-chip variant="outlined" size="x-small" class="me-1">
                          {{ issue.code }}
                        </v-chip>
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ issue.message }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>

              <!-- No Issues Message -->
              <v-card
                v-else-if="report && !reportLoading"
                variant="outlined"
                class="mb-2"
                color="success"
              >
                <v-card-text class="text-center pa-4">
                  <v-icon
                    icon="mdi-check-circle"
                    size="48"
                    color="success"
                    class="mb-2"
                  />
                  <div
                    class="text-subtitle-2 font-weight-bold text-success mb-1"
                  >
                    No Issues Found
                  </div>
                  <div class="text-body-2 text-grey-darken-1">
                    This rule passed all accessibility checks for the tested
                    page.
                  </div>
                </v-card-text>
              </v-card>

              <!-- Loading State -->
              <v-card v-else-if="reportLoading" variant="outlined" class="mb-2">
                <v-card-text class="text-center pa-4">
                  <v-progress-circular indeterminate size="32" class="mb-2" />
                  <div class="text-body-2">Loading accessibility report...</div>
                </v-card-text>
              </v-card>

              <!-- No Report Available -->
              <v-card v-else variant="outlined" class="mb-2" color="info">
                <v-card-text class="text-center pa-4">
                  <v-icon
                    icon="mdi-information"
                    size="48"
                    color="info"
                    class="mb-2"
                  />
                  <div class="text-subtitle-2 font-weight-bold text-info mb-1">
                    No Report Available
                  </div>
                  <div class="text-body-2 text-grey-darken-1">
                    No accessibility test has been run for this test ID yet.
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Issue Details Section -->
            <div
              v-if="selectedIssue !== null && currentRuleIssues[selectedIssue]"
              class="mb-4"
            >
              <h2 class="text-h6 font-weight-bold mb-2">Issue Details</h2>
              <v-card variant="outlined" class="mb-2">
                <v-card-text class="pa-3">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Type
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          :color="
                            getIssueColor(currentRuleIssues[selectedIssue].type)
                          "
                          size="small"
                        >
                          {{ currentRuleIssues[selectedIssue].type }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Code
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <code
                          class="bg-grey-lighten-4 pa-1 rounded text-caption"
                        >
                          {{ currentRuleIssues[selectedIssue].code }}
                        </code>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-caption font-weight-bold">
                        Message
                      </v-list-item-title>
                      <v-list-item-subtitle class="mt-1 text-caption">
                        {{ currentRuleIssues[selectedIssue].message }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item
                      v-if="currentRuleIssues[selectedIssue].context"
                    >
                      <v-list-item-title class="text-caption font-weight-bold">
                        Context
                      </v-list-item-title>
                      <v-list-item-subtitle class="mt-1">
                        <v-sheet color="grey-lighten-5" class="pa-2 rounded">
                          <pre class="text-caption">{{
                            currentRuleIssues[selectedIssue].context
                          }}</pre>
                        </v-sheet>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item
                      v-if="currentRuleIssues[selectedIssue].selector"
                    >
                      <v-list-item-title class="text-caption font-weight-bold">
                        CSS Selector
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <code
                          class="bg-grey-lighten-4 pa-1 rounded text-caption"
                        >
                          {{ currentRuleIssues[selectedIssue].selector }}
                        </code>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item
                      v-if="
                        currentRuleIssues[selectedIssue].runnerExtras
                          ?.wcagReference
                      "
                    >
                      <v-list-item-title class="text-caption font-weight-bold">
                        WCAG Reference
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <v-btn
                          :href="
                            currentRuleIssues[selectedIssue].runnerExtras
                              .wcagReference
                          "
                          target="_blank"
                          variant="outlined"
                          size="small"
                          prepend-icon="mdi-open-in-new"
                        >
                          View WCAG Guidelines
                        </v-btn>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </div>

            <!-- Navigation -->
            <v-card
              flat
              class="pa-3"
              color="grey-lighten-4"
              style="border-radius: 8px"
            >
              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-chevron-left"
                  :disabled="!hasPrevRule"
                  @click="prevRule"
                >
                  Previous
                </v-btn>
                <div class="text-caption text-grey-darken-1">
                  Rule {{ currentRuleIndex + 1 }} of {{ totalRules }}
                </div>
                <v-btn
                  variant="outlined"
                  size="small"
                  append-icon="mdi-chevron-right"
                  :disabled="!hasNextRule"
                  @click="nextRule"
                >
                  Next
                </v-btn>
              </div>
            </v-card>
          </v-card>

          <v-card v-else flat class="h-100">
            <div
              class="d-flex flex-column align-center justify-center h-100 text-center fill-height pa-4"
            >
              <v-icon
                icon="mdi-file-document-outline"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />

              <h2 class="text-h6 font-weight-regular text-grey-darken-2 mb-1">
                Select a Rule to View Details
              </h2>

              <p class="text-body-2 text-medium-emphasis">
                Choose a principle and guideline from the left sidebar to view
                the success criteria.
              </p>
            </div>
          </v-card>
        </v-col>

        <!-- Right Sidebar - Table of Contents -->
        <v-col cols="3" class="toc-sidebar fill-height">
          <v-card flat class="h-100" color="grey-lighten-5">
            <v-card-title class="text-subtitle-1 pa-3 font-weight-bold">
              Rules
              <v-chip
                v-if="report && allIssues.length > 0"
                size="small"
                color="primary"
                class="ml-2"
              >
                {{ allIssues.length }} total issues
              </v-chip>
            </v-card-title>
            <v-list density="compact" class="pa-1">
              <template
                v-if="
                  currentGuideline?.Rules && currentGuideline.Rules.length > 0
                "
              >
                <v-list-item
                  v-for="(rule, rIdx) in currentGuideline.Rules"
                  :key="rule.id"
                  :value="rIdx"
                  :active="selectedRuleIdx === rIdx"
                  class="text-caption"
                  @click="selectRule(rIdx)"
                >
                  <template #prepend>
                    <v-chip
                      size="x-small"
                      :color="getLevelColor(rule.level)"
                      variant="flat"
                      class="mr-2"
                    >
                      {{ rule.level }}
                    </v-chip>
                  </template>
                  <v-list-item-title class="text-caption">
                    {{ rule.id }} {{ rule.title }}
                  </v-list-item-title>
                  <template #append>
                    <v-chip
                      v-if="getRuleIssueCount(rule.id) > 0"
                      :color="
                        getRuleIssueCount(rule.id, 'error') > 0
                          ? 'error'
                          : getRuleIssueCount(rule.id, 'warning') > 0
                          ? 'warning'
                          : 'info'
                      "
                      size="x-small"
                      class="ml-1"
                    >
                      {{ getRuleIssueCount(rule.id) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
              <v-list-item v-else>
                <v-list-item-title class="text-caption text-grey">
                  No rules available
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import wcagData from '@/assets/WacgAxe.json'

// Store and route
const store = useStore()
const route = useRoute()

// Reactive state
const isLoading = ref(true)
const error = ref('')
const selectedPrincipleIdx = ref(null)
const selectedGuidelineIdx = ref(null)
const selectedRuleIdx = ref(null)
const wcagDataParsed = ref([])
const selectedIssue = ref(null)

// Get testId from route
const testId = computed(() => route.params.testId || route.params.id)

// Computed properties from store
const report = computed(() => store.getters['automaticReport/report'])
const reportLoading = computed(() => store.getters.loading)

// Pa11y issues
const allIssues = computed(() => report.value?.ReportIssues || [])

// Transform the data structure to match the expected format
const transformWcagData = (data) => {
  return data.map((item) => {
    const principleKey = Object.keys(item)[0]
    const principleData = item[principleKey]

    return {
      id: principleKey,
      title: principleData.title,
      description: principleData.description,
      Guidelines: principleData.Guidelines.map((guideline) => ({
        ...guideline,
        Rules: guideline.Rules || [],
      })),
    }
  })
}

// Computed properties
const principles = computed(() => wcagDataParsed.value)

const currentPrinciple = computed(() => {
  return selectedPrincipleIdx.value !== null
    ? principles.value[selectedPrincipleIdx.value]
    : {}
})

const currentGuideline = computed(() => {
  return selectedGuidelineIdx.value !== null &&
    currentPrinciple.value?.Guidelines
    ? currentPrinciple.value.Guidelines[selectedGuidelineIdx.value]
    : {}
})

const currentRule = computed(() => {
  return selectedRuleIdx.value !== null && currentGuideline.value?.Rules
    ? currentGuideline.value.Rules[selectedRuleIdx.value]
    : {}
})

// Filter issues related to current rule
const currentRuleIssues = computed(() => {
  if (!currentRule.value?.id || !allIssues.value.length) return []

  const ruleId = currentRule.value.id

  // Try to match pa11y issues with WCAG rules
  return allIssues.value.filter((issue) => {
    // Direct WCAG reference match
    if (issue.runnerExtras?.wcagReference) {
      return issue.runnerExtras.wcagReference.includes(ruleId)
    }

    // Code-based matching (you can extend this based on your pa11y setup)
    return matchIssueToWcagRule(issue, ruleId)
  })
})

// Function to match pa11y issues to WCAG rules
const matchIssueToWcagRule = (issue, wcagRuleId) => {
  // Create a mapping between pa11y codes and WCAG rules
  const codeToWcagMapping = {
    // 1.1.1 Non-text Content (Images and alt text)
    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37': '1.1.1',
    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H67.1': '1.1.1',
    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H67.2': '1.1.1',
    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2': '1.1.1',
    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H24': '1.1.1',

    // 1.2.1 Audio-only and Video-only
    'WCAG2AA.Principle1.Guideline1_2.1_2_1.G158': '1.2.1',
    'WCAG2AA.Principle1.Guideline1_2.1_2_1.G159': '1.2.1',

    // 1.2.2 Captions (Prerecorded)
    'WCAG2AA.Principle1.Guideline1_2.1_2_2.G87': '1.2.2',
    'WCAG2AA.Principle1.Guideline1_2.1_2_2.G93': '1.2.2',

    // 1.2.3 Audio Description or Media Alternative
    'WCAG2AA.Principle1.Guideline1_2.1_2_3.G69': '1.2.3',
    'WCAG2AA.Principle1.Guideline1_2.1_2_3.G78': '1.2.3',

    // 1.3.1 Info and Relationships
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42.2': '1.3.1',
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H43': '1.3.1',
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H44.NonExistent': '1.3.1',
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H44.NonExistentFragment': '1.3.1',
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48': '1.3.1',
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H71.NoLegend': '1.3.1',
    'WCAG2AA.Principle1.Guideline1_3.1_3_1.H85.2': '1.3.1',

    // 1.3.2 Meaningful Sequence
    'WCAG2AA.Principle1.Guideline1_3.1_3_2.G57': '1.3.2',

    // 1.3.3 Sensory Characteristics
    'WCAG2AA.Principle1.Guideline1_3.1_3_3.G96': '1.3.3',

    // 1.4.1 Use of Color
    'WCAG2AA.Principle1.Guideline1_4.1_4_1.G14': '1.4.1',
    'WCAG2AA.Principle1.Guideline1_4.1_4_1.G182': '1.4.1',

    // 1.4.2 Audio Control
    'WCAG2AA.Principle1.Guideline1_4.1_4_2.F23': '1.4.2',

    // 1.4.3 Contrast (Minimum)
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail': '1.4.3',
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G145.Fail': '1.4.3',
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs': '1.4.3',
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Alpha': '1.4.3',

    // 1.4.4 Resize text
    'WCAG2AA.Principle1.Guideline1_4.1_4_4.G142': '1.4.4',

    // 1.4.5 Images of Text
    'WCAG2AA.Principle1.Guideline1_4.1_4_5.G140': '1.4.5',

    // 2.1.1 Keyboard
    'WCAG2AA.Principle2.Guideline2_1.2_1_1.G90': '2.1.1',
    'WCAG2AA.Principle2.Guideline2_1.2_1_1.SCR20.DblClick': '2.1.1',
    'WCAG2AA.Principle2.Guideline2_1.2_1_1.SCR35': '2.1.1',

    // 2.1.2 No Keyboard Trap
    'WCAG2AA.Principle2.Guideline2_1.2_1_2.F10': '2.1.2',

    // 2.2.1 Timing Adjustable
    'WCAG2AA.Principle2.Guideline2_2.2_2_1.F40.2': '2.2.1',
    'WCAG2AA.Principle2.Guideline2_2.2_2_1.F41.2': '2.2.1',

    // 2.2.2 Pause, Stop, Hide
    'WCAG2AA.Principle2.Guideline2_2.2_2_2.F4': '2.2.2',
    'WCAG2AA.Principle2.Guideline2_2.2_2_2.F47': '2.2.2',

    // 2.3.1 Three Flashes or Below Threshold
    'WCAG2AA.Principle2.Guideline2_3.2_3_1.G19': '2.3.1',

    // 2.4.1 Bypass Blocks
    'WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124.NoSuchID': '2.4.1',
    'WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1': '2.4.1',

    // 2.4.2 Page Titled
    'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl': '2.4.2',
    'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.EmptyTitle': '2.4.2',

    // 2.4.3 Focus Order
    'WCAG2AA.Principle2.Guideline2_4.2_4_3.H4.2': '2.4.3',
    'WCAG2AA.Principle2.Guideline2_4.2_4_3.F85': '2.4.3',

    // 2.4.4 Link Purpose (In Context)
    'WCAG2AA.Principle2.Guideline2_4.2_4_4.H77,H78,H79,H80,H81': '2.4.4',
    'WCAG2AA.Principle2.Guideline2_4.2_4_4.H30.2': '2.4.4',

    // 2.4.5 Multiple Ways
    'WCAG2AA.Principle2.Guideline2_4.2_4_5.G125': '2.4.5',
    'WCAG2AA.Principle2.Guideline2_4.2_4_5.G64': '2.4.5',

    // 2.4.6 Headings and Labels
    'WCAG2AA.Principle2.Guideline2_4.2_4_6.G130': '2.4.6',
    'WCAG2AA.Principle2.Guideline2_4.2_4_6.G131': '2.4.6',

    // 2.4.7 Focus Visible
    'WCAG2AA.Principle2.Guideline2_4.2_4_7.G149,G165': '2.4.7',
    'WCAG2AA.Principle2.Guideline2_4.2_4_7.G195': '2.4.7',

    // 3.1.1 Language of Page
    'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2': '3.1.1',
    'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.3.Lang': '3.1.1',

    // 3.1.2 Language of Parts
    'WCAG2AA.Principle3.Guideline3_1.3_1_2.H58': '3.1.2',
    'WCAG2AA.Principle3.Guideline3_1.3_1_2.H58.1.Lang': '3.1.2',

    // 3.2.1 On Focus
    'WCAG2AA.Principle3.Guideline3_2.3_2_1.G107': '3.2.1',

    // 3.2.2 On Input
    'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2': '3.2.2',

    // 3.2.3 Consistent Navigation
    'WCAG2AA.Principle3.Guideline3_2.3_2_3.G61': '3.2.3',

    // 3.2.4 Consistent Identification
    'WCAG2AA.Principle3.Guideline3_2.3_2_4.G197': '3.2.4',

    // 3.3.1 Error Identification
    'WCAG2AA.Principle3.Guideline3_3.3_3_1.G83,G84,G85': '3.3.1',

    // 3.3.2 Labels or Instructions
    'WCAG2AA.Principle3.Guideline3_3.3_3_2.G131,G162,G17': '3.3.2',

    // 3.3.3 Error Suggestion
    'WCAG2AA.Principle3.Guideline3_3.3_3_3.G177': '3.3.3',

    // 3.3.4 Error Prevention (Legal, Financial, Data)
    'WCAG2AA.Principle3.Guideline3_3.3_3_4.G98,G99,G155,G164,G168.LegalForms':
      '3.3.4',

    // 4.1.1 Parsing
    'WCAG2AA.Principle4.Guideline4_1.4_1_1.F77': '4.1.1',
    'WCAG2AA.Principle4.Guideline4_1.4_1_1.F70': '4.1.1',

    // 4.1.2 Name, Role, Value
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent': '4.1.2',
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.EmptyWithName': '4.1.2',
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.EmptyNoId': '4.1.2',
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Button.Name': '4.1.2',
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.InputText.Name': '4.1.2',
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Select.Name': '4.1.2',
    'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Textarea.Name': '4.1.2',

    // Add more mappings as needed...
  }

  // Try exact match first
  const mappedWcagRule = codeToWcagMapping[issue.code]
  if (mappedWcagRule === wcagRuleId) {
    return true
  }

  // Try partial matches for codes that might have variations
  const issueCodeBase = issue.code.split('.').slice(0, 4).join('.')
  for (const [code, ruleId] of Object.entries(codeToWcagMapping)) {
    const codeBase = code.split('.').slice(0, 4).join('.')
    if (codeBase === issueCodeBase && ruleId === wcagRuleId) {
      return true
    }
  }

  return false
}

// Get issue counts for current rule
const currentRuleIssueCounts = computed(() => {
  const issues = currentRuleIssues.value
  return {
    errors: issues.filter((issue) => issue.type === 'error').length,
    warnings: issues.filter((issue) => issue.type === 'warning').length,
    notices: issues.filter((issue) => issue.type === 'notice').length,
    total: issues.length,
  }
})

// Navigation helpers
const currentRuleIndex = computed(() => {
  let index = 0
  for (let pIdx = 0; pIdx < principles.value.length; pIdx++) {
    const principle = principles.value[pIdx]
    for (let gIdx = 0; gIdx < (principle.Guidelines || []).length; gIdx++) {
      const guideline = principle.Guidelines[gIdx]
      for (let rIdx = 0; rIdx < (guideline.Rules || []).length; rIdx++) {
        if (
          pIdx === selectedPrincipleIdx.value &&
          gIdx === selectedGuidelineIdx.value &&
          rIdx === selectedRuleIdx.value
        ) {
          return index
        }
        index++
      }
    }
  }
  return 0
})

const totalRules = computed(() => {
  let total = 0
  principles.value.forEach((principle) => {
    principle.Guidelines?.forEach((guideline) => {
      total += guideline.Rules?.length || 0
    })
  })
  return total
})

const hasNextRule = computed(
  () => currentRuleIndex.value < totalRules.value - 1,
)
const hasPrevRule = computed(() => currentRuleIndex.value > 0)

// Breadcrumb items
const breadcrumbs = computed(() => {
  return [
    {
      title: 'WCAG',
      disabled: false,
      href: '#',
    },
    {
      title: currentPrinciple.value?.title || '',
      disabled: false,
      href: '#',
    },
    {
      title: currentGuideline.value?.title
        ? `${currentGuideline.value.id} ${currentGuideline.value.title}`
        : '',
      disabled: true,
    },
  ]
})

// Helper functions
const getPrincipleIcon = (index) => {
  switch (index) {
    case 0:
      return 'mdi-eye'
    case 1:
      return 'mdi-mouse'
    case 2:
      return 'mdi-brain'
    default:
      return 'mdi-shield-check'
  }
}

const getLevelColor = (level) => {
  switch (level) {
    case 'A':
      return 'success'
    case 'AA':
      return 'warning'
    case 'AAA':
      return 'error'
    default:
      return 'grey'
  }
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

// Get issue count for a specific rule
const getRuleIssueCount = (ruleId, issueType = null) => {
  if (!allIssues.value.length) return 0

  const ruleIssues = allIssues.value.filter((issue) => {
    // Direct WCAG reference match
    if (issue.runnerExtras?.wcagReference) {
      return issue.runnerExtras.wcagReference.includes(ruleId)
    }

    // Code-based matching
    return matchIssueToWcagRule(issue, ruleId)
  })

  if (issueType) {
    return ruleIssues.filter((issue) => issue.type === issueType).length
  }

  return ruleIssues.length
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Navigation methods
const selectPrinciple = (pIdx) => {
  if (pIdx === selectedPrincipleIdx.value) {
    // Collapse if already selected
    selectedPrincipleIdx.value = null
    selectedGuidelineIdx.value = null
    selectedRuleIdx.value = null
    selectedIssue.value = null
    return
  }

  selectedPrincipleIdx.value = pIdx
  selectedGuidelineIdx.value = null
  selectedRuleIdx.value = null
  selectedIssue.value = null

  // Auto-select first guideline and rule if available
  const newPrinciple = principles.value[pIdx]
  if (newPrinciple?.Guidelines?.length > 0) {
    selectedGuidelineIdx.value = 0
    const firstGuideline = newPrinciple.Guidelines[0]
    if (firstGuideline?.Rules?.length > 0) {
      selectedRuleIdx.value = 0
    }
  }
}

const selectGuideline = (gIdx, pIdx = null) => {
  if (pIdx !== null) {
    selectedPrincipleIdx.value = pIdx
  }

  selectedGuidelineIdx.value = gIdx
  selectedRuleIdx.value = null
  selectedIssue.value = null

  // Auto-select first rule if available
  const guideline = currentPrinciple.value?.Guidelines?.[gIdx]
  if (guideline?.Rules?.length > 0) {
    selectedRuleIdx.value = 0
  }
}

const selectRule = (rIdx) => {
  selectedRuleIdx.value = rIdx
  selectedIssue.value = null
}

const selectIssue = (issueIdx) => {
  selectedIssue.value = issueIdx
}

const nextRule = () => {
  const currentIdx = currentRuleIndex.value
  if (currentIdx < totalRules.value - 1) {
    navigateToRuleByIndex(currentIdx + 1)
  }
}

const prevRule = () => {
  const currentIdx = currentRuleIndex.value
  if (currentIdx > 0) {
    navigateToRuleByIndex(currentIdx - 1)
  }
}

const navigateToRuleByIndex = (targetIndex) => {
  let index = 0
  for (let pIdx = 0; pIdx < principles.value.length; pIdx++) {
    const principle = principles.value[pIdx]
    for (let gIdx = 0; gIdx < (principle.Guidelines || []).length; gIdx++) {
      const guideline = principle.Guidelines[gIdx]
      for (let rIdx = 0; rIdx < (guideline.Rules || []).length; rIdx++) {
        if (index === targetIndex) {
          selectedPrincipleIdx.value = pIdx
          selectedGuidelineIdx.value = gIdx
          selectedRuleIdx.value = rIdx
          selectedIssue.value = null
          return
        }
        index++
      }
    }
  }
}

// Watch for rule changes to reset selected issue
watch(
  () => currentRule.value?.id,
  () => {
    selectedIssue.value = null
  },
)

// Initialize component
onMounted(async () => {
  try {
    isLoading.value = true

    // Transform and load the WCAG data
    wcagDataParsed.value = transformWcagData(wcagData)

    // Fetch pa11y report if testId is available
    if (testId.value) {
      await store.dispatch('automaticReport/fetchReport', testId.value)
    }

    // Auto-select first principle, guideline, and rule
    if (wcagDataParsed.value.length > 0) {
      selectedPrincipleIdx.value = 0
      const firstPrinciple = wcagDataParsed.value[0]

      if (firstPrinciple?.Guidelines?.length > 0) {
        selectedGuidelineIdx.value = 0
        const firstGuideline = firstPrinciple.Guidelines[0]

        if (firstGuideline?.Rules?.length > 0) {
          selectedRuleIdx.value = 0
        }
      }
    }
  } catch {
    error.value = 'Failed to load data. Please try refreshing the page.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.principle-item,
.guideline-item {
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease-in-out, border-left-color 0.2s ease;
}

/* Hover Effect */
.principle-item:hover,
.guideline-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Active Principle State */
.active-principle {
  background-color: rgba(63, 81, 181, 0.08);
  font-weight: bold;
  border-left-color: #3f51b5;
}

/* Active Guideline State */
.active-guideline {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

/* Visual Feedback on Click */
.principle-item:active,
.guideline-item:active {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Chevron Icon for dropdown */
.chevron-icon {
  transition: transform 0.3s ease-in-out;
}

.active-principle .chevron-icon {
  transform: rotate(180deg);
}

/* Container for the guidelines to create the dropdown effect */
.guidelines-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease-in-out;
  background-color: #fafafa;
}

.guidelines-container.is-open {
  max-height: 500px;
}

.scrollable-content {
  overflow-y: auto;
  height: 100vh;
}

.criteria-list {
  list-style-type: disc;
  margin: 0;
  padding-left: 20px;
}

.criteria-list li {
  margin-bottom: 8px;
}

.sidebar {
  border-right: 1px solid #e0e0e0;
}

.toc-sidebar {
  border-left: 1px solid #e0e0e0;
}

.main-content {
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}

/* Compact spacing adjustments */
.v-card-title {
  padding-bottom: 8px !important;
}

.v-breadcrumbs {
  padding-top: 0 !important;
}

/* Hover effects for better UX */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Active list item styling */
.v-list-item--active {
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
}

/* Responsive adjustments */
@media (max-width: 1366px) {
  .text-h5 {
    font-size: 1.25rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }

  .v-card-text {
    padding: 12px !important;
  }
}

/* Loading and error states */
.v-overlay {
  z-index: 1000;
}

/* Chip styling */
.v-chip {
  font-size: 0.75rem !important;
}

/* Navigation styling */
.v-btn[disabled] {
  opacity: 0.5;
}
</style>
