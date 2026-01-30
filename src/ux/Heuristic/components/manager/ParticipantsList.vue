<template>
  <v-card v-if="test" class="pa-4" elevation="1">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Participants</h3>
      <div class="d-flex gap-2">
        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="inviteParticipant"
        >
          {{ $t('manager.inviteParticipant') }}
        </v-btn>
        <v-btn
          size="small"
          variant="text"
          :icon="showAllParticipants ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="toggleShowAll"
        ></v-btn>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters mb-4">
      <v-chip-group v-model="selectedFilter" mandatory>
        <v-chip value="all" size="small">
          {{ $t('manager.all') }} ({{ participants.length }})
        </v-chip>
        <v-chip value="completed" size="small" color="success">
          {{ $t('manager.completed') }} ({{ completedCount }})
        </v-chip>
        <v-chip value="inProgress" size="small" color="warning">
          {{ $t('manager.inProgress') }} ({{ inProgressCount }})
        </v-chip>
        <v-chip value="notStarted" size="small" color="grey">
          {{ $t('manager.notStarted') }} ({{ notStartedCount }})
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Lista de participantes -->
    <div class="participants-list">
      <div
        v-for="participant in filteredParticipants"
        :key="participant.userDocId"
        class="participant-item"
      >
        <div class="participant-avatar">
          <v-avatar :color="getStatusColor(participant)" size="40">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </div>

        <div class="participant-info flex-grow-1">
          <div class="participant-name">{{ participant.email }}</div>
          <div class="participant-status">
            <v-chip
              :color="getStatusColor(participant)"
              size="x-small"
              variant="flat"
            >
              {{ getStatusText(participant) }}
            </v-chip>
            <span class="ml-2 text-caption text-grey-darken-1">
              {{ getLastActivity(participant) }}
            </span>
          </div>
        </div>

        <div class="participant-progress">
          <div class="progress-text mb-1">{{ participant.progress || 0 }}%</div>
          <v-progress-linear
            :model-value="participant.progress || 0"
            :color="getStatusColor(participant)"
            height="4"
            rounded
          ></v-progress-linear>
        </div>

        <div class="participant-actions">
          <v-btn
            size="small"
            variant="text"
            icon="mdi-dots-vertical"
            @click="showParticipantMenu(participant)"
          ></v-btn>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="filteredParticipants.length === 0"
      class="text-center py-6 text-grey-darken-1"
    >
      <v-icon size="48" class="mb-2">mdi-account-group-outline</v-icon>
      <div v-if="selectedFilter === 'all'">
        {{ $t('manager.noParticipants') }}
      </div>
      <div v-else>{{ $t('manager.noParticipantsInFilter') }}</div>
    </div>

    <!-- Menú de acciones del participante -->
    <v-menu
      v-model="participantMenu.show"
      :activator="participantMenu.activator"
      close-on-content-click
    >
      <v-list density="compact">
        <v-list-item @click="viewParticipantDetails">
          <v-list-item-title>
            <v-icon size="small" class="mr-2">mdi-eye</v-icon>
            {{ $t('manager.viewDetails') }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="sendReminder">
          <v-list-item-title>
            <v-icon size="small" class="mr-2">mdi-email</v-icon>
            {{ $t('manager.sendReminder') }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item class="text-error" @click="removeParticipant">
          <v-list-item-title>
            <v-icon size="small" class="mr-2">mdi-account-remove</v-icon>
            {{ $t('manager.removeParticipant') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'invite-participant',
  'view-participant',
  'send-reminder',
  'remove-participant',
])

// State
const selectedFilter = ref('all')
const showAllParticipants = ref(false)
const participantMenu = ref({
  show: false,
  activator: null,
  participant: null,
})

// Computed properties
const participants = computed(() => props.test?.cooperators || [])

const completedCount = computed(
  () => participants.value.filter((p) => p?.progress === 100).length,
)

const inProgressCount = computed(
  () =>
    participants.value.filter((p) => p?.progress > 0 && p?.progress < 100)
      .length,
)

const notStartedCount = computed(
  () =>
    participants.value.filter((p) => !p?.progress || p?.progress === 0).length,
)

const filteredParticipants = computed(() => {
  let filtered = participants.value

  switch (selectedFilter.value) {
    case 'completed':
      filtered = filtered.filter((p) => p?.progress === 100)
      break
    case 'inProgress':
      filtered = filtered.filter((p) => p?.progress > 0 && p?.progress < 100)
      break
    case 'notStarted':
      filtered = filtered.filter((p) => !p?.progress || p?.progress === 0)
      break
  }

  // Limitar la vista si no se muestran todos
  if (!showAllParticipants.value && filtered.length > 5) {
    return filtered.slice(0, 5)
  }

  return filtered
})

// Methods
const getStatusColor = (participant) => {
  if (participant.progress === 100) return 'success'
  if (participant.progress > 0) return 'warning'
  return 'grey'
}

const getStatusText = (participant) => {
  if (participant.progress === 100) return 'Completado'
  if (participant.progress > 0) return 'En Progreso'
  if (participant.invited && !participant.accepted) return 'Invitado'
  return 'Sin Empezar'
}

const getLastActivity = (participant) => {
  if (!participant.updateDate) return 'Sin actividad'

  return formatDistanceToNow(new Date(participant.updateDate), {
    addSuffix: true,
    locale: es,
  })
}

const toggleShowAll = () => {
  showAllParticipants.value = !showAllParticipants.value
}

const inviteParticipant = () => emit('invite-participant')

const showParticipantMenu = (participant) => {
  participantMenu.value.participant = participant
  participantMenu.value.show = true
}

const viewParticipantDetails = () => {
  emit('view-participant', participantMenu.value.participant)
  participantMenu.value.show = false
}

const sendReminder = () => {
  emit('send-reminder', participantMenu.value.participant)
  participantMenu.value.show = false
}

const removeParticipant = () => {
  emit('remove-participant', participantMenu.value.participant)
  participantMenu.value.show = false
}
</script>

<style scoped>
.filters {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.participants-list {
  max-height: 400px;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.participant-item:last-child {
  border-bottom: none;
}

.participant-avatar {
  flex-shrink: 0;
}

.participant-info {
  min-width: 0;
}

.participant-name {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.participant-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-progress {
  width: 100px;
  flex-shrink: 0;
}

.progress-text {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
}

.participant-actions {
  flex-shrink: 0;
}
</style>
