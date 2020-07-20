<template >
  <v-container>
    <!-- Top/Title -->
    <v-row justify="space-around">
      <v-col cols="12" class="titleView">Answers</v-col>
      <v-col cols="12" class="pa-0 pl-3 ma-0">
        <v-row justify="end" dense>
          <!-- Main Tabs -->
          <v-tabs
            background-color="transparent"
            color="#FCA326"
            class="tab-border-bottom pb-0 mb-0"
          >
            <v-tab @click="index = 0">Statistics</v-tab>
            <v-tab @click="index = 1">Heuristics</v-tab>
          </v-tabs>
        </v-row>
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <!-- Main Tabs Content -->
    <v-row justify="center">
      <v-col cols="12">
        <!-- Main Tab 1 -->
        <v-card v-if="index==0" class="dataCard">
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
                      <v-card-title>Test's average</v-card-title>
                      <v-card-text>
                        <v-row align="center" justify="center">
                          <p class="display-3">{{testData.average}}</p>
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
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="12" class="mt-3">
              <v-card-title class="subtitleView">Heuristics Data</v-card-title>

              <v-divider></v-divider>

              <!-- Bottom Tabs -->
              <v-tabs background-color="transparent" color="grey darken-2" class="mt-2" centered>
                <v-tab
                  class="tab-text"
                  style="text-transform: none !important"
                  @click="ind = 0"
                >Table</v-tab>
                <v-tab
                  class="tab-text"
                  style="text-transform: none !important"
                  @click="ind = 1"
                >Graphic</v-tab>
              </v-tabs>

              <!-- Bottom Tab Content -->
              <v-row justify="center">
                <v-col cols="10">
                  <v-row>
                    <!-- Bottom Tab 1 -->
                    <v-col cols="12" v-if="ind == 0">
                      <v-data-table
                        :headers="headersHeuris"
                        :items="dataHeuris"
                        :items-per-page="5"
                        class="elevation-1 cardStyle"
                      ></v-data-table>
                    </v-col>

                    <!-- Bottom Tab 2 -->
                    <v-col cols="12" v-if="ind == 1">
                      <BarChart :labels="labelsHeuris" :data="graphDataHeuris" />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>

        <!-- Top Tab 2 -->
        <v-card v-if="index==1" class="dataCard">
          <v-row dense justify="start" class="pa-0 ma-0">
            <!-- Left Column -->
            <v-col cols="2" class="pa-2 ma-0">
              <div class="subtitleView">HEURISTICS</div>
              <v-divider></v-divider>
              <v-list color="transparent" dense>
                <v-list-item
                  v-for="(heuris, i) in answers.answersSheet.heuristics"
                  :key="i"
                  @click="setHeaders(heuris,i),setItems(i),open = true,dataSelected=-1, questionIndex = -1"
                >
                  <v-list-item-title
                    :style="i == heurisIndex ? 'color: #fca326': 'color:black'"
                  >Heuristic {{i + 1}}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>

            <v-divider vertical inset style="height:530px"></v-divider>

            <!-- Middle Column -->
            <v-col v-if="open" cols="2" class="pa-2 ma-0">
              <div class="subtitleView">HEURISTIC {{heurisSelected}}</div>
              <v-divider></v-divider>
              <v-list color="transparent" dense>
                <v-list-item @click="dataSelected = -1, questionIndex = -1">
                  <v-list-item-title
                    :style="dataSelected == -1? 'color: #fca326': 'color:black'"
                  >Data Table</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="(question, i) in dataQuestions"
                  :key="i"
                  @click="dataSelected = i, questionIndex = i"
                >
                  <v-list-item-title
                    :style="i == questionIndex ? 'color: #fca326': 'color:black'"
                  >Question {{i + 1}}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>

            <v-divider v-if="open" vertical inset></v-divider>

            <!-- Right Column -->
            <v-col cols="7" class="pa-2 ma-0" style="width:100%">
              <div v-if="dataSelected != null">
                <div class="subtitleView" v-if="dataSelected != -1">QUESTION {{dataSelected+1}}</div>
                <div class="subtitleView" v-else>Data Table</div>

                <v-divider></v-divider>

                <v-row justify="center" dense>
                  <!-- Table -->
                  <v-col v-if="dataSelected == -1" class="ma-0 pa-0">
                    <v-text-field
                      class="mx-3"
                      append-icon="mdi-magnify"
                      label="Search"
                      v-model="search"
                    ></v-text-field>

                    <v-data-table
                      class="elevation-1 cardStyle"
                      :headers="headers"
                      :items="items"
                      :search="search"
                    ></v-data-table>
                  </v-col>

                  <!-- Graph -->
                  <v-col class="mx-3" v-else>
                    <v-row justify="center">
                      <!-- Bottom Tabs -->
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
                        >Graphic</v-tab>
                        <v-tab
                          class="tab-text"
                          style="text-transform: none !important"
                          @click="ind = 1"
                        >Comments</v-tab>
                      </v-tabs>
                      <v-col v-if="ind == 0">
                        <QuestionChart :data="dataQuestions[dataSelected].data" />
                      </v-col>
                      <v-col v-if="ind == 1">
                        {{dataQuestions}}
                        <v-timeline v-if="dataQuestions[dataSelected].comments.length" dense>
                          <v-timeline-item
                            fill-dot
                            color="#fca326"
                            icon="mdi-message-reply-text"
                            v-for="(comment,index) in dataQuestions[dataSelected].comments"
                            :key="index"
                          >
                            <v-card class="elevation-2">
                              <v-card-text>{{comment}}</v-card-text>
                            </v-card>
                          </v-timeline-item>
                        </v-timeline>
                        <div v-else>No comments yet</div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>
              <h2 v-else class="ml-3">Please select a heuristic</h2>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import QuestionChart from "@/components/atoms/QuestionChart.vue";
