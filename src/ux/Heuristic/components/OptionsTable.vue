<template>

  <v-card elevation="2" class="pa-6">
    <!-- Header Section - Made Responsive -->
    <div class="d-flex align-center justify-space-between mb-8 mobile-header">
      <div>
        <h1 class="text-h4 font-weight-bold text-on-surface">
          {{ $t('HeuristicsOptionsTable.titles.options') }}
        </h1>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" variant="elevated" size="large" :disabled="testAnswerDocLength > 0"
        class="text-none add-option-btn" @click="dialog = true">
        {{ $t('HeuristicsTable.titles.addOption') }}
      </v-btn>
    </div>
    <v-divider class="mb-6" />

    <!-- Options Table - Made Responsive -->
    <div class="options-table-container">
      <!-- Desktop Table View (only show when there are items) -->
      <v-card v-if="optionsWithFormattedValue.length > 0" class="options-table-card desktop-table">
        <v-data-table :headers="headers" :items="optionsWithFormattedValue" :items-per-page="-1"
          class="elevation-0 options-data-table" hide-default-footer>
          <!-- Custom header styling -->
          <template #headers="{ columns }">
            <tr class="table-header">
              <th v-for="column in columns" :key="column.key" class="text-left font-weight-medium text-ternary pa-4"
                :style="{ width: column.width }">
                {{ column.title }}
              </th>
            </tr>
          </template>

          <!-- Desktop view -->
          <template #item="{ item }">
            <tr class="table-row">
              <td class="pa-4 title-cell">
                <div class="cell-content">
                  <span class="text-body-1 text-on-surface option-text">{{ item.text }}</span>
                </div>
              </td>
              <td class="pa-4 description-cell">
                <div class="cell-content">
                  <span class="text-body-2 text-on-surface option-description">{{ item.description || '-' }}</span>
                </div>
              </td>
              <td class="pa-4 value-cell">
                <div class="cell-content">
                  <span class="text-body-1 text-on-surface font-weight-medium option-value">{{ item.value }}</span>
                </div>
              </td>
              <td class="pa-4 actions-cell">
                <div class="d-flex gap-2 option-actions">
                  <v-btn icon="mdi-pencil" variant="text" size="small" color="primary"
                    :disabled="testAnswerDocLength > 0" @click="editItem(item)" class="table-action-btn" />
                  <v-btn icon="mdi-delete" variant="text" size="small" color="error" :disabled="testAnswerDocLength > 0"
                    @click="deleteItem(item)" class="table-action-btn" />
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>

      <!-- Desktop Empty State (outside the table) -->
      <v-card v-if="optionsWithFormattedValue.length === 0" class="desktop-empty-state options-table-card">
        <div class="text-center empty-options-card--desktop" variant="outlined">
          <v-icon icon="mdi-cog-outline" class="empty-icon" color="primary" />
          <h3 class="empty-title">
            {{ $t('HeuristicsOptionsTable.titles.noOptions') }}
          </h3>
          <p class="empty-text">
            {{ $t('HeuristicsOptionsTable.messages.startAddingOptions') }}
          </p>
        </div>
      </v-card>

      <!-- Mobile List View (similar to heuristics) -->
      <div class="mobile-options-list">
        <div v-for="(item, index) in optionsWithFormattedValue" :key="item.timestamp" class="option-item-mobile">
          <v-card variant="outlined" class="mb-3 option-card-mobile">
            <!-- Option Header - EXACTLY LIKE HEURISTIC HEADER -->
            <div class="d-flex align-center pa-3 option-header-mobile">
              <div class="d-flex align-center flex-grow-1 option-info-mobile">
                <v-chip color="primary" variant="tonal" size="small" class="me-3 option-chip-mobile">
                  {{ item.value }}
                </v-chip>
                <div class="option-content-mobile">
                  <h5 class="text-subtitle-1 font-weight-medium text-on-surface option-title-mobile mb-0">
                    {{ item.text }}
                  </h5>
                  <p v-if="item.description && item.description !== '-'"
                    class="text-body-2 text-ternary ma-0 mt-1 option-desc-mobile">
                    {{ item.description }}
                  </p>
                </div>
              </div>

              <div class="d-flex gap-1 option-actions-mobile">
                <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" :disabled="testAnswerDocLength > 0"
                  @click.stop="editItem(item)" class="action-btn-mobile" />
                <v-btn icon="mdi-delete" variant="text" size="small" color="error" :disabled="testAnswerDocLength > 0"
                  @click.stop="deleteItem(item)" class="action-btn-mobile" />
              </div>
            </div>
          </v-card>
        </div>

        <!-- Empty state for mobile -->
        <div v-if="optionsWithFormattedValue.length === 0" class="mobile-empty-state">
          <v-card class="text-center pa-8 empty-options-card-mobile" variant="outlined">
            <v-icon icon="mdi-cog-outline" size="64" color="primary" class="mb-4" />
            <h3 class="text-h6 text-ternary mb-2">
              {{ $t('HeuristicsOptionsTable.titles.noOptions') }}
            </h3>
            <p class="text-body-2 text-ternary empty-state-text-mobile">
              {{ $t('HeuristicsOptionsTable.messages.startAddingOptions') }}
            </p>
          </v-card>
        </div>
      </div>

      <!-- Footer with count -->
      <div v-if="optionsWithFormattedValue.length > 0" class="options-footer">
        <div class="d-flex align-center justify-space-between flex-wrap gap-2 pa-3">
          <div class="d-flex align-center items-count">
            <span class="text-caption text-grey">
              {{ optionsWithFormattedValue.length }} {{ optionsWithFormattedValue.length === 1 ? 'option' : 'options' }}
            </span>
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn v-if="testAnswerDocLength === 0" color="primary" variant="outlined" size="small"
              prepend-icon="mdi-plus" @click="dialog = true" class="mobile-add-btn">
              Add Option
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- AddOptionBtn Component -->
    <AddOptionBtn v-model:dialog="dialog" :option="option" :has-value="hasValue" @change-has-value="updateHasValue"
      @add-option="updateOptions" @change="emitChange" />
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import AddOptionBtn from '@/ux/Heuristic/components/AddOptionBtn';

