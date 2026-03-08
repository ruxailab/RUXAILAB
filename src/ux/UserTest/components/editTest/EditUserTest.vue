<template>
  <v-tabs
    v-model="index"
    bg-color="#F5F5F5"
    color="black"
    class="mb-6 segmented-control"
    show-arrows
    density="compact"
    slider-color="transparent"
    rounded="pill"
  >
    <v-tab
      :value="0"
      :class="{ 'active-segment': index === 0 }"
      rounded="pill"
      variant="text"
      class="segmented-tab"
      >Test</v-tab
    >
    <v-tab
      :value="1"
      :class="{ 'active-segment': index === 1 }"
      rounded="pill"
      variant="text"
      class="segmented-tab"
      >{{ $t('ModeratedTest.consentForm') }}</v-tab
    >
    <v-tab
      :value="2"
      :class="{ 'active-segment': index === 2 }"
      rounded="pill"
      variant="text"
      class="segmented-tab"
      >{{ $t('ModeratedTest.preTest') }}</v-tab
    >
    <v-tab
      :value="3"
      :class="{ 'active-segment': index === 3 }"
      rounded="pill"
      variant="text"
      class="segmented-tab"
      >{{ $t('ModeratedTest.tasks') }}</v-tab
    >
    <v-tab
      :value="4"
      :class="{ 'active-segment': index === 4 }"
      rounded="pill"
      variant="text"
      class="segmented-tab"
      >{{ $t('ModeratedTest.postTest') }}</v-tab
    >
  </v-tabs>

  <v-window v-model="index" class="mt-4">
    <!-- TEST -->
    <v-window-item :value="0">
      <TestConfigForm
        :welcome="welcomeMessage"
        :final-message="finalMessage"
        @update:welcome-message="saveState('welcomeMessage', $event)"
        @update:final-message="saveState('finalMessage', $event)"
      />
    </v-window-item>

    <!-- COSENT FORM -->
    <v-window-item :value="1">
      <v-card rounded="xxl">
        <TextareaForm
          v-model="consent"
          :title="$t('ModeratedTest.consentForm')"
          :subtitle="$t('ModeratedTest.consentFormSubtitle')"
          @update:value="saveState('consent', $event)"
        />
      </v-card>
    </v-window-item>

    <!-- PRE-TEST -->
    <v-window-item :value="2">
      <v-card rounded="xxl">
        <UserVariables type="pre-test" @update="saveState('preTest', $event)" />
      </v-card>
    </v-window-item>

    <!-- TASKS -->
    <v-window-item :value="3">
      <ListTasks />
    </v-window-item>

    <!-- POST-TEST -->
    <v-window-item :value="4">
      <v-card rounded="xxl">
        <UserVariables
          type="post-test"
          @update="saveState('postTest', $event)"
        />
      </v-card>
    </v-window-item>
  </v-window>
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

.segmented-control {
  padding: 4px !important;
  height: auto !important;
  width: fit-content;
  max-width: 100%;
}

.segmented-tab {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
  color: #757575 !important;
  min-height: 36px !important;
  height: 36px !important;
  transition: all 0.2s ease-in-out !important;
}

.active-segment {
  background-color: white !important;
  color: #212121 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
}

.segmented-control :deep(.v-slide-group__content) {
  padding: 0 !important;
}
</style>
