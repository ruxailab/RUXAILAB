<template>
  <div v-if="test">
    <!-- Test Start Screen -->
    <v-row
      v-if="test && start"
      class="background background-img pa-0 ma-0"
      align="center"
    >
      <v-col
        cols="6"
        class="ml-5"
      >
        <h1 class="titleView pb-1">
          {{ test.testTitle }}
        </h1>
        <p
          align="justify"
          class="description"
        >
          {{ test.testDescription }}
        </p>
        <v-row justify="center">
          <v-col cols="12">
            <span
              v-if="!isTestAvailable"
              style="font-size: 18px;"
              class="titleText mt-4 ml-0"
            >
              The test is available at {{ new Date(testDate).toLocaleString() }}
            </span>
          </v-col>
          <v-btn
            :disabled="!isTestAvailable"
            color="white"
            variant="outlined"
            rounded
            @click="startTest()"
          >
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
        :rail="mini"
        permanent
        color="#3F3D56"
      >
        <div
          v-if="!mini"
          class="header"
        >
          <v-list-item>
            <v-row
              dense
              align="center"
              justify="space-around"
            >
              <v-col
                class="pa-0 ma-0"
                cols="8"
              >
                <v-clamp
                  class="titleText"
                  autoresize
                  :max-lines="2"
                >
                  {{ test.testTitle }}
                </v-clamp>
              </v-col>
              <v-col>
                <v-progress-circular
                  rotate="-90"
                  :model-value="calculateProgress()"
                  color="#fca326"
                  :size="50"
                  class="mt-2"
                >
                  {{ Math.floor(calculateProgress()) }}%
                </v-progress-circular>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list
          class="nav-list"
          density="compact"
          max-height="85%"
          style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px"
        >
          <div
            v-for="(item, itemIndex) in items"
            :key="itemIndex"
          >
            <v-list-item
              v-if="item.id == 0"
              :disabled="!isAdmin && bothConnected"
              :class="{ 'disabled-group': !isAdmin && bothConnected }"
              :value="index == 0 ? true : false"
              no-action
              @click="index = item.id"
            >
              <template #prepend>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :style="index == item.id ? 'color: white' : 'color:#fca326'">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="item.id == 1"
              :value="index == 1 ? true : false"
              :class="{ 'disabled-group': !bothConnected }"
              :disabled="!bothConnected"
              no-action
              @click="index = item.id"
            >
              <template #prepend>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :style="index == item.id ? 'color: white' : 'color:#fca326'">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              v-else-if="item.id == 2"
              :class="{ 'disabled-group': !bothConnected }"
              :disabled="!bothConnected"
              @click="index = item.id"
            >
              <template #prepend>
                <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :style="index == item.id ? 'color: white' : 'color:#fca326'">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </div>
        </v-list>

        <div class="footer">
          <v-spacer />
          <v-btn
            icon
            class="mr-2"
            @click.stop="mini = !mini"
          >
            <v-icon
              v-if="mini"
              color="white"
            >
              mdi-chevron-right
            </v-icon>
            <v-icon
              v-else
              color="white"
            >
              mdi-chevron-left
            </v-icon>
          </v-btn>
        </div>
      </v-navigation-drawer>

      <!-- Moderator View -->
      <v-col
        v-if="index == 0 && isAdmin && !postTestFinished"
        ref="rightView"
        class="mx-15 mt-4 right-view backgroundTest"
      >
        <v-card
          v-if="!connectionStatus"
          color="white"
          class="cards"
        >
          <v-row
            justify="center"
            class="mt-4"
          >
            <v-col
              cols="11"
              class="mt-3"
            >
              <span class="cardsTitle">Confirm you are ready</span>
              <v-row
                justify="center"
                class="mt-1"
              >
                <v-col
                  cols="11"
                  class="pt-0"
                >
                  <span class="cardsSubtitle">
                    This area enables you to connect via voice and camera with
                    your evaluator so that, when ready, they can start the test.
                  </span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row
            justify="center"
            class="mt-4"
          >
            <VideoCall
              ref="videoCall"
              :index="index"
              :is-admin="isAdmin"
              @emit-confirm="confirmConnect(), (index = 1)"
            />
          </v-row>
        </v-card>
        <v-col
          v-else-if="moderatorStatus && !evaluatorStatus"
          class="my-12"
        >
          <span class="cardsTitle text-center d-block">
            Waiting the evaluator connection ...
          </span>
          <div class="dot-flashing mx-auto mt-4" />
        </v-col>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-title>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Pre-Test</span>
                <v-icon
                  v-if="userTestStatus.preTestStatus == 'closed'"
                  color="green"
                  @click="changeStatus(0, 'preTest', 'open')"
                >
                  mdi-play
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.preTestStatus == 'open'"
                  color="green"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.preTestStatus == 'inProgress'"
                  color="orange"
                >
                  mdi-dots-horizontal
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.preTestStatus == 'done'"
                  color="green"
                >
                  mdi-check
                </v-icon>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-divider class="mb-6" />
              <v-row
                v-for="(item, preTestIdx) in test.testStructure.preTest"
                :key="preTestIdx"
              >
                <v-col
                  cols="5"
                  class="mx-auto py-0"
                >
                  <p class="cardsTitle">
                    {{ item.title }}
                  </p>
                  <p
                    v-if="item.description"
                    class="cardsSubtitle"
                  >
                    {{ item.description }}
                  </p>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Moderator Tasks view -->
          <v-expansion-panel
            v-for="(task, taskIdx) in test.testStructure.userTasks"
            :key="taskIdx"
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-title>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">{{ task.taskName }}</span>
                <v-icon
                  v-if="tasksStatus[taskIdx] == 'closed'"
                  color="green"
                  @click="openTask(taskIdx)"
                >
                  mdi-play
                </v-icon>
                <v-icon
                  v-else-if="tasksStatus[taskIdx] == 'open'"
                  color="green"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="tasksStatus[taskIdx] == 'inProgress'"
                  color="orange"
                >
                  mdi-dots-horizontal
                </v-icon>
                <v-icon
                  v-else-if="tasksStatus[taskIdx] == 'done'"
                  color="green"
                >
                  mdi-check
                </v-icon>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-divider class="mb-6" />
              <v-row
                class="fill-height"
                align="center"
                justify="center"
              >
                <v-col
                  cols="12"
                  class="mb-0"
                >
                  <span
                    class="ml-4"
                    style="color: #455a64"
                  >
                    {{ test.testStructure.userTasks[taskIdx].taskDescription }}
                  </span>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Moderator Post-Test view -->
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
          >
            <v-expansion-panel-title>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Post-Test</span>
                <v-icon
                  v-if="userTestStatus.postTestStatus == 'closed'"
                  color="green"
                  @click="changeStatus(0, 'postTest', 'open')"
                >
                  mdi-play
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.postTestStatus == 'open'"
                  color="green"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.postTestStatus == 'inProgress'"
                  color="orange"
                >
                  mdi-dots-horizontal
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.postTestStatus == 'done'"
                  color="green"
                >
                  mdi-check
                </v-icon>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-divider class="mb-6" />
              <v-row
                v-for="(item, postTestIndex) in test.testStructure.postTest"
                :key="postTestIndex"
              >
                <v-col
                  cols="5"
                  class="mx-auto py-0"
                >
                  <p class="cardsTitle">
                    {{ item.title }}
                  </p>
                  <p
                    v-if="item.description"
                    class="cardsSubtitle"
                  >
                    {{ item.description }}
                  </p>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col
        v-if="index == 0 && postTestFinished && isAdmin"
        ref="rightView"
        class="mx-10 mt-6 right-view backgroundTest"
      >
        <v-card
          color="white"
          class="cards mb-6"
        >
          <v-row
            justify="center"
            class="mt-4"
          >
            <v-col
              cols="11"
              class="mt-3"
            >
              <span class="cardsTitle">Evaluator concluded the test!</span>
              <br>
              <span class="cardsSubtitle">
                Here you can finalize the test, or you can keep talking with your
                evaluator until you finish!
              </span>
              <v-btn
                v-if="postTestFinished"
                class="my-6"
                color="orange"
                variant="flat"
                block
                @click="stopRecording(), finishTest()"
              >
                Finish Test
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col
        v-if="index == 1 && taskIndex == 0 && isAdmin"
        ref="rightView"
        class="mx-10 mt-2 right-view backgroundTest"
      >
        <FeedbackView
          :index="index"
          :is-admin="isAdmin"
        />
      </v-col>

      <!-- Evaluator View -->
      <v-col
        v-if="index == 0 && taskIndex == 0 && !isAdmin"
        ref="rightView"
        class="mx-15 mt-4 right-view backgroundTest"
      >
        <v-card
          color="white"
          class="cards mb-6"
        >
          <v-row
            justify="center"
            class="mt-4"
          >
            <v-col
              cols="11"
              class="mt-3"
            >
              <span class="cardsTitle">Welcome!</span>
              <v-row
                justify="center"
                class="mt-1"
              >
                <v-col
                  cols="11"
                  class="pt-2 mb-5"
                >
                  <span class="cardsSubtitle">
                    {{ test.testStructure.welcomeMessage }}
                  </span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
        <v-card
          color="white"
          class="cards mb-6"
        >
          <v-row
            justify="center"
            class="mt-4"
          >
            <v-col
              cols="11"
              class="mt-3"
            >
              <span class="cardsTitle">We need your consent!</span>
              <v-row
                justify="center"
                class="mt-1"
              >
                <v-col
                  cols="11"
                  class="pt-2 mb-5"
                >
                  <span class="cardsSubtitle">
                    The information you give is used for lorem ipsum dolor sit
                    amet consectetur
                  </span>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="11">
                  <v-checkbox
                    v-model="currentUserTestAnswer.consentCompleted"
                    :disabled="consentCompleted"
                    color="orange"
                    class="ma-0 pa-0"
                    @click="
                      changeStatus(taskIndex, 'consent', 'done'),
                      (consentCompleted = true)
                    "
                  >
                    <template #label>
                      <span style="color: #455a64">{{
                        test.testStructure.consent
                      }}</span>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
        <v-card
          color="white"
          class="cards mb-6"
        >
          <v-row
            justify="center"
            class="mt-4"
          >
            <v-col
              cols="11"
              class="mt-3"
            >
              <span class="cardsTitle">Connect with your moderator</span>
              <v-row
                justify="center"
                class="mt-1"
              >
                <v-col
                  cols="11"
                  class="pt-0"
                >
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
                  <span class="cardsTitle text-center d-block">
                    Waiting the moderator...
                  </span>
                  <div class="dot-flashing mx-auto mt-4" />
                </v-col>
                <v-col
                  v-else
                  cols="12"
                  class="mr-8"
                >
                  <VideoCall
                    ref="videoCall"
                    :index="index"
                    :is-admin="isAdmin"
                    :consent-completed="consentCompleted"
                    @emit-confirm="confirmConnect(), (index = 2)"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Evaluator Pre-Test view -->
      <v-col
        v-if="index == 1 && !isAdmin && !postTestFinished"
        ref="rightView"
        class="mx-10 mt-6 right-view backgroundTest"
      >
        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
            :disabled="userTestStatus.preTestStatus == 'closed'"
            @click="setInProgress(index, 'preTest')"
          >
            <v-expansion-panel-title>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Pre-Test</span>
                <v-icon
                  v-if="userTestStatus.preTestStatus == 'closed'"
                  color="#8D8D8D"
                >
                  mdi-lock
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.preTestStatus == 'open'"
                  color="green"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.preTestStatus == 'inProgress'"
                  color="orange"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.preTestStatus == 'done'"
                  color="green"
                >
                  mdi-check
                </v-icon>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-divider class="mb-6" />
              <v-row
                v-for="(item, preTestIdx) in test.testStructure.preTest"
                :key="preTestIdx"
              >
                <v-col
                  cols="5"
                  class="mx-auto py-0"
                >
                  <p class="cardsTitle">
                    {{ item.title }}
                  </p>
                  <p
                    v-if="item.description"
                    class="cardsSubtitle"
                  >
                    {{ item.description }}
                  </p>
                  <v-textarea
                    v-if="item.textField"
                    v-model="currentUserTestAnswer.preTestAnswer[preTestIdx].answer"
                    :placeholder="item.title"
                    rows="1"
                    variant="outlined"
                  />
                  <v-radio-group
                    v-if="item.selectionField"
                    v-model="currentUserTestAnswer.preTestAnswer[preTestIdx].answer"
                  >
                    <v-row
                      v-for="(selection, selectionIndex) in item.selectionFields"
                      :key="selectionIndex"
                    >
                      <v-radio
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
                <v-col
                  cols="10"
                  class="mx-4"
                >
                  <v-btn
                    v-if="userTestStatus.preTestStatus != 'done'"
                    block
                    style="border-radius: 10px"
                    color="orange-lighten-1"
                    variant="flat"
                    :disabled="test.userTestStatus.preTestStatus == 'closed'"
                    @click="changeStatus(taskIndex, 'preTest', 'done')"
                  >
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Evaluator Tasks view -->
          <v-expansion-panel
            v-for="(task, taskIdx) in test.testStructure.userTasks"
            :key="taskIdx"
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
            :disabled="tasksStatus[taskIdx] == 'closed'"
            @click="setTaskIndex(taskIdx), setInProgress(taskIdx, 'tasks')"
          >
            <v-expansion-panel-title>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">{{ task.taskName }}</span>
                <v-icon
                  v-if="tasksStatus[taskIdx] == 'closed'"
                  color="#8D8D8D"
                >
                  mdi-lock
                </v-icon>
                <v-icon
                  v-else-if="tasksStatus[taskIdx] == 'open'"
                  color="green"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="tasksStatus[taskIdx] == 'inProgress'"
                  color="orange"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="tasksStatus[taskIdx] == 'done'"
                  color="green"
                >
                  mdi-check
                </v-icon>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-divider class="mb-6" />
              <v-row
                class="fill-height"
                align="center"
                justify="center"
              >
                <v-col
                  cols="12"
                  class="mb-0"
                >
                  <span
                    class="ml-4"
                    style="color: #455a64"
                  >
                    {{ test.testStructure.userTasks[taskIdx].taskDescription }}
                  </span>
                </v-col>
                <v-col
                  cols="9"
                  class="mb-0 pb-0"
                >
                  <v-textarea
                    :id="'id-' + test.testStructure.userTasks[taskIdx].taskName"
                    v-model="
                      currentUserTestAnswer.tasks[taskIdx].taskObservations
                    "
                    variant="outlined"
                    label="observation (optional)"
                  />
                </v-col>
                <v-col
                  cols="2"
                  class="mx-4"
                >
                  <v-btn
                    v-if="tasksStatus[taskIdx] != 'done'"
                    block
                    style="border-radius: 10px"
                    color="orange-lighten-1"
                    variant="flat"
                    @click="changeStatus(taskIdx, 'tasks', 'done')"
                  >
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Evaluator Post-Test view -->
          <v-expansion-panel
            style="border: solid 1px #71717182 !important; border-radius: 30px"
            class="mb-3"
            :disabled="userTestStatus.postTestStatus == 'closed'"
            @click="setInProgress(index, 'postTest')"
          >
            <v-expansion-panel-title>
              <div class="d-flex justify-space-between align-center">
                <span class="cardsTitle">Post-Test</span>
                <v-icon
                  v-if="userTestStatus.postTestStatus == 'closed'"
                  color="#8D8D8D"
                >
                  mdi-lock
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.postTestStatus == 'open'"
                  color="green"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.postTestStatus == 'inProgress'"
                  color="orange"
                >
                  mdi-lock-open
                </v-icon>
                <v-icon
                  v-else-if="userTestStatus.postTestStatus == 'done'"
                  color="green"
                >
                  mdi-check
                </v-icon>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-divider class="mb-6" />
              <v-row
                v-for="(item, postTestIndex) in test.testStructure.postTest"
                :key="postTestIndex"
              >
                <v-col
                  cols="5"
                  class="mx-auto py-0"
                >
                  <p>{{ item.title }}</p>
                  <p v-if="item.description">
                    {{ item.description }}
                  </p>
                  <v-textarea
                    v-if="item.textField"
                    v-model="
                      currentUserTestAnswer.postTestAnswer[postTestIndex].answer
                    "
                    :placeholder="item.title"
                    variant="outlined"
                    rows="1"
                  />
                  <v-radio-group
                    v-if="item.selectionField"
                    v-model="
                      currentUserTestAnswer.postTestAnswer[postTestIndex].answer
                    "
                  >
                    <v-row
                      v-for="(selection, selectionIndex) in item.selectionFields"
                      :key="selectionIndex"
                    >
                      <v-radio
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
                <v-col
                  cols="10"
                  class="mx-4"
                >
                  <v-btn
                    v-if="userTestStatus.postTestStatus != 'done'"
                    alibi
                    block
                    style="border-radius: 10px"
                    color="orange-lighten-1"
                    variant="flat"
                    @click="changeStatus(0, 'postTest', 'done')"
                  >
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col
        v-if="index == 1 && postTestFinished && !isAdmin"
        ref="rightView"
        class="mx-10 mt-6 right-view backgroundTest"
      >
        <v-card
          color="white"
          class="cards mb-6"
        >
          <v-row
            justify="center"
            class="mt-4"
          >
            <v-col
              cols="11"
              class="mt-3"
            >
              <span class="cardsTitle">Final Message!</span>
              <br>
              <span class="cardsSubtitle">
                Congratulations, you finished this test. Here you can continue
                talking with your moderator or leave the test.
              </span>
              <v-row
                justify="center"
                class="mt-3"
              >
                <v-col cols="4">
                  <img
                    draggable="false"
                    src="../../../public/finalMessage.svg"
                    alt="Final test svg"
                  >
                </v-col>
                <v-col
                  cols="6"
                  class="pt-2 my-8"
                >
                  <span class="cardsSubtitle">
                    {{ test.testStructure.finalMessage }}
                  </span>
                  <v-col
                    class="mt-4"
                    align="end"
                  >
                    <v-btn
                      color="orange"
                      variant="flat"
                      @click="saveAnswer(), stopRecording()"
                    >
                      Save & Exit
                    </v-btn>
                  </v-col>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Feedback View -->
      <v-col
        v-if="index == 2 && taskIndex == 0"
        ref="rightView"
        class="mx-10 mt-2 right-view backgroundTest"
      >
        <FeedbackView
          :index="index"
          :is-admin="isAdmin"
        />
      </v-col>
    </v-row>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="isLoading"
      class="text-center"
    >
      <v-card
        class="pa-4"
        rounded="xl"
        color="grey-darken-4"
      >
        <v-progress-linear
          style="border-radius: 20px; width: 20wv;"
          :model-value="uploadProgress"
          color="#fca326"
          height="20"
          class="mb-2"
        >
          <template #default="{ value }">
            <span>{{ Math.ceil(value) }}%</span>
          </template>
        </v-progress-linear>
        <div class="white-text mx-16">
          Saving Your Answer...
        </div>
      </v-card>
    </v-overlay>

    <v-dialog
      :model-value="!noExistUser && !logined"
      width="500"
      persistent
    >
      <v-card v-if="user">
        <v-row
          class="ma-0 pa-0 pt-5"
          justify="center"
        >
          <v-avatar
            class="justify-center"
            color="orange-lighten-4"
            size="150"
          >
            <v-icon size="120">
              mdi-account
            </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn
            color="#F9A826"
            class="text-white"
            @click="setTest()"
          >
            Continue as {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            Not {{ user.email }}?
            <a
              style="color: #f9a826"
              @click="signOut()"
            >Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DisconnectedCard v-if="isDisconnected" />
    <video
      ref="remoteAudio"
      autoplay
      playsinline
      style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { db } from '@/firebase';
import VideoCall from '@/components/molecules/VideoCall.vue';
import DisconnectedCard from '@/components/atoms/DisconnectedCard.vue';
import FeedbackView from '@/components/molecules/FeedbackView.vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

const connectionStatus = ref(false);
const isAdmin = ref(false);
const logined = ref(null);
const selected = ref(true);
const fromlink = ref(null);
const drawer = ref(true);
const start = ref(true);
const mini = ref(false);
const index = ref(0);
const noExistUser = ref(true);
const taskIndex = ref(0);
const preTestIndex = ref(null);
const items = ref([]);
const taskAnswers = ref({});
const dialog = ref(false);
const moderatorStatus = ref(null);
const evaluatorStatus = ref(null);
const tasksStatus = ref([]);
const userTestStatus = ref({});
const postTestFinished = ref(false);
const bothConnected = ref(false);
const recording = ref(false);
const recordedChunksEvaluator = ref([]);
const recordedChunksModerator = ref([]);
const recordedVideoEvaluator = ref('');
const recordedVideoModerator = ref('');
const videoStream = ref(null);
const mediaRecorderEvaluator = ref(null);
const mediaRecorderModerator = ref(null);
const isLoading = ref(false);
const consentCompleted = ref(false);
const sessionCooperator = ref(null);
const testDate = ref(null);
const saved = ref(false);
const uploadProgress = ref(0);
const backupInterval = ref(null);

// DOM refs
const rightView = ref(null);
const videoCall = ref(null);
const remoteAudio = ref(null);

const test = computed(() => store.getters.test);
const user = computed(() => {
  if (store.getters.user) setExistUser();
  return store.getters.user;
});
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer);
const cooperators = computed(() => store.getters.cooperators);
const tasks = computed(() => store.getters.tasks);
const roomTestId = computed(() => store.getters.test.id);
const localCameraStream = computed(() => store.getters.localCameraStream);
const remoteCameraStream = computed(() => store.getters.remoteCameraStream);
const isTestAvailable = computed(() => new Date() > new Date(testDate.value));
const isDisconnected = computed(() => store.getters.isDisconnected);

