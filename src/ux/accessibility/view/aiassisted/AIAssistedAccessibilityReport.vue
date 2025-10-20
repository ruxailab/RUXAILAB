<template>
    <PageWrapper
      title="AI-Assisted Accessibility Report"
      subtitle="Utilize AI to generate and enhance accessibility reports"
    >
<v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
            <v-card-text class="pa-6">
            <!-- Summary Cards -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <v-card color="red-lighten-5" class="pa-4">
                  <div class="text-center">
                    <v-icon icon="mdi-alert-circle" size="x-large" color="red" />
                    <h2 class="text-h3 mt-2">3</h2>
                    <p class="text-caption">Critical Issues</p>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-card color="orange-lighten-5" class="pa-4">
                  <div class="text-center">
                    <v-icon icon="mdi-alert" size="x-large" color="orange" />
                    <h2 class="text-h3 mt-2">7</h2>
                    <p class="text-caption">Major Issues</p>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-card color="yellow-lighten-5" class="pa-4">
                  <div class="text-center">
                    <v-icon icon="mdi-information" size="x-large" color="yellow-darken-2" />
                    <h2 class="text-h3 mt-2">12</h2>
                    <p class="text-caption">Minor Issues</p>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="3">
                <v-card color="green-lighten-5" class="pa-4">
                  <div class="text-center">
                    <v-icon icon="mdi-check-circle" size="x-large" color="green" />
                    <h2 class="text-h3 mt-2">78%</h2>
                    <p class="text-caption">Overall Score</p>
                  </div>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- Detailed Report Section -->
            <v-card variant="outlined" class="pa-4 mb-4">
              <h3 class="text-h6 mb-3">AI Analysis Summary</h3>
              <p class="text-body-1 mb-4">
                The AI has analyzed your website for accessibility compliance based on WCAG 2.1 guidelines.
                Below is a comprehensive summary of the findings.
              </p>
              
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-eye" class="mr-2" color="purple" />
                      Visual Accessibility
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-body-2">
                      Analysis of color contrast, text sizing, and visual elements for users with visual impairments.
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-keyboard" class="mr-2" color="purple" />
                      Keyboard Navigation
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-body-2">
                      Evaluation of keyboard accessibility, focus indicators, and tab order.
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-text-to-speech" class="mr-2" color="purple" />
                      Screen Reader Compatibility
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-body-2">
                      Assessment of semantic HTML, ARIA attributes, and screen reader support.
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
            
            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <v-btn color="purple" prepend-icon="mdi-download">
                Export Report
              </v-btn>
              <v-btn variant="outlined" prepend-icon="mdi-share-variant">
                Share Report
              </v-btn>
              <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
                Back to Home
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

    </PageWrapper>
  
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';

const route = useRoute();
const router = useRouter();

const testId = computed(() => route.params.id);
const token = computed(() => route.params.token);

const goBack = () => {
  // If token is present, this might be a public view, don't navigate back
  if (token.value) {
    return;
  }
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } });
};
</script>
