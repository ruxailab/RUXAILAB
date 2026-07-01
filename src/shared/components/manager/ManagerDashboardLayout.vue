<template>
  <v-container v-if="test" class="dashboard-container">
    <v-row class="dashboard-main-row">
      <v-col cols="12" lg="6">
        <div class="dashboard-header gradient-header">
          <div class="header-content">
            <div class="d-flex align-center mb-3">
              <div class="header-icon-container mr-3">
                <v-icon color="white" size="28">{{ icon }}</v-icon>
              </div>
              <div class="flex-grow-1">
                <h1 class="dashboard-title text-white mb-0">
                  {{ title }}
                </h1>
                <p class="dashboard-subtitle text-white opacity-90 mb-0">
                  {{ subtitle }}
                </p>
              </div>
            </div>

            <div class="header-chips">
              <v-chip
                class="dashboard-chip"
                color="rgba(255,255,255,0.2)"
                variant="outlined"
                size="small"
              >
                <v-icon start size="16" color="white">{{ typeIcon }}</v-icon>
                <span class="text-white">{{ typeLabel }}</span>
              </v-chip>

              <v-chip
                class="dashboard-chip"
                color="rgba(255,255,255,0.15)"
                variant="outlined"
                size="small"
              >
                <v-icon start size="16" color="white">{{ statusIcon }}</v-icon>
                <span class="text-white">{{ statusText }}</span>
              </v-chip>

              <v-chip
                v-for="chip in extraChips"
                :key="chip.label"
                class="dashboard-chip"
                color="rgba(255,255,255,0.15)"
                variant="outlined"
                size="small"
              >
                <v-icon v-if="chip.icon" start size="16" color="white">
                  {{ chip.icon }}
                </v-icon>
                <span class="text-white">{{ chip.label }}</span>
              </v-chip>
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" lg="6" class="study-overview-column">
        <div class="study-overview-wrapper">
          <slot name="overview" />
        </div>
      </v-col>
    </v-row>

    <div class="section-header">
      <h2 class="section-title">
        <v-icon class="section-icon">mdi-view-dashboard</v-icon>
        {{ modulesTitle }}
      </h2>
      <p class="section-description">
        {{ modulesDescription }}
      </p>
    </div>

    <v-row class="modules-section">
      <slot name="modules" />
    </v-row>
  </v-container>
</template>

<script setup>
defineProps({
  test: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'mdi-chart-box-outline',
  },
  typeLabel: {
    type: String,
    required: true,
  },
  typeIcon: {
    type: String,
    default: 'mdi-information-outline',
  },
  statusText: {
    type: String,
    required: true,
  },
  statusIcon: {
    type: String,
    required: true,
  },
  extraChips: {
    type: Array,
    default: () => [],
  },
  modulesTitle: {
    type: String,
    required: true,
  },
  modulesDescription: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.dashboard-container {
  margin-left: auto !important;
  margin-right: auto !important;
  width: 85% !important;
  max-width: 1400px !important;
  padding: 32px 24px !important;
}

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

.gradient-header::before,
.modules-section :deep(.clickable-header::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  opacity: 0.1;
  pointer-events: none;
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
  width: 100%;
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

.dashboard-chip {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  padding: 12px 20px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  backdrop-filter: blur(10px) !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease;
}

.dashboard-chip:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-1px);
}

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

.dashboard-main-row {
  align-items: stretch !important;
  margin: 0 !important;
  min-height: 320px !important;
}

.dashboard-main-row > .v-col {
  padding: 0 12px !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 320px !important;
}

.study-overview-column {
  display: flex !important;
  align-items: center !important;
  min-height: 320px !important;
}

.study-overview-wrapper {
  width: 100%;
  margin-top: 0 !important;
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
}

.study-overview-wrapper :deep(.v-row) {
  margin: 0 !important;
  align-items: stretch !important;
}

.study-overview-wrapper :deep(.v-col) {
  padding: 8px !important;
}

.modules-section {
  margin-bottom: 32px !important;
}

.modules-section :deep(.v-card) {
  min-height: 320px !important;
  display: flex !important;
  flex-direction: column !important;
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

.modules-section :deep(.clickable-header) {
  margin: -20px -20px 20px -20px !important;
  padding: 16px !important;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  ) !important;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.modules-section :deep(.clickable-header > *) {
  position: relative;
  z-index: 1;
}

.modules-section :deep(.header-icon) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px;
  color: white !important;
  width: 44px !important;
  height: 44px !important;
  backdrop-filter: blur(10px);
}

.modules-section :deep(.clickable-title) {
  color: white !important;
  background: transparent !important;
  border-bottom: 0 !important;
  padding: 0 0 0 12px !important;
}

.modules-section :deep(.clickable-header:hover .header-icon),
.modules-section :deep(.clickable-header:hover .clickable-title) {
  color: white !important;
}

.modules-section :deep(.clickable-header .v-chip) {
  color: white !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.modules-section :deep(.v-card-text) {
  padding: 20px !important;
  flex: 1 !important;
  min-height: 0 !important;
  overflow-y: auto !important;
}

.modules-section :deep(.v-card-actions) {
  padding: 16px 20px !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
  background: #fafbfc !important;
}

.modules-section :deep(.v-progress-linear) {
  border-radius: 8px !important;
  overflow: hidden !important;
}

.modules-section :deep(.v-chip) {
  font-weight: 500 !important;
  border-radius: 8px !important;
}

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

  .dashboard-main-row,
  .dashboard-main-row > .v-col,
  .study-overview-column {
    min-height: 280px !important;
  }

  .dashboard-header {
    min-height: 200px !important;
  }

  .header-content {
    text-align: center;
  }

  .header-content > .d-flex {
    justify-content: center;
  }

  .header-chips {
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

  .dashboard-main-row,
  .dashboard-main-row > .v-col,
  .study-overview-column {
    min-height: 240px !important;
  }

  .dashboard-header {
    padding: 24px 20px;
    min-height: 180px !important;
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

  .dashboard-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