const isSaved = () => saved.value;
const isTestNotStarted = () => start.value;

const saveAnswer = async () => {
  currentUserTestAnswer.value.submitted = true;
  await store.dispatch('saveTestAnswer', {
    data: currentUserTestAnswer.value,
    answerDocId: test.value.answersDocId,
    testType: test.value.testType,
  });
};

const setTaskIndex = (idx) => {
  taskIndex.value = idx;
};

const openTask = (id) => {
  const testRef = doc(db, 'tests', roomTestId.value);
  getDoc(testRef).then((doc) => {
    if (doc.exists()) {
      const testStructure = doc.data().testStructure;
      testStructure.userTasks[id].taskStatus = 'open';
      updateDoc(testRef, { testStructure }).catch((error) => {
        console.error('Error updating task status:', error);
      });
      test.value.testStructure.userTasks[id].taskStatus = 'open';
    } else {
      console.error('Test document not found');
    }
  });
};

const setInProgress = (id, type) => {
  const statusToUpdate = 'inProgress';
  const testRef = doc(db, 'tests', roomTestId.value);
  getDoc(testRef).then((doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (type === 'tasks' && tasksStatus.value[id] === 'open') {
        data.testStructure.userTasks[id].taskStatus = statusToUpdate;
      } else if (type === 'postTest' && userTestStatus.value.postTestStatus === 'open') {
        data.userTestStatus.postTestStatus = statusToUpdate;
      } else if (type === 'preTest' && userTestStatus.value.preTestStatus === 'open') {
        data.userTestStatus.preTestStatus = statusToUpdate;
      }
      updateDoc(testRef, data).catch((error) => {
        console.error(`Error updating ${type} status:`, error);
      });
      if (type === 'tasks') {
        test.value.testStructure.userTasks[id].taskStatus = statusToUpdate;
      } else {
        test.value.userTestStatus[`${type}Status`] = statusToUpdate;
      }
    } else {
      console.error('Test document not found');
    }
  });
};

