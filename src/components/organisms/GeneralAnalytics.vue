<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro" @goToCoops="goToCoops" />
    <div>
      <!-- Tasks List -->
      <!-- <v-row class="ma-0 pa-0">
            <v-col class="ma-0 pa-0 task-list" cols="3">
              <v-list dense class="list-scroll">
                <v-subheader>Tasks</v-subheader>
                <v-divider />
                <v-list-item-group v-model="taskSelect" color="#fca326">
                  <v-list-item v-for="(item, i) in testTasks" :key="i">
                    <v-list-item-content>
                      <v-list-item-title>{{ item }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-divider vertical inset />

             Answer List 
            <v-col class="ma-0 pa-1 answer-list" cols="9">
              <v-data-table
                :headers="dataHeaders"
                :items="taskAnswers"
                item-key="userDocId"
              >
                <template v-slot:item.actions="{ item }">
                  <v-btn color="orange" text @click="viewAnswers(item)"
                    >Show Answers</v-btn
                  >
                </template>
              </v-data-table>
            </v-col>
          </v-row> -->

      <!-- Analysis Geral -->
      <v-row class="ma-0 pa-0 mt-4">
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Average Time per Task
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span>
                {{ calculateAverageTime() }}
              </span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Task Taking the Longest on Average
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span>
                {{ findLongestTask().taskName }} with the longest average of
                <span style="color: red;">{{
                  findLongestTask().averageTime
                }}</span>
              </span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Conclusion average
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span> {{ getConclusionAverage() }}% </span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Total in progress
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span> {{ getTestsInProgress().totalInProgress }}</span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Max
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span> {{ maxProgressPerTask() }}</span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Min
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span> {{ minProgressPerTask() }}</span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Total Answers
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span> {{ getTotalAnswers() }}</span>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <span class="font-weight-bold text-h6" style="color: #252525">
            Latest Response
          </span>
          <v-card outlined rounded="6">
            <div class="ma-6">
              <span>
                {{ getLatestResponse().cooperatorEmail }} Last Updated:
                {{ getFormattedDate(getLatestResponse().lastUpdate) }}</span
              >
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data: () => ({
    showDialog: false,
    dialogItem: null,
    search: '',
    taskSelect: 0,
    testTasks: [],
    taskAnswers: [],
    intro: null,
    dataHeaders: [
      {
        text: 'Email',
        value: 'userDocId',
      },
      {
        text: 'Actions',
        sortable: false,
        value: 'actions',
      },
    ],
  }),
  computed: {
    test() {
      return this.$store.getters.test
    },
    testStructure() {
      return this.$store.state.Tests.Test.testStructure
    },
    tasksAnswer() {
      return this.$store.getters.testAnswerDocument
    },
    answers() {
      if (!this.$store.getters.testAnswerDocument) {
        return []
      }
      return this.$store.getters.testAnswerDocument.taskAnswers
    },
    loading() {
      return !Object.values(this.answers).length
    },
    averageTimePerTask() {
      if (!this.taskAnswers.length) return 0

      const totalTaskTime = this.taskAnswers.reduce((total, answer) => {
        return total + answer.tasks[this.taskSelect].taskTime
      }, 0)

      return totalTaskTime / this.taskAnswers.length
    },
  },
  created() {
    let i = 0
    this.testStructure.userTasks.forEach((task) => {
      this.testTasks[i] = task.taskName
      i++
    })
    let c = 0
    for (const key in this.answers) {
      this.taskAnswers[c] = this.answers[key]
      c++
    }
  },
  methods: {
    formatTime(time) {
      var seconds = Math.floor(time / 1000)
      var minutes = Math.floor(seconds / 60)
      var remainingSeconds = seconds % 60

      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
    },
    findLongestTask() {
      if (!this.taskAnswers.length) return null

      const taskAverages = {}

      this.taskAnswers.forEach((answer) => {
        const taskTime = answer.tasks[this.taskSelect].taskTime

        if (!taskAverages[this.taskSelect]) {
          taskAverages[this.taskSelect] = {
            totalTime: taskTime,
            count: 1,
          }
        } else {
          taskAverages[this.taskSelect].totalTime += taskTime
          taskAverages[this.taskSelect].count += 1
        }
      })

      for (const task in taskAverages) {
        const averageTime =
          taskAverages[task].totalTime / taskAverages[task].count
        taskAverages[task].averageTime = averageTime
      }

      let longestTask = null
      let longestAverageTime = 0

      for (const task in taskAverages) {
        if (taskAverages[task].averageTime > longestAverageTime) {
          longestAverageTime = taskAverages[task].averageTime
          longestTask = task
          longestTask = this.testStructure.userTasks[task].taskName
        }
      }

      return {
        taskName: longestTask,
        averageTime: this.formatTime(longestAverageTime),
      }
    },
    getConclusionAverage() {
      if (!this.taskAnswers.length) return null

      let conclusion = null
      let eachConclusion = 0
      let totalAnswers = 0
      this.taskAnswers.forEach((answer) => {
        eachConclusion += answer.progress
        totalAnswers++
      })
      conclusion = eachConclusion / totalAnswers
      return conclusion
    },
    getTestsInProgress() {
      if (!this.taskAnswers.length) return null

      let totalProgress = 0
      let totalCompleted = 0
      this.taskAnswers.forEach((answer) => {
        if (answer.submitted) {
          totalCompleted++
        } else {
          totalProgress++
        }
      })
      return {
        totalInProgress: totalProgress,
        totalCompleted: totalCompleted,
      }
    },
    maxProgressPerTask() {
      if (!this.taskAnswers.length) return 0

      const progressArray = this.taskAnswers.map((answer) => {
        return answer.progress
      })

      const maxProgress = Math.max(...progressArray)

      return maxProgress
    },
    minProgressPerTask() {
      if (!this.taskAnswers.length) return 0

      const progressArray = this.taskAnswers.map((answer) => {
        return answer.progress
      })

      const minProgress = Math.min(...progressArray)

      return minProgress
    },
    getTotalAnswers() {
      return this.taskAnswers.length
    },
    getLatestResponse() {
      if (!this.taskAnswers.length) return null

      let latestResponse = this.taskAnswers[0].userDocId
      let lastUpdate = this.taskAnswers[0].lastUpdate

      this.taskAnswers.forEach((answer) => {
        if (answer.lastUpdate > this.taskAnswers[0].lastUpdate) {
          console.log('entrou no for')
          latestResponse = answer.userDocId
          lastUpdate = answer.lastUpdate
        }
      })

      return {
        cooperatorEmail: this.getCooperatorEmail(latestResponse),
        lastUpdate: lastUpdate,
      }
    },
    getCooperatorEmail(userDocId) {
      let cooperatorEmail = null
      if (this.test.cooperators && Array.isArray(this.test.cooperators)) {
        for (const element of this.test.cooperators) {
          if (element.userDocId === userDocId) {
            cooperatorEmail = element.email
          }
        }
      }
      return cooperatorEmail
    },
    getFormattedDate(date) {
      return new Date(date).toLocaleString()
    },
    goToCoops() {
      this.$emit('goToCoops')
    },
    viewAnswers(item) {
      this.dialogItem = item
      this.showDialog = true
    },
    calculateAverageTime() {
      const averageTime = this.formatTime(this.averageTimePerTask)
      return `Average Time: ${averageTime}`
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
}
</style>
