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
      <v-spacer />
      <v-btn
        v-if="viewAllRoute"
        :to="viewAllRoute"
        variant="text"
        size="small"
        color="primary"
      >
        View All
      </v-btn>
    </v-card-title>
    <v-card-text class="pa-0">
      <v-timeline
        direction="vertical"
        density="comfortable"
        class="pa-4"
      >
        <v-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :dot-color="getActionDotColor(activity.action)"
          size="small"
          class="mb-3"
          side="start"
        >
          <template #opposite>
            <div class="time-opposite text-caption text-medium-emphasis">
              {{ formatActivityTime(activity) }}
            </div>
          </template>
          <div class="text-body-2">
            <strong>{{ activity.user }}</strong>
            <span class="mx-1">{{ activity.action }}</span>
          </div>
          <div class="text-body-2 study-name text-medium-emphasis">
            {{ activity.target }}
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    activities: { type: Array, default: () => [] }, // { id, user, action, target, timestamp? }
    viewAllRoute: { type: String, default: '/activities' }
})

// Helper to create past timestamps (minutes offset)
function minutesAgo(m) { return Date.now() - m * 60000 }

const defaultActivities = [
    { id: 1, timestamp: minutesAgo(2), user: 'Sarah Chen', action: 'creó', target: 'Mobile Banking UX Study' },
    { id: 2, timestamp: minutesAgo(15), user: 'Alex Rivera', action: 'editó', target: 'Card Sorting E-commerce' },
    { id: 3, timestamp: minutesAgo(60), user: 'Emma Thompson', action: 'eliminó', target: 'Old Landing Page Test' },
    { id: 4, timestamp: minutesAgo(180), user: 'David Park', action: 'compartió', target: 'Accessibility Participant List' }
]

function getActionDotColor(action) {
    const a = (action || '').toLowerCase()
    if (/(crear|creó|create|created|nuevo|nueva|añadió|agregó)/.test(a)) return 'success'
    if (/(eliminar|eliminó|borró|delete|deleted|removed)/.test(a)) return 'error'
    if (/(editar|editó|edit|updated|actualizó)/.test(a)) return 'warning'
    if (/(compartir|compartió|share|shared)/.test(a)) return 'info'
    return 'primary'
}

function formatActivityTime(act) {
    const ts = act.timestamp || act.time || Date.now()
    const d = new Date(ts)
    const datePart = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${datePart} ${timePart}`
}

const activities = computed(() => (props.activities.length ? props.activities : defaultActivities))
</script>

<style scoped>
.study-name {
    margin-top: 2px;
}

.time-opposite {
    min-width: 70px;
    text-align: right;
}
</style>
