<template>
  <div>
    <p v-if="!entries.length" class="text-body-2 text-medium-emphasis mb-0">
      {{ t('focusGroup.session.noParticipants') }}
    </p>

    <div
      v-for="entry in entries"
      :key="entry.id"
      class="d-flex align-start ga-3 py-2"
    >
      <v-badge
        :color="entry.connected ? 'success' : 'grey'"
        dot
        location="bottom end"
        offset-x="2"
        offset-y="2"
      >
        <v-avatar size="36" :color="entry.color">
          <v-icon color="white" size="20">{{ entry.icon }}</v-icon>
        </v-avatar>
      </v-badge>

      <div class="flex-grow-1">
        <div class="text-body-2 font-weight-medium">
          {{ entry.name || t('focusGroup.session.anonymous') }}
          <span
            v-if="entry.id === currentUserId"
            class="text-medium-emphasis font-weight-regular"
          >
            ({{ t('focusGroup.session.you') }})
          </span>
        </div>
        <div class="d-flex align-center ga-1 mt-1">
          <v-chip size="x-small" variant="tonal" :color="entry.color">
            {{ entry.role || t('focusGroup.session.roleParticipant') }}
          </v-chip>
          <v-icon
            v-if="respondedIds.includes(entry.id)"
            color="success"
            size="16"
            :title="t('focusGroup.session.discussion')"
          >
            mdi-message-text
          </v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // { userId: { name, role, connected } }
  participants: { type: Object, default: () => ({}) },
  // ids that have submitted a response for the current topic
  respondedIds: { type: Array, default: () => [] },
  currentUserId: { type: String, default: '' },
})

// The role is stored as a localized label, so colour by matching the known
// labels; fall back to the participant colour when it does not match.
const roleStyle = (role) => {
  if (role === t('focusGroup.session.roleFacilitator'))
    return { color: 'blue', icon: 'mdi-account-star' }
  if (role === t('focusGroup.session.roleObserver'))
    return { color: 'orange', icon: 'mdi-eye' }
  return { color: 'green', icon: 'mdi-account' }
}

const entries = computed(() =>
  Object.entries(props.participants).map(([id, value]) => {
    const role = value?.role ?? ''
    const style = roleStyle(role)
    return {
      id,
      name: value?.name ?? '',
      role,
      connected: value?.connected === true,
      color: style.color,
      icon: style.icon,
    }
  }),
)
</script>
