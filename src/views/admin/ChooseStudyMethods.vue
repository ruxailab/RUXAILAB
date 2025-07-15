<template>
  <v-container
    fluid
    class="create-study-view"
  >
    <v-container class="py-6">
      <!-- Progress Stepper -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-stepper
            alt-labels
            :model-value="2"
            class="elevation-0 bg-transparent"
          >
            <v-stepper-header class="elevation-0">
              <v-stepper-item
                :complete="true"
                :value="1"
                color="success"
                title="Category"
              />
              <v-divider />
              <v-stepper-item
                :complete="false"
                :value="2"
                color="primary"
                title="Methods"
              />
              <v-divider />
              <v-stepper-item
                :value="3"
                title="Study Type"
              />
              <v-divider />
              <v-stepper-item
                :value="4"
                title="Details"
              />
            </v-stepper-header>
          </v-stepper>
        </v-col>
      </v-row>

      <!-- Page Header -->
      <v-row class="mb-8">
        <v-col
          cols="12"
          class="text-center"
        >
          <h2 class="text-h4 font-weight-medium text-grey-darken-4 mb-3">
            Choose {{ categoryNames[currentCategory] }} Method
          </h2>
          <p class="text-h6 text-grey-darken-1">
            Select the specific method for your study
          </p>
        </v-col>
      </v-row>

      <!-- Methods Grid -->
      <v-row
        justify="center"
        class="mb-8"
      >
        <v-col
          v-for="method in availableMethods"
          :key="method.id"
          cols="12"
          md="6"
          lg="5"
        >
          <v-card
            :variant="selectedMethod === method.id ? 'tonal' : 'flat'"
            :color="selectedMethod === method.id ? 'primary' : undefined"
            :disabled="!method.available"
            class="h-100 cursor-pointer transition-all position-relative custom-card"
            hover
            elevation="4"
            @click="selectMethod(method.id, method.available)"
          >
            <!-- Coming Soon Badge -->
            <v-chip
              v-if="method.comingSoon"
              color="warning"
              variant="flat"
              size="small"
              class="position-absolute"
              style="top: 16px; right: 16px; z-index: 1;"
            >
              Coming Soon
            </v-chip>
            
            <v-card-text class="pa-8">
              <div class="d-flex align-center mb-4">
                <v-avatar
                  :color="method.color"
                  size="64"
                  class="mr-4"
                >
                  <v-icon
                    :icon="method.icon"
                    size="32"
                    color="white"
                  />
                </v-avatar>
              </div>
              
              <h3 class="text-h6 font-weight-medium mb-3">
                {{ method.name }}
              </h3>
              <p class="text-body-1 text-grey-darken-1">
                {{ method.description }}
              </p>
            </v-card-text>
            
            <!-- Selected Indicator -->
            <v-icon 
              v-if="selectedMethod === method.id"
              icon="mdi-check-circle"
              color="primary"
              size="large"
              class="position-absolute"
              style="bottom: 16px; right: 16px;"
            />
          </v-card>
        </v-col>
      </v-row>

      <!-- Back Button -->
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
          >
            Back to Categories
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const selectedMethod = ref('')

const methodsByCategory = {
  test: [
    { 
      id: 'unmoderated', 
      name: 'Usability Testing (Unmoderated)', 
      description: 'Participants complete tasks independently while their interactions are recorded',
      icon: 'mdi-monitor-screenshot',
      color: 'primary',
      available: true 
    },
    { 
      id: 'moderated', 
      name: 'Usability Testing (Moderated)', 
      description: 'Real-time sessions with facilitator guidance and immediate feedback',
      icon: 'mdi-account-voice',
      color: 'success',
      available: true 
    },
    { 
      id: 'ab-testing', 
      name: 'A/B Testing', 
      description: 'Compare two versions to determine which performs better',
      icon: 'mdi-compare',
      color: 'warning',
      available: false, 
      comingSoon: true 
    }
  ],
  inspection: [
    { 
      id: 'HEURISTICS', 
      name: 'Heuristic Evaluation', 
      description: 'Expert review using established usability principles and guidelines',
      icon: 'mdi-clipboard-check',
      color: 'secondary',
      available: true 
    },
    { 
      id: 'cognitive-walkthrough', 
      name: 'Cognitive Walkthrough', 
      description: 'Step-by-step evaluation of user task completion processes',
      icon: 'mdi-walk',
      color: 'info',
      available: false, 
      comingSoon: true 
    }
  ],
  accessibility: [
    {
      id: 'MANUAL', 
      name: 'Manual Testing', 
      description: '',
      icon: 'mdi-clipboard-check',
      color: 'secondary',
      available: false 
    },
    {
      id: 'AUTOMATIC', 
      name: 'Automatic Testing', 
      description: '',
      icon: 'mdi-clipboard-check',
      color: 'secondary',
      available: false 
    },
    {
      id: 'AI', 
      name: 'AI Powered Testing', 
      description: '',
      icon: 'mdi-clipboard-check',
      color: 'secondary',
      available: false 
    }
  ]
}

const currentCategory = computed(() => store.state.Tests.studyCategory)
const availableMethods = computed(() => methodsByCategory[currentCategory.value] || [])

const categoryNames = {
  test: 'Test',
  inspection: 'Inspection'
}

const selectMethod = (methodId, available) => {
  if (!available) return
  
  selectedMethod.value = methodId
  store.commit('SET_STUDY_METHOD', methodId)
  router.push({ name: 'study-create-step3' })
}

const goBack = () => {
  router.push({ name: 'study-create-step1' })
}

onMounted(() => {
  if (!currentCategory.value) {
    router.push({ name: 'study-create-step1' })
  }
})
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
  
  &:hover:not(.v-card--disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    border-color: #2196F3 !important;
  }
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>