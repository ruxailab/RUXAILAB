<template>
  <div v-if="test">
    <div v-if="test.testType == 'HEURISTICS'">
      <Snackbar />

      <!-- Submit Alert Dialog -->
      <v-dialog
        v-model="dialog"
        width="600"
        persistent
      >
        <v-card>
          <v-card-title
            class="text-h5 bg-error text-white"
            primary-title
          >
            {{ $t('HeuristicsTestView.messages.submitTest') }}
          </v-card-title>

          <v-card-text>
            {{ $t('HeuristicsTestView.messages.submitOnce') }}
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              class="bg-grey-lighten-3"
              variant="text"
              @click="dialog = false"
            >
              {{ $t('HeuristicsTestView.actions.cancel') }}
            </v-btn>
            <v-btn
              class="bg-red text-white ml-1"
              variant="text"
              @click="submitAnswer(), (dialog = false)"
            >
              {{ $t('HeuristicsTestView.actions.submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-overlay v-model="loading">
        <v-progress-circular
          indeterminate
          size="64"
        />
      </v-overlay>

      <v-dialog
        :model-value="fromlink && !noExistUser && !logined"
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
              <v-icon
                size="120"
              >
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
              {{
                $t('HeuristicsTestView.actions.continueAs', {
                  userMail: user.email,
                })
              }}
            </v-btn>
          </v-card-actions>
          <v-card-actions class="justify-center mt-4">
            <p>
              {{
                $t('HeuristicsTestView.actions.notMail', {
                  userEmail: user.email,
                })
              }}
              <a
                style="color: #f9a826"
                @click="signOut()"
              >{{
                $t('HeuristicsTestView.actions.changeAccount')
              }}</a>
            </p>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Start Screen -->
      <v-container class="ma-0 pa-0" width="auto" height="100vh" style="background-color: #e8eaf2;">
        <v-row
          v-if="test && start"
          class="background background-img pa-0 ma-0"
          align="center"
        >
          <v-col
            cols="12"
            md="6"
            sm="12"
            xs="12"
            class="ml-md-3 mr-md-3"
          >
            <h1 class="titleView text-center text-md-left text-sm-center pb-1">
              {{ test.testTitle }}
            </h1>
            <p
              align="justify"
              class="description"
            >
              {{ test.testDescription }}
            </p>
            <v-row
              justify="center"
              justify-md="start"
              justify-sm="center"
              class="pa-4"
            >
              <v-btn
                color="white"
                variant="outlined"
                rounded
                @click="startTest()"
              >
                {{ $t('HeuristicsTestView.actions.startTest') }}
              </v-btn>
            </v-row>
          </v-col>
          <v-col
            cols="6"
            md="5"
            sm="6"
            xs="6 imposible"
            class="d-flex justify-center"
          >
            <v-img
              :src="require('../../assets/BackgroundTestView.png')"
              cover
              class="mx-auto"
              max-width="100%"
              height="auto"
            />
          </v-col>
        </v-row>

        <v-row
          v-else
          justify="center"
          class="pa-0 ma-0"
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
                    <text-clamp
                      class="titleText"
                      :text="test.testTitle"
                      :max-lines="2"
                    />
                  </v-col>
                  <v-col>
                    <v-progress-circular
                      rotate="-90"
                      :model-value="calculatedProgress"
                      color="#fca326"
                      :size="50"
                      class="mt-2"
                    >
                      {{ calculatedProgress }}
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
                v-for="(item, n) in items"
                :key="n"
              >
                <!--Heuris-->
                <v-list
                  v-if="item.id == 1"
                  :value="index == 1 ? true : false"
                  @click="index = item.id"
                >
                  <div v-if="mini">
                    <v-tooltip
                      v-for="(heuris, i) in item.value"
                      :key="i"
                      location="right"
                    >
                      <template #activator="{ props }">
                        <v-list-item
                          v-bind="props"
                          link
                          @click="heurisIndex = i"
                        >
                          <template #prepend>
                            <v-progress-circular
                              v-if="
                                perHeuristicProgress(
                                  currentUserTestAnswer.heuristicQuestions[i],
                                ) != 100
                              "
                              rotate="-90"
                              :model-value="
                                perHeuristicProgress(
                                  currentUserTestAnswer.heuristicQuestions[i],
                                )
                              "
                              :size="24"
                              :width="3"
                              :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                            />
                            <v-icon
                              v-else
                              :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                            >
                              {{ heuris.icon }}
                            </v-icon>
                          </template>

                          <v-list-item-title
                            :style="
                              heurisIndex == i
                                ? 'color: white'
                                : 'color:#fca326'
                            "
                          >
                            {{ heuris.title }}
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                      <span>{{ heuris.title }}</span>
                    </v-tooltip>
                  </div>

                  <div v-else>
                    <v-list-item
                      v-for="(heuris, i) in item.value"
                      :key="i"
                      link
                      @click="handleHeurisClick(i)"
                    >
                      <template #prepend>
                        <v-progress-circular
                          v-if="
                            perHeuristicProgress(
                              currentUserTestAnswer.heuristicQuestions[i],
                            ) != 100
                          "
                          rotate="-90"
                          :model-value="
                            perHeuristicProgress(
                              currentUserTestAnswer.heuristicQuestions[i],
                            )
                          "
                          :size="24"
                          :width="3"
                          :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                        />
                        <v-icon
                          v-else
                          :color="heurisIndex == i ? '#ffffff' : '#fca326'"
                        >
                          {{ heuris.icon }}
                        </v-icon>
                      </template>

                      <v-list-item-title
                        :style="
                          heurisIndex == i ? 'color: white' : 'color:#fca326'
                        "
                      >
                        {{ heuris.title }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="review == true && calculatedProgress == 100"
                      style="cursor:pointer"
                      @click="review = false"
                    >
                      <template #prepend>
                        <v-icon color="#fca326">
                          mdi-send-circle-outline
                        </v-icon>
                      </template>
                      
                      <v-list-item-title>
                        <div style="color: #fca326;">
                          Submit
                        </div>
                      </v-list-item-title>
                    </v-list-item>
                  </div>
                </v-list>

                <v-list-item
                  v-else-if="item.id == 2"
                  @click="index = item.id"
                >
                  <template #prepend>
                    <v-icon :color="index == item.id ? '#ffffff' : '#fca326'">
                      {{ item.icon }}
                    </v-icon>
                  </template>

                  <v-list-item-title
                    :style="index == item.id ? 'color: white' : 'color:#fca326'"
                  >
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>
              </div>
            </v-list>

            <div class="footer">
              <v-spacer />
              <v-btn
                icon
                class="mr-2 bg-orange"
                @click.stop="mini = !mini"
              >
                <v-icon
                  v-if="mini"
                  color="white"
                  icon="mdi-chevron-right"
                />
                <v-icon
                  v-else
                  color="white"
                  icon="mdi-chevron-left"
                />
              </v-btn>
            </div>
          </v-navigation-drawer>

          <v-col
            ref="rightView"
            :class="{ mini: !mini }"
            class="backgroundTest pa-0 ma-0 right-view"
          >
            <!-- Heuristics -->
            <ShowInfo
              v-if="index == 1 && review == true"
              :title="test.testStructure[heurisIndex].title"
            >
              <template #content>
                <div class="ma-0 pa-0">
                  <v-card-title class="subtitleView">
                    {{ test.testStructure[heurisIndex].title }}
                  </v-card-title>
                  <v-divider class="mb-5" />
                  <v-row
                    v-for="(question, i) in test.testStructure[heurisIndex]
                      .questions"
                    :key="i"
                    justify="center"
                  >
                    <v-col cols="10">
                      <v-row class="questions">
                        <v-col cols="11">
                          <p class="subtitleView">
                            {{ i + 1 }}) {{ question.title }}
                          </p>
                        </v-col>
                        <v-col cols="1">
                          <HelpBtn :question="question" />
                        </v-col>
                      </v-row>
                      <AddCommentBtn
                        :heuris-index="heurisIndex"
                        :answer-heu="
                          currentUserTestAnswer.heuristicQuestions[heurisIndex]
                            .heuristicQuestions[i]
                        "
                        @update-comment="
                          (comment) => updateComment(comment, heurisIndex, i)
                        "
                      >
                        <template #answer>
                          <v-select
                            v-if="currentUserTestAnswer !== undefined"
                            v-model="currentUserTestAnswer.heuristicQuestions[heurisIndex].heuristicQuestions[i].heuristicAnswer"
                            class="optionSelect"
                            return-object
                            :items="test.testOptions"
                            :item-title="item => item?.text || 'Select an Option'"
                            item-value="value"
                            variant="outlined"
                            density="compact"
                            @update:model-value="calculateProgress()"
                          />
                        </template>
                      </AddCommentBtn>
                    </v-col>
                  </v-row>
                </div>
              </template>
            </ShowInfo>
            <div v-if="calculatedProgress == 100 && review == false">
              <ShowInfo :title="$t('finishTest.title')">
                <template #content>
                  <div class="ma-0 pa-0">
                    <v-row
                      justify="center"
                      class="ma-4"
                    >
                      <v-col
                        cols="11"
                        class="mt-3"
                      >
                        <span class="cardsTitle">{{ $t('finishTest.finalMessage') }}!</span>
                        <br>
                        <span class="cardsSubtitle">
                          {{ $t('finishTest.congratulations') }}
                        </span>
                        <v-row
                          justify="center"
                          class="mt-3"
                        >
                          <v-col cols="4">
                            <img
                              draggable="false"
                              :src="require('../../../public/finalMessage.svg')"
                              alt="Final test svg"
                            >
                          </v-col>
                          <v-col
                            cols="4"
                            class="pt-2 my-8"
                          >
                            <span class="cardsSubtitle">{{ $t('finishTest.submitMessage') }}</span>
                            <v-col class="mt-2">
                              <v-btn
                                color="orange"
                                variant="flat"
                                @click="dialog = true"
                              >
                                <v-icon class="ma-2">
                                  mdi-send
                                </v-icon>{{ $t('buttons.submit') }}
                              </v-btn>
                            </v-col>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </div>
                </template>
              </ShowInfo>
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-btn
        v-if="showSaveBtn && !start"
        position="fixed"
        location="bottom right"
        icon
        class="mb-10 mr-5"
      >
        <v-speed-dial
          v-model="fab"
          class="mr-3"
          open-on-hover
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              size="large"
              color="#F9A826"
              icon
              class="btn-fix"
            >
              <v-icon v-if="fab">
                mdi-close
              </v-icon>
              <v-icon
                v-else
                size="large"
              >
                mdi-hammer-screwdriver
              </v-icon>
            </v-btn>
          </template>
          <v-tooltip location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="small"
                color="#F9A826"
                @click="saveAnswer"
              >
                <v-icon>mdi-content-save</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('HeuristicsTestView.actions.save') }}</span>
          </v-tooltip>
          <v-tooltip location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :disabled="calculateProgress < 100"
                class="text-white"
                icon
                size="small"
                color="#F9A826"
                @click="dialog = true"
              >
                <v-icon>mdi-file-move</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('HeuristicsTestView.actions.submit') }}</span>
          </v-tooltip>
        </v-speed-dial>
      </v-btn>
    </div>
    <div v-if="test.testType == 'User' && test.userTestType === 'unmoderated'">
      <UserTestView />
    </div>
    <div v-if="test.testType === 'User' && test.userTestType === 'moderated'">
      <ModeratedTestView
        ref="moderatedTestViewRef"
        :token="token"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from "vue-toastification"
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import AddCommentBtn from '@/components/atoms/AddCommentBtn.vue'
import HelpBtn from '@/components/atoms/QuestionHelpBtn.vue'
import TextClamp from 'vue3-text-clamp'
import Snackbar from '@/components/atoms/Snackbar.vue'
import HeuristicQuestionAnswer from '@/models/HeuristicQuestionAnswer'
import Heuristic from '@/models/Heuristic'
import UserTestView from './UserTestView.vue'
import ModeratedTestView from './ModeratedTestView.vue'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()

