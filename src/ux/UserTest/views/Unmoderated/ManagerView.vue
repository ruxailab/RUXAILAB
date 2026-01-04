<template>
  <div>
    <!-- ManagerView genérica mantenida -->
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="bottomCards"
    >
      <!-- Dashboard profesional con componentes específicos -->
      <v-container v-if="test" class="dashboard-container">
        <!-- Main Dashboard Layout: Two Columns -->
        <v-row class="dashboard-main-row">
          <!-- Left Column: Dashboard Header -->
          <v-col cols="12" lg="6">
            <!-- Dashboard Header with Gradient -->
            <div class="dashboard-header gradient-header">
              <div class="header-content">
                <div class="d-flex align-center mb-3">
                  <div class="header-icon-container mr-3">
                    <v-icon color="white" size="28"
                      >mdi-chart-box-outline</v-icon
                    >
                  </div>
                  <div class="flex-grow-1">
                    <h1 class="dashboard-title text-white mb-0">
                      {{ test.testTitle || 'User Test Study' }}
                    </h1>
                    <p class="dashboard-subtitle text-white opacity-90 mb-0">
                      {{ test.testDescription || 'User Test Study' }}
                    </p>
                  </div>
                </div>
                <div class="header-chips">
                  <v-chip
                    class="test-type-chip"
                    color="rgba(255,255,255,0.2)"
                    variant="outlined"
                    size="small"
                  >
                    <v-icon start size="16" color="white">
                      mdi-account-check-outline
                    </v-icon>
                    <span class="text-white">Unmoderated Study</span>
                  </v-chip>
                  <v-chip
                    class="status-chip"
                    color="rgba(255,255,255,0.15)"
                    variant="outlined"
                    size="small"
                  >
                    <v-icon start size="16" color="white">
                      {{ getStatusIcon(test.testStatus) }}
                    </v-icon>
                    <span class="text-white">{{
                      test.testStatus || 'Active'
                    }}</span>
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right Column: Study Overview -->
          <v-col cols="12" lg="6" class="study-overview-column">
            <!-- Las 4 cards de métricas -->
            <div class="study-overview-wrapper">
              <StudyOverview :test="test" />
            </div>
          </v-col>
        </v-row>

        <!-- Management Modules Section (Full Width) -->
        <div class="section-header">
          <h2 class="section-title">
            <v-icon class="section-icon">mdi-view-dashboard</v-icon>
            Management Modules
          </h2>
          <p class="section-description">
            Comprehensive tools to manage participants, tasks, settings, and
            analyze your study data
          </p>
        </div>

        <!-- Modules Grid: 3x2 layout -->
        <v-row class="modules-section">
          <!-- Row 1 -->
          <v-col cols="12" md="6">
            <ParticipantsInfo :test="test" />
          </v-col>
          <v-col cols="12" md="6">
            <TasksInfo :test="test" />
          </v-col>

          <!-- Row 2 -->
          <v-col cols="12" md="6">
            <StorageInfo :test="test" />
          </v-col>
          <v-col cols="12" md="6">
            <!-- Empty slot for future components -->
            <v-card
              class="h-100 d-flex align-center justify-center"
              variant="outlined"
              style="min-height: 200px"
            >
              <div class="text-center text-grey-lighten-1">
                <v-icon size="48" class="mb-2">
                  mdi-plus-circle-outline
                </v-icon>
                <p class="text-body-2">Space for additional modules</p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </ManagerView>
  </div>
</template>

<script setup>
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  getBottomCardsDefualt,
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'

// Manager components
import StudyOverview from '@/ux/UserTest/components/manager/StudyOverview.vue'
import ParticipantsInfo from '@/ux/UserTest/components/manager/ParticipantsInfo.vue'
import TasksInfo from '@/ux/UserTest/components/manager/TasksInfo.vue'
import StorageInfo from '@/ux/UserTest/components/manager/StorageInfo.vue'

// Stores
const store = useStore()
const route = useRoute()
const router = useRouter()

// Computed
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value
  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  if (coop) return coop.accessLevel

  // Fixed logic: Public studies allow guest access, private studies block non-collaborators
  if (currentTest?.isPublic) {
    return ACCESS_LEVEL.GUEST // Public studies: allow as guest
  } else {
    return null // Private studies: no access for non-collaborators
  }
})

watchEffect(() => {
  if (user.value != null && test.value != null) {
    // Allow ADMIN, EVALUATOR, and GUEST (for public studies)
    const hasAccess =
      accessLevel.value === ACCESS_LEVEL.ADMIN ||
      accessLevel.value === ACCESS_LEVEL.EVALUATOR ||
      accessLevel.value === ACCESS_LEVEL.GUEST

    if (!hasAccess || accessLevel.value === null) {
      router.push('/')
    }
  }
})

const topCards = computed(() => {
  if (!test.value) return []
  return getTopCardsDefualt(test.value, 'userTest/unmoderated')
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return getBottomCardsDefualt(test.value, 'userTest/unmoderated')
})

