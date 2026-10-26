import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { getMetadata, ref as storageRef } from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'
import AnswerController from '@/shared/controllers/AnswerController'
import { showError } from '@/shared/utils/toast'

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024

export function useStorageFiles() {
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
      [
        'pdf',
        'txt',
        'csv',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
      ].includes(extension)
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
    ...metadata
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
    ...metadata,
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
            urlField: task.webcamRecordURL
              ? 'webcamRecordURL'
              : 'videoRecordURL',
            sizeField: task.webcamSize ? 'webcamSize' : null,
          },
          {
            type: 'screen',
            url: task.screenRecordURL,
            size: task.screenSize,
            urlField: 'screenRecordURL',
            sizeField: 'screenSize',
          },
          {
            type: 'audio',
            url: task.audioRecordURL,
            size: task.audioSize,
            urlField: 'audioRecordURL',
            sizeField: 'audioSize',
          },
          {
            type: 'audio',
            url: task.moderatorAudioURL,
            size: task.moderatorAudioSize,
            urlField: 'moderatorAudioURL',
            sizeField: task.moderatorAudioSize ? 'moderatorAudioSize' : null,
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
              answersDocId: study.value?.answersDocId,
              userDocId: answer.userDocId,
              taskId: task.taskId,
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
                answersDocId: study.value?.answersDocId,
                userDocId: answer.userDocId,
                answerCollection: 'heuristicAnswers',
              }),
            )
          })
        }

        if (value.answerImageUrl && !seenUrls.has(value.answerImageUrl)) {
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
              answersDocId: study.value?.answersDocId,
              userDocId: answer.userDocId,
              answerCollection: 'heuristicAnswers',
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

  const extractCardSortingFiles = (answerDoc) => {
    const result = []
    const answers = normalizeCollection(
      answerDoc?.cardSortingAnswers,
      'userDocId',
    )

    answers.forEach((answer, answerIndex) => {
      const evaluator =
        answer.fullName || answer.email || answer.userDocId || undefined
      const media = [
        {
          type: 'webcam',
          url: answer.webcamRecordURL,
          size: answer.webcamSize,
          urlField: 'webcamRecordURL',
          sizeField: 'webcamSize',
        },
        {
          type: 'screen',
          url: answer.screenRecordURL,
          size: answer.screenSize,
          urlField: 'screenRecordURL',
          sizeField: 'screenSize',
        },
        {
          type: 'audio',
          url: answer.audioRecordURL,
          size: answer.audioSize,
          urlField: 'audioRecordURL',
          sizeField: 'audioSize',
        },
      ]

      media.forEach((item, mediaIndex) => {
        if (!item.url) return
        result.push(
          createFile({
            ...item,
            id: `card-sorting-${answerIndex}-${mediaIndex}`,
            date: answer.lastUpdate,
            evaluator,
            fallbackName: `${item.type}-${answerIndex + 1}`,
            answersDocId: study.value?.answersDocId,
            userDocId: answer.userDocId,
            answerCollection: 'cardSortingAnswers',
          }),
        )
      })
    })

    return result
  }

  const enrichFileMetadata = async (file) => {
    if (!file?.url) return null

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
    } catch (error) {
      if (
        error?.code === 'storage/object-not-found' ||
        error?.code === 'storage/invalid-url'
      ) {
        await store.dispatch('Storage/removeFileReference', file)
        return null
      }

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
        ...extractCardSortingFiles(answerDocument.value),
      ]
      const uniqueFiles = Array.from(
        new Map(discovered.map((file) => [file.url, file])).values(),
      )
      const existingFiles = await Promise.all(
        uniqueFiles.map(enrichFileMetadata),
      )
      filesWithMetadata.value = existingFiles.filter(Boolean)
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
      const searchable = [file.name, file.evaluator, fileTypeLabel(file.type)]
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
  // const accountFreeBytes = computed(() =>
  //   Math.max(storageQuotaBytes - accountUsedBytes.value, 0),
  // )
  const accountUsagePercentage = computed(() =>
    Math.min((accountUsedBytes.value / storageQuotaBytes) * 100, 100),
  )
  const studyUsagePercentage = computed(() =>
    Math.min((usedBytes.value / storageQuotaBytes) * 100, 100),
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

  const largestType = computed(() =>
    typeBreakdown.value.reduce(
      (largest, item) =>
        !largest || item.size > largest.size ? item : largest,
      null,
    ),
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
    // {
    //   key: 'free',
    //   title: t('storage.freeSpace'),
    //   value: formatBytes(accountFreeBytes.value),
    //   subtitle: t('storage.accountQuota'),
    //   icon: 'mdi-database-check',
    //   color: 'success',
    // },
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

  return {
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
    studyUsedBytes: usedBytes,
    studyUsagePercentage,
    studyUsageColor: usageColor,
    typeBreakdown,
    unknownSizeCount,
    summaryMetrics,
    formatBytes,
    formatFileDate,
    openPreview,
    confirmDelete,
    executeDelete,
  }
}
