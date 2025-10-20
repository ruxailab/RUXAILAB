<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 pa-6">
            <v-icon icon="mdi-cog" size="large" color="purple" class="mr-3" />
            AI-Assisted Settings
          </v-card-title>
          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <strong>Test ID:</strong> {{ testId }}
            </v-alert>
            
            <v-card variant="outlined" class="pa-4 mb-4">
              <h3 class="text-h6 mb-3">Test Configuration</h3>
              
              <v-form>
                <v-text-field
                  label="Test Title"
                  placeholder="Enter test title"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-format-title"
                />
                
                <v-textarea
                  label="Test Description"
                  placeholder="Enter test description"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-text"
                  rows="3"
                />
                
                <v-text-field
                  label="Website URL"
                  placeholder="https://example.com"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-link"
                />
                
                <v-divider class="my-4" />
                
                <h4 class="text-h6 mb-3">AI Settings</h4>
                
                <v-select
                  label="AI Model"
                  :items="['GPT-4', 'Claude', 'Gemini']"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-brain"
                />
                
                <v-switch
                  label="Enable Auto-fix Suggestions"
                  color="purple"
                  class="mb-2"
                />
                
                <v-switch
                  label="Enable Real-time Analysis"
                  color="purple"
                  class="mb-2"
                />
                
                <v-divider class="my-4" />
                
                <v-switch
                  label="Public Test"
                  color="purple"
                  class="mb-2"
                />
              </v-form>
            </v-card>
            
            <div class="d-flex gap-2">
              <v-btn color="purple" prepend-icon="mdi-content-save">
                Save Settings
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