const store = useStore();
const { t } = useI18n();

const emit = defineEmits(['change']);

const headers = ref([
  {
    title: t('common.title'),
    align: 'start',
    value: 'text',
    width: '25%',
  },
  {
    title: t('common.description'),
    align: 'start',
    value: 'description',
    width: '35%',
  },
  {
    title: t('common.value'),
    align: 'center',
    value: 'value',
    width: '15%',
  },
  {
    title: t('common.actions'),
    value: 'actions',
    align: 'center',
    sortable: false,
    width: '25%',
  },
]);

const option = ref({
  text: '',
  description: '',
  value: null,
  timestamp: null,
});

const dialog = ref(false);
const editIndex = ref(-1);
const hasValue = ref(true);

const optionsWithFormattedValue = computed(() =>
  (store.state.Tests.Test.testOptions || []).map((opt) => ({
    ...opt,
    value: opt.value === null ? '-' : opt.value,
  })),
);

const testAnswerDocLength = computed(() => {
  const testAnswerDocument = store.getters.testAnswerDocument
  if (!testAnswerDocument) return 0
  const heuristicAnswers = testAnswerDocument.heuristicAnswers
  return Object.keys(heuristicAnswers || {}).length
});

watch(dialog, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

const updateHasValue = (newValue) => {
  hasValue.value = newValue;
};

const updateOptions = (newOption) => {
  if (editIndex.value === -1) {
    store.state.Tests.Test.testOptions.push({
      ...newOption,
      timestamp: Date.now(),
    });
  } else {
    store.state.Tests.Test.testOptions[editIndex.value] = {
      ...newOption,
      timestamp: store.state.Tests.Test.testOptions[editIndex.value].timestamp,
    };
    editIndex.value = -1;
  }
  resetForm();
  emitChange();
};

const deleteItem = (item) => {
  const index = store.state.Tests.Test.testOptions.findIndex((opt) => opt.timestamp === item.timestamp);
  if (index !== -1) {
    store.state.Tests.Test.testOptions.splice(index, 1);
  }
  emitChange();
};

const editItem = (item) => {
  editIndex.value = store.state.Tests.Test.testOptions.findIndex((opt) => opt.timestamp === item.timestamp);
  option.value = { ...store.state.Tests.Test.testOptions[editIndex.value] };
  hasValue.value = option.value.value !== null;
  dialog.value = true;
};

const emitChange = () => {
  emit('change');
};

const resetForm = () => {
  option.value = { text: '', value: null, description: '', timestamp: null };
  hasValue.value = true;
  editIndex.value = -1;
};
</script>

<style scoped>
/* Base styles */
.table-header {
  background-color: #F8FAFC;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.table-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(59, 130, 246, 0.02);
}

:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-data-table__wrapper) {
  border-radius: 8px 8px 0 0;
}

