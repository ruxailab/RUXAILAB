<template>
  <v-row class="ma-0 pa-0">
    <v-col class="pt-0">
      <v-data-table
        height="420px"
        class="dataCard"
        :headers="headers"
        :items="heuristics"
        :items-per-page="5"
        show-expand
      >
        <template v-slot:top>
          <v-row class>
            <v-col class="ml-2 mb-1 pa-4 pb-0">
              <p class="subtitleView">Current Heuristics</p>
            </v-col>
            <v-col class="mr-2 mb-1 pb-0 pa-4">
              <v-row justify="end" class="ma-0 pa-0">
                <AddHeurBtn
                  :heuris="heuris"
                  :dialog="dialog"
                  @addHeuris="updateHeuristics"
                  @dialog="changeDialog"
                />
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="mb-4"></v-divider>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <!-- questions list -->
          <td :colspan="headers.length">
            <v-row>
              <v-col>
                <h2 class="mb-1 pl-2 subtitleView">{{ item.title }}</h2>
                <v-divider></v-divider>
                <div class="caption" v-if="item.questions.length > 0">
                  <v-list color="transparent">
                    <v-subheader>QUESTIONS:</v-subheader>
                    <v-col cols="10" class="pt-0">
                      <v-list-item v-for="(question, n) in item.questions" :key="n" inactive>
                        <v-list-item-content>{{n + 1}}) {{question.text}}</v-list-item-content>
                      </v-list-item>
                    </v-col>
                  </v-list>
                </div>
              </v-col>
            </v-row>
          </td>
        </template>

        <template v-slot:item.actions="{ item }">
          <!-- table actions -->
          <v-row justify="end" class="pr-1">
            <v-btn icon small class="mr-2" @click="editItem(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click="deleteItem(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </v-row>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>


<script>
import AddHeurBtn from "../atoms/NewHeuristicButton";

export default {
  props: ["heuristics", "answersSheet"],
  data: () => ({
    headers: [
      {
        text: "Title",
        align: "start",
        value: "title"
      },
      { text: "Edit/Delete", value: "actions", align: "end", sortable: false },
      { text: "", value: "data-table-expand" }
    ],
    heuris: {
      id: 0,
      total: 0,
      title: "",
      questions: []
    },
    dialog: false,
    editIndex: -1
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
              questions: this.arrayQuestions
            }
          )
        );
      } else {
        Object.assign(this.heuristics[this.editIndex], this.heuris);
        Object.assign(this.answersSheet.heuristics[this.editIndex], {
          id: this.heuris.id,
          total: this.heuris.total,
          questions: this.arrayQuestions
        });
        this.editIndex = -1;
      }
      this.heuristics.total = this.totalQuestions;
      this.answersSheet.total = this.totalQuestions;
      this.heuris = {
        id: this.heuristics[this.heuristics.length - 1].id + 1,
        title: "",
        total: 0,
        questions: []
      };
    },
    changeDialog(payload) {
      this.dialog = payload;
    },
    deleteItem(item) {
      this.heuristics.splice(this.heuristics.indexOf(item), 1);
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
    }
  },
  watch: {
    dialog() {
      if (!this.dialog && this.heuristics.length > 0) {
        this.heuris = {
          id: this.heuristics[this.heuristics.length - 1].id + 1,
          title: "",
          questions: []
        };
      }
    },
    heuristics() {
      this.$emit("change");
    }
  },
  computed: {
    arrayQuestions() {
      let array = Array.from(this.heuris.questions);
      let aux = [];
      console.log(array);
      array.forEach(el => {
        aux.push(Object.assign({}, { id: el.id, res: null }));
      });
      return aux;
    },
    totalQuestions() {
      let result = 0;
      this.heuristics.forEach(h => {
        result += h.total;
      });
      return result;
    }
  },
  components: {
    AddHeurBtn
  }
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