const setExistUser = () => {
  noExistUser.value = false;
};

const changeStatus = (id, type, newStatus) => {
  const testRef = doc(db, 'tests', roomTestId.value);
  getDoc(testRef)
    .then((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (type === 'tasks') {
          data.testStructure.userTasks[id].taskStatus = newStatus;
          if (newStatus === 'done') currentUserTestAnswer.value.tasks[id].completed = true;
        } else if (type === 'postTest') {
          data.userTestStatus.postTestStatus = newStatus;
          if (newStatus === 'done') currentUserTestAnswer.value.postTestCompleted = true;
        } else if (type === 'preTest') {
          data.userTestStatus.preTestStatus = newStatus;
          if (newStatus === 'done') currentUserTestAnswer.value.preTestCompleted = true;
        } else if (type === 'consent') {
          data.userTestStatus.consentStatus = newStatus;
          if (newStatus === 'done') currentUserTestAnswer.value.consentCompleted = true;
        }
        return updateDoc(testRef, data);
      }
      throw new Error('Test document not found');
    })
    .then(() => {
      calculateProgress();
    })
    .catch((error) => {
      console.error('Error updating status:', error);
    });
};

const setRemoteAudio = async () => {
  if (remoteAudio.value) {
    remoteAudio.value.srcObject = remoteCameraStream.value;
  }
};

