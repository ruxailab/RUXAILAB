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
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { getMetadata, ref as storageRef } from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'
import AnswerController from '@/shared/controllers/AnswerController'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import { showError } from '@/shared/utils/toast'

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024

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

const store = useStore()
const { t, locale } = useI18n()
const answerController = new AnswerController()

const loading = ref(false)
const answerDocument = ref(null)
const filesWithMetadata = ref([])
const search = ref('')
const selectedType = ref('all')
const previewDialog = ref(false)
const previewFile = ref(null)
const deleteDialog = ref(false)
const fileToDelete = ref(null)

const study = computed(() => store.getters.test)
const user = computed(() => store.getters.user)
const storageQuotaBytes = STORAGE_QUOTA_BYTES
const isDeleting = computed(() => store.getters['Storage/isDeleting'])

const studyTitle = computed(
  () => study.value?.testTitle || study.value?.title || t('storage.untitled'),
)

const headers = computed(() => [
  { title: t('storage.headers.type'), key: 'type', width: '150px' },
  { title: t('storage.headers.name'), key: 'name' },
  { title: t('storage.headers.evaluator'), key: 'evaluator' },
  { title: t('storage.headers.date'), key: 'date' },
  { title: t('storage.headers.size'), key: 'size', align: 'end' },
  {
    title: t('storage.headers.actions'),
    key: 'actions',
    align: 'end',
    sortable: false,
  },
])

const fileTypeConfig = (type) => {
  const configs = {
    video: { icon: 'mdi-video', color: 'primary' },
    webcam: { icon: 'mdi-webcam', color: 'success' },
    screen: { icon: 'mdi-monitor-screenshot', color: 'info' },
    audio: { icon: 'mdi-microphone', color: 'orange' },
    image: { icon: 'mdi-image', color: 'purple' },
    document: { icon: 'mdi-file-document', color: 'blue-grey' },
    archive: { icon: 'mdi-archive', color: 'brown' },
    file: { icon: 'mdi-file', color: 'grey' },
  }
  return configs[type] || { icon: 'mdi-file', color: 'grey' }
}

const fileTypeLabel = (type) => t(`storage.types.${type}`)
const isVideo = (type) => ['video', 'webcam', 'screen'].includes(type)

const normalizeCollection = (collection, idKey) => {
  if (Array.isArray(collection)) return collection
  if (!collection || typeof collection !== 'object') return []
  return Object.entries(collection).map(([key, value]) => ({
    ...value,
    [idKey]: value?.[idKey] || key,
  }))
}

const fileNameFromUrl = (url, fallback) => {
  try {
    const encodedPath = url.match(/\/o\/([^?]+)/)?.[1]
    if (!encodedPath) return fallback
    return decodeURIComponent(encodedPath).split('/').pop() || fallback
  } catch {
    return fallback
  }
}

