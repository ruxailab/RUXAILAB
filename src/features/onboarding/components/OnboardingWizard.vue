<template>
  <v-dialog
    v-model="internalIsOpen"
    max-width="800"
    scrollable
    persistent
    @keydown.esc="closeWizard"
  >
    <v-card rounded="xl">
      <v-card-title class="pa-6 pb-2 text-wrap">
        <div class="d-flex justify-space-between align-center mb-2">
          <img :src="logoSmall" alt="RUXAILAB Logo" height="25" class="ml-2" />
          <v-btn
            icon="mdi-close"
            variant="text"
            aria-label="Close onboarding wizard"
            @click="closeWizard"
          ></v-btn>
        </div>
        <div class="text-h4 text-center font-weight-bold mb-2">
          {{ $t('onboarding.welcome_title') }}
        </div>
      </v-card-title>

      <v-card-text class="pa-6 pt-0">
        <div class="text-center text-body-1 text-medium-emphasis mb-6">
          {{ $t('onboarding.welcome_description') }}
        </div>

        <!-- 2x2 Grid for Steps -->
        <v-row class="mb-2">
          <v-col v-for="step in steps" :key="step.id" cols="12" sm="6">
            <v-card
              variant="outlined"
              class="h-100 d-flex flex-column pa-4"
              :color="isCompleted(step.id) ? 'success' : undefined"
              :class="{ 'bg-success-lighten-5': isCompleted(step.id) }"
            >
              <div class="d-flex w-100 justify-space-between mb-2">
                <div class="d-flex align-start flex-grow-1">
                  <v-icon
                    :icon="step.icon"
                    size="x-large"
                    class="mr-3 mt-1 flex-shrink-0"
                    :color="isCompleted(step.id) ? 'success' : 'primary'"
                  ></v-icon>
                  <div>
                    <div class="text-h6 font-weight-bold mb-1">
                      {{ $t(step.titleKey) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ $t(step.descKey) }}
                    </div>
                  </div>
                </div>

                <!-- Status Badge -->
                <v-chip
                  v-if="isCompleted(step.id)"
                  color="success"
                  size="small"
                  variant="flat"
                  class="flex-shrink-0 ml-2 mt-1"
                >
                  <v-icon start icon="mdi-check-circle" size="small"></v-icon>
                  {{ $t('onboarding.completed_label') }}
                </v-chip>
              </div>

              <v-spacer></v-spacer>

              <div class="d-flex align-center justify-space-between mt-4">
                <div class="text-caption text-medium-emphasis">
                  {{ $t(step.actionLabelKey) }}: {{ step.timeEstimate }}
                </div>
                <v-btn
                  :color="isCompleted(step.id) ? 'medium-emphasis' : 'primary'"
                  :variant="isCompleted(step.id) ? 'outlined' : 'elevated'"
                  elevation="0"
                  class="text-none z-index-1"
                  @click="startStep(step)"
                >
                  {{ $t(step.buttonKey) }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0 d-block border-t">
        <!-- Progress Section -->
        <div class="px-2 mt-4">
          <div class="d-flex justify-center align-center mb-2">
            <span class="font-weight-bold mr-1"
              >{{ completedCount }} of {{ totalSteps }}</span
            >
            <span class="text-medium-emphasis">{{
              $t('onboarding.steps_completed')
            }}</span>
          </div>
          <v-progress-linear
            :model-value="progressPercentage"
            color="primary"
            height="8"
            rounded
            class="mb-4"
            aria-label="Onboarding progress"
          ></v-progress-linear>

          <!-- Completion Message -->
          <div
            v-if="completedCount === totalSteps"
            class="text-center text-success mb-2 font-weight-medium"
          >
            {{ $t('onboarding.all_complete_msg') }}
          </div>

          <div class="d-flex justify-space-between align-center mt-6">
            <div class="d-flex align-center gap-2">
              <v-btn
                variant="text"
                color="error"
                class="text-none px-2 text-caption"
                @click="confirmReset = true"
              >
                <v-icon start icon="mdi-refresh"></v-icon>
                {{ $t('onboarding.reset_config') }}
              </v-btn>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                color="medium-emphasis"
                class="text-none mr-2 d-none d-sm-flex"
                @click="closeWizard"
              >
                {{ $t('onboarding.finish_later') }}
              </v-btn>
              <v-btn color="primary" class="text-none" @click="closeWizard">
                {{ $t('onboarding.go_to_dashboard') }}
                <v-icon icon="mdi-chevron-right" class="ml-1"></v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Reset Confirmation Dialog -->
  <v-dialog v-model="confirmReset" max-width="400">
    <v-card rounded="xl" class="pa-6 text-center">
      <v-icon
        icon="mdi-alert-circle-outline"
        color="error"
        size="x-large"
        class="mb-4 mx-auto"
      ></v-icon>
      <div class="text-h6 mb-2">{{ $t('onboarding.reset_config') }}</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        {{ $t('onboarding.reset_confirm') }}
      </div>
      <div class="d-flex justify-center gap-3">
        <v-btn
          variant="outlined"
          class="text-none"
          @click="confirmReset = false"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="error"
          class="text-none"
          elevation="0"
          @click="resetConfig"
        >
          {{ $t('common.confirm') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import logoSmall from '@/assets/logo_full.png'

export default {
  name: 'OnboardingWizard',
  setup() {
    const store = useStore()
    const router = useRouter()

    const confirmReset = ref(false)

    const internalIsOpen = computed({
      get: () => store.state.Onboarding.isOpen,
      set: (val) => store.dispatch('Onboarding/toggleWizard', val),
    })

    const steps = [
      {
        id: 'home_tour',
        icon: 'mdi-paper-airplane',
        titleKey: 'onboarding.home_tour_title',
        descKey: 'onboarding.home_tour_desc',
        actionLabelKey: 'onboarding.start',
        timeEstimate: '3 min',
        buttonKey: 'onboarding.start_tour',
        action: () => {
          // TODO: Intercept and start a product tour
          store.dispatch('Onboarding/markStepCompleted', 'home_tour')
        },
      },
      {
        id: 'create_study',
        icon: 'mdi-minus-box-outline',
        titleKey: 'onboarding.create_study_title',
        descKey: 'onboarding.create_study_desc',
        actionLabelKey: 'onboarding.begin',
        timeEstimate: '1 min',
        buttonKey: 'onboarding.begin_btn',
        action: () => {
          store.dispatch('Onboarding/markStepCompleted', 'create_study')
          internalIsOpen.value = false
          router.push('/dashboard') // Or another specific route to create a study
        },
      },
      {
        id: 'explore_templates',
        icon: 'mdi-calendar-check',
        titleKey: 'onboarding.templates_title',
        descKey: 'onboarding.templates_desc',
        actionLabelKey: 'onboarding.browse',
        timeEstimate: '2 min',
        buttonKey: 'onboarding.browse_btn',
        action: () => {
          store.dispatch('Onboarding/markStepCompleted', 'explore_templates')
          internalIsOpen.value = false
          router.push('/templates')
        },
      },
      {
        id: 'invite_team',
        icon: 'mdi-account-multiple-plus',
        titleKey: 'onboarding.invite_team_title',
        descKey: 'onboarding.invite_team_desc',
        actionLabelKey: 'onboarding.completed_label',
        timeEstimate: '1 min',
        buttonKey: 'onboarding.configure',
        action: () => {
          store.dispatch('Onboarding/markStepCompleted', 'invite_team')
          internalIsOpen.value = false
          // Go to settings/team page if it exists
        },
      },
    ]

    const totalSteps = steps.length
    const completedCount = computed(
      () => store.getters['Onboarding/completedSteps'].length,
    )
    const progressPercentage = computed(
      () => (completedCount.value / totalSteps) * 100,
    )

    const isCompleted = (stepId) =>
      store.getters['Onboarding/isStepCompleted'](stepId)

    const closeWizard = () => {
      internalIsOpen.value = false
    }

    const startStep = (step) => {
      step.action()
    }

    const resetConfig = () => {
      store.dispatch('Onboarding/resetWizard')
      confirmReset.value = false
    }

    return {
      internalIsOpen,
      confirmReset,
      logoSmall,
      steps,
      totalSteps,
      completedCount,
      progressPercentage,
      isCompleted,
      closeWizard,
      startStep,
      resetConfig,
    }
  },
}
</script>

<style scoped>
.bg-success-lighten-5 {
  background-color: #f1f8e9 !important; /* very light green */
}
</style>
