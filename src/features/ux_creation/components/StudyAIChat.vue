<template>
  <div class="study-ai-chat">
    <transition name="chat-transform" mode="out-in">
      <div
        v-if="showConversation"
        key="chat-messages"
        ref="messagesEl"
        class="study-ai-chat__messages"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="study-ai-chat__bubble"
          :class="`study-ai-chat__bubble--${message.role}`"
        >
          <div class="study-ai-chat__role">
            {{
              message.role === 'user'
                ? $t('studyCreation.ai.you')
                : $t('studyCreation.ai.assistant')
            }}
          </div>
          <div class="study-ai-chat__text">{{ message.text }}</div>
        </div>

        <div
          v-if="loading"
          class="study-ai-chat__bubble study-ai-chat__bubble--model"
        >
          <div class="study-ai-chat__role">
            {{ $t('studyCreation.ai.assistant') }}
          </div>
          <div class="study-ai-chat__text d-flex align-center ga-2">
            <v-progress-circular indeterminate size="18" width="2" />
            <span>
              {{ loadingMessage || $t('studyCreation.ai.thinking') }}
              <span class="study-ai-chat__loading-dots" aria-hidden="true">{{
                loadingDots
              }}</span>
            </span>
          </div>
        </div>
      </div>

      <div v-else key="chat-starters" class="study-ai-chat__starters-wrap">
        <p class="study-ai-chat__starters-title mb-3">
          {{ $t('studyCreation.ai.conversationStartersTitle') }}
        </p>
        <div class="study-ai-chat__starters-grid">
          <button
            v-for="(starter, index) in conversationStarters"
            :key="`starter-${index}`"
            type="button"
            class="study-ai-chat__starter"
            :disabled="loading"
            @click="onStarterClick(starter.prompt)"
          >
            <div class="study-ai-chat__starter-icon">
              <v-icon :icon="starter.icon || 'mdi-chat-outline'" size="18" />
            </div>
            <div class="study-ai-chat__starter-content">
              <div class="study-ai-chat__starter-title">
                {{ starter.title }}
              </div>
              <div class="study-ai-chat__starter-text">
                {{ starter.prompt }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </transition>

    <form class="study-ai-chat__composer" @submit.prevent="onSubmit">
      <v-textarea
        v-model="draft"
        :disabled="loading || composerDisabled"
        :placeholder="$t('studyCreation.ai.placeholder')"
        rows="2"
        auto-grow
        max-rows="6"
        hide-details
        variant="outlined"
        density="comfortable"
        class="study-ai-chat__input"
        @keydown.enter.exact.prevent="onSubmit"
      />
      <v-btn
        type="submit"
        color="secondary"
        prepend-icon="mdi-send"
        :disabled="loading || composerDisabled || !draft.trim()"
        :loading="loading"
        class="study-ai-chat__send"
      >
        {{ $t('studyCreation.ai.send') }}
      </v-btn>
    </form>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMessage: {
    type: String,
    default: '',
  },
  composerDisabled: {
    type: Boolean,
    default: false,
  },
  showConversation: {
    type: Boolean,
    default: true,
  },
  conversationStarters: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['send'])

const draft = ref('')
const messagesEl = ref(null)
const loadingDots = ref('.')
const loadingDotsInterval = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

watch(
  () => [props.messages.length, props.loading],
  () => scrollToBottom(),
  { immediate: true },
)

watch(
  () => props.loading,
  (loading) => {
    if (loading) {
      loadingDots.value = '.'
      if (loadingDotsInterval.value) clearInterval(loadingDotsInterval.value)
      loadingDotsInterval.value = setInterval(() => {
        loadingDots.value =
          loadingDots.value.length >= 3 ? '.' : `${loadingDots.value}.`
      }, 450)
      return
    }

    if (loadingDotsInterval.value) {
      clearInterval(loadingDotsInterval.value)
      loadingDotsInterval.value = null
    }
    loadingDots.value = '.'
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (loadingDotsInterval.value) {
    clearInterval(loadingDotsInterval.value)
    loadingDotsInterval.value = null
  }
})

const onSubmit = () => {
  const text = draft.value.trim()
  if (!text || props.loading || props.composerDisabled) return
  emit('send', text)
  draft.value = ''
}

const onStarterClick = (text) => {
  if (!text || props.loading || props.composerDisabled) return
  emit('send', text)
}
</script>

<style scoped>
.study-ai-chat {
  --rux-blue: #002d50;
  --rux-coral: #ff5c6d;

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 470px;
  background: transparent;
}

.study-ai-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: transparent;
}

.study-ai-chat__starters-wrap {
  flex: 1;
  padding: 10px 0 12px;
  background: transparent;
  overflow-y: auto;
}

.study-ai-chat__starters-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #374151;
}

.study-ai-chat__starters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.study-ai-chat__starter {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  border: 1px solid color-mix(in srgb, var(--rux-blue) 24%, transparent);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(1px);
  border-radius: 10px;
  padding: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.study-ai-chat__starter:not(:disabled):hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--rux-blue) 52%, transparent);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--rux-blue) 16%, transparent);
}

.study-ai-chat__starter:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.study-ai-chat__starter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--rux-blue) 14%, white);
  color: var(--rux-blue);
  flex-shrink: 0;
}

.study-ai-chat__starter-content {
  min-width: 0;
}

.study-ai-chat__starter-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 3px;
}

.study-ai-chat__starter-text {
  font-size: 14px;
  line-height: 1.45;
  color: #4b5563;
}

.study-ai-chat__bubble {
  max-width: 92%;
  padding: 11px 13px;
  border-radius: 14px;
  border: 1px solid transparent;
}

.study-ai-chat__bubble--user {
  align-self: flex-end;
  background: var(--rux-blue);
  border-color: var(--rux-blue);
}

.study-ai-chat__bubble--model {
  align-self: flex-start;
  background: var(--rux-coral);
  border-color: var(--rux-coral);
}

.study-ai-chat__bubble--user .study-ai-chat__role,
.study-ai-chat__bubble--model .study-ai-chat__role {
  color: rgba(255, 255, 255, 0.86);
}

.study-ai-chat__bubble--user .study-ai-chat__text,
.study-ai-chat__bubble--model .study-ai-chat__text {
  color: #ffffff;
}

.study-ai-chat__role {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  margin-bottom: 4px;
}

.study-ai-chat__text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 16px;
  line-height: 1.6;
  color: #111827;
}

.study-ai-chat__composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
  padding: 12px 0 0;
  border-top: 1px solid color-mix(in srgb, var(--rux-blue) 20%, transparent);
}

.study-ai-chat__input :deep(.v-field) {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 18px rgba(0, 33, 63, 0.06);
}

.study-ai-chat__input :deep(.v-field__outline) {
  color: color-mix(in srgb, var(--rux-blue) 25%, transparent);
}

.study-ai-chat__input :deep(.v-field--focused .v-field__outline) {
  color: var(--rux-blue);
}

.study-ai-chat__input :deep(textarea) {
  font-size: 16px;
  line-height: 1.55;
}

.study-ai-chat__send {
  height: 48px;
  border-radius: 12px;
  min-width: 126px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 10px 20px color-mix(in srgb, var(--rux-coral) 35%, transparent);
}

.study-ai-chat__send:disabled {
  box-shadow: none;
}

.study-ai-chat__loading-dots {
  display: inline-block;
  min-width: 1.6em;
}

.chat-transform-enter-active,
.chat-transform-leave-active {
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
}

.chat-transform-enter-from,
.chat-transform-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.99);
}

@media (min-width: 960px) {
  .study-ai-chat__starters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
