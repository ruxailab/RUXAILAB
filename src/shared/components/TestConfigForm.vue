<template>
  <v-row>
    <v-col cols="12">
      <TextareaForm
        v-model="welcomeMessageComputed"
        :title="$t('ModeratedTest.welcomeMessage')"
        :subtitle="$t('ModeratedTest.welcomeMessageDescription')"
      />

      <TextareaForm
        v-model="finalMessageComputed"
        :title="$t('ModeratedTest.finalMessage')"
        :subtitle="$t('ModeratedTest.finalMessageDescription')"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'

const props = defineProps({
  welcome: {
    type: String,
    default: '',
  },
  finalMessage: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits([
  'update:welcomeMessage',
  'update:finalMessage',
  'update:participantCamera',
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
