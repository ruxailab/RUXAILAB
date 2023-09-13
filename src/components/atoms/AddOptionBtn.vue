<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="white--text"
      small
      @click="$emit('dialog', true)"
      :disabled="testAnswerDocLength > 0 ? true : false"
      :class="{
        disabledBtnBackground: testAnswerDocLength > 0,
      }"
      >Add a new Option</v-btn
    >

    <v-dialog width="500" v-model="dialog" persistent>
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">Add a new Option</p>
        <v-divider></v-divider>
        <v-row justify="center" class="ma-0">
          <v-col cols="11">
            <v-form ref="form">
              <v-row justify="center" align="center">
                <v-col cols="6">
                  <v-text-field
                    maxLength="100"
                    counter="100"
                    v-model="option.text"
                    label="Text"
                    :rules="textRequired"
                  ></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model.number="option.value"
                    label="Value"
                    :disabled="!hasValue"
                    type="number"
                    placeholder="Ex. 0.5"
                    :rules="valueRequired"
                    :step="0.5"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- New row for Option description -->
              <v-row justify="center" align="center">
                <v-col cols="12">
                  <v-text-field
                    maxLength="100"
                    counter="100"
                    v-model="option.description"
                    label="Option description"
                    :rules="textRequired"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-checkbox
                  v-model="hasValueState"
                  label="Has Value"
                ></v-checkbox>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="$emit('dialog', false), resetVal()"
            small
            text
            color="red lighten-1 white--text"
            >Cancel</v-btn
          >

          <v-btn @click="validate()" small color="#f9a826" class="white--text"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
  data: () => ({
    textRequired: [(v) => !!v || 'Text is required'],
  }),
  computed: {
    testAnswerDocLength() {
      let heuristicAnswers = this.$store.getters.testAnswerDocument
        .heuristicAnswers
      let heuristicAnswersCount = Object.keys(heuristicAnswers).length

      return heuristicAnswersCount
    },
    hasValueState: {
      get() {
        return this.hasValue
      },
      set() {
        this.$emit('changeHasValue')
      },
    },
    valueRequired() {
      if (
        this.hasValue ||
        (this.option.value !== null && this.option.value >= 0)
      ) {
        return [
          (v) =>
            (v !== '' && v !== null && v >= 0) ||
            'Value must be a positive number',
        ]
      } else {
        return []
      }
    },
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        if (!this.hasValue) {
          this.option.value = null
        }
        this.$emit('dialog', false)
        this.$emit('addOption')
        this.$emit('change')
        this.resetVal()
      }
    },
    resetVal() {
      this.$refs.form.resetValidation()
    },
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.hasValue = true
      }
    },
  },
}
</script>

<style scoped>
.disabledBtn {
  color: rgba(134, 125, 125, 0.438) !important;
}
.disabledBtnBackground {
  background-color: rgba(185, 185, 185, 0.308);
}
.subtitleView {
  font-family: Roboto;
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
