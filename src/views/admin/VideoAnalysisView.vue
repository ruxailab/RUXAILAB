<template>
  <v-container fluid>
    <Snackbar />
    <h1>{{ $t('titles.videoAnalysis') }}</h1>
    <v-row>
      <v-col cols="12">
        <SummaryTable :collaborators="collaborators" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="formattedVideoAnalysisData"
          :items-per-page="10"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <RadarChart :labels="chartLabels" :data="chartData" legend="Emotion Percentages" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <BarChart :labels="chartLabels" :data="chartData" legend="Emotions Data" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar';
import RadarChart from '@/components/atoms/RadarChart.vue';
import BarChart from '@/components/atoms/BarChart.vue';
import SummaryTable from '@/components/atoms/SummaryTable.vue';
import { mapGetters, mapActions } from 'vuex';

export default {
  components: {
    Snackbar,
    RadarChart,
    BarChart,
    SummaryTable,
  },
  data() {
    return {
      headers: [
        { text: 'Fragment', value: 'fragment' },
        { text: 'Angry', value: 'angry' },
        { text: 'Sad', value: 'sad' },
        { text: 'Happy', value: 'happy' },
        { text: 'Surprised', value: 'surprised' },
        { text: 'Fearful', value: 'fearful' },
        { text: 'Neutral', value: 'neutral' },
      ],
      collaborators: [
        { name: 'Name 1', attention: '25%', emotion: 'Happy'},
      ],
    };
  },
  computed: {
    ...mapGetters('VideoAnalysis', {
      videoAnalysisData: 'videoAnalysisData',
    }),
    formattedVideoAnalysisData() {
      return this.videoAnalysisData.reduce((acc, item) => {
        Object.keys(item).forEach(fragmentKey => {
          const fragment = item[fragmentKey];
          acc.push({
            fragment: fragmentKey,
            angry: fragment.Angry || 0,
            sad: fragment.Sad || 0,
            happy: fragment.Happy || 0,
            surprised: fragment.Surprised || 0,
            fearful: fragment.Fearful || 0,
            neutral: fragment.Neutral || 0,
          });
        });
        return acc;
      }, []);
    },
    globalEmotionData() {
      const totals = this.videoAnalysisData.reduce((acc, item) => {
        Object.keys(item).forEach(fragmentKey => {
          const fragment = item[fragmentKey];
          acc.angry += fragment.Angry || 0;
          acc.sad += fragment.Sad || 0;
          acc.happy += fragment.Happy || 0;
          acc.surprised += fragment.Surprised || 0;
          acc.fearful += fragment.Fearful || 0;
          acc.neutral += fragment.Neutral || 0;
          acc.count += 1;
        });
        return acc;
      }, {
        angry: 0,
        sad: 0,
        happy: 0,
        surprised: 0,
        fearful: 0,
        neutral: 0,
        count: 0,
      });

      return {
        angry: totals.angry / totals.count,
        sad: totals.sad / totals.count,
        happy: totals.happy / totals.count,
        surprised: totals.surprised / totals.count,
        fearful: totals.fearful / totals.count,
        neutral: totals.neutral / totals.count,
      };
    },
    chartLabels() {
      return ['Angry', 'Sad', 'Happy', 'Surprised', 'Fearful', 'Neutral'];
    },
    chartData() {
      const data = this.globalEmotionData;
      return [data.angry, data.sad, data.happy, data.surprised, data.fearful, data.neutral];
    },
  },
  created() {
    const docId = this.$route.params.id;
    this.fetchVideoAnalysisData(docId);
  },
  methods: {
    ...mapActions('VideoAnalysis', ['fetchVideoAnalysisData']),
  },
};
</script>
