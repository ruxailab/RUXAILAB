<template>
  <v-app>
    <!-- Dashboard Component -->
    <v-container v-if="currentView === 'dashboard'" fluid class="pa-6">
      <v-row>
        <v-col cols="12" class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4 font-weight-bold">Dashboard</h1>
          <v-btn
            color="amber-darken-1"
            variant="flat"
            prepend-icon="mdi-plus"
            @click="showAddForm"
          >
            Add New Page
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(assessment, idx) in assessments"
          :key="assessment.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="pa-4" elevation="2">
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-h6">
                {{ assessment.name }}
              </h3>
              <v-chip
                :color="getWcagColor(assessment.wcagLevel)"
                size="small"
                variant="flat"
              >
                {{ assessment.wcagLevel }}
              </v-chip>
            </div>

            <v-btn
              variant="text"
              :color="getWcagColor(assessment.wcagLevel)"
              class="pa-0 mb-2"
              size="small"
              :href="assessment.url"
              target="_blank"
            >
              {{ assessment.url }}
            </v-btn>

            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ assessment.description || 'No description provided.' }}
            </p>

            <div class="mb-2">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">Assessment Progress</span>
                <span class="text-body-2">{{ assessment.progress }}%</span>
              </div>
              <v-progress-linear
                :model-value="assessment.progress"
                color="amber-darken-1"
                height="6"
                rounded
              />
            </div>

            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">Accessibility Score</span>
                <span class="text-body-2">{{ assessment.score }}%</span>
              </div>
              <v-progress-linear
                :model-value="assessment.score"
                color="amber-darken-1"
                height="6"
                rounded
              />
            </div>

            <div class="d-flex justify-space-around mb-4">
              <div class="d-flex align-center">
                <v-icon color="success" size="small" class="mr-1">
                  mdi-check-circle
                </v-icon>
                <span class="text-body-2">{{ assessment.passed }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon color="error" size="small" class="mr-1">
                  mdi-close-circle
                </v-icon>
                <span class="text-body-2">{{ assessment.failed }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon color="warning" size="small" class="mr-1">
                  mdi-alert-circle
                </v-icon>
                <span class="text-body-2">{{ assessment.warnings }}</span>
              </div>
            </div>

            <v-btn
              color="amber-darken-1"
              variant="flat"
              block
              prepend-icon="mdi-chart-bar"
            >
              View Assessment
            </v-btn>
            <v-btn
              color="red"
              variant="text"
              block
              prepend-icon="mdi-delete"
              class="mt-2"
              @click="removeAssessment(idx)"
            >
              Remove
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add New Webpage Form -->
    <v-container v-if="currentView === 'add-webpage'" fluid class="pa-6">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-6" elevation="2">
            <v-card-title class="text-h5 font-weight-bold pa-0 mb-2">
              Add New Webpage for Assessment
            </v-card-title>
            <v-card-subtitle class="pa-0 mb-6 text-medium-emphasis">
              Fill in the details of the webpage you want to assess for
              accessibility.
            </v-card-subtitle>

            <v-form @submit.prevent="addWebpage">
              <v-text-field
                v-model="form.name"
                label="Webpage Name"
                placeholder="e.g., My Company Homepage"
                variant="outlined"
                class="mb-4"
                :rules="[rules.required]"
              />
              <p class="text-body-2 text-medium-emphasis mb-4 mt-n2">
                A descriptive name for the webpage you are testing.
              </p>

              <v-text-field
                v-model="form.url"
                label="URL"
                placeholder="https://example.com"
                variant="outlined"
                class="mb-4"
                :rules="[rules.required, rules.url]"
              />
              <p class="text-body-2 text-medium-emphasis mb-4 mt-n2">
                The full URL of the webpage.
              </p>

              <v-textarea
                v-model="form.description"
                label="Description (Optional)"
                placeholder="Brief description of the page or specific scenario being tested."
                variant="outlined"
                rows="3"
                class="mb-4"
              />

              <v-select
                v-model="form.wcagLevel"
                label="WCAG Compliance Level"
                :items="wcagLevels"
                variant="outlined"
                class="mb-6"
                :rules="[rules.required]"
              />
              <p class="text-body-2 text-medium-emphasis mb-6 mt-n2">
                The target WCAG conformance level for this assessment.
              </p>

              <div class="d-flex gap-3">
                <v-btn
                  type="submit"
                  color="amber-darken-1"
                  variant="flat"
                  size="large"
                >
                  Add Webpage & Start Assessment
                </v-btn>
                <v-btn variant="outlined" size="large" @click="showDashboard">
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Reactive data
const currentView = ref('dashboard')

const form = reactive({
  name: '',
  url: '',
  description: '',
  wcagLevel: 'Level AA',
})

const wcagLevels = ['Level A', 'Level AA', 'Level AAA']

const rules = {
  required: (value) => !!value || 'This field is required',
  url: (value) => {
    const pattern = /^https?:\/\/.+/
    return (
      pattern.test(value) ||
      'Please enter a valid URL starting with http:// or https://'
    )
  },
}

// Dynamic assessments array
const assessments = ref([])

// Methods
const showAddForm = () => {
  currentView.value = 'add-webpage'
}

const showDashboard = () => {
  currentView.value = 'dashboard'
}

const addWebpage = () => {
  // Validate form (already handled by rules)
  const newAssessment = {
    id: Date.now(),
    name: form.name,
    url: form.url,
    description: form.description,
    wcagLevel: form.wcagLevel,
    progress: 0, // default
    score: 0, // default
    passed: 0, // default
    failed: 0, // default
    warnings: 0, // default
  }
  assessments.value.push(newAssessment)

  // Reset form
  Object.assign(form, {
    name: '',
    url: '',
    description: '',
    wcagLevel: 'Level AA',
  })

  // Go back to dashboard
  showDashboard()
}

const removeAssessment = (idx) => {
  assessments.value.splice(idx, 1)
}

function getWcagColor(level) {
  if (level === 'Level AAA') return 'amber-darken-1'
  if (level === 'Level AA') return 'blue-darken-1'
  return 'green-darken-1'
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
}

.v-chip {
  font-weight: 600;
}
</style>