const uploadVideo = async (recordedChunks, storagePath) => {
  const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
  const storage = getStorage();
  const ref = storageRef(storage, storagePath);
  const uploadTask = uploadBytesResumable(ref, videoBlob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.error('Upload failed:', error);
        isLoading.value = false;
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(ref);
        resolve(downloadURL);
      },
    );
  });
};

const startRecordingEvaluator = async () => {
  recording.value = true;
  recordedChunksEvaluator.value = [];
  const evaluatorCamera = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  mediaRecorderEvaluator.value = new MediaRecorder(evaluatorCamera);

  mediaRecorderEvaluator.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunksEvaluator.value.push(event.data);
    }
  };

  mediaRecorderEvaluator.value.onstop = async () => {
    isLoading.value = true;
    const storagePath = `tests/${roomTestId.value}/${route.params.token}/${currentUserTestAnswer.value.userDocId}/video/${recordedVideoEvaluator.value}`;
    try {
      recordedVideoEvaluator.value = await uploadVideo(recordedChunksEvaluator.value, storagePath);
      currentUserTestAnswer.value.cameraUrlEvaluator = recordedVideoEvaluator.value;
      isLoading.value = false;
      saved.value = true;
      window.onbeforeunload = null;
      router.push('/testslist');
    } catch (error) {
      console.error('Upload failed:', error);
      isLoading.value = false;
    }
  };

  mediaRecorderEvaluator.value.start();
  backupInterval.value = setInterval(async () => {
    if (recording.value) {
      await uploadVideo(recordedChunksEvaluator.value, storagePath);
    }
  }, 300000);
};

