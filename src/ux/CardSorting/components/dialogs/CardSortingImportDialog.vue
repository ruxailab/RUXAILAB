<template>
  <v-dialog
    :model-value="dialog"
    max-width="600"
    persistent
    @update:model-value="close"
  >
    <v-card class="rounded-xl import-card">
      <CardSortingImportHeader
        :is-category="isCategory"
        :title="dialogTitle"
        :hint="dialogHint"
        @close="close"
      />

      <v-card-text class="px-6 pt-2 pb-2">
        <v-tabs
          v-model="activeTab"
          color="#FCA326"
          grow
          class="import-tabs mb-4"
        >
          <v-tab value="text" class="text-none">
            <v-icon start size="18">mdi-text-box-outline</v-icon>
            {{ $t('CardSorting.importTabText') }}
          </v-tab>
          <v-tab value="file" class="text-none">
            <v-icon start size="18">mdi-file-upload-outline</v-icon>
            {{ $t('CardSorting.importTabFile') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="text">
            <CardSortingImportTextPanel
              :key="panelKey"
              v-model="rawText"
              :label="textInputLabel"
              :placeholder="placeholder"
            />
          </v-window-item>

          <v-window-item value="file">
            <CardSortingImportFilePanel
              :key="panelKey"
              v-model="fileText"
              :type="type"
            />
          </v-window-item>
        </v-window>

        <CardSortingImportPreview
          :titles="preview.titles"
          :duplicates="preview.duplicates"
          :is-category="isCategory"
        />
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-4 d-flex justify-end ga-3">
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          class="text-none rounded-lg px-6"
          height="44"
          @click="close"
        >
          {{ $t('buttons.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          class="text-none rounded-lg px-6"
          height="44"
          :disabled="!preview.titles.length"
          @click="submit"
        >
          <v-icon start size="18">mdi-import</v-icon>
          {{ $t('CardSorting.importAction') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  normalizeImportFileText,
  parseImportLines,
} from '../../utils/parseImportLines'
import CardSortingImportHeader from './import/CardSortingImportHeader.vue'
import CardSortingImportTextPanel from './import/CardSortingImportTextPanel.vue'
import CardSortingImportFilePanel from './import/CardSortingImportFilePanel.vue'
import CardSortingImportPreview from './import/CardSortingImportPreview.vue'

const { t } = useI18n()

const props = defineProps({
  dialog: Boolean,
  type: {
    type: String,
    default: 'category',
    validator: (value) => ['category', 'card'].includes(value),
  },
  existingTitles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:dialog', 'import'])

const rawText = ref('')
const fileText = ref('')
const activeTab = ref('text')
const panelKey = ref(0)

const isCategory = computed(() => props.type === 'category')

const dialogTitle = computed(() =>
  isCategory.value
    ? t('CardSorting.importCategories')
    : t('CardSorting.importCards'),
)

const dialogHint = computed(() =>
  isCategory.value
    ? t('CardSorting.importCategoriesHint')
    : t('CardSorting.importCardsHint'),
)

const placeholder = computed(() => t('CardSorting.importPlaceholder'))

const textInputLabel = computed(() =>
  isCategory.value
    ? t('CardSorting.importTextLabelCategories')
    : t('CardSorting.importTextLabelCards'),
)

const sourceText = computed(() =>
  activeTab.value === 'file'
    ? normalizeImportFileText(fileText.value)
    : rawText.value,
)

const preview = computed(() =>
  parseImportLines(sourceText.value, props.existingTitles),
)

const reset = () => {
  rawText.value = ''
  fileText.value = ''
  activeTab.value = 'text'
  panelKey.value += 1
}

const close = () => {
  emit('update:dialog', false)
  reset()
}

const submit = () => {
  const { titles } = preview.value
  if (!titles.length) return

  emit('import', titles)
  emit('update:dialog', false)
  reset()
}

watch(
  () => props.dialog,
  (isOpen) => {
    if (isOpen) {
      reset()
    }
  },
)
</script>

<style scoped>
.import-card {
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
}
</style>
