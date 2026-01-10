<template>
  <div>
    <v-dialog
      :model-value="dialog"
      width="500"
      persistent
      @update:model-value="$emit('update:dialog', $event)"
    >
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
          {{ $t('HeuristicsTable.titles.addOption') }}
        </p>
        <v-divider />
        <v-row
          justify="center"
          class="ma-0"
        >
          <v-col cols="11">
            <v-form ref="form">
              <v-row
                justify="center"
                align="center"
              >
                <v-col cols="6">
                  <v-text-field
                    v-model="localOption.text"
                    max-length="100"
                    counter="100"
                    :label="$t('common.text')"
                    variant="outlined"
                    :rules="textRequired"
                  />
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model.number="localOption.value"
                    :label="$t('common.value')"
                    :disabled="!localHasValue"
                    type="number"
                    placeholder="Ex. 0.5"
                    :rules="valueRequired"
                    variant="outlined"
                    step="0.5"
                  />
                </v-col>
              </v-row>

              <v-row
                justify="center"
                align="center"
              >
                <v-col cols="12">
                  <v-text-field
                    v-model="localOption.description"
                    variant="outlined"
                    max-length="250"
                    counter="250"
                    :label="$t('HeuristicsTable.placeholders.optionDescription')"
                  />
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-checkbox
                  v-model="localHasValue"
                  :label="$t('HeuristicsTable.titles.hasValue')"
                />
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="small"
            variant="text"
            color="red-lighten-1"
            @click="cancel"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>

          <v-btn
            size="small"
            class="text-white bg-orange"
            @click="validate"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  option: { type: Object, required: true },
  dialog: { type: Boolean, default: false },
  hasValue: { type: Boolean, required: true, default: true },
});

const emit = defineEmits(['update:dialog', 'changeHasValue', 'addOption', 'change']);

const { t } = useI18n();
const store = useStore();
const form = ref(null);

const textRequired = [(v) => !!v || t('HeuristicsTable.validation.textRequired')];
const localOption = ref({ text: '', value: null, description: '' });
const localHasValue = ref(true);

const testAnswerDocLength = computed(() => {
  if (!store.getters.testAnswerDocument) return 0;
  const heuristicAnswers = store.getters.testAnswerDocument.heuristicAnswers;
  return Object.keys(heuristicAnswers).length;
});

const valueRequired = computed(() => {
  if (!localHasValue.value) return [];
  return [
    (v) => (v !== null && v !== '' && v >= 0) || t('HeuristicsTable.validation.textRequired'),
  ];
});

watch(
  () => props.option,
  (newOption) => {
    localOption.value = { ...newOption };
  },
  { deep: true, immediate: true }
);

watch(
  () => props.hasValue,
  (newValue) => {
    localHasValue.value = newValue;
  },
  { immediate: true }
);

watch(localHasValue, (newValue) => {
  if (!newValue) localOption.value.value = null;
  emit('changeHasValue', newValue);
});

const validate = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    const optionToSave = { ...localOption.value };
    if (!localHasValue.value) optionToSave.value = null;
    emit('addOption', optionToSave);
    emit('change');
    emit('update:dialog', false);
    resetVal();
  }
};

const cancel = () => {
  emit('update:dialog', false);
  resetVal();
};

const resetVal = () => {
  localOption.value = { text: '', value: null, description: '' };
  localHasValue.value = true;
  form.value.resetValidation();
};
</script>

<style scoped>
.disabledBtn {
  color: rgba(134, 125, 125, 0.438) !important;
}
.disabledBtnBackground {
  background-color: rgba(185, 185, 185, 0.308);
}
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>