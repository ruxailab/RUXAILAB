<template>
  <v-tabs bg-color="transparent" color="#FCA326" class="pb-0 mb-0">
    <v-tab @click="index = 0">Test</v-tab>
    <v-tab @click="index = 1">{{ $t('ModeratedTest.consentForm') }}</v-tab>
    <v-tab @click="index = 2">{{ $t('ModeratedTest.preTest') }}</v-tab>
    <v-tab @click="index = 3">{{ $t('ModeratedTest.tasks') }}</v-tab>
    <v-tab @click="index = 4">{{ $t('ModeratedTest.postTest') }}</v-tab>
  </v-tabs>

  <v-col cols="12">
    <!-- TEST -->
    <div v-if="index === 0">
      <TestConfigForm :welcome="welcomeMessage" :final-message="finalMessage"
        @update:welcome-message="saveState('welcomeMessage', $event)"
        @update:final-message="saveState('finalMessage', $event)" />
    </div>

    <!-- COSENT FORM -->
    <v-card v-if="index === 1" rounded="xxl">
      <TextareaForm v-model="consent" :title="$t('ModeratedTest.consentForm')"
        :subtitle="$t('ModeratedTest.consentFormSubtitle')" @update:value="saveState('consent', $event)" />
    </v-card>

    <!-- PRE-TEST -->
    <v-card v-if="index === 2" rounded="xxl">
      <UserVariables type="pre-test" @update="saveState('preTest', $event)" />
    </v-card>

    <!-- TASKS -->
    <ListTasks v-if="index === 3" />

    <!-- POST-TEST -->
    <v-card v-if="index === 4" rounded="xxl">
      <UserVariables type="post-test" @update="saveState('postTest', $event)" />
    </v-card>
  </v-col>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import ListTasks from '@/ux/UserTest/components/ListTasks.vue'
import UserVariables from '@/ux/UserTest/components/UserVariables.vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'
import TestConfigForm from '@/shared/components/TestConfigForm.vue'

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
const consent = ref('')
const index = ref(0)

// Computed
const testStructure = computed(() => store.state.Tests.Test.testStructure)

// Methods
const saveState = async (type, value) => {
  const states = {
    'welcomeMessage': 'setWelcomeMessage',
    'finalMessage': 'setFinalMessage',
    'consent': 'setConsent',
    'preTest': 'setPreTest',
    'postTest': 'setPostTest',
  }

  emit('change')
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

const getConsent = () => {
  consent.value = testStructure.value.consent || ''
  saveState('consent', consent.value)
}

// Lifecycle
onMounted(() => {
  getWelcome()
  getFinalMessage()
  getConsent()
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
