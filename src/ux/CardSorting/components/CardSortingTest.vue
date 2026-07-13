<template>
  <div class="cardsorting-flow">
    <!-- Progress header -->
    <v-container class="pt-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption text-medium-emphasis">
          {{ $t('CardSorting.step') }} {{ currentPhaseIndex + 1 }} /
          {{ phases.length }}
        </span>
        <span class="text-caption text-medium-emphasis">
          {{ Math.round(progress) }}%
        </span>
      </div>
      <v-progress-linear
        :model-value="progress"
        color="primary"
        height="8"
        rounded
      />
    </v-container>

    <!-- CONSENT -->
    <div v-if="currentPhase === 'consent'">
      <ShowInfo :title="test.testTitle + ' - ' + $t('ModeratedTest.consentForm')">
        <template #content>
          <v-container class="pa-6">
            <div class="rich-text mb-6" v-html="test.testStructure.consent" />
            <v-row justify="center">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="localAnswer.fullName"
                  :label="$t('common.name')"
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || $t('CardSorting.nameRequired')]"
                />
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="localAnswer.consentCompleted"
                  :label="$t('CardSorting.acceptConsent')"
                  :disabled="!localAnswer.fullName"
                />
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  rounded="pill"
                  :disabled="!localAnswer.consentCompleted || !localAnswer.fullName"
                  @click="next"
                >
                  {{ $t('buttons.continue') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </template>
      </ShowInfo>
    </div>

    <!-- PRE-TEST -->
    <div v-else-if="currentPhase === 'preTest'">
      <PreTestStep
        :test-title="test.testTitle"
        :pre-test="test.testStructure.preTest"
        :pre-test-answer="localAnswer.preTestAnswer"
        :pre-test-completed="localAnswer.preTestCompleted"
        @update:pre-test-answer="localAnswer.preTestAnswer = $event"
        @done="completePreTest"
      />
    </div>

    <!-- SORTING -->
    <div v-else-if="currentPhase === 'sorting'">
      <CardSortingTask
        v-model="localAnswer.sorting"
        :test="test"
        @update:pending="pendingCards = $event"
      />
      <v-container class="d-flex justify-space-between">
        <v-btn
          v-if="currentPhaseIndex > 0"
          variant="outlined"
          rounded="pill"
          @click="prev"
        >
          {{ $t('buttons.back') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          rounded="pill"
          :disabled="pendingCards > 0"
          @click="next"
        >
          {{ pendingCards > 0
            ? $t('CardSorting.allocateAll', { count: pendingCards })
            : $t('buttons.continue') }}
        </v-btn>
      </v-container>
    </div>

    <!-- POST-TEST -->
    <div v-else-if="currentPhase === 'postTest'">
      <PostTestStep
        :test-title="test.testTitle"
        :post-test="test.testStructure.postTest"
        :post-test-answer="localAnswer.postTestAnswer"
        :post-test-completed="localAnswer.postTestCompleted"
        @update:post-test-answer="localAnswer.postTestAnswer = $event"
        @done="completePostTest"
      />
    </div>

    <!-- FINISH -->
    <div v-else-if="currentPhase === 'finish'">
      <ShowInfo :title="test.testTitle">
        <template #content>
          <v-container class="pa-8 text-center">
            <v-icon color="success" size="72" class="mb-4">
              mdi-check-circle-outline
            </v-icon>
            <h2 class="text-h5 mb-4">{{ $t('CardSorting.thankYou') }}</h2>
            <div
              v-if="test.testStructure.finalMessage"
              class="rich-text mb-6"
              v-html="test.testStructure.finalMessage"
            />
            <v-btn
              color="primary"
              rounded="pill"
              size="large"
              :loading="submitting"
              :disabled="localAnswer.submitted"
              @click="submit"
            >
              {{ localAnswer.submitted
                ? $t('CardSorting.answerSubmitted')
                : $t('buttons.submit') }}
            </v-btn>
          </v-container>
        </template>
      </ShowInfo>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue'
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue'
import CardSortingTask from './CardSortingTask.vue'
import CardSortingEvaluatorAnswer from '../models/CardSortingEvaluatorAnswer'
import { showError, showSuccess } from '@/shared/utils/toast'

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

// Local participant answer (resumes previous progress when available)
const localAnswer = reactive(
  new CardSortingEvaluatorAnswer({
    ...currentCardSortingAnswer.value,
    userDocId: user.value?.id ?? null,
    preTestAnswer: buildPreTestAnswer(),
    postTestAnswer: buildPostTestAnswer(),
  }),
)

const pendingCards = ref(0)
const submitting = ref(false)
const currentPhaseIndex = ref(0)

// Build the ordered list of active phases, skipping empty ones
const phases = computed(() => {
  const structure = props.test?.testStructure || {}
  const list = []
  if (structure.consent) list.push('consent')
  if ((structure.preTest?.length ?? 0) > 0) list.push('preTest')
  list.push('sorting')
  if ((structure.postTest?.length ?? 0) > 0) list.push('postTest')
  list.push('finish')
  return list
})

const currentPhase = computed(() => phases.value[currentPhaseIndex.value])

const progress = computed(
  () => (currentPhaseIndex.value / (phases.value.length - 1)) * 100,
)

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
  localAnswer.invited = true
  localAnswer.lastUpdate = Date.now()
  localAnswer.progress = Math.round(progress.value)

  await store.dispatch('saveTestAnswer', {
    data: new CardSortingEvaluatorAnswer({ ...localAnswer }),
    answersDocId: props.test.answersDocId,
    testType: props.test.testType,
  })
}

const next = async () => {
  try {
    await savePartial()
  } catch {
    showError('CardSorting.saveError')
  }
  if (currentPhaseIndex.value < phases.value.length - 1) {
    currentPhaseIndex.value++
  }
}

const prev = () => {
  if (currentPhaseIndex.value > 0) currentPhaseIndex.value--
}

const completePreTest = () => {
  localAnswer.preTestCompleted = true
  next()
}

const completePostTest = () => {
  localAnswer.postTestCompleted = true
  next()
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
  // Resume at the sorting phase if consent/pre-test were already completed
  if (localAnswer.submitted) {
    currentPhaseIndex.value = phases.value.indexOf('finish')
  }
})
</script>

<style scoped>
.cardsorting-flow {
  padding-bottom: 40px;
}
</style>
