<template>
  <ShowInfo>
    <template #content>
      <div class="moderator-content pa-6 rounded-xl text-center fade-in">
        <div class="moderator-badge mb-4">
          <v-chip color="primary" size="large" class="px-4 py-2">
            <v-icon left size="20">mdi-account-star</v-icon>
            Moderator View
          </v-chip>
        </div>

        <h2 class="text-h4 font-weight-bold mb-4 text-primary">
          Welcome to the Moderated Test Session
        </h2>
        
        <p class="text-body-1 mb-6 text-grey-darken-1">
          As the moderator, you will guide the participant through the test process while observing their interactions via video call.
        </p>

        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10" lg="8">
            <v-card class="moderator-instructions elevation-3" color="blue-grey-lighten-5">
              <v-card-title class="text-h6 text-center pb-2">
                <v-icon left color="primary">mdi-clipboard-list</v-icon>
                Moderator Instructions
              </v-card-title>
              <v-card-text>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item prepend-icon="mdi-video-plus" class="mb-2">
                    <v-list-item-title>Start by opening the video call room</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-eye" class="mb-2">
                    <v-list-item-title>Observe participant interactions without interference</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-format-list-numbered" class="mb-2">
                    <v-list-item-title>Use the step navigator to jump between test phases</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-microphone" class="mb-2">
                    <v-list-item-title>Provide guidance only when necessary</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

    
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6 text-left"
        >
        
          <strong>Remember:</strong> Your role is to facilitate and observe. The participant should complete tasks independently unless they specifically request help.
        </v-alert>

        <div class="action-buttons">
          <v-btn
            color="success"
            variant="flat"
            size="x-large"
            class="px-8"
            @click="$emit('start')"
          >
            <v-icon left>mdi-play</v-icon>
            Start Moderated Session
          </v-btn>
        </div>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
import { VStepperVertical } from 'vuetify/labs/VStepperVertical';
import { useDisplay } from 'vuetify';

const props = defineProps({
  stepperValue: { type: Number, required: true },
});

const emit = defineEmits(['start']);
const { smAndDown } = useDisplay();
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