<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="bg-blue-lighten-5 d-flex align-center">
      <v-btn
        icon
        size="small"
        variant="text"
        @click="$emit('back')"
        class="mr-2"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-icon icon="mdi-link-variant" color="blue" size="large" class="mr-2" />
      <div class="flex-grow-1">AnchorSense - Anchor Tag Analysis</div>
      <v-chip color="green" size="small">Completed</v-chip>
    </v-card-title>
    
    <v-card-text class="pa-6">
      <!-- Summary Stats -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-card color="blue-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-link-variant" color="blue" size="x-large" />
              <h3 class="text-h3">{{ results.issues?.length || 0 }}</h3>
              <p class="text-caption">Total Issues</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
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
        <v-col cols="12" sm="6" md="4">
          <v-card color="purple-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-brain" color="purple" size="x-large" />
              <h3 class="text-h6 mt-2">AI-Powered</h3>
              <p class="text-caption">Smart Suggestions</p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Issues List -->
      <div v-if="results.issues?.length > 0">
        <v-divider class="mb-4" />
        <h3 class="text-h6 mb-3">
          <v-icon icon="mdi-alert-circle" color="blue" class="mr-2" />
          Anchor Tag Issues ({{ results.issues.length }})
        </h3>
        <v-expansion-panels>
          <v-expansion-panel
            v-for="(issue, index) in results.issues"
            :key="index"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center gap-3">
                <v-chip color="orange" size="small">
                  {{ issue.module || 'linkalt' }}
                </v-chip>
                <span class="font-weight-medium">{{ issue.issue }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="pa-2">
                <p class="text-body-2 mb-3"><strong>Issue:</strong> {{ issue.issue }}</p>
                
                <v-card variant="outlined" class="mb-3">
                  <v-card-text>
                    <strong>Current HTML:</strong>
                    <pre class="mt-2 pa-2 bg-grey-lighten-4 rounded">{{ issue.element }}</pre>
                  </v-card-text>
                </v-card>

                <div class="mb-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon icon="mdi-lightbulb" size="small" color="green" class="mr-1" />
                    <strong>How to Fix:</strong>
                  </div>
                  <v-card color="green-lighten-5" variant="flat" class="pa-3">
                    <p class="text-body-2 mb-0">{{ issue.help }}</p>
                  </v-card>
                </div>

                <v-btn
                  color="blue"
                  variant="text"
                  size="small"
                  class="mt-3"
                  prepend-icon="mdi-content-copy"
                  @click="copyToClipboard(issue.element)"
                >
                  Copy Element Code
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- No Issues Found -->
      <v-alert v-else type="success" variant="tonal" class="mt-4">
        <v-icon icon="mdi-check-circle" class="mr-2" />
        No anchor tag issues found! All links are properly accessible.
      </v-alert>
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

const emit = defineEmits(['back']);

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log('Code copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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
