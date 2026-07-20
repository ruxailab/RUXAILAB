<template>
  <div class="study-ai-chat">
    <div ref="messagesEl" class="study-ai-chat__messages">
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

      <div v-if="loading" class="study-ai-chat__bubble study-ai-chat__bubble--model">
        <div class="study-ai-chat__role">{{ $t('studyCreation.ai.assistant') }}</div>
        <div class="study-ai-chat__text d-flex align-center ga-2">
          <v-progress-circular indeterminate size="18" width="2" />
          {{ $t('studyCreation.ai.thinking') }}
        </div>
      </div>
    </div>

    <form class="study-ai-chat__composer" @submit.prevent="onSubmit">
      <v-textarea
        v-model="draft"
        :disabled="loading"
        :placeholder="$t('studyCreation.ai.placeholder')"
        rows="2"
        auto-grow
        max-rows="6"
        hide-details
        variant="outlined"
        density="comfortable"
      />
      <v-btn
        type="submit"
        color="primary"
        :disabled="loading || !draft.trim()"
        :loading="loading"
        class="study-ai-chat__send"
      >
        {{ $t('studyCreation.ai.send') }}
      </v-btn>
    </form>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['send'])

const draft = ref('')
const messagesEl = ref(null)

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

const onSubmit = () => {
  const text = draft.value.trim()
  if (!text || props.loading) return
  emit('send', text)
  draft.value = ''
}
</script>

<style scoped>
.study-ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.study-ai-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 48%);
}

.study-ai-chat__bubble {
  max-width: 92%;
  padding: 10px 12px;
  border-radius: 12px;
}

.study-ai-chat__bubble--user {
  align-self: flex-end;
  background: #e8f1ff;
}

.study-ai-chat__bubble--model {
  align-self: flex-start;
  background: #f3f4f6;
}

.study-ai-chat__role {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  margin-bottom: 4px;
}

.study-ai-chat__text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.45;
  color: #111827;
}

.study-ai-chat__composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.study-ai-chat__send {
  height: 48px;
}
</style>
