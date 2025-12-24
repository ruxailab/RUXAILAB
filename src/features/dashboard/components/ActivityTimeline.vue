<template>
  <v-card
    elevation="1"
    elevation-hover="2"
    rounded="lg"
    class="activity-card position-relative"
  >
    <!-- Coming Soon Chip -->
    <v-chip
      class="coming-soon-chip"
      color="primary"
      variant="outlined"
      size="small"
      :prepend-icon="showClockIcon ? 'mdi-clock-outline' : undefined"
    >
      <span class="chip-text">Coming Soon</span>
    </v-chip>
    
    <v-card-title class="card-header d-flex align-center py-3 py-md-4 px-3 px-md-4">
      <v-icon
        icon="mdi-clock-time-eight"
        class="me-2 icon-size"
        color="primary"
      />
      <span class="card-title-text">Recent Activity</span>
      <v-spacer />
      <v-btn
        v-if="viewAllRoute"
        :to="viewAllRoute"
        variant="text"
        size="small"
        color="primary"
        disabled
        class="view-all-btn"
      >
        <span class="btn-text">View All</span>
      </v-btn>
    </v-card-title>
    
    <v-card-text class="timeline-content pa-3 pa-md-4">
      <!-- Coming Soon Overlay -->
      <div class="coming-soon-overlay"></div>
      
      <v-timeline
        direction="vertical"
        :density="timelineDensity"
        class="timeline-wrapper"
        align="start"
      >
        <v-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :size="timelineItemSize"
          :dot-color="activity.color"
          class="timeline-item mb-3 mb-md-4"
        >
          <!-- Time - Opposite side on desktop and inline on mobile -->
          <template #opposite>
            <div class="time-text text-caption text-medium-emphasis d-none d-md-block">
              {{ activity.time }}
            </div>
          </template>
          
          <div class="timeline-item-content">
            <!-- Mobile time display -->
            <div class="d-md-none text-caption text-medium-emphasis mb-1">
              {{ activity.time }}
            </div>
            
            <!-- User and action -->
            <div class="user-action mb-1 mb-md-2">
              <div class="text-body-2 text-md-body-1 font-weight-medium d-inline">
                {{ truncateName(activity.user.name) }}
              </div>
              <span class="mx-1 text-medium-emphasis">•</span>
              <span class="text-body-2 text-md-body-1 text-medium-emphasis">
                {{ activity.action }}
              </span>
            </div>
            
            <!-- Description -->
            <div class="description text-body-2 text-md-body-1 mb-1 mb-md-2">
              {{ truncateDescription(activity.description) }}
            </div>
            
            <!-- Attachment -->
            <div
              v-if="activity.attachment"
              class="attachment-wrapper mt-2"
            >
              <v-chip
                size="small"
                variant="outlined"
                color="primary"
                class="attachment-chip"
              >
                <v-icon :icon="activity.attachment.icon" size="16" class="me-1" />
                <span class="attachment-name">{{ truncateFilename(activity.attachment.name) }}</span>
              </v-chip>
            </div>
            
            <!-- Team members if exists -->
            <div
              v-if="activity.teamMembers"
              class="team-members mt-2"
            >
              <span class="text-caption text-medium-emphasis">
                <v-icon icon="mdi-account-group" size="14" class="me-1" />
                {{ activity.teamMembers.length }} team member{{ activity.teamMembers.length > 1 ? 's' : '' }}: 
                {{ truncateTeamMembers(activity.teamMembers) }}
              </span>
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

// Responsive timeline density
const timelineDensity = computed(() => {
  return window.innerWidth < 600 ? 'compact' : 'comfortable'
})

// Responsive timeline item size
const timelineItemSize = computed(() => {
  return window.innerWidth < 600 ? 'x-small' : 'small'
})

// Show clock icon only on larger screens
const showClockIcon = computed(() => {
  return window.innerWidth >= 380
})

// Helper functions for responsiveness
const truncateName = (name) => {
  if (!name) return ''
  if (window.innerWidth >= 380) return name
  
  // For very small screens, show first name only
  const firstName = name.split(' ')[0]
  if (window.innerWidth < 320) {
    return firstName.length > 8 ? firstName.substring(0, 8) + '...' : firstName
  }
  return firstName
}

