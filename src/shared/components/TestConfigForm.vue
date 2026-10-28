<template>
  <v-row>
    <v-col cols="12">
      <TextareaForm
        v-model="welcomeMessageComputed"
        :readonly="readonly"
        :title="$t('ModeratedTest.welcomeMessage')"
        :subtitle="$t('ModeratedTest.welcomeMessageDescription')"
      />

      <TextareaForm
        v-model="finalMessageComputed"
        :readonly="readonly"
        :title="$t('ModeratedTest.finalMessage')"
        :subtitle="$t('ModeratedTest.finalMessageDescription')"
      />

      <v-row v-if="showMobileTaskInstructions" justify="center">
        <v-col lg="12" class="px-0 py-5">
          <v-card class="elevation-2 rounded-lg pa-md-6" width="100%">
            <v-row class="pa-4 pa-0" align="center">
              <v-col cols="12" md class="py-0">
                <v-card-title
                  class="text-h5 font-weight-bold pa-0"
                  :style="{
                    color: $vuetify.theme.current.colors['on-surface'],
                  }"
                >
                  {{ $t('pages.editTest.mobile_task_instructions') }}
                </v-card-title>
                <p class="text-body-1 mb-0" style="color: #4b5563">
                  {{ $t('pages.editTest.mobile_task_instructions_hint') }}
                </p>
              </v-col>
              <v-col
                cols="12"
                md="auto"
                class="py-0 pt-3 pt-md-0 d-flex justify-md-end"
              >
                <v-switch
                  :model-value="allowMobileTaskInstructions"
                  :disabled="readonly"
                  color="primary"
                  hide-details
                  inset
                  @update:model-value="
                    emit('update:allowMobileTaskInstructions', $event)
                  "
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <VideoCallConfigForm
        v-if="showVideoCallConfig"
        :test-id="testId"
        :video-call="videoCall"
        :readonly="readonly"
        @update:video-call="emit('update:videoCall', $event)"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'
import VideoCallConfigForm from '@/shared/components/videoCall/VideoCallConfigForm.vue'

const props = defineProps({
  welcome: {
    type: String,
    default: '',
  },
  finalMessage: {
    type: String,
    default: '',
  },
  testId: {
    type: String,
    default: '',
  },
  videoCall: {
    type: Object,
    default: null,
  },
  showVideoCallConfig: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  showMobileTaskInstructions: {
    type: Boolean,
    default: false,
  },
  allowMobileTaskInstructions: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'update:welcomeMessage',
  'update:finalMessage',
  'update:participantCamera',
  'update:videoCall',
  'update:allowMobileTaskInstructions',
])

// Computed
const welcomeMessageComputed = computed({
  get() {
    return props.welcome
  },
  set(value) {
    emit('update:welcomeMessage', value)
  },
})

const finalMessageComputed = computed({
  get() {
    return props.finalMessage
  },
  set(value) {
    emit('update:finalMessage', value)
  },
})
</script>