const inferFileType = ({
  contentType = '',
  name = '',
  url = '',
  fallback = 'file',
}) => {
  const mime = contentType.toLowerCase()
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (
    mime === 'application/pdf' ||
    mime.startsWith('text/') ||
    mime.includes('document') ||
    mime.includes('spreadsheet') ||
    mime.includes('presentation')
  ) {
    return 'document'
  }
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('7z') ||
    mime.includes('tar')
  ) {
    return 'archive'
  }

  const source = `${name} ${url}`.toLowerCase().split('?')[0]
  const extension = source.match(/\.([a-z0-9]+)(?:\s|$)/)?.[1]
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension))
    return 'image'
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'].includes(extension))
    return 'video'
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension))
    return 'audio'
  if (
    ['pdf', 'txt', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(
      extension,
    )
  ) {
    return 'document'
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive'
  return fallback
}

const createFile = ({
  id,
  type,
  url,
  size,
  date,
  evaluator,
  fallbackName,
  contentType,
  name,
}) => ({
  id,
  type: inferFileType({
    contentType,
    name,
    url,
    fallback: type || 'file',
  }),
  url,
  size: Number(size) || 0,
  sizeKnown: Number(size) > 0,
  date: Number(date) || 0,
  evaluator: evaluator || t('storage.unknownEvaluator'),
  name: name || fileNameFromUrl(url, fallbackName),
  contentType: contentType || '',
})

const extractUserTestFiles = (answerDoc) => {
  const result = []
  const answers = normalizeCollection(answerDoc?.taskAnswers, 'userDocId')

  answers.forEach((answer, answerIndex) => {
    const tasks = normalizeCollection(answer.tasks, 'taskId')
    tasks.forEach((task, taskIndex) => {
      const prefix = `user-${answerIndex}-${taskIndex}`
      const common = {
        date: answer.lastUpdate || answer.date || study.value?.creationDate,
        evaluator:
          answer.fullName || answer.email || answer.userDocId || undefined,
      }
      const media = [
        {
          type: 'webcam',
          url: task.webcamRecordURL || task.videoRecordURL,
          size: task.webcamSize,
        },
        {
          type: 'screen',
          url: task.screenRecordURL,
          size: task.screenSize,
        },
        {
          type: 'audio',
          url: task.audioRecordURL,
          size: task.audioSize,
        },
        {
          type: 'audio',
          url: task.moderatorAudioURL,
          size: task.moderatorAudioSize,
        },
      ]

      media.forEach((item, mediaIndex) => {
        if (!item.url) return
        result.push(
          createFile({
            ...common,
            ...item,
            id: `${prefix}-${mediaIndex}`,
            fallbackName: `${item.type}-${taskIndex + 1}`,
          }),
        )
      })
    })
  })

  return result
}

const extractHeuristicFiles = (answerDoc) => {
  const result = []
  const answers = normalizeCollection(
    answerDoc?.heuristicAnswers,
    'userDocId',
  )

  answers.forEach((answer, answerIndex) => {
    const seenUrls = new Set()
    const evaluator =
      answer.fullName || answer.email || answer.userDocId || undefined
    const visit = (value, path = 'question') => {
      if (!value || typeof value !== 'object') return

      if (Array.isArray(value.images)) {
        value.images.forEach((image, imageIndex) => {
          if (!image?.url || seenUrls.has(image.url)) return
          seenUrls.add(image.url)
          result.push(
            createFile({
              id: `heuristic-${answerIndex}-${path}-${imageIndex}`,
              type: image.type || 'file',
              url: image.url,
              size: image.size,
              date: image.createdAt || answer.lastUpdate,
              evaluator,
              contentType: image.contentType,
              name: image.name,
              fallbackName: `file-${imageIndex + 1}`,
            }),
          )
        })
      }

      if (
        value.answerImageUrl &&
        !seenUrls.has(value.answerImageUrl)
      ) {
        seenUrls.add(value.answerImageUrl)
        result.push(
          createFile({
            id: `heuristic-${answerIndex}-${path}-legacy`,
            type: 'file',
            url: value.answerImageUrl,
            size: value.imageSize,
            date: answer.lastUpdate,
            evaluator,
            fallbackName: 'file',
          }),
        )
      }

      Object.entries(value).forEach(([key, child]) => {
        if (key === 'images' || key === 'answerImageUrl') return
        if (child && typeof child === 'object') visit(child, `${path}-${key}`)
      })
    }

    visit(answer)
  })

  return result
}

const enrichFileMetadata = async (file) => {
  try {
    const metadata = await getMetadata(storageRef(storage, file.url))
    const name = metadata.name || file.name
    const contentType = metadata.contentType || file.contentType || ''
    const preserveSpecificRecordingType = ['webcam', 'screen'].includes(
      file.type,
    )
    return {
      ...file,
      name,
      type: preserveSpecificRecordingType
        ? file.type
        : inferFileType({
            contentType,
            name,
            url: file.url,
            fallback: file.type,
          }),
      size: Number(metadata.size) || file.size || 0,
      sizeKnown: Number(metadata.size) > 0 || file.sizeKnown,
      contentType,
      date: file.date || new Date(metadata.timeCreated).getTime(),
    }
  } catch {
    return {
      ...file,
      type: inferFileType({
        contentType: file.contentType,
        name: file.name,
        url: file.url,
        fallback: file.type,
      }),
    }
  }
}

const loadFiles = async () => {
  if (!study.value?.answersDocId) {
    answerDocument.value = null
    filesWithMetadata.value = []
    return
  }

  loading.value = true
  try {
    answerDocument.value = await answerController.getAnswerById(
      study.value.answersDocId,
    )
    const discovered = [
      ...extractUserTestFiles(answerDocument.value),
      ...extractHeuristicFiles(answerDocument.value),
    ]
    const uniqueFiles = Array.from(
      new Map(discovered.map((file) => [file.url, file])).values(),
    )
    filesWithMetadata.value = await Promise.all(
      uniqueFiles.map(enrichFileMetadata),
    )
  } catch {
    answerDocument.value = null
    filesWithMetadata.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => study.value?.answersDocId,
  () => loadFiles(),
  { immediate: true },
)

const files = computed(() =>
  filesWithMetadata.value.filter(
    (file) => !store.getters['Storage/deletedUrls'].has(file.url),
  ),
)

const availableTypes = computed(() => [
  ...new Set(files.value.map((file) => file.type)),
])

const typeFilterOptions = computed(() => [
  { title: t('storage.allTypes'), value: 'all' },
  ...availableTypes.value.map((type) => ({
    title: fileTypeLabel(type),
    value: type,
  })),
])

const filteredFiles = computed(() => {
  const query = search.value?.trim().toLocaleLowerCase(locale.value) || ''
  return files.value.filter((file) => {
    const matchesType =
      selectedType.value === 'all' || file.type === selectedType.value
    const searchable = [
      file.name,
      file.evaluator,
      fileTypeLabel(file.type),
    ]
      .join(' ')
      .toLocaleLowerCase(locale.value)
    return matchesType && (!query || searchable.includes(query))
  })
})

const usedBytes = computed(() =>
  files.value.reduce((total, file) => total + (file.size || 0), 0),
)
const knownSizeCount = computed(
  () => files.value.filter((file) => file.sizeKnown).length,
)
const unknownSizeCount = computed(
  () => files.value.length - knownSizeCount.value,
)
const accountUsedBytes = computed(
  () => Number(user.value?.storageUsageMB || 0) * 1024 * 1024,
)
const accountFreeBytes = computed(() =>
  Math.max(storageQuotaBytes - accountUsedBytes.value, 0),
)
const accountUsagePercentage = computed(() =>
  Math.min((accountUsedBytes.value / storageQuotaBytes) * 100, 100),
)
const usageColor = computed(() => {
  if (accountUsagePercentage.value >= 90) return 'error'
  if (accountUsagePercentage.value >= 75) return 'warning'
  return 'success'
})

const typeBreakdown = computed(() =>
  availableTypes.value.map((type) => {
    const typeFiles = files.value.filter((file) => file.type === type)
    const size = typeFiles.reduce((total, file) => total + file.size, 0)
    return {
      type,
      count: typeFiles.length,
      size,
      percentage: usedBytes.value ? (size / usedBytes.value) * 100 : 0,
      ...fileTypeConfig(type),
    }
  }),
)

const summaryMetrics = computed(() => [
  {
    key: 'used',
    title: t('storage.studyStorageUsed'),
    value: formatBytes(usedBytes.value),
    subtitle: t('storage.knownSizes', {
      known: knownSizeCount.value,
      total: files.value.length,
    }),
    icon: 'mdi-database',
    color: 'primary',
  },
  {
    key: 'free',
    title: t('storage.freeSpace'),
    value: formatBytes(accountFreeBytes.value),
    subtitle: t('storage.accountQuota'),
    icon: 'mdi-database-check',
    color: 'success',
  },
  {
    key: 'files',
    title: t('storage.totalFiles'),
    value: String(files.value.length),
    subtitle: t('storage.fileTypes', { count: availableTypes.value.length }),
    icon: 'mdi-file-multiple',
    color: 'info',
  },
  {
    key: 'largest',
    title: t('storage.largestType'),
    value: largestType.value
      ? fileTypeLabel(largestType.value.type)
      : t('storage.noData'),
    subtitle: largestType.value
      ? formatBytes(largestType.value.size)
      : t('storage.noMediaFiles'),
    icon: 'mdi-chart-donut',
    color: 'purple',
  },
])

const largestType = computed(() =>
  typeBreakdown.value.reduce(
    (largest, item) => (!largest || item.size > largest.size ? item : largest),
    null,
  ),
)

const formatBytes = (bytes) => {
  if (!Number(bytes)) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`
}

const formatFileDate = (timestamp) => {
  if (!timestamp) return t('storage.unknownDate')
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

const openPreview = (file) => {
  previewFile.value = file
  previewDialog.value = true
}

const confirmDelete = (file) => {
  if (!file) return
  fileToDelete.value = file
  deleteDialog.value = true
}

const executeDelete = async () => {
  const file = fileToDelete.value
  if (!file) return

  try {
    await store.dispatch('Storage/deleteFile', file)
    deleteDialog.value = false
    previewDialog.value = false
    fileToDelete.value = null
    previewFile.value = null
  } catch {
    showError('errors.globalError')
  }
}
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