const logined = ref(null)
const selected = ref(true)
const fromlink = ref(null)
const drawer = ref(true)
const start = ref(true)
const mini = ref(false)
const index = ref(null)
const noExistUser = ref(true)
const heurisIndex = ref(0)
const preTestIndex = ref(null)
const items = ref([])
const idx = ref(0)
const fab = ref(false)
const res = ref(0)
const dialog = ref(false)
const calculatedProgress = ref(0)
const review = ref(true)
const rightView = ref(null)
const moderatedTestViewRef = ref(null)

const test = computed(() => store.getters.test)
const user = computed(() => {
  if (store.getters.user) setExistUser()
  return store.getters.user
})
const currentUserTestAnswer = computed(() => {
  if (test.value.testType === 'HEURISTICS') {
    return store.getters.currentUserTestAnswer
  }
  return {}
})
const showSaveBtn = computed(() => {
  if (currentUserTestAnswer.value.submitted) return false
  return true
})
const cooperators = computed(() => store.getters.cooperators)
const loading = computed(() => store.getters.loading)
const currentImageUrl = computed(() => store.state.Tests.currentImageUrl)

const startTest = () => {
  if (test.value.testStructure.length == 0) {
    store.commit('setError', {
      errorCode: 400,
      message: t('HeuristicsTestView.messages.noHeuristics'),
    })
    router.push('/managerview/' + test.value.id)
  }
  start.value = !start.value
}

