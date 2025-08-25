<template>
  <div>
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
            class="bg-error text-white ml-1"
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
            color="secondary-lighten-2"
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
            class="text-white bg-primary"
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
              style="color: #3f51b5"
              @click="signOut()"
            >{{
              $t('HeuristicsTestView.actions.changeAccount')
            }}</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container
      v-if="test && start"
      class="start-container"
      fluid
    >
      <v-row
        class="start-row fill-height"
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          md="6"
          sm="12"
          class="text-center text-md-left mb-4 mb-md-0"
        >
          <h1 class="text-h2 font-weight-light text-white mb-4">
            {{ test.testTitle }}
          </h1>
          <p
            class="text-body-1 text-white mb-6"
          >
            {{ test.testDescription }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            size="large"
            rounded
            :disabled="!user"
            @click="startTest()"
          >
            {{ $t('HeuristicsTestView.actions.startTest') }}
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          md="5"
          class="d-flex justify-center"
        >
          <v-img
            :src="require('../../../assets/BackgroundTestView.png')"
            cover
            max-width="80%"
            height="auto"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-card
      v-else
      height="100vh"
    >
      <v-layout class="fill-height">
        <v-navigation-drawer
          v-model="drawer"
          :rail="mini"
          permanent
          color="testPrimary"
        >
          <div
            v-if="!mini"
            class="pa-4"
          >
            <v-list-item>
              <v-row
                dense
                align="center"
              >
                <v-col
                  cols="8"
                  class="pa-0 pl-3"
                >
                  <text-clamp
                    class="text-h5 text-white text-truncate font-weight-bold"
                    :text="test.testTitle"
                    :max-lines="2"
                  />
                </v-col>
                <v-col
                  cols="4"
                  class="d-flex justify-end"
                >
                  <v-progress-circular
                    rotate="-90"
                    :model-value="calculatedProgress"
                    color="forth"
                    :size="50"
                    :width="5"
                  >
                    <div class="text-caption text-white">
                      {{ calculatedProgress }}%
                    </div>
                  </v-progress-circular>
                </v-col>
              </v-row>
            </v-list-item>
          </div>

          <v-list
            class="nav-list"
            density="compact"
          >
            <div
              v-for="(item, n) in items"
              :key="n"
            >
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
                        :active="heurisIndex == i"
                        @click="heurisIndex = i"
                      >
                        <template #prepend>
                          <v-progress-circular
                            v-if="perHeuristicProgress(currentUserTestAnswer.heuristicQuestions[i]) != 100"
                            rotate="-90"
                            :model-value="perHeuristicProgress(currentUserTestAnswer.heuristicQuestions[i])"
                            :size="24"
                            :width="3"
                            :color="heurisIndex == i ? 'white' : 'secondary'"
                          />
                          <v-icon
                            v-else
                            :color="heurisIndex == i ? 'white' : 'secondary'"
                          >
                            {{ heuris.icon }}
                          </v-icon>
                        </template>
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
                    :active="heurisIndex == i"
                    @click="handleHeurisClick(i)"
                  >
                    <template #prepend>
                      <v-progress-circular
                        v-if="perHeuristicProgress(currentUserTestAnswer.heuristicQuestions[i]) != 100"
                        rotate="-90"
                        :model-value="perHeuristicProgress(currentUserTestAnswer.heuristicQuestions[i])"
                        :size="24"
                        :width="3"
                        :color="heurisIndex == i ? 'white' : 'forth'"
                      />
                      <v-icon
                        v-else
                        :color="heurisIndex == i ? 'white' : 'forth'"
                      >
                        {{ heuris.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title
                      :class="heurisIndex == i ? 'text-white' : 'text-forth'"
                      class="pl-5"
                    >
                      {{ heuris.title }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="review == true && calculatedProgress == 100"
                    link
                    @click="review = false"
                  >
                    <template #prepend>
                      <v-icon color="forth">
                        mdi-send-circle-outline
                      </v-icon>
                    </template>
                    <v-list-item-title class="text-forth">
                      Submit
                    </v-list-item-title>
                  </v-list-item>
                </div>
              </v-list>

              <v-list-item
                v-else-if="item.id == 2"
                @click="index = item.id"
              >
                <template #prepend>
                  <v-icon :color="index == item.id ? 'white' : 'forth'">
                    {{ item.icon }}
                  </v-icon>
                </template>
                <v-list-item-title
                  :class="index == item.id ? 'text-white' : 'text-forth'"
                >
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </div>
          </v-list>

          <template #append>
            <v-row
              class="d-flex pb-10 pt-5 px-5"
              justify="end"
            >
              <v-btn
                size="small"
                icon
                class="bg-secondary"
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
            </v-row>
          </template>
        </v-navigation-drawer>

        <v-main
          ref="rightView"
          :class="{ 'main-content-shifted': !mini }"
          class="background-main px-20 py-4 transition-all"
        >
          <ShowInfo
            v-if="index == 1 && review == true"
            :title="test.testStructure[heurisIndex].title"
          >
            <template #content>
              <v-card-title class="text-h6 font-weight-regular text-primary">
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
                  <v-card class="elevation-2 px-10 py-5 mb-2">
                    <v-row class="mb-2">
                      <v-col cols="11">
                        <p class="text-body-1 font-weight-medium">
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
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </ShowInfo>

          <div v-if="calculatedProgress == 100 && review == false">
            <ShowInfo :title="$t('finishTest.title')">
              <template #content>
                <v-row
                  justify="center"
                  class="pa-4"
                >
                  <v-col
                    cols="11"
                    class="mt-3"
                  >
                    <v-card class="pa-10">
                      <v-row
                        justify="center"
                        class="text-h5 font-weight-bold text-testPrimary mb-2"
                      >
                        {{ $t('finishTest.finalMessage') }}!
                      </v-row>
                      <v-row
                        justify="center"
                        class="text-subtitle-1 text-ternary"
                      >
                        {{ $t('finishTest.congratulations') }}
                      </v-row>
                      <v-row
                        justify="center"
                        align="center"
                        class="mt-6"
                      >
                        <v-col
                          cols="12"
                          md="6"
                          class="text-center"
                        >
                          <img
                            draggable="false"
                            :src="require('../../../../public/finalMessage.svg')"
                            alt="Final test svg"
                            class="img-fluid"
                          >
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                          class="text-center text-md-left"
                        >
                          <div class="text-subtitle-1 text-ternary mb-4">
                            {{ $t('finishTest.submitMessage') }}
                          </div>
                          <v-btn
                            color="testPrimary"
                            variant="flat"
                            @click="dialog = true"
                          >
                            <v-icon start>
                              mdi-send
                            </v-icon>
                            {{ $t('buttons.submit') }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </template>
            </ShowInfo>
          </div>
        </v-main>
      </v-layout>
    </v-card>

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
            color="primary"
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
              color="secondary"
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
              color="success"
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
</template>

<script setup>
import { ref, computed, watch, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import AddCommentBtn from '@/components/atoms/AddCommentBtn.vue'
import HelpBtn from '@/components/atoms/QuestionHelpBtn.vue'
import TextClamp from 'vue3-text-clamp'
import Snackbar from '@/components/atoms/Snackbar.vue'
import HeuristicQuestionAnswer from '@/features/Heuristic/models/HeuristicQuestionAnswer'
import Heuristic from '@/features/Heuristic/models/Heuristic'

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

const test = computed(() => store.getters.test)
const user = computed(() => {
  if (store.getters.user) setExistUser()
  return store.getters.user
})
const currentUserTestAnswer = computed(() => {
  return store.getters.currentUserTestAnswer || {}
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
    test.value.testStructure.length !== 0
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
  if (!test.value) {
    return
  }
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
  if (!test.value) {
    return
  }
  let totalQuestions = 0
  if (currentUserTestAnswer.value.heuristicQuestions?.length <= 0) {
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
  if (
    currentUserTestAnswer.value?.heuristicQuestions &&
    Array.isArray(currentUserTestAnswer.value.heuristicQuestions)
  ) {
    calculateProgress()
  }
})
</script>

<style scoped>
.start-container {
  background: linear-gradient(134.16deg, #3f51b5 -13.6%, #283593 117.67%);
  height: 100vh;
}
.start-row {
  max-width: 1200px;
  margin: 0 auto;
}
.background-main {
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.main-content-shifted {
  padding-left: 256px !important; /* Vuetify's default drawer width */
}
.btn-fix:focus::before {
  opacity: 0 !important;
}
.nav-list::-webkit-scrollbar {
  width: 7px;
}
.nav-list::-webkit-scrollbar-track {
  background: none;
}
.nav-list::-webkit-scrollbar-thumb {
  background: #7986cb;
  border-radius: 4px;
}
.nav-list::-webkit-scrollbar-thumb:hover {
  background: #5c6bc0;
}
</style>