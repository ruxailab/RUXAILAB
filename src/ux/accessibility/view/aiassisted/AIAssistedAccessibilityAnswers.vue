<template>
    <PageWrapper
      title="AI-Assisted Analysis Results"
      subtitle="View and analyze accessibility findings from AI-powered tools"
    >
    <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Loading State -->
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="purple" size="64" class="mb-4" />
          <p>Loading analysis results...</p>
        </div>

        <!-- Error State -->
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <!-- No Analysis Yet -->
        <v-card v-if="!loading && !analysisResult" variant="outlined" class="mb-4">
          <v-card-text class="text-center pa-8">
            <v-icon icon="mdi-alert-circle-outline" size="80" color="grey" class="mb-4" />
            <h3 class="text-h5 mb-3">No Analysis Results Yet</h3>
            <p class="text-body-1 mb-6">
              Start by examining your webpage with one of the available AI tools
            </p>
            <v-btn
              color="purple"
              size="large"
              prepend-icon="mdi-arrow-right"
              @click="goToExamine"
            >
              Go to Examine
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Analysis Results -->
        <div v-if="analysisResult && !loading">
          <!-- Step 1: Tool Selection (if no tool selected) -->
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

          <!-- Step 2: Display Selected Tool Result -->
          <div v-if="selectedTool === 'chroma_check' && chromaCheckResults">
            <!-- Primary Actions: Inspect & Download -->
            <v-card v-if="chromaCheckResults?.marked_html" variant="outlined" class="mb-4">
              <v-card-title class="bg-purple-lighten-5">
                <v-icon icon="mdi-magnify" class="mr-2" />
                Inspect and Export
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex flex-wrap gap-2">
                  <v-btn color="green" prepend-icon="mdi-eye" @click="showMarkedHtml(chromaCheckResults?.marked_html)">
                    Inspect Webpage
                  </v-btn>
                  <v-btn color="blue" prepend-icon="mdi-download" @click="downloadMarkedHtmlFromAnswers">
                    Download Report
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Summary Stats -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="bg-purple-lighten-5">
                <v-icon icon="mdi-chart-box" class="mr-2" />
                Analysis Summary
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex flex-wrap align-center gap-3">
                  <div class="d-flex align-center px-3 py-2 rounded" :class="chromaCheckResults.passed ? 'bg-green-lighten-5' : 'bg-red-lighten-5'">
                    <v-icon :icon="chromaCheckResults.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" :color="chromaCheckResults.passed ? 'green' : 'red'" class="mr-2" />
                    <div class="text-body-2">
                      <div class="font-weight-medium">Overall Status</div>
                      <div>{{ chromaCheckResults.passed ? 'Passed' : 'Failed' }}</div>
                    </div>
                  </div>

                  <div class="d-flex align-center px-3 py-2 rounded bg-orange-lighten-5">
                    <v-icon icon="mdi-alert" color="orange" class="mr-2" />
                    <div class="text-body-2">
                      <div class="font-weight-medium">Total Issues</div>
                      <div>{{ chromaCheckResults.total_issues }}</div>
                    </div>
                  </div>

                  <div class="d-flex align-center px-3 py-2 rounded bg-blue-lighten-5">
                    <v-icon icon="mdi-file-document" color="blue" class="mr-2" />
                    <div class="text-body-2">
                      <div class="font-weight-medium">Violations Found</div>
                      <div>{{ (chromaCheckResults.violations?.length || 0) }}</div>
                    </div>
                  </div>

                  <div class="d-flex align-center px-3 py-2 rounded bg-purple-lighten-5">
                    <v-icon icon="mdi-eye" color="purple" class="mr-2" />
                    <div class="text-body-2">
                      <div class="font-weight-medium">Standard</div>
                      <div>WCAG 2.1</div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Violations List -->
            <v-card v-if="(chromaCheckResults.violations?.length || 0) > 0" variant="outlined" class="mb-4">
              <v-card-title class="bg-red-lighten-5">
                <v-icon icon="mdi-alert-circle" class="mr-2" />
                Color Contrast Issues ({{ chromaCheckResults.violations.length }})
              </v-card-title>
              <v-card-text class="pa-4">
                <v-data-table
                  :headers="violationHeaders"
                  :items="paginatedRowsCC"
                  class="elevation-0"
                >
                  <template #item.impact="{ value }">
                    <v-chip :color="getImpactColor(value)" size="small">{{ value }}</v-chip>
                  </template>
                  <template #item.elementHtml="{ value }">
                    <pre class="ma-0 pa-2 bg-grey-lighten-4 rounded" style="max-width: 520px; white-space: pre-wrap; word-break: break-word;">{{ truncateHtml(value) }}</pre>
                  </template>
                  <template #item.help_url="{ value }">
                    <v-btn :href="value" target="_blank" color="purple" variant="text" size="small">
                      Guide <v-icon icon="mdi-open-in-new" end />
                    </v-btn>
                  </template>
                  <template #item.actions="{ item }">
                    <v-btn color="purple" variant="text" size="small" @click="openViolationDialogCC(item.violation)">
                      Details
                    </v-btn>
                  </template>
                </v-data-table>
                <div class="d-flex justify-end mt-3">
                  <v-pagination v-model="pageCC" :length="pageCountCC" density="comfortable" />
                </div>
              </v-card-text>
            </v-card>

            <div class="d-flex justify-space-between">
              <v-btn color="grey" variant="outlined" prepend-icon="mdi-arrow-left" @click="selectedTool = null">
                Back
              </v-btn>
              <v-btn color="grey" variant="outlined" prepend-icon="mdi-refresh" @click="goToExamine">
                New Analysis
              </v-btn>
            </div>
          </div>

          <AnchorSenseResult
            v-if="selectedTool === 'anchor_sense' && anchorSenseResults"
            :results="anchorSenseResults"
            @back="selectedTool = null"
          />

          <ImgTagTipResult
            v-if="selectedTool === 'img_tip' && imgTipResults"
            :results="imgTipResults"
            @back="selectedTool = null"
          />
        </div>
        
        <!-- Back Button -->
        <div class="text-center mt-6">
          <v-btn color="purple" variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
            Back to Home
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>

    <!-- Marked HTML Dialog -->
    <v-dialog v-model="showingMarkedHtmlDialog" fullscreen>
      <v-card>
        <v-toolbar color="purple">
          <v-toolbar-title>Marked HTML Preview</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showingMarkedHtmlDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-alert type="warning" variant="tonal" class="ma-4">
            🔴 Red outlines indicate contrast issues. Hover over them to see details.
          </v-alert>
          <iframe
            v-if="currentMarkedHtml"
            :srcdoc="currentMarkedHtml"
            frameborder="0"
            style="width: 100%; height: calc(100vh - 140px);"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Violation Details Dialog (ChromaCheck) -->
    <v-dialog v-model="showViolationDialogCC" max-width="900">
      <v-card>
        <v-toolbar color="purple">
          <v-toolbar-title>Issue Details</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showViolationDialogCC = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-chip :color="getImpactColor(selectedViolationCC?.impact)" size="small" class="mr-2">
              {{ selectedViolationCC?.impact }}
            </v-chip>
            <span class="font-weight-medium">{{ selectedViolationCC?.description }}</span>
          </div>
          <p class="text-body-2 mb-3">{{ selectedViolationCC?.help }}</p>

          <v-card variant="outlined" class="mb-3">
            <v-card-text>
              <strong>HTML Element:</strong>
              <pre class="mt-2 pa-2 bg-grey-lighten-4 rounded">{{ selectedViolationCC?.element?.html }}</pre>
            </v-card-text>
          </v-card>

          <v-alert v-if="selectedViolationCC?.failure_summary" type="info" variant="tonal" density="compact" class="mb-3">
            {{ selectedViolationCC?.failure_summary }}
          </v-alert>

          <div class="d-flex gap-2">
            <v-btn v-if="selectedViolationCC?.help_url" :href="selectedViolationCC?.help_url" target="_blank" color="purple" variant="text" size="small">
              Learn More <v-icon icon="mdi-open-in-new" end />
            </v-btn>
            <v-spacer />
            <v-btn color="grey" variant="outlined" @click="showViolationDialogCC = false">Close</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    </PageWrapper>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
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

// Get individual tool results
const chromaCheckResults = computed(() => store.getters['aiAssistedResults/chromaCheckResults']);
const anchorSenseResults = computed(() => store.getters['aiAssistedResults/anchorSenseResults']);
const imgTipResults = computed(() => store.getters['aiAssistedResults/imgTipResults']);

// Load analysis result on mount
onMounted(async () => {
  loading.value = true;
  try {
    await store.dispatch('aiAssistedResults/loadResult', testId.value);
  } catch (err) {
    console.error('Error loading analysis result:', err);
    error.value = 'Failed to load analysis results';
  } finally {
    loading.value = false;
  }
});

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

const selectTool = (toolName) => {
  selectedTool.value = toolName;
  // Scroll to top for better UX
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const showMarkedHtml = (markedHtml) => {
  currentMarkedHtml.value = markedHtml;
  showingMarkedHtmlDialog.value = true;
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
.tool-completed {
  border: 2px solid rgb(var(--v-theme-green));
  background-color: rgba(76, 175, 80, 0.05);
}

.tool-pending {
  border: 2px solid rgb(var(--v-theme-grey-lighten-2));
  opacity: 0.9;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.85rem;
  font-family: 'Courier New', Courier, monospace;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}
</style>