const updateComment = (comment, heurisIndex, answerIndex) => {
  if (comment != '' && comment != undefined) {
    currentUserTestAnswer.value.heuristicQuestions[heurisIndex].heuristicQuestions[answerIndex].heuristicComment = comment
  } else {
    currentUserTestAnswer.value.heuristicQuestions[heurisIndex].heuristicQuestions[answerIndex].answerImageUrl = currentImageUrl.value
  }
}

const mappingSteps = () => {
  if (
    validate(test.value.testStructure) &&
    test.value.testStructure.length !== 0 &&
    test.value.testType == 'HEURISTICS'
  ) {
    items.value.push({
      title: 'HEURISTICS',
      icon: 'mdi-checkbox-marked-circle-outline',
      value: test.value.testStructure.map((option) => ({
        title: option.title,
        icon: 'mdi-checkbox-marked-circle-outline',
        done: false,
        total: option.total,
        id: option.id,
      })),
      id: 1,
    })
  }
}

const validate = (object) => {
  return object !== null && object !== undefined && object !== ''
}

const calculateProgress = () => {
  if (test.value.testType === 'HEURISTICS') {
    const total = currentUserTestAnswer.value.total
    let x = 0
    currentUserTestAnswer.value.heuristicQuestions.forEach((heuQ) => {
      heuQ.heuristicQuestions.forEach((question) => {
        if (
          question.heuristicAnswer !== '' &&
          Object.values(question.heuristicAnswer).length > 0
        ) {
          x++
        }
      })
    })
    const percent = ((100 * x) / total).toFixed(1)
    calculatedProgress.value = percent
    if (isNaN(calculatedProgress.value)) {
      calculatedProgress.value = 0
    }
  }
}

