<template>
  <div v-if="answers">
    <IntroAnalytics @goToCoops="goToCoops()" v-if=" answers != null && intro == true" />
    <ShowInfo title="Analytics" v-if=" answers != null && intro == false">
      <div slot="content" class="ma-0 pa-0">
        <v-card style="background :#f5f7ff;">
          <v-row class="ma-0 pa-0" v-if="resultHeuristics">
            <!--Heuristics List-->
            <v-col class="ma-0 pa-0" cols="2">
              <v-list dense height="560px" outlined>
                <v-subheader>Heuristics</v-subheader>
                <v-divider></v-divider>
                <v-list dense height="470px" outlined class="list-scroll">
                  <v-list-item-group v-model="heuristicSelect" color="#fca326">
                    <v-list-item v-for="(item, i) in resultHeuristics" :key="i">
                      <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                          <v-list-item-content v-bind="attrs" v-on="on">
                            <v-list-item-title>{{item.id}}</v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-icon v-if="i == heuristicSelect">
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-list-item-icon>
                        </template>
                        <span v-if="test">{{test.heuristics[i].title}}</span>
                      </v-tooltip>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-list>
            </v-col>
            <v-divider vertical inset></v-divider>
            <!--Questions List-->
            <v-col class="ma-0 pa-0" cols="2" v-if="heuristicSelect != null">
              <v-list dense height="560px" outlined>
                <v-subheader>{{test.heuristics[heuristicSelect].title}} - Questions</v-subheader>
                <v-divider></v-divider>
                <v-list dense height="470px" outlined class="list-scroll">
                  <v-list-item-group v-model="questionSelect" color="#fca326">
                    <v-list-item :value="-1">
                      <v-list-item-content>
                        <v-list-item-title>Data Table</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-icon v-if="questionSelect == -1">
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-list-item-icon>
                    </v-list-item>
                    <v-list-item
                      v-for="(item, i) in resultHeuristics[heuristicSelect].questions"
                      :key="i"
                      :value="i"
                    >
                      <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                          <v-list-item-content v-bind="attrs" v-on="on">
                            <v-list-item-title>{{item.id}}</v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-icon v-if="i == questionSelect">
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-list-item-icon>
                        </template>
                        <span v-if="test">{{test.heuristics[heuristicSelect].questions[i].title}}</span>
                      </v-tooltip>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-list>
            </v-col>
            <!--Content-->
            <v-col class="ma-0 pa-0" v-if="questionSelect != null && heuristicSelect != null">
              <v-card height="560px" elevation-0>
                <v-subheader
                  class="pa-2"
                  v-if="questionSelect !=-1"
                >{{test.heuristics[heuristicSelect].questions[questionSelect].title}}</v-subheader>
                <v-subheader class="pa-2" v-else>Data Table</v-subheader>
                <v-divider></v-divider>
                <v-row v-if="questionSelect==-1">
                  <v-col>
                    <v-text-field
                      class="mx-3"
                      append-icon="mdi-magnify"
                      label="Search"
                      v-model="search"
                    ></v-text-field>
                    <v-data-table
                      class="elevation-1"
                      :headers="headersHeuristic"
                      :items="itemsHeuristic"
                      :search="search"
                      height="360px"
                      dense
                    >
                      <template
                        v-for="header in headersHeuristic"
                        v-slot:[`item.${header.value}`]="{ item }"
                      >
                        <div v-if="item[header.value]==null" :key="header.value">-</div>
                        <div v-else :key="header.value">{{ item[header.value] }}</div>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
                <v-row class="ma-0 pa-0" v-else>
                  <v-tabs
                    background-color="transparent"
                    color="grey darken-2"
                    class="mt-2"
                    centered
                    v-model="ind"
                  >
                    <v-tab
                      class="tab-text"
                      style="text-transform: none !important"
                      @click="ind = 0"
                    >Comments</v-tab>
                    <v-tab
                      class="tab-text"
                      style="text-transform: none !important"
                      @click="ind = 1"
                    >Graphic</v-tab>
                  </v-tabs>
                  <v-col v-if="ind == 1">
                    <v-row justify="center">
                      <v-col cols="10">
                    <BarChart
                      v-if="questionGraph"
                      :labels="questionGraph.label"
                      :data="questionGraph.data"
                      legend="Quantity"
                    />
                     </v-col>
                    </v-row>
                  </v-col>
                  <v-col v-if="ind == 0">
                    <v-row class="list-scroll" style="height:430px" justify="center">
                      <v-col cols="10">
                      <v-timeline
                        v-if="resultHeuristics[heuristicSelect].questions[questionSelect].result.length"
                        dense
                      >
                        <div
                          v-for="(result, index) in resultHeuristics[heuristicSelect].questions[questionSelect].result"
                          :key="index"
                        >
                          <v-timeline-item
                            v-if="result.comment"
                            fill-dot
                            color="#fca326"
                            icon="mdi-message-reply-text"
                          >
                            <v-card class="elevation-2">
                              <v-card-text>{{ result.comment}}</v-card-text>
                            </v-card>
                          </v-timeline-item>
                        </div>
                      </v-timeline>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>
  </div>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo";
