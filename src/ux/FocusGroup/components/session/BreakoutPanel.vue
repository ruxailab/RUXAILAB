<template>
  <div class="breakout-panel">
    <!-- Not yet split: choose a group count and start -->
    <div v-if="!breakout?.active" class="breakout-panel__start">
      <p class="text-body-2 text-medium-emphasis mb-3">
        {{ t('focusGroup.session.breakoutIntro') }}
      </p>
      <v-text-field
        v-model.number="groupCount"
        type="number"
        :min="1"
        :max="Math.max(1, eligibleParticipants.length)"
        density="compact"
        variant="outlined"
        hide-details
        :label="t('focusGroup.session.breakoutGroupCount')"
        class="mb-3"
      />
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-call-split"
        class="text-none"
        :disabled="eligibleParticipants.length === 0"
        @click="emit('start', groupCount)"
      >
        {{ t('focusGroup.session.breakoutStart') }}
      </v-btn>
      <p v-if="eligibleParticipants.length === 0" class="text-caption text-medium-emphasis mt-2 mb-0">
        {{ t('focusGroup.session.breakoutNoParticipants') }}
      </p>
    </div>

    <!-- Active breakout: groups, timer, broadcast, recall -->
    <div v-else class="breakout-panel__active">
      <div class="d-flex align-center justify-space-between mb-3">
        <SessionTimer
          :timer="breakoutTimer"
          :fallback-ms="breakoutFallbackMs"
          :is-facilitator="true"
          @play="(ms) => emit('play', ms)"
          @pause="(ms) => emit('pause', ms)"
          @reset="emit('reset')"
        />
        <v-btn
          size="small"
          variant="tonal"
          color="error"
          prepend-icon="mdi-call-merge"
          class="text-none"
          @click="emit('recall')"
        >
          {{ t('focusGroup.session.breakoutRecall') }}
        </v-btn>
      </div>

      <v-card
        v-for="(group, groupId) in breakout.groups"
        :key="groupId"
        variant="outlined"
        rounded="lg"
        class="mb-3"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="font-weight-medium">{{ group.name }}</span>
            <v-btn
              size="x-small"
              variant="text"
              :color="peekedGroupId === groupId ? 'primary' : undefined"
              @click="peekedGroupId = peekedGroupId === groupId ? null : groupId"
            >
              {{ t('focusGroup.session.breakoutPeek') }}
            </v-btn>
          </div>

          <div
            v-for="userId in group.participantIds"
            :key="userId"
            class="d-flex align-center ga-2 mb-1"
          >
            <span class="text-body-2 flex-grow-1 text-truncate">
              {{ participantName(userId) }}
            </span>
            <v-select
              :model-value="groupId"
              :items="groupOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 140px"
              @update:model-value="(target) => emit('reassign', { userId, groupId: target })"
            />
          </div>
          <p v-if="!group.participantIds.length" class="text-caption text-medium-emphasis mb-0">
            {{ t('focusGroup.session.breakoutEmptyGroup') }}
          </p>

          <div v-if="peekedGroupId === groupId" class="breakout-panel__peek">
            <p v-if="!groupMessages(groupId).length" class="text-caption text-medium-emphasis mb-0">
              {{ t('focusGroup.session.noMessagesYet') }}
            </p>
            <div
              v-for="message in groupMessages(groupId)"
              :key="message.id"
              class="text-caption mb-1"
            >
              <strong>{{ message.name || t('focusGroup.session.anonymous') }}:</strong>
              {{ message.text }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-divider class="my-3" />

      <p class="text-body-2 font-weight-medium mb-2">
        {{ t('focusGroup.session.breakoutBroadcastTitle') }}
      </p>
      <v-text-field
        v-model="broadcastText"
        density="compact"
        variant="outlined"
        hide-details
        :label="t('focusGroup.session.breakoutBroadcastPlaceholder')"
        class="mb-2"
      />
      <v-btn
        size="small"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-bullhorn-outline"
        class="text-none"
        :disabled="!broadcastText.trim()"
        @click="sendBroadcast"
      >
        {{ t('focusGroup.session.breakoutBroadcastSend') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SessionTimer from '@/ux/FocusGroup/components/session/SessionTimer.vue'

const { t } = useI18n()

const props = defineProps({
  // Full breakout state from RTDB, or null when no breakout has ever run.
  breakout: { type: Object, default: null },
  // [{ id, name }] — participants eligible to be split into groups.
  eligibleParticipants: { type: Array, default: () => [] },
  // Full RTDB timer node; the breakout timer is scoped via topicId 'breakout'.
  timer: { type: Object, default: null },
  // Full RTDB messages tree, so the facilitator can peek a group's chat
  // (namespaced under `breakout-{groupId}`, reusing the topic-chat pattern).
  messages: { type: Object, default: () => ({}) },
})

const emit = defineEmits([
  'start',
  'reassign',
  'broadcast',
  'recall',
  'play',
  'pause',
  'reset',
])

const groupCount = ref(2)
const broadcastText = ref('')
const peekedGroupId = ref(null)

const BREAKOUT_TIMER_TOPIC_ID = 'breakout'
const breakoutFallbackMs = 10 * 60 * 1000

const breakoutTimer = computed(() =>
  props.timer?.topicId === BREAKOUT_TIMER_TOPIC_ID ? props.timer : null,
)

const groupOptions = computed(() =>
  Object.entries(props.breakout?.groups ?? {}).map(([id, group]) => ({
    title: group.name,
    value: id,
  })),
)

const participantName = (userId) =>
  props.eligibleParticipants.find((p) => p.id === userId)?.name || userId

const groupMessages = (groupId) => {
  const byTopic = props.messages?.[`breakout-${groupId}`] ?? {}
  return Object.entries(byTopic)
    .map(([id, value]) => ({
      id,
      name: value?.name ?? '',
      text: value?.text ?? '',
      timestamp: value?.timestamp ?? 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

const sendBroadcast = () => {
  if (!broadcastText.value.trim()) return
  emit('broadcast', broadcastText.value.trim())
  broadcastText.value = ''
}
</script>

<style scoped>
.breakout-panel__peek {
  margin-top: 8px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}
</style>
