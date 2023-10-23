<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro == true" @goToCoops="goToCoops()" />
    <ShowInfo v-if="answers != null && !intro" title="Analytics">
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
                    <v-list-item v-for="(item, i) in testTasks" :key="i">
                      <v-list-item-content>
                        <v-list-item-title>{{ item }}</v-list-item-title>
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
            <!--Answer List-->
            <v-col class="ma-0 pa-0" cols="10">
              <v-list dense height="560px" outlined>
                <v-subheader>Task {{ testTasks[taskSelect] }} Answers</v-subheader>
                <v-divider />
                <div v-for="(item, i) in resultTasks" :key="i">
                  <v-list-item v-if="containsTask(item.tasks, testTasks[taskSelect]) !== null">
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.userDocId }}:
                        {{ containsTask(item.tasks, testTasks[taskSelect]).taskAnswer }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo.vue'

export default {
  components: {
    ShowInfo,
  },
  data: () => ({
    search: '',
    ind: 0,
    testTasks: [
      'task1',
      'task2',
      'task3',
      'task4',
    ],
    resultTasks: [
      {
        preTestUrl: 'https://example.com/pretest_A_1',
        consentUrl: 'https://example.com/consent_A_1',
        postTestUrl: 'https://example.com/posttest_A_1',
        tasks: [{
          taskAnswer: 'pretty cool',
          taskObservations: 'Observations for Task A1',
          taskTime: 'Task A1 Time',
          audioRecordURL: 'https://example.com/audio_A_1',
          screenRecordURL: 'https://example.com/screen_A_1',
          webcamRecordURL: 'https://example.com/webcam_A_1',
          taskId: 'task1',
        }, {
          taskAnswer: 'cool task',
          taskObservations: 'Observations for Task A2',
          taskTime: 'Task A2 Time',
          audioRecordURL: 'https://example.com/audio_A_2',
          screenRecordURL: 'https://example.com/screen_A_2',
          webcamRecordURL: 'https://example.com/webcam_A_2',
          taskId: 'task2',
        }],
        progress: 100,
        total: 10,
        submitted: false,
        userDocId: 'Carlos',
        lastUpdate: new Date(), // Current timestamp
      },
      {
        preTestUrl: 'https://example.com/pretest_B_1',
        consentUrl: 'https://example.com/consent_B_1',
        postTestUrl: 'https://example.com/posttest_B_1',
        tasks: [{
          taskAnswer: 'awful task',
          taskObservations: 'Observations for Task B1',
          taskTime: 'Task B1 Time',
          audioRecordURL: 'https://example.com/audio_B_1',
          screenRecordURL: 'https://example.com/screen_B_1',
          webcamRecordURL: 'https://example.com/webcam_B_1',
          taskId: 'task4',
        }],
        progress: 30,
        total: 5,
        submitted: true,
        userDocId: 'Maria',
        lastUpdate: new Date(), // Current timestamp
      },
      {
        preTestUrl: 'https://example.com/pretest_C_1',
        consentUrl: 'https://example.com/consent_C_1',
        postTestUrl: 'https://example.com/posttest_C_1',
        tasks: [{
          taskAnswer: 'mid',
          taskObservations: 'Observations for Task C1',
          taskTime: 'Task C1 Time',
          audioRecordURL: 'https://example.com/audio_C_1',
          screenRecordURL: 'https://example.com/screen_C_1',
          webcamRecordURL: 'https://example.com/webcam_C_1',
          taskId: 'task3',
        }, {
          taskAnswer: 'kinda fun',
          taskObservations: 'Observations for Task C2',
          taskTime: 'Task C2 Time',
          audioRecordURL: 'https://example.com/audio_C_2',
          screenRecordURL: 'https://example.com/screen_C_2',
          webcamRecordURL: 'https://example.com/webcam_C_2',
          taskId: 'task2',
        }],
        progress: 70,
        total: 12,
        submitted: false,
        userDocId: 'Joao',
        lastUpdate: new Date(), // Current timestamp
      }],
    taskSelect: null,
    answerSelect: null,
    intro: null,
  }),
  computed: {
    answers() {
      const mockAnswers = this.resultTasks
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
    containsTask(tasks, selectedTask) {
      const index = tasks.findIndex((task) => task.taskId === selectedTask)
      if (index !== -1) {
        return tasks[index]
      }
      return null
    },
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