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
      <div class="session-header mb-4">
        <h3 class="session-title mb-2">
          {{ nextSession.title }}
        </h3>
        <p class="session-description text-body-2 text-grey-darken-1 mb-3">
          {{ nextSession.description }}
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

      <!-- First Row: Study Type and Owner -->
      <v-row
        class="info-row mb-3"
        no-gutters
      >
        <v-col
          cols="6"
          class="pr-2"
        >
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon
                icon="mdi-microscope"
                size="24"
                color="primary"
              />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ nextSession.studyType }}
              </div>
              <div>Tipo de Estudio</div>
            </div>
          </div>
        </v-col>
        <v-col
          cols="6"
          class=""
        >
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon
                icon="mdi-account"
                size="24"
                color="primary"
              />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ nextSession.owner }}
              </div>
              <div>Owner</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Second Row: Date and Time -->
      <v-row
        class="info-row mb-4"
        no-gutters
      >
        <v-col
          cols="6"
          class="pr-2"
        >
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon
                icon="mdi-calendar"
                size="24"
                color="primary"
              />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ nextSession.date }}
              </div>
              <div>Fecha</div>
            </div>
          </div>
        </v-col>
        <v-col
          cols="6"
          class=""
        >
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon
                icon="mdi-clock-outline"
                size="24"
                color="primary"
              />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ nextSession.time }}
              </div>
              <div>Horario</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Action Button -->
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        block
        rounded="lg"
        prepend-icon="mdi-play-circle"
        :disabled="nextSession.status !== 'upcoming'"
        class="action-button"
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

const props = defineProps({
    sessions: {
        type: Array,
        default: () => []
    }
})

const nextSession = computed(() => {
    // Always return default data since no sessions are passed from parent
    return {
        id: 1,
        title: 'Mobile Banking UX Review',
        description: 'Comprehensive usability testing for the new mobile banking application interface and user experience flows.',
        studyType: 'Usability Test',
        date: 'Aug 7, 2025',
        time: '2:30 PM',
        duration: '90 min',
        participants: '8',
        status: 'upcoming',
        owner: 'John Smith'
    }
})

const getStatusColor = (status) => {
    return status === 'upcoming' ? 'success' : 'grey'
}

const getStatusText = (status) => {
    return status === 'upcoming' ? 'Starting Soon' : 'Completed'
}
</script>

<style scoped>
.next-session-card {
    height: 100%;
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
}

.status-chip {
    font-weight: 600;
    font-size: 0.75rem;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.info-icon-wrapper {
    background-color: rgb(var(--v-theme-primary), 0.1);
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
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
