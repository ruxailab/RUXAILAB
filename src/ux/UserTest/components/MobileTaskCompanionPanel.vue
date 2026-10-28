<template>
  <v-card variant="outlined" class="mobile-task-panel" rounded="lg">
    <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-4'">
      <v-alert
        v-if="error"
        type="warning"
        variant="tonal"
        class="mb-4"
        density="comfortable"
      >
        {{ t('UserTestView.TaskStep.mobileInstructions.couldNotStart') }}
      </v-alert>

      <p v-if="desktopOnly" class="text-body-2 text-grey-darken-2 mb-0">
        {{ t('UserTestView.TaskStep.mobileInstructions.desktopOnly') }}
      </p>

      <div v-else-if="!error || pairingPath" class="text-center">
        <p class="text-body-2 text-grey-darken-3 mb-3">
          {{ t('UserTestView.TaskStep.mobileInstructions.scan') }}
        </p>
        <v-progress-circular
          v-if="busy || !qrDataUrl"
          indeterminate
          color="primary"
          size="32"
        />
        <img
          v-else
          :src="qrDataUrl"
          :alt="t('UserTestView.TaskStep.mobileInstructions.qrAlt')"
          class="mobile-task-panel__qr"
        />
        <div v-if="pairingPath" class="mt-3">
          <v-chip
            :color="connected ? 'success' : 'warning'"
            variant="tonal"
            size="small"
          >
            {{
              connected
                ? t('UserTestView.TaskStep.mobileInstructions.connected')
                : t('UserTestView.TaskStep.mobileInstructions.waitingForPhone')
            }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'

const props = defineProps({
  busy: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  pairingPath: { type: String, default: '' },
  connected: { type: Boolean, default: false },
  desktopOnly: { type: Boolean, default: false },
})

const { t } = useI18n()
const qrDataUrl = ref('')

watch(
  () => props.pairingPath,
  async (pairingPath) => {
    if (!pairingPath || typeof window === 'undefined') {
      qrDataUrl.value = ''
      return
    }
    try {
      qrDataUrl.value = await QRCode.toDataURL(
        `${window.location.origin}${pairingPath}`,
        { margin: 1, width: 220, errorCorrectionLevel: 'M' },
      )
    } catch {
      qrDataUrl.value = ''
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.mobile-task-panel {
  background: #fff;
}

.mobile-task-panel__qr {
  width: 220px;
  height: 220px;
  max-width: 100%;
}
</style>
