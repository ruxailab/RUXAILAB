<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4 clickable-header" @click.stop.capture>
      <v-icon size="24" color="primary" class="header-icon"
        >mdi-database</v-icon
      >
      <v-card-title class="text-h6 text-primary clickable-title">
        {{ $t('Dashboard.cards.storage') }}
      </v-card-title>
    </div>

    <!-- Métrica principal -->
    <div class="main-metric mb-4">
      <div class="metric-subtitle text-caption text-grey-darken-1">
        {{ $t('Dashboard.cards.currentStorage') }}
      </div>
      <div class="metric-value text-h3 font-weight-bold">
        <v-progress-circular
          v-if="loadingStorage"
          indeterminate
          color="primary"
          size="36"
          width="3"
        />
        <span v-else>{{ storageUsed }}</span>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="additional-info">
      <div class="info-subtitle text-caption text-grey-darken-1">
        {{ $t('Dashboard.cards.limitAvailable') }}
      </div>
      <div class="info-value text-body-2 font-weight-medium">
        {{ storageLimit }}
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  getMetadata,
  listAll,
  ref as storageRef,
} from 'firebase/storage'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { storage } from '@/app/plugins/firebase'
import { formatBytes } from '@/shared/utils/formatUtils'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
const store = useStore()
const storageUsedBytes = ref(0)
const loadingStorage = ref(false)
const storageLoadFailed = ref(false)

const getFolderSize = async (folderReference) => {
  const folderContents = await listAll(folderReference)
  const fileMetadata = await Promise.all(
    folderContents.items.map((item) => getMetadata(item)),
  )
  const nestedFolderSizes = await Promise.all(
    folderContents.prefixes.map((prefix) => getFolderSize(prefix)),
  )

  const filesSize = fileMetadata.reduce(
    (total, metadata) => total + Number(metadata.size || 0),
    0,
  )

  return (
    filesSize +
    nestedFolderSizes.reduce((total, folderSize) => total + folderSize, 0)
  )
}

const loadStorageUsage = async (testId) => {
  if (!testId) {
    storageUsedBytes.value = 0
    return
  }

  loadingStorage.value = true
  storageLoadFailed.value = false
  try {
    storageUsedBytes.value = await getFolderSize(
      storageRef(storage, `tests/${testId}`),
    )
  } catch {
    storageLoadFailed.value = true
    storageUsedBytes.value = 0
  } finally {
    loadingStorage.value = false
  }
}

watch(
  () => props.test?.id,
  (testId) => loadStorageUsage(testId),
  { immediate: true },
)

watch(
  () => store.getters['Storage/deletedUrls'].size,
  () => loadStorageUsage(props.test?.id),
)

const storageUsed = computed(() =>
  storageLoadFailed.value ? '-' : formatBytes(storageUsedBytes.value),
)

const storageLimit = computed(() => {
  // Límite estándar para estudios
  return `2${t('common.units.gb')}`
})
</script>

<style scoped>
.main-metric {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.metric-subtitle {
  margin-bottom: 8px;
}

.metric-value {
  line-height: 1;
  margin-bottom: 4px;
}

.metric-change {
  font-weight: 500;
}

.additional-info {
  padding-top: 8px;
}

.info-subtitle {
  margin-bottom: 4px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
}

.clickable-header {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-header:hover .header-icon {
  color: rgb(var(--v-theme-secondary)) !important;
}

.clickable-header:hover .clickable-title {
  color: rgb(var(--v-theme-secondary)) !important;
}

.header-icon {
  transition: color 0.2s ease;
}

.clickable-title {
  transition: color 0.2s ease;
}
</style>