const startRecordingModerator = async () => {
  recording.value = true;
  recordedChunksModerator.value = [];
  const storagePath = `tests/${roomTestId.value}/${route.params.token}/moderator/video/${recordedVideoModerator.value}`;
  const moderatorCamera = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  mediaRecorderModerator.value = new MediaRecorder(moderatorCamera);

  mediaRecorderModerator.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunksModerator.value.push(event.data);
    }
  };

  mediaRecorderModerator.value.onstop = async () => {
    isLoading.value = true;
    try {
      recordedVideoModerator.value = await uploadVideo(recordedChunksModerator.value, storagePath);
      currentUserTestAnswer.value.cameraUrlModerator = recordedVideoModerator.value;
      isLoading.value = false;
      saved.value = true;
      window.onbeforeunload = null;
      router.push('/testslist');
    } catch (error) {
      console.error('Upload failed:', error);
      isLoading.value = false;
    }
  };

  mediaRecorderModerator.value.start();
  backupInterval.value = setInterval(async () => {
    if (recording.value) {
      await uploadVideo(recordedChunksModerator.value, storagePath);
    }
  }, 300000);
};

const stopRecording = () => {
  if (mediaRecorderEvaluator.value) {
    mediaRecorderEvaluator.value.stop();
    localCameraStream.value?.stop();
    clearInterval(backupInterval.value);
    recording.value = false;
  }
  if (mediaRecorderModerator.value) {
    mediaRecorderModerator.value.stop();
    localCameraStream.value?.stop();
    clearInterval(backupInterval.value);
    recording.value = false;
  }
};

