<template>
  <div>
    <IntroAnswer v-if="intro" @go-to-coops="goToCoops" />
    <v-row v-else-if="hasAnswers" justify="center" class="ma-0">
      <ShowInfo :hide-col="true">
        <!-- Main Tabs -->
        <template #top>
          <v-tabs
            v-model="tab"
            bg-color="transparent"
            color="#FCA326"
            slider-size="4"
          >
            <v-tab value="0">
              {{ $t('analytics.generalAnalytics') }}
            </v-tab>
            <v-tab value="1">
              {{ $t('analytics.individualAnalytics') }}
            </v-tab>
            <v-tab v-if="showSentiment" value="2"> Sentiment Analysis </v-tab>
            <v-tab v-if="showSUS" value="3">
              {{ $t('analytics.susAnalytics') }}
            </v-tab>
            <v-tab v-if="showNasa" value="4">
              {{ $t('analytics.nasaTlxAnalytics') }}
            </v-tab>
            <v-tab v-if="showTAM" value="5"> TAM Analytics </v-tab>
            <v-tab v-if="showSart" value="6">
              {{ $t('analytics.sartAnalytics') }}
            </v-tab>
            <v-tab v-if="showEye" value="7">
              {{ $t('analytics.eyeTrackingAnalytics') }}
            </v-tab>
            <v-tab v-if="showTranscription" value="8">
              {{ $t('analytics.transcriptions') }}
            </v-tab>
          </v-tabs>
        </template>

        <template #content>
          <div class="ma-0 pa-0">
            <GeneralAnalytics v-if="tab === '0'" />
            <UserAnalytics v-if="tab === '1'" />
            <SentimentAnalysisView v-if="tab === '2'" />
            <SusAnalytics v-if="tab === '3'" />
            <NasaTlxAnalytics v-if="tab === '4'" />
            <TamAnalytics v-if="tab === '5'" />
            <SartAnalytics v-if="tab === '6'" />
            <div v-if="tab === '7'" style="height: 100%; overflow-y: auto">
              <!-- Eye Tracking content would go here -->
            </div>
            <TranscriptionTool v-if="tab === '8'" />
          </div>
        </template>
      </ShowInfo>
    </v-row>
    <div v-else>
      <IntroAnswer @go-to-coops="goToCoops" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { statistics } from '@/ux/Heuristic/utils/statistics'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import IntroAnswer from '@/shared/components/introduction_cards/IntroAnswer'
import UserAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/UserAnalytics.vue'
import GeneralAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/GeneralAnalytics.vue'
import SentimentAnalysisView from './UnmoderatedTestAnalytics/SentimentAnalysisView.vue'
import SusAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/SusAnalytics.vue'
import NasaTlxAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/NasaTlxAnalytics.vue'
import TamAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/TamAnalytics.vue'
import SartAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/SartAnalytics.vue'
import TranscriptionTool from '@/ux/UserTest/components/ModeratedTestAnalytics/TranscriptionTool.vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  id: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['goToCoops'])

const store = useStore()
const router = useRouter()

const tab = ref(0)
const ind = ref(0)
const intro = ref(null)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)
const study = computed(() => store.getters.test || {})
const testStructure = computed(() => store.getters.test?.testStructure || {})

const hasAnswers = computed(() => {
  const answers = testAnswerDocument.value?.taskAnswers
  return answers && Object.keys(answers).length > 0
})

const showSUS = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'sus',
  )
})

const showNasa = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'nasa-tlx',
  )
})

const showTAM = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some((task) =>
    ['tam-1', 'tam-2', 'tam-3'].includes(task.taskType),
  )
})

const showSart = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'sart',
  )
})

const showSentiment = computed(() => {
  if (
    study.value.testType == STUDY_TYPES.USER &&
    study.value.subType == USER_STUDY_SUBTYPES.MODERATED
  ) {
    return true
  }
  return false
})

const showTranscription = computed(() => {
  if (
    study.value.testType == STUDY_TYPES.USER &&
    study.value.subType == USER_STUDY_SUBTYPES.MODERATED
  ) {
    return true
  }
  return false
})

const showEye = computed(
  () =>
    testAnswerDocument.value &&
    testAnswerDocument.value.type === 'User' &&
    Object.values(testAnswerDocument.value.taskAnswers).some((ev) =>
      Object.values(ev.tasks).some((task) => task.irisTrackingData.length > 0),
    ),
)

const goToCoops = () => {
  if (!study.value?.id) return

  const isModerated = study.value.subType === 'Moderated'
  const routeBase = isModerated
    ? '/userTest/moderated'
    : '/userTest/unmoderated'

  router.push(`${routeBase}/edit/${study.value.id}`)
  emit('goToCoops')
}

watch(hasAnswers, (newValue) => {
  if (newValue) {
    statistics()
    intro.value = false
  } else {
    intro.value = true
  }
})

watch(
  () => ind.value,
  () => {
    ind.value = 0
  },
)

onMounted(async () => {
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>

<style scoped>
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
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

.scroll {
  overflow-y: auto;
  overflow-x: hidden;
}

.cardStyle {
  background-color: transparent;
  border: 0.2px solid rgba(0, 0, 0, 0.25);
}

.cardAnswers {
  background: #e6e4e4;
  border-radius: 34px;
}

.tab-text {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: center;
  color: #000000;
}

.container {
  height: 400px;
  padding: 0px;
  margin: 0px 10px 0px;
}

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

.v-chip {
  min-width: 50px;
  justify-content: center;
}
</style>
