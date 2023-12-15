<template>
  <div v-if="test">
    <Snackbar />

    <!-- Submit Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title>
          Are you sure you want to submit this test?
        </v-card-title>

        <v-card-text>
          Are you sure you want to submit your test. You can only do it once.
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            class="red white--text ml-1"
            text
            @click="submitAnswer(), (dialog = false)"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

    <v-row v-else class="nav pa-0 ma-0" dense>
      <v-speed-dial
        v-if="showSaveBtn"
        v-model="fab"
        fixed
        class="mr-3"
        bottom
        right
        open-on-hover
      >
        <template v-slot:activator>
          <v-btn v-model="fab" large color="#F9A826" dark fab class="btn-fix">
            <v-icon v-if="fab"> mdi-close </v-icon>
            <v-icon v-else large> mdi-hammer-screwdriver </v-icon>
          </v-btn>
        </template>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              dark
              small
              color="#F9A826"
              v-bind="attrs"
              @click="saveAnswer()"
              v-on="on"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>

        <v-tooltip v-if="currentUserTestAnswer" left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="white--text"
              fab
              small
              color="#F9A826"
              v-bind="attrs"
              @click="dialog = true"
              v-on="on"
            >
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>

        <v-tooltip v-else left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="white--text"
              fab
              small
              color="#F9A826"
              v-bind="attrs"
              @click="dialog = true"
              v-on="on"
            >
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>

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
            <v-list-group
              :disabled="
                currentUserTestAnswer.consentCompleted &&
                currentUserTestAnswer.preTestCompleted
              "
              :class="{
                'disabled-group':
                  currentUserTestAnswer.consentCompleted &&
                  currentUserTestAnswer.preTestCompleted,
              }"
              v-if="item.id == 0"
              :value="index == 0 ? true : false"
              no-action
              @click="index = item.id"
            >
              <v-icon
                slot="appendIcon"
                :color="index == item.id ? '#ffffff' : '#fca326'"
              >
                mdi-chevron-down
              </v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                    {{ item.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  :style="index == item.id ? 'color: white' : 'color:#fca326'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" right>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item
                    link
                    v-bind="attrs"
                    @click="taskIndex = i"
                    v-on="on"
                    :disabled="
                      (currentUserTestAnswer.consentCompleted && i == 0) ||
                      (!currentUserTestAnswer.consentCompleted && i == 1) ||
                      (currentUserTestAnswer.preTestCompleted && i == 1)
                    "
                  >
                    <v-list-item-icon>
                      <v-icon :color="taskIndex == i ? '#ffffff' : '#fca326'">
                        {{ task.icon }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        :style="
                          taskIndex == i ? 'color: white' : 'color:#fca326'
                        "
                      >
                        {{ task.title }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>
            <!--Tasks--->
            <v-list-group
              :disabled="
                !currentUserTestAnswer.consentCompleted ||
                !currentUserTestAnswer.preTestCompleted
              "
              :class="{
                'disabled-group':
                  !currentUserTestAnswer.consentCompleted ||
                  !currentUserTestAnswer.preTestCompleted,
              }"
              v-if="item.id == 1"
              :value="index == 1 ? true : false"
              no-action
              @click="index = item.id"
            >
              <v-icon
                slot="appendIcon"
                :color="index == item.id ? '#ffffff' : '#fca326'"
              >
                mdi-chevron-down
              </v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                    {{ item.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-title
                  :style="index == item.id ? 'color: white' : 'color:#fca326'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" right>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item
                    link
                    v-bind="attrs"
                    @click="taskIndex = i"
                    v-on="on"
                    :disabled="isTaskDisabled(i)"
                    :class="{
                      'disabled-group': isTaskDisabled(i),
                    }"
                  >
                    <v-list-item-icon>
                      <v-icon :color="taskIndex == i ? '#ffffff' : '#fca326'">
                        {{ items[1].value[i].icon }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        :style="
                          taskIndex == i ? 'color: white' : 'color:#fca326'
                        "
                      >
                        {{ task.title }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>
            <!--Post Test-->
            <v-list-item
              v-else-if="item.id == 2"
              @click="index = item.id"
              :disabled="!allTasksCompleted"
              :class="{
                'disabled-group': !allTasksCompleted,
              }"
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

      <v-col ref="rightView" class="backgroundTest pa-0 ma-0 right-view">
        <!-- Consent - Pre Test -->

        <ShowInfo
          v-if="index === 0 && taskIndex === 0"
         :title="$t('UserTestView.titles.preTestConsent')"
        >
          <div slot="content" class="ma-0 pa-0">
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 class="mt-6">
                    {{ test.testTitle }} -
                    {{ $t('UserTestTable.titles.consentForm') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />

            <v-row>
              <v-col cols="5" class="mx-auto py-0">
                <v-checkbox
                  :label="currentUserTestAnswer.consent"
                  v-model="currentUserTestAnswer.consentCompleted"
                  :disabled="currentUserTestAnswer.consentCompleted"
                  @click="completeStep(taskIndex, 'consent'), (taskIndex = 1)"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </div>
        </ShowInfo>

        <!-- Form - Pre Test -->
        <ShowInfo
          v-if="index == 0 && taskIndex == 1"
          :title="$t('UserTestView.titles.preTestForm')"
        >
          <div slot="content" class="ma-0 pa-0">
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 class="mt-6">
                    {{ test.testTitle }} -
                    {{ $t('UserTestView.titles.preTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />

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
                    v-for="(selection, selectionIndex) in item.selectionFields"
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
            <v-col cols="12">
              <v-row justify="center">
                <v-btn
                  block
                  color="orange lighten-1"
                  class="ma-5"
                  :disabled="currentUserTestAnswer.preTestCompleted"
                  @click="
                    completeStep(taskIndex, 'preTest'),
                      (index = 1),
                      (taskIndex = 0)
                  "
                  >{{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </v-row>
            </v-col>
          </div>
        </ShowInfo>
        <!-- Tasks -->
        <ShowInfo
          v-if="index == 1 && test.testType === 'User'"
          :title="test.testStructure.userTasks[taskIndex].taskName"
        >
          <div slot="content" class="ma-0 pa-0">
            <v-divider class="mb-5" />
            <v-container>
              <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12">
                  <v-row justify="center">
                    <h1>
                      {{ test.testStructure.userTasks[taskIndex].taskName }}
                    </h1>
                  </v-row>
                  <v-spacer />
                  <v-row justify="center">
                    <p class="paragraph">
                      {{
                        test.testStructure.userTasks[taskIndex].taskDescription
                      }}
                    </p>
                  </v-row>
                  <v-row
                    v-if="
                      test.testStructure.userTasks[taskIndex].hasAudioRecord !==
                      false
                    "
                  >
                    <audio-recorder
                      :testId="testId"
                      :currentUserTestAnswer="currentUserTestAnswer"
                      :taskIndex="taskIndex"
                    ></audio-recorder>
                  </v-row>
                  <v-row
                    v-if="
                      test.testStructure.userTasks[taskIndex].hasCamRecord !==
                      false
                    "
                  >
                    <video-recorder
                      :testId="testId"
                      :currentUserTestAnswer="currentUserTestAnswer"
                      :taskIndex="taskIndex"
                    ></video-recorder>
                  </v-row>
                  <v-row
                    v-if="
                      test.testStructure.userTasks[taskIndex].hasScreenRecord !=
                      false
                    "
                  >
                    <screen-recorder
                      :testId="testId"
                      :currentUserTestAnswer="currentUserTestAnswer"
                      :taskIndex="taskIndex"
                    ></screen-recorder>
                  </v-row>
                  <v-spacer />
                  <v-row
                    v-if="
                      test.testStructure.userTasks[taskIndex].taskTip !== null
                    "
                    justify="end"
                  >
                    <TipButton
                      :task="test.testStructure.userTasks[taskIndex]"
                    />
                  </v-row>
                  <v-spacer />
                  <v-row
                    justify="center"
                    v-if="
                      test.testStructure.userTasks[taskIndex].hasTimer === true
                    "
                  >
                    <Timer
                      :taskIndex="taskIndex"
                      @timerStopped="handleTimerStopped"
                    />
                  </v-row>
                  <v-spacer />
                  <v-row class="paragraph" justify="space-around">
                    <v-col
                      v-if="
                        test.testStructure.userTasks[taskIndex].taskType ===
                        'textArea'
                      "
                    >
                      <v-textarea
                        :id="
                          'id-' +
                          test.testStructure.userTasks[taskIndex].taskName
                        "
                        v-model="
                          currentUserTestAnswer.tasks[taskIndex].taskAnswer
                        "
                        outlined
                        label="answer"
                      />
                    </v-col>
                    <v-col>
                      <v-textarea
                        :id="
                          'id-' +
                          test.testStructure.userTasks[taskIndex].taskName
                        "
                        v-model="
                          currentUserTestAnswer.tasks[taskIndex]
                            .taskObservations
                        "
                        outlined
                        label="observation (optional)"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row
                v-if="test.testStructure.userTasks[taskIndex].hasPost"
                class="fill-height"
                align="center"
                justify="center"
              >
                <v-col class="text-center">
                  <p class="text-h5">
                    {{ test.testStructure.userTasks[taskIndex].hasPost }}
                  </p>

                  <v-text-field
                    class="mx-2"
                    v-model="currentUserTestAnswer.tasks[taskIndex].postAnswer"
                    :placeholder="
                      test.testStructure.userTasks[taskIndex].hasPost
                    "
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <video
                v-if="videoUrl == ''"
                id="vpreview"
                class="preview"
                style="max-width: 0px"
                autoplay
              ></video>
              <div class="pa-2 text-end">
                <v-btn
                  block
                  color="orange lighten-1"
                  @click="completeStep(taskIndex, 'tasks')"
                >
                  {{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </div>
            </v-container>
          </div>
        </ShowInfo>

        <!-- Post Test -->
        <ShowInfo v-if="index == 2" title="Post Test">
          <div slot="content" class="ma-0 pa-0">
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 class="mt-6">{{ test.testTitle }} - {{ $t('UserTestTable.titles.postTest') }}</h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />

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
                    v-for="(selection, selectionIndex) in item.selectionFields"
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
            <v-col cols="12">
              <v-row justify="center">
                <v-btn
                  block
                  color="orange lighten-1"
                  class="ma-5"
                  :disabled="currentUserTestAnswer.postTestCompleted"
                  @click="completeStep(taskIndex, 'postTest'), (taskIndex = 3)"
                >
                  {{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </v-row>
            </v-col>
          </div>
        </ShowInfo>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import VClamp from 'vue-clamp'
import Snackbar from '@/components/atoms/Snackbar'
import CardSignIn from '@/components/atoms/CardSignIn'
import CardSignUp from '@/components/atoms/CardSignUp'
import TipButton from '@/components/atoms/TipButton'
import Timer from '@/components/atoms/Timer'
import AudioRecorder from '@/components/atoms/AudioRecorder'
import VideoRecorder from '@/components/atoms/VideoRecorder.vue'
import ScreenRecorder from '@/components/atoms/ScreenRecorder.vue'

export default {
  components: {
    VideoRecorder,
    ShowInfo,
    VClamp,
    Snackbar,
    CardSignIn,
    CardSignUp,
    TipButton,
    Timer,
    AudioRecorder,
    ScreenRecorder,
  },
  data: () => ({
    displayMediaOptions: {
      video: {
        displaySurface: 'window',
        cursor: 'always',
      },
      audio: true,
    },
    isCapture: false,
    mediaRecorder: [],
    chunks: [],
    isRecording: false,
    videoUrl: '',
    isCapture: false,
    logined: null,
    selected: true,
    fromlink: null,
    drawer: true,
    start: true,
    mini: false,
    index: null,
    noExistUser: true,
    taskIndex: 0,
    preTestIndex: null,
    items: [],
    taskAnswers: {},
    fab: false,
    res: 0,
    dialog: false,
    videoStream: null,
    mediaRecorder: null,
    recordedChunks: [],
    recording: false,
    allTasksCompleted: false,
    recordedVideo: '',
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
    showSaveBtn() {
      if (this.currentUserTestAnswer.submitted) return false
      return true
    },
    cooperators() {
      return this.$store.getters.cooperators
    },
    loading() {
      return this.$store.getters.loading
    },
    currentImageUrl() {
      return this.$store.state.Tests.currentImageUrl
    },
    tasks() {
      return this.$store.getters.tasks
    },
  },
  watch: {
    test: async function () {
      this.mappingSteps()
    },
    items() {
      if (this.items.length) {
        this.index = this.items[0].id
        if (this.items.find((obj) => obj.id == 0)) {
          //se tiver preTest mexe no preTestIndex
          this.preTestIndex = this.items[0].value[0].id
        }
      }
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
    await this.mappingSteps()
  },
  async mounted() {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    this.autoComplete()
    this.calculateProgress()
  },
  methods: {
    isTaskDisabled(taskIndex) {
      for (let i = 0; i < taskIndex; i++) {
        if (!this.currentUserTestAnswer.tasks[i].completed) {
          return true
        }
      }
      return false
    },
    async saveAnswer() {
      await this.$store.dispatch('saveTestAnswer', {
        data: this.currentUserTestAnswer,
        answerDocId: this.test.answersDocId,
        testType: this.test.testType,
      })
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
    handleTimerStopped(elapsedTime, taskIndex) {
      this.currentUserTestAnswer.tasks[taskIndex].taskTime = elapsedTime
    },
    completeStep(id, type) {
      if (type === 'tasks') {
        this.currentUserTestAnswer.tasks[id].completed = true
        this.items[1].value[id].icon = 'mdi-check-circle-outline'
        this.allTasksCompleted = true
        this.$forceUpdate()

        for (let i = 0; i < this.items[1].value.length; i++) {
          if (!this.currentUserTestAnswer.tasks[i].completed) {
            this.allTasksCompleted = false
            break
          }
        }
        if (this.allTasksCompleted) {
          this.items[1].icon = 'mdi-check-circle-outline'
        }
      }
      if (type === 'postTest') {
        this.currentUserTestAnswer.postTestCompleted = true
        this.items[2].icon = 'mdi-check-circle-outline'
      }
      if (type === 'preTest') {
        this.currentUserTestAnswer.preTestCompleted = true
        this.items[0].value[id].icon = 'mdi-check-circle-outline'
        if (
          this.currentUserTestAnswer.preTestCompleted &&
          this.currentUserTestAnswer.consentCompleted
        ) {
          this.items[0].icon = 'mdi-check-circle-outline'
        }
      }
      if (type === 'consent') {
        this.currentUserTestAnswer.consentCompleted = true
        this.items[0].value[id].icon = 'mdi-check-circle-outline'
        if (
          this.currentUserTestAnswer.preTestCompleted &&
          this.currentUserTestAnswer.consentCompleted
        ) {
          this.items[0].icon = 'mdi-check-circle-outline'
        }
      }
      this.calculateProgress()
    },

    async autoComplete() {
      // PRE-TEST
      if (this.currentUserTestAnswer.preTestCompleted) {
        this.items[0].value[1].icon = 'mdi-check-circle-outline'
      }
      if (this.currentUserTestAnswer.consentCompleted) {
        this.items[0].value[0].icon = 'mdi-check-circle-outline'
      }
      if (
        this.currentUserTestAnswer.preTestCompleted &&
        this.currentUserTestAnswer.consentCompleted
      ) {
        this.items[0].icon = 'mdi-check-circle-outline'
      }
      // TASKS
      let allTasksCompleted = true
      for (let i = 0; i < this.items[1].value.length; i++) {
        if (this.currentUserTestAnswer.tasks[i].completed) {
          this.items[1].value[i].icon = 'mdi-check-circle-outline'
        }
        if (!this.currentUserTestAnswer.tasks[i].completed) {
          allTasksCompleted = false
          break
        }
      }
      if (allTasksCompleted) {
        this.items[1].icon = 'mdi-check-circle-outline'
      }
      // POST-TEST
      if (this.currentUserTestAnswer.postTestCompleted) {
        this.items[2].icon = 'mdi-check-circle-outline'
      }
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

      let tasksCompleted = 0
      for (let i = 0; i < this.items[1].value.length; i++) {
        if (this.currentUserTestAnswer.tasks[i].completed) {
          tasksCompleted++
        }
      }

      if (tasksCompleted === this.items[1].value.length) {
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
    async mappingSteps() {
      //PreTest
      if (this.validate(this.test.testStructure.preTest)) {
        this.items.push({
          title: 'Pre-test',
          icon: 'mdi-checkbox-blank-circle-outline',
          value: [
            {
              title: 'Consent',
              icon: 'mdi-checkbox-blank-circle-outline',
              id: 0,
            },
          ],
          id: 0,
        })
      }

      if (this.validate(this.test.testStructure.preTest)) {
        if (this.items.length) {
          this.items[0].value.push({
            title: 'Form',
            icon: 'mdi-checkbox-blank-circle-outline',
            id: 0,
          })
        } else {
          this.items.push({
            title: 'Pre Test',
            icon: 'mdi-checkbox-blank-circle-outline',
            value: [
              {
                title: 'Form',
                icon: 'mdi-checkbox-blank-circle-outline',
                id: 0,
              },
            ],
            id: 0,
          })
        }
      }

      //Tasks
      if (this.validate(this.test.testStructure.userTasks))
        this.items.push({
          title: 'Tasks',
          icon: 'mdi-checkbox-blank-circle-outline',
          value: this.test.testStructure.userTasks.map((i) => {
            return {
              title: i.taskName,
              icon: 'mdi-checkbox-blank-circle-outline',
              id: 2,
            }
          }),
          id: 1,
        })

      //PostTest
      if (this.validate(this.test.testStructure.postTest))
        this.items.push({
          title: 'Post Test',
          icon: 'mdi-checkbox-blank-circle-outline',
          value: this.test.testStructure.postTest,
          id: 2,
        })
    },
    validate(object) {
      return object !== null && object !== undefined && object !== ''
    },
  },
  beforeDestroy() {
    this.stopRecording()
  },
}
</script>

<style scoped>
.disabled-group {
  pointer-events: none;
  background-color: grey;
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
  background: #ffcd86;
  border-radius: 2px;
}
/* Handle on hover */
.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca326;
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
</style>
