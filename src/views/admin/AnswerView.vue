<template >
  <v-row class="container">
    <v-col>
      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
      <v-row v-if="!loading" dense justify="center">
        <v-col cols="3">
          <v-card class="scroll cardAnswers" height="450px" dense>
            <v-card-title>
              <div class="caption">HEURISTICS</div>
            </v-card-title>

            <v-list class="cardAnswers">
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
          <v-card v-if="heurisSelected" class="scroll cardAnswers" height="450px" dense >
            <v-card-title>Heuristics {{heurisSelected}}</v-card-title>
            <v-row justify="center" dense>
              <v-col class="mx-3">
                <v-text-field
                  class="mx-3"
                  append-icon="mdi-magnify"
                  label="Search"
                  v-model="search"
                ></v-text-field>
                <v-data-table class="ma-2 cardAnswers" :headers="headers" :items="items" :search="search"></v-data-table>

                <v-card v-for="(item,i) in dataQuestions" :key="i" dense class="cardAnswers">
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

          <v-card v-else-if="graphSelected" class="scroll cardAnswers" height="450px">
            <v-card-title>Statistics</v-card-title>
            <v-row justify="space-around">
              <v-col cols="4">
                <v-card width="250">
                  <v-row justify="center">
                    <v-card-title>Test's average</v-card-title>
                    <v-card-text>
                      <v-row align="center" justify="center">
                        <p class="display-3">{{testData.average}}</p>
                      </v-row>
                    </v-card-text>
                  </v-row>
                  <v-list class="transparent">
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-arrow-up-bold-hexagon-outline</v-icon>
                      </v-list-item-icon>

                      <v-list-item-title>Max</v-list-item-title>
                      <v-list-item-subtitle class="text-right">{{testData.max}}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-arrow-down-bold-hexagon-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Min</v-list-item-title>
                      <v-list-item-subtitle class="text-right">{{testData.min}}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-plus-minus</v-icon>
                      </v-list-item-icon>
                      <v-list-item-title>Standard deviation</v-list-item-title>
                      <v-list-item-subtitle class="text-right">{{testData.sd}}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-row justify="center">
                  <v-col cols="10">
                    <v-card>
                      <v-card-title>Heuristics Data</v-card-title>
                      <v-row>
                        <v-col cols="6">
                          <BarChat :labels="labelsHeuris" :data="graphDataHeuris" />
                        </v-col>
                        <v-col cols="6">
                          <v-data-table
                            :headers="headersHeuris"
                            :items="dataHeuris"
                            :items-per-page="5"
                            class="elevation-1"
                          ></v-data-table>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
          <h2 v-else class="ml-3">Please select a heuristic</h2>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import QuestionChart from "@/components/atoms/QuestionChart.vue";
import BarChat from "@/components/atoms/BarChat.vue";
export default {
  props: ["id"],
  components: {
    QuestionChart,
    BarChat
  },
  data: () => ({
    search: "",
    heurisSelected: null,
    graphSelected: null,
    headers: [],
    items: [],
    testData: {
      average: null,
      max: null,
      min: null,
      sd: null
    },
    graph: [],
    dataQuestions: [],
    headersHeuris: [
      {
        text: "Heuristics",
        align: "start",
        sortable: false,
        value: "name"
      },
      { text: "Max", value: "max", align: "center" },
      { text: "Min", value: "min", align: "center" },
      { text: "Standard deviation", value: "sd", align: "center" },
      { text: "Average", value: "average", align: "center" }
    ],
    labelsHeuris: [],
    dataHeuris: [],
    graphDataHeuris: []
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

      //Total Test
      const ResultTest = answers.reduce((total, answer) => {
        //Total Heuristics
        let res = answer.heuristics.reduce((totalHeuris, heuris) => {
          //Total Questions
          let res = heuris.questions.reduce((totalQuestions, question) => {
            return totalQuestions + question.res;
          }, 0);
          const collection = heurisResults.get(`heuristics ${heuris.id + 1}`);
          if (!collection) {
            heurisResults.set(`heuristics ${heuris.id + 1}`, [res]);
          } else {
            collection.push(res);
          }
          return totalHeuris + res;
        }, 0);
        answersResults.set(answer.uid, res);
        return total + res;
      }, 0);

      // console.log("ResultTest", ResultTest);
      // console.log("answersResults", answersResults);
      // console.log("heurisResults", heurisResults);

      //Set Data
      this.testData = {
        average: Math.fround(ResultTest / answers.length),
        max: Math.max(...answersResults.values()),
        min: Math.min(...answersResults.values()),
        sd: this.standardDeviation([...answersResults.values()])
      };

      for (var [key, list] of heurisResults.entries()) {
        this.dataHeuris.push({
          name: key,
          max: Math.max(...list),
          min: Math.min(...list),
          sd: this.standardDeviation(list),
          average: list.reduce((total, value) => total + value / list.length, 0)
        });
      }

      this.labelsHeuris = [...heurisResults.keys()];
      this.graphDataHeuris = this.dataHeuris.map(list => {
        return list.average;
      });

      console.log(this.dataHeuris);
    },
    standardDeviation(array) {
      let average = array.reduce(
        (total, value) => total + value / array.length,
        0
      );
      return Math.sqrt(
        array.reduce(
          (total, valor) => total + Math.pow(average - valor, 2) / array.length,
          0
        )
      );
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

<style scoped>
.scroll {
  overflow-y: auto;
  overflow-x: hidden;
}
.cardAnswers {
  background: #e6e4e4;
  border-radius: 34px;
}
.container {
  height: 400px;
  padding: 0px;
  margin: 0px;
}
/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #f9a826;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #f9a826;
}
</style>