const perHeuristicProgress = (item) => {
  if (!item || !item.heuristicQuestions || !Array.isArray(item.heuristicQuestions)) {
    return 0
  }
  const value =
    (item.heuristicQuestions.filter(
      (q) =>
        q.heuristicAnswer !== '' &&
        Object.values(q.heuristicAnswer).length > 0,
    ).length * 100) / item.heuristicTotal
  return value.toFixed(1)
}

const saveAnswer = async () => {
  currentUserTestAnswer.value.progress = calculatedProgress.value
  await store.dispatch('saveTestAnswer', {
    data: currentUserTestAnswer.value,
    answerDocId: test.value.answersDocId,
    testType: test.value.testType,
  })
}

const submitAnswer = async () => {
  currentUserTestAnswer.value.submitted = true
  await saveAnswer()
  toast.success(t('alerts.genericSuccess'))
  router.push('/testslist')
}

const setExistUser = () => {
  noExistUser.value = false
}

const signOut = () => {
  store.dispatch('logout').then(() => {
    noExistUser.value = true
  })
}

const populateWithHeuristicQuestions = () => {
  if (test.value.testType === 'HEURISTICS') {
    let totalQuestions = 0
    if (currentUserTestAnswer.value.heuristicQuestions.length <= 0) {
      test.value.testStructure.forEach((heu) => {
        currentUserTestAnswer.value.heuristicQuestions.push(
          new Heuristic({
            heuristicTitle: heu.title,
            heuristicId: heu.id,
            heuristicQuestions: heu.questions.map(
              (h) =>
                new HeuristicQuestionAnswer({
                  heuristicId: h.id,
                  heuristicAnswer: null,
                  heuristicComment: '',
                  answerImageUrl: '',
                }),
            ),
            heuristicTotal: heu.total,
          }),
        )
        totalQuestions += heu.questions.length ?? 0
      })
      currentUserTestAnswer.value.total = totalQuestions
    }
  }
}

const setTest = async () => {
  logined.value = true
  await store.dispatch('getCurrentTestAnswerDoc')
  populateWithHeuristicQuestions()
}

const setReviewTrue = () => {
  review.value = true
}

const handleHeurisClick = (i) => {
  heurisIndex.value = i
  setReviewTrue()
}

watch(test, async () => {
  mappingSteps()
}, { deep: true })

watch(items, () => {
  if (items.value.length) {
    index.value = items.value[0].id
    if (items.value.find((obj) => obj.id == 0)) {
      preTestIndex.value = items.value[0].value[0].id
    }
  }
}, { deep: true })

watch(heurisIndex, () => {
  if (rightView.value) {
    rightView.value.scrollTop = 0
  }
})

watch(user, async () => {
  if (user.value) {
    noExistUser.value = false
    if (logined.value) setTest()
  }
}, { deep: true })

watch(calculatedProgress, (newVal) => {
  if (newVal == 100) {
    review.value = false
  }
})

onBeforeMount(async () => {
  if (route.params.token) {
    fromlink.value = true
  }

  await store.dispatch('getTest', { id: props.id })
  await store.dispatch('getCurrentTestAnswerDoc')
  populateWithHeuristicQuestions()
  calculateProgress()
})
</script>

<style scoped>
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
  word-wrap: break-word;
}
.description {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
  padding-top: 3%;
  padding-bottom: 3%;
}
.questions {
  display: flex;
  justify-content: space-around;
  align-items: center;
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
.right-view {
  transition: filter 0.3s ease;
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
.card-title {
  font-style: normal;
  font-weight: 300;
  font-size: 48px;
  line-height: 56px;
  margin-left: 12px;
  margin-bottom: 20px;
}
@media (max-width: 600px) {
  .subtitleView {
    font-size: 14px;
  }
  .optionSelect {
    transform: scale(0.875);
  }
  .right-view.mini {
    filter: blur(15px);
    width: 100%;
    z-index: -100;
  }
}
</style>