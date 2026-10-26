<template>
  <v-container fluid class="create-study-view">
    <v-container class="">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="2"
        :steps="steps"
        @step-click="onStepperStepClick"
      />

      <!-- Page Header -->
      <SectionHeader
        :title="
          $t('studyCreation.chooseMethod', {
            category: $t(`studyCreation.categories.${currentCategory}.title`),
          })
        "
        :subtitle="$t('studyCreation.selectMethod')"
      />

      <!-- Methods Grid -->
      <v-row justify="center" class="mb-8">
        <v-col
          v-for="method in availableMethods"
          :key="method.id"
          cols="12"
          sm="6"
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
            :badge="
              method.comingSoon
                ? { text: $t('studyCreation.comingSoon'), color: 'warning' }
                : null
            "
            @click="() => selectMethod(method.id, method.available)"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import SectionHeader from '@/features/ux_creation/SectionHeader.vue'
import SelectableCard from '@/shared/components/cards/SelectableCard.vue'
import StepperHeader from '@/features/ux_creation/StepperHeader.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { METHOD_DEFINITIONS } from '@/shared/constants/methodDefinitions'
import { getCategoryById } from '@/shared/constants/studyCategories.js'

const router = useRouter()
const store = useStore()
const { t } = useI18n()
const selectedMethod = ref('')

const currentCategory = computed(() => store.state.Tests.studyCategory)
const selectedCategoryMeta = computed(() =>
  currentCategory.value ? getCategoryById(currentCategory.value) : null,
)
const requiresMethodSelection = computed(
  () => !!selectedCategoryMeta.value?.hasSubMethods,
)
const hasMethodSelected = computed(
  () => !!selectedMethod.value || !!store.state.Tests.studyMethod,
)
const hasStudyTypeSelected = computed(() => !!store.state.Tests.studyType)
const hasTemplateWhenNeeded = computed(() => {
  if (store.state.Tests.studyType !== 'template') return true
  return !!store.state.Tests.selectedTemplate
})

const canOpenStep3 = computed(
  () => !requiresMethodSelection.value || hasMethodSelected.value,
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
    complete: true,
    enabled: true,
  },
  {
    value: 2,
    title: t('studyCreation.steps.methods'),
    complete: false,
    enabled: true,
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

const methodsByCategory = {
  test: [
    {
      id: METHOD_DEFINITIONS.USER_UNMODERATED.id,
      nameKey: 'studyCreation.methods.test.usability_unmoderated.name',
      descKey: 'studyCreation.methods.test.usability_unmoderated.description',
      icon: 'mdi-monitor-screenshot',
      color: 'primary',
      available: true,
    },
    {
      id: METHOD_DEFINITIONS.USER_MODERATED.id,
      nameKey: 'studyCreation.methods.test.usability_moderated.name',
      descKey: 'studyCreation.methods.test.usability_moderated.description',
      icon: 'mdi-account-voice',
      color: 'success',
      available: true,
      comingSoon: false,
    },
    {
      id: METHOD_DEFINITIONS.CARD_SORTING.id,
      nameKey: 'studyCreation.methods.test.card_sorting_unmoderated.name',
      descKey:
        'studyCreation.methods.test.card_sorting_unmoderated.description',
      icon: 'mdi-card-multiple',
      color: 'error',
      available: true,
    },
    {
      id: 'ab-testing',
      nameKey: 'studyCreation.methods.test.ab_testing.name',
      descKey: 'studyCreation.methods.test.ab_testing.description',
      icon: 'mdi-compare',
      color: 'warning',
      available: false,
      comingSoon: true,
    },
  ],
  inquiry: [
    {
      id: METHOD_DEFINITIONS.FOCUS_GROUP.id,
      nameKey: 'studyCreation.methods.inquiry.focus_group.name',
      descKey: 'studyCreation.methods.inquiry.focus_group.description',
      icon: 'mdi-account-group',
      color: 'secondary',
      available: true,
    },
    {
      id: METHOD_DEFINITIONS.SURVEY.id,
      nameKey: 'studyCreation.methods.inquiry.survey.name',
      descKey: 'studyCreation.methods.inquiry.survey.description',
      icon: 'mdi-clipboard-text',
      color: 'primary',
      available: false,
      comingSoon: true,
    },
    {
      id: METHOD_DEFINITIONS.INTERVIEW.id,
      nameKey: 'studyCreation.methods.inquiry.interview.name',
      descKey: 'studyCreation.methods.inquiry.interview.description',
      icon: 'mdi-microphone',
      color: 'info',
      available: false,
      comingSoon: true,
    },
  ],
  inspection: [
    {
      id: METHOD_DEFINITIONS.HEURISTICS.id,
      nameKey: 'studyCreation.methods.inspection.heuristic_evaluation.name',
      descKey:
        'studyCreation.methods.inspection.heuristic_evaluation.description',
      icon: 'mdi-clipboard-check',
      color: 'secondary',
      available: true,
    },
    {
      id: METHOD_DEFINITIONS.COGNITIVE_WALKTHROUGH.id,
      nameKey: 'studyCreation.methods.inspection.cognitive_walkthrough.name',
      descKey:
        'studyCreation.methods.inspection.cognitive_walkthrough.description',
      icon: 'mdi-walk',
      color: 'info',
      available: false,
      comingSoon: true,
    },
  ],
  accessibility: [
    {
      id: 'MANUAL',
      nameKey: 'studyCreation.methods.accessibility.manual_testing.name',
      descKey: 'studyCreation.methods.accessibility.manual_testing.description',
      icon: 'mdi-eye-check',
      color: 'orange darken-5',
      available: true,
    },
    {
      id: 'AUTOMATIC',
      nameKey: 'studyCreation.methods.accessibility.automatic_testing.name',
      descKey:
        'studyCreation.methods.accessibility.automatic_testing.description',
      icon: 'mdi-robot',
      color: 'teal darken-3',
      available: true,
    },
    {
      id: 'AI_ASSISTED',
      nameKey: 'studyCreation.methods.accessibility.ai_assisted_testing.name',
      descKey:
        'studyCreation.methods.accessibility.ai_assisted_testing.description',
      icon: 'mdi-brain',
      color: 'purple darken-3',
      available: false,
    },
  ],
}

const availableMethods = computed(() => {
  return (methodsByCategory[currentCategory.value] || []).map((m) => ({
    ...m,
    name: t(m.nameKey),
    description: t(m.descKey),
  }))
})

const selectMethod = (methodId, available) => {
  if (!available) return
  selectedMethod.value = methodId
  store.commit('SET_STUDY_METHOD', methodId)
  router.push({ name: 'study-create-step3' })
}

const onStepperStepClick = (step) => {
  if (!step?.value || step.value === 2) return

  const routeByStep = {
    1: 'study-create-step1',
    3: 'study-create-step3',
    4: 'study-create-step4',
  }

  const targetRoute = routeByStep[step.value]
  if (!targetRoute) return
  router.push({ name: targetRoute })
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
