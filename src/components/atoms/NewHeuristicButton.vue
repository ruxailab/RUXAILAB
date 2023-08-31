<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="white--text"
      small
      @click="$emit('dialog', true)"
      disabled
      >Add new Heuristic</v-btn
    >

    <v-dialog width="500" v-model="dialog" persistent>
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">Add new Heuristic</p>
        <v-divider></v-divider>
        <v-row justify="center" class="ma-0">
          <v-col cols="11">
            <v-form ref="form">
              <v-text-field
                label="Title"
                class="mx-3"
                v-model="heuris.title"
                :rules="nameRequired"
              ></v-text-field>
              <v-row
                align="center"
                justify="space-around"
                class="mx-1"
                v-for="(n, i) in heuris.questions"
                :key="i"
              >
                <v-col cols="10" class="pt-0 pb-0">
                  <v-text-field
                    v-model="heuris.questions[i].text"
                    :label="'Question ' + (i + 1)"
                    :rules="questionRequired"
                  ></v-text-field>
                </v-col>

                <v-col cols="1">
                  <v-btn small icon>
                    <v-icon small @click="removeQuestion(i)">mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-btn color="#f9a826" text class="ma-3" @click="addQuestion()"
                >+ Add Question</v-btn
              >
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
    heuris: {
      type: Object,
      required: true,
    },
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    id: 0,
    nameRequired: [(v) => !!v || 'Name is required'],
    questionRequired: [(v) => !!v || 'Question has to be filled'],
  }),
  methods: {
    addQuestion() {
      if (this.heuris.questions.length > 0)
        this.id = this.heuris.questions[this.heuris.questions.length - 1].id + 1
      else this.id = 0
      this.heuris.questions.push({ id: this.id, text: '' })
      this.heuris.total = this.heuris.questions.length
    },
    removeQuestion(i) {
      this.heuris.questions.splice(i, 1)
      this.heuris.total = this.heuris.questions.length
    },
    validate() {
      if (this.$refs.form.validate()) {
        if (this.heuris.questions.length == 0) {
          alert('Please add at least one question to your heuristic')
        } else {
          this.$emit('dialog', false)
          this.$emit('addHeuris')
          this.$emit('change')
          this.resetVal()
        }
      }
    },
    resetVal() {
      this.$refs.form.resetValidation()
    },
  },
}
</script>

<style scoped>
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