const navigator = computed(() => {
  if (!test.value) return []
  const items = [
    ...getNavigatorDefault(
      test.value,
      accessLevel.value,
      route,
      'userTest/unmoderated',
    ),
  ]

  return items
})

// Methods para los componentes adicionales
const getStatusColor = (status) => {
  const statusMap = {
    Active: 'success',
    Draft: 'warning',
    Completed: 'info',
    Archived: 'error',
  }
  return statusMap[status] || 'primary'
}

const getStatusIcon = (status) => {
  const iconMap = {
    Active: 'mdi-play-circle',
    Draft: 'mdi-pencil-circle',
    Completed: 'mdi-check-circle',
    Archived: 'mdi-archive',
  }
  return iconMap[status] || 'mdi-information'
}

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  margin-left: auto !important;
  margin-right: auto !important;
  width: 85% !important;
  max-width: 1400px !important;
  padding: 32px 24px !important;
}

/* Header Styling */
.dashboard-header {
  border-radius: 20px;
  padding: 32px 28px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  min-height: 240px !important;
  display: flex !important;
  align-items: center !important;
  transition: all 0.3s ease;
}

.dashboard-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.gradient-header {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
}

.gradient-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
}

.header-icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.title-section {
  flex: 1;
}

.dashboard-title {
  font-size: 2.5rem !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
  margin-bottom: 12px !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-subtitle {
  font-size: 1.1rem !important;
  opacity: 0.9;
  margin: 0 !important;
  max-width: 600px;
  line-height: 1.5;
}

.header-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.test-type-chip,
.status-chip {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease;
}

.test-type-chip:hover,
.status-chip:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-1px);
}

.test-type-chip,
.status-chip {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  padding: 12px 20px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  backdrop-filter: blur(10px) !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

/* Section Headers */
.section-header {
  margin: 48px 0 32px 0;
  text-align: center;
}

.section-title {
  font-size: 2rem !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
  margin-bottom: 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.section-icon {
  color: var(--v-theme-primary) !important;
  font-size: 2rem !important;
}

.section-description {
  font-size: 1.1rem !important;
  color: #64748b !important;
  margin: 0 !important;
  font-weight: 400;
}

.dashboard-main-row > .v-col {
  padding: 0 12px !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 320px !important;
}

.study-overview-wrapper {
  width: 100%;
  margin-top: 0 !important;
  flex: 1 !important;
  display: flex !important;
}

.study-overview-wrapper :deep(.v-row) {
  margin: 0 !important;
  align-items: stretch !important;
}

.study-overview-wrapper :deep(.v-col) {
  padding: 8px !important;
}

/* Module Cards Styling */
.modules-section {
  margin-bottom: 32px !important;
}

.modules-section :deep(.v-card) {
  height: 320px !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden;
}

.modules-section :deep(.v-card:hover) {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

.modules-section :deep(.v-card-title) {
  font-size: 1.2rem !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
  padding: 20px 20px 12px 20px !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.modules-section :deep(.v-card-text) {
  padding: 20px !important;
  height: calc(100% - 120px) !important;
  overflow-y: auto !important;
}

.modules-section :deep(.v-card-actions) {
  padding: 16px 20px !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
  background: #fafbfc !important;
}

/* Progress bars and chips styling */
.modules-section :deep(.v-progress-linear) {
  border-radius: 8px !important;
  overflow: hidden !important;
}

.modules-section :deep(.v-chip) {
  font-weight: 500 !important;
  border-radius: 8px !important;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .dashboard-container {
    width: 90% !important;
  }
}

@media (max-width: 1200px) {
  .dashboard-container {
    width: 95% !important;
    padding: 24px 16px !important;
  }

  .dashboard-header {
    padding: 32px 24px;
  }

  .dashboard-title {
    font-size: 2rem !important;
  }
}

@media (max-width: 960px) {
  .dashboard-container {
    width: 98% !important;
  }

  .dashboard-main-row {
    min-height: 280px !important;
  }

  .dashboard-main-row > .v-col {
    min-height: 280px !important;
  }

  .dashboard-header {
    min-height: 200px !important;
  }

  .study-overview-column {
    min-height: 280px !important;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }

  .header-chips {
    flex-direction: row;
    justify-content: center;
  }

  .section-title {
    font-size: 1.75rem !important;
  }

  .modules-section :deep(.v-card) {
    height: auto !important;
    min-height: 280px !important;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 16px 8px !important;
  }

  .dashboard-main-row {
    min-height: 240px !important;
  }

  .dashboard-main-row > .v-col {
    min-height: 240px !important;
  }

  .dashboard-header {
    padding: 24px 20px;
    min-height: 180px !important;
  }

  .study-overview-column {
    min-height: 240px !important;
  }

  .dashboard-title {
    font-size: 1.75rem !important;
  }

  .dashboard-subtitle {
    font-size: 1rem !important;
  }

  .header-chips {
    flex-direction: column;
    width: 100%;
  }

  .test-type-chip,
  .status-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
