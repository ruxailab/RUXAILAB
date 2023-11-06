<template>
  <div>
    <div v-if="answers">
      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64" />
      </v-overlay>
      <IntroAnswer v-if="answers != null && intro == true" @goToCoops="goToCoops" />
      <v-row v-else-if="answers != null && intro == false" justify="center" class="ma-0 mt-4">
        <ShowInfo title="Answers">
          <!-- Main Tabs -->
          <v-tabs slot="top" v-model="tab" background-color="transparent" color="#FCA326" class="ml-4">
            <v-tab @click="tab = 0">
              Analytics
            </v-tab>
          </v-tabs>

          <div slot="content" class="ma-0 pa-0">
            <AnalyticsView v-if="tab == 0" />
          </div>
        </ShowInfo>
      </v-row>
    </div>
    <div v-else>
      No answers yet
    </div>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo'
import IntroAnswer from '@/components/molecules/IntroAnswer'
import AnalyticsView from '@/views/admin/AnalyticsView.vue'

import { standardDeviation, finalResult, statistics } from '@/utils/statistics'

export default {
  components: {
    ShowInfo,
    IntroAnswer,
    AnalyticsView,
  },
  props: { id: { type: String, default: '' } },
  data: () => ({
    tab: 0,
    ind: 0,
    resultEvaluator: statistics(),
    intro: null,
  }),
  computed: {

    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
    answers() {
      const mockAnswers = [
        {
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
        },
      ]

      if (this.testAnswerDocument) {
        return Object.values(mockAnswers)
      }
      return []
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  watch: {
    answers() {
      if (
        this.testAnswerDocument &&
        (this.answers !== null || this.answers.length > 0)
      ) {
        statistics()
        if (this.answers.length == 0) this.intro = true
        else this.intro = false
      }
    },
    index() {
      this.ind = 0
    },
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