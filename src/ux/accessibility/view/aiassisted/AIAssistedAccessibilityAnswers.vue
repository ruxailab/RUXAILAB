<template>
    <PageWrapper
      title="AI-Assisted Analysis Answers"
      subtitle="Utilize AI to generate and enhance accessibility answers"
    >
    <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          
          <v-card-text class="pa-6">
            
            <v-card variant="outlined" class="pa-4 mb-4">

              
              <!-- Sample Finding Cards -->
              <v-card
                v-for="(finding, index) in sampleFindings"
                :key="index"
                class="mb-3"
                :color="finding.severity === 'critical' ? 'red-lighten-5' : 
                        finding.severity === 'major' ? 'orange-lighten-5' : 'yellow-lighten-5'"
              >
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-chip
                      :color="finding.severity === 'critical' ? 'red' : 
                              finding.severity === 'major' ? 'orange' : 'yellow'"
                      size="small"
                      class="mr-2"
                    >
                      {{ finding.severity }}
                    </v-chip>
                    <h4 class="text-subtitle-1">{{ finding.title }}</h4>
                  </div>
                  <p class="text-body-2">{{ finding.description }}</p>
                  <v-divider class="my-2" />
                  <div class="text-caption">
                    <strong>AI Suggestion:</strong> {{ finding.suggestion }}
                  </div>
                </v-card-text>
              </v-card>
            </v-card>
            
            <v-btn color="purple" prepend-icon="mdi-arrow-left" @click="goBack">
              Back to Home
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
    </PageWrapper>
  
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';

const route = useRoute();
const router = useRouter();

const testId = computed(() => route.params.id);

const sampleFindings = ref([
  {
    severity: 'critical',
    title: 'Missing Alt Text',
    description: 'Images found without alternative text descriptions.',
    suggestion: 'Add descriptive alt attributes to all images for screen reader users.'
  },
  {
    severity: 'major',
    title: 'Low Contrast Ratio',
    description: 'Text contrast ratio falls below WCAG AA standards.',
    suggestion: 'Increase contrast between text and background colors to at least 4.5:1.'
  },
  {
    severity: 'minor',
    title: 'Missing Form Labels',
    description: 'Some form inputs lack associated labels.',
    suggestion: 'Add explicit labels to all form controls for better accessibility.'
  }
]);

const goBack = () => {
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } });
};
</script>
