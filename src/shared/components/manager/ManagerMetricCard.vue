<template>
  <v-card class="study-card study-card-primary-blur" elevation="8">
    <v-card-text class="pa-4">
      <div class="d-flex justify-space-between align-center">
        <div class="flex-grow-1">
          <h3 class="card-title-small mb-1 text-white">
            {{ title }}
          </h3>
          <div class="metric-value-small text-white">
            {{ value }}
          </div>
          <span
            v-if="subtitle"
            class="progress-text-small text-white opacity-90"
          >
            {{ subtitle }}
          </span>
        </div>
        <div class="icon-container-small">
          <v-icon size="20" color="white">{{ icon }}</v-icon>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.study-card {
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%) !important;
  min-height: 110px !important;
  max-height: 120px !important;
}

.study-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

.study-card-primary-blur {
  background: rgba(var(--v-theme-primary), 0.95) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

.card-title-small {
  font-size: 0.875rem !important;
  font-weight: 700 !important;
  color: white !important;
  line-height: 1.2 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.metric-value-small {
  font-size: 1.75rem !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  margin-bottom: 2px !important;
  color: white !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
}

.progress-text-small {
  font-size: 0.75rem !important;
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

.icon-container-small {
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  background: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 2px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

@media (max-width: 960px) {
  .study-card {
    min-height: 100px !important;
    max-height: 110px !important;
  }

  .metric-value-small {
    font-size: 1.25rem !important;
  }

  .icon-container-small {
    width: 32px !important;
    height: 32px !important;
  }
}

@media (max-width: 600px) {
  .study-card {
    min-height: 90px !important;
    max-height: 100px !important;
  }

  .metric-value-small {
    font-size: 1.1rem !important;
  }

  .card-title-small {
    font-size: 0.8rem !important;
  }

  .progress-text-small {
    font-size: 0.65rem !important;
  }
}
</style>
