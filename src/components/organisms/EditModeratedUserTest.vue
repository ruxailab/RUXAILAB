<template>
  <div>
    <v-tabs
      bg-color="transparent"
      color="#FCA326"
      class="pb-0 mb-0"
    >
      <v-tab @click="tabClicked(0)">Test</v-tab>
      <v-tab @click="tabClicked(1)">{{ $t('ModeratedTest.consentForm') }}</v-tab>
      <v-tab @click="tabClicked(2)">{{ $t('ModeratedTest.preTest') }}</v-tab>
      <v-tab @click="tabClicked(3)">{{ $t('ModeratedTest.tasks') }}</v-tab>
      <v-tab @click="tabClicked(4)">{{ $t('ModeratedTest.postTest') }}</v-tab>
    </v-tabs>

    <VCol cols="12">
      <!-- TEST -->
      <div v-if="index === 0">
        <VRow>
          <VCol cols="9">
            <TextareaForm
              v-model="welcomeMessage"
              :title="$t('ModeratedTest.welcomeMessage')"
              :subtitle="$t('ModeratedTest.welcomeMessageDescription')"
              @update:value="saveState('welcome', $event)"
            />

            <TextareaForm
              v-model="finalMessage"
              :title="$t('ModeratedTest.finalMessage')"
              :subtitle="$t('ModeratedTest.finalMessageDescription')"
              @update:value="saveState('finalMessage', $event)"
            />
          </VCol>

          <VCol cols="3">
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
                  @update:model-value="saveState('participantCamera', $event)"
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
      </div>

      <!-- CONSENT FORM -->
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
        <UserVariables type="pre-test" @update="saveState('preTest', $event)" />
      </v-card>

      <!-- TASKS -->
      <v-card
        v-if="index === 3"
        rounded="xxl"
      >
        <ModeratedTask />
      </v-card>

      <!-- POS-TEST -->
      <v-card
        v-if="index === 4"
        rounded="xxl"
      >
        <UserVariables type="post-test" @update="saveState('postTest', $event)" />
      </v-card>
    </VCol>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import UserVariables from '../../features/UserTest/components/UserVariables.vue'
import ModeratedTask from '../molecules/ModeratedTask.vue'
import TextareaForm from '../../shared/components/TextareaForm.vue'

// Props
const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  object: {
    type: Object,
    default: () => ({}),
  },
});

// Emits
const emit = defineEmits(['tabClicked', 'change']);

// Reactive state
const welcomeMessage = ref('')
const finalMessage = ref('')
const participantCamera = ref('')
const consent = ref('')

// Stores
const store = useStore()

// Computed
const test = computed(() => store.getters.test)

// Methods
const tabClicked = (index) => emit('tabClicked', index)

const getWelcome = () => {
  welcomeMessage.value = test.value.testStructure?.welcomeMessage || ''
}

const getFinalMessage = () => {
  finalMessage.value = test.value.testStructure?.finalMessage || ''
}

const getParticipantCamera = () => {
  participantCamera.value = test.value.testStructure?.participantCamera || ''
}

const getConsent = () => {
  consent.value = test.value.testStructure?.consent || ''
}

const saveState = async (type, value) => {
  const states = {
    'consent': 'setConsent',
    'finalMessage': 'setFinalMessage',
    'participantCamera': 'setParticipantCamera',
    'welcome': 'setWelcomeMessage',
    'preTest': 'setPreTest',
    'postTest': 'setPostTest',
  }

  emit('change', true)
  if (states[type]) store.dispatch(states[type], value)
}

onMounted(() => {
  getWelcome()
  getFinalMessage()
  getParticipantCamera()
  getConsent()
})
</script>
