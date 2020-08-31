<template >
  <div v-if="answers">
    <v-overlay :value="loading==null">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <IntroAnswer v-if=" answers != null && loading == true"></IntroAnswer>
    <v-row justify="center" v-else-if="answers != null && loading == false">
      <ShowInfo title="Answers">
        <!-- Main Tabs -->
        <v-tabs
          slot="top"
          background-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0"
          v-model="tab"
        >
          <v-tab @click="tab = 0">Statistics</v-tab>
          <v-tab @click="tab = 1">Evaluators</v-tab>
          <v-tab @click="tab = 2">Heuristics</v-tab>
        </v-tabs>

        <!-- Main Tabs Content -->
        <div slot="content" class="ma-0 pa-0">
          <!-- Tab 1 - Statistics -->
          <v-card v-if="tab==0" style="background: #f5f7ff;">
            <v-card-title class="subtitleView">Statistics</v-card-title>

            <v-divider></v-divider>

            <v-row justify="space-around">
              <!-- Top Card -->
              <v-col cols="10">
                <v-card class="cardStyle">
                  <v-row justify="space-around">
                    <!-- Average -->
                    <v-col cols="4">
                      <v-row justify="center">
                        <v-card-title>Usability Percentage</v-card-title>
                        <v-card-text>
                          <v-row align="center" justify="center">
                            <p class="display-3">{{finalResult.average}}</p>
                          </v-row>
                        </v-card-text>
                      </v-row>
                    </v-col>

                    <v-divider vertical></v-divider>

                    <!-- Info -->
                    <v-col>
                      <v-list class="transparent">
                        <v-list-item>
                          <v-list-item-icon>
                            <v-icon>mdi-arrow-up-bold-hexagon-outline</v-icon>
                          </v-list-item-icon>

                          <v-list-item-title>Max</v-list-item-title>
                          <v-list-item-subtitle class="text-right">{{finalResult.max}}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-icon>
                            <v-icon>mdi-arrow-down-bold-hexagon-outline</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Min</v-list-item-title>
                          <v-list-item-subtitle class="text-right">{{finalResult.min}}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-icon>
                            <v-icon>mdi-plus-minus</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Standard deviation</v-list-item-title>
                          <v-list-item-subtitle class="text-right">{{finalResult.sd}}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-card>

          <!-- Tab 2 - Evaluators -->
          <v-card v-if="tab == 1" style="background: #f5f7ff;">
            <v-card-title class="subtitleView">Evaluators</v-card-title>

            <v-divider></v-divider>

            <v-tabs background-color="transparent" color="grey darken-2" class="mt-2" centered>
              <v-tab class="tab-text" style="text-transform: none !important" @click="ind = 0">Table</v-tab>
              <v-tab
                class="tab-text"
                style="text-transform: none !important"
                @click="ind = 1"
              >Graphic</v-tab>
            </v-tabs>

            <v-row justify="center">
              <v-col cols="10" v-if="ind == 0">
                <v-data-table
                  dense
                  :headers="evaluatorStatistics.header"
                  :items="evaluatorStatistics.items"
                  :items-per-page="15"
                  class="elevation-1 cardStyle mx-2"
                >
                  <template v-slot:item.result="{ item }">
                    <v-chip :color="getColorPorcentage(item.result)" dark>{{ item.result}}%</v-chip>
                  </template>
                  <template v-slot:item.answered="{ item }">{{item.answered}}%</template>
                </v-data-table>
              </v-col>

              <v-col cols="10" v-if="ind == 1">
                <RadarChart
                  :labels="evaluatorStatistics.items.map(item => `${item.evaluator} - ${item.result}%`)"
                  :data="evaluatorStatistics.items.map(item => item.result)"
                />
              </v-col>
            </v-row>
          </v-card>

          <!-- Tab 3 - Heuristics-->
          <v-card v-if="tab == 2" style="background: #f5f7ff;">
            <v-card-title class="subtitleView">Heuristics Data</v-card-title>

            <v-divider></v-divider>

            <!-- Bottom Tabs -->
            <v-tabs background-color="transparent" color="grey darken-2" class="mt-2" centered>
              <v-tab
                class="tab-text"
                style="text-transform: none !important"
                @click="ind = 0"
              >Answers by Evaluator</v-tab>
              <v-tab
                class="tab-text"
                style="text-transform: none !important"
                @click="ind = 1"
              >Answers By Heuristics</v-tab>
              <v-tab
                class="tab-text"
                style="text-transform: none !important"
                @click="ind = 2"
              >Graphic</v-tab>
            </v-tabs>

            <!-- Bottom Tab Content -->
            <v-row justify="center">
              <v-col cols="10">
                <v-row>
                  <!-- Bottom Tab 1 -->
                  <v-col cols="12" v-if="ind == 0">
                    <v-data-table
                      :headers="heuristicsEvaluator.header"
                      :items="heuristicsEvaluator.items"
                      :items-per-page="15"
                      class="elevation-1 cardStyle"
                      dense
                    >
                      <template
                        v-for="header in heuristicsEvaluator.header"
                        v-slot:[`item.${header.value}`]="{ item }"
                      >
                        <v-chip
                          v-if="header.value != 'heuristic'"
                          :key="header.value"
                          :color="
                          getColor(item[header.value], item.max, item.min)
                        "
                          dark
                          class="chip"
                        >{{ item[header.value]?item[header.value]:0 }}</v-chip>
                        <v-btn
                          text
                          v-else
                          @click="goToDataHeuristic(item.heuristic)"
                          :key="header.value"
                        >{{ item[header.value] }}</v-btn>
                      </template>
                    </v-data-table>
                  </v-col>
                  <!-- Bottom Tab 2 -->
                  <v-col cols="12" v-if="ind == 1">
                    <v-data-table
                      :headers="heuristicsStatistics.header"
                      :items="heuristicsStatistics.items"
                      :items-per-page="15"
                      class="elevation-1 cardStyle"
                      dense
                    >
                      <template v-slot:item.average="{ item }">
                        <v-chip
                          :color="getColor(item.average, item.max, item.min)"
                          dark
                        >{{ item.average }}</v-chip>
                      </template>
                    </v-data-table>
                  </v-col>
                  <!-- Bottom Tab 3 -->
                  <v-col cols="12" v-if="ind == 2">
                    <BarChart
                      :labels="heuristicsStatistics.items.map(item => item.name)"
                      :data="heuristicsStatistics.items.map(item => item.average)"
                      legend="Average"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </ShowInfo>
    </v-row>
  </div>
