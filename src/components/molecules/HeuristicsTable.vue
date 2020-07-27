<template>
  <v-row class="ma-0 pa-0">
    <v-col class="pt-0">
      <!--Card create/edit-->
      <v-dialog v-model="dialog" width="800" persistent>
        <v-card v-if="!itemEdit">
          <v-card-title
            class="headline white--text"
            style="background-color:#fca326"
            primary-title
          >Creating a heuristic</v-card-title>
          <v-stepper v-model="step">
            <v-stepper-header>
              <v-stepper-step color="#fca326" step="1" :complete="step>1">Name the heuristic</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step color="#fca326" step="2">Initialize first question</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <v-row>
                  <v-col cols="10">
                    <v-form ref="form">
                      <v-text-field
                        v-model="heuris.title"
                        dense
                        label="Title Heuristic"
                        outlined
                        class="mx-3"
                        :rules="nameRequired"
                      ></v-text-field>
                    </v-form>
                  </v-col>
                </v-row>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-row>
                  <v-col cols="10" class="mx-3">
                    <v-form ref="form1">
                      <v-text-field
                        v-model="heuris.questions[0].text"
                        dense
                        label="Title Question"
                        outlined
                        :rules="questionRequired"
                      ></v-text-field>
                    </v-form>
                  </v-col>
                </v-row>
              </v-stepper-content>
            </v-stepper-items>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="lighten-2" text @click="dialog = false,resetVal(),step=1">Cancel</v-btn>
              <v-btn
                v-if="step < 2"
                class="white--text"
                color="#fca326"
                @click="validateHeuristic()"
              >Next</v-btn>
              <v-btn v-else class="white--text" color="#fca326" @click="validateQuestion()">Save</v-btn>
            </v-card-actions>
          </v-stepper>
        </v-card>
        <v-card v-else>
          <v-card-title
            class="headline white--text"
            style="background-color:#fca326"
            primary-title
          >Edit heuristic</v-card-title>
          <v-row class="ma-0 mt-3">
            <v-col cols="10">
              <v-form ref="form">
                <v-text-field
                  v-model="itemEdit.title"
                  dense
                  label="Title Heuristic"
                  outlined
                  class="mx-3"
                  :rules="nameRequired"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>
          {{itemEdit}}
          {{heuristics[itemSelect]}}
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              class="lighten-2"
              text
              @click="dialog = false,resetVal(),step=1,itemEdit = null"
            >Cancel</v-btn>
            <v-btn class="white--text" color="#fca326" @click="validateHeuristic()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-card class="dataCard">
        <v-card-title class="subtitleView">Current Heuristics</v-card-title>
        <v-divider></v-divider>
        <v-row justify="space-around">
          <v-row class="ma-0 pa-0" v-if="heuristics.length">
            <v-col class="ma-0 pr-0" cols="3">
              <!--Heuristics List-->
              <v-list dense height="550px" outlined>
                <v-subheader>Heuristics</v-subheader>
                <v-divider></v-divider>
                <v-list-item @click="dialog=true">
                  <v-list-item-icon>
                    <v-icon color="#fca326">mdi-plus</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title style="color:#fca326">Add new heuristic</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item-group v-model="itemSelect" color="#fca326">
                  <v-list-item v-for="(item, i) in heuristics" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>{{item.title}}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon v-if="i == itemSelect">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-divider vertical inset></v-divider>
            <!--Questions List-->
            <v-col class="ma-0 pr-0 pl-0" cols="3" v-if="itemSelect!=null">
              <v-list dense height="550px" outlined>
                <v-subheader>
                  {{heuristics[itemSelect].title}} - Questions
                  <v-spacer></v-spacer>
                  <v-menu v-model="menuHeuristics" offset-x>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list dense>
                    <!--Edit Heuris Flag -->
                      <v-list-item @click="dialog=true; itemEdit = heuristics[itemSelect]">
                        <v-list-item-icon>
                          <v-icon>mdi-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Edit heuristic</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="deleteHeuristic(itemSelect)">
                        <v-list-item-icon>
                          <v-icon>mdi-delete</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Delete heuristic</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-subheader>
                <v-divider></v-divider>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon color="#fca326">mdi-plus</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title style="color:#fca326">Add new question</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item-group v-model="questionSelect" color="#fca326">
                  <v-list-item v-for="(item, i) in heuristics[itemSelect].questions" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>{{item.text}}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon v-if="i == questionSelect">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-divider vertical inset></v-divider>
            <!--Questions content-->
            <v-col class="ma-0 pl-0" v-if="questionSelect!=null">
              <v-card height="550px">
                <v-subheader class="pa-2">
                  {{heuristics[itemSelect].questions[questionSelect].text}}
                  <v-spacer></v-spacer>
                  <v-menu v-model="menuQuestions" offset-x>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item
                        @click="dialog=true; itemEdit = heuristics[itemSelect].questions[questionSelect]"
                      >
                        <v-list-item-icon>
                          <v-icon>mdi-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Edit question</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="deleteQuestion(questionSelect)">
                        <v-list-item-icon>
                          <v-icon>mdi-delete</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Delete question</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-subheader>
                <v-divider></v-divider>
                <v-card-text>{{heuristics}}</v-card-text>
                <v-card-text>{{answersSheet}}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-col cols="10" v-else>
            <p class="subtitleView">You don't have heuristic yet, start one.</p>
            <v-btn @click="dialog=true" icon x-large color="grey">
              <v-icon>mdi-plus-circle-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>


