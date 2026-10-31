<template>
  <PageWrapper :title="pageTitle" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ pageSubtitle }}
      </p>
    </template>

    <v-container class="pa-0">
      <ButtonSave :visible="!isTemplate" @click="save" />

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
            {{ $t('EyeTrackingConfig.titles.main') }}
          </v-tab>
        </v-tabs>

        <v-col cols="12">
          <!-- TEST -->
          <div v-if="index === 0">
            <TestConfigForm
              :readonly="isTemplate"
              :welcome="welcomeMessage"
              :final-message="finalMessage"
              :test-id="route.params.id"
              :video-call="videoCallConfig"
              :show-video-call-config="isModerated"
              :show-mobile-task-instructions="
                showMobileTaskInstructionsSetting
              "
              :allow-mobile-task-instructions="allowMobileTaskInstructions"
              @update:welcome-message="updateWelcomeMessage"
              @update:final-message="updateFinalMessage"
              @update:video-call="onVideoCallConfigChange"
              @update:allow-mobile-task-instructions="
                onAllowMobileTaskInstructionsChange
              "
            />
          </div>

          <!-- CONSENT FORM -->
          <div v-if="index === 1" rounded="xxl">
            <TextareaForm
              v-model="consent"
              :readonly="isTemplate"
              :title="$t('ModeratedTest.consentForm')"
              :subtitle="$t('ModeratedTest.consentFormSubtitle')"
              @update:value="updateConsent"
            />
          </div>

          <!-- PRE-TEST -->
          <div v-if="index === 2">
            <UserVariables
              type="pre-test"
              :is-template="isTemplate"
              @change="markFieldDirty('preTest')"
              @update="store.dispatch('UserStudy/setPreTest', $event)"
            />
          </div>

          <!-- TASKS -->
          <div v-if="index === 3">
            <ListTasks
              :is-template="isTemplate"
              @change="markFieldDirty('userTasks')"
            />
          </div>
          <!-- POST-TEST -->
          <div v-if="index === 4">
            <UserVariables
              type="post-test"
              :is-template="isTemplate"
              @change="markFieldDirty('postTest')"
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
import {
  instantiateStudyByType,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import { DEFAULT_VIDEO_CALL_CONFIG } from '@/shared/constants/videoCallProviders'
import { useI18n } from 'vue-i18n'
import { showSuccess, showError } from '@/shared/utils/toast'
import {
  getStudyStructureFieldsToSync,
  mergeStudySnapshotPreservingFields,
} from '@/shared/utils/studyUpdatePatch'

const props = defineProps({
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateTest: {
    type: Object,
    default: null,
  },
})

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
const videoCallConfig = ref({ ...DEFAULT_VIDEO_CALL_CONFIG })
const allowMobileTaskInstructions = ref(true)
const index = ref(0)
const route = useRoute()
let unsubscribe = null
let unsubscribeStore = null
const dirtyStudyFields = new Map()
let fieldChangeVersion = 0
// Computed
const test = computed(() => store.getters.test)
const serializeCalibrationConfig = (config) =>
  JSON.stringify(
    typeof config?.toFirestore === 'function'
      ? config.toFirestore()
      : (config ?? null),
  )
let lastCalibrationConfig = serializeCalibrationConfig(
  test.value?.calibrationConfig,
)
const pageTitle = computed(() =>
  props.isTemplate
    ? t('pages.editTest.previewTitle')
    : t('pages.editTest.title'),
)
const pageSubtitle = computed(() =>
  props.isTemplate
    ? t('pages.editTest.previewDescription')
    : t('pages.editTest.description'),
)

const getWelcome = () => {
  welcomeMessage.value = test.value?.testStructure?.welcomeMessage || ''
}

const getFinalMessage = () => {
  finalMessage.value = test.value?.testStructure?.finalMessage || ''
}

const getConsent = () => {
  consent.value = test.value?.testStructure?.consent || ''
}

const getVideoCallConfig = () => {
  const saved = test.value?.testStructure?.videoCall
  videoCallConfig.value = saved
    ? { ...saved }
    : { ...DEFAULT_VIDEO_CALL_CONFIG }
}

const onVideoCallConfigChange = (config) => {
  videoCallConfig.value = config
  markFieldDirty('videoCall')
}

const markFieldDirty = (field) => {
  fieldChangeVersion += 1
  dirtyStudyFields.set(field, fieldChangeVersion)
  change.value = true
}

const updateWelcomeMessage = (value) => {
  welcomeMessage.value = value
  markFieldDirty('welcomeMessage')
}

const updateFinalMessage = (value) => {
  finalMessage.value = value
  markFieldDirty('finalMessage')
}

const updateConsent = (value) => {
  consent.value = value
  markFieldDirty('consent')
}

const isModerated = computed(
  () => test.value?.subType === USER_STUDY_SUBTYPES.MODERATED,
)
const showMobileTaskInstructionsSetting = computed(
  () =>
    !props.isTemplate &&
    test.value?.subType !== USER_STUDY_SUBTYPES.MODERATED,
)

const getAllowMobileTaskInstructions = () => {
  allowMobileTaskInstructions.value =
    test.value?.allowMobileTaskInstructions !== false
}

const onAllowMobileTaskInstructionsChange = (value) => {
  allowMobileTaskInstructions.value = value !== false
  markFieldDirty('allowMobileTaskInstructions')
}

const getTasks = () => {
  const tasksData = test.value?.testStructure?.userTasks || []
  store.dispatch('UserStudy/setTasks', structuredClone(tasksData))
}

const getPreTest = () => {
  const preTestData = test.value?.testStructure?.preTest || []
  store.dispatch('UserStudy/setPreTest', structuredClone(preTestData))
}

const getPostTest = () => {
  const postTestData = test.value?.testStructure?.postTest || []
  store.dispatch('UserStudy/setPostTest', structuredClone(postTestData))
}

const hasEyeTracking = computed(() => {
  return (test.value?.testStructure?.userTasks || []).some(
    (task) => task.hasEye === true,
  )
})

const save = async () => {
  if (props.isTemplate) return
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

    const testStructure = {
      welcomeMessage: welcomeMessage.value,
      finalMessage: finalMessage.value,
      preTest: structuredClone(store.getters['UserStudy/preTest']),
      userTasks: structuredClone(store.getters['UserStudy/tasks']),
      postTest: structuredClone(store.getters['UserStudy/postTest']),
      consent: consent.value,
    }

    if (isModerated.value) {
      testStructure.videoCall = structuredClone(videoCallConfig.value)
    }

    const rawData = {
      ...test.value,
      testStructure: testStructure,
      allowMobileTaskInstructions: allowMobileTaskInstructions.value,
    }
    const study = instantiateStudyByType(rawData.testType, rawData)
    const savedFieldVersions = new Map(dirtyStudyFields)
    const result = await store.dispatch('updateStudy', study)
    if (!result) throw new Error('Study update failed')

    const updatedQuestionFields = getStudyStructureFieldsToSync(
      result.rebasedStudy,
      ['preTest', 'postTest'],
      dirtyStudyFields,
      savedFieldVersions,
    )
    if (Object.hasOwn(updatedQuestionFields, 'preTest')) {
      await store.dispatch(
        'UserStudy/setPreTest',
        updatedQuestionFields.preTest,
      )
    }
    if (Object.hasOwn(updatedQuestionFields, 'postTest')) {
      await store.dispatch(
        'UserStudy/setPostTest',
        updatedQuestionFields.postTest,
      )
    }

    for (const [field, version] of savedFieldVersions) {
      if (dirtyStudyFields.get(field) === version) {
        dirtyStudyFields.delete(field)
      }
    }
    change.value = dirtyStudyFields.size > 0
    showSuccess('pages.editTest.updatedTest')
  } catch (e) {
    console.error(e)
    showError('errors.globalError')
  }
}

