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
        <!-- Desktop Tabs -->
        <v-tabs
          bg-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0 desktop-tabs uppercase-tabs"
        >
          <v-tab @click="index = 0" class="uppercase-text">
            {{ $t('UserTestTable.titles.testConfiguration') }}
          </v-tab>
          <v-tab @click="index = 1" class="uppercase-text">
            {{ $t('ModeratedTest.consentForm') }}
          </v-tab>
          <v-tab @click="index = 2" class="uppercase-text">
            {{ $t('ModeratedTest.preTest') }}
          </v-tab>
          <v-tab @click="index = 3" class="uppercase-text">
            {{ $t('ModeratedTest.tasks') }}
          </v-tab>
          <v-tab @click="index = 4" class="uppercase-text">
            {{ $t('ModeratedTest.postTest') }}
          </v-tab>
          <v-tab v-if="hasEyeTracking" @click="index = 5" class="uppercase-text">
            EYE TRACKING CONFIGURATIONS
          </v-tab>
        </v-tabs>

        <!-- Mobile Dropdown -->
        <div class="mobile-tabs-container">
          <div 
            class="mobile-tabs-header"
            @click="showMobileDropdown = !showMobileDropdown"
          >
            <div class="mobile-tabs-selected uppercase-text">
              {{ getCurrentTabName() }}
            </div>
            <v-icon :class="['mobile-tabs-chevron', { 'rotated': showMobileDropdown }]">
              mdi-chevron-down
            </v-icon>
          </div>

          <!-- Dropdown Menu -->
          <div v-if="showMobileDropdown" class="mobile-tabs-dropdown">
            <div 
              v-for="(tab, i) in tabOptions" 
              :key="i"
              class="mobile-tabs-item uppercase-text"
              :class="{ 'active': index === i }"
              @click="selectTab(i)"
            >
              {{ tab }}
              <v-icon v-if="index === i" class="mobile-tabs-check">
                mdi-check
              </v-icon>
            </div>
          </div>
        </div>

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
const route = useRoute()

// Variables
const change = ref(false)
const welcomeMessage = ref('')
const finalMessage = ref('')
const consent = ref('')
const index = ref(0)
const showMobileDropdown = ref(false)
let unsubscribe = null

// tab options for mobile dropdown
const tabOptions = computed(() => {
  const options = [
    t('UserTestTable.titles.testConfiguration').toUpperCase(),
    t('ModeratedTest.consentForm').toUpperCase(),
    t('ModeratedTest.preTest').toUpperCase(),
    t('ModeratedTest.tasks').toUpperCase(),
    t('ModeratedTest.postTest').toUpperCase(),
  ]
  if (hasEyeTracking.value) {
    options.push('EYE TRACKING CONFIGURATIONS')
  }
  return options
})
const getCurrentTabName = () => {
  if (index.value >= 0 && index.value < tabOptions.value.length) {
    return tabOptions.value[index.value]
  }
  return tabOptions.value[0]
}
const selectTab = (tabIndex) => {
  index.value = tabIndex
  showMobileDropdown.value = false 
}

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

.uppercase-tabs :deep(.v-tab) {
  text-transform: uppercase !important;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.uppercase-text {
  text-transform: uppercase !important;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.desktop-tabs {
  display: block;
}

.mobile-tabs-container {
  display: none;
  margin-top: 16px;
  position: relative;
  z-index: 10;
}

.mobile-tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #9e9e9e;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.2s;
}

.mobile-tabs-header:hover {
  border-color: #FCA326;
}

.mobile-tabs-selected {
  font-size: 16px;
  color: #333;
}

.mobile-tabs-chevron {
  color: #666;
  transition: transform 0.3s ease;
}

.mobile-tabs-chevron.rotated {
  transform: rotate(180deg);
}

.mobile-tabs-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #9e9e9e;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.mobile-tabs-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-tabs-item:last-child {
  border-bottom: none;
}

.mobile-tabs-item:hover {
  background-color: #f5f5f5;
}

.mobile-tabs-item.active {
  color: #FCA326;
  font-weight: 500;
  background-color: #fff5e6;
}

.mobile-tabs-check {
  color: #FCA326;
  font-size: 20px;
}

@media (max-width: 960px) {
  .desktop-tabs {
    display: none !important; 
  }
  
  .mobile-tabs-container {
    display: block; 
  }
}

@media (min-width: 960px) {
  .desktop-tabs {
    display: block !important; 
  }
  
  .mobile-tabs-container {
    display: none !important; 
  }
}
</style>
