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
        :title="$t('studyCreation.chooseEvaluationCategory')"
        :subtitle="$t('studyCreation.selectEvaluationType')"
      />

      <!-- Categories Grid -->
      <v-row justify="center">
        <v-col
          v-for="category in categories"
          :key="category.id"
          cols="12"
          sm="6"
          md="3"
        >
          <SelectableCard
            :selected="selectedCategory === category.id"
            :icon="category.icon"
            :title="category.title"
            text-class="pa-4 pa-sm-8 text-center"
            :description="category.description"
            :color="category.color"
            :disabled="category.comingSoon"
            :badge="category.comingSoon
              ? { text: $t('studyCreation.comingSoon'), color: 'warning' }
              : null"
            @click="() => handleCategoryClick(category.id)"
          >
            <template #extra>
              <v-chip
                v-if="category.hasSubMethods && !category.comingSoon"
                color="primary"
                variant="tonal"
                size="small"
              >
                {{ $t('studyCreation.multipleMethods') }}
              </v-chip>
            </template>
          </SelectableCard>
        </v-col>
      </v-row>

      <!-- Back Button -->
      <BackButton
        :label="$t('studyCreation.backToDashboard')"
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
import { STUDY_CATEGORIES, getCategoryById } from '@/shared/constants/studyCategories.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useStore()
const { t } = useI18n()
const selectedCategory = ref(null)

const steps = computed(() => [
  { value: 1, title: t('studyCreation.steps.category'), complete: false },
  { value: 2, title: t('studyCreation.steps.methods'), complete: false },
  { value: 3, title: t('studyCreation.steps.studyType'), complete: false },
  { value: 4, title: t('studyCreation.steps.details'), complete: false },
])

const categories = computed(() => STUDY_CATEGORIES.map(category => ({
  ...category,
  title: t(`studyCreation.categories.${category.id}.title`),
  description: t(`studyCreation.categories.${category.id}.description`),
})))

const handleCategoryClick = (categoryId) => {
  const category = getCategoryById(categoryId)
  if (category?.comingSoon) return

  selectedCategory.value = categoryId
  store.commit('SET_STUDY_CATEGORY', categoryId)
  router.push({
    name: category.hasSubMethods ? 'study-create-step2' : 'study-create-step3',
  })
}

const goBack = () => {
  router.push('/admin')
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
