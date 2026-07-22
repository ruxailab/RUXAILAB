<template>
  <v-container fluid class="create-study-view">
    <v-container class="py-0">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="1"
        :steps="steps"
        @step-click="onStepperStepClick"
      />

      <!-- Page Header -->
      <SectionHeader
        :title="$t('studyCreation.chooseEvaluationCategory')"
        :subtitle="$t('studyCreation.selectEvaluationType')"
      />

      <v-row class="mb-4" align="stretch">
        <v-col cols="12" lg="7">
          <v-row>
            <v-col
              v-for="category in categories"
              :key="category.id"
              cols="12"
              sm="6"
            >
              <SelectableCard
                :selected="selectedCategory === category.id"
                :icon="category.icon"
                :title="category.title"
                text-class="pa-4 pa-sm-5 text-center"
                :avatar-size="52"
                :description="category.description"
                :color="category.color"
                :disabled="category.comingSoon"
                :badge="
                  category.comingSoon
                    ? { text: $t('studyCreation.comingSoon'), color: 'warning' }
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
                    {{ $t('studyCreation.multipleMethods') }}
                  </v-chip>
                </template>
              </SelectableCard>
            </v-col>
          </v-row>
        </v-col>

        <v-col
          cols="12"
          lg="1"
          class="choose-divider-col d-flex justify-center align-center"
        >
          <div class="choose-divider">
            <span class="choose-divider__label">{{
              $t('studyCreation.ai.orLabel')
            }}</span>
          </div>
        </v-col>

        <v-col cols="12" lg="4" class="d-flex align-start">
          <div class="ai-column w-100">
            <SelectableCard
              :selected="selectedCategory === 'ai'"
              icon="mdi-robot-outline"
              :title="$t('studyCreation.studyTypes.ai.title')"
              text-class="pa-4 pa-sm-5 text-center"
              :avatar-size="52"
              :description="$t('studyCreation.studyTypes.ai.description')"
              color="info"
              @click="goToCreateWithAi"
            >
              <template #extra>
                <div class="d-flex justify-center ga-2 flex-wrap">
                  <v-chip color="info" variant="tonal" size="small">
                    {{ $t('studyCreation.ai.badge') }}
                  </v-chip>
                  <v-chip color="secondary" variant="flat" size="small">
                    {{ $t('studyCreation.ai.experimental') }}
                  </v-chip>
                </div>
              </template>
            </SelectableCard>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import SectionHeader from '@/features/ux_creation/SectionHeader.vue'
import SelectableCard from '@/shared/components/cards/SelectableCard.vue'
import StepperHeader from '@/features/ux_creation/StepperHeader.vue'
import {
  STUDY_CATEGORIES,
  getCategoryById,
} from '@/shared/constants/studyCategories.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useStore()
const { t } = useI18n()
const selectedCategory = ref(null)

const selectedCategoryId = computed(
  () => selectedCategory.value || store.state.Tests.studyCategory,
)
const selectedCategoryMeta = computed(() =>
  selectedCategoryId.value ? getCategoryById(selectedCategoryId.value) : null,
)
const requiresMethodSelection = computed(
  () => !!selectedCategoryMeta.value?.hasSubMethods,
)
const hasCategorySelected = computed(
  () => !!selectedCategoryMeta.value && selectedCategoryId.value !== 'ai',
)
const hasMethodSelected = computed(() => !!store.state.Tests.studyMethod)
const hasStudyTypeSelected = computed(() => !!store.state.Tests.studyType)
const hasTemplateWhenNeeded = computed(() => {
  if (store.state.Tests.studyType !== 'template') return true
  return !!store.state.Tests.selectedTemplate
})

const canOpenStep2 = computed(
  () => hasCategorySelected.value && requiresMethodSelection.value,
)
const canOpenStep3 = computed(
  () =>
    hasCategorySelected.value &&
    (!requiresMethodSelection.value || hasMethodSelected.value),
)
const canOpenStep4 = computed(
  () =>
    canOpenStep3.value &&
    hasStudyTypeSelected.value &&
    hasTemplateWhenNeeded.value,
)

const steps = computed(() => [
  {
    value: 1,
    title: t('studyCreation.steps.category'),
    complete: false,
    enabled: true,
  },
  {
    value: 2,
    title: t('studyCreation.steps.methods'),
    complete: false,
    enabled: canOpenStep2.value,
  },
  {
    value: 3,
    title: t('studyCreation.steps.studyType'),
    complete: false,
    enabled: canOpenStep3.value,
  },
  {
    value: 4,
    title: t('studyCreation.steps.details'),
    complete: false,
    enabled: canOpenStep4.value,
  },
])

const categories = computed(() =>
  STUDY_CATEGORIES.map((category) => ({
    ...category,
    title: t(`studyCreation.categories.${category.id}.title`),
    description: t(`studyCreation.categories.${category.id}.description`),
  })),
)

const handleCategoryClick = (categoryId) => {
  const category = getCategoryById(categoryId)
  if (category?.comingSoon) return

  selectedCategory.value = categoryId
  store.commit('SET_STUDY_CATEGORY', categoryId)
  router.push({
    name: category.hasSubMethods ? 'study-create-step2' : 'study-create-step3',
  })
}

const goToCreateWithAi = () => {
  selectedCategory.value = 'ai'
  store.commit('SET_STUDY_TYPE', 'ai')
  store.commit('SET_STUDY_CATEGORY', null)
  store.commit('SET_STUDY_METHOD', null)
  store.commit('SET_SELECTED_TEMPLATE', null)
  router.push({ name: 'study-create-with-ai' })
}

const onStepperStepClick = (step) => {
  if (!step?.value) return

  const routeByStep = {
    2: 'study-create-step2',
    3: 'study-create-step3',
    4: 'study-create-step4',
  }

  const targetRoute = routeByStep[step.value]
  if (!targetRoute) return
  router.push({ name: targetRoute })
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

.ai-column {
  min-height: auto;
}

.choose-divider-col {
  min-height: 100%;
}

.choose-divider {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.choose-divider::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
  background: rgba(0, 33, 63, 0.22);
}

.choose-divider__label {
  position: relative;
  z-index: 1;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f8f9fa;
  border: 1px solid rgba(0, 33, 63, 0.15);
  color: #00213f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

@media (max-width: 1279px) {
  .choose-divider {
    min-height: auto;
    padding: 8px 0;
  }

  .choose-divider::before {
    top: 50%;
    bottom: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>
