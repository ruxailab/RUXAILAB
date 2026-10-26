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
})

const emit = defineEmits([
  'update:welcomeMessage',
  'update:finalMessage',
  'update:participantCamera',
  'update:videoCall',
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
