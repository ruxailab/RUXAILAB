<template>
  <v-dialog
    :model-value="show"
    max-width="550"
    persistent
    @update:model-value="$emit('update:show', $event)"
  >
    <v-card class="rounded-lg">
      <!-- Header -->
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon class="mr-2">
          mdi-email-open
        </v-icon>
        <span>{{ notification?.title || 'Message' }}</span>
      </v-card-title>

      <!-- Message Content -->
      <v-card-text class="pa-4">
        <!-- Sender Info -->
        <div class="d-flex align-center mb-3">
          <v-avatar
            size="40"
            color="primary"
            class="mr-3"
          >
            <v-icon color="white">
              mdi-account
            </v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold">
              {{ notification?.author || 'Unknown' }}
            </div>
            <div class="text-caption text-grey">
              {{ formatDate(notification?.createdDate) }}
            </div>
          </div>
        </div>

        <v-divider class="mb-3" />

        <!-- Message Body -->
        <div class="message-body pa-3 rounded bg-grey-lighten-4">
          <p
            class="text-body-1 mb-0"
            style="white-space: pre-wrap"
          >
            {{ notification?.description }}
          </p>
        </div>

        <!-- Reply Section -->
        <div
          v-if="showReplyForm"
          class="mt-4"
        >
          <v-divider class="mb-3" />
          <div class="text-subtitle-2 mb-2">
            <v-icon
              size="small"
              class="mr-1"
            >
              mdi-reply
            </v-icon>
            Reply
          </div>
          <v-textarea
            v-model="replyContent"
            label="Your reply"
            placeholder="Type your reply here..."
            variant="outlined"
            rows="3"
            auto-grow
            class="rounded-lg"
          />
        </div>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-3">
        <v-btn
          v-if="!showReplyForm"
          color="primary"
          variant="text"
          prepend-icon="mdi-reply"
          @click="showReplyForm = true"
        >
          Reply
        </v-btn>
        <v-spacer />
        <v-btn
          variant="outlined"
          color="grey"
          @click="onClose"
        >
          Close
        </v-btn>
        <v-btn
          v-if="showReplyForm"
          color="primary"
          variant="flat"
          :disabled="!replyContent.trim()"
          :loading="sending"
          @click="onSendReply"
        >
          Send Reply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  notification: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:show', 'reply', 'close'])

const showReplyForm = ref(false)
const replyContent = ref('')
const sending = ref(false)

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return (
    d.toLocaleDateString() +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

const onClose = () => {
  emit('update:show', false)
  emit('close', props.notification)
  resetForm()
}

const onSendReply = async () => {
  if (!replyContent.value.trim()) return

  sending.value = true
  try {
    emit('reply', {
      notification: props.notification,
      replyContent: replyContent.value,
    })
    resetForm()
    emit('update:show', false)
  } finally {
    sending.value = false
  }
}

const resetForm = () => {
  showReplyForm.value = false
  replyContent.value = ''
}

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  },
)
</script>

<style scoped>
.message-body {
  min-height: 80px;
}
</style>
