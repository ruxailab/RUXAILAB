<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro == true" @goToCoops="goToCoops()" />
    <ShowInfo v-if="answers != null && !intro " title="Analytics">
      <div slot="content" class="ma-0 pa-0">
        <v-card style="background: #f5f7ff">
          <v-row v-if="resultTasks" class="ma-0 pa-0">
            <!--Tasks List-->
            <v-col class="ma-0 pa-0" cols="2">
              <v-list dense height="560px" outlined>
                <v-subheader>Tasks</v-subheader>
                <v-divider />
                <v-list dense height="470px" outlined class="list-scroll">
                  <v-list-item-group v-model="taskSelect" color="#fca326">
                    <v-list-item v-for="(item, i) in resultTasks" :key="i">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.taskId }}</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-icon v-if="i == taskSelect">
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-list-item-icon>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-list>
            </v-col>
            <v-divider vertical inset />
            <!--Answers List-->
            <v-col v-if="taskSelect !== null" class="ma-0 pa-0" cols="3">
              <v-list dense height="560px" outlined>
                <v-subheader>
                    Answers
                </v-subheader>
                <v-divider />
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
                    <v-list-item v-for="(item, i) in resultTasks" :key="i" :value="i"
                    >
                      <v-list-item-content>
                        <v-list-item-title>{{ item.taskAnswer }}</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-icon v-if="i == questionSelect">
                        <v-icon>mdi-chevron-right</v-icon>
                      </v-list-item-icon>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-list>
            </v-col>
            <!--Content-->
            <v-col v-if="questionSelect !== null && taskSelect !== null" class="ma-0 pa-0">
              <v-card height="560px" elevation-0>
                <v-subheader v-if="questionSelect != -1" class="pa-2">
                  {{
                    resultTasks[questionSelect]
                  }}
                </v-subheader>
                <v-subheader v-else class="pa-2">
                  Data Table
                </v-subheader>
                <v-divider />
                <v-row v-if="questionSelect == -1">
                  <v-col>
                    <v-text-field v-model="search" class="mx-3" append-icon="mdi-magnify"
                                  label="Search"
                    />
                    <v-data-table class="elevation-1" :headers="headersHeuristic"
                                  :items="itemsHeuristic" :search="search" height="360px" dense
                    >
                      <template v-for="header in headersHeuristic"
                                v-slot:[`item.${header.value}`]="{ item }"
                      >
                        <div v-if="item[header.value] == null" :key="header.value">
                          -
                        </div>
                        <div v-else :key="header.value">
                          {{ item[header.value] }}
                        </div>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
                <v-row v-else class="ma-0 pa-0">
                  <v-tabs v-model="ind" background-color="transparent" color="grey darken-2" class="mt-2"
                          centered
                  >
                    <v-tab class="tab-text" style="text-transform: none !important" @click="ind = 0">
                      Comments
                    </v-tab>
                    <v-tab class="tab-text" style="text-transform: none !important" @click="ind = 1">
                      Graphic
                    </v-tab>
                  </v-tabs>
                  <v-col v-if="ind == 1">
                    <v-row justify="center">
                      <v-col cols="10">
                        <BarChart v-if="questionGraph" :labels="questionGraph.label"
                                  :data="questionGraph.data" legend="Quantity"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col v-if="ind == 0">
                    <v-row class="list-scroll" style="height: 430px" justify="center">
                      <v-col cols="10">
                        <v-timeline v-if="resultTasks[taskSelect].questions[
                          questionSelect
                        ].result.length
                        " dense
                        >
                          <div v-for="(result, index) in resultTasks[
                            taskSelect
                          ].questions[questionSelect].result" :key="index"
                          >
                            <v-timeline-item v-if="result.comment" fill-dot color="#fca326"
                                             icon="mdi-message-reply-text"
                            >
                              <v-card class="elevation-2">
                                <v-card-text>{{ result.comment }}</v-card-text>
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
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import BarChart from '@/components/atoms/BarChart.vue'
// import IntroAnalytics from '@/components/molecules/IntroAnalytics.vue'

