<template>
  <PageWrapper
    :title="t('pages.editTest.title')"
    :side-gap="true"
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ t('pages.editTest.description') }}
      </p>
    </template>

    <v-container>
      <ButtonSave
        :visible="true"
        @click="save"
      />

      <div>
        <v-tabs
          bg-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0"
        >
          <v-tab @click="index = 0">
            Test configuration
          </v-tab>
          <v-tab @click="index = 1">
            {{ $t('ModeratedTest.consentForm') }}
          </v-tab>
          <v-tab @click="index = 2">
            {{ $t('ModeratedTest.preTest') }}
          </v-tab>
          <v-tab @click="index = 3">
            {{ $t('ModeratedTest.tasks') }}
          </v-tab>
          <v-tab @click="index = 4">
            {{ $t('ModeratedTest.postTest') }}
          </v-tab>
        </v-tabs>

        <v-col cols="12">
          <!-- TEST -->
          <div v-if="index === 0">
            <TestConfigForm
              :welcome="welcomeMessage"
              :final-message="finalMessage"
              @update:welcome-message="welcomeMessage = $event"
              @update:final-message="finalMessage = $event"
            />
          </div>

          <!-- COSENT FORM -->
          <div
            v-if="index === 1"
            rounded="xxl"
          >
            <TextareaForm
              v-model="consent"
              :title="$t('ModeratedTest.consentForm')"
              subtitle="Edit the consent text for the test. Changes are saved when you click the Save button."
              @update:value="consent = $event"
            />
          </div>

          <!-- PRE-TEST -->
          <div
            v-if="index === 2"
          >
            <UserVariables
              type="pre-test"
              @change="change = true"
              @update="store.dispatch('setPreTest', $event)"
            />
          </div>

          <!-- TASKS -->
          <div
            v-if="index === 3"
          >
            <ListTasks />
          </div>
          <!-- POST-TEST -->
          <div
            v-if="index === 4"
          >
            <UserVariables
              type="post-test"
              @change="change = true"
              @update="store.dispatch('setPostTest', $event)"
            />
          </div>
        </v-col>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import ListTasks from '@/ux/UserTest/components/ListTasks.vue'
import UserVariables from '@/ux/UserTest/components/UserVariables.vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'
import TestConfigForm from '@/shared/components/TestConfigForm.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions';
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

// Store
const store = useStore()
const toast = useToast()
const { t } = useI18n()

// Variables
const change = ref(false)
const welcomeMessage = ref('')
const finalMessage = ref('')
const consent = ref('')
const index = ref(0)

// Computed
const test = computed(() => store.getters.test)

const getWelcome = () => {
  welcomeMessage.value = test.value.testStructure.welcomeMessage || ''
}

const getFinalMessage = () => {
  finalMessage.value = test.value.testStructure.finalMessage || ''
}

const getConsent = () => {
  consent.value = test.value.testStructure.consent || ''
}

const getTasks = () => {
  store.dispatch('setTasks', test.value.testStructure.userTasks || [])
}

const getPreTest = () => {
  store.dispatch('setPreTest', test.value.testStructure.preTest || [])
}

const getPostTest = () => {
  store.dispatch('setPostTest', test.value.testStructure.postTest || [])
}

const save = async () => {
  try {
    // Validate pre-test variables
    const preTestVariables = store.getters.preTest || []
    const invalidPreTest = preTestVariables.filter(item => !item.title || !item.title.trim())
    if (invalidPreTest.length > 0) {
      toast.error('Cannot save: Some pre-test variables are missing titles')
      return
    }

    // Validate post-test variables
    const postTestVariables = store.getters.postTest || []
    const invalidPostTest = postTestVariables.filter(item => !item.title || !item.title.trim())
    if (invalidPostTest.length > 0) {
      toast.error('Cannot save: Some post-test variables are missing titles')
      return
    }

    change.value = false;

    const testStructure = {
      welcomeMessage: welcomeMessage.value,
      finalMessage: finalMessage.value,
      preTest: store.getters.preTest,
      userTasks: store.getters.tasks,
      postTest: store.getters.postTest,
      consent: consent.value,
    }

    const rawData = { ...test.value, testStructure: testStructure };
    const study = instantiateStudyByType(rawData.testType, rawData);
    await store.dispatch('updateStudy', study);
    toast.success(t('pages.editTest.updatedTest'));
  } catch (error) {
    console.error('Error saving test:', error);
    toast.error(t('errors.globalError'));
  }
}

// Lifecycle
onMounted(() => {
  getWelcome()
  getFinalMessage()
  getConsent()
  getPreTest()
  getPostTest()
  getTasks()
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
