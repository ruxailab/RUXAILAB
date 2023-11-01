<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro" @goToCoops="goToCoops" />
    <ShowInfo v-if="answers != null && !intro" title="Analytics">
      <div slot="content">
        <v-card outlined class="task-container">
          <v-row class="ma-0 pa-0">
            <!-- Tasks List -->
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

            <!-- Answer List -->
            <v-col class="ma-0 pa-1 answer-list" cols="9">
              <v-data-table
                :headers="dataHeaders"
                :items="taskAnswers"
                item-key="userDocId"
              >
                <template>
                  <v-btn text @click="showDialog = true">Show Answers</v-btn>
                </template>
                <!-- <template v-slot:expanded-item="{ item }">
                  <v-row>
                    <v-col cols="6">
                      <v-card-title>
                        <span class="font-weight-bold">Answers</span>
                      </v-card-title>
                      <v-card-text>{{
                        item.tasks[taskSelect].taskAnswer
                      }}</v-card-text>
                    </v-col>
                    <v-col cols="6">
                      <v-card-title>
                        <span class="font-weight-bold">Observations</span>
                      </v-card-title>
                      <v-card-text>{{
                        item.tasks[taskSelect].taskObservations
                      }}</v-card-text>
                    </v-col>
                  </v-row>
                </template> -->
              </v-data-table>
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
    showDialog: false,
    search: '',
    taskSelect: 0, // Define o valor inicial de seleção de tarefas
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
      console.log(this.$store.getters.testAnswerDocument.taskAnswers)
      return this.$store.getters.testAnswerDocument.taskAnswers
    },
    loading() {
      return !Object.values(this.answers).length
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
    console.log(this.taskAnswers)
  },
  methods: {
    goToCoops() {
      this.$emit('goToCoops')
    },
    getCooperatorEmail(userDocId) {
      let cooperatorEmail = null
      if (this.test.cooperators && Array.isArray(this.test.cooperators)) {
        for (const element of this.test.cooperators) {
          if (element && element.email && element.userDocId === userDocId) {
            cooperatorEmail = element.email
          }
        }
      }
      return cooperatorEmail
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
