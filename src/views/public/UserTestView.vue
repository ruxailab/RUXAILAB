<template>
  <div v-if="test">
    <v-overlay v-model="isLoading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Saving...
      </div>
    </v-overlay>
    <Snackbar />

    <!-- Submit Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title>
          {{$t('HeuristicsTestView.messages.submitTest')}}
        </v-card-title>

        <v-card-text class="mt-5">
          {{$t('HeuristicsTestView.messages.submitOnce')}}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialog = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="red white--text ml-1"
            text
            @click="submitAnswer(), (dialog = false)"
          >
            {{ $t('buttons.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :value="fromlink && !noExistUser && !logined"
      width="500"
      persistent
    >
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar class="justify-center" color="orange lighten-4" size="150">
            <v-icon size="120" dark>
              mdi-account
            </v-icon>
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
            <v-icon v-if="fab">
              mdi-close
            </v-icon>
            <v-icon v-else large>
              mdi-hammer-screwdriver
            </v-icon>
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
              :disabled="!currentUserTestAnswer.postTestCompleted"
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
              v-if="item.id == 0"
              :disabled="
                currentUserTestAnswer.consentCompleted &&
                  currentUserTestAnswer.preTestCompleted &&
                  !currentUserTestAnswer.submitted
              "
              :class="{
                'disabled-group':
                  currentUserTestAnswer.consentCompleted &&
                  currentUserTestAnswer.preTestCompleted &&
                  !currentUserTestAnswer.submitted,
              }"
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
                    {{
                      currentUserTestAnswer.consentCompleted &&
                      currentUserTestAnswer.preTestCompleted &&
                      !currentUserTestAnswer.submitted
                        ? 'mdi-lock'
                        : item.icon
                    }}
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
                    :disabled="
                      (currentUserTestAnswer.consentCompleted &&
                        i == 0 &&
                        !currentUserTestAnswer.submitted) ||
                        (!currentUserTestAnswer.consentCompleted &&
                          i == 1 &&
                          !currentUserTestAnswer.submitted) ||
                        (currentUserTestAnswer.preTestCompleted &&
                          i == 1 &&
                          !currentUserTestAnswer.submitted)
                    "
                    :class="{
                      'disabled-group':
                        (currentUserTestAnswer.consentCompleted &&
                          i == 0 &&
                          !currentUserTestAnswer.submitted) ||
                        (!currentUserTestAnswer.consentCompleted &&
                          i == 1 &&
                          !currentUserTestAnswer.submitted) ||
                        (currentUserTestAnswer.preTestCompleted &&
                          i == 1 &&
                          !currentUserTestAnswer.submitted),
                    }"
                  >
                    <v-list-item-icon>
                      <v-icon :color="taskIndex == i ? '#ffffff' : '#fca326'">
                        {{
                          (currentUserTestAnswer.consentCompleted &&
                            i == 0 &&
                            !currentUserTestAnswer.submitted) ||
                          (!currentUserTestAnswer.consentCompleted &&
                            i == 1 &&
                            !currentUserTestAnswer.submitted) ||
                          (currentUserTestAnswer.preTestCompleted &&
                            i == 1 &&
                            !currentUserTestAnswer.submitted)
                            ? 'mdi-lock'
                            : task.icon
                        }}
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
              v-if="item.id == 1"
              :disabled="
                (!currentUserTestAnswer.consentCompleted &&
                  !currentUserTestAnswer.submitted) ||
                  (!currentUserTestAnswer.preTestCompleted &&
                    !currentUserTestAnswer.submitted)
              "
              :class="{
                'disabled-group':
                  (!currentUserTestAnswer.consentCompleted &&
                    !currentUserTestAnswer.submitted) ||
                  (!currentUserTestAnswer.preTestCompleted &&
                    !currentUserTestAnswer.submitted) ||
                  (allTasksCompleted && !currentUserTestAnswer.submitted),
              }"
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
                    {{
                      (!currentUserTestAnswer.consentCompleted &&
                        !currentUserTestAnswer.submitted) ||
                      (!currentUserTestAnswer.preTestCompleted &&
                        !currentUserTestAnswer.submitted) ||
                      (allTasksCompleted && !currentUserTestAnswer.submitted)
                        ? 'mdi-lock'
                        : item.icon
                    }}
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
                    @click=";(taskIndex = i), startTimer()"
                    v-on="on"
                    :disabled="
                      isTaskDisabled(i) && !currentUserTestAnswer.submitted
                    "
                    :class="{
                      'disabled-group':
                        isTaskDisabled(i) && !currentUserTestAnswer.submitted,
                    }"
                  >
                    <v-list-item-icon>
                      <v-icon :color="taskIndex == i ? '#ffffff' : '#fca326'">
                        {{
                          isTaskDisabled(i) && !currentUserTestAnswer.submitted
                            ? 'mdi-lock'
                            : items[1].value[i].icon
                        }}
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
              :disabled="!allTasksCompleted && !currentUserTestAnswer.submitted"
              :class="{
                'disabled-group':
                  !allTasksCompleted && !currentUserTestAnswer.submitted,
              }"
            >
              <v-list-item-icon>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{
                    !allTasksCompleted && !currentUserTestAnswer.submitted
                      ? 'mdi-lock'
                      : item.icon
                  }}
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
            <v-icon v-if="mini" color="white">
              mdi-chevron-right
            </v-icon>
            <v-icon v-else color="white">
              mdi-chevron-left
            </v-icon>
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
                  <h1 style="color: #455a64;" class="mt-6">
                    {{ test.testTitle }} -
                    {{ $t('UserTestView.titles.preTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />

            <v-row>
              <v-col cols="5" class="mx-auto py-0">
                <v-checkbox
                  v-model="currentUserTestAnswer.consentCompleted"
                  :label="currentUserTestAnswer.consent"
                  :disabled="currentUserTestAnswer.consentCompleted"
                  @click="completeStep(taskIndex, 'consent'), (taskIndex = 1)"
                />
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
                  <h1 style="color: #455a64;" class="mt-6">
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
                <span class="cardsTitle">{{ item.title }}</span>
                <br />
                <span class="cardsSubtitle" v-if="item.description">{{
                  item.description
                }}</span>
                <v-text-field
                  v-if="item.textField"
                  v-model="currentUserTestAnswer.preTestAnswer[index].answer"
                  :disabled="currentUserTestAnswer.preTestCompleted"
                  :placeholder="item.title"
                  outlined
                />
                <v-radio-group
                  v-if="item.selectionField"
                  v-model="currentUserTestAnswer.preTestAnswer[index].answer"
                  :disabled="currentUserTestAnswer.preTestCompleted"
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
                    />
                  </v-row>
                  <v-row justify="end" />
                </v-radio-group>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col class="mx-10">
                <v-btn
                  block
                  :dark="!currentUserTestAnswer.preTestCompleted"
                  color="orange lighten-1"
                  :disabled="currentUserTestAnswer.preTestCompleted"
                  @click="
                    completeStep(taskIndex, 'preTest'),
                      (index = 1),
                      (taskIndex = 0)
                  "
                  >{{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </v-col>
            </v-row>
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
                <v-col cols="12" class="mb-0 pb-0">
                  <v-row justify="center">
                    <h1 style="color: #455a64;" class="mt-2">
                      {{ test.testStructure.userTasks[taskIndex].taskName }}
                    </h1>
                  </v-row>
                  <v-spacer />
                  <v-row justify="center">
                    <p class="paragraph" style="color: #455a64;">
                      {{
                        test.testStructure.userTasks[taskIndex].taskDescription
                      }}
                    </p>
                  </v-row>
                  <div v-if="!currentUserTestAnswer.submitted">
                    <v-row>
                      <v-col
                        cols="1"
                        v-if="
                          test.testStructure.userTasks[taskIndex].taskTip !==
                            null
                        "
                        justify="end"
                      >
                        <TipButton
                          :task="test.testStructure.userTasks[taskIndex]"
                        />
                      </v-col>
                     
                      <v-col
                        cols="1"
                        v-if="
                          test.testStructure.userTasks[taskIndex]
                            .hasAudioRecord !== false
                        "
                      >
                        <AudioRecorder
                          @showLoading="isLoading = true"
                          @stopShowLoading="isLoading = false"
                          @recordingStarted="isVisualizerVisible = $event"
                          :testId="testId"
                          :taskIndex="taskIndex"
                        ></AudioRecorder>
                      </v-col>

                      <v-col cols="1" v-if="isVisualizerVisible"  >
                       <AudioVisualizer/>
                      </v-col>
                      <v-col
                        cols="1"
                        v-if="
                          test.testStructure.userTasks[taskIndex]
                            .hasCamRecord !== false
                        "
                      >
                        <VideoRecorder
                          ref="videoRecorder"
                          @showLoading="isLoading = true"
                          @stopShowLoading="isLoading = false"
                          :testId="testId"
                          :taskIndex="taskIndex"
                        ></VideoRecorder>
                      </v-col>
                      <v-col
                        cols="1"
                        v-if<template>
  <div v-if="test">
    <v-overlay v-model="isLoading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Saving...
      </div>
    </v-overlay>
    <Snackbar />

    <!-- Submit Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title>
          {{$t('HeuristicsTestView.messages.submitTest')}}
        </v-card-title>

        <v-card-text class="mt-5">
          {{$t('HeuristicsTestView.messages.submitOnce')}}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialog = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="red white--text ml-1"
            text
            @click="submitAnswer(), (dialog = false)"
          >
            {{ $t('buttons.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Start Screen -->
    <v-row
      v-if="test && !started"
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
        <v-row justify="center">
          <v-btn color="white" outlined rounded @click="startTest()">
            Start Test
          </v-btn>
        </v-row>
      </v-col>
    </v-row>

    <!-- Test Sections -->
    <div v-else>
      <!-- Pre-Test Section -->
      <div v-if="currentSection === 'preTest'">
        <v-row class="fill-height" align="center" justify="center">
          <v-col cols="12">
            <v-row justify="center">
              <h1 style="color: #455a64;" class="mt-6">
                {{ test.testTitle }} - Pre-Test
              </h1>
            </v-row>
          </v-col>
        </v-row>
        
        <v-divider class="my-8" />

        <v-row>
          <v-col cols="5" class="mx-auto py-0">
            <v-checkbox
              v-model="currentUserTestAnswer.consentCompleted"
              label="I agree to participate in this test"
              @change="handleConsentComplete"
            />
          </v-col>
        </v-row>

        <v-row v-if="currentUserTestAnswer.consentCompleted">
          <v-col cols="5" class="mx-auto py-0">
            <span class="cardsTitle">Pre-Test Questions</span>
            <!-- Add your pre-test questions here -->
            <v-btn 
              color="orange lighten-1"
              @click="completePreTest"
            >
              Complete Pre-Test
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Tasks Section -->
      <div v-else-if="currentSection === 'tasks'">
        <h2>Task {{ currentTaskIndex + 1 }} of {{ test.testStructure.userTasks.length }}</h2>
        <p>{{ test.testStructure.userTasks[currentTaskIndex].taskDescription }}</p>
        
        <v-textarea
          v-model="currentUserTestAnswer.tasks[currentTaskIndex].taskAnswer"
          outlined
          label="Your answer"
        />

        <v-btn 
          color="orange lighten-1"
          @click="completeCurrentTask"
        >
          {{ isLastTask ? 'Complete All Tasks' : 'Next Task' }}
        </v-btn>
      </div>

      <!-- Post-Test Section -->
      <div v-else-if="currentSection === 'postTest'">
        <h2>Post-Test Questions</h2>
        <!-- Add your post-test questions here -->
        <v-btn 
          color="orange lighten-1"
          @click="completePostTest"
        >
          Complete Post-Test
        </v-btn>
      </div>

      <!-- Completion Screen -->
      <div v-else-if="currentSection === 'complete'">
        <v-row justify="center" class="ma-4">
          <v-col cols="11" class="mt-3">
            <span class="cardsTitle">Test Completed!</span>
            <v-row justify="center" class="mt-3">
              <v-col cols="4">
                <img
                  draggable="false"
                  src="../../../public/finalMessage.svg"
                  alt="Final test svg"
                />
              </v-col>
              <v-col cols="4" class="pt-2 my-8">
                <v-btn
                  @click="dialog = true"
                  color="orange"
                  depressed
                  dark
                >
                  <v-icon class="ma-2">mdi-send</v-icon>Submit Test
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'

export default {
  components: {
    Snackbar
  },
  data() {
    return {
      isLoading: false,
      dialog: false,
      started: false,
      currentSection: null,
      currentTaskIndex: 0,
      currentUserTestAnswer: {
        consentCompleted: false,
        preTestCompleted: false,
        postTestCompleted: false,
        submitted: false,
        tasks: []
      }
    }
  },
  computed: {
    test() {
      return this.$store.getters.test
    },
    isLastTask() {
      return this.currentTaskIndex === this.test.testStructure.userTasks.length - 1
    }
  },
  methods: {
    startTest() {
      if (!this.test.testStructure?.userTasks?.length) {
        this.$toast.error("This test doesn't have any tasks")
        return
      }

      // Initialize task structure
      this.currentUserTestAnswer.tasks = this.test.testStructure.userTasks.map(() => ({
        completed: false,
        taskAnswer: '',
        taskObservations: ''
      }))

      this.started = true
      this.currentSection = 'preTest'
    },
    handleConsentComplete() {
      if (this.currentUserTestAnswer.consentCompleted) {
        // You could auto-advance or let user click a button
      }
    },
    completePreTest() {
      this.currentUserTestAnswer.preTestCompleted = true
      this.currentSection = 'tasks'
      this.currentTaskIndex = 0
    },
    completeCurrentTask() {
      // Mark current task as completed
      this.currentUserTestAnswer.tasks[this.currentTaskIndex].completed = true

      if (this.isLastTask) {
        this.currentSection = 'postTest'
      } else {
        this.currentTaskIndex++
      }
    },
    completePostTest() {
      this.currentUserTestAnswer.postTestCompleted = true
      this.currentSection = 'complete'
    },
    async saveAnswer() {
      this.isLoading = true
      try {
        await this.$store.dispatch('saveTestAnswer', {
          data: this.currentUserTestAnswer,
          answerDocId: this.test.answersDocId,
          testType: this.test.testType
        })
        this.$toast.success('Progress saved!')
      } catch (error) {
        this.$toast.error('Failed to save progress')
      } finally {
        this.isLoading = false
      }
    },
    async submitAnswer() {
      this.isLoading = true
      try {
        this.currentUserTestAnswer.submitted = true
        await this.saveAnswer()
        this.$toast.success('Test submitted successfully!')
        this.$router.push('/testslist')
      } catch (error) {
        this.$toast.error('Failed to submit test')
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.background {
  background: linear-gradient(134.16deg, #ffab25 -13.6%, #dd8800 117.67%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.description {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}

.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
</style>
