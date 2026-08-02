<template>
  <v-card
    variant="flat"
    class="d-flex flex-column"
    style="height: 100%; min-height: 0"
  >
    <v-card-title>
      <v-icon start color="primary">mdi-forum-outline</v-icon>
      {{ t('focusGroup.session.discussion') }}
    </v-card-title>

    <v-divider />

    <!-- Message feed -->
    <div ref="feed" class="flex-grow-1 overflow-y-auto pa-4" style="min-height: 0">
      <p
        v-if="!messages.length"
        class="text-body-2 text-medium-emphasis text-center my-8"
      >
        {{ t('focusGroup.session.noMessagesYet') }}
      </p>

      <div
        v-for="message in messages"
        :key="message.id"
        class="d-flex mb-3"
        :class="isOwn(message) ? 'justify-end' : 'justify-start'"
      >
        <div style="max-width: 78%">
          <div
            class="text-caption text-medium-emphasis mb-1"
            :class="isOwn(message) ? 'text-right' : ''"
          >
            {{
              isOwn(message)
                ? t('focusGroup.session.you')
                : message.name || t('focusGroup.session.anonymous')
            }}
          </div>
          <div
            class="px-3 py-2 rounded-lg text-body-2"
            :class="
              isOwn(message) ? 'bg-primary text-white' : 'bg-grey-lighten-3'
            "
            style="white-space: pre-wrap; word-break: break-word"
          >
            {{ message.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <template v-if="canPost">
      <v-divider />
      <div class="d-flex align-center ga-2 pa-3">
        <v-text-field
          v-model="draft"
          :placeholder="t('focusGroup.session.messagePlaceholder')"
          density="compact"
          variant="outlined"
          hide-details
          @keydown.enter.prevent="send"
        />
        <v-btn
          color="primary"
          icon="mdi-send"
          :disabled="!draft.trim()"
          :loading="sending"
          @click="send"
        />
      </div>
    </template>
    <template v-else>
      <v-divider />
      <p class="text-caption text-medium-emphasis text-center pa-3 mb-0">
        {{ t('focusGroup.session.observerReadonly') }}
      </p>
    </template>
  </v-card>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // chronological: [{ id, userId, name, text, timestamp }]
  messages: { type: Array, default: () => [] },
  currentUserId: { type: String, default: '' },
  canPost: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
})

const emit = defineEmits(['send'])

const draft = ref('')
const feed = ref(null)

const isOwn = (message) => message.userId === props.currentUserId

const send = () => {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text)
  draft.value = ''
}

// Auto-scroll to the latest message.
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (feed.value) feed.value.scrollTop = feed.value.scrollHeight
  },
)
</script>
