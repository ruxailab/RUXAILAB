<template>
  <div class="side-panel-content">
    <div v-if="safeStaffList.length" class="panel-section">
      <h4>Staff</h4>
      <div
        v-for="member in safeStaffList"
        :key="member.id"
        class="participant-item"
      >
        <v-avatar
          size="32"
          :color="member.role === 'moderator' ? 'blue' : 'orange'"
        >
          <v-icon color="white">{{
            member.role === 'moderator' ? 'mdi-account-star' : 'mdi-eye'
          }}</v-icon>
        </v-avatar>
        <div class="participant-info">
          <span class="participant-name">
            {{ member.name }}
            <v-chip
              v-if="member.role === 'observator'"
              size="x-small"
              color="orange"
              class="ml-1"
            >
              {{ $t('videoCall.panel.observator') }}
            </v-chip>
            <v-chip
              v-else-if="member.role === 'moderator'"
              size="x-small"
              color="blue"
              class="ml-1"
            >
              {{ $t('videoCall.panel.moderator') }}
            </v-chip>
          </span>
          <div class="participant-status">
            <v-chip size="x-small" :color="getPresenceState(member).color">
              {{ getPresenceState(member).label }}
            </v-chip>
            <v-chip
              v-if="member.presenceUpdatedAt"
              size="x-small"
              color="grey"
              class="ml-1"
            >
              {{ formatPresenceUpdatedAt(member.presenceUpdatedAt) }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <div v-if="safeParticipantList.length" class="panel-section">
      <h4>{{ $t('videoCall.panel.participants') }}</h4>
      <div
        v-for="participant in safeParticipantList"
        :key="participant.id"
        class="participant-item"
      >
        <v-avatar
          size="32"
          :color="
            participant.role === 'moderator'
              ? 'blue'
              : participant.role === 'observator'
                ? 'orange'
                : 'green'
          "
        >
          <v-icon color="white">{{
            participant.role === 'moderator'
              ? 'mdi-account-star'
              : participant.role === 'observator'
                ? 'mdi-eye'
                : 'mdi-account'
          }}</v-icon>
        </v-avatar>
        <div class="participant-info">
          <span class="participant-name">
            {{
              participant.name +
              (participant.isSelf ? ` (${$t('videoCall.panel.you')})` : '')
            }}

            <v-chip
              v-if="participant.role === 'observator'"
              size="x-small"
              color="orange"
              class="ml-1"
            >
              {{ $t('videoCall.panel.observator') }}
            </v-chip>

            <v-chip
              v-else-if="participant.role === 'moderator'"
              size="x-small"
              color="blue"
              class="ml-1"
            >
              {{ $t('videoCall.panel.moderator') }}
            </v-chip>
          </span>
          <div class="participant-status">
            <v-chip size="x-small" :color="getPresenceState(participant).color">
              {{ getPresenceState(participant).label }}
            </v-chip>
            <v-chip
              v-if="participant.presenceUpdatedAt"
              size="x-small"
              color="grey"
              class="ml-1"
            >
              {{ formatPresenceUpdatedAt(participant.presenceUpdatedAt) }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  staffList: { type: Array, default: () => [] },
  participantList: { type: Array, default: () => [] },
})

const safeStaffList = computed(() =>
  Array.isArray(props.staffList) ? props.staffList : [],
)
const safeParticipantList = computed(() =>
  Array.isArray(props.participantList) ? props.participantList : [],
)

const getPresenceState = (member) => {
  const rawStatus =
    member?.presenceStatus ??
    member?.status ??
    (member?.connected === true
      ? 'connected'
      : member?.connected === false
        ? 'disconnected'
        : 'disconnected')

  const normalized = String(rawStatus).trim().toLowerCase()

  if (
    normalized === 'waiting' ||
    normalized === 'lobby' ||
    normalized === 'pending'
  ) {
    return { color: 'orange', label: 'waiting' }
  }

  if (
    normalized === 'connected' ||
    normalized === 'in-room' ||
    normalized === 'joined'
  ) {
    return { color: 'green', label: 'connected' }
  }

  if (
    normalized === 'disconnected' ||
    normalized === 'offline' ||
    normalized === 'left' ||
    normalized === 'exited'
  ) {
    return { color: 'grey', label: 'disconnected' }
  }

  return { color: 'grey', label: normalized || 'waiting' }
}

const formatPresenceUpdatedAt = (value) => {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped src="./videoCallShared.css"></style>
