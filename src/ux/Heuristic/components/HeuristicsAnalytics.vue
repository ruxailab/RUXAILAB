<template>
  <div v-if="answers">
    <IntroAnalytics
      v-if="answers != null && intro"
      @go-to-coops="goToCoops"
    />

    <ShowInfo
      v-if="answers != null && !intro && test"
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
                    color="#fca326"
                    density="compact"
                    height="470px"
                    class="list-scroll"
                  >
                    <v-list-item
                      v-for="(item, i) in test.testStructure"
                      :key="i"
                      :value="i"
                      :active="i === heuristicSelect"
                      @click="heuristicSelect = i"
                    >
                      <template
                        v-if="i === heuristicSelect"
                        #prepend
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ `H${item.id + 1} - ${item.title}` }}
                      </v-list-item-title>
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
                    density="compact"
                    height="470px"
                    color="#fca326"
                    class="list-scroll"
                  >
                    <v-list-item
                      :value="-1"
                      :active="questionSelect === -1"
                      @click="questionSelect = -1"
                    >
                      <template
                        v-if="questionSelect === -1"
                        #prepend
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                      <v-list-item-title>Data Table</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-for="(item, i) in test.testStructure[heuristicSelect].questions"
                      :key="i"
                      :value="i"
                      :active="i === questionSelect"
                      @click="questionSelect = i"
                    >
                      <template
                        v-if="i === questionSelect"
                        #prepend
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ `Q${item.id + 1} - ${item.title}` }}
                      </v-list-item-title>
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
                        height="375px"
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
                              v-if="item[header.value].heuristicAnswer.value == null"
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
                    <v-card
                      width="100%"
                      height="560px"
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
                            <v-timeline
                              density="compact"
                              align="start"
                            >
                              <v-timeline-item
                                v-for="(result, index) in itemsHeuristic"
                                :key="index"
                                fill-dot
                                dot-color="#fca326"
                                icon="mdi-message-reply-text"
                              >
                                <v-card
                                  v-if="result[questionSelect].heuristicComment"
                                  class="elevation-2"
                                >
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
                            </v-timeline>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-card>
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

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import ShowInfo from '@/shared/components/ShowInfo.vue';
import BarChart from '@/ux/Heuristic/components/charts/BarChart.vue';

const store = useStore();
const route = useRoute();

const emit = defineEmits(['goToCoops']);

const search = ref('');
const ind = ref(0);
const resultHeuristics = ref([]);
const heuristicSelect = ref(null);
const questionSelect = ref(null);
const intro = ref(null);

const test = computed(() => store.getters.test);

const answers = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return {};
  }
  return store.getters.testAnswerDocument.heuristicAnswers;
});

const loading = computed(() => !Object.values(answers.value).length);

const headersHeuristic = computed(() => {
  const header = [
    {
      title: 'Evaluator',
      align: 'start',
      value: 'uid',
    },
  ];
  if (heuristicSelect.value !== null) {
    test.value.testStructure[heuristicSelect.value].questions.forEach(
      (question) => {
        header.push({
          title: `Q${question.id + 1}`,
          align: 'center',
          value: question.id.toString(),
        });
      },
    );
  }
  return header;
});

const itemsHeuristic = computed(() => {
  const items = [];
  if (heuristicSelect.value !== null) {
    Object.values(answers.value).forEach((answer) => {
      items.push({
        uid: { uid: answer.userDocId },
        ...Object.fromEntries(
          Object.entries(answer.heuristicQuestions[heuristicSelect.value].heuristicQuestions)
            .map(([id, val]) => [id.toString(), val])
        ),
      });
    });
  }
  return items;
});

const questionGraph = computed(() => {
  const { testOptions: options } = test.value;

  const graph = {
    label: [...options.map((op) => op.text)],
    data: [...options.map(() => 0)],
  };

  if (heuristicSelect.value !== null && questionSelect.value !== null) {
    Object.values(answers.value).forEach((userAnswer) => {
      const question =
        userAnswer.heuristicQuestions[heuristicSelect.value].heuristicQuestions[
          questionSelect.value
        ];

      const optionSelect = options.find(
        (op) => op.text === question.heuristicAnswer.text,
      );
      if (optionSelect) {
        const optionIndex = graph.label.indexOf(optionSelect.text);
        graph.data[optionIndex] += 1;
      }
    });
  }
  return graph;
});

watch(
  answers,
  () => {
    if (Object.values(answers.value)) {
      intro.value = !Object.values(answers.value).length;
    }
  },
  { deep: true },
);

watch(heuristicSelect, () => {
  questionSelect.value = -1;
});

watch(questionSelect, () => {
  ind.value = 0;
});

onMounted(async () => {
  await store.dispatch('getCurrentTestAnswerDoc');
  // Handle heuristic query param if present
  if (route.query.heuristic) {
    heuristicSelect.value = Number(route.query.heuristic);
  }
});

const goToCoops = () => {
  emit('goToCoops');
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
}
</style>