const confirmConnect = async () => {
  const ref = doc(db, 'tests', roomTestId.value);
  try {
    if (isAdmin.value) {
      await updateDoc(ref, {
        userTestStatus: {
          moderator: true,
          user: false,
          consentStatus: 'open',
          preTestStatus: 'closed',
          postTestStatus: 'closed',
        },
      });
    } else {
      await updateDoc(ref, {
        userTestStatus: {
          user: true,
          moderator: true,
          consentStatus: 'open',
          preTestStatus: 'closed',
          postTestStatus: 'closed',
        },
      });
    }
    connectionStatus.value = true;
  } catch (e) {
    console.error('Error in connect:', e);
  }
};

const disconnect = async () => {
  const ref = doc(db, 'tests', roomTestId.value);
  try {
    await updateDoc(ref, {
      userTestStatus: {
        moderator: false,
        user: false,
        consentStatus: 'open',
        preTestStatus: 'closed',
        postTestStatus: 'closed',
      },
    });
  } catch (e) {
    console.error('Error in disconnect:', e);
  }
};

const submitAnswer = async () => {
  currentUserTestAnswer.value.submitted = true;
  await saveAnswer();
};

const startTest = () => {
  if (test.value.testStructure.length === 0) {
    toast.info("This test doesn't have any tasks");
    router.push('/managerview/' + test.value.id);
  }
  start.value = !start.value;
};

