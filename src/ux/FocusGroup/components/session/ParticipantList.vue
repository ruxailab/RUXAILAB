<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>
        <v-icon start color="primary">mdi-account-multiple</v-icon>
        {{ t('focusGroup.session.participants') }}
      </span>
      <v-chip size="small" color="primary" variant="tonal">
        {{ connectedCount }}/{{ entries.length }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <p v-if="!entries.length" class="text-body-2 text-medium-emphasis mb-0">
        {{ t('focusGroup.session.noParticipants') }}
      </p>

      <v-list v-else density="compact" class="pa-0">
        <v-list-item
          v-for="entry in entries"
          :key="entry.id"
          class="px-0"
        >
          <template #prepend>
            <v-badge
              :color="entry.connected ? 'success' : 'grey'"
              dot
              location="bottom end"
              offset-x="2"
              offset-y="2"
            >
              <v-avatar size="32" color="grey-lighten-1">
                <span class="text-caption">{{ initials(entry.name) }}</span>
              </v-avatar>
            </v-badge>
          </template>

          <v-list-item-title class="text-body-2">
            {{ entry.name || t('focusGroup.session.anonymous') }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ entry.role || t('focusGroup.session.roleParticipant') }}
          </v-list-item-subtitle>

          <template #append>
            <v-icon
              v-if="respondedIds.includes(entry.id)"
              color="success"
              size="18"
            >
              mdi-check-circle
            </v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
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
})

const entries = computed(() =>
  Object.entries(props.participants).map(([id, value]) => ({
    id,
    name: value?.name ?? '',
    role: value?.role ?? '',
    connected: value?.connected === true,
  })),
)

const connectedCount = computed(
  () => entries.value.filter((e) => e.connected).length,
)

const initials = (name) => {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
</script>
