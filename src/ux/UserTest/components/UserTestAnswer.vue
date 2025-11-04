<template>
  <div>
    <IntroAnswer v-if="intro" @go-to-coops="goToCoops" />
    <v-row v-else-if="hasAnswers" justify="center" class="ma-0">
      <ShowInfo hide-col="true">
        <!-- Main Tabs -->
        <template #top>
          <v-tabs v-model="tab" bg-color="transparent" color="#FCA326">
            <v-tab @click="tab = 0">
              General Analytics
            </v-tab>
            <v-tab @click="tab = 1">
              Individual Analytics
            </v-tab>
            <v-tab v-if="showSentiment" @click="tab = 2">
              Sentiment Analysis
            </v-tab>
            <v-tab v-if="showSUS" @click="tab = 3">
              SUS Analytics
            </v-tab>
            <v-tab v-if="showNasa" @click="tab = 4">
              Nasa-TLX Analytics
            </v-tab>
            <v-tab v-if="showEye" @click="tab = 5">
              Eye-Tracking Analytics
            </v-tab>
            <v-tab v-if="showTranscription" @click="tab = 6">
              Transcriptions
            </v-tab>
          </v-tabs>
        </template>

        <template #content>
          <div class="ma-0 pa-0">
            <GeneralAnalytics v-if="tab === 0" />
            <UserAnalytics v-if="tab === 1" />
            <SentimentAnalysisView v-if="tab === 2" />
            <SusAnalytics v-if="tab === 3" />
            <NasaTlxAnalytics v-if="tab === 4" />
            <EyeTrackingAnalytics :iris-data="allIrisTrackingData" v-if="tab === 5" />
            <TranscriptionTool v-if="tab === 6" />
          </div>
        </template>
      </ShowInfo>
    </v-row>
    <div v-else>
      <IntroAnswer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { statistics } from '@/ux/Heuristic/utils/statistics';
import ShowInfo from '@/shared/components/ShowInfo.vue';
import IntroAnswer from '@/shared/components/introduction_cards/IntroAnswer';
import UserAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/UserAnalytics.vue';
import GeneralAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/GeneralAnalytics.vue';
import SentimentAnalysisView from './UnmoderatedTestAnalytics/SentimentAnalysisView.vue';
import SusAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/SusAnalytics.vue';
import NasaTlxAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/NasaTlxAnalytics.vue';
import EyeTrackingAnalytics from '@/ux/Heuristic/views/EyeTrackingAnalytics.vue';
import TranscriptionTool from '@/ux/UserTest/components/ModeratedTestAnalytics/TranscriptionTool.vue';
import { STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions';

defineProps({
  id: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['goToCoops']);

const store = useStore();

const tab = ref(0);
const ind = ref(0);
const intro = ref(null);

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument);
const study = computed(() => store.state.Tests.Test);
const testStructure = computed(() => store.state.Tests.Test.testStructure);

const hasAnswers = computed(() => {
  const answers = testAnswerDocument.value?.taskAnswers;
  return answers && Object.keys(answers).length > 0;
});


const showSUS = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false;
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'sus'
  );
});

const showNasa = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false;
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'nasa-tlx'
  );
});

const showSentiment = computed(() => {
  if (study.value.testType == STUDY_TYPES.USER && study.value.subType == USER_STUDY_SUBTYPES.MODERATED) {
    return true
  }
  return false
})

const showTranscription = computed(() => {
  if (study.value.testType == STUDY_TYPES.USER && study.value.subType == USER_STUDY_SUBTYPES.MODERATED) {
    return true
  }
  return false
})

const showEye = computed(() =>
  testAnswerDocument.value &&
  testAnswerDocument.value.type === 'User' &&
  Object.values(testAnswerDocument.value.taskAnswers).some(ev =>
    Object.values(ev.tasks).some(task =>
      task.irisTrackingData.length > 0
    )
  )
);

const allIrisTrackingData = computed(() => {
  if (!testAnswerDocument.value || !testAnswerDocument.value.taskAnswers) return [];

  const tasks = Object.values(testAnswerDocument.value.taskAnswers)
    .flatMap(ev => Object.values(ev.tasks || {}))
    .filter(task => task.irisTrackingData && task.irisTrackingData.length > 0)
    .flatMap(task => task.irisTrackingData);

  return tasks;
});

const goToCoops = () => {
  emit('goToCoops');
};

watch(hasAnswers, (newValue) => {
  if (newValue) {
    statistics();
    intro.value = false;
  } else {
    intro.value = true;
  }
});

watch(() => ind.value, () => {
  ind.value = 0;
});

onMounted(async () => {
  await store.dispatch('getCurrentTestAnswerDoc');
});
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