const calculateProgress = () => {
  const totalSteps = 3;
  let completedSteps = 0;
  if (currentUserTestAnswer.value.preTestCompleted) completedSteps++;
  if (currentUserTestAnswer.value.consentCompleted) completedSteps++;
  if (currentUserTestAnswer.value.postTestCompleted) completedSteps++;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  currentUserTestAnswer.value.progress = progressPercentage;
  return progressPercentage;
};

const setTest = async () => {
  logined.value = true;
  await store.dispatch('getCurrentTestAnswerDoc');
};

const verifyAdmin = async () => {
  if (test.value.testAdmin.email === user.value.email) {
    isAdmin.value = true;
  }
};

const mappingSteps = async () => {
  if (isAdmin.value) {
    if (validate(test.value.testStructure.preTest)) {
      items.value.push({
        title: 'Moderator view',
        icon: 'mdi-security',
        value: test.value.testStructure.postTest,
        id: 0,
      });
    }
    if (validate(test.value.testStructure.preTest)) {
      if (items.value.length) {
        items.value.push({
          title: 'Feedback',
          icon: 'mdi-monitor-account',
          value: test.value.testStructure.postTest,
          id: 2,
        });
      }
    }
  } else {
    if (validate(test.value.testStructure.preTest)) {
      items.value.push({
        title: 'Welcome Page',
        icon: 'mdi-human-greeting',
        id: 0,
      });
    }
    if (validate(test.value.testStructure.userTasks)) {
      items.value.push({
        title: 'Tasks',
        icon: 'mdi-checkbox-marked-circle-auto-outline',
        id: 1,
      });
    }
    if (validate(test.value.testStructure.postTest)) {
      items.value.push({
        title: 'Feedback',
        icon: 'mdi-monitor-account',
        id: 2,
      });
    }
  }
};

const finishTest = async () => {
  await store.dispatch('hangUp', roomTestId.value);
  saved.value = true;
  window.onbeforeunload = null;
};

const validate = (object) => {
  return object !== null && object !== undefined && object !== '';
};

const signOut = async () => {
  await store.dispatch('signOut');
  router.push('/signin');
};

