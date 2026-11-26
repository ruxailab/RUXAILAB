<template>
  <v-dialog :model-value="uploads.length > 0" persistent max-width="480">
    <v-card rounded="xl" class="pa-6">
      <h3 class="text-h6 font-weight-bold text-primary mb-1">
        {{ $t('uploadProgress.title', uploads.length) }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ $t('uploadProgress.keepOpen') }}
      </p>

      <v-alert
        v-if="!online"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ $t('uploadProgress.offline') }}
      </v-alert>

      <div
        v-for="upload in uploads"
        :key="upload.id"
        class="upload-row"
        :aria-label="upload.label"
      >
        <div class="d-flex align-center justify-space-between ga-2">
          <span class="text-body-2 font-weight-medium text-truncate">
            {{ upload.label }}
          </span>
          <span class="text-body-2 font-weight-medium flex-shrink-0">
            {{ percent(upload) }}%
          </span>
        </div>

        <v-progress-linear
          :model-value="percent(upload)"
          :color="upload.status === 'failed' ? 'error' : 'primary'"
          height="8"
          rounded
          class="my-2"
        />

        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <span
            class="text-caption"
            :class="
              upload.status === 'failed' ? 'text-error' : 'text-medium-emphasis'
            "
          >
            {{
              upload.status === 'failed'
                ? $t('uploadProgress.failed')
                : $t('uploadProgress.bytes', {
                    transferred: formatBytes(upload.bytesTransferred, 1),
                    total: formatBytes(upload.totalBytes, 1),
                  })
            }}
          </span>
          <div class="d-flex ga-1">
            <v-btn
              variant="text"
              size="small"
              @click="confirmingId = upload.id"
            >
              {{ $t('uploadProgress.cancel') }}
            </v-btn>
            <v-btn
              v-if="upload.status === 'failed'"
              color="primary"
              variant="flat"
              size="small"
              prepend-icon="mdi-refresh"
              @click="retryUpload(upload.id)"
            >
              {{ $t('uploadProgress.retry') }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>

  <v-dialog :model-value="!!confirmingUpload" persistent max-width="420">
    <v-card v-if="confirmingUpload" rounded="xl" class="pa-6">
      <h3 class="text-h6 font-weight-bold mb-2">
        {{ $t('uploadProgress.confirmCancelTitle') }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        {{
          $t(
            confirmingUpload.replaceable
              ? 'uploadProgress.confirmCancelFile'
              : 'uploadProgress.confirmCancelRecording',
            { label: confirmingUpload.label },
          )
        }}
      </p>
      <div class="d-flex justify-end flex-wrap ga-2">
        <v-btn variant="text" @click="confirmingId = null">
          {{ $t('uploadProgress.keepUploading') }}
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmCancel">
          {{ $t('uploadProgress.confirmCancel') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUploads } from '@/shared/services/uploadManager'
import { formatBytes } from '@/shared/utils/formatUtils'

const { uploads, online, retryUpload, cancelUpload } = useUploads()

// Closes by itself if the upload finishes while the user is deciding.
const confirmingId = ref(null)
const confirmingUpload = computed(() =>
  uploads.find((upload) => upload.id === confirmingId.value),
)

const confirmCancel = () => {
  cancelUpload(confirmingId.value)
  confirmingId.value = null
}

const percent = ({ bytesTransferred, totalBytes }) =>
  totalBytes ? Math.floor((bytesTransferred / totalBytes) * 100) : 0
</script>

<style scoped>
.upload-row + .upload-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
