<template>
  <v-container
    fluid
    class="create-study-view"
    :class="{ 'create-study-view--conversation': hasConversationStarted }"
  >
    <v-container class="py-6 create-study-view__content">
      <StepperHeader :current-step="4" :steps="steps" />

      <SectionHeader
        v-if="!hasConversationStarted"
        :title="$t('studyCreation.ai.title')"
        :subtitle="$t('studyCreation.ai.firstStepSubtitle')"
      />

      <transition name="ai-layout" mode="out-in">
        <v-row
          v-if="!hasConversationStarted"
          key="ai-initial"
          justify="center"
          class="ai-initial-row"
        >
          <v-col cols="12" md="10" lg="8">
            <StudyAIChat
              :messages="chatMessages"
              :loading="isGenerating"
              :loading-message="currentLoadingMessage"
              :composer-disabled="isConversationFinished"
              :show-conversation="false"
              :conversation-starters="conversationStarters"
              @send="handleSend"
            />
          </v-col>
        </v-row>

        <v-row
          v-else-if="!showFinalPreview"
          key="ai-chat-only"
          justify="center"
          class="ai-initial-row"
        >
          <v-col cols="12" md="10" lg="8">
            <StudyAIChat
              :messages="chatMessages"
              :loading="isGenerating"
              :loading-message="currentLoadingMessage"
              :composer-disabled="isConversationFinished"
              :show-conversation="true"
              :conversation-starters="conversationStarters"
              @send="handleSend"
            />
          </v-col>
        </v-row>

        <v-row v-else key="ai-final-preview">
          <v-col cols="12" md="6">
            <StudyAIChat
              :messages="chatMessages"
              :loading="isGenerating"
              :loading-message="currentLoadingMessage"
              :composer-disabled="isConversationFinished"
              :show-conversation="true"
              :conversation-starters="conversationStarters"
              @send="handleSend"
            />
          </v-col>
          <v-col cols="12" md="6">
            <StudyAIPreview :draft="draft" @update:draft="onDraftUpdate" />
          </v-col>
        </v-row>
      </transition>

      <div
        v-if="showFinalPreview"
        class="d-flex flex-wrap justify-space-between align-center ga-3 mt-6"
      >
        <BackButton :label="$t('studyCreation.ai.back')" @back="goBack" />

        <div class="d-flex ga-3">
          <v-btn
            color="primary"
            :loading="isCreating"
            :disabled="!canConfirm"
            @click="confirmCreate"
          >
            {{ $t('studyCreation.ai.confirm') }}
          </v-btn>
        </div>
      </div>

      <div
        v-else-if="isConversationFinished"
        class="d-flex justify-space-between align-center mt-6"
      >
        <BackButton :label="$t('studyCreation.ai.back')" @back="goBack" />
        <v-btn color="primary" @click="goToPreview">
          {{ $t('studyCreation.ai.goToPreview') }}
        </v-btn>
      </div>

      <div v-else class="d-flex justify-start mt-6">
        <BackButton :label="$t('studyCreation.ai.back')" @back="goBack" />
      </div>
    </v-container>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import BackButton from '@/features/ux_creation/components/BackButton.vue'
import SectionHeader from '@/features/ux_creation/SectionHeader.vue'
import StepperHeader from '@/features/ux_creation/StepperHeader.vue'
import StudyAIChat from '@/features/ux_creation/components/StudyAIChat.vue'
import StudyAIPreview from '@/features/ux_creation/components/StudyAIPreview.vue'
import { generateStudyDraft } from '@/ai/study-generation/StudyGenerationService'
import { mapDraftToStudyRawData } from '@/ai/study-generation/mapDraftToStudyRawData'
import { validateStudyDraft } from '@/ai/study-generation/validators'
import {
  getMethodManagerView,
  instantiateStudyByType,
} from '@/shared/constants/methodDefinitions'
import { showError } from '@/shared/utils/toast'

const router = useRouter()
const store = useStore()
const { t, locale } = useI18n()

