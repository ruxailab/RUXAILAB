<template>
  <PageWrapper
    :title="t('storage.pageTitle')"
    :loading="loading"
    :side-gap="true"
  >
    <template #subtitle>
      <div class="d-flex align-center flex-wrap ga-2 mt-2 mb-4">
        <v-icon
          icon="mdi-database"
          size="small"
          class="text-medium-emphasis"
        />
        <span class="text-body-1 text-grey-darken-1">
          {{ t('storage.studyDescription') }}
        </span>
        <v-chip color="primary" variant="tonal" size="small">
          {{ studyTitle }}
        </v-chip>
      </div>
    </template>

    <v-row class="mb-2 storage-summary">
      <v-col
        v-for="metric in summaryMetrics"
        :key="metric.key"
        cols="12"
        sm="4"
        lg="3"
      >
        <v-card class="h-100 summary-card" elevation="0" border>
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-overline">{{ metric.title }}</span>
              <v-avatar :color="metric.color" variant="tonal" size="38">
                <v-icon :icon="metric.icon" size="21" />
              </v-avatar>
            </div>
            <div class="text-h5 font-weight-bold">{{ metric.value }}</div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ metric.subtitle }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="analysis-card rounded-lg mb-6" elevation="0" border>
      <v-card-title class="px-6 pt-5 text-h6 font-weight-bold">
        {{ t('storage.storageAnalysis') }}
      </v-card-title>
      <v-card-text class="px-6 pb-6">
        <div class="d-flex justify-space-between text-body-2 mb-2">
          <span>{{ t('storage.accountStorage') }}</span>
          <span>
            {{ formatBytes(accountUsedBytes) }} /
            {{ formatBytes(storageQuotaBytes) }}
          </span>
        </div>
        <v-progress-linear
          :model-value="accountUsagePercentage"
          :color="usageColor"
          height="12"
          rounded
        />

        <v-row class="mt-5">
          <v-col
            v-for="item in typeBreakdown"
            :key="item.type"
            cols="12"
            sm="4"
            md="4"
          >
            <div class="breakdown-item pa-4">
              <div class="d-flex align-center ga-3">
                <v-avatar :color="item.color" variant="tonal" size="36">
                  <v-icon :icon="item.icon" size="20" />
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex justify-space-between">
                    <span class="font-weight-medium">
                      {{ fileTypeLabel(item.type) }}
                    </span>
                    <span>{{ formatBytes(item.size) }}</span>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ t('storage.fileCount', { count: item.count }) }}
                  </div>
                </div>
              </div>
              <v-progress-linear
                :model-value="item.percentage"
                :color="item.color"
                height="6"
                rounded
                class="mt-3"
              />
            </div>
          </v-col>
        </v-row>

        <v-alert
          v-if="unknownSizeCount"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          {{ t('storage.unknownSizeWarning', { count: unknownSizeCount }) }}
        </v-alert>
      </v-card-text>
    </v-card>

    <v-card
      class="files-card rounded-lg d-none d-sm-block"
      elevation="2"
    >
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
          {{ item.sizeKnown ? formatBytes(item.size) : t('storage.unknownSize') }}
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
              <div class="text-body-2 mt-1">{{ formatFileDate(item.date) }}</div>
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
const {
  loading,
  search,
  selectedType,
  previewDialog,
  previewFile,
  deleteDialog,
  fileToDelete,
  storageQuotaBytes,
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
</script>

<style scoped>
.summary-card,
.analysis-card {
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.summary-card {
  border-radius: 12px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.breakdown-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  height: 100%;
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

  .type-filter,
  .search-field {
    flex-basis: 100%;
    max-width: none;
    min-width: 0;
    width: 100%;
  }
}
</style>
