<template>
  <div>
    <v-overlay :model-value="loading">
      <v-progress-circular
        indeterminate
        size="64"
      />
    </v-overlay>
    <IntroAnswer
      v-if="intro"
      @go-to-coops="goToCoops"
    />
    <v-row
      v-else-if="hasAnswers"
      justify="center"
      class="ma-0 mt-4"
    >
      <ShowInfo title="Answers">
        <!-- Main Tabs -->
        <template #top>
          <v-tabs
            v-model="tab"
            bg-color="transparent"
            color="#FCA326"
            class="ml-4"
          >
            <v-tab @click="tab = 0">
              General Analytics
            </v-tab>
            <v-tab @click="tab = 1">
              Individual Analytics
            </v-tab>
            <v-tab @click="tab = 2">
              Sentiment Analysis
            </v-tab>
          </v-tabs>
        </template>

        <template #content>
          <div
            style="background-color: #E8EAF2;"
            class="ma-0 pa-0"
          >
            <GeneralAnalytics v-if="tab === 0" />
            <AnalyticsView v-if="tab === 1" />
            <SentimentAnalysisView v-if="tab === 2" />
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
import ShowInfo from '@/components/organisms/ShowInfo';
import IntroAnswer from '@/components/molecules/IntroAnswer';
import AnalyticsView from '@/views/admin/AnalyticsView.vue';
import GeneralAnalytics from '@/components/organisms/GeneralAnalytics.vue';
import SentimentAnalysisView from '@/views/admin/SentimentAnalysisView.vue';
import { standardDeviation, finalResult, statistics } from '@/utils/statistics';

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
const resultEvaluator = statistics();

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument);

const answers = computed(() => 
  testAnswerDocument.value
    ? Object.values(testAnswerDocument.value)
    : []
);

const hasAnswers = computed(() => 
  testAnswerDocument.value &&
  Object.keys(testAnswerDocument.value.taskAnswers).length > 0
);

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