const truncateDescription = (description) => {
  if (!description) return ''
  const maxLength = window.innerWidth < 600 ? 
                    (window.innerWidth < 380 ? 40 : 50) : 
                    80
  return description.length > maxLength 
    ? description.substring(0, maxLength) + '...' 
    : description
}

const truncateFilename = (filename) => {
  if (!filename) return ''
  const maxLength = window.innerWidth < 600 ? 
                    (window.innerWidth < 380 ? 12 : 15) : 
                    25
  if (filename.length <= maxLength) return filename
  
  const extension = filename.split('.').pop()
  const name = filename.substring(0, filename.lastIndexOf('.'))
  const truncatedName = name.substring(0, maxLength - extension.length - 4) + '...'
  
  return truncatedName + '.' + extension
}

const truncateTeamMembers = (teamMembers) => {
  if (!teamMembers || !teamMembers.length) return ''
  
  const maxNames = window.innerWidth < 600 ? 
                   (window.innerWidth < 380 ? 1 : 2) : 
                   4
  const names = teamMembers.map(m => truncateName(m.name))
  
  if (names.length <= maxNames) {
    return names.join(', ')
  }
  
  return names.slice(0, maxNames).join(', ') + ` +${names.length - maxNames} more`
}

// Default activities if none provided
const defaultActivities = [
    {
        id: 1,
        time: '2 min ago',
        color: 'success',
        user: {
            name: 'Daenerys Targaryen',
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
            name: 'Jon Snow',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
        },
        action: 'started',
        description: 'Card Sorting Study for E-commerce Platform',
        teamMembers: [
            {
                id: 1,
                name: 'Arya Stark',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
            },
            {
                id: 2,
                name: 'Tyrion Lannister',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            }
        ]
    },
    {
        id: 3,
        time: '1 hour ago',
        color: 'warning',
        user: {
            name: 'Cersei Lannister',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
        },
        action: 'created',
        description: 'A/B Testing for Landing Page Design'
    },
    {
        id: 4,
        time: '3 hours ago',
        color: 'info',
        user: {
            name: 'Sansa Stark',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
        },
        action: 'finished',
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
.activity-card {
  min-height: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Coming Soon Chip */
.coming-soon-chip {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20; 
  backdrop-filter: blur(4px);
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  pointer-events: none; 
}

.chip-text {
  font-size: 0.7rem;
  font-weight: 500;
}

/* Card Header */
.card-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.1);
  min-height: 56px;
  position: relative;
  z-index: 15;
  background-color: rgb(var(--v-theme-background));
}

.card-title-text {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  padding-right: 80px;
}

.view-all-btn {
  min-width: auto;
  white-space: nowrap;
}

/* Timeline Content */
.timeline-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-height: 300px;
}

/* Overlay for content */
.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(0.5px);
  border-radius: 0 0 12px 12px;
  z-index: 10;
  pointer-events: none;
  user-select: none;
}

.timeline-wrapper {
  position: relative;
  z-index: 5;
}

.timeline-item-content {
  padding-left: 8px;
  position: relative;
  z-index: 1;
}

.time-text {
  min-width: 70px;
}

.user-action {
  line-height: 1.4;
}

.description {
  line-height: 1.4;
  word-break: break-word;
}

.attachment-chip {
  max-width: 100%;
  overflow: hidden;
}

.attachment-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-members {
  word-break: break-word;
  line-height: 1.4;
}

:deep(.v-timeline-item__dot) {
  box-shadow: 0 0 0 4px white;
  z-index: 2;
}

:deep(.v-timeline-item__body) {
  padding-inline-start: 16px !important;
  max-width: 100%;
}

:deep(.v-timeline-item__opposite) {
  flex: 0 0 auto;
  align-self: flex-start;
  padding-top: 4px;
}

/* Mobile-first responsive design */
@media (max-width: 600px) {
  .coming-soon-chip {
    top: 8px;
    right: 8px;
    padding: 2px 6px;
    height: 24px;
  }
  
  .chip-text {
    font-size: 0.65rem;
  }
  
  .card-header {
    min-height: 48px;
    padding: 12px 16px !important;
  }
  
  .card-title-text {
    font-size: 0.875rem;
    padding-right: 70px; 
  }
  
  .icon-size {
    font-size: 18px;
    margin-right: 8px;
  }
  
  .view-all-btn {
    font-size: 0.75rem;
    padding: 4px 8px;
    height: 28px;
    min-width: 65px;
    display: none;
  }
  
  .btn-text {
    font-size: 0.75rem;
  }
  
  .timeline-content {
    padding: 12px 16px !important;
  }
  
  /* Timeline adjustments for mobile */
  :deep(.v-timeline-item__dot) {
    transform: scale(0.8);
  }
  
  :deep(.v-timeline-item__body) {
    padding-inline-start: 12px !important;
  }
  
  :deep(.v-timeline-item__opposite) {
    display: none;
  }
  
  .description {
    font-size: 0.75rem;
  }
  
  .user-action {
    font-size: 0.75rem;
  }
}

