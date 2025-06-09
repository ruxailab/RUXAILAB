<template>
  <div class="mt-0 pa-0 rounded-sm">
    <v-data-table
      height="420px"
      style="background: #f5f7ff;"
      :headers="headers"
      :items="optionsWithFormattedValue"
      :items-per-page="-1"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon
          :disabled="testAnswerDocLength > 0"
          size="small"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          :disabled="testAnswerDocLength > 0"
          size="small"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>

      <template #top>
        <v-row
          class="ma-0"
          align="center"
        >
          <v-card-title class="subtitleView">
            {{ $t('HeuristicsOptionsTable.titles.options') }}
          </v-card-title>
          <v-row
            justify="end"
            class="ma-0 pa-0 mr-4"
          >
            <v-btn
              rounded
              color="#f9a826"
              class="text-white"
              size="small"
              :disabled="testAnswerDocLength > 0"
              :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
              @click="dialog = true"
            >
              {{ $t('HeuristicsTable.titles.addOption') }}
            </v-btn>
            <AddOptionBtn
              v-model:dialog="dialog"
              :option="option"
              :has-value="hasValue"
              @change-has-value="updateHasValue"
              @add-option="updateOptions"
              @change="emitChange"
            />
          </v-row>
        </v-row>
        <v-divider class="mb-4" />
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import AddOptionBtn from '../atoms/AddOptionBtn';

const store = useStore();
const { t } = useI18n();

const emit = defineEmits(['change']);

const headers = ref([
  {
    title: t('commoitle'),
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
    value: opt.value === null ? 'No value' : opt.value,
  })),
);

const testAnswerDocLength = computed(() => {
  const testAnswerDocument = store.getters.testAnswerDocument;
  if (!testAnswerDocument) return 0;
  const heuristicAnswers = testAnswerDocument.heuristicAnswers;
  return Object.keys(heuristicAnswers).length;
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
  console.log('Received newOption:', newOption);
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
.subtitleView {
  font-style: normal;
  font-weight: 500;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
.disabledBtnBackground {
  background-color: rgba(185, 185, 185, 0.308);
}
</style>