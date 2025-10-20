<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 pa-6">
            <v-icon icon="mdi-brain" size="large" color="purple" class="mr-3" />
            AI-Assisted Accessibility Test - Home
          </v-card-title>
          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <strong>Test ID:</strong> {{ testId }}
            </v-alert>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-h6 mb-3">Test Overview</h3>
                  <p class="text-body-1">
                    This is the home page for AI-Assisted Accessibility Testing.
                    AI-driven tools will help identify and suggest fixes for accessibility issues.
                  </p>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-h6 mb-3">Quick Actions</h3>
                  <v-list density="compact">
                    <v-list-item prepend-icon="mdi-cog" @click="goToSettings">
                      <v-list-item-title>Settings</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-eye" @click="goToExamine">
                      <v-list-item-title>Examine Test</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-chart-bar" @click="goToReport">
                      <v-list-item-title>View Report</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-message-reply" @click="goToAnswers">
                      <v-list-item-title>View Answers</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
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

const goToSettings = () => {
  router.push({ name: 'AIAssistedAccessibilitySettings', params: { id: testId.value } });
};

const goToExamine = () => {
  router.push({ name: 'AIAssistedAccessibilityExamine', params: { id: testId.value } });
};

const goToReport = () => {
  router.push({ name: 'AIAssistedAccessibilityReport', params: { id: testId.value } });
};

const goToAnswers = () => {
  router.push({ name: 'AIAssistedAccessibilityAnswers', params: { id: testId.value } });
};
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style>
