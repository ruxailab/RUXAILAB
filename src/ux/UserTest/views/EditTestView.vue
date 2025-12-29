<template>
  <PageWrapper :title="t('pages.editTest.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ t('pages.editTest.description') }}
      </p>
    </template>

    <v-container>
      <ButtonSave :visible="true" @click="save" />

      <!-- MOBILE: SELECT -->
      <v-select
        v-if="smAndDown"
        v-model="index"
        :items="tabItems"
        item-title="title"
        item-value="value"
        prepend-inner-icon="mdi-view-list"
        variant="outlined"
        density="comfortable"
        class="mb-6 sticky-select"
        hide-details
      />

      <!-- DESKTOP: TABS -->
      <v-tabs
        v-else
        v-model="index"
        bg-color="transparent"
        color="#FCA326"
        class="pb-0 mb-4"
      >
        <v-tab
          v-for="tab in tabItems"
          :key="tab.value"
          :value="tab.value"
        >
          {{ tab.title }}
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

        <!-- CONSENT FORM -->
        <div v-if="index === 1">
          <TextareaForm
            v-model="consent"
            :title="$t('ModeratedTest.consentForm')"
            :subtitle="$t('ModeratedTest.consentFormSubtitle')"
            @update:value="consent = $event"
          />
        </div>

        <!-- PRE-TEST -->
        <div v-if="index === 2">
          <UserVariables
            type="pre-test"
            @change="change = true"
            @update="store.dispatch('setPreTest', $event)"
          />
        </div>

        <!-- TASKS -->
        <div v-if="index === 3">
          <ListTasks />
        </div>

        <!-- POST-TEST -->
        <div v-if="index === 4">
          <UserVariables
            type="post-test"
            @change="change = true"
            @update="store.dispatch('setPostTest', $event)"
          />
        </div>
      </v-col>
      <div>
        <v-tabs bg-color="transparent" color="#FCA326" class="pb-0 mb-0">
          <v-tab @click="index = 0">
            {{ $t('UserTestTable.titles.testConfiguration') }}
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
          <v-tab v-if="hasEyeTracking" @click="index = 5">
            Eye Tracking Configurations
          </v-tab>
        </v-tabs>

        <v-col cols="12">
          <!-- TEST -->
          <div v-if="index === 0">
            <TestConfigForm
              :welcome="welcomeMessage"
              :final-message="finalMessage"
              @update:welcome-message="welcomeMessage = $event; change = true"
              @update:final-message="finalMessage = $event; change = true"
            />
          </div>

          <!-- CONSENT FORM -->
          <div v-if="index === 1" rounded="xxl">
            <TextareaForm v-model="consent" :title="$t('ModeratedTest.consentForm')"
              :subtitle="$t('ModeratedTest.consentFormSubtitle')" @update:value="consent = $event" />
          </div>

          <!-- PRE-TEST -->
          <div v-if="index === 2">
            <UserVariables type="pre-test" @change="change = true" @update="store.dispatch('setPreTest', $event)" />
          </div>

          <!-- TASKS -->
          <div v-if="index === 3">
            <ListTasks />
          </div>
          <!-- POST-TEST -->
          <div v-if="index === 4">
            <UserVariables type="post-test" @change="change = true" @update="store.dispatch('setPostTest', $event)" />
          </div>

          <v-card v-if="index === 5 && hasEyeTracking" rounded="xxl">
            <EyeTrackingConfig />
          </v-card>
        </v-col>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted, ref , onUnmounted} from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

import { useRoute } from 'vue-router'
import StudyController from '@/controllers/StudyController' 
import ListTasks from '@/ux/UserTest/components/ListTasks.vue'
import UserVariables from '@/ux/UserTest/components/UserVariables.vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'
import TestConfigForm from '@/shared/components/TestConfigForm.vue'
import EyeTrackingConfig from '../components/EyeTrackingConfig.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions';
import { useI18n } from 'vue-i18n'
import { showSuccess, showError } from '@/shared/utils/toast'



// Controller
const studyController = new StudyController()

// Store & utils
const store = useStore()
const { t } = useI18n()
const { smAndDown } = useDisplay()

// State
const change = ref(false)
const welcomeMessage = ref('')
const finalMessage = ref('')
const consent = ref('')
const index = ref(0)

// Tabs / Select items
const tabItems = [
  { title: t('UserTestTable.titles.testConfiguration').toUpperCase(), value: 0 },
  { title: t('ModeratedTest.consentForm').toUpperCase(), value: 1 },
  { title: t('ModeratedTest.preTest').toUpperCase(), value: 2 },
  { title: t('ModeratedTest.tasks').toUpperCase(), value: 3 },
  { title: t('ModeratedTest.postTest').toUpperCase(), value: 4 },
]

const route = useRoute()
let unsubscribe = null
// Computed
const test = computed(() => store.getters.test)

// Init helpers
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

// Save
const save = async () => {
  try {
    const preTestInvalid = (store.getters.preTest || []).some(i => !i.title?.trim())
    const postTestInvalid = (store.getters.postTest || []).some(i => !i.title?.trim())

    if (preTestInvalid || postTestInvalid) {
      toast.error('Cannot save: Some variables are missing titles')
const hasEyeTracking = computed(() => {
  return (test.value.testStructure.userTasks || []).some(task => task.hasEye === true)
})


const save = async () => {
  try {
    // Validate pre-test variables
    const preTestVariables = store.getters.preTest || []
    const invalidPreTest = preTestVariables.filter(item => !item.title || !item.title.trim())
    if (invalidPreTest.length > 0) {
      showError('Cannot save: Some pre-test variables are missing titles')
      return
    }

    // Validate post-test variables
    const postTestVariables = store.getters.postTest || []
    const invalidPostTest = postTestVariables.filter(item => !item.title || !item.title.trim())
    if (invalidPostTest.length > 0) {
      showError('Cannot save: Some post-test variables are missing titles')
      return
    }

    const testStructure = {
      welcomeMessage: welcomeMessage.value,
      finalMessage: finalMessage.value,
      preTest: store.getters.preTest,
      userTasks: store.getters.tasks,
      postTest: store.getters.postTest,
      consent: consent.value,
    }

    const study = instantiateStudyByType(test.value.testType, {
      ...test.value,
      testStructure,
    })

    await store.dispatch('updateStudy', study)
    change.value = false
    toast.success(t('pages.editTest.updatedTest'))
  } catch (err) {
    console.error(err)
    toast.error(t('errors.globalError'))
    const rawData = { ...test.value, testStructure: testStructure };
    const study = instantiateStudyByType(rawData.testType, rawData);
    await store.dispatch('updateStudy', study);
    showSuccess('pages.editTest.updatedTest');
  } catch (error) {
    console.error('Error saving test:', error);
    showError('errors.globalError');
  }
}

// Subscribe to test (gets the Real-time updates, no conflicts)
const subscribeToTest = () => {
  const testId = route.params.id
  if (testId) {
    unsubscribe = studyController.subscribeToStudy(testId, (test) => {
      store.commit("SET_TEST", test)
      getWelcome()
      getFinalMessage()
      getConsent()
      getPreTest()
      getPostTest()
      getTasks()
    })
  }
}
// Lifecycle
onMounted(() => {
  subscribeToTest();
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
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

.sticky-select {
  position: sticky;
  top: 12px;
  z-index: 10;
  background: #ffffff;
}
</style>