import BarChart from "@/components/atoms/BarChart.vue";
import IntroAnalytics from "@/components/molecules/IntroAnalytics.vue";
export default {
  props: ["id", "heuristic"],
  components: {
    ShowInfo,
    BarChart,
    IntroAnalytics
  },
  data: () => ({
    search: "",
    ind: 0,
    resultHeuristics: [],
    heuristicSelect: null,
    questionSelect: null,
    intro: null
  }),
  methods: {
    statistics() {
      const answers = this.answers.answers;
      this.resultHeuristics = [];

      answers.forEach(evaluator => {
        //Get Heuristics for evaluators
        let heurisIndex = 1;
        evaluator.heuristics.forEach(heuristic => {
          //Get Questions for heuristic
          let questionIndex = 1;
          let SelectHeuristic = this.resultHeuristics.find(
            h => h.id == `H${heurisIndex}`
          );
          if (!SelectHeuristic) {
            this.resultHeuristics.push({
              id: `H${heurisIndex}`,
              questions: []
            });
            SelectHeuristic = this.resultHeuristics[
              this.resultHeuristics.length - 1
            ];
          }
          heuristic.questions.forEach(question => {
            let selectQuestion = SelectHeuristic.questions.find(
              q => q.id == `Question ${questionIndex}`
            );
            if (!selectQuestion) {
              SelectHeuristic.questions.push({
                id: `Question ${questionIndex}`,
                result: [
                  {
                    evaluator: evaluator.uid,
                    response: question.res,
                    comment: question.com
                  }
                ]
              });
            } else {
              selectQuestion.result.push({
                evaluator: evaluator.uid,
                response: question.res,
                comment: question.com
              });
            }
            questionIndex++;
          });
          heurisIndex++;
        });
      });
    },
    goToCoops() {
      this.$emit("goToCoops");
    }
  },
  computed: {
    headersHeuristic() {
      let header = [
        {
          text: "ID",
          align: "start",
          value: "uid"
        }
      ];
      if (this.heuristicSelect != null) {
        this.resultHeuristics[this.heuristicSelect].questions.forEach(
          question => {
            header.push({
              text: question.id,
              align: "center",
              value: question.id
            });
          }
        );
      }

      return header;
    },
    itemsHeuristic() {
      let items = [];
      if (this.heuristicSelect != null) {
        this.resultHeuristics[this.heuristicSelect].questions.forEach(
          question => {
            question.result.forEach(result => {
              let ev = items.find(item => item.uid == result.evaluator);
              if (!ev) {
                items.push({ uid: result.evaluator });
                ev = items[items.length - 1];
              }
              Object.assign(ev, { [question.id]: result.response });
            });
          }
        );
      }
      return items;
    },
    questionGraph() {
      let options = this.answers.options;
      let graph = {
        label: [...options.map(op => op.text)],
        data: [...options.map(() => 0)]
      };
      if (this.heuristicSelect != null && this.questionSelect != null) {
        let question = this.resultHeuristics[this.heuristicSelect].questions[
          this.questionSelect
        ];
        question.result.forEach(result => {
          let item = options.find(op => op.value == result.response);
          if (item) graph.data[graph.label.indexOf(item.text)] += 1;
        });
      }
      return graph;
    },
    answers() {
      return this.$store.state.answers.answers || [];
    },
    loading() {
      if (this.answers) return true;
      return false;
    },
    test() {
      return this.$store.state.tests.test;
    }
  },
  watch: {
    answers() {
      if (this.answers !== null || this.answers.length > 0) {
        this.statistics();

        if (this.answers.answers.length == 0) this.intro = true;
        else this.intro = false;
      }
    },
    heuristicSelect() {
      this.questionSelect = -1;
    },
    questionSelect() {
      this.ind = 0;
    }
  },
  updated() {
    if (this.heuristic != null && this.heuristic != undefined) {
      this.heuristicSelect = Number(this.heuristic);
    }
  },
  created() {
    if (
      !this.$store.state.answers.answers ||
      !this.$store.state.answers.answers.id !== this.id
    ) {
      this.$store.dispatch("getAnswers", { id: this.id });
    }

    this.$store.getters.user.myTests.forEach(t => {
      if (t.answers == this.id) {
        this.$store.dispatch("getTest", { id: t.id });
      }
    });
  }
};
</script>

<style scoped>
.list-scroll {
  height: 508px;
  overflow: auto;
}
/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}
/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}
/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
  /* background: #515069; */
}
</style>