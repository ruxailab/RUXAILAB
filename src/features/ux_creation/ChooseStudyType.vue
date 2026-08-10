<template>
  <v-container fluid class="create-study-view">
    <v-container class="">
      <!-- Stepper Header -->
      <StepperHeader
        :current-step="3"
        :steps="steps"
        @step-click="onStepperStepClick"
      />

      <!-- Page Header -->
      <SectionHeader
        :title="$t('studyCreation.chooseStudyType')"
        :subtitle="$t('studyCreation.selectStudyType')"
      />

      <!-- Options Grid -->
      <v-row v-if="selectedOption !== 'template'" justify="center" class="mb-8">
        <v-col
          v-for="option in options"
          :key="option.id"
          cols="12"
          sm="6"
          md="6"
          lg="5"
        >
          <SelectableCard
            :selected="selectedOption === option.id"
            :icon="option.icon"
            :title="option.title"
            :description="option.description"
            :color="option.color"
            :badge="
              option.recommended
                ? { text: $t('studyCreation.comingSoon'), color: 'warning' }
                : null
            "
            :disabled="option.disabled"
            @click="() => selectOption(option.id)"
          >
            <template #extra>
              <v-list class="bg-transparent pl-8 text-start" density="compact">
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

      <v-row v-if="selectedOption === 'template'" justify="center" class="mb-8">
        <v-col cols="12" lg="10" xl="8">
          <CommunityTemplatesSection
            :selection-mode="true"
            :include-my-templates="true"
            :forced-method-filter="studyMethod"
            @template-selected="selectTemplate"
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
import CommunityTemplatesSection from '@/features/navigation/components/navbarSections/CommunityTemplatesSection.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useStore()
const { t, tm } = useI18n()
const selectedOption = ref('')
const studyMethod = computed(() => store.state.Tests.studyMethod)
const selectedStudyType = computed(
  () => selectedOption.value || store.state.Tests.studyType,
)
const hasTemplateWhenNeeded = computed(() => {
  if (selectedStudyType.value !== 'template') return true
  return !!store.state.Tests.selectedTemplate
})
const canOpenStep4 = computed(
  () => !!selectedStudyType.value && hasTemplateWhenNeeded.value,
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
    complete: true,
    enabled: true,
  },
  {
    value: 3,
    title: t('studyCreation.steps.studyType'),
    complete: false,
    enabled: true,
  },
  {
    value: 4,
    title: t('studyCreation.steps.details'),
    complete: false,
    enabled: canOpenStep4.value,
  },
])

const options = computed(() => [
  {
    id: 'blank',
    title: t('studyCreation.studyTypes.blank.title'),
    description: t('studyCreation.studyTypes.blank.description'),
    icon: 'mdi-file-outline',
    color: 'primary',
    recommended: false,
    disabled: false,
    features: tm('studyCreation.studyTypes.blank.features'),
  },
  {
    id: 'template',
    title: t('studyCreation.studyTypes.template.title'),
    description: t('studyCreation.studyTypes.template.description'),
    icon: 'mdi-clipboard-text-outline',
    color: 'success',
    recommended: false,
    disabled: false,
    features: tm('studyCreation.studyTypes.template.features'),
  },
])

const selectOption = (optionId) => {
  selectedOption.value = optionId
  store.commit('SET_STUDY_TYPE', optionId)
  store.commit('SET_SELECTED_TEMPLATE', null)

  if (optionId === 'blank') {
    router.push({ name: 'study-create-step4' })
  }
}

const selectTemplate = (template) => {
  if (!template) return
  store.commit('SET_SELECTED_TEMPLATE', template)
  router.push({ name: 'study-create-step4' })
}

const onStepperStepClick = (step) => {
  if (!step?.value || step.value === 3) return

  if (step.value === 1) {
    store.commit('SET_STUDY_TYPE', null)
    store.commit('SET_SELECTED_TEMPLATE', null)
    router.push({ name: 'study-create-step1' })
    return
  }

  if (step.value === 2) {
    store.commit('SET_STUDY_TYPE', null)
    store.commit('SET_SELECTED_TEMPLATE', null)
    router.push({ name: 'study-create-step2' })
    return
  }

  if (step.value === 4) {
    router.push({ name: 'study-create-step4' })
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  selectedOption.value = store.state.Tests.studyType || ''
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
