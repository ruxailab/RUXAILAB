<template>
  <VRow>
    <VCol :cols="props.type === METHOD_DEFINITIONS.USER_MODERATED.id || props.type === 'moderated' ? 9 : 12">
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
    </VCol>

    <VCol
      v-if="props.type === METHOD_DEFINITIONS.USER_MODERATED.id || props.type === 'moderated'"
      cols="3"
    >
      <v-card
        flat
        class="elevation-2 rounded-lg pa-6"
      >
        <v-card-title class="text-h5 font-weight-bold mb-4 bg-on-surface">
          {{ $t('ModeratedTest.participantCamera') }}
        </v-card-title>
        <v-card-text>
          <v-radio-group
            v-model="participantCamera"
            class="pt-0"
          >
            <v-radio
              :label="$t('ModeratedTest.cameraOptions.optional')"
              color="orange"
              value="optional"
            />
            <v-radio
              :label="$t('ModeratedTest.cameraOptions.required')"
              color="orange"
              value="required"
            />
            <v-radio
              :label="$t('ModeratedTest.cameraOptions.disabled')"
              color="orange"
              value="disabled"
            />
          </v-radio-group>
        </v-card-text>
      </v-card>
    </VCol>
  </VRow>
</template>

<script setup>
import { computed } from 'vue';
import TextareaForm from '../atoms/TextareaForm.vue';
import { METHOD_DEFINITIONS } from '@/constants/methodDefinitions';

const props = defineProps({
  welcome: {
    type: String,
    default: '',
  },
  finalMessage: {
    type: String,
    default: '',
  },
  participantCamera: {
    type: String,
    default: 'optional',
  },
  type: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(['update:welcomeMessage', 'update:finalMessage', 'update:participantCamera']);

// Computed
const welcomeMessageComputed = computed({
  get() {
    return props.welcome
  },
  set(value) {
    emit('update:welcomeMessage', value)
  }
})

const finalMessageComputed = computed({
  get() {
    return props.finalMessage
  },
  set(value) {
    emit('update:finalMessage', value)
  }
})

const participantCamera = computed({
  get() {
    return props.participantCamera
  },
  set(value) {
    emit('update:participantCamera', value)
  }
})
</script>