const chatMessages = ref([])
/** Messages sent to the Cloud Function (excludes local welcome). */
const apiMessages = ref([])
const draft = ref(null)
const isGenerating = ref(false)
const isCreating = ref(false)
const hasConversationStarted = ref(false)
const isConversationFinished = ref(false)
const hasEnteredPreview = ref(false)
const loadingMessageIndex = ref(0)
const loadingTicker = ref(null)

const steps = computed(() => [
  { value: 1, title: t('studyCreation.steps.category'), complete: true },
  { value: 2, title: t('studyCreation.steps.methods'), complete: false },
  { value: 3, title: t('studyCreation.steps.studyType'), complete: false },
  { value: 4, title: t('studyCreation.ai.stepLabel'), complete: false },
])

const preferredMethod = computed(() => {
  const method = store.state.Tests.studyMethod
  if (!method) return null
  if (method === 'HEURISTICS' || method === 'HEURISTIC') return 'HEURISTIC'
  if (method === 'CARD_SORTING') return 'CARD_SORTING'
  if (method === 'FOCUS_GROUP') return 'FOCUS_GROUP'
  if (method === 'USER_MODERATED' || method === 'USER_UNMODERATED') {
    return 'USER'
  }
  return null
})

const canConfirm = computed(() => {
  if (!draft.value || draft.value.clarificationNeeded || isCreating.value) {
    return false
  }
  return validateStudyDraft(draft.value).valid
})

const showFinalPreview = computed(() => {
  return (
    hasEnteredPreview.value && isConversationFinished.value && !!draft.value
  )
})

const loadingMessages = computed(() => [
  t('studyCreation.ai.loadingStages.connecting'),
  t('studyCreation.ai.loadingStages.thinking'),
  t('studyCreation.ai.loadingStages.takingLonger'),
  t('studyCreation.ai.loadingStages.stillWorking'),
])

const currentLoadingMessage = computed(() => {
  const messages = loadingMessages.value
  const raw = !messages.length
    ? t('studyCreation.ai.thinking')
    : messages[loadingMessageIndex.value % messages.length]

  return String(raw).replace(/[\s.\u2026]+$/g, '')
})

watch(isGenerating, (loading) => {
  if (loading) {
    loadingMessageIndex.value = 0
    if (loadingTicker.value) clearInterval(loadingTicker.value)
    loadingTicker.value = setInterval(() => {
      loadingMessageIndex.value += 1
    }, 10000)
    return
  }

  if (loadingTicker.value) {
    clearInterval(loadingTicker.value)
    loadingTicker.value = null
  }
})

onBeforeUnmount(() => {
  if (loadingTicker.value) {
    clearInterval(loadingTicker.value)
    loadingTicker.value = null
  }
})

onMounted(() => {
  const existing = store.state.Tests.aiStudyDraft
  if (existing) {
    draft.value = existing
    hasConversationStarted.value = true
    if (!existing.clarificationNeeded) {
      isConversationFinished.value = true
      hasEnteredPreview.value = true
    }
  }
})

const conversationStarters = computed(() => [
  {
    title: t('studyCreation.ai.starters.cardSorting.title'),
    prompt: t('studyCreation.ai.starters.cardSorting.prompt'),
    icon: 'mdi-view-grid-outline',
  },
  {
    title: t('studyCreation.ai.starters.userTest.title'),
    prompt: t('studyCreation.ai.starters.userTest.prompt'),
    icon: 'mdi-account-group-outline',
  },
  {
    title: t('studyCreation.ai.starters.heuristic.title'),
    prompt: t('studyCreation.ai.starters.heuristic.prompt'),
    icon: 'mdi-clipboard-check-outline',
  },
  {
    title: t('studyCreation.ai.starters.focusGroup.title'),
    prompt: t('studyCreation.ai.starters.focusGroup.prompt'),
    icon: 'mdi-forum-outline',
  },
])

