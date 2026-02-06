<template>
  <v-card elevation="2" rounded="lg" class="next-session-card">
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-clock-fast"
          class="me-2"
          color="primary"
          style="padding: 1.5rem"
        />
        <span class="text-h6 font-weight-bold">{{
          $t('Dashboard.nextSession')
        }}</span>
      </div>
    </v-card-title>

    <v-card-text v-if="nextSession" class="pa-6">
      <!-- Session Header -->
      <div class="session-header mb-4 text-center">
        <h3 class="session-title mb-2">{{ nextSession.testTitle }}</h3>
        <p class="session-description text-body-2 text-grey-darken-1 mb-3">
          {{ nextSession.testDescription || 'No description available' }}
        </p>
        <v-chip
          :color="getStatus(nextSession).variant"
          variant="tonal"
          size="small"
          class="status-chip"
        >
          {{ getStatus(nextSession).label }}
        </v-chip>
      </div>

      <!-- Info Items -->
      <div class="info-items">
        <div class="info-item">
          <v-icon
            icon="mdi-microscope"
            size="24"
            color="primary"
            class="info-icon"
          />
          <div class="info-content">
            <div class="info-value">{{ getStudyType(nextSession) }}</div>
            <div>Tipo de Estudio</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon
            icon="mdi-account"
            size="24"
            color="primary"
            class="info-icon"
          />
          <div class="info-content">
            <div class="info-value">
              {{ nextSession.testAdmin?.email || 'Unknown' }}
            </div>
            <div>{{ $t('common.table.owner') }}</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon
            icon="mdi-account"
            size="24"
            color="primary"
            class="info-icon"
          />
          <div class="info-content">
            <div class="info-value">
              {{ nextSession.evaluator || 'Unknown' }}
            </div>
            <div>{{ $t('pages.sessions.evaluator') }}</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon
            icon="mdi-calendar"
            size="24"
            color="primary"
            class="info-icon"
          />
          <div class="info-content">
            <div class="info-value">{{ formatDate(nextSession.testDate) }}</div>
            <div>{{ $t('Dashboard.date') }}</div>
          </div>
        </div>
        <div class="info-item">
          <v-icon
            icon="mdi-clock-outline"
            size="24"
            color="primary"
            class="info-icon"
          />
          <div class="info-content">
            <div class="info-value">{{ formatTime(nextSession.testDate) }}</div>
            <div>{{ $t('Dashboard.time') }}</div>
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
        :disabled="getStatus(nextSession) === SESSION_STATUSES.COMPLETED"
        class="action-button mt-6"
        @click="goto(nextSession)"
      >
        {{
          getStatus(nextSession) !== SESSION_STATUSES.COMPLETED
            ? $t('Dashboard.webinar.startSession')
            : $t('analytics.completed')
        }}
      </v-btn>
    </v-card-text>

    <!-- Empty State -->
    <v-card-text v-else class="pa-6 text-center">
      <div class="empty-state">
        <v-icon
          icon="mdi-calendar-blank"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        />
        <h4 class="text-h6 mb-2">
          {{ $t('Dashboard.noSessionsScheduled') }}
        </h4>
        <p class="text-body-2 text-grey">
          {{ $t('Dashboard.nextSessionWillAppear') }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {
  getMethodName,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import { useRouter } from 'vue-router'
import {
  getSessionStatus,
  SESSION_STATUSES,
} from '@/shared/utils/sessionsUtils'

const props = defineProps({
  nextSession: {
    type: Object,
  },
})

const router = useRouter()

const getStatus = () => {
  return getSessionStatus(props.nextSession.testDate)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getStudyType(data) {
  const testType = (data.testType || '').toUpperCase()
  const subType = (data.subType || '').toUpperCase()

  if (
    testType === STUDY_TYPES.USER &&
    subType === USER_STUDY_SUBTYPES.MODERATED
  ) {
    return getMethodName(data)
  }
  return 'N/A'
}

const goto = (session) => {
  const url = `/testview/${session.id}/${session.userDocId}`
  router.push(url)
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
