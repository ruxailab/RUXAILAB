<template>
  <v-row class="session-lobby lobby-bg pa-0 ma-0" align="center">
    <v-col md="8" class="ma-5 pa-5">
      <img
        src="@/assets/logo_full_white.png"
        alt="RUXAILAB"
        class="mb-10"
        style="max-width: 260px"
      />

      <h1 class="text-h2 font-weight-bold text-white mb-2">
        {{ title || t('focusGroup.dashboard.typeLabel') }}
      </h1>
      <p v-if="description" class="text-body-1 mb-6 text-white text-justify">
        {{ description }}
      </p>

      <!-- No topics configured -->
      <v-alert
        v-if="!hasTopics"
        type="error"
        variant="outlined"
        class="mb-4"
        color="white"
        style="background-color: rgba(255, 255, 255, 0.1); border-color: white"
      >
        <template #prepend>
          <v-icon color="white">mdi-alert-circle</v-icon>
        </template>
        <span class="text-white">{{
          t('focusGroup.session.noTopicsWarning')
        }}</span>
      </v-alert>

      <!-- Ended -->
      <template v-else-if="status === 'ended'">
        <div class="d-flex align-center ga-2 mb-2">
          <v-icon color="white" size="28">mdi-check-circle-outline</v-icon>
          <span class="text-h6 text-white">{{
            t('focusGroup.session.endedTitle')
          }}</span>
        </div>
        <p class="text-body-1 text-white mb-0">
          {{ t('focusGroup.session.endedSubtitle') }}
        </p>
      </template>

      <!-- Idle: facilitator can start -->
      <template v-else-if="isFacilitator">
        <v-btn
          color="white"
          variant="outlined"
          rounded
          size="x-large"
          :loading="starting"
          @click="$emit('start')"
        >
          <v-icon start>mdi-play</v-icon>
          {{ t('focusGroup.session.startSession') }}
        </v-btn>
        <p class="text-body-2 text-white mt-4 mb-0" style="opacity: 0.8">
          {{ t('focusGroup.session.lobbyStartHint') }}
        </p>
      </template>

      <!-- Idle: participant waits -->
      <template v-else>
        <div class="d-flex align-center ga-3">
          <v-progress-circular
            indeterminate
            color="white"
            size="24"
            width="2"
          />
          <span class="text-h6 text-white">{{
            t('focusGroup.session.waitingParticipant')
          }}</span>
        </div>
      </template>

      <!-- Presence count -->
      <div v-if="hasTopics" class="d-flex align-center ga-2 mt-8">
        <v-icon color="white" size="18">mdi-account-multiple</v-icon>
        <span class="text-body-2 text-white" style="opacity: 0.85">
          {{ t('focusGroup.session.inTheRoom', { count: participantCount }) }}
        </span>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: 'idle' },
  isFacilitator: { type: Boolean, default: false },
  hasTopics: { type: Boolean, default: false },
  participantCount: { type: Number, default: 0 },
  starting: { type: Boolean, default: false },
})

defineEmits(['start'])
</script>

<style scoped>
.session-lobby {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.lobby-bg {
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(
    160deg,
    #00213f 0%,
    #1a2f4f 35%,
    #303f9f 100%
  );
}

.session-lobby::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
}

@keyframes subtleGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