/* Very small devices (below 380px) - Hide clock icon */
@media (max-width: 380px) {
  .coming-soon-chip {
    top: 6px;
    right: 6px;
    padding: 1px 4px;
    height: 22px;
    max-width: 75px;
  }
  
  /* Hide the icon container on Vuetify chip */
  :deep(.coming-soon-chip .v-chip__prepend) {
    display: none !important;
  }
  
  .chip-text {
    font-size: 0.6rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 65px;
  }
  
  .card-header {
    padding: 10px 12px !important;
    min-height: 44px;
  }
  
  .card-title-text {
    font-size: 0.8rem;
    padding-right: 60px;
    max-width: calc(100% - 60px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .view-all-btn {
    display: none;
  }
  
  .icon-size {
    font-size: 16px;
    margin-right: 6px;
  }
  
  .timeline-content {
    padding: 10px 12px !important;
  }
  
  .description {
    font-size: 0.7rem;
  }
}

/* Extreme small devices */
@media (max-width: 338px) {
  .coming-soon-chip {
    top: 4px;
    right: 4px;
    padding: 1px 3px;
    height: 20px;
    max-width: 65px;
  }
  
  .chip-text {
    font-size: 0.55rem;
    max-width: 55px;
  }
  
  .card-header {
    padding: 8px 10px !important;
    min-height: 40px;
  }
  
  .card-title-text {
    font-size: 0.75rem;
    padding-right: 50px;
    max-width: calc(100% - 50px);
  }
  
  .icon-size {
    font-size: 14px;
    margin-right: 4px;
  }
  
  .timeline-content {
    padding: 8px 10px !important;
  }
  
  .description {
    font-size: 0.65rem;
  }
  
  .user-action {
    font-size: 0.65rem;
  }
  
  /* Make names shorter on extreme small screens */
  .team-members span {
    font-size: 0.6rem;
  }
}

/* Super extreme small devices (below 300px) */
@media (max-width: 300px) {
  .coming-soon-chip {
    max-width: 55px;
  }
  
  .chip-text {
    max-width: 45px;
    font-size: 0.5rem;
  }
  
  .card-title-text {
    padding-right: 45px;
    max-width: calc(100% - 45px);
    font-size: 0.7rem;
  }
  
  .icon-size {
    font-size: 12px;
    margin-right: 3px;
  }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 960px) {
  .card-header {
    min-height: 52px;
  }
  
  .card-title-text {
    font-size: 1.125rem;
    padding-right: 90px;
  }
  
  .icon-size {
    font-size: 22px;
  }
  
  .timeline-content {
    padding: 16px 20px !important;
  }
  
  .view-all-btn {
    display: inline-flex; 
  }
}

/* Desktop */
@media (min-width: 961px) {
  .activity-card {
    min-height: 500px;
  }
  
  .card-header {
    min-height: 60px;
  }
  
  .card-title-text {
    font-size: 1.25rem;
    padding-right: 100px;
  }
  
  .timeline-content {
    padding: 20px 24px !important;
  }
  
  .view-all-btn {
    display: inline-flex;
  }
}

/* Very small devices (below 380px) - Hide clock icon */
@media (max-width: 380px) {
  .coming-soon-chip {
    top: 6px;
    right: 6px;
    padding: 1px 4px;
    height: 22px;
    max-width: 75px;
    justify-content: center !important;
  }
  
  /* Hide the icon container on Vuetify chip */
  :deep(.coming-soon-chip .v-chip__prepend) {
    display: none !important;
  }
  
  .chip-text {
    font-size: 0.6rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 65px;
    text-align: center;
    margin: 0 auto;
  }
}

/* Ensure touch-friendly targets */
@media (max-width: 960px) {
  :deep(.v-timeline-item__dot) {
    min-width: 20px;
    min-height: 20px;
  }
}
</style>