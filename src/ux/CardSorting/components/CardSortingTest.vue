<template>
  <div>
    <SubmitDialog
      :model-value="dialog"
      :title="$t('HeuristicsTestView.messages.submitTest')"
      :message="$t('HeuristicsTestView.messages.submitOnce')"
      :cancel-label="$t('buttons.cancel')"
      :submit-label="$t('buttons.submit')"
      @cancel="dialog = false"
      @submit="handleSubmit"
    />

    <v-container fluid class="pa-0">
      <v-row class="main-test-interface pa-0 ma-0">
        <v-col class="right-view pa-6">
          <v-row v-if="globalIndex >= 1" class="stepper-row sticky-stepper">
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue"
                class="main-stepper rounded-xl elevation-3"
              >
                <v-stepper-header>
                  <v-stepper-item
                    value="1"
                    :title="$t('UserTestView.stepper.consent')"
                    :complete="stepperValue >= 1"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />

                  <template v-if="hasPreTest">
                    <v-stepper-item
                      value="2"
                      :title="$t('UserTestView.stepper.preTest')"
                      :complete="stepperValue >= 2"
                      color="white"
                      complete-icon="mdi-check"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    :value="hasPreTest ? 3 : 2"
                    :title="$t('UserTestView.stepper.tasks')"
                    :complete="stepperValue >= 3"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />

                  <template v-if="hasPostTest">
                    <v-stepper-item
                      :value="hasPreTest ? 4 : 3"
                      :title="$t('UserTestView.stepper.postTest')"
                      :complete="stepperValue >= 4"
                      color="white"
                      complete-icon="mdi-check"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    :value="
                      hasPostTest
                        ? hasPreTest
                          ? 5
                          : 4
                        : hasPreTest
                          ? 4
                          : 3
                    "
                    :title="$t('UserTestView.stepper.completion')"
                    :complete="stepperValue >= 4"
                    color="white"
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <WelcomeStep
            v-if="globalIndex === 0"
            :stepper-value="stepperValue"
            :has-eye-tracking="false"
            :has-pre-test="hasPreTest"
            :has-post-test="hasPostTest"
            :welcome-message="test?.testStructure?.welcomeMessage"
            @start="globalIndex = 1"
          />

          <ConsentStep
            v-if="globalIndex === 1"
            :test-title="test.testTitle"
            :consent-text="test.testStructure.consent"
            :full-name-model="fullName"
            :consent-completed-model="localAnswer.consentCompleted"
            @update:full-name-model="(val) => (fullName = val)"
            @update:consent-completed-model="
              (val) => (localAnswer.consentCompleted = val)
            "
            @continue="completeStep('consent')"
            @decline-consent="handleConsentDecline"
          />

          <PreTestStep
            v-if="globalIndex === 2 && hasPreTest"
            :test-title="test.testTitle"
            :pre-test="test.testStructure.preTest"
            :pre-test-answer="localAnswer.preTestAnswer"
            :pre-test-completed="localAnswer.preTestCompleted"
            @done="completeStep('preTest')"
          />

          <div v-if="globalIndex === 4">
            <CardSortingTask
              v-model="localAnswer.sorting"
              :test="test"
              @update:pending="pendingCards = $event"
            />
            <v-container class="d-flex justify-end pt-0">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                :disabled="pendingCards > 0"
                @click="completeStep('sorting')"
              >
                {{
                  pendingCards > 0
                    ? $t('CardSorting.allocateAll', { count: pendingCards })
                    : $t('buttons.continue')
                }}
              </v-btn>
            </v-container>
          </div>

          <PostTestStep
            v-if="
              hasPostTest &&
              globalIndex === 5 &&
              (!localAnswer.postTestCompleted || localAnswer.submitted)
            "
            :test-title="test.testTitle"
            :post-test="test.testStructure.postTest"
            :post-test-answer="localAnswer.postTestAnswer"
            :post-test-completed="localAnswer.postTestCompleted"
            @done="completeStep('postTest')"
          />

          <FinishStep
            v-if="
              globalIndex === 6 &&
              localAnswer.postTestCompleted &&
              !localAnswer.submitted
            "
            :final-message="$t('finishTest.finalMessage')"
            :congratulations="test.testStructure.finalMessage"
            :submit-message="$t('finishTest.submitMessage')"
            :submit-btn="$t('buttons.submit')"
            @submit="dialog = true"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue'
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue'
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue'
import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue'
import CardSortingTask from './CardSortingTask.vue'
import CardSortingEvaluatorAnswer from '../models/CardSortingEvaluatorAnswer'
import { showError, showSuccess, showInfo } from '@/shared/utils/toast'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const store = useStore()
const router = useRouter()

const user = computed(() => store.getters.user)
const currentCardSortingAnswer = computed(
  () => store.getters.currentCardSortingAnswer,
)

const fullName = ref('')
const globalIndex = ref(0)
const pendingCards = ref(0)
const submitting = ref(false)
const dialog = ref(false)

