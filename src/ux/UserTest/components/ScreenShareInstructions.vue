<template>
  <div
    class="screen-share-instructions"
    :class="{ 'screen-share-instructions--compact': compact }"
  >
    <div class="d-flex align-center mb-3">
      <v-icon color="secondary" size="24" class="mr-2">
        mdi-monitor-share
      </v-icon>
      <h3 class="text-h6 font-weight-bold text-secondary">
        {{ t('screenShare.howTo') }}
      </h3>
    </div>

    <p class="text-body-2 text-grey-darken-3 mb-4 screen-share-lead">
      {{ t('screenShare.lead') }}
    </p>

    <div class="picker-demo" role="img" :aria-label="t('screenShare.demoAlt')">
      <div class="picker-window">
        <div class="picker-title">
          {{ t('screenShare.pickerTitle') }}
        </div>
        <div class="picker-tabs">
          <div class="picker-tab picker-tab--tab">
            <v-icon size="16">mdi-tab</v-icon>
            <span>{{ t('screenShare.pickerTab') }}</span>
          </div>
          <div class="picker-tab picker-tab--window">
            <v-icon size="16">mdi-application-outline</v-icon>
            <span>{{ t('screenShare.pickerWindow') }}</span>
          </div>
          <div class="picker-tab picker-tab--screen">
            <v-icon size="16">mdi-monitor</v-icon>
            <span>{{ t('screenShare.pickerEntireScreen') }}</span>
          </div>
        </div>
        <div class="picker-stage">
          <div class="picker-surface picker-surface--wrong">
            <div class="surface-preview surface-preview--tab">
              <span class="surface-label">{{
                t('screenShare.pickerTab')
              }}</span>
            </div>
            <div class="surface-badge surface-badge--wrong">
              {{ t('screenShare.demoDontPick') }}
            </div>
          </div>
          <div class="picker-surface picker-surface--correct">
            <div class="surface-preview surface-preview--monitor">
              <span class="monitor-bezel" />
              <span class="surface-label">{{
                t('screenShare.pickerEntireScreen')
              }}</span>
            </div>
            <div class="surface-badge surface-badge--correct">
              {{ t('screenShare.demoChooseThis') }}
            </div>
          </div>
        </div>
        <div class="picker-actions">
          <span class="picker-btn picker-btn--ghost">
            {{ t('screenShare.pickerCancel') }}
          </span>
          <span class="picker-btn picker-btn--share">
            {{ t('screenShare.pickerShare') }}
          </span>
        </div>
      </div>
    </div>

    <ol class="screen-share-steps mt-4 mb-0">
      <li>{{ t('screenShare.step1') }}</li>
      <li>{{ t('screenShare.step2') }}</li>
      <li>{{ t('screenShare.step3') }}</li>
    </ol>

    <v-alert
      v-if="hasExternalLink"
      class="mt-4 mb-0"
      type="warning"
      variant="tonal"
      density="comfortable"
      icon="mdi-tab-unselected"
    >
      {{ t('screenShare.dontShareTab') }}
    </v-alert>

    <p v-if="showMacHint" class="text-caption text-grey-darken-1 mt-3 mb-0">
      {{ t('screenShare.macHint') }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMacOS } from '@/shared/utils/screenShareCapture'

defineProps({
  hasExternalLink: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
const showMacHint = computed(() => isMacOS())
</script>

<style scoped>
.screen-share-lead {
  line-height: 1.5;
}

.screen-share-steps {
  padding-left: 1.25rem;
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.55;
}

.screen-share-steps li + li {
  margin-top: 6px;
}

.picker-demo {
  background: #eef2f6;
  border-radius: 16px;
  padding: 16px;
}

.picker-window {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
  padding: 14px;
  overflow: hidden;
}

.picker-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.picker-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.picker-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #4b5563;
  background: #f3f4f6;
  border: 2px solid transparent;
  text-align: center;
}

.picker-stage {
  position: relative;
  min-height: 132px;
}

.picker-surface {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.surface-preview {
  width: min(100%, 220px);
  height: 88px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d1d5db;
  background: #f8fafc;
}

.surface-preview--tab {
  height: 72px;
  border-radius: 8px 8px 4px 4px;
}

.surface-preview--monitor {
  position: relative;
  background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
  border-color: #0f172a;
}

.monitor-bezel {
  position: absolute;
  bottom: -8px;
  width: 36px;
  height: 6px;
  border-radius: 0 0 4px 4px;
  background: #0f172a;
}

.surface-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
}

.surface-preview--monitor .surface-label {
  color: #fff;
}

.surface-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.surface-badge--wrong {
  background: #fee2e2;
  color: #b91c1c;
}

.surface-badge--correct {
  background: #dcfce7;
  color: #15803d;
}

.picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.picker-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.picker-btn--ghost {
  background: #f3f4f6;
  color: #4b5563;
}

.picker-btn--share {
  background: rgb(var(--v-theme-primary));
  color: #fff;
}

.picker-tab--tab,
.picker-surface--wrong,
.picker-surface--correct,
.picker-tab--screen,
.picker-btn--share {
  animation-duration: 6s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.picker-tab--tab {
  animation-name: highlightWrongTab;
}

.picker-tab--screen {
  animation-name: highlightCorrectTab;
}

.picker-surface--wrong {
  animation-name: showWrongSurface;
}

.picker-surface--correct {
  animation-name: showCorrectSurface;
}

.picker-btn--share {
  animation-name: pulseShare;
}

.screen-share-instructions--compact .picker-demo {
  padding: 12px;
}

.screen-share-instructions--compact .picker-stage {
  min-height: 118px;
}

@keyframes highlightWrongTab {
  0%,
  38% {
    background: #fee2e2;
    border-color: #ef4444;
    color: #991b1b;
  }
  46%,
  100% {
    background: #f3f4f6;
    border-color: transparent;
    color: #4b5563;
  }
}

@keyframes highlightCorrectTab {
  0%,
  42% {
    background: #f3f4f6;
    border-color: transparent;
    color: #4b5563;
  }
  50%,
  100% {
    background: #dcfce7;
    border-color: #22c55e;
    color: #166534;
  }
}

@keyframes showWrongSurface {
  0%,
  40% {
    opacity: 1;
    visibility: visible;
  }
  48%,
  100% {
    opacity: 0;
    visibility: hidden;
  }
}

@keyframes showCorrectSurface {
  0%,
  42% {
    opacity: 0;
    visibility: hidden;
  }
  50%,
  100% {
    opacity: 1;
    visibility: visible;
  }
}

@keyframes pulseShare {
  0%,
  55% {
    transform: scale(1);
    box-shadow: none;
  }
  68%,
  82% {
    transform: scale(1.05);
    box-shadow: 0 0 0 6px rgba(var(--v-theme-primary), 0.18);
  }
  100% {
    transform: scale(1);
    box-shadow: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .picker-tab--tab,
  .picker-tab--screen,
  .picker-surface--wrong,
  .picker-surface--correct,
  .picker-btn--share {
    animation: none;
  }

  .picker-tab--tab {
    background: #f3f4f6;
    border-color: transparent;
  }

  .picker-tab--screen {
    background: #dcfce7;
    border-color: #22c55e;
    color: #166534;
  }

  .picker-surface--wrong {
    display: none;
  }

  .picker-surface--correct {
    opacity: 1;
    visibility: visible;
  }
}

@media (max-width: 600px) {
  .picker-tab span {
    display: none;
  }

  .picker-tabs {
    gap: 6px;
  }
}
</style>
