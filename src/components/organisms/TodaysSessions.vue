<template>
    <div class="todays-sessions">
        <div v-if="sessions.length === 0" class="empty-state text-center py-4">
            <v-icon icon="mdi-calendar-blank" size="32" color="grey-lighten-2" class="mb-2"></v-icon>
            <p class="text-body-2 text-grey-darken-1">No sessions scheduled for today</p>
        </div>

        <div v-else class="sessions-list">
            <div v-for="session in sessions" :key="session.id" class="session-item">
                <div class="session-time">
                    <v-chip size="small" :color="getTimeChipColor(session.status)" variant="tonal">
                        {{ session.time }}
                    </v-chip>
                </div>

                <div class="session-content">
                    <div class="session-header d-flex align-center justify-space-between">
                        <h4 class="text-subtitle-2 font-weight-medium text-grey-darken-4">
                            {{ session.title }}
                        </h4>
                        <v-icon :icon="getStatusIcon(session.status)" :color="getStatusColor(session.status)"
                            size="16"></v-icon>
                    </div>

                    <p class="text-body-2 text-grey-darken-2 mb-2">
                        Participant: {{ session.participant }}
                    </p>

                    <v-chip size="x-small" :color="getStatusColor(session.status)" variant="tonal">
                        {{ formatStatus(session.status) }}
                    </v-chip>
                </div>
            </div>
        </div>

        <div v-if="sessions.length > 0" class="mt-3 text-center">
            <v-btn variant="text" color="primary" size="small" @click="$router.push('/admin?section=sessions')">
                View All Sessions
            </v-btn>
        </div>
    </div>
</template>

<script setup>
defineProps({
    sessions: {
        type: Array,
        default: () => []
    }
})

const getTimeChipColor = (status) => {
    return status === 'completed' ? 'success' : 'primary'
}

const getStatusIcon = (status) => {
    const icons = {
        'completed': 'mdi-check-circle',
        'upcoming': 'mdi-clock-outline',
        'in-progress': 'mdi-play-circle',
        'cancelled': 'mdi-cancel'
    }
    return icons[status] || 'mdi-help-circle'
}

const getStatusColor = (status) => {
    const colors = {
        'completed': 'success',
        'upcoming': 'warning',
        'in-progress': 'primary',
        'cancelled': 'error'
    }
    return colors[status] || 'grey'
}

const formatStatus = (status) => {
    const labels = {
        'completed': 'Completed',
        'upcoming': 'Upcoming',
        'in-progress': 'In Progress',
        'cancelled': 'Cancelled'
    }
    return labels[status] || status
}
</script>

<style scoped>
.sessions-list {
    max-height: 300px;
    overflow-y: auto;
}

.session-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.session-item:last-child {
    border-bottom: none;
}

.session-time {
    min-width: 80px;
}

.session-content {
    flex: 1;
}

.session-header {
    margin-bottom: 4px;
}
</style>
