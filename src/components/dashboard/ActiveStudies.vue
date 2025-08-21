<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="mb-6"
  >
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-flask-outline"
          class="me-2"
          color="primary"
        />
        Active Studies Overview
      </div>
      <v-btn
        variant="text"
        size="small"
        color="primary"
      >
        View All
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-row>
        <v-col
          v-for="study in studies"
          :key="study.id"
          cols="12"
          md="6"
        >
          <v-card
            variant="outlined"
            rounded="lg"
            class="study-card"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <v-chip
                  :color="study.status === 'active' ? 'success' : study.status === 'finished' ? 'warning' : 'info'"
                  variant="tonal"
                  size="small"
                >
                  {{ study.status.charAt(0).toUpperCase() + study.status.slice(1) }}
                </v-chip>
                <v-icon
                  :icon="study.typeIcon"
                  size="20"
                  color="primary"
                />
              </div>

              <h4 class="text-subtitle-1 font-weight-bold mb-2">
                {{ study.title }}
              </h4>
              <p class="text-body-2 text-medium-emphasis mb-3">
                {{ study.description }}
              </p>

              <!-- Progress -->
              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-medium">Progress</span>
                  <span class="text-caption">{{ study.progress }}%</span>
                </div>
                <v-progress-linear
                  :model-value="study.progress"
                  :color="study.status === 'active' ? 'success' : 'primary'"
                  height="6"
                  rounded
                />
              </div>

              <!-- Metrics -->
              <div class="d-flex justify-space-between text-caption">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-account-group"
                    size="16"
                    class="me-1"
                    color="info"
                  />
                  <span>{{ study.participants }} participants</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-calendar-clock"
                    size="16"
                    class="me-1"
                    color="warning"
                  />
                  <span>{{ study.daysLeft }} days left</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    studies: {
        type: Array,
        default: () => []
    }
})

// Default studies if none provided
const defaultStudies = [
    {
        id: 1,
        title: 'Mobile Banking UX Study',
        description: 'Evaluating user experience and accessibility of mobile banking features',
        status: 'active',
        progress: 75,
        participants: 24,
        daysLeft: 5,
        typeIcon: 'mdi-cellphone'
    },
    {
        id: 2,
        title: 'E-commerce Card Sorting',
        description: 'Understanding user mental models for product categorization',
        status: 'recruiting',
        progress: 45,
        participants: 18,
        daysLeft: 12,
        typeIcon: 'mdi-sort-variant'
    },
    {
        id: 3,
        title: 'Voice Interface Testing',
        description: 'Usability testing for voice-controlled smart home devices',
        status: 'active',
        progress: 90,
        participants: 32,
        daysLeft: 2,
        typeIcon: 'mdi-microphone'
    },
    {
        id: 4,
        title: 'Accessibility Audit',
        description: 'Comprehensive accessibility evaluation of web application',
        status: 'paused',
        progress: 30,
        participants: 12,
        daysLeft: 20,
        typeIcon: 'mdi-wheelchair-accessibility'
    }
]

const studies = computed(() => {
    return props.studies.length > 0 ? props.studies : defaultStudies
})
</script>

<style scoped>
.study-card {
    height: 100%;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.study-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
