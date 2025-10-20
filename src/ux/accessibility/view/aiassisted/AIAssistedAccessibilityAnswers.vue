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
          <!-- Overall Summary Card -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="bg-purple-lighten-5">
              <v-icon icon="mdi-chart-box" class="mr-2" />
              Analysis Summary
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-card color="blue-lighten-5" class="pa-4">
                    <div class="text-center">
                      <v-icon icon="mdi-check-circle" color="blue" size="x-large" />
                      <h3 class="text-h3">{{ analysisResult.toolsCompleted?.length || 0 }}/3</h3>
                      <p class="text-caption">Tools Completed</p>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card color="orange-lighten-5" class="pa-4">
                    <div class="text-center">
                      <v-icon icon="mdi-alert" color="orange" size="x-large" />
                      <h3 class="text-h3">{{ analysisResult.totalIssues || 0 }}</h3>
                      <p class="text-caption">Total Issues</p>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card :color="getProgressColor()" class="pa-4">
                    <div class="text-center">
                      <v-icon icon="mdi-progress-check" :color="getProgressIconColor()" size="x-large" />
                      <h3 class="text-h3">{{ completionPercentage }}%</h3>
                      <p class="text-caption">Completion</p>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card color="purple-lighten-5" class="pa-4">
                    <div class="text-center">
                      <v-icon icon="mdi-web" color="purple" size="x-large" />
                      <h3 class="text-h6 mt-2">{{ analysisResult.inputType }}</h3>
                      <p class="text-caption">Input Type</p>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <!-- Input Source Info -->
              <v-alert type="info" variant="tonal" density="compact">
                <strong>Source:</strong>
                <span v-if="analysisResult.inputType === 'url'"> {{ analysisResult.url }}</span>
                <span v-else> {{ analysisResult.sourceFileName }}</span>
              </v-alert>
            </v-card-text>
          </v-card>

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
          <ChromaCheckResult
            v-if="selectedTool === 'chroma_check' && chromaCheckResults"
            :results="chromaCheckResults"
            @back="selectedTool = null"
            @view-marked-html="showMarkedHtml"
          />

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
