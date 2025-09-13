<template>
  <v-container
    fluid
    class="create-study-view"
  >
    <v-container class="py-6">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="3"
        :steps="steps"
      />

      <!-- Page Header -->
      <SectionHeader
        title="Choose Study Type"
        subtitle="Select how you want to create your study"
      />

      <!-- Options Grid -->
      <v-row
        justify="center"
        class="mb-8"
      >
        <v-col
          v-for="option in options"
          :key="option.id"
          cols="12"
          md="6"
          lg="5"
        >
          <SelectableCard
            :selected="selectedOption === option.id"
            :icon="option.icon"
            :title="option.title"
            :description="option.description"
            :color="option.color"
            :badge="option.recommended ? { text: 'Coming Soon', color: 'warning' } : null"
            @click="() => selectOption(option.id)"
            :disabled="option.disabled"
          >
            <template #extra>
              <v-list
                class="bg-transparent pl-8 text-start"
                density="compact"
              >
                <v-list-item
                  v-for="feature in option.features"
                  :key="feature"
                  class="pa-0 mb-1"
                >
                  <template #prepend>
                    <v-icon
                      icon="mdi-check"
                      color="success"
                      size="16"
                      class="mr-2"
                    />
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ feature }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </template>
          </SelectableCard>
        </v-col>
      </v-row>

      <!-- Back Button -->
      <BackButton
        label="Back to Methods"
        @back="goBack"
      />
    </v-container>
  </v-container>
</template>

<script setup>

import BackButton from '@/features/ux_creation/components/BackButton.vue'
import SectionHeader from '@/features/ux_creation/SectionHeader.vue'
import SelectableCard from '@/shared/components/cards/SelectableCard.vue'
import StepperHeader from '@/features/ux_creation/StepperHeader.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const selectedOption = ref('')

const steps = [
  { value: 1, title: 'Category', complete: true },
  { value: 2, title: 'Methods', complete: true },
  { value: 3, title: 'Study Type', complete: false },
  { value: 4, title: 'Details', complete: false }
]

const options = [
  {
    id: 'blank',
    title: 'Start with Blank Study',
    description: 'Create a study from scratch with complete customization',
    icon: 'mdi-file-outline',
    color: 'primary',
    recommended: false,
    disabled: false,
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
    disabled: true,
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

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>