<template>
  <v-container
    fluid
    class="create-study-view"
  >
    <v-container class="py-6">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="2"
        :steps="steps"
      />

      <!-- Page Header -->
      <SectionHeader
        :title="`Choose ${categoryNames[currentCategory]} Method`"
        subtitle="Select the specific method for your study"
      />

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
          <SelectableCard
            :selected="selectedMethod === method.id"
            :icon="method.icon"
            :title="method.name"
            text-class="text-start pa-8"
            :description="method.description"
            :color="method.color"
            :disabled="!method.available"
            :badge="method.comingSoon ? { text: 'Coming Soon', color: 'warning' } : null"
            @click="() => selectMethod(method.id, method.available)"
          />
        </v-col>
      </v-row>

      <!-- Back Button -->
      <BackButton
        label="Back to Categories"
        @back="goBack"
      />
    </v-container>
  </v-container>
</template>

<script setup>
import BackButton from '@/components/atoms/BackButton.vue'
import SectionHeader from '@/components/atoms/SectionHeader.vue'
import SelectableCard from '@/components/atoms/SelectableCard.vue'
import StepperHeader from '@/components/atoms/StepperHeader.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const selectedMethod = ref('')

const steps = [
  { value: 1, title: 'Category', complete: true },
  { value: 2, title: 'Methods', complete: false },
  { value: 3, title: 'Study Type', complete: false },
  { value: 4, title: 'Details', complete: false }
]

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
  inspection: 'Inspection',
  accessibility: 'Accessibility'
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

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>