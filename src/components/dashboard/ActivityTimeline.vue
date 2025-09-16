<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="mb-6"
  >
    <v-card-title class="d-flex align-center py-4">
      <v-icon
        icon="mdi-clock-time-eight"
        class="me-2"
        color="primary"
      />
      Recent Activity
    </v-card-title>
    <v-card-text class="pa-0">
      <v-timeline
        direction="vertical"
        density="compact"
        class="pa-4"
      >
        <v-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :dot-color="activity.color"
          size="small"
          class="mb-4"
        >
          <template #opposite>
            <div class="text-caption text-medium-emphasis">
              {{ activity.time }}
            </div>
          </template>

          <div class="activity-content">
            <div class="d-flex align-center mb-2">
              <v-avatar
                size="24"
                class="me-2"
              >
                <v-img
                  :src="activity.user.avatar"
                  :alt="activity.user.name"
                  cover
                />
              </v-avatar>
              <span class="text-body-2 font-weight-medium">{{ activity.user.name }}</span>
              <span class="text-body-2 text-medium-emphasis ms-1">{{ activity.action }}</span>
            </div>

            <div class="text-body-2 mb-2">
              {{ activity.description }}
            </div>

            <!-- Attachment if exists -->
            <v-card
              v-if="activity.attachment"
              variant="outlined"
              class="attachment-card pa-2 mb-2"
              rounded="md"
            >
              <div class="d-flex align-center">
                <v-icon
                  :icon="activity.attachment.icon"
                  size="16"
                  class="me-2"
                  color="primary"
                />
                <span class="text-caption">{{ activity.attachment.name }}</span>
              </div>
            </v-card>

            <!-- Team members if exists -->
            <div
              v-if="activity.teamMembers"
              class="d-flex align-center mt-2"
            >
              <span class="text-caption text-medium-emphasis me-2">Team:</span>
              <v-avatar-group
                size="20"
                max="3"
              >
                <v-avatar
                  v-for="member in activity.teamMembers"
                  :key="member.id"
                  size="20"
                >
                  <v-img
                    :src="member.avatar"
                    :alt="member.name"
                    cover
                  />
                  <v-tooltip
                    activator="parent"
                    location="top"
                  >
                    {{ member.name }}
                  </v-tooltip>
                </v-avatar>
              </v-avatar-group>
            </div>
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
        default: () => []
    }
})

// Default activities if none provided
const defaultActivities = [
    {
        id: 1,
        time: '2 min ago',
        color: 'success',
        user: {
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face'
        },
        action: 'completed',
        description: 'Usability Test for Mobile Banking App',
        attachment: {
            name: 'test-results.pdf',
            icon: 'mdi-file-pdf-box'
        }
    },
    {
        id: 2,
        time: '15 min ago',
        color: 'primary',
        user: {
            name: 'Alex Rivera',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
        },
        action: 'started',
        description: 'Card Sorting Study for E-commerce Platform',
        teamMembers: [
            {
                id: 1,
                name: 'Maria Garcia',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
            },
            {
                id: 2,
                name: 'John Kim',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            }
        ]
    },
    {
        id: 3,
        time: '1 hour ago',
        color: 'warning',
        user: {
            name: 'Emma Thompson',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
        },
        action: 'paused',
        description: 'A/B Testing for Landing Page Design'
    },
    {
        id: 4,
        time: '3 hours ago',
        color: 'info',
        user: {
            name: 'David Park',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
        },
        action: 'uploaded',
        description: 'New participant data for Accessibility Study',
        attachment: {
            name: 'participants.csv',
            icon: 'mdi-file-table'
        }
    }
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

:deep(.v-timeline-item__body) {
    padding-inline-start: 16px !important;
}

:deep(.v-timeline-item__opposite) {
    flex: 0 0 auto;
    align-self: center;
}
</style>
