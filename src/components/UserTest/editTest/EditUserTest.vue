<template>
  <v-tabs
    bg-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="index = 0">Test</v-tab>
    <v-tab @click="index = 1">{{ $t('ModeratedTest.consentForm') }}</v-tab>
    <v-tab @click="index = 2">{{ $t('ModeratedTest.preTest') }}</v-tab>
    <v-tab @click="index = 3">{{ $t('ModeratedTest.tasks') }}</v-tab>
    <v-tab @click="index = 4">{{ $t('ModeratedTest.postTest') }}</v-tab>
  </v-tabs>

  <v-col cols="12">
    <!-- TEST -->
    <div v-if="index === 0">
      <TestConfigForm
        :type="props.type"
        :welcome="welcomeMessage"
        :final-message="finalMessage"
        :participant-camera="participantCamera"
        @update:welcome-message="saveState('welcomeMessage', $event)"
        @update:final-message="saveState('finalMessage', $event)"
        @update:participant-camera="saveState('participantCamera', $event)"
      />
    </div>

    <!-- COSENT FORM -->
    <v-card
      v-if="index === 1"
      rounded="xxl"
    >
      <TextareaForm
        v-model="consent"
        :title="$t('ModeratedTest.consentForm')"
        subtitle="Edit the consent text for the test. Changes are saved when you click the Save button."
        @update:value="saveState('consent', $event)"
      />
    </v-card>

    <!-- PRE-TEST -->
    <v-card
      v-if="index === 2"
      rounded="xxl"
    >
      <UserVariables
        type="pre-test"
        @update="saveState('preTest', $event)"
      />
    </v-card>

    <!-- TASKS -->
    <ListTasks
      v-if="index === 3 && (props.type === METHOD_DEFINITIONS.USER_UNMODERATED.id || props.type === 'unmoderated')"
    />

    <v-card
      v-if="index === 3 && (props.type === METHOD_DEFINITIONS.USER_MODERATED.id || props.type === 'moderated')"
      rounded="xxl"
    >
      <ModeratedTask />
    </v-card>

    <!-- POST-TEST -->
    <v-card
      v-if="index === 4"
      rounded="xxl"
    >
      <UserVariables
        type="post-test"
        @update="saveState('postTest', $event)"
      />
    </v-card>
  </v-col>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import ListTasks from '@/components/molecules/ListTasks.vue'
import UserVariables from '@/components/atoms/UserVariables.vue'
import TextareaForm from '@/components/atoms/TextareaForm.vue'
import ModeratedTask from '@/components/molecules/ModeratedTask.vue'
import TestConfigForm from '@/components/molecules/TestConfigForm.vue'
import { METHOD_DEFINITIONS } from '@/constants/methodDefinitions'

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

// Emits
const emit = defineEmits(['change'])

// Store
const store = useStore()

// Variables
const welcomeMessage = ref('')
const finalMessage = ref('')
const participantCamera = ref('')
const consent = ref('')
const index = ref(0)

// Computed
const testStructure = computed(() => store.state.Tests.Test.testStructure)

// Methods
const saveState = async (type, value) => {
  const states = {
    'welcomeMessage': 'setWelcomeMessage',
    'finalMessage': 'setFinalMessage',
    'participantCamera': 'setParticipantCamera',
    'consent': 'setConsent',
    'preTest': 'setPreTest',
    'postTest': 'setPostTest',
  }


  emit('change')
  if (type === 'participantCamera') participantCamera.value = value
  if (states[type]) store.dispatch(states[type], value)
}

const getWelcome = () => {
  welcomeMessage.value = testStructure.value.welcomeMessage || ''
  saveState('welcomeMessage', welcomeMessage)
}

const getFinalMessage = () => {
  finalMessage.value = testStructure.value.finalMessage || ''
  saveState('finalMessage', finalMessage.value)
}

const getParticipantCamera = () => {
  participantCamera.value = testStructure.value.participantCamera || ''
  console.log('Participant Camera:', participantCamera.value)
  saveState('participantCamera', participantCamera.value)
}

const getConsent = () => {
  consent.value = testStructure.value.consent || ''
  saveState('consent', consent.value)
}

// Lifecycle
onMounted(() => {
  getWelcome()
  getFinalMessage()
  getConsent()

  if (props.type === METHOD_DEFINITIONS.USER_MODERATED.id || props.type === 'moderated') getParticipantCamera()
})
</script>

<style scoped>
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.v-text-field--outlined :deep(fieldset) {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
