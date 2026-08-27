<template>
  <PageWrapper
    :title="t('storage.pageTitle')"
    :loading="loading"
    :side-gap="true"
  >
    <template #subtitle>
      <div class="d-flex align-center flex-wrap ga-2 mt-2 mb-4">
        <v-icon icon="mdi-database" size="small" class="text-medium-emphasis" />
        <span class="text-body-1 text-grey-darken-1">
          {{ t('storage.studyDescription') }}
        </span>
        <v-chip color="primary" variant="tonal" size="small">
          {{ studyTitle }}
        </v-chip>
      </div>
    </template>

    <v-row class="mb-3 storage-top-grid" align="stretch">
      <v-col cols="12" lg="7">
        <v-row class="storage-summary" dense>
          <v-col
            v-for="metric in summaryMetrics"
            :key="metric.key"
            cols="12"
            sm="6"
          >
            <v-card class="h-100 summary-card" elevation="0" border>
              <v-card-text class="summary-card-content">
                <div class="d-flex align-center ga-3">
                  <v-avatar :color="metric.color" variant="tonal" size="32">
                    <v-icon :icon="metric.icon" size="18" />
                  </v-avatar>
                  <div class="summary-card-copy">
                    <div class="text-caption text-medium-emphasis">
                      {{ metric.title }}
                    </div>
                    <div class="text-h6 font-weight-bold summary-value">
                      {{ metric.value }}
                    </div>
                  </div>
                </div>
                <div
                  class="text-caption text-medium-emphasis mt-2 summary-subtitle"
                >
                  {{ metric.subtitle }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="analysis-card rounded-lg h-100" elevation="0" border>
          <v-card-text class="analysis-content">
            <div class="d-flex align-center justify-space-between ga-3 mb-2">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ t('storage.storageAnalysis') }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ t('storage.accountStorage') }}
                </div>
              </div>
              <div class="d-flex align-center ga-2">
                <div class="text-right">
                  <div class="text-subtitle-2 font-weight-bold">
                    {{ formatBytes(accountUsedBytes) }}
                  </div>
                  <!-- <div class="text-caption text-medium-emphasis">
                    / {{ formatBytes(storageQuotaBytes) }}
                  </div> -->
                </div>
                <v-btn
                  :icon="
                    isStorageAnalysisExpanded
                      ? 'mdi-chevron-up'
                      : 'mdi-chevron-down'
                  "
                  variant="text"
                  size="small"
                  :aria-label="t('storage.storageAnalysis')"
                  @click="
                    isStorageAnalysisExpanded = !isStorageAnalysisExpanded
                  "
                />
              </div>
            </div>
            <v-progress-linear
              :model-value="accountUsagePercentage"
              :color="usageColor"
              height="8"
              rounded
            />

            <v-expand-transition>
              <div v-show="isStorageAnalysisExpanded">
                <v-row class="analysis-breakdown mt-3" dense>
                  <v-col
                    v-for="item in recordingBreakdown"
                    :key="item.type"
                    cols="12"
                    sm="4"
                    lg="12"
                    xl="4"
                  >
                    <div class="breakdown-item">
                      <div class="breakdown-row">
                        <v-avatar :color="item.color" variant="tonal" size="28">
                          <v-icon :icon="item.icon" size="16" />
                        </v-avatar>
                        <div class="breakdown-copy">
                          <div
                            class="breakdown-title text-body-2 font-weight-medium"
                          >
                            {{ fileTypeLabel(item.type) }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ t('storage.fileCount', { count: item.count }) }}
                          </div>
                        </div>
                        <div
                          class="breakdown-size text-body-2 font-weight-bold"
                        >
                          {{ formatBytes(item.size) }}
                        </div>
                      </div>
                      <v-progress-linear
                        :model-value="item.percentage"
                        :color="item.color"
                        height="4"
                        rounded
                        class="mt-1"
                      />
                    </div>
                  </v-col>
                </v-row>

                <v-alert
                  v-if="unknownSizeCount"
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mt-2 compact-alert"
                >
                  {{
                    t('storage.unknownSizeWarning', { count: unknownSizeCount })
                  }}
                </v-alert>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="files-card rounded-lg d-none d-sm-block" elevation="2">
      <v-card-title class="files-header px-6 py-4">
        <span class="text-h6 font-weight-bold">
          {{ t('storage.mediaFiles') }}
        </span>
        <v-spacer />
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          :label="t('storage.searchFiles')"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="search-field"
        />
        <v-select
          v-model="selectedType"
          :items="typeFilterOptions"
          item-title="title"
          item-value="value"
          :label="t('storage.filterByType')"
          density="compact"
          variant="outlined"
          hide-details
          class="type-filter"
        />
      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredFiles"
        :loading="loading"
        item-value="id"
        class="elevation-0"
        hover
      >
        <template #[`item.type`]="{ item }">
          <div class="d-flex align-center ga-2">
            <v-avatar
              :color="fileTypeConfig(item.type).color"
              variant="tonal"
              size="32"
            >
              <v-icon :icon="fileTypeConfig(item.type).icon" size="18" />
            </v-avatar>
            <span>{{ fileTypeLabel(item.type) }}</span>
          </div>
        </template>

        <template #[`item.name`]="{ item }">
          <button class="file-link" type="button" @click="openPreview(item)">
            {{ item.name }}
          </button>
        </template>

        <template #[`item.date`]="{ item }">
          {{ formatFileDate(item.date) }}
        </template>

        <template #[`item.size`]="{ item }">
          {{
            item.sizeKnown ? formatBytes(item.size) : t('storage.unknownSize')
          }}
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            size="small"
            :aria-label="t('storage.previewFile')"
            @click="openPreview(item)"
          />
          <v-btn
            icon="mdi-open-in-new"
            variant="text"
            size="small"
            :aria-label="t('storage.openFile')"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          />
        </template>

        <template #no-data>
          <div class="pa-10 text-center text-medium-emphasis">
            <v-icon size="52" color="grey-lighten-1">
              mdi-database-off-outline
            </v-icon>
            <div class="text-h6 mt-3">{{ t('storage.noMediaFiles') }}</div>
            <div class="text-body-2 mt-1">
              {{ t('storage.noMediaFilesDescription') }}
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <div class="d-sm-none">
      <v-card class="rounded-lg mb-4" elevation="0" border>
        <v-card-title class="text-h6 font-weight-bold px-4 pt-4">
          {{ t('storage.mediaFiles') }}
        </v-card-title>
        <v-card-text class="d-flex flex-column ga-3 px-4 pb-4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="t('storage.searchFiles')"
            density="compact"
            variant="outlined"
            hide-details
            clearable
          />
          <v-select
            v-model="selectedType"
            :items="typeFilterOptions"
            item-title="title"
            item-value="value"
            :label="t('storage.filterByType')"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-card-text>
      </v-card>

      <v-card
        v-for="item in filteredFiles"
        :key="item.id"
        class="storage-file-card mb-4 pa-4"
        variant="flat"
        border
      >
        <div class="d-flex align-start justify-space-between ga-3">
          <div class="d-flex align-center ga-3 file-card-main">
            <v-avatar
              :color="fileTypeConfig(item.type).color"
              variant="tonal"
              size="42"
            >
              <v-icon :icon="fileTypeConfig(item.type).icon" size="22" />
            </v-avatar>
            <div class="file-card-text">
              <button
                class="file-link text-subtitle-1"
                type="button"
                @click="openPreview(item)"
              >
                {{ item.name }}
              </button>
              <div class="text-body-2 text-medium-emphasis">
                {{ fileTypeLabel(item.type) }}
              </div>
            </div>
          </div>

          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                class="text-medium-emphasis"
                v-bind="menuProps"
              />
            </template>
            <v-list min-width="180">
              <v-list-item
                prepend-icon="mdi-eye"
                :title="t('storage.previewFile')"
                @click="openPreview(item)"
              />
              <v-list-item
                prepend-icon="mdi-open-in-new"
                :title="t('storage.openFile')"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
              />
            </v-list>
          </v-menu>
        </div>

        <v-divider class="my-4" />

        <v-row dense>
          <v-col cols="12">
            <v-sheet class="pa-3" color="grey-lighten-4" rounded>
              <div class="text-caption font-weight-bold text-medium-emphasis">
                {{ t('storage.headers.evaluator') }}
              </div>
              <div class="text-body-2 mt-1">{{ item.evaluator }}</div>
            </v-sheet>
          </v-col>
          <v-col cols="6">
            <v-sheet class="pa-3 h-100" color="grey-lighten-4" rounded>
              <div class="text-caption font-weight-bold text-medium-emphasis">
                {{ t('storage.headers.date') }}
              </div>
              <div class="text-body-2 mt-1">
                {{ formatFileDate(item.date) }}
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="6">
            <v-sheet class="pa-3 h-100" color="grey-lighten-4" rounded>
              <div class="text-caption font-weight-bold text-medium-emphasis">
                {{ t('storage.headers.size') }}
              </div>
              <div class="text-body-2 mt-1">
                {{
                  item.sizeKnown
                    ? formatBytes(item.size)
                    : t('storage.unknownSize')
                }}
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <div
        v-if="filteredFiles.length === 0 && !loading"
        class="text-center py-12"
      >
        <v-icon
          icon="mdi-database-off-outline"
          size="64"
          class="text-medium-emphasis mb-4"
        />
        <h3 class="text-h5 font-weight-medium text-medium-emphasis mb-2">
          {{ t('storage.noMediaFiles') }}
        </h3>
        <p class="text-body-1 text-medium-emphasis">
          {{ t('storage.noMediaFilesDescription') }}
        </p>
      </div>
    </div>

    <v-dialog v-model="previewDialog" max-width="900">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon
            v-if="previewFile"
            :icon="fileTypeConfig(previewFile.type).icon"
            class="mr-2"
          />
          <span class="text-truncate">{{ previewFile?.name }}</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            :aria-label="t('buttons.close')"
            @click="previewDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="preview-content">
          <v-img
            v-if="previewFile?.type === 'image'"
            :src="previewFile.url"
            max-height="650"
          />
          <video
            v-else-if="isVideo(previewFile?.type)"
            :src="previewFile?.url"
            controls
            class="media-preview"
          />
          <audio
            v-else-if="previewFile?.type === 'audio'"
            :src="previewFile?.url"
            controls
            class="audio-preview"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="tonal"
            :loading="isDeleting"
            :disabled="isDeleting"
            :aria-label="t('storage.deleteFile')"
            :title="t('storage.deleteFile')"
            @click="confirmDelete(previewFile)"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card class="rounded-lg">
        <v-card-title class="bg-error text-white">
          <v-icon color="white" class="mr-2">mdi-alert</v-icon>
          {{ t('storage.confirmDeletion') }}
        </v-card-title>
        <v-card-text class="pt-4">
          {{
            t('storage.deleteConfirmMessage', {
              type: fileTypeLabel(fileToDelete?.type || 'image'),
              studyName: studyTitle,
            })
          }}
          <div class="text-caption text-medium-emphasis mt-2">
            {{ t('storage.actionCannotBeUndone') }}
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="outlined"
            class="rounded-lg"
            :disabled="isDeleting"
            @click="deleteDialog = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            class="rounded-lg"
            :loading="isDeleting"
            :disabled="isDeleting"
            @click="executeDelete"
          >
            {{ t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </PageWrapper>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { useStorageFiles } from '@/shared/composables/useStorageFiles'

defineProps({
  id: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: null,
  },
})

const { t } = useI18n()
const isStorageAnalysisExpanded = ref(false)
const {
  loading,
  search,
  selectedType,
  previewDialog,
  previewFile,
  deleteDialog,
  fileToDelete,
  // storageQuotaBytes,
  isDeleting,
  studyTitle,
  headers,
  fileTypeConfig,
  fileTypeLabel,
  isVideo,
  typeFilterOptions,
  filteredFiles,
  accountUsedBytes,
  accountUsagePercentage,
  usageColor,
  typeBreakdown,
  unknownSizeCount,
  summaryMetrics,
  formatBytes,
  formatFileDate,
  openPreview,
  confirmDelete,
  executeDelete,
} = useStorageFiles()

const recordingTypes = ['webcam', 'screen', 'audio']

const recordingBreakdown = computed(() =>
  recordingTypes
    .map((type) =>
      typeBreakdown.value.find((breakdown) => breakdown.type === type),
    )
    .filter(Boolean),
)
</script>

<style scoped>
.summary-card,
.analysis-card {
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.storage-top-grid {
  align-items: stretch;
}

.storage-top-grid > .v-col {
  display: flex;
  flex-direction: column;
}

.storage-summary {
  flex: 1;
}

.summary-card {
  border-radius: 10px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card-content {
  padding: 12px 14px !important;
}

.summary-card-copy {
  min-width: 0;
}

.summary-value {
  line-height: 1.15;
}

.summary-subtitle {
  line-height: 1.25;
}

.summary-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07) !important;
}

.analysis-content {
  padding: 14px !important;
}

.analysis-breakdown {
  margin-bottom: -4px;
}

.breakdown-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  height: 100%;
  padding: 10px;
}

