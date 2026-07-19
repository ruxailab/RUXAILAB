<template>
  <div>
    <div class="mb-4">
      <h3 class="text-h6 font-weight-bold mb-1">
        {{ t('focusGroup.config.title') }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ t('focusGroup.config.subtitle') }}
      </p>
    </div>

    <!-- Capabilities the facilitator wants for this session -->
    <v-row dense>
      <v-col
        v-for="feature in features"
        :key="feature.key"
        cols="12"
        md="6"
      >
        <v-card
          variant="outlined"
          rounded="lg"
          class="pa-3 h-100"
          :class="{ 'border-primary': config[feature.key] }"
        >
          <v-switch
            v-model="config[feature.key]"
            color="primary"
            density="comfortable"
            hide-details
            class="mt-0"
          >
            <template #label>
              <div class="d-flex align-center">
                <v-icon :icon="feature.icon" size="20" class="me-2" />
                <div>
                  <div class="text-body-2 font-weight-medium">
                    {{ t(feature.label) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ t(feature.hint) }}
                  </div>
                </div>
              </div>
            </template>
          </v-switch>
        </v-card>
      </v-col>
    </v-row>

    <!-- Max participants -->
    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="config.maxParticipants"
          type="number"
          variant="outlined"
          density="comfortable"
          min="1"
          :label="t('focusGroup.config.maxParticipants')"
          :hint="t('focusGroup.config.maxParticipantsHint')"
          persistent-hint
        />
      </v-col>
    </v-row>

    <!-- Consent text, only relevant when consent is required -->
    <div v-if="config.requireConsent" class="mt-4">
      <v-alert
        v-if="!hasConsentText"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-3"
        :text="t('focusGroup.config.consentMissing')"
      />
      <TextareaForm
        v-model="config.consentText"
        :title="t('focusGroup.config.consentTitle')"
        :subtitle="t('focusGroup.config.consentSubtitle')"
      />
    </div>
  </div>
</template>

<script setup>
import TextareaForm from '@/shared/components/TextareaForm.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const config = defineModel({ type: Object, required: true })

// Quill leaves empty markup behind, so strip tags before deciding the form is blank.
const hasConsentText = computed(
  () =>
    (config.value.consentText ?? '').replace(/<[^>]*>/g, '').trim().length > 0,
)

// Session capabilities, rendered as a selectable list so a facilitator picks
// only what a given session needs.
const features = [
  {
    key: 'allowParticipantChat',
    icon: 'mdi-message-text-outline',
    label: 'focusGroup.config.chat',
    hint: 'focusGroup.config.chatHint',
  },
  {
    key: 'recordAudio',
    icon: 'mdi-microphone-outline',
    label: 'focusGroup.config.recordAudio',
    hint: 'focusGroup.config.recordAudioHint',
  },
  {
    key: 'recordVideo',
    icon: 'mdi-video-outline',
    label: 'focusGroup.config.recordVideo',
    hint: 'focusGroup.config.recordVideoHint',
  },
  {
    key: 'requireConsent',
    icon: 'mdi-file-document-check-outline',
    label: 'focusGroup.config.requireConsent',
    hint: 'focusGroup.config.requireConsentHint',
  },
  {
    key: 'enableWaitingRoom',
    icon: 'mdi-account-clock-outline',
    label: 'focusGroup.config.waitingRoom',
    hint: 'focusGroup.config.waitingRoomHint',
  },
  {
    key: 'hideObservers',
    icon: 'mdi-eye-off-outline',
    label: 'focusGroup.config.hideObservers',
    hint: 'focusGroup.config.hideObserversHint',
  },
]
</script>
