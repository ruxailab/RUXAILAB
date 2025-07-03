<template>
  <div class="selection-box mt-0 py-0">
    <h2>{{ $t('pages.finalReport.select') }}</h2>
    <div class="pt-2">
      <v-row>
        <v-col>
          <div v-if="heuristics.length !== 0">
            {{ $t('pages.finalReport.heuristic') + 's:' }}

            <div class="pb-4 mt-1">
              <div v-for="heuristic in heuristics" :key="heuristic.id" class="option">
                <input :id="'heuristic' + heuristic.id" v-model="selectedHeuristics" type="checkbox"
                  :name="heuristic.name" :value="heuristic.id" style="margin-right: 10px;">
                <label :for="'heuristic' + heuristic.id">
                  {{ heuristic.id + 1 }} - {{ heuristic.title }}
                </label>
              </div>
            </div>
          </div>
          <div v-else class="column with-border">
            <div style="margin-top: 10%">
              {{ $t('pages.finalReport.createHeuristics') }}
            </div>
          </div>
        </v-col>
        <v-col>
          <div class="column with-margin">
            {{ $t('pages.finalReport.elements') + ':' }}
            <div v-for="option in options" :key="option.id" class="option">
              <input :id="option.id" type="checkbox" :name="option.name" style="margin-right: 10px;">
              <label class="option" :for="option.id">{{ option.label }}</label>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-row class="ma-0" justify="space-between">
      <v-btn class="teste2" color="blue-grey-darken-3" elevation="0" @click="$emit('return-step')">
        {{ $t('buttons.previous') }}
      </v-btn>
      <v-btn :disabled="isLoading" class="" color="orange" @click="submitPdf">
        <span v-if="!isLoading">{{ $t('pages.finalReport.pdf') }}</span>
        <span v-else>{{ $t('pages.finalReport.options.loading') }}</span>
      </v-btn>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { finalResult, standardDeviation, statistics } from '@/utils/statistics';

// Vuex store
const store = useStore();

// Vue I18n
const { t } = useI18n();

// Emits
const emit = defineEmits(['return-step']);

// Reactive state
const preview = ref({});
const formattedDate = ref('');
const statisticsData = ref('');
const currentHeuristicIndex = ref(0);
const showSlider = ref(false);
const sliderValue = ref(0);
const isLoading = ref(false);
const selectedHeuristics = ref([]);
const cooperatorsEmail = ref([]);

// Computed properties
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument);

const answers = computed(() => {
  if (testAnswerDocument.value) {
    return testAnswerDocument.value.type === 'HEURISTICS'
      ? Object.values(testAnswerDocument.value.heuristicAnswers)
      : Object.values(testAnswerDocument.value.taskAnswers);
  }
  return [];
});

const test = computed(() => store.getters.test);

const heuristics = computed(() => test.value.testStructure);

const options = computed(() => [
  {
    id: 'options',
    name: 'options',
    label: t('pages.finalReport.options.options'),
  },
  {
    id: 'comments',
    name: 'comments',
    label: t('pages.finalReport.options.comments'),
  },
  {
    id: 'results',
    name: 'results',
    label: t('pages.finalReport.options.statistics'),
  },
  {
    id: 'evaluators-results',
    name: 'evaluators-results',
    label: t('pages.finalReport.options.answersByEvaluator'),
  },
  {
    id: 'finalReport',
    name: 'finalReport',
    label: t('pages.finalReport.options.finalReport'),
  },
]);

// Statistics Results
const resultEvaluator = ref(statistics());

const heuristicsStatistics = computed(() => {
  const table = {
    header: [
      { title: 'HEURISTICS', align: 'start', sortable: false, value: 'name' },
      { title: 'Percentage (%)', value: 'percentage', align: 'center', sortable: false },
      { title: 'Standard deviation', value: 'sd', align: 'center', sortable: false },
      { title: 'Average', value: 'average', align: 'center', sortable: false },
      { title: 'Max', value: 'max', align: 'center', sortable: false },
      { title: 'Min', value: 'min', align: 'center', sortable: false },
    ],
    items: [],
  };

  if (!heuristicsEvaluator.value || !heuristicsEvaluator.value.items) {
    return table;
  }

  heuristicsEvaluator.value.items.forEach((item) => {
    const results = Object.entries(item)
      .filter(([key]) => key.includes('Ev'))
      .map(([, value]) => value)
      .filter((value) => value !== undefined && value !== null);
    const valueToConvert = results.length
      ? results.reduce((total, value) => total + value / results.length, 0).toFixed(2)
      : '0.00';
    const convertedValue = item.max && item.min && item.max !== item.min
      ? ((valueToConvert - item.min) / (item.max - item.min)) * 100
      : 0;
    table.items.push({
      name: item.heuristic || 'Unknown',
      max: item.max ? Number(item.max).toFixed(2) : '0.00',
      min: item.min ? Number(item.min).toFixed(2) : '0.00',
      percentage: convertedValue.toFixed(2),
      sd: results.length ? standardDeviation(results).toFixed(2) : '0.00',
      average: valueToConvert,
    });
  });

  return table;
});