export default {
    components: {
        ShowInfo,
        BarChart,
        // IntroAnalytics,
    },
    // eslint-disable-next-line vue/prop-name-casing, vue/require-prop-types
    props: ['id', 'HEURISTICS'],
    data: () => ({
        search: '',
        ind: 0,
        resultTasks: [
            {
                taskId: 'task_1',
                taskAnswer: 'Answer to Task A1',
                taskObservations: 'Observations for Task A1',
                taskTime: 'Task A1 Time',
                audioRecordURL: 'https://example.com/audio_A_1',
                screenRecordURL: 'https://example.com/screen_A_1',
                webcamRecordURL: 'https://example.com/webcam_A_1',
            },
            {
                taskId: 'task_2',
                taskAnswer: 'Answer to Task A2',
                taskObservations: 'Observations for Task A2',
                taskTime: 'Task A2 Time',
                audioRecordURL: 'https://example.com/audio_A_2',
                screenRecordURL: 'https://example.com/screen_A_2',
                webcamRecordURL: 'https://example.com/webcam_A_2',
            },
        ],
        taskSelect: null,
        questionSelect: null,
        intro: null,
    }),
    computed: {
        answers() {
            const mockAnswers = [{
                type: 'typeA',
                taskAnswers: {
                    'userDocID_1': {
                        preTestUrl: 'https://example.com/pretest_A_1',
                        consentUrl: 'https://example.com/consent_A_1',
                        postTestUrl: 'https://example.com/posttest_A_1',
                        tasks: {
                            'taskId_1': {
                                taskAnswer: 'Answer to Task A1',
                                taskObservations: 'Observations for Task A1',
                                taskTime: 'Task A1 Time',
                                audioRecordURL: 'https://example.com/audio_A_1',
                                screenRecordURL: 'https://example.com/screen_A_1',
                                webcamRecordURL: 'https://example.com/webcam_A_1',
                            },
                            'taskId_2': {
                                taskAnswer: 'Answer to Task A2',
                                taskObservations: 'Observations for Task A2',
                                taskTime: 'Task A2 Time',
                                audioRecordURL: 'https://example.com/audio_A_2',
                                screenRecordURL: 'https://example.com/screen_A_2',
                                webcamRecordURL: 'https://example.com/webcam_A_2',
                            },
                        },
                        progress: 100,
                        total: 10,
                        submitted: false,
                        userDocId: 'userDocID_1',
                        lastUpdate: new Date(), // Current timestamp
                    },
                },
            },
            {
                type: 'typeB',
                taskAnswers: {
                    'userDocID_2': {
                        preTestUrl: 'https://example.com/pretest_B_1',
                        consentUrl: 'https://example.com/consent_B_1',
                        postTestUrl: 'https://example.com/posttest_B_1',
                        tasks: {
                            'taskId_1': {
                                taskAnswer: 'Answer to Task B1',
                                taskObservations: 'Observations for Task B1',
                                taskTime: 'Task B1 Time',
                                audioRecordURL: 'https://example.com/audio_B_1',
                                screenRecordURL: 'https://example.com/screen_B_1',
                                webcamRecordURL: 'https://example.com/webcam_B_1',
                            },
                        },
                        progress: 30,
                        total: 5,
                        submitted: true,
                        userDocId: 'userDocID_2',
                        lastUpdate: new Date(), // Current timestamp
                    },
                },
            },
            {
                type: 'typeC',
                taskAnswers: {
                    'userDocID_3': {
                        preTestUrl: 'https://example.com/pretest_C_1',
                        consentUrl: 'https://example.com/consent_C_1',
                        postTestUrl: 'https://example.com/posttest_C_1',
                        tasks: {
                            'taskId_1': {
                                taskAnswer: 'Answer to Task C1',
                                taskObservations: 'Observations for Task C1',
                                taskTime: 'Task C1 Time',
                                audioRecordURL: 'https://example.com/audio_C_1',
                                screenRecordURL: 'https://example.com/screen_C_1',
                                webcamRecordURL: 'https://example.com/webcam_C_1',
                            },
                            'taskId_2': {
                                taskAnswer: 'Answer to Task C2',
                                taskObservations: 'Observations for Task C2',
                                taskTime: 'Task C2 Time',
                                audioRecordURL: 'https://example.com/audio_C_2',
                                screenRecordURL: 'https://example.com/screen_C_2',
                                webcamRecordURL: 'https://example.com/webcam_C_2',
                            },
                        },
                        progress: 70,
                        total: 12,
                        submitted: false,
                        userDocId: 'userDocID_3',
                        lastUpdate: new Date(), // Current timestamp
                    },
                },
            }]
            if (this.testAnswerDocument) {
                return Object.values(mockAnswers)
            }
            return []
        },
        loading() {
            return !Object.values(this.answers).length
        },
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