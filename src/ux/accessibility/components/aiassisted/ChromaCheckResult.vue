<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="bg-purple-lighten-5 d-flex align-center">
      <v-btn
        icon
        size="small"
        variant="text"
        @click="$emit('back')"
        class="mr-2"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-icon icon="mdi-palette" color="purple" size="large" class="mr-2" />
      <div class="flex-grow-1">ChromaCheck - Color Contrast Analysis</div>
      <v-chip color="green" size="small">Completed</v-chip>
    </v-card-title>
    
    <v-card-text class="pa-6">
      <!-- Summary Stats -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card :color="results.passed ? 'green-lighten-5' : 'red-lighten-5'" class="pa-4">
            <div class="text-center">
              <v-icon 
                :icon="results.passed ? 'mdi-check-circle' : 'mdi-alert-circle'" 
                :color="results.passed ? 'green' : 'red'"
                size="x-large"
              />
              <h3 class="text-h6 mt-2">{{ results.passed ? 'Passed' : 'Failed' }}</h3>
              <p class="text-caption">Overall Status</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="orange-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-alert" color="orange" size="x-large" />
              <h3 class="text-h3">{{ results.total_issues }}</h3>
              <p class="text-caption">Total Issues</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="blue-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-file-document" color="blue" size="x-large" />
              <h3 class="text-h3">{{ results.violations?.length || 0 }}</h3>
              <p class="text-caption">Violations</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="purple-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-eye" color="purple" size="x-large" />
              <h3 class="text-h6 mt-2">WCAG 2.1</h3>
              <p class="text-caption">Standard</p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Violations List -->
      <div v-if="results.violations?.length > 0">
        <v-divider class="mb-4" />
        <h3 class="text-h6 mb-3">
          <v-icon icon="mdi-alert-circle" color="red" class="mr-2" />
          Color Contrast Issues ({{ results.violations.length }})
        </h3>
        <v-expansion-panels>
          <v-expansion-panel
            v-for="(violation, index) in results.violations"
            :key="index"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center gap-3">
                <v-chip 
                  :color="getImpactColor(violation.impact)" 
                  size="small"
                >
                  {{ violation.impact }}
                </v-chip>
                <span class="font-weight-medium">{{ violation.description }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="pa-2">
                <p class="text-body-2 mb-3">{{ violation.help }}</p>
                
                <v-card variant="outlined" class="mb-3">
                  <v-card-text>
                    <strong>HTML Element:</strong>
                    <pre class="mt-2 pa-2 bg-grey-lighten-4 rounded">{{ violation.element?.html }}</pre>
                  </v-card-text>
                </v-card>

                <v-alert type="info" variant="tonal" density="compact" class="mb-3">
                  {{ violation.failure_summary }}
                </v-alert>

                <v-btn
                  :href="violation.help_url"
                  target="_blank"
                  color="purple"
                  variant="text"
                  size="small"
                >
                  Learn More
                  <v-icon icon="mdi-open-in-new" end />
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- No Issues Found -->
      <v-alert v-else type="success" variant="tonal" class="mt-4">
        <v-icon icon="mdi-check-circle" class="mr-2" />
        No color contrast issues found! All elements meet WCAG 2.1 standards.
      </v-alert>

      <!-- Action Buttons -->
      <div v-if="results.marked_html" class="mt-4">
        <v-divider class="mb-4" />
        <div class="d-flex gap-2">
          <v-btn
            color="green"
            prepend-icon="mdi-eye"
            @click="$emit('view-marked-html', results.marked_html)"
          >
            View Marked HTML
          </v-btn>
          <v-btn
            color="blue"
            prepend-icon="mdi-download"
            @click="downloadReport"
          >
            Download Report
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  results: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'view-marked-html']);

const getImpactColor = (impact) => {
  const colors = {
    critical: 'red',
    serious: 'orange',
    moderate: 'yellow-darken-2',
    minor: 'blue'
  };
  return colors[impact] || 'grey';
};

const downloadReport = () => {
  if (!props.results.marked_html) return;

  const blob = new Blob([props.results.marked_html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chromacheck_report.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
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
