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
          {{ $t('HeuristicsTestView.messages.submitTest') }}
        </v-card-title>

        <v-card-text class="mt-5">
          {{ $t('HeuristicsTestView.messages.submitOnce') }}
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn class="grey lighten-3" text @click="dialog = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn class="red white--text ml-1" text @click="submitAnswer(), (dialog = false)">
            {{ $t('buttons.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :value="fromlink && !noExistUser && !logined" width="500" persistent>
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
    <v-row v-if="test && start" class="background background-img pa-0 ma-0" align="center">
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
      <v-speed-dial v-if="showSaveBtn" v-model="fab" fixed class="mr-3" bottom right open-on-hover>
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
            <v-btn fab dark small color="#F9A826" v-bind="attrs" @click="saveAnswer()" v-on="on">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn :disabled="!localTestAnswer.postTestCompleted" class="white--text" fab small color="#F9A826"
              v-bind="attrs" @click="dialog = true" v-on="on">
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>

      <v-navigation-drawer v-model="drawer" clipped :mini-variant="mini" permanent color="#3F3D56">
        <div v-if="!mini" class="header">
          <v-list-item>
            <v-row dense align="center" justify="space-around">
              <v-col class="pa-0 ma-0" cols="8">
                <v-clamp class="titleText" autoresize :max-lines="2">
                  {{ test.testTitle }}
                </v-clamp>
              </v-col>
              <v-col>
                <v-progress-circular rotate="-90" :value="calculateProgress()" color="#fca326" :size="50" class="mt-2">
                  {{ calculateProgress() }}%
                </v-progress-circular>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list class="nav-list" flat dense max-height="85%"
          style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px">
          <div v-for="(item, n) in items" :key="n">
            <!--Pre Test-->
            <v-list-group v-if="item.id == 0" :disabled="localTestAnswer.consentCompleted &&
              localTestAnswer.preTestCompleted &&
              !localTestAnswer.submitted
              " :class="{
                'disabled-group':
                  localTestAnswer.consentCompleted &&
                  localTestAnswer.preTestCompleted &&
                  !localTestAnswer.submitted,
              }" :value="index == 0 ? true : false" no-action @click="index = item.id">
              <v-icon slot="appendIcon" :color="index == item.id ? '#ffffff' : '#fca326'">
                mdi-chevron-down
              </v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                    {{
                      localTestAnswer.consentCompleted &&
                        localTestAnswer.preTestCompleted &&
                        !localTestAnswer.submitted
                        ? 'mdi-lock'
                        : item.icon
                    }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-title :style="index == item.id ? 'color: white' : 'color:#fca326'">
                  {{ item.title }}
                </v-list-item-title>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" right>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item link v-bind="attrs" :disabled="(localTestAnswer.consentCompleted &&
                    i == 0 &&
                    !localTestAnswer.submitted) ||
                    (!localTestAnswer.consentCompleted &&
                      i == 1 &&
                      !localTestAnswer.submitted) ||
                    (localTestAnswer.preTestCompleted &&
                      i == 1 &&
                      !localTestAnswer.submitted)
                    " :class="{
                      'disabled-group':
                        (localTestAnswer.consentCompleted &&
                          i == 0 &&
                          !localTestAnswer.submitted) ||
                        (!localTestAnswer.consentCompleted &&
                          i == 1 &&
                          !localTestAnswer.submitted) ||
                        (localTestAnswer.preTestCompleted &&
                          i == 1 &&
                          !localTestAnswer.submitted),
                    }" @click="taskIndex = i">
                    <v-list-item-icon>
                      <v-icon :color="taskIndex == i ? '#ffffff' : '#fca326'">
                        {{
                          (localTestAnswer.consentCompleted &&
                            i == 0 &&
                            !localTestAnswer.submitted) ||
                            (!localTestAnswer.consentCompleted &&
                              i == 1 &&
                              !localTestAnswer.submitted) ||
                            (localTestAnswer.preTestCompleted &&
                              i == 1 &&
                              !localTestAnswer.submitted)
                            ? 'mdi-lock'
                            : task.icon
                        }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title :style="taskIndex == i ? 'color: white' : 'color:#fca326'">
                        {{ task.title }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>
            <!--Tasks--->
            <v-list-group v-if="item.id == 1" :disabled="(!localTestAnswer.consentCompleted &&
              !localTestAnswer.submitted) ||
              (!localTestAnswer.preTestCompleted &&
                !localTestAnswer.submitted)
              " :class="{
                'disabled-group':
                  (!localTestAnswer.consentCompleted &&
                    !localTestAnswer.submitted) ||
                  (!localTestAnswer.preTestCompleted &&
                    !localTestAnswer.submitted) ||
                  (allTasksCompleted && !localTestAnswer.submitted),
              }" :value="index == 1 ? true : false" no-action @click="index = item.id">
              <v-icon slot="appendIcon" :color="index == item.id ? '#ffffff' : '#fca326'">
                mdi-chevron-down
              </v-icon>
              <template v-slot:activator>
                <v-list-item-icon>
                  <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                    {{
                      (!localTestAnswer.consentCompleted &&
                        !localTestAnswer.submitted) ||
                        (!localTestAnswer.preTestCompleted &&
                          !localTestAnswer.submitted) ||
                        (allTasksCompleted && !localTestAnswer.submitted)
                        ? 'mdi-lock'
                        : item.icon
                    }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-title :style="index == item.id ? 'color: white' : 'color:#fca326'">
                  {{ item.title }}
                </v-list-item-title>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" right>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item link v-bind="attrs" @click="; (taskIndex = i), startTimer()" v-on="on" :disabled="isTaskDisabled(i) && !localTestAnswer.submitted
                    " :class="{
                      'disabled-group':
                        isTaskDisabled(i) && !localTestAnswer.submitted,
                    }">
                    <v-list-item-icon>
                      <v-icon :color="taskIndex == i ? '#ffffff' : '#fca326'">
                        {{
                          isTaskDisabled(i) && !localTestAnswer.submitted
                            ? 'mdi-lock'
                            : items[1].value[i].icon
                        }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title :style="taskIndex == i ? 'color: white' : 'color:#fca326'">
                        {{ task.title }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>
            <!--Post Test-->
            <v-list-item v-else-if="item.id == 2" @click="index = item.id"
              :disabled="!allTasksCompleted && !localTestAnswer.submitted" :class="{
                'disabled-group':
                  !allTasksCompleted && !localTestAnswer.submitted,
              }">
              <v-list-item-icon>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{
                    !allTasksCompleted && !localTestAnswer.submitted
                      ? 'mdi-lock'
                      : item.icon
                  }}
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title :style="index == item.id ? 'color: white' : 'color:#fca326'">
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
        <ShowInfo v-if="index === 0 && taskIndex === 0" :title="$t('UserTestView.titles.preTestConsent')">
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
              <v-col cols="8" class="mx-auto py-0">
                <div v-html="test.testStructure.consent" class="rich-text mb-6" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6" class="mx-auto">
                <!-- Full Name Input -->
                <v-text-field v-model="fullName" label="Full Name" outlined dense
                  :rules="[v => !!v || 'Name is required']" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6" class="mx-auto">
                <!-- Accept / Decline Checkboxes in a Group -->
                <v-radio-group v-model="localTestAnswer.consentCompleted">
                  <v-radio :label="'I accept the consent terms'" :disabled="fullName == ''" :value="true" />
                  <v-radio :label="'I do not accept the consent terms'" :value="false" />
                </v-radio-group>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6" class="mx-auto text-center">
                <v-btn color="primary" :disabled="!localTestAnswer.consentCompleted || fullName == ''"
                  @click="completeStep(taskIndex, 'consent'), (taskIndex = 1)">
                  Continue
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </ShowInfo>

        <!-- Form - Pre Test -->
        <ShowInfo v-if="index == 0 && taskIndex == 1" :title="$t('UserTestView.titles.preTestForm')">
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

            <v-row v-for="(item, index) in test.testStructure.preTest" :key="index">
              <v-col cols="5" class="mx-auto py-0">
                <span class="cardsTitle">{{ item.title }}</span>
                <br />
                <span class="cardsSubtitle" v-if="item.description">{{ item.description }}</span>
                <v-text-field v-if="item.textField" v-model="localTestAnswer.preTestAnswer[index].answer"
                  :disabled="localTestAnswer.preTestCompleted" :placeholder="item.title" outlined />
                <v-radio-group v-if="item.selectionField" v-model="localTestAnswer.preTestAnswer[index].answer"
                  :disabled="localTestAnswer.preTestCompleted" column>
                  <v-row v-for="(selection, selectionIndex) in item.selectionFields" :key="selectionIndex">
                    <v-radio :disabled="localTestAnswer.preTestCompleted" class="ml-3 mb-1" :label="selection"
                      :value="selection" />
                  </v-row>
                  <v-row justify="end" />
                </v-radio-group>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col class="mx-10">
                <v-btn block :dark="!localTestAnswer.preTestCompleted" color="orange lighten-1"
                  :disabled="localTestAnswer.preTestCompleted" @click="
                    completeStep(taskIndex, 'preTest'),
                    (index = 1),
                    (taskIndex = 0)
                    ">{{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </ShowInfo>
        <!-- Tasks -->
        <ShowInfo v-if="index == 1 && test.testType === 'User'"
          :title="test.testStructure.userTasks[taskIndex].taskName">
          <div slot="content" class="ma-0 pa-0">
            <v-container>
              <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12" class="mb-0 pb-0">
                  <v-spacer />
                  <v-row justify="center">
                    <p class="paragraph mt-5" style="color: #455a64;">
                      {{ test.testStructure.userTasks[taskIndex].taskDescription }}
                    </p>
                  </v-row>
                  <v-row justify="center" v-if="test.testStructure.userTasks[taskIndex].taskLink">
                    <a :href="test.testStructure.userTasks[taskIndex].taskLink" target="_blank"
                      v-if="test.testStructure.userTasks[taskIndex].taskLink">
                      <span style="color: #455a64; cursor: pointer;">{{ test.testStructure.userTasks[taskIndex].taskLink
                      }}</span>
                    </a>
                  </v-row>
                  <div v-if="!localTestAnswer.submitted">
                    <v-row>
                      <v-col cols="1" v-if="test.testStructure.userTasks[taskIndex].taskTip !== null" justify="end">
                        <TipButton :task="test.testStructure.userTasks[taskIndex]" />
                      </v-col>

                      <v-col cols="1" v-if="test.testStructure.userTasks[taskIndex].hasAudioRecord !== false">
                        <AudioRecorder @showLoading="isLoading = true" @stopShowLoading="isLoading = false"
                          @recordingStarted="isVisualizerVisible = $event" :testId="testId" :taskIndex="taskIndex">
                        </AudioRecorder>
                      </v-col>

                      <v-col cols="1" v-if="isVisualizerVisible">
                        <AudioVisualizer />
                      </v-col>
                      <v-col cols="1" v-if="test.testStructure.userTasks[taskIndex].hasCamRecord !== false">
                        <VideoRecorder ref="videoRecorder" @showLoading="isLoading = true"
                          @stopShowLoading="isLoading = false" :testId="testId" :taskIndex="taskIndex"></VideoRecorder>
                      </v-col>
                      <v-col cols="1" v-if="test.testStructure.userTasks[taskIndex].hasScreenRecord !== false">
                        <ScreenRecorder @showLoading="isLoading = true" @stopShowLoading="isLoading = false"
                          :testId="testId" :taskIndex="taskIndex"></ScreenRecorder>
                      </v-col>
                      <v-col cols="4">
                        <Timer ref="timerComponent" :taskIndex="taskIndex" @timerStopped="handleTimerStopped" />
                      </v-col>
                    </v-row>
                  </div>

                  <v-spacer />
                  <v-row class="paragraph" justify="space-around">
                    <v-col class="mb-0 pb-0" v-if="test.testStructure.userTasks[taskIndex].taskType === 'textArea'">
                      <v-textarea :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                        v-model="localTestAnswer.tasks[taskIndex].taskAnswer" outlined label="answer" />
                    </v-col>
                    <v-col class="mb-0 pb-0">
                      <v-textarea :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                        v-model="localTestAnswer.tasks[taskIndex].taskObservations" outlined
                        label="observation (optional)" />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-if="test.testStructure.userTasks[taskIndex].postQuestion" class="fill-height" align="center"
                justify="center">
                <v-col class="text-center">
                  <p class="text-h5">
                    {{ test.testStructure.userTasks[taskIndex].postQuestion }}
                  </p>

                  <v-text-field v-model="localTestAnswer.tasks[taskIndex].postAnswer" class="mx-2"
                    :placeholder="test.testStructure.userTasks[taskIndex].postQuestion" outlined />
                </v-col>
              </v-row>

              <v-row v-if="test.testStructure.userTasks[taskIndex].postForm" class="fill-height" align="center"
                justify="center">
                <v-col cols=12>
                  <p class="text-h5">
                    Post Form
                  </p>
                </v-col>
                <iframe v-if="test.testStructure.userTasks[taskIndex].postForm"
                  :src="test.testStructure.userTasks[taskIndex].postForm" width="100%" height="500" frameborder="0"
                  marginheight="0" marginwidth="0">Loading...</iframe>
              </v-row>

              <video v-if="videoUrl == ''" id="vpreview" class="preview" style="max-width: 0px" autoplay />
              <div class="pa-2 text-end">
                <v-row>
                  <v-col cols="6">
                    <v-btn block dark color="red lighten-1"
                      @click="completeStep(taskIndex, 'tasks', false), callTimerSave()">
                      {{ $t('buttons.couldNotFinish') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn block dark color="orange lighten-1"
                      @click="completeStep(taskIndex, 'tasks', true), callTimerSave()">
                      {{ $t('UserTestView.buttons.done') }}
                    </v-btn>
                  </v-col>
                </v-row>

              </div>
            </v-container>
          </div>
        </ShowInfo>

        <!-- Post Test -->
        <ShowInfo v-if="(index == 2 && !localTestAnswer.postTestCompleted) || (index == 2 && localTestAnswer.submitted)"
          title="Post Test">
          <div slot="content" class="ma-0 pa-0">
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 style="color: #455a64;" class="mt-6">
                    {{ test.testTitle }} -
                    {{ $t('UserTestView.titles.postTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />

            <v-row v-for="(item, index) in test.testStructure.postTest" :key="index">
              <v-col cols="5" class="mx-auto py-0">
                <span class="cardsTitle">{{ item.title }}</span>
                <br />
                <span class="cardsSubtitle" v-if="item.description">{{ item.description }}</span>
                <v-text-field v-if="item.textField" v-model="localTestAnswer.postTestAnswer[index].answer"
                  :disabled="localTestAnswer.postTestCompleted" :placeholder="item.title" outlined />
                <v-radio-group v-if="item.selectionField" v-model="localTestAnswer.postTestAnswer[index].answer"
                  :disabled="localTestAnswer.postTestCompleted" column>
                  <v-row v-for="(selection, selectionIndex) in item.selectionFields" :key="selectionIndex">
                    <v-radio :disabled="localTestAnswer.postTestCompleted" class="ml-3 mb-1" :label="selection"
                      :value="selection" />
                  </v-row>
                  <v-row justify="end" />
                </v-radio-group>
              </v-col>
            </v-row>
            <v-col cols="12">
              <v-row justify="center">
                <v-col class="mx-10">
                  <v-btn block :dark="!localTestAnswer.postTestCompleted" color="orange lighten-1" class="mt-3"
                    :disabled="localTestAnswer.postTestCompleted" @click="
                      completeStep(taskIndex, 'postTest'), (taskIndex = 3)
                      ">
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </div>
        </ShowInfo>
        <ShowInfo v-else-if="index == 2 && localTestAnswer.postTestCompleted" :title="$t('finishTest.title')">
          <div slot="content" class="ma-0 pa-0">
            <v-row justify="center" class="ma-4">
              <v-col cols="11" class="mt-3">
                <span class="cardsTitle">{{ $t('finishTest.finalMessage') }}!</span>
                <br />
                <span class="cardsSubtitle">
                  {{ $t('finishTest.congratulations') }}
                </span>
                <v-row justify="center" class="mt-3">
                  <v-col cols="4">
                    <img draggable="false" src="../../../public/finalMessage.svg" alt="Final test svg" />
                  </v-col>
                  <v-col cols="4" class="pt-2 my-8">
                    <span class="cardsSubtitle">{{ $t('finishTest.submitMessage') }}</span>
                    <v-col class="mt-2">
                      <v-btn @click="dialog = true" color="orange" depressed dark><v-icon
                          class="ma-2">mdi-send</v-icon>{{
                            $t('buttons.submit') }}</v-btn>
                    </v-col>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
        </ShowInfo>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import VClamp from 'vue-clamp';
import Snackbar from '@/components/atoms/Snackbar';
import TipButton from '@/components/atoms/TipButton';
import AudioRecorder from '@/components/atoms/AudioRecorder';
import AudioVisualizer from '@/components/atoms/AudioVisualizer';
import VideoRecorder from '@/components/atoms/VideoRecorder.vue';
import ScreenRecorder from '@/components/atoms/ScreenRecorder.vue';
import Timer from '@/components/atoms/Timer.vue';
import TaskAnswer from '@/models/TaskAnswer';
import UserTask from '@/models/UserTask';

export default {
  components: {
    VideoRecorder,
    ShowInfo,
    Timer,
    VClamp,
    Snackbar,
    TipButton,
    AudioRecorder,
    AudioVisualizer,
    ScreenRecorder,
  },
  data: () => ({
    videoUrl: '',
    fullName: '',
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
    fab: false,
    dialog: false,
    allTasksCompleted: false,
    isLoading: false,
    isVisualizerVisible: false,
    localTestAnswer: new TaskAnswer(),
  }),
  computed: {
    test() {
      return this.$store.getters.test;
    },
    testId() {
      return this.$store.getters.test?.id || null;
    },
    user() {
      if (this.$store.getters.user) this.setExistUser();
      return this.$store.getters.user;
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer || {};
    },
    showSaveBtn() {
      return !this.localTestAnswer.submitted;
    },
    cooperators() {
      return this.$store.getters.cooperators;
    },
    loading() {
      return this.$store.getters.loading;
    },
    currentImageUrl() {
      return this.$store.state.Tests.currentImageUrl;
    },
    tasks() {
      return this.$store.getters.tasks;
    },
  },
  watch: {
    test: async function () {
      await this.mappingSteps();
    },
    items() {
      if (this.items.length) {
        this.index = this.items[0].id;
        if (this.items.find((obj) => obj.id === 0)) {
          this.preTestIndex = this.items[0].value[0].id;
        }
      }
    },
    taskIndex() {
      this.$refs.rightView.scrollTop = 0;
    },
    user: async function () {
      if (this.user) {
        this.noExistUser = false;
        if (this.logined) await this.setTest();
      }
    },
  },
  async created() {
    await this.mappingSteps();
  },
  async mounted() {
    if (this.user) {
      await this.setTest();
      await this.autoComplete();
      this.calculateProgress();
    }
  },
  beforeDestroy() {
    if (this.$refs.videoRecorder) {
      this.$refs.videoRecorder.stopRecording();
    }
  },
  methods: {
    async mappingSteps() {
      try {
        this.items = [];
        if (this.validate(this.test.testStructure?.preTest)) {
          this.items.push({
            title: 'Pre-test',
            icon: 'mdi-checkbox-blank-circle-outline',
            value: [
              { title: 'Consent', icon: 'mdi-checkbox-blank-circle-outline', id: 0 },
              { title: 'Form', icon: 'mdi-checkbox-blank-circle-outline', id: 1 },
            ],
            id: 0,
          });
          if (!this.localTestAnswer.preTestAnswer.length && this.test.testStructure.preTest) {
            this.localTestAnswer.preTestAnswer = this.test.testStructure.preTest.map(() => ({
              answer: '',
            }));
          }
        }
        if (this.validate(this.test.testStructure?.userTasks)) {
          this.items.push({
            title: 'Tasks',
            icon: 'mdi-checkbox-blank-circle-outline',
            value: this.test.testStructure.userTasks.map((task, index) => ({
              title: task.taskName,
              icon: 'mdi-checkbox-blank-circle-outline',
              id: index,
            })),
            id: 1,
          });
          if (!this.localTestAnswer.tasks.length && this.test.testStructure.userTasks) {
            this.localTestAnswer.tasks = this.test.testStructure.userTasks.map(() =>
              new UserTask({
                taskAnswer: '',
                taskObservations: '',
                postAnswer: '',
                taskTime: 0,
                completed: false,
              })
            );
          }
        }
        if (this.validate(this.test.testStructure?.postTest)) {
          this.items.push({
            title: 'Post Test',
            icon: 'mdi-checkbox-blank-circle-outline',
            value: this.test.testStructure.postTest,
            id: 2,
          });
          if (!this.localTestAnswer.postTestAnswer.length && this.test.testStructure.postTest) {
            this.localTestAnswer.postTestAnswer = this.test.testStructure.postTest.map(() => ({
              answer: '',
            }));
          }
        }
      } catch (error) {
        this.$toast.error('Failed to initialize test data. Please try again.');
        console.error('Error mapping steps:', error.message);
      }
    },
    validate(object) {
      return object !== null && object !== undefined && object !== '' && Array.isArray(object) && object.length > 0;
    },
    isTaskDisabled(taskIndex) {
      for (let i = 0; i < taskIndex; i++) {
        if (!this.localTestAnswer.tasks[i]?.completed) {
          return true;
        }
      }
      return false;
    },
    async saveAnswer() {
      try {
        this.localTestAnswer.fullName = this.fullName;
        if (!this.user) {

          console.log(this.localTestAnswer);

          await this.$store.dispatch('saveTestAnswer', {
            data: this.localTestAnswer,
            answerDocId: this.test.answersDocId,
            testType: this.test.testType,
          });
        } else {
          Object.assign(this.currentUserTestAnswer, this.localTestAnswer);

          await this.$store.dispatch('saveTestAnswer', {
            data: this.currentUserTestAnswer,
            answerDocId: this.test.answersDocId,
            testType: this.test.testType,
          });
        }

        this.$router.push('/testslist');
      } catch (error) {
        console.error('Error saving answer:', error.message);
        this.$toast.error('Failed to save the answer. Please try again.');
      }
    },
    async submitAnswer() {
      try {
        this.localTestAnswer.submitted = true;
        await this.saveAnswer();
      } catch (error) {
        console.error('Error submitting answer:', error.message);
        this.$toast.error('Failed to submit the answer. Please try again.');
      }
    },
    startTest() {
      if (!this.test.testStructure || this.test.testStructure.length === 0) {
        this.$toast.info("This test doesn't have any tasks.");
        this.$router.push('/managerview/' + this.test.id);
        return;
      }
      this.start = !this.start;
    },
    callTimerSave() {
      const timerComponent = this.$refs.timerComponent;
      if (timerComponent) timerComponent.stopTimer();
    },
    startTimer() {
      const timerComponent = this.$refs.timerComponent;
      if (timerComponent) timerComponent.startTimer();
    },
    handleTimerStopped(elapsedTime, taskIndex) {
      if (this.localTestAnswer.tasks[taskIndex]) {
        this.localTestAnswer.tasks[taskIndex].taskTime = elapsedTime;
      }
    },
    completeStep(id, type, userCompleted = true) {
      try {
        if (type === 'tasks') {
          this.localTestAnswer.tasks[id].completed = userCompleted;
          this.items[1].value[id].icon = 'mdi-check-circle-outline';
          this.allTasksCompleted = true;
          this.$forceUpdate();

          for (let i = 0; i < this.items[1].value.length; i++) {
            if (this.localTestAnswer.tasks[i].completed == null) {
              this.allTasksCompleted = false;
              break;
            }
          }
          if (this.allTasksCompleted) {
            this.items[1].icon = 'mdi-check-circle-outline';
          }
          if (this.taskIndex < this.localTestAnswer.tasks.length - 1) {
            this.taskIndex++;
            this.startTimer() // start timer for the next task - jvJUCA
          } else if (this.taskIndex >= this.localTestAnswer.tasks.length - 1) {
            this.index++;
          }
          if (userCompleted) {
            this.$toast.success(`Task "${this.test.testStructure.userTasks[id].taskName}" completed successfully!`, {
              timeout: 3000,
            });
          }
        }
        if (type === 'postTest') {
          this.localTestAnswer.postTestCompleted = true;
          this.items[2].icon = 'mdi-check-circle-outline';
        }
        if (type === 'preTest') {
          this.localTestAnswer.preTestCompleted = true;
          this.items[0].value[id].icon = 'mdi-check-circle-outline';
          if (this.localTestAnswer.preTestCompleted && this.localTestAnswer.consentCompleted) {
            this.items[0].icon = 'mdi-check-circle-outline';
          }
        }
        if (type === 'consent') {
          this.localTestAnswer.consentCompleted = true;
          this.items[0].value[id].icon = 'mdi-check-circle-outline';
          if (this.localTestAnswer.preTestCompleted && this.localTestAnswer.consentCompleted) {
            this.items[0].icon = 'mdi-check-circle-outline';
          }
        }
        this.calculateProgress();
      } catch (error) {
        console.error('Error completing step:', error.message);
      }
    },
    async autoComplete() {
      if (this.localTestAnswer.preTestCompleted) {
        this.items[0].value[1].icon = 'mdi-check-circle-outline';
      }
      if (this.localTestAnswer.consentCompleted) {
        this.items[0].value[0].icon = 'mdi-check-circle-outline';
      }
      if (this.localTestAnswer.preTestCompleted && this.localTestAnswer.consentCompleted) {
        this.items[0].icon = 'mdi-check-circle-outline';
      }
      let allTasksCompleted = true;
      for (let i = 0; i < this.items[1].value.length; i++) {
        if (this.localTestAnswer.tasks[i].completed != null) {
          this.items[1].value[i].icon = 'mdi-check-circle-outline';
        }
        if (this.localTestAnswer.tasks[i].completed == null) {
          allTasksCompleted = false;
          break;
        }
      }
      if (allTasksCompleted) {
        this.items[1].icon = 'mdi-check-circle-outline';
      }
      if (this.localTestAnswer.postTestCompleted) {
        this.items[2].icon = 'mdi-check-circle-outline';
      }
    },
    calculateProgress() {
      const totalSteps = 4;
      let completedSteps = 0;

      if (this.localTestAnswer.preTestCompleted) completedSteps++;
      if (this.localTestAnswer.consentCompleted) completedSteps++;
      const tasksCompleted = this.items[1]?.value?.filter(
        (task) => this.localTestAnswer.tasks[task.id]?.completed
      ).length;
      if (tasksCompleted === this.items[1]?.value?.length) completedSteps++;
      if (this.localTestAnswer.postTestCompleted) completedSteps++;

      const progressPercentage = (completedSteps / totalSteps) * 100;
      this.localTestAnswer.progress = progressPercentage;
      return progressPercentage;
    },
    async setTest() {
      try {
        this.logined = true;
        await this.$store.dispatch('getCurrentTestAnswerDoc');
        let tasksArray = [];
        if (this.currentUserTestAnswer.tasks) {
          if (Array.isArray(this.currentUserTestAnswer.tasks)) {
            tasksArray = this.currentUserTestAnswer.tasks;
          } else if (typeof this.currentUserTestAnswer.tasks === 'object') {
            tasksArray = Object.values(this.currentUserTestAnswer.tasks);
          }
        }
        Object.assign(this.localTestAnswer, {
          consent: this.currentUserTestAnswer.consent || '',
          consentCompleted: this.currentUserTestAnswer.consentCompleted || false,
          preTestCompleted: this.currentUserTestAnswer.preTestCompleted || false,
          preTestAnswer: this.currentUserTestAnswer.preTestAnswer || [],
          tasks: tasksArray,
          postTestCompleted: this.currentUserTestAnswer.postTestCompleted || false,
          postTestAnswer: this.currentUserTestAnswer.postTestAnswer || [],
          submitted: this.currentUserTestAnswer.submitted || false,
          progress: this.currentUserTestAnswer.progress || 0,
          fullName: this.currentUserTestAnswer.fullName || '',
        });
        this.fullName = this.localTestAnswer.fullName;
      } catch (error) {
        console.error('Error setting test:', error.message);
        this.$toast.error('Failed to load test data. Please try again.');
      }
    },
    populateWithHeuristicQuestions() {
      // Add logic for populating heuristic questions if needed
    },
    setExistUser() {
      this.noExistUser = false;
    },
  },
};
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
  height: 100%;
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

.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.subtitleView {
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
}

.right-view::-webkit-scrollbar {
  width: 9px;
}

.right-view::-webkit-scrollbar-track {
  background: none;
}

.right-view::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}

.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}

.nav-list::-webkit-scrollbar {
  width: 7px;
}

.nav-list::-webkit-scrollbar-track {
  background: none;
}

.nav-list::-webkit-scrollbar-thumb {
  background: #777596;
  border-radius: 4px;
}

.nav-list::-webkit-scrollbar-thumb:hover {
  background: #64618a;
}

.cards {
  border-radius: 20px;
}

.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.cardsSubtitle {
  color: #455a64;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>