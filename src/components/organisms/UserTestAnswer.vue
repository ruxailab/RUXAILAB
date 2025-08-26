<template>
  <div>
    <v-overlay :model-value="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <IntroAnswer v-if="intro" @go-to-coops="goToCoops" />
    <v-row v-else-if="hasAnswers" justify="center" class="ma-0">
      <ShowInfo hideCol="true">
        <!-- Main Tabs -->
        <template #top>
          <v-tabs v-model="tab" bg-color="transparent" color="#FCA326">
            <v-tab @click="tab = 0">
              General Analytics
            </v-tab>
            <v-tab @click="tab = 1">
              Individual Analytics
            </v-tab>
            <v-tab @click="tab = 2">
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
          </v-tabs>
        </template>

        <template #content>
          <div>
            <GeneralAnalytics v-if="tab === 0" />
            <AnalyticsView v-if="tab === 1" />
            <SentimentAnalysisView v-if="tab === 2" />
            <SusAnalytics v-if="tab === 3" />
            <NasaTlxAnalytics v-if="tab === 4" />
            <EyeTrackingAnalytics :iris-data="allIrisTrackingData" v-if="tab === 5" />
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
import { statistics } from '@/utils/statistics';
import ShowInfo from '@/components/organisms/ShowInfo';
import IntroAnswer from '@/components/molecules/IntroAnswer';
import AnalyticsView from '@/views/admin/AnalyticsView.vue';
import GeneralAnalytics from '@/components/organisms/UnmoderatedTestAnalytics/GeneralAnalytics.vue';
import SentimentAnalysisView from '@/components/organisms/UnmoderatedTestAnalytics/SentimentAnalysisView.vue';
import SusAnalytics from '@/components/organisms/UnmoderatedTestAnalytics/SusAnalytics.vue';
import NasaTlxAnalytics from '@/components/organisms/UnmoderatedTestAnalytics/NasaTlxAnalytics.vue';
import EyeTrackingAnalytics from '@/views/admin/EyeTrackingAnalytics.vue';

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

const testStructure = computed(() => store.state.Tests.Test.testStructure);

const answers = computed(() =>
  testAnswerDocument.value
    ? Object.values(testAnswerDocument.value)
    : []
);

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


const loading = computed(() => store.getters.loading);

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