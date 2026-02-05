<template>
  <PageWrapper :title="t('pages.editTest.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ t('pages.editTest.description') }}
      </p>
    </template>

    <v-container class="pa-0">
      <ButtonSave :visible="true" @click="save" />

      <div>
        <v-tabs 
          bg-color="transparent" 
          color="#FCA326" 
          class="pb-0 mb-0 scrollable-tabs"
          show-arrows
        >
          <v-tab @click="index = 0" class="uppercase-tab">
            {{ $t('UserTestTable.titles.testConfiguration') }}
          </v-tab>
          <v-tab @click="index = 1" class="uppercase-tab">
            {{ $t('ModeratedTest.consentForm') }}
          </v-tab>
          <v-tab @click="index = 2" class="uppercase-tab">
            {{ $t('ModeratedTest.preTest') }}
          </v-tab>
          <v-tab @click="index = 3" class="uppercase-tab">
            {{ $t('ModeratedTest.tasks') }}
          </v-tab>
          <v-tab @click="index = 4" class="uppercase-tab">
            {{ $t('ModeratedTest.postTest') }}
          </v-tab>
          <v-tab v-if="hasEyeTracking" @click="index = 5" class="uppercase-tab">
            EYE TRACKING CONFIGURATIONS
          </v-tab>
        </v-tabs>

        <v-col cols="12">
          <!-- TEST -->
          <div v-if="index === 0">
            <TestConfigForm
              :welcome="welcomeMessage"
              :final-message="finalMessage"
              @update:welcome-message="
                ;(welcomeMessage = $event), (change = true)
              "
              @update:final-message=";(finalMessage = $event), (change = true)"
            />
          </div>

          <!-- CONSENT FORM -->
          <div v-if="index === 1" rounded="xxl">
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
              @update="store.dispatch('UserStudy/setPreTest', $event)"
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
              @update="store.dispatch('UserStudy/setPostTest', $event)"
            />
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
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useStore } from 'vuex'
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
import { useI18n } from 'vue-i18n'
import { showSuccess, showError } from '@/shared/utils/toast'

// Controller
const studyController = new StudyController()

// Store
const store = useStore()
const { t } = useI18n()

// Variables
const change = ref(false)
const welcomeMessage = ref('')
const finalMessage = ref('')
const consent = ref('')
const index = ref(0)
const route = useRoute()
let unsubscribe = null
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
  const tasksData = test.value.testStructure.userTasks || []
  store.dispatch('UserStudy/setTasks', structuredClone(tasksData))
}

const getPreTest = () => {
  const preTestData = test.value.testStructure.preTest || []
  store.dispatch('UserStudy/setPreTest', structuredClone(preTestData))
}

const getPostTest = () => {
  const postTestData = test.value.testStructure.postTest || []
  store.dispatch('UserStudy/setPostTest', structuredClone(postTestData))
}

const hasEyeTracking = computed(() => {
  return (test.value.testStructure.userTasks || []).some(
    (task) => task.hasEye === true,
  )
})

const save = async () => {
  try {
    // Validate pre-test variables
    const preTestVariables = store.getters['UserStudy/preTest'] || []
    const invalidPreTest = preTestVariables.filter(
      (item) => !item.title || !item.title.trim(),
    )
    if (invalidPreTest.length > 0) {
      showError('Cannot save: Some pre-test variables are missing titles')
      return
    }

    // Validate post-test variables
    const postTestVariables = store.getters['UserStudy/postTest'] || []
    const invalidPostTest = postTestVariables.filter(
      (item) => !item.title || !item.title.trim(),
    )
    if (invalidPostTest.length > 0) {
      showError('Cannot save: Some post-test variables are missing titles')
      return
    }

    change.value = false

    const testStructure = {
      welcomeMessage: welcomeMessage.value,
      finalMessage: finalMessage.value,
      preTest: structuredClone(store.getters['UserStudy/preTest']),
      userTasks: structuredClone(store.getters['UserStudy/tasks']),
      postTest: structuredClone(store.getters['UserStudy/postTest']),
      consent: consent.value,
    }

    const rawData = { ...test.value, testStructure: testStructure }
    const study = instantiateStudyByType(rawData.testType, rawData)
    await store.dispatch('updateStudy', study)
    showSuccess('pages.editTest.updatedTest')
  } catch (error) {
    showError('errors.globalError')
  }
}

// Subscribe to test (gets the Real-time updates, no conflicts)
const subscribeToTest = () => {
  const testId = route.params.id
  if (testId) {
    unsubscribe = studyController.subscribeToStudy(testId, (test) => {
      store.commit('SET_TEST', test)
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
  subscribeToTest()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
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

.scrollable-tabs {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.scrollable-tabs :deep(.v-tabs-bar) {
  min-width: max-content;
}

.scrollable-tabs :deep(.v-slide-group__content) {
  flex-wrap: nowrap;
}

.uppercase-tab {
  text-transform: uppercase !important;
  font-weight: 500;
  letter-spacing: 0.5px;
  white-space: nowrap;
  min-width: fit-content;
}

.scrollable-tabs::-webkit-scrollbar {
  display: none;
}

.scrollable-tabs {
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}

@media (max-width: 960px) {
  .scrollable-tabs {
    padding-bottom: 8px;
  }
  
  .scrollable-tabs :deep(.v-tab) {
    padding: 0 16px;
    font-size: 14px;
  }
}
</style>