const heuristicsEvaluator = computed(() => {
  const table = {
    header: [{ title: 'HEURISTICS', align: 'start', value: 'heuristic' }],
    items: [],
  };
  const options = test.value && test.value.testOptions ? test.value.testOptions.map((op) => op.value) : [];
  const max = options.length > 0 ? Math.max(...options) : 0;
  const min = options.length > 0 ? Math.min(...options) : 0;

  if (resultEvaluator.value && Array.isArray(resultEvaluator.value)) {
    let evaluatorIndex = 1;
    resultEvaluator.value.forEach((evaluator) => {
      evaluator.id = `Ev${evaluatorIndex}`;
      const header = table.header.find((h) => h.text === evaluator.id);
      if (!header) {
        table.header.push({
          text: evaluator.id,
          align: 'center',
          value: evaluator.id,
        });
      }
      if (evaluator.heuristics && Array.isArray(evaluator.heuristics)) {
        evaluator.heuristics.forEach((heuristic) => {
          const item = table.items.find((i) => i.heuristic === heuristic.id);
          if (item) {
            Object.assign(item, {
              [evaluator.id]: heuristic.result,
            });
          } else {
            table.items.push({
              heuristic: heuristic.id,
              max: max * (heuristic.totalQuestions || 0),
              min: min * (heuristic.totalQuestions || 0),
              [evaluator.id]: heuristic.result,
            });
          }
        });
      }
      evaluatorIndex++;
    });
  }
  return table;
});

// Methods
const checkHeuristicsSlider = () => {
  const container = document.querySelector('.column');
  if (container) {
    const containerWidth = container.offsetWidth;
    const heuristicWidth = 200;
    showSlider.value = heuristics.value.length * heuristicWidth > containerWidth;
  }
};

const genPreview = async () => {
  const options = document.getElementById('options');
  const comments = document.getElementById('comments');
  const results = document.getElementById('results');
  const finalReport = document.getElementById('finalReport');
  const evaluatorsResults = document.getElementById('evaluators-results');

  preview.value.testOptions = options.checked ? test.value.testOptions : '';
  preview.value.testComments = comments.checked;
  preview.value.results = results.checked ? test.value.answersDocId : '';
  preview.value.statistics = evaluatorsResults.checked;
  preview.value.finalReport = finalReport.checked ? test.value.finalReport : undefined;
};

const submitPdf = async () => {
  isLoading.value = true;

  try {
    await genPreview();
    const date = new Date();
    const dayOfMonth = date.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    let dayOfMonthStr;
    switch (dayOfMonth) {
      case 1:
      case 21:
      case 31:
        dayOfMonthStr = dayOfMonth + 'st';
        break;
      case 2:
      case 22:
        dayOfMonthStr = dayOfMonth + 'nd';
        break;
      case 3:
      case 23:
        dayOfMonthStr = dayOfMonth + 'rd';
        break;
      default:
        dayOfMonthStr = dayOfMonth + 'th';
    }

    formattedDate.value = `${dayOfMonthStr} ${monthName}, ${year}`;
    statisticsData.value = finalResult();

    if (test.value.cooperators && Array.isArray(test.value.cooperators)) {
      if (test.value.cooperators.length > 0) {
        cooperatorsEmail.value = test.value.cooperators
          .filter((element) => element && element.email)
          .map((element) => element.email);
        preview.value.cooperatorsEmail = cooperatorsEmail.value;
        cooperatorsEmail.value = [];
      } else {
        console.log('cooperators email not empty');
      }
    } else {
      preview.value.cooperatorsEmail = '';
    }

    const response = await axios.post(
      process.env.VUE_APP_LARAVEL_PDF,
      {
        items: [
          {
            title: test.value.testTitle,
            date: formattedDate.value,
            creationDate: test.value.creationDate,
            testDescription: test.value.testDescription,
            cooperatorsEmail: preview.value.cooperatorsEmail,
            creatorEmail: test.value.testAdmin.email,
            finalReport: test.value.finalReport,
            allOptions: preview.value.testOptions,
            allAnswers: answers.value,
            testStructure: test.value.testStructure,
            selectedHeuristics: selectedHeuristics.value,
            statistics: preview.value.statistics,
            statisticsByEvaluatorAnswer: heuristicsEvaluator.value,
            statisticsByHeuristics: heuristicsStatistics.value,
            gstatistics: statisticsData.value,
            statisticstable: store.state.Answer.evaluatorStatistics,
            heuristicStatistics: preview.value.heuristicEvaluator,
            testComments: preview.value.testComments,
          },
        ],
      },
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'heuristic-test.pdf');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await store.dispatch('getTest', { id: test.value.id })
  checkHeuristicsSlider();
});
</script>