// Lifecycle hooks
onMounted(async () => {
  if (!user.value) {
    toast.error('Login to your RUXAILAB account first to access the test!');
    router.push('/signin');
    return;
  }

  await verifyAdmin();
  if (route.params.token) {
    if (route.params.token === test.value.id) {
      toast.info('Use a session link to access your moderated test!');
      router.push('/managerview/' + test.value.id);
      return;
    }
    sessionCooperator.value = test.value.cooperators.find(
      (user) => user.userDocId === route.params.token,
    );
    if (user.value.id !== route.params.token && !isAdmin.value) {
      toast.error(t('errors.globalError'));
      router.push('/testslist');
      return;
    }
    if (sessionCooperator.value.testDate) {
      testDate.value = sessionCooperator.value.testDate;
    } else {
      toast.warning("Your session doesn't have a scheduled date");
      router.push('/managerview/' + test.value.id);
      return;
    }
  } else {
    toast.info('Use a session link to access the test');
    router.push('/managerview/' + test.value.id);
    return;
  }

  if (!isAdmin.value) {
    await store.dispatch('acceptTestCollaboration', {
      test: test.value,
      cooperator: user.value,
    });
  }

  await mappingSteps();
  consentCompleted.value = currentUserTestAnswer.value.consentCompleted;
  const ref = doc(db, 'tests/', roomTestId.value);
  await getDoc(ref).then((doc) => {
    if (doc.exists()) {
      const data = doc.data();
      data.userTestStatus.postTestStatus = 'closed';
      data.userTestStatus.preTestStatus = 'closed';
      data.userTestStatus.consentStatus = 'closed';
      for (let i = 0; i < test.value.testStructure.userTasks.length; i++) {
        data.testStructure.userTasks[i].taskStatus = 'closed';
      }
      return updateDoc(ref, data);
    }
  });
  onSnapshot(ref, (snapshot) => {
    moderatorStatus.value = snapshot.data().userTestStatus.moderator;
    evaluatorStatus.value = snapshot.data().userTestStatus.user;
    userTestStatus.value = snapshot.data().userTestStatus;
    const tasks = snapshot.data().testStructure.userTasks;
    tasksStatus.value = tasks.map((task) => task.taskStatus);
  });
});

onBeforeUnmount(async () => {
  if (isAdmin.value) {
    await disconnect();
    stopRecording();
    window.onbeforeunload = null;
    await store.dispatch('hangUp', roomTestId.value);
  } else {
    stopRecording();
  }
});

watch(taskIndex, () => {
  if (rightView.value) {
    rightView.value.scrollTop = 0;
  }
});

watch(start, (newVal) => {
  if (newVal) {
    window.onbeforeunload = () => 'handle your events or msgs here';
  }
});

watch(user, async () => {
  if (user.value) {
    noExistUser.value = false;
    if (logined.value) await setTest();
  }
});

watch(localCameraStream, async (value) => {
  if (value && !isAdmin.value) {
    await startRecordingEvaluator();
  } else if (value && isAdmin.value) {
    await startRecordingModerator();
  }
});

watch(remoteCameraStream, async () => {
  await setRemoteAudio();
});

watch(
  () => userTestStatus.value.preTestStatus,
  (newValue) => {
    if (newValue === 'done' && !isAdmin.value) {
      window.open(test.value.testStructure.landingPage);
    }
  },
);

watch(
  () => userTestStatus.value.postTestStatus,
  (newValue) => {
    postTestFinished.value = newValue === 'done';
  },
);

watch(evaluatorStatus, (newValue) => {
  if (newValue === true && moderatorStatus.value === true) {
    bothConnected.value = true;
  }
});
</script>

<style scoped>
.nav {
  background-color: #e8eaf2;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}
.nav-list {
  max-height: 85%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 100px;
}
.cards {
  margin-top: 16px;
}
.text-field {
  margin-bottom: 16px;
}
.btn-done {
  border-radius: 10px;
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
.v-text-field--outlined :deep(fieldset) {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
.disabled-group {
  pointer-events: none;
  background-color: grey;
}
body {
  overflow-y: 100vh;
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
.v-navigation-drawer {
  margin-top: 64px;
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
  background: #ffcd8694;
  border-radius: 2px;
}
.right-view::-webkit-scrollbar-thumb:hover {
  background: #fda1207a;
}
.nav-list::-webkit-scrollbar {
  width: 7px;
}
.nav-list::-webkit-scrollbar-track {
  background: none;
}
.nav-list::-webkit-scrollbar-thumb {
  background: #c09c6b;
  border-radius: 4px;
}
.nav-list::-webkit-scrollbar-thumb:hover {
  background: #eba555;
}
.card-title {
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