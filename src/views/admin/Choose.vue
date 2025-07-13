<template>
  <v-container fluid class="create-study-view">
  <v-container class="py-6">
    <!-- Progress Stepper -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-stepper
          alt-labels
          :model-value="1"
          class="elevation-0 bg-transparent"
        >
          <v-stepper-header class="elevation-0">
            <v-stepper-item
              :complete="false"
              :value="1"
              color="primary"
              title="Category"
            />
            <v-divider />
            <v-stepper-item
              :value="2"
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
      <v-col cols="12" class="text-center">
        <h2 class="text-h4 font-weight-medium text-grey-darken-4 mb-3">
          Choose Evaluation Category
        </h2>
        <p class="text-h6 text-grey-darken-1">
          Select the type of evaluation you want to conduct for your study
        </p>
      </v-col>
    </v-row>

    <!-- Categories Grid -->
    <v-row justify="center" class="mb-8">
      <v-col
        v-for="category in categories"
        :key="category.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          :variant="selectedCategory === category.id ? 'tonal' : 'flat'"
          :color="selectedCategory === category.id ? 'primary' : undefined"
          :disabled="category.comingSoon"
          class="h-100 cursor-pointer transition-all position-relative custom-card"
          hover
          elevation="4"
          @click="() => handleCategoryClick(category.id)"
        >
          <!-- Coming Soon Badge -->
          <v-chip
            v-if="category.comingSoon"
            color="warning"
            variant="flat"
            size="small"
            class="position-absolute"
            style="top: 16px; right: 16px; z-index: 1;"
          >
            Coming Soon
          </v-chip>

          <v-card-text class="text-center pa-8">
            <v-avatar
              :color="category.color"
              size="80"
              class="mb-4"
            >
              <v-icon
                :icon="category.icon"
                size="40"
                color="white"
              />
            </v-avatar>

            <h3 class="text-h5 font-weight-medium mb-3">{{ category.title }}</h3>
            <p class="text-body-1 text-grey-darken-1 mb-4">{{ category.description }}</p>

            <v-chip
              v-if="category.hasSubMethods && !category.comingSoon"
              color="primary"
              variant="tonal"
              size="small"
            >
              Multiple Methods
            </v-chip>
          </v-card-text>

          <!-- Selected Indicator -->
          <v-icon
            v-if="selectedCategory === category.id"
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
          Back to Dashboard
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
const selectedCategory = ref(null)

const categories = [
  {
    id: 'test',
    title: 'Test',
    description: 'Conduct controlled testing with real users to measure usability and performance.',
    icon: 'mdi-test-tube',
    color: 'success',
    hasSubMethods: true
  },
  {
    id: 'inquiry',
    title: 'Inquiry',
    description: 'Gather insights through surveys, interviews, and other research methods.',
    icon: 'mdi-comment-question-outline',
    color: 'warning',
    hasSubMethods: false,
    comingSoon: true
  },
  {
    id: 'inspection',
    title: 'Inspection',
    description: 'Expert evaluation using established usability principles and guidelines.',
    icon: 'mdi-magnify',
    color: 'secondary',
    hasSubMethods: true
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: '',
    icon: 'mdi-magnify',
    color: 'primary',
    hasSubMethods: true
  },
]

const handleCategoryClick = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  
  if (category?.comingSoon) {
    return
  }
  
  selectedCategory.value = categoryId
  store.commit('SET_STUDY_CATEGORY', categoryId)
  
  router.push({ name: category.hasSubMethods ? 'study-create-step2' : 'study-create-step3' })
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