:deep(.v-btn--variant-elevated) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.v-btn--variant-elevated:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Desktop styles */
@media (min-width: 769px) {
  .desktop-table {
    display: block !important;
  }

  .mobile-options-list {
    display: none !important;
  }

  .mobile-add-btn {
    display: none !important;
  }

  .desktop-empty-state {
    display: block !important;
  }
}

@media (min-width: 1024px) {
  .description-cell {
    max-width: none;
  }

  .title-cell,
  .description-cell {
    white-space: normal;
    word-break: break-word;
  }
}

/* Responsive styles for mobile devices */
@media (max-width: 768px) {

  /* Header section */
  .mobile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px !important;
  }

  .add-option-btn {
    width: 100%;
  }

  /* Title size on mobile */
  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.75rem !important;
    line-height: 1.2;
  }

  /* Hide desktop table and empty state on mobile */
  .desktop-table,
  .desktop-empty-state {
    display: none !important;
  }

  /* Show mobile list */
  .mobile-options-list {
    display: block !important;
  }

  /* Mobile option item - EXACTLY LIKE HEURISTIC */
  .option-card-mobile {
    border-radius: 8px !important;
  }

  .option-header-mobile {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    padding: 12px !important;
    width: 100%;
  }

  .option-info-mobile {
    display: flex !important;
    align-items: flex-start !important;
    flex-grow: 1;
    min-width: 0;
    min-width: 100%;
    margin-bottom: 8px;
  }

  .option-chip-mobile {
    flex-shrink: 0 !important;
    margin-right: 12px !important;
    background-color: rgba(var(--v-theme-primary), 0.1) !important;
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600;
    min-width: 40px !important;
    justify-content: center;
    height: 32px !important;
    margin-top: 2px;
  }

  .option-content-mobile {
    flex-grow: 1;
    min-width: 0;
  }

  .option-title-mobile {
    font-size: 1rem !important;
    line-height: 1.3;
    word-break: break-word;
    overflow-wrap: break-word;
    flex-grow: 1;
    min-width: 0;
  }

  .option-desc-mobile {
    font-size: 0.875rem !important;
    line-height: 1.4;
    color: rgba(0, 0, 0, 0.6);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Option actions - exactly like heuristic actions */
  .option-actions-mobile {
    display: flex !important;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    justify-content: flex-end;
    margin-top: 0;
  }

  .action-btn-mobile {
    min-width: 36px !important;
    width: 36px !important;
    height: 36px !important;
  }

  /* Mobile empty state */
  .empty-options-card-mobile {
    padding: 24px 16px !important;
    margin: 16px 0 !important;
  }

  .empty-options-card-mobile .v-icon {
    font-size: 48px !important;
    height: 48px !important;
    width: 48px !important;
  }

  .empty-options-card-mobile h3.text-h6 {
    font-size: 1.1rem !important;
  }

  .empty-state-text-mobile {
    font-size: 0.875rem !important;
    line-height: 1.5;
    max-width: 90%;
    margin: 0 auto;
  }

  /* Options footer */
  .options-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    background-color: rgba(0, 0, 0, 0.02);
    margin-top: 8px;
    border-radius: 0 0 8px 8px;
  }

  .items-count {
    font-size: 0.875rem !important;
  }

  .mobile-add-btn {
    display: flex !important;
    font-size: 0.875rem !important;
    padding: 6px 12px !important;
    min-height: 36px !important;
  }

  /* Adjust padding for mobile */
  .v-container.fluid.pa-6,
  .v-card.pa-6 {
    padding: 16px !important;
  }
}

/* Desktop Empty State Styles */
.desktop-empty-state {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.empty-options-card--desktop {
  margin: 0 auto;
  padding: 48px;
  border-radius: 12px;
  max-width: 720px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
  height: 56px !important;
  width: 56px !important;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
}

.empty-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.6);
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

