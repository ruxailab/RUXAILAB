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
                <template v-slot:item.actions="{ item }">
                  <v-btn color="orange" text @click="viewAnswers(item)"
                    >Show Answers</v-btn
                  >
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </ShowInfo>
    <template>
      <v-dialog v-model="showDialog" max-width="600">
        <v-card>
          <v-toolbar color="orange" dark>
            <span class="headline">Answer and Observation</span>
          </v-toolbar>
          <v-card-text>
            <v-row v-if="dialogItem">
              <v-col
                v-if="dialogItem.tasks[taskSelect].taskAnswer != ''"
                :cols="
                  dialogItem.tasks[taskSelect].taskObservations != ''
                    ? '6'
                    : '12'
                "
                class="mt-4"
              >
                <span class="font-weight-bold text-h6" style="color: #252525;"
                  >Answer</span
                >
                <v-card outlined rounded="6">
                  <div class="ma-6">
                    <span>
                      {{ dialogItem.tasks[taskSelect].taskAnswer }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <v-col
                :cols="
                  dialogItem.tasks[taskSelect].taskAnswer != '' ? '6' : '12'
                "
                class="mt-4"
              >
                <span class="font-weight-bold text-h6" style="color: #252525;"
                  >Observation</span
                >
                <v-card outlined rounded="6">
                  <div class="ma-6">
                    <span>
                      {{ dialogItem.tasks[taskSelect].taskObservations }}
                    </span>
                  </div>
                </v-card>
              </v-col>
              <div v-if="dialogItem" class="mx-auto">
                <v-col
                  cols="12"
                  v-if="dialogItem.tasks[taskSelect].webcamRecordURL"
                  class="d-flex align-center justify-center"
                >
                  <span
                    class="font-weight-bold text-h6"
                    style="color: #252525;"
                    v-if="dialogItem"
                    >Web Cam Record</span
                  >
                  <video
                    v-if="dialogItem"
                    :src="dialogItem.tasks[taskSelect].webcamRecordURL"
                    controls
                    width="400"
                  ></video>
                </v-col>
              </div>
              <div v-if="dialogItem">
                <v-col
                  cols="12"
                  v-if="dialogItem.tasks[taskSelect].screenRecordURL"
                  class="d-flex align-center justify-center flex-column"
                >
                  <span
                    class="font-weight-bold text-h6 mb-2"
                    style="color: #252525;"
                    >Screen Record</span
                  >
                  <video
                    :src="dialogItem.tasks[taskSelect].screenRecordURL"
                    controls
                    height="250"
                  ></video>
                </v-col>
              </div>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="orange" text @click="showDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
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
    dialogItem: null,
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
    viewAnswers(item) {
      this.dialogItem = item
      this.showDialog = true
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
