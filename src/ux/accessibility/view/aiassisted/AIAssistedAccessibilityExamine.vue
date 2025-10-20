<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 pa-6">
            <v-icon icon="mdi-eye-check" size="large" color="purple" class="mr-3" />
            AI-Assisted Examination
          </v-card-title>
          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <strong>Test ID:</strong> {{ testId }}
            </v-alert>
            
            <v-card variant="outlined" class="pa-4 mb-4">
              <h3 class="text-h6 mb-3">AI Analysis Panel</h3>
              <p class="text-body-1 mb-4">
                This page will provide AI-driven accessibility analysis tools.
              </p>
              
              <v-row>
                <v-col cols="12" md="4">
                  <v-card color="purple-lighten-5" class="pa-3">
                    <v-icon icon="mdi-robot" size="x-large" color="purple" />
                    <h4 class="text-subtitle-1 mt-2">AI Detection</h4>
                    <p class="text-caption">Automated issue detection</p>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card color="blue-lighten-5" class="pa-3">
                    <v-icon icon="mdi-lightbulb-on" size="x-large" color="blue" />
                    <h4 class="text-subtitle-1 mt-2">Smart Suggestions</h4>
                    <p class="text-caption">AI-powered recommendations</p>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card color="green-lighten-5" class="pa-3">
                    <v-icon icon="mdi-check-circle" size="x-large" color="green" />
                    <h4 class="text-subtitle-1 mt-2">Auto-Fix</h4>
                    <p class="text-caption">Suggested fixes for issues</p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
            
            <v-btn color="purple" prepend-icon="mdi-arrow-left" @click="goBack">
              Back to Home
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();

const testId = computed(() => route.params.id);

const goBack = () => {
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } });
};
</script>
