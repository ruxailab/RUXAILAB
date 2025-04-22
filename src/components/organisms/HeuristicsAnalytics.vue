<template>
  <div v-if="answers">
    <IntroAnalytics
      v-if="answers != null && intro == true"
      @go-to-coops="goToCoops()"
    />

    <ShowInfo
      v-if="answers != null && !intro && test"
      title="Analytics"
    >
      <template #content>
        <div class="ma-0 pa-0">
          <v-card
            flat
            rounded="xl"
            style="background: #f5f7ff"
          >
            <v-row
              v-if="resultHeuristics"
              class="ma-0 pa-0"
            >
              <!--Heuristics List-->
              <v-col
                class="ma-0 pa-0"
                cols="2"
              >
                <v-list
                  border
                  rounded
                  density="compact"
                  height="560px"
                >
                  <v-list-subheader>Heuristics</v-list-subheader>
                  <v-divider />
                  <v-list
                    v-model="heuristicSelect"
                    color="#fca326"
                    density="compact"
                    height="470px"
                    class="list-scroll"
                  >
                    <v-list-item
                      v-for="(item, i) in test.testStructure"
                      :key="i"
                    >
                      <v-list-item-title>
                        {{
                          `H${item.id + 1} - ${item.title}`
                        }}
                      </v-list-item-title>
                        
                      <template
                        v-if="i == heuristicSelect"
                        #prepend
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-list>
              </v-col>
              <v-divider
                vertical
                inset
              />
              <!--Questions List-->
              <v-col
                v-if="
                  heuristicSelect !== null && test.testStructure[heuristicSelect]
                "
                class="ma-0 pa-0"
                cols="3"
              >
                <v-list
                  border
                  rounded
                  density="compact"
                  height="560px"
                >
                  <v-list-subheader>
                    {{ test.testStructure[heuristicSelect].title }} - Questions
                  </v-list-subheader>
                  <v-divider />
                  <v-list
                    v-model="questionSelect"
                    density="compact"
                    height="470px"
                    color="#fca326"
                    class="list-scroll"
                  >
                    <v-list-item :value="-1">
                      <v-list-item-title>Data Table</v-list-item-title>
                      
                      <template
                        v-if="questionSelect == -1"
                        #prepend
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item
                      v-for="(item, i) in test.testStructure[heuristicSelect]
                        .questions"
                      :key="i"
                      :value="i"
                    >
                      <v-list-item-title>
                        {{
                          `Q${item.id + 1} - ${item.title}`
                        }}
                      </v-list-item-title>
                      
                      <template
                        v-if="i == questionSelect"
                        #prepend
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-list>
              </v-col>
              <!--Content-->
              <v-col
                v-if="
                  questionSelect !== null &&
                    heuristicSelect !== null &&
                    test.testStructure[heuristicSelect]
                "
                class="ma-0 pa-0"
                cols="7"
              >
                <v-card
                  border
                  rounded
                  flat
                  height="560px"
                  elevation-0
                >
                  <v-list-subheader
                    v-if="questionSelect != -1"
                    class="pa-2"
                  >
                    {{
                      test.testStructure[heuristicSelect].questions[
                        questionSelect
                      ].title
                    }}
                  </v-list-subheader>
                  <v-list-subheader
                    v-else
                    class="pa-2"
                  >
                    Data Table
                  </v-list-subheader>
                  <v-divider />
                  <!-- DATA TABLE CONTENT TYPE -->
                  <v-row v-if="questionSelect == -1">
                    <v-col>
                      <v-text-field
                        v-model="search"
                        class="mx-3"
                        append-icon="mdi-magnify"
                        label="Search"
                      />
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
                          #[`item.${header.value}`]="{ item }"
                        >
                          <div
                            v-if="item[header.value].uid"
                            :key="item[header.value].uid"
                          >
                            {{ item[header.value].uid }}
                          </div>
                          <div
                            v-else
                            :key="item[header.value].heuristicAnswer.value"
                          >
                            <div
                              v-if="
                                item[header.value].heuristicAnswer.value == null
                              "
                            >
                              -
                            </div>
                            <div v-else>
                              {{ item[header.value].heuristicAnswer.value }}
                            </div>
                          </div>
                        </template>
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-row
                    v-else
                    class="ma-0 pa-0"
                  >
                    <v-tabs
                      v-model="ind"
                      bg-color="transparent"
                      color="grey-darken-2"
                      class="mt-2"
                      align-tabs="center"
                    >
                      <v-tab
                        class="tab-text"
                        style="text-transform: none !important"
                        @click="ind = 0"
                      >
                        Comments
                      </v-tab>
                      <v-tab
                        class="tab-text"
                        style="text-transform: none !important"
                        @click="ind = 1"
                      >
                        Chart
                      </v-tab>
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
                      <v-row
                        class="list-scroll"
                        style="height: 430px"
                        justify="center"
                      >
                        <v-col cols="10">
                          <v-timeline density="compact">
                            <div
                              v-for="(result, index) in itemsHeuristic"
                              :key="index"
                            >
                              <v-timeline-item
                                v-if="result[questionSelect].heuristicComment"
                                fill-dot
                                dot-color="#fca326"
                                icon="mdi-message-reply-text"
                              >
                                <v-card class="elevation-2">
                                  <v-card-text>
                                    {{
                                      result[questionSelect].heuristicComment
                                    }}
                                  </v-card-text>
                                  <img
                                    v-if="result[questionSelect].answerImageUrl"
                                    height="200"
                                    :src="result[questionSelect].answerImageUrl"
                                  >
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
      </template>
    </ShowInfo>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import BarChart from '@/components/atoms/BarChart.vue'