const localAnswer = reactive(
  new CardSortingEvaluatorAnswer({
    ...currentCardSortingAnswer.value,
    userDocId: user.value?.id ?? null,
    preTestAnswer: buildPreTestAnswer(),
    postTestAnswer: buildPostTestAnswer(),
  }),
)

fullName.value = localAnswer.fullName || ''

const hasPreTest = computed(() => {
  return (
    props.test?.testStructure?.preTest != null &&
    props.test?.testStructure?.preTest.length > 0
  )
})

const hasPostTest = computed(() => {
  return (
    props.test?.testStructure?.postTest != null &&
    props.test?.testStructure?.postTest.length > 0
  )
})

// Mirrors UserTestView stepper mapping (no eye tracking / no PreTasks)
const stepperValue = computed(() => {
  if (globalIndex.value === 0) return -1
  if (globalIndex.value === 1) return 0
  if (globalIndex.value === 2) return 1
  if (globalIndex.value === 4) return 2
  if (globalIndex.value === 5 && !localAnswer.postTestCompleted) return 3
  if (globalIndex.value === 6 && localAnswer.postTestCompleted) return 4
  return 0
})

const progress = computed(() => {
  const steps = [1, hasPreTest.value ? 2 : null, 4, hasPostTest.value ? 5 : null, 6].filter(
    (s) => s != null,
  )
  const currentPos = steps.indexOf(globalIndex.value)
  if (currentPos < 0) return 0
  return Math.round((currentPos / (steps.length - 1)) * 100)
})

function buildPreTestAnswer() {
  const existing = currentCardSortingAnswer.value?.preTestAnswer
  if (Array.isArray(existing) && existing.length) return existing
  const preTest = props.test?.testStructure?.preTest || []
  return preTest.map((_, index) => ({ preTestAnswerId: index, answer: '' }))
}

function buildPostTestAnswer() {
  const existing = currentCardSortingAnswer.value?.postTestAnswer
  if (Array.isArray(existing) && existing.length) return existing
  const postTest = props.test?.testStructure?.postTest || []
  return postTest.map((item, index) => ({
    ...item,
    postTestAnswerId: index,
    answer: '',
  }))
}

const savePartial = async () => {
  if (!user.value) return
  localAnswer.userDocId = user.value.id
  localAnswer.fullName = fullName.value
  localAnswer.invited = true
  localAnswer.lastUpdate = Date.now()
  localAnswer.progress = Math.round(progress.value)

  await store.dispatch('saveTestAnswer', {
    data: new CardSortingEvaluatorAnswer({ ...localAnswer }),
    answersDocId: props.test.answersDocId,
    testType: props.test.testType,
  })
}

const completeStep = async (type) => {
  try {
    if (type === 'consent') {
      localAnswer.consentCompleted = true
      localAnswer.consent = props.test.testStructure.consent || ''
      if (hasPreTest.value) {
        globalIndex.value = 2
      } else {
        localAnswer.preTestCompleted = true
        globalIndex.value = 4
      }
      await savePartial()
      return
    }

    if (type === 'preTest') {
      localAnswer.preTestCompleted = true
      globalIndex.value = 4
      await savePartial()
      return
    }

    if (type === 'sorting') {
      if (hasPostTest.value) {
        globalIndex.value = 5
      } else {
        localAnswer.postTestCompleted = true
        globalIndex.value = 6
      }
      await savePartial()
      return
    }

    if (type === 'postTest') {
      localAnswer.postTestCompleted = true
      globalIndex.value = 6
      await savePartial()
    }
  } catch {
    showError('CardSorting.saveError')
  }
}

const handleConsentDecline = () => {
  showInfo('UserTestView.alerts.consentDecline')
  setTimeout(() => {
    router.push('/admin')
  }, 2000)
}

const handleSubmit = () => {
  dialog.value = false
  submit()
}

const submit = async () => {
  try {
    submitting.value = true
    localAnswer.submitted = true
    localAnswer.progress = 100
    await savePartial()
    showSuccess('CardSorting.answerSubmitted')
    router.push('/admin')
  } catch {
    localAnswer.submitted = false
    showError('CardSorting.saveError')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (localAnswer.submitted) {
    globalIndex.value = 6
    localAnswer.postTestCompleted = true
  }
})
</script>

<style scoped>
.sticky-stepper {
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
}

.main-stepper {
  background: #00213f !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
  transition:
    background 1s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-stepper-item__avatar) {
  font-size: 1rem !important;
  font-weight: 900 !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.v-stepper-item--complete .v-stepper-item__avatar .v-icon) {
  font-size: 1.25rem !important;
  width: 2.2rem !important;
  height: 2.2rem !important;
}

:deep(.v-stepper-item__title) {
  font-size: 1.1rem !important;
  font-weight: 300 !important;
  line-height: 0.8 !important;
}

.v-stepper-item {
  padding: 1rem;
}
</style>
