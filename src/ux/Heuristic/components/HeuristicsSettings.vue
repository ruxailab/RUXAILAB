<template>
  <v-card elevation="2" class="pa-6">
    <div>
      <!-- Header Section -->
      <h1 class="text-h4 font-weight-bold text-on-surface mb-4">
        {{ $t('HeuristicsSettings.titles.settings') }}
      </h1>
      <v-divider class="mb-6" />

      <!-- Download CSV Template -->
      <div class="mb-8">
        <v-btn
          color="accent"
          variant="elevated"
          size="large"
          class="text-none"
          @click="downloadTemplate"
        >
          {{ $t('HeuristicsSettings.actions.downloadCsvTemplate') }}
        </v-btn>
      </div>

      <!-- File Upload Section -->
      <div>
        <div class="d-flex align-stretch mb-4 file-upload-container">
          <!-- File Input -->
          <div class="flex-grow-1 me-2">
            <v-file-input
              ref="myFile"
              v-model="csvFile"
              accept=".csv"
              :label="$t('HeuristicsSettings.placeHolders.importCsv')"
              variant="outlined"
              density="comfortable"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              show-size
              truncate-length="15"
              :disabled="testAnswerDocLength > 0"
              counter
              class="file-input-field"
              hide-details
            >
            </v-file-input>
          </div>

          <!-- Update Button -->
          <div class="d-flex align-center">
            <v-btn
              :loading="loadingUpdate"
              :disabled="loadingUpdate || testAnswerDocLength > 0"
              color="primary"
              variant="elevated"
              class="text-none update-button"
              height="56"
              @click="changeToJSON"
            >
              <v-icon start> mdi-cloud-upload </v-icon>
              {{ $t('HeuristicsSettings.actions.update') }}
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="errorMessage"
          v-model="errorVisible"
          type="error"
          density="compact"
          class="mt-2"
          closable
        >
          {{ errorMessage }}
        </v-alert>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ $t('HeuristicsSettings.titles.confirmUpload') }}
        </v-card-title>
        <v-card-text class="pa-4">
          {{ $t('HeuristicsSettings.messages.acceptCsv') }}
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="confirmDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="confirmUpload">
            {{ $t('common.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { showWarning, showSuccess, showError } from '@/shared/utils/toast'

const store = useStore()
const { t } = useI18n()

const loading = ref(false)
const loader = ref(null)
const csvFile = ref(null)
const myFile = ref(null)
const loadingUpdate = ref(false)
const errorMessage = ref('')
const errorVisible = ref(false)
const confirmDialog = ref(false)

const test = computed(() => store.getters.test)

const testAnswerDocLength = computed(() => {
  const doc = store.getters.testAnswerDocument
  return Object.keys(doc?.heuristicAnswers ?? {}).length
})

watch(loader, (newLoader) => {
  if (newLoader) {
    loading.value = !loading.value
    if (csvFile.value) {
      setTimeout(() => {
        loading.value = false
        csvFile.value = null
      }, 3000)
      loader.value = null
    } else {
      setTimeout(() => {
        loading.value = false
      }, 3000)
      showWarning('HeuristicsSettings.messages.noCsvFileSelected')
      loader.value = null
    }
  }
})

watch(csvFile, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
    errorVisible.value = false
  }
})

const changeToJSON = async () => {
  if (!csvFile.value) {
    showWarning('HeuristicsSettings.messages.noCsvFileSelected')
    return
  }

  if (!csvFile.value.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = t('HeuristicsSettings.messages.invalidFileType')
    errorVisible.value = true
    return
  }

  confirmDialog.value = true
}

const confirmUpload = async () => {
  confirmDialog.value = false
  loadingUpdate.value = true
  errorMessage.value = ''
  errorVisible.value = false

  try {
    const reader = new FileReader()
    reader.readAsText(csvFile.value, 'UTF-8')

    reader.onload = async () => {
      try {
        const csv = reader.result?.trim()
        if (!csv) {
          errorMessage.value = t('HeuristicsSettings.messages.emptyCsvFile')
          errorVisible.value = true
          return
        }

        // Parse CSV with proper handling of quoted fields
        const parseCsvLine = (line, delimiter) => {
          const result = []
          let current = ''
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                current += '"'
                i++
              } else {
                inQuotes = !inQuotes
              }
            } else if (char === delimiter && !inQuotes) {
              result.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }
          result.push(current.trim())
          return result
        }

        // Split by newlines but respect quoted fields
        const parseCSV = (text) => {
          const rows = []
          let current = ''
          let inQuotes = false

          for (let i = 0; i < text.length; i++) {
            const char = text[i]

            if (char === '"') {
              inQuotes = !inQuotes
              current += char
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
              if (current.trim()) {
                rows.push(current)
              }
              current = ''
              if (char === '\r' && text[i + 1] === '\n') i++ // Handle \r\n
            } else {
              current += char
            }
          }
          if (current.trim()) rows.push(current)
          return rows
        }

        const lines = parseCSV(csv)
        if (!lines.length) {
          errorMessage.value = t('HeuristicsSettings.messages.emptyCsvFile')
          errorVisible.value = true
          return
        }

        // Detect delimiter
        const firstLine = lines[0]
        let delimiter = '\t'
        if (firstLine.includes('\t')) delimiter = '\t'
        else if (firstLine.includes(';')) delimiter = ';'
        else if (firstLine.includes(',')) delimiter = ','

        const heuristicMap = new Map()

        // Detect if first row is header
        const firstCols = parseCsvLine(firstLine, delimiter).map((c) =>
          c.trim().toLowerCase(),
        )
        const hasHeader =
          firstCols.some((c) => c.includes('heuristic')) &&
          firstCols.some((c) => c.includes('question'))

        const startIndex = hasHeader ? 1 : 0

        for (let i = startIndex; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i], delimiter)

          // Handle 2-column format (HEURISTIC, QUESTION)
          if (cols.length >= 2) {
            const heuristicTitle = cols[0].trim()
            const questionText = cols[1].trim()

            if (!heuristicTitle || !questionText) continue

            // Extract heuristic ID from title (e.g., "1-" from "1- Visibilidad...")
            const idMatch = heuristicTitle.match(/^(\d+)\s*-/)
            const heuristicId = idMatch
              ? parseInt(idMatch[1]) - 1
              : heuristicMap.size

            if (!heuristicMap.has(heuristicTitle)) {
              heuristicMap.set(heuristicTitle, {
                id: heuristicId,
                title: heuristicTitle,
                questions: [],
                total: 0,
              })
            }

            const heuristic = heuristicMap.get(heuristicTitle)

            heuristic.questions.push({
              id: heuristic.questions.length,
              title: questionText,
              descriptions: [],
              comparison: [],
              text: questionText,
              answerImageUrl: '',
            })

            heuristic.total = heuristic.questions.length
          }
        }

        const heuristicTest = Array.from(heuristicMap.values())

        if (!heuristicTest.length) {
          errorMessage.value = 'No valid data found in CSV file'
          errorVisible.value = true
          return
        }

        store.state.Tests.Test.testStructure = heuristicTest
        await store.dispatch('updateStudy', test.value)

        showSuccess(`${csvFile.value.name} uploaded`)
        csvFile.value = null
      } finally {
        loadingUpdate.value = false
      }
    }
  } catch (error) {
    errorMessage.value = t('HeuristicsSettings.messages.updateFailed')
    showError(error)
    errorVisible.value = true
    loadingUpdate.value = false
  }
}

