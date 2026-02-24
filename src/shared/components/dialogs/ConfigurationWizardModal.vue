<template>
  <v-dialog
    v-model="isVisible"
    max-width="800px"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card
      class="pa-6 rounded-xl elevation-10"
      style="background-color: #ffffff"
    >
      <v-card-title
        class="text-h4 font-weight-bold text-center mb-2"
        style="color: #2b2b2b"
      >
        {{ $t('wizard.welcome_title') }}
      </v-card-title>

      <v-card-text>
        <div class="text-subtitle-1 text-center mb-8" style="color: #666">
          {{ $t('wizard.subtitle') }}
        </div>

        <v-row class="mb-6">
          <v-col v-for="step in steps" :key="step.id" cols="12" sm="6" md="4">
            <v-btn
              block
              :color="step.completed ? 'success' : 'primary'"
              class="text-none custom-btn"
              size="x-large"
              rounded="lg"
              elevation="2"
              height="80"
              @click="handleStepClick(step)"
            >
              <div class="d-flex flex-column align-center w-100 px-2">
                <v-icon :size="step.completed ? 28 : 32" class="mb-1">
                  {{ step.completed ? 'mdi-check-circle' : step.icon }}
                </v-icon>
                <div
                  class="text-truncate"
                  style="width: 100%; white-space: normal; line-height: 1.2"
                >
                  {{ $t(step.nameKey) }}
                </div>
              </div>
            </v-btn>
          </v-col>
        </v-row>

        <div class="mt-8 mb-2 d-flex justify-space-between align-center">
          <span class="text-subtitle-2 font-weight-bold" style="color: #4a4a4a">
            {{ $t('wizard.progress') }}: {{ progressPercentage }}%
          </span>
        </div>

        <v-progress-linear
          :model-value="progressPercentage"
          color="primary"
          height="12"
          rounded
          class="mb-6 elevation-1"
        ></v-progress-linear>
      </v-card-text>

      <v-divider class="mb-6"></v-divider>

      <v-card-actions class="justify-center">
        <v-btn
          color="error"
          variant="flat"
          size="x-large"
          class="px-8 text-none text-subtitle-1 font-weight-bold"
          rounded="lg"
          elevation="3"
          @click="closeWizard"
        >
          {{ $t('wizard.close_button') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'ConfigurationWizardModal',
  setup() {
    const store = useStore()
    const router = useRouter()

    const isVisible = computed({
      get: () => store.getters['wizard/isVisible'],
      set: (value) => store.commit('wizard/SET_VISIBILITY', value),
    })

    const progressPercentage = computed(
      () => store.getters['wizard/progressPercentage'],
    )
    const steps = computed(() => store.getters['wizard/steps'])

    const closeWizard = () => {
      store.dispatch('wizard/closeWizard')
    }

    const handleStepClick = async (step) => {
      // In a real implementation, you would route to the appropriate setup page.
      // E.g., if step.id === 'org_setup' -> router.push('/settings/organization')
      // For this wizard preview/prototype, we will just mark the step as completed
      // to demonstrate the progress bar and gamification effect.

      // router.push(`/setup/${step.id}`)
      await store.dispatch('wizard/completeStep', step.id)
    }

    return {
      isVisible,
      progressPercentage,
      steps,
      closeWizard,
      handleStepClick,
    }
  },
}
</script>

<style scoped>
.custom-btn {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  letter-spacing: 0.5px;
}
.custom-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}
</style>
