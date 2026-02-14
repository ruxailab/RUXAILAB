<template>
  <v-card elevation="2" rounded="lg" class="scheduled-tests-card">
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-calendar-clock"
          class="me-2"
          color="primary"
          style="padding: 1.5rem"
        />
        <span class="text-h6 font-weight-bold">{{
          $t('Dashboard.scheduledTests.title')
        }}</span>
      </div>
      <v-chip
        v-if="scheduledStudies.length"
        color="primary"
        variant="flat"
        size="small"
        class="font-weight-bold"
      >
        {{ scheduledStudies.length }}
      </v-chip>
    </v-card-title>

    <div v-if="scheduledStudies.length" class="tests-list">
      <div
        v-for="study in scheduledStudies"
        :key="study.id"
        class="test-item pa-4"
        @click="goto(study)"
      >
        <div class="d-flex align-start justify-space-between">
          <div class="test-info">
            <h4 class="text-subtitle-1 font-weight-bold mb-1 text-truncate">
              {{ study.testTitle }}
            </h4>
            <div
              class="d-flex align-center text-caption text-grey-darken-1 mb-2"
            >
              <v-icon icon="mdi-calendar" size="14" class="me-1" />
              {{ formatDate(study.scheduledDate) }}
              <v-icon icon="mdi-clock-outline" size="14" class="ms-2 me-1" />
              {{ study.scheduledTime || formatTime(study.scheduledDate) }}
            </div>
            <p
              v-if="study.scheduledNotes"
              class="text-caption text-grey mb-0 text-truncate"
              style="max-width: 250px"
            >
              {{ study.scheduledNotes }}
            </p>
          </div>

          <v-chip
            :color="getStatus(study).variant"
            size="x-small"
            variant="tonal"
            class="status-chip"
          >
            {{ getStatus(study).label }}
          </v-chip>
        </div>
      </div>
    </div>

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
          {{ $t('Dashboard.scheduledTests.noTests') }}
        </h4>
        <p class="text-body-2 text-grey">
          {{ $t('Dashboard.scheduledTests.scheduleHint') }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getSessionStatus } from '@/shared/utils/sessionsUtils'

const props = defineProps({
  scheduledStudies: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

const getStatus = (study) => {
  return getSessionStatus(study.scheduledDate)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
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

const goto = (study) => {
  // Using Settings view (or admin view) path since user is admin/researcher
  // Adjust route name/path based on actual requirement (e.g. test preview or settings)
  // Assuming we want to go to Study Settings to manage it
  router.push({
    name: 'study-create-step4',
    query: { id: study.id },
  })
}
</script>

<style scoped>
.scheduled-tests-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tests-list {
  overflow-y: auto;
  flex: 1;
  max-height: 400px; /* Limit height to keep it consistent with other cards */
}

.test-item {
  border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-4));
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-item:last-child {
  border-bottom: none;
}

.test-item:hover {
  background-color: rgb(var(--v-theme-grey-lighten-5));
}

.empty-state {
  padding: 32px 16px;
}
</style>