const onDraftUpdate = (next) => {
  draft.value = next
  store.commit('SET_AI_STUDY_DRAFT', next)
}

const handleSend = async (text) => {
  if (isConversationFinished.value) return

  if (!hasConversationStarted.value) {
    hasConversationStarted.value = true
  }

  chatMessages.value.push({ role: 'user', text })
  apiMessages.value.push({ role: 'user', text })
  isGenerating.value = true

  try {
    const result = await generateStudyDraft({
      messages: [...apiMessages.value],
      locale: locale.value || 'en-US',
      preferredMethod: preferredMethod.value,
    })

    const nextDraft = result.draft
    draft.value = nextDraft
    store.commit('SET_AI_STUDY_DRAFT', nextDraft)

    let modelText
    if (nextDraft.clarificationNeeded) {
      modelText =
        (nextDraft.clarificationQuestions || []).join('\n\n') ||
        t('studyCreation.ai.needClarification')
    } else {
      isConversationFinished.value = true
      modelText = t('studyCreation.ai.completedToPreview')
    }

    chatMessages.value.push({ role: 'model', text: modelText })
    apiMessages.value.push({ role: 'model', text: modelText })
  } catch (err) {
    const detail = extractCallableErrorMessage(err)
    const chatText = detail
      ? t('studyCreation.ai.errors.generationFailedWithDetail', { detail })
      : t('studyCreation.ai.errors.generationFailed')

    showError(chatText)
    chatMessages.value.push({
      role: 'model',
      text: chatText,
    })
    // Roll back last user turn from API history so retries stay consistent
    apiMessages.value.pop()
  } finally {
    isGenerating.value = false
  }
}

/**
 * Extracts a human-readable message from Firebase callable / SDK errors.
 * @param {unknown} err
 * @returns {string}
 */
function extractCallableErrorMessage(err) {
  if (!err) return ''
  const raw = err.message || err.details || err.customData?.message || ''
  if (!raw || typeof raw !== 'string') return ''

  return raw
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\([^)]*\)\.?\s*$/, '')
    .replace(/^functions\/[\w-]+\s*/i, '')
    .trim()
}

const goToPreview = () => {
  hasEnteredPreview.value = true
}

const confirmCreate = async () => {
  if (!canConfirm.value) return

  const validation = validateStudyDraft(draft.value)
  if (!validation.valid) {
    showError('studyCreation.ai.errors.invalidDraft')
    return
  }

  isCreating.value = true
  try {
    const user = store.getters.user
    const rawData = mapDraftToStudyRawData(draft.value, user)
    const study = instantiateStudyByType(rawData.testType, rawData)
    const testId = await store.dispatch('createStudy', study)

    store.commit('RESET_STUDY_DETAILS')
    store.commit('CLEAR_AI_STUDY_DRAFT')

    const methodView = getMethodManagerView(rawData.testType, rawData.subType)
    if (testId && methodView) {
      router.push({ name: methodView, params: { id: testId } })
    } else {
      showError('studyCreation.ai.errors.createFailed')
    }
  } catch (err) {
    showError('studyCreation.ai.errors.createFailed')
  } finally {
    isCreating.value = false
  }
}

const goBack = () => {
  store.commit('SET_STUDY_TYPE', null)
  store.commit('CLEAR_AI_STUDY_DRAFT')
  router.push({ name: 'study-create-step1' })
}
</script>

<style scoped>
.create-study-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.create-study-view__content {
  position: relative;
}

.create-study-view--conversation {
  height: 100vh;
  overflow: hidden;
}

.create-study-view--conversation .create-study-view__content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.create-study-view--conversation .ai-initial-row,
.create-study-view--conversation :deep(.v-row) {
  flex: 1;
  min-height: 0;
}

.create-study-view--conversation :deep(.v-col) {
  min-height: 0;
}

.ai-initial-row {
  margin-top: 8px;
}

.ai-layout-enter-active,
.ai-layout-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.ai-layout-enter-from,
.ai-layout-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style>
