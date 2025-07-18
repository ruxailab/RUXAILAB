<template>
  <v-container
    fluid
    class="create-study-view"
  >
    <v-container class="py-6">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="1"
        :steps="steps"
      />

      <!-- Page Header -->
      <SectionHeader
        title="Choose Evaluation Category"
        subtitle="Select the type of evaluation you want to conduct for your study"
      />

      <!-- Categories Grid -->
      <v-row
        justify="center"
        class="mb-8"
      >
        <v-col
          v-for="category in categories"
          :key="category.id"
          cols="12"
          sm="6"
          md="4"
        >
          <SelectableCard
            :selected="selectedCategory === category.id"
            :icon="category.icon"
            :title="category.title"
            text-class="pa-8 text-center"
            :description="category.description"
            :color="category.color"
            :disabled="category.comingSoon"
            :badge="
              category.comingSoon
                ? { text: 'Coming Soon', color: 'warning' }
                : null
            "
            @click="() => handleCategoryClick(category.id)"
          >
            <template #extra>
              <v-chip
                v-if="category.hasSubMethods && !category.comingSoon"
                color="primary"
                variant="tonal"
                size="small"
              >
                Multiple Methods
              </v-chip>
            </template>
          </SelectableCard>
        </v-col>
      </v-row>

      <!-- Back Button -->
      <BackButton
        label="Back to Dashboard"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const selectedCategory = ref(null)

const steps = [
  { value: 1, title: 'Category', complete: false },
  { value: 2, title: 'Methods', complete: false },
  { value: 3, title: 'Study Type', complete: false },
  { value: 4, title: 'Details', complete: false },
]

const categories = [
  {
    id: 'test',
    title: 'Test',
    description:
      'Conduct controlled testing with real users to measure usability and performance.',
    icon: 'mdi-test-tube',
    color: 'success',
    hasSubMethods: true,
  },
  {
    id: 'inquiry',
    title: 'Inquiry',
    description:
      'Gather insights through surveys, interviews, and other research methods.',
    icon: 'mdi-comment-question-outline',
    color: 'warning',
    hasSubMethods: false,
    comingSoon: true,
  },
  {
    id: 'inspection',
    title: 'Inspection',
    description:
      'Expert evaluation using established usability principles and guidelines.',
    icon: 'mdi-magnify',
    color: 'secondary',
    hasSubMethods: true,
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description:
      'Assess your product for accessibility compliance and best practices.',
    icon: 'mdi-access-point',
    color: 'primary',
    hasSubMethods: false,
    comingSoon: false,
  },
]

const handleCategoryClick = (categoryId) => {
  const category = categories.find((c) => c.id === categoryId)
  if (category?.comingSoon) return

  selectedCategory.value = categoryId
  if (categoryId === 'accessibility') {
    router.push('/accessibility')
    return
  }
  store.commit('SET_STUDY_CATEGORY', categoryId)
  router.push({
    name: category.hasSubMethods ? 'study-create-step2' : 'study-create-step3',
  })
}

const goBack = () => {
  router.push('/testslist')
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

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>