// Subscribe to test (gets the Real-time updates, no conflicts)
const subscribeToTest = () => {
  const testId = route.params.id
  if (testId) {
    unsubscribe = studyController.subscribeToStudy(testId, (incomingStudy) => {
      const currentStudy = test.value
      const preservedFields = [...dirtyStudyFields.keys()]
      const updatedStudy = mergeStudySnapshotPreservingFields(
        currentStudy,
        incomingStudy,
        preservedFields,
      )
      store.commit('SET_TEST', updatedStudy)
      lastCalibrationConfig = serializeCalibrationConfig(
        updatedStudy.calibrationConfig,
      )
      if (!dirtyStudyFields.has('welcomeMessage')) getWelcome()
      if (!dirtyStudyFields.has('finalMessage')) getFinalMessage()
      if (!dirtyStudyFields.has('consent')) getConsent()
      if (!dirtyStudyFields.has('videoCall')) getVideoCallConfig()
      if (!dirtyStudyFields.has('preTest')) getPreTest()
      if (!dirtyStudyFields.has('postTest')) getPostTest()
      if (!dirtyStudyFields.has('userTasks')) getTasks()
      if (!dirtyStudyFields.has('allowMobileTaskInstructions')) {
        getAllowMobileTaskInstructions()
      }
    })
  }
}
// Lifecycle
onMounted(() => {
  if (props.isTemplate && props.templateTest) {
    store.commit('SET_TEST', structuredClone(props.templateTest))
    getWelcome()
    getFinalMessage()
    getConsent()
    getVideoCallConfig()
    getAllowMobileTaskInstructions()
    getPreTest()
    getPostTest()
    getTasks()
    return
  }
  unsubscribeStore = store.subscribe(({ type }, state) => {
    if (type !== 'SET_CALIBRATION_CONFIG') return

    const calibrationConfig = serializeCalibrationConfig(
      state.Tests.Test?.calibrationConfig,
    )
    if (calibrationConfig !== lastCalibrationConfig) {
      markFieldDirty('calibrationConfig')
    }
    lastCalibrationConfig = calibrationConfig
  })
  getAllowMobileTaskInstructions()
  subscribeToTest()
})

onUnmounted(() => {
  if (!props.isTemplate && unsubscribe) {
    unsubscribe()
  }
  if (unsubscribeStore) {
    unsubscribeStore()
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
</style>