const downloadTemplate = async () => {
  const storage = getStorage()
  const starsRef = storageRef(storage, 'template-csv/heuristic-template.csv')
  try {
    const url = await getDownloadURL(starsRef)
    window.open(url, '_blank')
  } catch (error) {
    switch (error.code) {
      case 'storage/object-not-found':
        errorMessage.value = t('HeuristicsSettings.messages.templateNotFound')
        break
      case 'storage/unauthorized':
        errorMessage.value = t('HeuristicsSettings.messages.unauthorizedAccess')
        break
      case 'storage/canceled':
        errorMessage.value = t('HeuristicsSettings.messages.downloadCanceled')
        break
      case 'storage/unknown':
        errorMessage.value = t('HeuristicsSettings.messages.unknownError')
        break
    }
    errorVisible.value = true
  }
}
</script>

<style scoped>
:deep(.v-file-input .v-field) {
  background-color: #f8fafc;
}

:deep(.v-btn--variant-elevated) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.v-btn--variant-elevated:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Perfect side-by-side alignment */
.file-upload-container {
  align-items: stretch;
  gap: 8px;
}

.file-input-field {
  flex: 1;
  min-width: 0;
}

.update-button {
  height: 56px !important;
  width: 150px;
  min-width: 120px;
  white-space: nowrap;
}

/* Make file input field match button height */
.file-input-field :deep(.v-field) {
  height: 56px !important;
  min-height: 56px !important;
}

/* Ensure perfect vertical alignment */
.file-input-field :deep(.v-field__field) {
  height: 100%;
}

/* Remove any gaps */
.file-input-field :deep(.v-input__details) {
  display: none !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .file-upload-container {
    flex-direction: column;
    gap: 12px;
  }

  .update-button {
    width: 100%;
    height: 48px !important;
  }

  .file-input-field :deep(.v-field) {
    height: 52px !important;
    min-height: 52px !important;
  }
}

@media (max-width: 480px) {
  .v-container.fluid.pa-6,
  .v-card.pa-6 {
    padding: 16px !important;
  }

  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.5rem !important;
  }

  .update-button {
    height: 44px !important;
  }

  .file-input-field :deep(.v-field) {
    height: 48px !important;
    min-height: 48px !important;
  }
}

@media (max-width: 375px) {
  .v-container.fluid.pa-6,
  .v-card.pa-6 {
    padding: 12px !important;
  }

  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.25rem !important;
  }
}
</style>