@media (min-width: 1024px) {
  .empty-options-card--desktop {
    padding: 64px;
    max-width: 800px;
  }

  .empty-icon {
    font-size: 72px;
    height: 72px !important;
    width: 72px !important;
  }

  .empty-title {
    font-size: 1.5rem;
  }

  .empty-text {
    font-size: 1.05rem;
    max-width: 560px;
  }
}

@media (min-width: 1440px) {
  .empty-options-card--desktop {
    padding: 80px;
    max-width: 900px;
  }

  .empty-icon {
    font-size: 88px;
    height: 88px !important;
    width: 88px !important;
  }

  .empty-title {
    font-size: 1.75rem;
  }

  .empty-text {
    font-size: 1.15rem;
    max-width: 640px;
  }
}

/* Very small mobile screens */
@media (max-width: 480px) {

  /* Further reduce padding */
  .v-container.fluid.pa-6,
  .v-card.pa-6 {
    padding: 12px !important;
  }

  /* Adjust title size */
  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.5rem !important;
  }

  /* More compact mobile option headers */
  .option-header-mobile {
    padding: 10px !important;
  }

  .option-info-mobile {
    margin-bottom: 6px;
  }

  .option-title-mobile {
    font-size: 0.95rem !important;
  }

  .option-desc-mobile {
    font-size: 0.8125rem !important;
    -webkit-line-clamp: 1;
  }

  .option-chip-mobile {
    font-size: 0.875rem !important;
    height: 28px !important;
    min-width: 36px !important;
    margin-right: 8px !important;
  }

  /* Smaller action buttons matching heuristic */
  .action-btn-mobile {
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }

  /* Compact empty state */
  .empty-options-card-mobile {
    padding: 20px 12px !important;
  }

  .empty-options-card-mobile .v-icon {
    font-size: 40px !important;
    height: 40px !important;
    width: 40px !important;
  }

  .empty-state-text-mobile {
    font-size: 0.8125rem !important;
  }

  /* Smaller add button */
  .mobile-add-btn {
    font-size: 0.8125rem !important;
    padding: 4px 8px !important;
    min-height: 32px !important;
  }

  .items-count {
    font-size: 0.8125rem !important;
  }
}

/* iPhone SE / Small phone screens */
@media (max-width: 375px) {
  .mobile-header {
    gap: 12px;
  }

  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.25rem !important;
  }

  .add-option-btn {
    padding: 8px 12px !important;
    min-height: 40px !important;
  }

  .add-option-btn :deep(.v-icon) {
    margin-right: 4px !important;
    font-size: 18px !important;
  }

  /* Ultra compact option headers */
  .option-header-mobile {
    padding: 8px !important;
  }

  .option-info-mobile {
    margin-bottom: 4px;
  }

  .option-title-mobile {
    font-size: 0.9rem !important;
    line-height: 1.2;
  }

  .option-desc-mobile {
    font-size: 0.75rem !important;
    margin-top: 2px !important;
  }

  .option-chip-mobile {
    font-size: 0.75rem !important;
    height: 24px !important;
    min-width: 32px !important;
    margin-right: 6px !important;
  }

  /* Even smaller action buttons matching heuristic */
  .action-btn-mobile {
    min-width: 28px !important;
    width: 28px !important;
    height: 28px !important;
  }

  /* Ultra compact empty state */
  .empty-options-card-mobile {
    padding: 16px 10px !important;
    margin: 12px 0 !important;
  }

  .empty-options-card-mobile .v-icon {
    font-size: 36px !important;
    height: 36px !important;
    width: 36px !important;
    margin-bottom: 12px !important;
  }

  .empty-options-card-mobile h3.text-h6 {
    font-size: 1rem !important;
    margin-bottom: 8px !important;
  }

  .empty-state-text-mobile {
    font-size: 0.75rem !important;
    line-height: 1.4;
  }

  /* Ultra compact footer */
  .options-footer {
    padding: 8px !important;
  }

  .items-count {
    font-size: 0.75rem !important;
  }

  .mobile-add-btn {
    font-size: 0.75rem !important;
    padding: 3px 6px !important;
    min-height: 28px !important;
  }

  .mobile-add-btn :deep(.v-icon) {
    font-size: 16px !important;
    margin-right: 4px !important;
  }
}

.options-table-card {
  width: 100%;
}

:deep(.v-data-table) {
  width: 100%;
}

:deep(.v-data-table__wrapper) {
  width: 100%;
}
</style>