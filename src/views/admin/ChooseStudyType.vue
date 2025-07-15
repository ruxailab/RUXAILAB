<template>
  <v-container fluid class="create-study-view">
    <v-container class="py-6">
      <!-- Progress Stepper -->
      <v-row>
        <v-col cols="12">
          <v-stepper alt-labels :model-value="3" class="elevation-0 bg-transparent">
            <v-stepper-header class="elevation-0">
              <v-stepper-item :complete="true" :value="1" color="success" title="Category" />
              <v-divider />
              <v-stepper-item :complete="true" :value="2" color="success" title="Methods" />
              <v-divider />
              <v-stepper-item :complete="false" :value="3" color="primary" title="Study Type" />
              <v-divider />
              <v-stepper-item :value="4" title="Details" />
            </v-stepper-header>
          </v-stepper>
        </v-col>
      </v-row>

      <!-- Page Header -->
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="text-h4 font-weight-medium text-grey-darken-4">
            Choose Study Type
          </h2>
          <p class="text-h6 text-grey-darken-1">
            Select how you want to create your study
          </p>
        </v-col>
      </v-row>

      <!-- Options Grid -->
      <v-row justify="center">
        <v-col v-for="option in options" :key="option.id" cols="12" md="6" lg="5">
          <v-card :variant="selectedOption === option.id ? 'tonal' : 'flat'"
            :color="selectedOption === option.id ? 'primary' : undefined"
            class="h-100 cursor-pointer transition-all position-relative custom-card" hover elevation="4"
            @click="selectOption(option.id)">
            <!-- Recommended Badge -->
            <v-chip v-if="option.recommended" color="success" variant="flat" size="small" class="position-absolute"
              style="top: 16px; right: 16px; z-index: 1;">
              Recommended
            </v-chip>

            <v-card-text class="pa-8">
              <div class="d-flex align-center mb-2">
                <v-avatar :color="option.color" size="64" class="mr-4">
                  <v-icon :icon="option.icon" size="32" color="white" />
                </v-avatar>
              </div>

              <h3 class="text-h5 font-weight-medium">
                {{ option.title }}
              </h3>
              <p class="text-body-1 text-grey-darken-1 mb-2">
                {{ option.description }}
              </p>

              <!-- Features List -->
              <v-list class="bg-transparent pa-0" density="compact">
                <v-list-item v-for="feature in option.features" :key="feature">
                  <template #prepend>
                    <v-icon icon="mdi-check" color="success" size="16" class="mr-2" />
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ feature }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>

            <!-- Selected Indicator -->
            <v-icon v-if="selectedOption === option.id" icon="mdi-check-circle" color="primary" size="large"
              class="position-absolute" style="bottom: 16px; right: 16px;" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Back Button -->
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">
            Back to Methods
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const selectedOption = ref('')

const options = [
  {
    id: 'blank',
    title: 'Start with Blank Study',
    description: 'Create a study from scratch with complete customization',
    icon: 'mdi-file-outline',
    color: 'primary',
    recommended: false,
    features: [
      'Complete customization',
      'Build from ground up',
      'Full control over settings'
    ]
  },
  {
    id: 'template',
    title: 'Create from Template',
    description: 'Use pre-built templates to get started quickly',
    icon: 'mdi-clipboard-text-outline',
    color: 'success',
    recommended: true,
    features: [
      'Quick setup',
      'Pre-configured settings',
      'Best practices included'
    ]
  }
]

const selectOption = (optionId) => {
  selectedOption.value = optionId
  store.commit('SET_STUDY_TYPE', optionId)
  router.push({ name: 'study-create-step4' })
}

const goBack = () => {
  const method = store.state.Tests.studyMethod
  if (method) {
    router.push({ name: 'study-create-step2' })
  } else {
    router.push({ name: 'study-create-step1' })
  }
}
</script>

<style scoped>
.create-study-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-card {
  border-radius: 20px !important;
  border: 2px solid transparent !important;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    border-color: #2196F3 !important;
  }
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>