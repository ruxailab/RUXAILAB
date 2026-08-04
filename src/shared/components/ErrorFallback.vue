<template>
  <v-container class="error-fallback-container" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="error-card" elevation="0" rounded="xl">
          <v-card-text class="text-center pa-8">
            <!-- Error Icon -->
            <div class="error-icon-wrapper mb-6">
              <v-icon
                size="72"
                color="warning"
                class="error-icon"
              >
                mdi-alert-circle-outline
              </v-icon>
            </div>

            <!-- Title -->
            <h1 class="text-h5 font-weight-bold mb-3 error-title">
              {{ t('errors.boundary.title') }}
            </h1>

            <!-- Message -->
            <p class="text-body-1 text-medium-emphasis mb-8 error-message">
              {{ t('errors.boundary.message') }}
            </p>

            <!-- Action Buttons -->
            <div class="d-flex justify-center ga-3 flex-wrap mb-6">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                rounded="lg"
                prepend-icon="mdi-refresh"
                @click="$emit('retry')"
              >
                {{ t('errors.boundary.retry') }}
              </v-btn>

              <v-btn
                color="secondary"
                variant="outlined"
                size="large"
                rounded="lg"
                prepend-icon="mdi-view-dashboard-outline"
                @click="goToDashboard"
              >
                {{ t('errors.boundary.goToDashboard') }}
              </v-btn>
            </div>
            <v-expansion-panels
              v-if="isDev"
              variant="accordion"
              class="error-details-panel"
            >
              <v-expansion-panel rounded="lg">
                <v-expansion-panel-title class="text-body-2 text-medium-emphasis">
                  <v-icon size="18" class="mr-2">mdi-bug-outline</v-icon>
                  {{ t('errors.boundary.showDetails') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="error-details-content text-left">
                    <div class="detail-row">
                      <span class="detail-label">Error:</span>
                      <span class="detail-value">{{ error?.message || 'Unknown error' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Route:</span>
                      <span class="detail-value">{{ errorRoute || 'N/A' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Component:</span>
                      <span class="detail-value">{{ errorComponent || 'N/A' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Info:</span>
                      <span class="detail-value">{{ errorInfo || 'N/A' }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Time:</span>
                      <span class="detail-value">{{ errorTimestamp || 'N/A' }}</span>
                    </div>

                    <v-divider class="my-3" />

                    <v-btn
                      variant="tonal"
                      size="small"
                      color="primary"
                      rounded="lg"
                      prepend-icon="mdi-content-copy"
                      block
                      @click="copyErrorDetails"
                    >
                      {{ copied ? t('errors.boundary.copied') : t('errors.boundary.copyDetails') }}
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  error: {
    type: Error,
    default: null,
  },
  errorInfo: {
    type: String,
    default: '',
  },
  errorRoute: {
    type: String,
    default: '',
  },
  errorComponent: {
    type: String,
    default: '',
  },
  errorTimestamp: {
    type: String,
    default: '',
  },
})

defineEmits(['retry'])

const router = useRouter()
const { t } = useI18n()
const copied = ref(false)

const isDev = process.env.NODE_ENV !== 'production'

function goToDashboard() {
  // Force a full navigation to clear the error state
  window.location.href = router.resolve({ path: '/' }).href
}

function copyErrorDetails() {
  const details = [
    `Error: ${props.error?.message || 'Unknown error'}`,
    `Route: ${props.errorRoute || 'N/A'}`,
    `Component: ${props.errorComponent || 'N/A'}`,
    `Info: ${props.errorInfo || 'N/A'}`,
    `Time: ${props.errorTimestamp || 'N/A'}`,
    `Stack: ${props.error?.stack || 'N/A'}`,
  ].join('\n')

  navigator.clipboard.writeText(details).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<style scoped>
.error-fallback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(
    135deg,
    rgba(0, 33, 63, 0.03) 0%,
    rgba(255, 66, 90, 0.03) 100%
  );
}

.error-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.error-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.1) 0%,
    rgba(245, 158, 11, 0.05) 100%
  );
}

.error-icon {
  animation: gentle-pulse 2s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.85;
  }
}

.error-title {
  color: #1f2937;
}

.error-message {
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.error-details-panel {
  max-width: 100%;
}

.error-details-content {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

.detail-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  overflow-wrap: anywhere;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 90px;
  flex-shrink: 0;
}

.detail-value {
  color: #1f2937;
}
</style>
