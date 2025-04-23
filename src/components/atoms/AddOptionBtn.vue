<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="text-white"
      size="small"
      :disabled="testAnswerDocLength > 0"
      :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
      @click="$emit('dialog', true)"
    >
      {{ $t('HeuristicsTable.titles.addOption') }}
    </v-btn>

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
                    :step="0.5"
                  />
                </v-col>
              </v-row>

              <!-- New row for Option description -->
              <v-row
                justify="center"
                align="center"
              >
                <v-col cols="12">
                  <v-text-field
                    v-model="localOption.description"
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
            @click="$emit('update:dialog', false), resetVal()"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>

          <v-btn
            size="small"
            color="#f9a826"
            class="text-white"
            @click="validate()"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import i18n from '@/i18n';

export default {
  props: {
    option: {
      type: Object,
      required: true,
    },
    dialog: {
      type: Boolean,
      default: false,
    },
    hasValue: {
      type: Boolean,
      required: true,
      default: true, 
    },
  },
  emits: ['dialog', 'update:dialog', 'changeHasValue', 'addOption', 'change'],
  data: () => ({
    textRequired: [(v) => !!v || i18n.global.t('HeuristicsTable.validation.textRequired')],
    localOption: { text: '', value: null, description: '' },
    localHasValue: true,
  }),
  computed: {
    testAnswerDocLength() {
      if (!this.$store.getters.testAnswerDocument) {
        return 0;
      }
      const heuristicAnswers = this.$store.getters.testAnswerDocument.heuristicAnswers;
      return Object.keys(heuristicAnswers).length;
    },
    valueRequired() {
      if (this.localHasValue || (this.localOption.value !== null && this.localOption.value >= 0)) {
        return [
          (v) =>
            (v !== '' && v !== null && v >= 0) ||
            i18n.global.t('HeuristicsTable.validation.textRequired'),
        ];
      }
      return [];
    },
  },
  watch: {
    option: {
      handler(newOption) {
        this.localOption = { ...newOption };
      },
      deep: true,
      immediate: true,
    },
    hasValue: {
      handler(newValue) {
        this.localHasValue = newValue;
      },
      immediate: true,
    },
    localHasValue(newValue) {
      this.$emit('changeHasValue', newValue);
    },
    dialog(newValue) {
      if (!newValue) {
        this.localHasValue = true;
      }
    },
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        if (!this.localHasValue) {
          this.localOption.value = null;
        }
        this.$emit('addOption', { ...this.localOption });
        this.$emit('change');
        this.$emit('update:dialog', false);
        this.resetVal();
      }
    },
    resetVal() {
      this.localOption = { text: '', value: null, description: '' };
      this.localHasValue = true;
      this.$refs.form.resetValidation();
    },
  },
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