.breakdown-row {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.breakdown-copy {
  min-width: 0;
}

.breakdown-title {
  overflow-wrap: anywhere;
}

.breakdown-size {
  min-width: 52px;
  text-align: right;
  white-space: nowrap;
}

.compact-alert {
  font-size: 0.8125rem;
}

.files-card {
  overflow: hidden;
}

.files-header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.type-filter {
  min-width: 200px;
  width: 200px;
}

.search-field {
  flex: 1 1 320px;
  max-width: 500px;
  min-width: 250px;
}

.file-link {
  appearance: none;
  background: transparent;
  border: 0;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.storage-file-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.storage-file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.file-card-main,
.file-card-text {
  min-width: 0;
}

.preview-content {
  align-items: center;
  background: rgb(var(--v-theme-surface-variant));
  display: flex;
  justify-content: center;
  min-height: 320px;
}

.media-preview {
  max-height: 650px;
  width: 100%;
}

.audio-preview {
  width: min(600px, 100%);
}

.v-text-field :deep(.v-field__input),
.v-select :deep(.v-field__input) {
  min-height: 40px !important;
}

@media (max-width: 600px) {
  .storage-summary {
    margin-top: 0;
  }

  .breakdown-row {
    align-items: start;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .breakdown-size {
    grid-column: 2;
    text-align: left;
  }

  .type-filter,
  .search-field {
    flex-basis: 100%;
    max-width: none;
    min-width: 0;
    width: 100%;
  }
}
</style>
