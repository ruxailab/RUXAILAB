<template>
  <div class="studies-overview">
    <div
      v-if="studies.length === 0"
      class="empty-state text-center py-4"
    >
      <v-icon
        icon="mdi-flask-empty"
        size="48"
        color="grey-lighten-2"
        class="mb-2"
      />
      <p class="text-body-2 text-grey-darken-1 mb-2">
        No active studies
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="$router.push('/choose')"
      >
        Create Your First Study
      </v-btn>
    </div>

    <div
      v-else
      class="studies-grid"
    >
      <div
        v-for="study in studies"
        :key="study.id"
        class="study-card"
      >
        <div class="study-header d-flex align-center justify-space-between mb-3">
          <div class="study-info">
            <h4 class="text-subtitle-1 font-weight-medium text-grey-darken-4 mb-1">
              {{ study.title }}
            </h4>
            <div class="d-flex align-center gap-2">
              <v-chip
                size="x-small"
                :color="getStudyTypeColor(study.type)"
                variant="tonal"
              >
                {{ study.type }}
              </v-chip>
              <v-chip
                size="x-small"
                :color="getStatusColor(study.status)"
                variant="tonal"
              >
                {{ formatStatus(study.status) }}
              </v-chip>
            </div>
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            @click="goToStudy(study)"
          />
        </div>

        <div class="study-metrics mb-3">
          <div class="metric-item">
            <v-icon
              icon="mdi-account-group"
              size="16"
              color="grey-darken-1"
              class="mr-1"
            />
            <span class="text-body-2 text-grey-darken-1">{{ study.participants }} participants</span>
          </div>
          <div class="metric-item">
            <v-icon
              icon="mdi-clock-outline"
              size="16"
              color="grey-darken-1"
              class="mr-1"
            />
            <span class="text-body-2 text-grey-darken-1">{{ study.lastActivity }}</span>
          </div>
        </div>

        <div class="completion-progress">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption text-grey-darken-1">Completion</span>
            <span class="text-caption font-weight-medium">{{ study.completion }}%</span>
          </div>
          <v-progress-linear
            :model-value="study.completion"
            :color="getProgressColor(study.completion)"
            height="6"
            rounded
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
    studies: {
        type: Array,
        default: () => []
    }
})

const getStudyTypeColor = (type) => {
    const colors = {
        'Heuristic Evaluation': 'primary',
        'User Test': 'success',
        'Accessibility': 'info',
        'Inquiry': 'warning'
    }
    return colors[type] || 'grey'
}

const getStatusColor = (status) => {
    const colors = {
        'active': 'success',
        'recruiting': 'warning',
        'review': 'info',
        'completed': 'primary',
        'paused': 'grey'
    }
    return colors[status] || 'grey'
}

const formatStatus = (status) => {
    const labels = {
        'active': 'Active',
        'recruiting': 'Recruiting',
        'review': 'In Review',
        'completed': 'Completed',
        'paused': 'Paused'
    }
    return labels[status] || status
}

const getProgressColor = (completion) => {
    if (completion >= 80) return 'success'
    if (completion >= 50) return 'warning'
    return 'error'
}

const goToStudy = (study) => {
    router.push(`/admin?section=studies&id=${study.id}`)
}
</script>

<style scoped>
.studies-grid {
    display: grid;
    gap: 16px;
}

.study-card {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background-color: #fafafa;
    transition: all 0.2s ease-in-out;
}

.study-card:hover {
    border-color: rgb(var(--v-theme-primary));
    background-color: white;
    transform: translateY(-1px);
}

.study-metrics {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.metric-item {
    display: flex;
    align-items: center;
}

.completion-progress {
    margin-top: 8px;
}
</style>