<script>
export default {
  props: ["heuristics", "answersSheet"],

  data: () => ({
    menuHeuristics: false,
    menuQuestions: false,
    itemSelect: null,
    questionSelect: null,
    itemEdit: null,
    headers: [
      {
        text: "Title",
        align: "start",
        value: "title",
      },
      { text: "Edit/Delete", value: "actions", align: "end", sortable: false },
      { text: "", value: "data-table-expand" },
    ],
    dialog: false,
    editIndex: -1,
    step: 1,
    nameRequired: [(v) => !!v || "Name is required"],
    questionRequired: [(v) => !!v || "Question has to be filled"],
  }),
  methods: {
    updateHeuristics() {
      if (this.editIndex == -1) {
        this.heuristics.push(this.heuris);
        this.answersSheet.heuristics.push(
          Object.assign(
            {},
            {
              id: this.heuris.id,
              total: this.heuris.total,
              questions: this.arrayQuestions,
            }
          )
        );
      } else {
        Object.assign(this.heuristics[this.editIndex], this.heuris);
        Object.assign(this.answersSheet.heuristics[this.editIndex], {
          id: this.heuris.id,
          total: this.heuris.total,
          questions: this.arrayQuestions,
        });
        this.editIndex = -1;
      }
      this.heuristics.total = this.totalQuestions;
      this.answersSheet.total = this.totalQuestions;
      this.heuris = {
        id: this.heuristics[this.heuristics.length - 1].id + 1,
        title: "",
        total: 0,
        questions: [],
      };
    },
    changeDialog(payload) {
      this.dialog = payload;
    },
    deleteHeuristic(item) {
      let config = confirm(
        `Are you sure delete the heuristic ${this.heuristics[item].title}?`
      );

      if (config) {
        this.heuristics.splice(item, 1);
        this.itemSelect = null;
        this.questionSelect = null;
        this.answersSheet.total = this.totalQuestions;
      }
      this.menuQuestions = false;
      this.menuHeuristics = false;
    },
    deleteQuestion(item) {
      if (this.heuristics[this.itemSelect].questions.length > 1) {
        let config = confirm(
          `Are you sure delete the Question ${
            this.heuristics[this.itemSelect].questions[item].text
          }?`
        );

        if (config) {
          this.heuristics[this.itemSelect].questions.splice(item, 1);
          this.questionSelect = null;
          this.answersSheet.total = this.totalQuestions;
        }
      } else {
        alert("Sorry, but you can't delete all heuristics questions");
      }

      this.menuQuestions = false;
      this.menuHeuristics = false;
    },
    editItem(item) {
      this.editIndex = this.heuristics.indexOf(item);
      this.heuris.id = this.heuristics[this.editIndex].id;
      this.heuris.title = this.heuristics[this.editIndex].title;
      this.heuris.questions = Array.from(
        this.heuristics[this.editIndex].questions
      );
      this.heuristics.total = this.totalQuestions;
      this.answersSheet.total = this.totalQuestions;
      this.dialog = true;
    },
    emitChange() {
      this.$emit("change");
    },
    addQuestion() {
      if (this.heuris.questions.length > 0)
        this.id =
          this.heuris.questions[this.heuris.questions.length - 1].id + 1;
      else this.id = 0;
      this.heuris.questions.push({ id: this.id, text: "" });
      this.heuris.total = this.heuris.questions.length;
    },
    validateHeuristic() {
      if (this.$refs.form.validate()) {
        this.step = 2;
        this.$refs.form.resetValidation();
      }
    },
    validateQuestion() {
      if (this.$refs.form1.validate()) {
        this.step = 1;
        this.dialog = false;
        this.updateHeuristics();
         this.$refs.form1.resetValidation();
      }
    },
    resetVal() {
      this.$refs.form.resetValidation();
      this.$refs.form1.resetValidation();
    },
  },
  watch: {
    dialog() {
      if (!this.dialog && this.heuristics.length > 0 && !this.itemEdit) {
        this.heuris = {
          id: this.heuristics[this.heuristics.length - 1].id + 1,
          title: "",
          total: 0,
          questions: [
            {
              id: 0,
              text: "",
            },
          ],
        };
        this.heuris.total = this.heuris.questions.length;
      }
    },
    heuristics() {
      this.$emit("change");
    },
    itemSelect() {
      if (this.itemSelect != null) this.questionSelect = 0;
      else this.questionSelect = null;
    },
  },
  computed: {
    arrayQuestions() {
      let array = Array.from(this.heuris.questions);
      let aux = [];
      array.forEach((el) => {
        aux.push(Object.assign({}, { id: el.id, res: "", com: "" }));
      });
      return aux;
    },
    totalQuestions() {
      let result = 0;
      this.heuristics.forEach((h) => {
        result += h.total;
      });
      return result;
    },
  },

  created() {
    if (this.heuristics.length) {
      this.heuris = {
        id: this.heuristics[this.heuristics.length - 1].id + 1,
        total: 0,
        title: "",
        questions: [
          {
            id: 0,
            text: "",
          },
        ],
      };
    } else {
      this.heuris = {
        id: 0,
        total: 0,
        title: "",
        questions: [
          {
            id: 0,
            text: "",
          },
        ],
      };
    }
    this.heuris.total = this.heuris.questions.length;
  },
};
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
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
}
</style>