<template>
  <v-card elevation="2" rounded="lg" class="mb-6 position-relative">
    <!-- Coming Soon Chip -->

    <v-card-title class="d-flex align-center py-4 no-whitespace">
      <v-icon icon="mdi-clock-time-eight" class="me-2" color="primary" />
      {{ $t('Dashboard.recentActivity') }}
      <v-spacer />
      <v-chip
        color="primary"
        variant="outlined"
        size="small"
        class="chip-responsive"
      >
        <v-icon
          icon="mdi-clock-outline"
          size="small"
          class="d-none d-sm-inline me-1"
        />
        {{ $t('Dashboard.comingSoon') }}
      </v-chip>
    </v-card-title>
    <v-card-text class="pa-0 coming-soon-overlay">
      <v-timeline direction="vertical" density="comfortable" class="pa-4">
        <v-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          size="small"
          :dot-color="activity.color"
          class="mb-4"
        >
          <template #opposite>
            <div class="text-caption text-medium-emphasis">
              {{ activity.time }}
            </div>
          </template>

          <div class="mb-2">
            <div class="text-body-2 font-weight-medium">
              {{ activity.user.name }}
            </div>
            <div class="text-body-2">
              <span class="text-medium-emphasis">{{ activity.action }}</span>
              <span class="mx-1">•</span>
              <span>{{ activity.description }}</span>
            </div>
          </div>

          <!-- Team members if exists -->
          <div v-if="activity.teamMembers" class="mt-2">
            <span class="text-caption text-medium-emphasis">
              {{ activity.teamMembers.length }}
              {{ activity.teamMembers.map((m) => m.name).join(', ') }}
            </span>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Recent Activity',
  },
  viewAllRoute: {
    type: String,
    default: '',
  },
})

// Default activities if none provided
const defaultActivities = [
  {
    id: 1,
    time: '2 min ago',
    color: 'success',
    user: {
      name: 'Daenerys Targaryen',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face',
    },
    action: 'completed',
    description: 'Usability Test for Mobile Banking App',
    attachment: {
      name: 'test-results.pdf',
      icon: 'mdi-file-pdf-box',
    },
  },
  {
    id: 2,
    time: '15 min ago',
    color: 'primary',
    user: {
      name: 'Jon Snow',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
    action: 'started',
    description: 'Card Sorting Study for E-commerce Platform',
    teamMembers: [
      {
        id: 1,
        name: 'Arya Stark',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      },
      {
        id: 2,
        name: 'Tyrion Lannister',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      },
    ],
  },
  {
    id: 3,
    time: '1 hour ago',
    color: 'warning',
    user: {
      name: 'Cersei Lannister',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    },
    action: 'created',
    description: 'A/B Testing for Landing Page Design',
  },
  {
    id: 4,
    time: '3 hours ago',
    color: 'info',
    user: {
      name: 'Sansa Stark',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    },
    action: 'finished',
    description: 'New participant data for Accessibility Study',
    attachment: {
      name: 'participants.csv',
      icon: 'mdi-file-table',
    },
  },
]

const activities = computed(() => {
  return props.activities.length > 0 ? props.activities : defaultActivities
})
</script>

<style scoped>
.activity-content {
  padding-left: 8px;
}

.attachment-card {
  background-color: rgb(var(--v-theme-surface-variant));
  max-width: 200px;
}

/* Overlay for content */
.coming-soon-overlay {
  position: relative;
  opacity: 0.7;
  pointer-events: none;
}

.coming-soon-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(0.5px);
  border-radius: 0 0 12px 12px;
  z-index: 1;
}

:deep(.v-timeline-item__body) {
  padding-inline-start: 16px !important;
}

:deep(.v-timeline-item__opposite) {
  flex: 0 0 auto;
  align-self: center;
}

.no-whitespace {
  white-space: normal;
}

.chip-responsive {
  font-size: 0.75rem;
  min-width: 95px;
}
</style>