</template>

<script>
import BarChart from "@/components/atoms/BarChart.vue";
import RadarChart from "@/components/atoms/RadarChart.vue";
import ShowInfo from "@/components/organisms/ShowInfo";
import IntroAnswer from "@/components/atoms/IntroAnswer";

export default {
  props: ["id"],
  components: {
    BarChart,
    RadarChart,
    ShowInfo,
    IntroAnswer
  },
  data: () => ({
    search: "",
    tab: 0,
    ind: 0,
    resultEvaluator: [],
    loading: null
  }),
  methods: {
    statistics() {
      const answers = this.answers.answers;

      this.resultEvaluator = [];

      //Get Evaluator answers
      let evaluatorIndex = 1;
      answers.forEach(evaluator => {
        let SelectEvaluator = this.resultEvaluator.find(
          e => e.id == `Ev${evaluatorIndex}`
        );
        if (!SelectEvaluator) {
          this.resultEvaluator.push({
            uid: evaluator.uid,
            email: evaluator.email,
            id: `Ev${evaluatorIndex}`,
            heuristics: [],
            result: 0
          });
          SelectEvaluator = this.resultEvaluator[
            this.resultEvaluator.length - 1
          ];
        }
        //Get Heuristics for evaluators
        let heurisIndex = 1;
        evaluator.heuristics.forEach(heuristic => {
          //Get Questions for heuristic

          let noAplication = 0;
          let noReply = 0;
          let res = heuristic.questions.reduce((totalQuestions, question) => {
            //grouping of answers
            if (question.res === null) {
              noAplication++;           
            } //count answers no aplication
            if (question.res === "") noReply++;
            return totalQuestions + Number(question.res); //sum of responses
          }, 0);
          if(noAplication == heuristic.questions.length)
            res = null

          SelectEvaluator.heuristics.push({
            id: `H${heurisIndex}`,
            result: res,
            totalQuestions: heuristic.total,
            totalNoAplication: noAplication,
            totalNoReply: noReply
          });
          heurisIndex++;
        });
        evaluatorIndex++;
      });

      //Calc Final result
      this.resultEvaluator.forEach(ev => {
        ev.result = this.calcFinalResult(ev.heuristics);
      });
    },
    calcFinalResult(array) {
      let result = 0;
      let qtdQuestion = 0;
      let qtdNoAplication = 0;
      let maxOption = Math.max(...this.answers.options.map(item => item.value));
      array.forEach(res => {
        (result += res.result), (qtdQuestion += res.totalQuestions);
        qtdNoAplication += res.totalNoAplication;
      });
      let perfectResult = (qtdQuestion - qtdNoAplication) * maxOption;

      return ((result * 100) / perfectResult).toFixed(1);
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
    },
    percentage(value, result) {
      return (value * 100) / result;
    },
    getColor(value, max, min) {
          
      max = Number(max);
      min = Number(min);
      let h = (max - min) / 5;

      if(value == null) return 'grey'
      else if (value <= min + h) return "red";
      else if (value <= min + 2 * h) return "amber";
      else if (value <= min + 3 * h) return "orange lighten-1";
      else if (value <= min + 4 * h) return "lime";
      else return "green";
    },
    getColorPorcentage(value) {
      if (value <= 20) return "red";
      else if (value <= 40) return "ambar";
      else if (value <= 60) return "orange lighten-1";
      else if (value <= 80) return "lime";
      else return "green";
    },
    goToDataHeuristic(item) {
      let selectHeruristc = this.heuristicsEvaluator.items.indexOf(
        this.heuristicsEvaluator.items.find(h => h.heuristic === item)
      );
      this.$router.push(`/analyticsview/${this.id}/${selectHeruristc}`);
    },
    goToCoops() {
      this.$emit("goToCoops");
    }
  },
  computed: {
    heuristicsEvaluator() {
      let table = {
        header: [],
        items: []
      };
      let options = this.answers.options.map(op => op.value);
      let max = Math.max(...options);
      let min = Math.min(...options);

      table.header.push({
        text: "Heuristics",
        align: "start",
        value: "heuristic"
      });

      if (this.resultEvaluator) {
        this.resultEvaluator.forEach(evaluator => {
          let header = table.header.find(h => h.text == evaluator.id);
          if (!header) {
            table.header.push({
              text: evaluator.id,
              align: "center",
              value: evaluator.id
            });
          }
          evaluator.heuristics.forEach(heuristic => {
            let item = table.items.find(i => i.heuristic == heuristic.id);
            if (item) {
              Object.assign(item, { [evaluator.id]: heuristic.result });
            } else {
              table.items.push({
                heuristic: heuristic.id,
                max: max * heuristic.totalQuestions,
                min: min * heuristic.totalQuestions,
                [evaluator.id]: heuristic.result
              });
            }
          });
        });
      }
      return table;
    },
    heuristicsStatistics() {
      let table = {
        header: [],
        items: []
      };

      table.header = [
        {
          text: "Heuristics",
          align: "start",
          sortable: false,
          value: "name"
        },
        { text: "Average", value: "average", align: "center" },
        { text: "Standard deviation", value: "sd", align: "center" },
        { text: "Max", value: "max", align: "center" },
        { text: "Min", value: "min", align: "center" }
      ];
      if (this.heuristicsEvaluator.items) {
        this.heuristicsEvaluator.items.forEach(item => {
          let results = Object.entries(item)
            .filter(item => item[0].includes("Ev"))
            .map(item => item[1]);

          table.items.push({
            name: item.heuristic,
            max: Math.max(...results).toFixed(2),
            min: Math.min(...results).toFixed(2),
            sd: this.standardDeviation(results).toFixed(2),
            average: results
              .reduce((total, value) => total + value / results.length, 0)
              .toFixed(2)
          });
        });
      }

      return table;
    },
    evaluatorStatistics() {
      let table = {
        header: [],
        items: []
      };

      table.header = [
        {
          text: "Evaluator",
          align: "start",
          sortable: false,
          value: "evaluator"
        },
        { text: "Usability Percentage", value: "result", align: "center" },
        { text: "Applicable Question", value: "aplication", align: "center" },
        {
          text: "No Applicable Question",
          value: "noAplication",
          align: "center"
        },
        { text: "Conclusion Percentage", value: "answered", align: "center" }
      ];

      if (this.resultEvaluator) {
        this.resultEvaluator.forEach(evaluator => {
          let totalNoAplication = 0;
          let totalNoReply = 0;
          let totalQuestions = 0;

          evaluator.heuristics.forEach(heuristic => {
            totalNoAplication += heuristic.totalNoAplication;
            totalNoReply += heuristic.totalNoReply;
            totalQuestions += heuristic.totalQuestions;
          });

          table.items.push({
            evaluator: evaluator.id,
            result: evaluator.result,
            aplication: totalQuestions - totalNoAplication,
            noAplication: totalNoAplication,
            answered: this.percentage(
              totalQuestions - totalNoReply,
              totalQuestions
            )
          });
        });
      }

      return table;
    },
    finalResult() {
      let testData = {
        average: null,
        max: null,
        min: null,
        sd: null
      };

      if (this.evaluatorStatistics.items.length) {
        let res = this.evaluatorStatistics.items.reduce((total, value) => {
          return total + value.result / this.evaluatorStatistics.items.length;
        }, 0);

        testData.average = `${Math.fround(res).toFixed(1)}%`;

        testData.max = `${Math.max(
          ...this.evaluatorStatistics.items.map(item => item.result)
        ).toFixed(1)}%`;

        testData.min = `${Math.min(
          ...this.evaluatorStatistics.items.map(item => item.result)
        ).toFixed(1)}%`;

        testData.sd = `${this.standardDeviation(
          this.evaluatorStatistics.items.map(item => item.result)
        ).toFixed(1)}%`;
      }

      return testData;
    },
    answers() {
      return this.$store.state.answers.answers || [];
    }
  },
  watch: {
    answers() {
      if (this.answers !== null || this.answers.length > 0) {
        this.statistics();
        if (this.answers.answers.length == 0) this.loading = true;
        else this.loading = false;
      }
    },
    index() {
      this.ind = 0;
    }
  },
  created() {
    if (
      !this.$store.state.answers.answers ||
      !this.$store.state.answers.answers.id !== this.id
    ) {
      this.$store.dispatch("getAnswers", { id: this.id });
    }
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(test => test.answers == this.id)
    );
  }
};
</script>

<style scoped>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
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
.scroll {
  overflow-y: auto;
  overflow-x: hidden;
}
.cardStyle {
  background-color: transparent;
  border: 0.2px solid rgba(0, 0, 0, 0.25);
}
.cardAnswers {
  background: #e6e4e4;
  border-radius: 34px;
}
.tab-text {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: center;
  color: #000000;
}
.container {
  height: 400px;
  padding: 0px;
  margin: 0px 10px 0px;
}
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
<style>
.v-chip {
  min-width: 50px;
  justify-content: center;
}
</style>
