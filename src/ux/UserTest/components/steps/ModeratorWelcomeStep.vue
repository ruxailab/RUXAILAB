<template>
  <ShowInfo>
    <template #content>
      <div class="moderator-content pa-6 rounded-xl text-center fade-in">
        <div class="moderator-badge mb-4">
          <v-chip color="primary" size="large" class="px-4 py-2">
            <v-icon start size="20">mdi-account-star</v-icon>
            {{ $t('UserTestView.ModeratorWelcomeStep.badge') }}
          </v-chip>
        </div>

        <h2 class="text-h4 font-weight-bold mb-4 text-primary">
          {{ $t('UserTestView.ModeratorWelcomeStep.welcome') }}
        </h2>

        <p class="text-body-1 mb-6 text-grey-darken-1">
          {{ $t('UserTestView.ModeratorWelcomeStep.description') }}
        </p>

        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10" lg="8">
            <v-card
              class="moderator-instructions elevation-3"
              color="blue-grey-lighten-5"
            >
              <v-card-title class="text-h6 text-center pb-2">
                <v-icon start color="primary">mdi-clipboard-list</v-icon>
                {{ $t('UserTestView.ModeratorWelcomeStep.instructionsTitle') }}
              </v-card-title>
              <v-card-text>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item prepend-icon="mdi-video-plus" class="mb-2">
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction1')
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-eye" class="mb-2">
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction2')
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-format-list-numbered"
                    class="mb-2"
                  >
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction3')
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-microphone" class="mb-2">
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction4')
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-alert type="info" variant="tonal" class="mb-6 text-left">
          <strong>{{
            $t('UserTestView.ModeratorWelcomeStep.remember')
          }}</strong>
          {{ $t('UserTestView.ModeratorWelcomeStep.note') }}
        </v-alert>

        <div class="action-buttons">
          <v-btn
            color="success"
            variant="flat"
            size="x-large"
            class="px-8"
            @click="$emit('start')"
          >
            <v-icon start>mdi-play</v-icon>
            {{ $t('UserTestView.ModeratorWelcomeStep.startSession') }}
          </v-btn>
        </div>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
defineProps({
  stepperValue: { type: Number, required: true },
})

defineEmits(['start'])
</script>

<style scoped>
.fade-in {
  animation: fadeIn 2s ease-in-out;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.moderator-content {
  max-width: 900px;
  margin: 0 auto;
}

.moderator-badge {
  display: flex;
  justify-content: center;
}

.moderator-instructions {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.test-overview {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  padding: 24px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .moderator-content {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
