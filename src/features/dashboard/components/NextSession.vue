<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="next-session-card"
  >
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-clock-fast"
          class="me-2"
          color="primary"
          style="padding:1.5rem"
        />
        <span class="text-h6 font-weight-bold">Next Session</span>
      </div>
    </v-card-title>

    <v-card-text
      v-if="nextSession"
      class="pa-6"
    >
      <!-- Session Header -->
      <div class="session-header mb-4 text-center">
        <h3 class="session-title mb-2">{{ nextSession.testTitle }}</h3>
        <p class="session-description text-body-2 text-grey-darken-1 mb-3">
          {{ nextSession.testDescription }}
        </p>
        <v-chip
          :color="getStatusColor(nextSession.status)"
          variant="tonal"
          size="small"
          class="status-chip"
        >
          {{ getStatusText(nextSession.status) }}
        </v-chip>
      </div>

      <!-- Info Items -->
      <div class="info-items">
        <div class="info-item">
          <v-icon icon="mdi-microscope" size="24" color="primary" class="info-icon" />
          <div class="info-content">
            <div class="info-value">{{ getStudyType(nextSession) || 'N/A' }}</div>
            <div>Tipo de Estudio</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon icon="mdi-account" size="24" color="primary" class="info-icon" />
          <div class="info-content">
            <div class="info-value">{{ nextSession.testAdmin?.email || 'Unknown' }}</div>
            <div>Owner</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon icon="mdi-calendar" size="24" color="primary" class="info-icon" />
          <div class="info-content">
            <div class="info-value">{{ formatDate(nextSession.startDateTime?.date) }}</div>
            <div>Fecha</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon icon="mdi-clock-outline" size="24" color="primary" class="info-icon" />
          <div class="info-content">
            <div class="info-value">{{ formatTime(nextSession.startDateTime?.time) }}</div>
            <div>Horario</div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        block
        rounded="lg"
        prepend-icon="mdi-play-circle"
        :disabled="nextSession.status !== 'upcoming'"
        class="action-button mt-6"
      >
        {{ nextSession.status === 'upcoming' ? 'Join Now' : 'Completed' }}
      </v-btn>
    </v-card-text>

    <!-- Empty State -->
    <v-card-text
      v-else
      class="pa-6 text-center"
    >
      <div class="empty-state">
        <v-icon
          icon="mdi-calendar-blank"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        />
        <h4 class="text-h6 mb-2">
          No sessions scheduled
        </h4>
        <p class="text-body-2 text-grey">
          Your next session will appear here
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { STUDY_TYPES } from "@/shared/constants/methodDefinitions"

const props = defineProps({
  nextSession: {
    type: Object,
    default: null
  }
})

// Sample default data
// const nextSession = computed(() => ({
//   id: 1,
//   testTitle: 'cvbbb',
//   testDescription: '',
//   studyType: 'USER_UNMODERATED',
//   startDateTime: {
//     date: '10/07/2025',
//     time: '06:30'
//   },
//   status: 'upcoming',
//   testAdmin: { email: 'abc@gmail.com' }
// }))

const getStatusColor = (status) => {
  return status === 'upcoming' ? 'success' : 'grey'
}

const getStatusText = (status) => {
  return status === 'upcoming' ? 'Starting Soon' : 'Completed'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatTime = (time) => {
  if (!time) return 'N/A'
  const [hours, minutes] = time.split(':')
  const date = new Date(2025, 8, 30, hours, minutes) // Using Sep 30, 2025 as base date
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getStudyType(data) {
  const testType = (data.testType || data.header?.templateType || '').toUpperCase()
  const subType = (data.subType || data.header?.templateSubType || '').toUpperCase()

  if (!testType) return ''

  switch (testType) {
    case STUDY_TYPES.USER:
      if (subType === 'USER_UNMODERATED') {
        return 'Usability Test'
      } else if (subType === 'USER_MODERATED') {
        return 'Moderated Usability Test'
      }
      return testType
    case STUDY_TYPES.HEURISTIC:
      return 'Heuristic'
    case STUDY_TYPES.CARD_SORTING:
      return 'Card Sorting'
    case STUDY_TYPES.ACCESSIBILITY_MANUAL:
      return 'Manual Accessibility'
    case STUDY_TYPES.ACCESSIBILITY_AUTOMATIC:
      return 'Automatic Accessibility'
    default:
      return testType
  }
}
</script>

<style scoped>
.next-session-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.session-header {
  text-align: center;
}

.session-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.session-description {
  line-height: 1.4;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-grey-darken-1));
}

.status-chip {
  font-weight: 600;
  font-size: 0.75rem;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  background-color: rgb(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  padding: 8px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  flex: 1;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.action-button {
  font-weight: 700;
  height: 52px;
  font-size: 1.1rem;
  text-transform: none;
  letter-spacing: 0.25px;
  background-color: #1976d2 !important;
  color: white !important;
}

.empty-state {
  padding: 32px 16px;
}

/* Responsive */
@media (max-width: 600px) {
  .session-title {
    font-size: 1.1rem;
  }
}
</style>