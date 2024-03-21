<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="white--text"
      small
      :disabled="testAnswerDocLength > 0 ? true : false"
      :class="{
        disabledBtnBackground: testAnswerDocLength > 0,
      }"
      @click=";(dialog = true), resetIndex()"
    >
      {{ $t('HeuristicsTable.titles.addNewDescription') }}
    </v-btn>

    <v-dialog v-model="dialog" width="700" persistent>
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
          {{ $t('HeuristicsTable.titles.addNewDescription') }}
        </p>
        <v-divider />
        <v-row justify="center" class="ma-0">
          <v-col cols="11">
            <v-form ref="form" @submit.prevent="validate()">
              <v-row justify="center">
                <v-col cols="12">
                  <v-text-field
                    v-model="desc.title"
                    :rules="rule"
                    dense
                    outlined
                    :label="$t('common.title')"
                  />

                  <div>{{ $t('common.description') }}:</div>
                  <TextBox
                    ref="textbox"
                    @mounted="setDescriptionText"
                    @updateHtml="updateText"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn small text color="red lighten-1 white--text" @click="reset()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn
            v-if="editIndex !== null"
            small
            color="#f9a826"
            class="white--text"
            @click="validate()"
          >
            {{ $t('common.confirm') }}
          </v-btn>
          <v-btn
            v-else
            small
            color="#f9a826"
            class="white--text"
            @click="validate()"
          >
            {{ $t('common.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TextBox from '@/components/atoms/TextBox'
import i18n from '@/i18n'
import Vue from 'vue'

export default {
  components: {
    TextBox,
  },
  props: {
    questionIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    heuristicIndex: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data: () => ({
    dialog: false,
    desc: {
      title: '',
      text: '',
    },
    rule: [(v) => !!v || i18n.t('errors.fieldRequired')],
    editIndex: null,
    isMounted: false,
  }),
  computed: {
    question() {
      return this.$store.state.Tests.Test.testStructure[this.heuristicIndex].questions[this.questionIndex]
    },
    testAnswerDocLength() {
            if(!this.$store.getters.testAnswerDocument) {
        return 0
      }
      const heuristicAnswers = this.$store.getters.testAnswerDocument
        .heuristicAnswers
      const heuristicAnswersCount = Object.keys(heuristicAnswers).length

      return heuristicAnswersCount
    },
  },
  methods: {
    validate() {
      const valid = this.$refs.form.validate()
      if (valid && this.desc.text.length > 0) {
        this.$store.commit('setupHeuristicQuestionDescription', {
          heuristic: this.heuristicIndex,
          question: this.questionIndex,
          description: this.desc,
          editIndex: this.editIndex,
        })

        this.reset()
      } else if (valid && this.desc.text.length == 0) {
        Vue.$toast.info(i18n.t('alerts.addDescription'))
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.resetValidation()
      this.$refs.textbox.resetContent()
      this.desc = {
        title: '',
        text: '',
      }
      this.resetIndex()
    },
    resetIndex() {
      this.editIndex = null
    },
    updateText(html) {
      this.desc.text = html
    },
    editSetup(i) {
      //used when edit clicked
      this.dialog = true
      this.editIndex = i
      this.desc = Object.assign({}, this.question.descriptions[this.editIndex])
      if (this.isMounted) {
        this.setDescriptionText()
      }
    },
    setDescriptionText() {
      this.isMounted = true
      this.$refs.textbox.setContent(this.desc.text)
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
