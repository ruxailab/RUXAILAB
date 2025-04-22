<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="text-white"
      size="small"
      disabled
      @click="$emit('openDialog')"
    >
      {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
    </v-btn>

    <v-dialog
      :model-value="localDialog"
      width="500"
      persistent
      @update:model-value="updateDialog"
    >
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
          {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
        </p>
        <v-divider />
        <v-row
          justify="center"
          class="ma-0"
        >
          <v-col cols="11">
            <v-form ref="form">
              <v-text-field
                v-model="localHeuris.title"
                label="Title"
                class="mx-3"
                :rules="nameRequired"
              />
              <v-row
                v-for="(n, i) in localHeuris.questions"
                :key="i"
                align="center"
                justify="space-around"
                class="mx-1"
              >
                <v-col
                  cols="10"
                  class="pt-0 pb-0"
                >
                  <v-text-field
                    v-model="localHeuris.questions[i].text"
                    :label="'Question ' + (i + 1)"
                    :rules="questionRequired"
                  />
                </v-col>

                <v-col cols="1">
                  <v-btn
                    size="small"
                    icon
                  >
                    <v-icon
                      size="small"
                      @click="removeQuestion(i)"
                    >
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-btn
                color="#f9a826"
                variant="text"
                class="ma-3"
                @click="addQuestion()"
              >
                {{ $t('HeuristicsTable.titles.addNewQuestion') }}
              </v-btn>
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
            @click="closeDialog"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            size="small"
            color="#f9a826"
            class="text-white"
            @click="validate"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import i18n from '@/i18n'
import { cloneDeep } from 'lodash'

export default {
  props: {
    heuris: {
      type: Object,
      required: true,
    },
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['openDialog', 'update:dialog', 'addHeuris', 'change'],
  data: () => ({
    id: 0,
    localDialog: false,
    localHeuris: { title: '', questions: [], total: 0 },
    nameRequired: [(v) => !!v || i18n.t('HeuristicsTable.validation.nameRequired')],
    questionRequired: [(v) => !!v || i18n.t('HeuristicsTable.validation.questionRequired')],
  }),
  watch: {
    dialog(newVal) {
      this.localDialog = newVal
      if (newVal) {
        this.localHeuris = cloneDeep(this.heuris)
      }
    },
    heuris: {
      handler(newVal) {
        if (!this.localDialog) {
          this.localHeuris = cloneDeep(newVal)
        }
      },
      deep: true,
    },
  },
  methods: {
    addQuestion() {
      if (this.localHeuris.questions.length > 0) {
        this.id = this.localHeuris.questions[this.localHeuris.questions.length - 1].id + 1
      } else {
        this.id = 0
      }
      this.localHeuris.questions.push({ id: this.id, text: '' })
      this.localHeuris.total = this.localHeuris.questions.length
    },
    removeQuestion(i) {
      this.localHeuris.questions.splice(i, 1)
      this.localHeuris.total = this.localHeuris.questions.length
    },
    validate() {
      if (this.$refs.form.validate()) {
        if (this.localHeuris.questions.length === 0) {
          this.$toast.info(i18n.t('HeuristicsTable.validation.addQuestion'))
        } else {
          this.$emit('update:dialog', false)
          this.$emit('addHeuris', cloneDeep(this.localHeuris))
          this.$emit('change')
          this.resetVal()
        }
      }
    },
    resetVal() {
      this.localHeuris = { title: '', questions: [], total: 0 }
      this.$refs.form.resetValidation()
    },
    updateDialog(value) {
      this.localDialog = value
      this.$emit('update:dialog', value)
    },
    closeDialog() {
      this.$emit('update:dialog', false)
      this.resetVal()
    },
  },
}
</script>

<style scoped>
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