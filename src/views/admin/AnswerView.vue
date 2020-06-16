<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-row v-if="!loading">
      <v-col cols="3">
        <v-card>
          <v-card-title>
            <div class="caption">HEURISTICS</div>
          </v-card-title>

          <v-list>
            <v-list-item @click="renderGraph()">Statistics</v-list-item>
            <v-list-item
              v-for="(heuris, i) in answers.answersSheet.heuristics"
              :key="i"
              @click="setHeaders(heuris,i),setItems(i)"
            >Heuristic {{i + 1}}</v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-card v-if="heurisSelected">
          <v-card-title>Heuristics {{heurisSelected}}</v-card-title>
          <v-text-field class="mx-3" append-icon="mdi-magnify" label="Search" v-model="search"></v-text-field>
          <v-data-table class="ma-2" :headers="headers" :items="items" :search="search"></v-data-table>

          <v-row justify="space-around">
            <v-col>
              <v-card v-for="(item,i) in dataQuestions" :key="i">
                <v-row justify="center">
                  <v-col>
                    <h3>{{item.question}}</h3>
                    <QuestionChart :data="item.data" />
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card>

        <v-card v-else-if="graphSelected">GraphSelected</v-card>
        <h2 v-else class="ml-3">Please select a heuristic</h2>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import QuestionChart from "@/components/atoms/QuestionChart.vue";
export default {
  props: ["id"],
  components: {
    QuestionChart
  },
  data: () => ({
    search: "",
    heurisSelected: null,
    graphSelected: null,
    headers: [],
    items: [],
    graph: [],
    dataQuestions: []
  }),
  methods: {
    setItems(index) {
      this.items = [];

      let aux;

      this.answers.answers.forEach(answer => {
        aux = {
          uid: null,
          questions: []
        };
        aux.uid = answer.uid;
        aux.questions = Array.from(answer.heuristics[index].questions);
        this.items.push(aux);
      });
      let ids = [];
      aux.questions.forEach(q => {
        ids.push(q.id);
      });
      this.questionGraph(this.items, ids);
    },
    setHeaders(heuris, i) {
      let index = 0;
      (this.heurisSelected = i + 1), (this.headers = []);
      this.headers.push({
        text: "ID",
        align: "start",
        value: "uid"
      });

      heuris.questions.forEach(question => {
        this.headers.push({
          text: "Question " + (question.id + 1).toString(),
          value: `questions[${index}].res`
        });
        index++;
      });
    },
    renderGraph() {
      this.graphSelected = true;
      this.heurisSelected = null;
    },
    questionGraph(data, ids) {
      this.dataQuestions = [];
      var questionMap = new Map();
      ids.forEach(id => {
        let aux = [];
        data.forEach(item => {
          aux.push(item.questions.find(q => q.id == id).res);
        });
        questionMap.set(`Question ${id}`, aux);
      });

      let possibleAnswers = [1, 0.5, 0, -1, null];
      for (var [key, value] of questionMap.entries()) {
        let aux = [];
        possibleAnswers.forEach(el => {
          aux.push(value.filter(v => v == el).length);
        });
        this.dataQuestions.push({
          question: key,
          data: aux
        });
      }
    },
    statistics() {
      const answers = this.answers.answers;
      const answersResults = new Map();
      const heurisResults = new Map();
      //Resusltado Total Test
      const ResultTest = answers.reduce((total, answer) => {
        let res = answer.heuristics.reduce((totalHeuris, heuris) => {
          let res = heuris.questions.reduce((totalQuestions, question) => {
            console.info(`${totalQuestions} total até o momento`);
            console.log("Question", question);
            return totalQuestions + question.res;
          }, 0);
          const collection = heurisResults.get(`heuristics ${heuris.id+1}`);
          if (!collection) {
            heurisResults.set(`heuristics ${heuris.id+1}`,res);
          } else {
            let aux = collection+res
            heurisResults.set(`heuristics ${heuris.id+1}`,aux);
          }
          return totalHeuris + res;
        }, 0);
        answersResults.set(answer.uid, res);
        return total + res;
      }, 0);
      console.log("ResultTest", ResultTest);
      console.log("answersResults", answersResults);
      console.log("heurisResults", heurisResults);
    }
  },
  computed: {
    answers() {
      return this.$store.state.answers.answers || [];
    },
    loading() {
      return this.answers.length == 0;
    }
  },
  watch: {
    answers() {
      if (this.answers !== null || this.answers.length > 0) {
        this.statistics();
      }
    }
  },
  created() {
    if (
      !this.$store.state.answers.answers ||
      !this.$store.state.answers.answers.id !== this.id
    ) {
      this.$store.dispatch("getAnswers", { id: this.id });
    }
  }
};
</script>