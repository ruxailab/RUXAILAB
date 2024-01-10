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
    // Computed property para calcular a média do tempo
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

      let longestTask = null
      let longestTime = 0

      this.taskAnswers.forEach((answer) => {
        const taskTime = answer.tasks[this.taskSelect].taskTime

        if (taskTime > longestTime) {
          longestTime = taskTime
          longestTask = this.testStructure.userTasks[this.taskSelect].taskName
        }
      })
      console.log(longestTask)
      console.log(this.formatTime(longestTime))
      return {
        taskName: longestTask,
        averageTime: this.formatTime(longestTime),
      }
    },
    goToCoops() {
      this.$emit('goToCoops')
    },
    viewAnswers(item) {
      this.dialogItem = item
      this.showDialog = true
    },
    // Método para calcular a média inicial no momento da criação
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
