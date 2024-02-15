<template>
  <div v-if="test">
    <v-dialog :value="fromlink && noExistUser" width="500" persistent>
      <CardSignIn
        v-if="selected"
        @logined="logined = true"
        @change="selected = !selected"
      />
      <CardSignUp
        v-else
        @logined="
          logined = true
          setTest()
        "
        @change="selected = !selected"
      />
    </v-dialog>

    <v-dialog
      :value="fromlink && !noExistUser && !logined"
      width="500"
      persistent
    >
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar class="justify-center" color="orange lighten-4" size="150">
            <v-icon size="120" dark> mdi-account </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn color="#F9A826" class="white--text" @click="setTest()">
            Continue as {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            Not {{ user.email }}?
            <a style="color: #f9a826" @click="signOut()">Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Start Screen -->
    <v-row
      v-if="test && start"
      class="background background-img pa-0 ma-0"
      align="center"
    >
      <v-col cols="6" class="ml-5">
        <h1 class="titleView pb-1">
          {{ test.testTitle }}
        </h1>
        <p align="justify" class="description">
          {{ test.testDescription }}
        </p>
        <v-row justify="center" class>
          <v-btn color="white" outlined rounded @click="startTest()">
            Start Test
          </v-btn>
        </v-row>
      </v-col>
    </v-row>

    <v-row
      v-else
      class="nav pa-0 ma-0"
      style="background-color: #e8eaf2;"
      dense
    >
      <v-navigation-drawer
        v-model="drawer"
        clipped
        :mini-variant="mini"
        permanent
        color="#3F3D56"
      >
        <div v-if="!mini" class="header">
          <v-list-item>
            <v-row dense align="center" justify="space-around">
              <v-col class="pa-0 ma-0" cols="8">
                <v-clamp class="titleText" autoresize :max-lines="2">
                  {{ test.testTitle }}
                </v-clamp>
              </v-col>
              <v-col>
                <v-progress-circular
                  rotate="-90"
                  :value="calculateProgress()"
                  color="#fca326"
                  :size="50"
                  class="mt-2"
                >
                  {{ calculateProgress() }}%
                </v-progress-circular>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list
          class="nav-list"
          flat
          dense
          max-height="85%"
          style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px"
        >
          <div v-for="(item, n) in items" :key="n">
            <!--Pre Test-->
            <v-list-item
              v-if="item.id == 0"
              :value="index == 0 ? true : false"
              no-action
              @click="index = item.id"
            >
              <v-list-item-icon>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="index == item.id ? 'color: white' : 'color:#fca326'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="item.id == 1"
              :value="index == 1 ? true : false"
              no-action
              @click="index = item.id"
            >
              <v-list-item-icon>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="index == item.id ? 'color: white' : 'color:#fca326'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-else-if="item.id == 2 && !isAdmin"
              @click="index = item.id"
            >
              <v-list-item-icon>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="index == item.id ? 'color: white' : 'color:#fca326'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
        </v-list>

        <div class="footer">
          <v-spacer />
          <v-btn icon class="mr-2" @click.stop="mini = !mini">
            <v-icon v-if="mini" color="white"> mdi-chevron-right </v-icon>
            <v-icon v-else color="white"> mdi-chevron-left </v-icon>
          </v-btn>
        </div>
      </v-navigation-drawer>
      <!-- MODERATOR VIEW -->
      <v-col
        ref="rightView"
        class="mx-15 mt-4 right-view backgroundTest"
        v-if="index == 0 && taskIndex == 0 && isAdmin"
      >
        <v-card color="white" class="cards" v-if="!conectionStatus">
          <v-row justify="center" class="mt-4">
            <v-col cols="11" class="mt-3">
              <span class="cardsTitle">Confirm you are ready</span>
              <v-row justify="center" class="mt-1">
                <v-col cols="11" class="pt-0">
                  <span
                    class="cardsSubtitle"
                  >
                    This area enables you to connect via voice and camera with
                    your evaluator so that, when ready, they can start the test.
                  </span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-4">
            <VideoCall
              ref="VideoCall"
              @emit-confirm="confirmConnect()"
              :index="index"
              :isAdmin="isAdmin"
            />
          </v-row>
        </v-card>
        <v-expansion-panels v-else flat accordion>
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-header>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Pre-Test</span>
                <v-icon color="orange">mdi-dots-horizontal</v-icon>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <v-row
                v-for="(item, index) in test.testStructure.preTest"
                :key="index"
              >
                <v-col cols="5" class="mx-auto py-0">
                  <p class="cardsTitle">{{ item.title }}</p>
                  <p class="cardsSubtitle" v-if="item.description">{{ item.description }}</p>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Tarefas do Usuário -->
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
            v-for="(task, index) in test.testStructure.userTasks"
            :key="index"
          >
            <v-expansion-panel-header>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">{{ task.taskName }}</span>
                <v-icon v-if="task.taskStatus == 'closed'" color="green"
                  >mdi-play</v-icon
                >
                <v-icon
                  v-else-if="task.taskStatus == 'inProgress'"
                  color="orange"
                  >mdi-dots</v-icon
                >
                <v-icon v-else-if="task.taskStatus == 'done'" color="green"
                  >mdi-check</v-icon
                >
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12" class="mb-0">
                  <span class="ml-4" style="color: #455a64">
                    {{ test.testStructure.userTasks[index].taskDescription }}
                  </span>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Post-Test -->
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-header>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Post-Test</span>
                <v-icon color="#8D8D8D">mdi-lock</v-icon>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <v-row
                v-for="(item, index) in test.testStructure.postTest"
                :key="index"
              >
                <v-col cols="5" class="mx-auto py-0">
                  <p class="cardsTitle">{{ item.title }}</p>
                  <p class="cardsSubtitle" v-if="item.description">{{ item.description }}</p>
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-col class="mx-4">
                  <v-btn
                    block
                    dark
                    style="border-radius: 10px"
                    color="orange lighten-1"
                    depressed
                    :disabled="currentUserTestAnswer.postTestCompleted"
                    @click="
                      completeStep(taskIndex, 'postTest'), (taskIndex = 3)
                    "
                    >{{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col
        ref="rightView"
        class="mx-10 mt-2 right-view backgroundTest"
        v-if="index == 1 && taskIndex == 0 && isAdmin"
      >
        <FeedbackView :index="index" :isAdmin="isAdmin" />
      </v-col>
      <!--////// EVALUATOR VIEW //////-->
      <v-col
        ref="rightView"
        class="mx-15 mt-4 right-view backgroundTest"
        style=""
        v-if="index == 0 && taskIndex == 0 && !isAdmin"
      >
        <v-card color="white" flat class="cards mb-6">
          <v-row justify="center" class="mt-4">
            <v-col cols="11" class="mt-3">
              <span class="cardsTitle">Welcome!</span>
              <v-row justify="center" class="mt-1">
                <v-col cols="11" class="pt-2 mb-5">
                  <span class="cardsSubtitle">
                    Welcome! in this test you are going to test a VR application
                    that lorem ipsum lorem ipsum dolor sit amet consectetur
                    adipiscing elit lorem ipsum dolor sit amet consectetur
                    adipiscing elit lorem ipsum dolor sit amet consectetur
                    adipiscing elit lorem ipsum dolor sit amet consectetur
                    adipiscing elit
                  </span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
        <v-card color="white" flat class="cards mb-6">
          <v-row justify="center" class="mt-4">
            <v-col cols="11" class="mt-3">
              <span class="cardsTitle">We need your consentiment!</span>
              <v-row justify="center" class="mt-1">
                <v-col cols="11" class="pt-2 mb-5">
                  <span class="cardsSubtitle">
                    The information you give is used for orem ipsum lorem ipsum
                    dolor sit amet consectetur adipiscing elit lorem ipsum dolor
                    sit amet consectetur adipiscing elit lorem ipsum dolor sit
                    amet consectetur adipiscing elit lorem ipsum dolor sit amet
                    consectetur adipiscing elit
                  </span>
                </v-col>
              </v-row>
              <v-checkbox
                v-model="currentUserTestAnswer.consentCompleted"
                @change="saveAnswer()"
                color="orange"
                class="ma-0 pa-0"
                ><template v-slot:label
                  ><span style="color: #455a64">{{
                    test.testStructure.consent
                  }}</span></template
                ></v-checkbox
              >
            </v-col>
          </v-row>
        </v-card>
        <v-card color="white" flat class="cards mb-6">
          <v-row justify="center" class="mt-4">
            <v-col cols="11" class="mt-3">
              <span class="cardsTitle">Connect with your moderator</span>
              <v-row justify="center" class="mt-1">
                <v-col cols="11" class="pt-0">
                  <span class="cardsSubtitle">
                    This area enables you to connect via voice and camera with
                    your moderator so that, when ready, they can start the test.
                  </span>
                </v-col>
                <v-col
                  v-if="moderatorStatus == false"
                  cols="4"
                  class="mt-2 mb-8 mr-8"
                >
                  <span class="cardsTitle text-center d-block"
                    >Waiting the moderator...</span
                  >
                  <div class="dot-flashing mx-auto mt-4"></div>
                </v-col>

                <v-col v-else cols="4" class="mt-2 mb-8 mr-8"
                  ><VideoCall
                    ref="VideoCall"
                    @emit-confirm="confirmConnect()"
                    :index="index"
                    :isAdmin="isAdmin"
                /></v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <!--////// TASKS //////-->
      <v-col
        ref="rightView"
        class="mx-10 mt-6 right-view backgroundTest"
        v-if="index == 1 && !isAdmin"
      >
        <v-expansion-panels flat accordion>
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-header>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Pre-Test</span>
                <v-icon color="green">mdi-lock-open</v-icon>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <v-row
                v-for="(item, index) in test.testStructure.preTest"
                :key="index"
              >
                <v-col cols="5" class="mx-auto py-0">
                  <p>{{ item.title }}</p>
                  <p v-if="item.description">{{ item.description }}</p>
                  <v-text-field
                    :disabled="currentUserTestAnswer.preTestCompleted"
                    v-model="currentUserTestAnswer.preTestAnswer[index].answer"
                    v-if="item.textField"
                    :placeholder="item.title"
                    outlined
                  ></v-text-field>
                  <v-radio-group
                    :disabled="currentUserTestAnswer.preTestCompleted"
                    v-if="item.selectionField"
                    v-model="currentUserTestAnswer.preTestAnswer[index].answer"
                    column
                  >
                    <v-row
                      v-for="(selection,
                      selectionIndex) in item.selectionFields"
                      :key="selectionIndex"
                    >
                      <v-radio
                        :disabled="currentUserTestAnswer.preTestCompleted"
                        class="ml-3 mb-1"
                        :label="selection"
                        :value="selection"
                      ></v-radio>
                    </v-row>
                    <v-row justify="end"> </v-row>
                  </v-radio-group>
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-col class="mx-4">
                  <v-btn
                    block
                    dark
                    style="border-radius: 10px"
                    color="orange lighten-1"
                    depressed
                    :disabled="currentUserTestAnswer.preTestCompleted"
                    @click="
                      completeStep(taskIndex, 'preTest'),
                        (index = 0),
                        (taskIndex = 0)
                    "
                    >{{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Tarefas do Usuário -->
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
            v-for="(task, index) in test.testStructure.userTasks"
            :key="index"
          >
            <v-expansion-panel-header>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">{{ task.taskName }}</span>
                <v-icon v-if="task.taskStatus == 'closed'" color="#8D8D8D"
                  >mdi-lock</v-icon
                >
                <v-icon
                  v-else-if="task.taskStatus == 'inProgress'"
                  color="orange"
                  >mdi-unlock</v-icon
                >
                <v-icon v-else-if="task.taskStatus == 'done'" color="green"
                  >mdi-check</v-icon
                >
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12" class="mb-0">
                  <span class="ml-4" style="color: #455a64">
                    {{ test.testStructure.userTasks[index].taskDescription }}
                  </span>
                </v-col>
                <v-col class="mx-4">
                  <v-btn
                    block
                    dark
                    style="border-radius: 10px"
                    color="orange lighten-1"
                    depressed
                    @click="completeStep(taskIndex, 'tasks'), callTimerSave()"
                  >
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- Post-Test -->
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-header>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Post-Test</span>
                <v-icon color="#8D8D8D">mdi-lock</v-icon>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider class="mb-6"></v-divider>
              <v-row
                v-for="(item, index) in test.testStructure.postTest"
                :key="index"
              >
                <v-col cols="5" class="mx-auto py-0">
                  <p>{{ item.title }}</p>
                  <p v-if="item.description">{{ item.description }}</p>
                  <v-text-field
                    :disabled="currentUserTestAnswer.postTestCompleted"
                    v-model="currentUserTestAnswer.postTestAnswer[index].answer"
                    v-if="item.textField"
                    :placeholder="item.title"
                    outlined
                  ></v-text-field>
                  <v-radio-group
                    :disabled="currentUserTestAnswer.postTestCompleted"
                    v-if="item.selectionField"
                    v-model="currentUserTestAnswer.postTestAnswer[index].answer"
                    column
                  >
                    <v-row
                      v-for="(selection,
                      selectionIndex) in item.selectionFields"
                      :key="selectionIndex"
                    >
                      <v-radio
                        :disabled="currentUserTestAnswer.postTestCompleted"
                        class="ml-3 mb-1"
                        :label="selection"
                        :value="selection"
                      ></v-radio>
                    </v-row>
                    <v-row justify="end"> </v-row>
                  </v-radio-group>
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-col class="mx-4">
                  <v-btn
                    block
                    dark
                    style="border-radius: 10px"
                    color="orange lighten-1"
                    depressed
                    :disabled="currentUserTestAnswer.postTestCompleted"
                    @click="
                      completeStep(taskIndex, 'postTest'), (taskIndex = 3)
                    "
                    >{{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col
        ref="rightView"
        class="mx-10 mt-2 right-view backgroundTest"
        v-if="index == 2 && taskIndex == 0"
      >
        <FeedbackView :index="index" :isAdmin="isAdmin" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import VClamp from 'vue-clamp'
import CardSignIn from '@/components/atoms/CardSignIn'
import CardSignUp from '@/components/atoms/CardSignUp'
import VideoCall from '@/components/molecules/VideoCall.vue'
import { onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import FeedbackView from '@/components/molecules/FeedbackView.vue'

export default {
  components: {
    VClamp,
    CardSignIn,
    CardSignUp,
    VideoCall,
    FeedbackView,
  },
  data: () => ({
    conectionStatus: false,
    isAdmin: false,
    logined: null,
    selected: true,
    fromlink: null,
    drawer: true,
    start: true,
    mini: false,
    index: 0,
    noExistUser: true,
    taskIndex: 0,
    preTestIndex: null,
    items: [],
    taskAnswers: {},
    dialog: false,
    allTasksCompleted: false,
    moderatorStatus: null,
    evaluatorStatus: null,
  }),
  computed: {
    test() {
      return this.$store.getters.test
    },
    testId() {
      return this.$store.getters.test.id
    },
    user() {
      if (this.$store.getters.user) this.setExistUser()
      return this.$store.getters.user
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
    cooperators() {
      return this.$store.getters.cooperators
    },
    loading() {
      return this.$store.getters.loading
    },
    tasks() {
      return this.$store.getters.tasks
    },
    roomTestId() {
      return this.$store.getters.test.id
    },
  },
  watch: {
    test: async function() {
      this.mappingSteps()
    },
    taskIndex() {
      this.$refs.rightView.scrollTop = 0 //faz scroll pra cima qnd muda a task
    },
    async user() {
      if (this.user) {
        this.noExistUser = false
        if (this.logined) this.setTest()
      }
    },
  },
  async created() {
    await this.verifyAdmin()
    await this.mappingSteps()
    const ref = doc(db, 'tests/', this.roomTestId)
    onSnapshot(ref, (snapshot) => {
      this.moderatorStatus = snapshot.data().userTestStatus.moderator
      this.evaluatorStatus = snapshot.data().userTestStatus.user
    })
  },
  beforeDestroy() {
    this.disconnect()
    this.$refs.VideoCall.hangUp()
  },
  methods: {
    async saveAnswer() {
      await this.$store.dispatch('saveTestAnswer', {
        data: this.currentUserTestAnswer,
        answerDocId: this.test.answersDocId,
        testType: this.test.testType,
      })
    },
    async confirmConnect() {
      console.log('confirm')
      const ref = doc(db, 'tests', this.roomTestId)
      if (this.isAdmin) {
        try {
          await updateDoc(ref, {
            userTestStatus: {
              moderator: true,
              user: false,
            },
          })
          this.conectionStatus = true
        } catch (e) {
          console.error('Error in connect:', e)
        }
      } else {
        try {
          await updateDoc(ref, {
            userTestStatus: {
              user: true,
              moderated: true,
            },
          })
          this.conectionStatus = true
        } catch (e) {
          console.error('Error in connect:', e)
        }
      }
    },
    async disconnect() {
      console.log('Disconnecting...')
      const ref = doc(db, 'tests', this.roomTestId)
      try {
        await updateDoc(ref, {
          userTestStatus: {
            moderator: false,
            user: false,
          },
        })
      } catch (e) {
        console.error('Error in connect:', e)
      }
    },
    async submitAnswer() {
      this.currentUserTestAnswer.submitted = true
      await this.saveAnswer()
    },
    startTest() {
      if (this.test.testStructure.length == 0) {
        alert("This test don't have any task")
        this.$router.push('/managerview/' + this.test.id)
      }
      this.start = !this.start
    },
    callTimerSave() {
      const timerComponent = this.$refs.timerComponent

      timerComponent.stopTimer()
    },
    handleTimerStopped(elapsedTime, taskIndex) {
      this.currentUserTestAnswer.tasks[taskIndex].taskTime = elapsedTime
    },

    calculateProgress() {
      const totalSteps = 4

      let completedSteps = 0

      if (this.currentUserTestAnswer.preTestCompleted) {
        completedSteps++
      }

      if (this.currentUserTestAnswer.consentCompleted) {
        completedSteps++
      }

      if (this.currentUserTestAnswer.postTestCompleted) {
        completedSteps++
      }

      // Calcular a porcentagem de conclusão
      const progressPercentage = (completedSteps / totalSteps) * 100
      this.currentUserTestAnswer.progress = progressPercentage
      return progressPercentage
    },
    async setTest() {
      this.logined = true
      await this.$store.dispatch('getCurrentTestAnswerDoc')
      this.populateWithHeuristicQuestions()
    },
    setExistUser() {
      this.noExistUser = false
    },
    async verifyAdmin() {
      if (this.test.testAdmin.email == this.user.email) {
        this.isAdmin = true
      }
    },
    async mappingSteps() {
      if (this.isAdmin) {
        if (this.validate(this.test.testStructure.preTest)) {
          this.items.push({
            title: 'Moderator view',
            icon: 'mdi-security',
            value: this.test.testStructure.postTest,
            id: 0,
          })
        }

        if (this.validate(this.test.testStructure.preTest)) {
          if (this.items.length) {
            this.items.push({
              title: 'Feedback',
              icon: 'mdi-monitor-account',
              value: this.test.testStructure.postTest,
              id: 1,
            })
          }
        }
      } else {
        //PreTest
        if (this.validate(this.test.testStructure.preTest)) {
          this.items.push({
            title: 'Welcome Page',
            icon: 'mdi-human-greeting',
            id: 0,
          })
        }

        //Tasks
        if (this.validate(this.test.testStructure.userTasks))
          this.items.push({
            title: 'Tasks',
            icon: 'mdi-checkbox-marked-circle-auto-outline',
            id: 1,
          })

        //PostTest
        if (this.validate(this.test.testStructure.postTest))
          this.items.push({
            title:
              /* Ajuste conforme necessário para levar em consideração a altura do app bar */ 'Feedback',
            icon: 'mdi-monitor-account',
            id: 2,
          })
      }
    },
    validate(object) {
      return object !== null && object !== undefined && object !== ''
    },
  },
}
</script>

<style scoped>
.nav {
  background-color: #e8eaf2;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

/* Estilo para a lista de navegação */
.nav-list {
  max-height: 85%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 100px;
}

/* Estilo para os cartões de conteúdo */
.cards {
  margin-top: 16px;
}

/* Estilo para o título dos cartões */
.cardsTitle {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

/* Estilo para o subtítulo dos cartões */
.cardsSubtitle {
  font-size: 16px;
  color: #455a64;
}

/* Estilo para os campos de entrada de texto */
.text-field {
  margin-bottom: 16px;
}

/* Estilo para os botões */
.btn-done {
  border-radius: 10px;
}

/* Right side scroll bar */
/* width */
.right-view::-webkit-scrollbar {
  width: 9px;
}
/* Track */
.right-view::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.right-view::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}
/* Handle on hover */
.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
.cards {
  border-radius: 20px;
}
.cardsTitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardsSubtitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
.disabled-group {
  pointer-events: none;
  background-color: grey;
}

body {
  overflow-y: 100vh; /* Adiciona uma barra de rolagem vertical quando necessário */
}
.background {
  background: linear-gradient(134.16deg, #ffab25 -13.6%, #dd8800 117.67%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.backgroundTest {
  background-color: #e8eaf2;
  height: 94%;
  overflow: scroll;
}
.background:before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(../../assets/BackgroundTestView.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right 0px top -20px;
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}
.description {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}
.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
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
.btn-fix:focus::before {
  opacity: 0 !important;
}
.titleText {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-left: 15px;
  padding: 10px;
  padding-left: 0px;
  padding-top: 0px;
  /*
  height: 2.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; */
}
/* Right side scroll bar */
/* width */
.right-view::-webkit-scrollbar {
  width: 9px;
}
/* Track */
.right-view::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.right-view::-webkit-scrollbar-thumb {
  background: #ffcd8600;
  border-radius: 2px;
}
/* Handle on hover */
.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca32600;
}
/* Nav bar list scroll bar */
/* width */
.nav-list::-webkit-scrollbar {
  width: 7px;
}
/* Track */
.nav-list::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.nav-list::-webkit-scrollbar-thumb {
  background: #777596;
  border-radius: 4px;
}
/* Handle on hover */
.nav-list::-webkit-scrollbar-thumb:hover {
  background: #64618a;
  /* background: #515069; */
}
.card-title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 48px;
  line-height: 56px;
  margin-left: 12px;
  margin-bottom: 20px;
}
.dot-flashing {
  position: relative;
  width: 15px;
  height: 15px;
  border-radius: 10px;
  background-color: #fca326;
  color: #fca326;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}

.dot-flashing::before,
.dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
}

.dot-flashing::before {
  left: -25px;
  width: 15px;
  height: 15px;
  border-radius: 10px;
  background-color: #fca326;
  color: #fca326;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}

.dot-flashing::after {
  left: 25px;
  width: 15px;
  height: 15px;
  border-radius: 10px;
  background-color: #fca326;
  color: #fca326;
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: #fca326;
  }
  50%,
  100% {
    background-color: rgba(252, 163, 38, 0.281);
  }
}
</style>
