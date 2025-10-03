<template>
      <v-container
        fluid
        class="pa-6"
      >
        <v-card
          elevation="2"
          class="pa-6"
        >
        <!-- Header Section -->
        <div class="d-flex align-center justify-space-between mb-8">
          <div>
            <h1 class="text-h4 font-weight-bold text-on-surface">
              {{ $t('HeuristicsOptionsTable.titles.options') }}
            </h1>
          </div>

          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            variant="elevated"
            size="large"
            :disabled="testAnswerDocLength > 0"
            class="text-none"
            @click="dialog = true"
          >
            {{ $t('HeuristicsTable.titles.addOption') }}
          </v-btn>
        </div>

        <!-- Options Table -->
        <v-card>
          <v-data-table
            :headers="headers"
            :items="optionsWithFormattedValue"
            :items-per-page="-1"
            class="elevation-0"
          >
            <!-- Custom header styling -->
            <template #headers="{ columns }">
              <tr class="table-header">
                <th
                  v-for="column in columns"
                  :key="column.key"
                  class="text-left font-weight-medium text-ternary pa-4"
                  :style="{ width: column.width }"
                >
                  {{ column.title }}
                </th>
              </tr>
            </template>

            <!-- Custom row styling -->
            <template #item="{ item }">
              <tr class="table-row">
                <td class="pa-4">
                  <span class="text-body-1 text-on-surface">{{ item.text }}</span>
                </td>
                <td class="pa-4">
                  <span class="text-body-2 text-on-surface">{{ item.description }}</span>
                </td>
                <td class="pa-4">
                  <span class="text-body-1 text-on-surface font-weight-medium">{{ item.value }}</span>
                </td>
                <td class="pa-4">
                  <div class="d-flex gap-2">
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      color="primary"
                      :disabled="testAnswerDocLength > 0"
                      @click="editItem(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      :disabled="testAnswerDocLength > 0"
                      @click="deleteItem(item)"
                    />
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template #no-data>
              <v-card class="text-center pa-8 my-6" variant="outlined">
                <v-icon
                  icon="mdi-cog-outline"
                  size="64"
                  color="primary"
                  class="mb-4"
                />
                <h3 class="text-h6 text-ternary mb-2">
                  {{ $t('HeuristicsOptionsTable.titles.noOptions') }}
                </h3>
                <p class="text-body-2 text-ternary">
                  {{ $t('HeuristicsOptionsTable.messages.startAddingOptions') }}
                </p>
              </v-card>
            </template>
          </v-data-table>
        </v-card>

        <!-- AddOptionBtn Component -->
        <AddOptionBtn
          v-model:dialog="dialog"
          :option="option"
          :has-value="hasValue"
          @change-has-value="updateHasValue"
          @add-option="updateOptions"
          @change="emitChange"
        />
        </v-card>
      </v-container>
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
  },
  {
    title: t('common.description'),
    align: 'end',
    value: 'description',
  },
  {
    title: t('common.value'),
    align: 'end',
    value: 'value',
  },
  {
    title: t('common.editDelete'),
    value: 'actions',
    align: 'end',
    sortable: false,
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
  store.state.Tests.Test.testOptions.map((opt) => ({
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
</style>
