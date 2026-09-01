<template>
  <div
    v-if="shouldShowBanner"
    class="save-status-indicator"
    :class="{ 'status-mini': shifted }"
  >
    <v-card
      elevation="2"
      :class="['status-card', `status-card--${statusType}`]"
    >
      <v-card-text class="status-card-content">
        <div class="status-row">
          <div class="status-copy">
            <div class="status-title-row">
              <div class="status-icon-wrap">
                <v-icon size="20">{{ statusIcon }}</v-icon>
              </div>
              <div>
                <p class="status-eyebrow">{{ title }}</p>
                <p class="status-message">{{ message }}</p>
              </div>
            </div>
            <p
              v-if="lastSaveText && statusType === 'success'"
              class="status-timestamp"
            >
              {{ updatedLabel }} {{ lastSaveText }}
            </p>
            <p v-else class="status-helper">{{ helperMessage }}</p>
          </div>
          <v-progress-circular
            v-if="isSaving"
            indeterminate
            size="24"
            width="3"
            class="status-spinner"
          />
        </div>

        <v-btn
          v-if="showAction"
          size="default"
          variant="outlined"
          class="mt-4 text-none status-action-btn"
          :disabled="isSaving"
          @click="$emit('action')"
        >
          {{ actionLabel }}
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  statusType: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'saving', 'success', 'error'].includes(value),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  lastSaveText: {
    type: String,
    default: '',
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  shifted: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Auto-save',
  },
  helperMessage: {
    type: String,
    default: 'Changes are saved automatically.',
  },
  updatedLabel: {
    type: String,
    default: 'Updated',
  },
  actionLabel: {
    type: String,
    default: 'Save now',
  },
})

defineEmits(['action'])

let successDismissTimer = null
const bannerVisible = ref(false)

const shouldShowBanner = computed(() => bannerVisible.value)

const statusIcon = computed(() => {
  switch (props.statusType) {
    case 'saving':
      return 'mdi-content-save'
    case 'error':
      return 'mdi-alert-circle'
    default:
      return 'mdi-check-circle'
  }
})

const syncBannerVisibility = () => {
  if (
    props.isSaving ||
    props.statusType === 'saving' ||
    props.statusType === 'error'
  ) {
    bannerVisible.value = true
    return
  }

  if (props.statusType === 'success') {
    bannerVisible.value = true
    if (successDismissTimer) {
      clearTimeout(successDismissTimer)
    }
    successDismissTimer = setTimeout(() => {
      bannerVisible.value = false
    }, 1800)
    return
  }

  bannerVisible.value = false
}

watch(
  () => [props.statusType, props.isSaving],
  () => {
    syncBannerVisibility()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (successDismissTimer) {
    clearTimeout(successDismissTimer)
  }
})
</script>

<style scoped>
.save-status-indicator {
  position: fixed;
  top: 76px;
  right: 20px;
  z-index: 999;
  width: min(360px, calc(100vw - 32px));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.save-status-indicator.status-mini {
  right: 80px;
}

.status-card {
  --status-accent: rgb(var(--v-theme-primary));
  --status-soft: rgba(var(--v-theme-primary), 0.1);
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(10, 33, 63, 0.08);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(10, 33, 63, 0.16);
  overflow: hidden;
  animation: fadeIn 0.3s ease-in-out;
}

.status-card::before {
  content: '';
  display: block;
  height: 4px;
  background: linear-gradient(90deg, var(--status-accent) 0%, #fca326 100%);
}

.status-card--saving {
  --status-accent: rgb(var(--v-theme-warning));
  --status-soft: rgba(var(--v-theme-warning), 0.14);
}

.status-card--success {
  --status-accent: rgb(var(--v-theme-success));
  --status-soft: rgba(var(--v-theme-success), 0.14);
}

.status-card--error {
  --status-accent: rgb(var(--v-theme-error));
  --status-soft: rgba(var(--v-theme-error), 0.14);
}

.status-card-content {
  padding: 18px 20px 20px;
}

.status-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.status-copy {
  flex: 1;
  min-width: 0;
}

.status-title-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.status-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--status-soft);
  color: var(--status-accent);
}

.status-eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(10, 33, 63, 0.55);
}

.status-message {
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
  font-weight: 700;
  color: #0a213f;
}

.status-helper,
.status-timestamp {
  margin: 12px 0 0;
  padding-left: 56px;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(10, 33, 63, 0.72);
}

.status-spinner {
  color: var(--status-accent);
}

.status-action-btn {
  margin-left: 56px;
  border-color: rgba(10, 33, 63, 0.16);
  color: #0a213f;
  font-weight: 700;
  letter-spacing: 0.01em;
}

@keyframes fadeIn {
  from {
    opacity: 0.8;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .save-status-indicator,
  .save-status-indicator.status-mini {
    top: auto;
    right: 16px;
    bottom: 20px;
    left: 16px;
    width: auto;
  }

  .status-card-content {
    padding: 16px;
  }

  .status-message {
    font-size: 17px;
  }

  .status-helper,
  .status-timestamp,
  .status-action-btn {
    margin-left: 0;
    padding-left: 0;
  }

  .status-row {
    align-items: center;
  }
}
</style>