export default {
  components: {
    ShowInfo,
    BarChart,
  },
  emits: ['goToCoops'],
  data: () => ({
    search: '',
    ind: 0,
    resultHeuristics: [],
    heuristicSelect: null,
    questionSelect: null,
    intro: null,
  }),
  computed: {
    headersHeuristic() {
      const header = [
        {
          text: 'Evalutator',
          align: 'start',
          value: 'uid',
        },
      ]
      if (this.heuristicSelect !== null) {
        this.test.testStructure[this.heuristicSelect].questions.forEach(
          (question) => {
            header.push({
              text: `Q${question.id + 1}`,
              align: 'center',
              value: question.id,
            })
          },
        )
      }

      return header
    },
    itemsHeuristic() {
      const items = []
      if (this.heuristicSelect !== null) {
        Object.values(this.answers).forEach((answer) => {
          items.push({
            uid: { uid: answer.userDocId },
            ...answer.heuristicQuestions[this.heuristicSelect]
              .heuristicQuestions,
          })
        })
      }
      return items
    },
    questionGraph() {
      const { testOptions: options } = this.test

      const graph = {
        label: [...options.map((op) => op.text)],
        data: [...options.map(() => 0)],
      }

      if (this.heuristicSelect !== null && this.questionSelect !== null) {
        Object.values(this.answers).forEach((userAnswer) => {
          const question =
            userAnswer.heuristicQuestions[this.heuristicSelect]
              .heuristicQuestions[this.questionSelect]

          const optionSelect = options.find(
            (op) => op.text === question.heuristicAnswer.text,
          )
          if (optionSelect) {
            const optionIndex = graph.label.indexOf(optionSelect.text)
            graph.data[optionIndex] += 1
          }
        })
      }
      return graph
    },
    answers() {
      if (!this.$store.getters.testAnswerDocument) {
        return {}
      }

      return this.$store.getters.testAnswerDocument.heuristicAnswers
    },
    loading() {
      return !Object.values(this.answers).length
    },
    test() {
      return this.$store.getters.test
    },
  },
  watch: {
    answers() {
      if (Object.values(this.answers)) {
        this.intro = !Object.values(this.answers).length
      }
    },
    heuristicSelect() {
      this.questionSelect = -1
    },
    questionSelect() {
      this.ind = 0
    },
  },
  updated() {
    if (this.heuristic) {
      this.heuristicSelect = Number(this.heuristic)
    }
  },
  async created() {
    await this.$store.dispatch('getCurrentTestAnswerDoc')
  },
  methods: {
    goToCoops() {
      this.$emit('goToCoops')
    },
  },
}
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