import BarChart from "@/components/atoms/BarChart.vue";

export default {
  props: ["id"],
  components: {
    QuestionChart,
    BarChart
  },
  data: () => ({
    index: 0,
    heurisIndex: null,
    questionIndex: null,
    ind: 0,
    open: false,
    search: "",
    heurisSelected: null,
    graphSelected: null,
    dataSelected: null,
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
      this.heurisIndex = index;

      // answers.answersSheet.heuristics
      this.answers.answers.forEach(answer => {
        aux = {
          uid: null,
          questions: []
        };
        aux.uid = answer.uid;

        if (answer.heuristics[index])
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
    questionGraph(data, ids) {
      this.dataQuestions = [];
      var questionMap = new Map();

      ids.forEach(id => {
        let aux = [];
        let comments = [];
        data.forEach(item => {
          if (item.questions.length) {
            aux.push(item.questions.find(q => q.id == id).res);
            if (item.questions.find(q => q.id == id).com)
              comments.push(item.questions.find(q => q.id == id).com);
          }
        });
        questionMap.set(`Question ${id}`, {aux:aux, comments:comments });
      });

      let possibleAnswers = [1, 0.5, 0, -1, null];
      for (var [key, value] of questionMap.entries()) {
        let aux = [];
        
        possibleAnswers.forEach(el => {
          aux.push(value.aux.filter(v => v == el).length);
        });
        this.dataQuestions.push({
          question: key,
          data: aux,
          comments: value.comments
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

      //Set Data
      this.testData = {
        average: Math.fround(ResultTest / answers.length).toFixed(2),
        max: Math.max(...answersResults.values()).toFixed(2),
        min: Math.min(...answersResults.values()).toFixed(2),
        sd: this.standardDeviation([...answersResults.values()]).toFixed(2)
      };

      for (var [key, list] of heurisResults.entries()) {
        this.dataHeuris.push({
          name: key,
          max: Math.max(...list).toFixed(2),
          min: Math.min(...list).toFixed(2),
          sd: this.standardDeviation(list).toFixed(2),
          average: list
            .reduce((total, value) => total + value / list.length, 0)
            .toFixed(2)
        });
      }

      this.labelsHeuris = [...heurisResults.keys()];
      this.graphDataHeuris = this.dataHeuris.map(list => {
        return list.average;
      });
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

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
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
</style>