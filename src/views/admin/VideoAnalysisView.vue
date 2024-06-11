<!-- src/views/admin/VideoAnalysisView.vue -->
<template>
  <v-container fluid>
    <Snackbar />
    <h1>{{ $t('titles.videoAnalysis') }}</h1>
    <SummaryTable />
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
      <v-col cols="6">
        <v-card class="pa-3">
          <RadarChart :labels="chartLabels" :data="chartData" />
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card class="pa-3">
          <BarChart :labels="chartLabels" :data="chartData" legend="Emotions Data" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Importing components
import Snackbar from '@/components/atoms/Snackbar'
import SummaryTable from '@/components/atoms/SummaryTable.vue'
import RadarChart from '@/components/atoms/RadarChart.vue'
import BarChart from '@/components/atoms/BarChart.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    Snackbar,
    SummaryTable,
    RadarChart,
    BarChart,
  },
  data() {
    return {
      headers: [
        { text: 'Angry', value: 'angry' },
        { text: 'Sad', value: 'sad' },
        { text: 'Happy', value: 'happy' },
        { text: 'Surprised', value: 'surprised' },
        { text: 'Fearful', value: 'fearful' },
        { text: 'Neutral', value: 'neutral' },
      ],
    }
  },
  computed: {
    ...mapGetters('VideoAnalysis', {
      videoAnalysisData: 'videoAnalysisData',
    }),
    formattedVideoAnalysisData() {
      return this.videoAnalysisData.map(item => {
        const fragment = item.fragment1 || {};
        return {
          angry: fragment.Angry || 0,
          sad: fragment.Sad || 0,
          happy: fragment.Happy || 0,
          surprised: fragment.Surprised || 0,
          fearful: fragment.Fearful || 0,
          neutral: fragment.Neutral || 0,
        };
      });
    },
    chartLabels() {
      return this.formattedVideoAnalysisData.length > 0 ? Object.keys(this.formattedVideoAnalysisData[0]) : []
    },
    chartData() {
      return this.formattedVideoAnalysisData.reduce((acc, curr) => {
        Object.keys(curr).forEach(key => {
          acc[key] = (acc[key] || 0) + curr[key];
        });
        return acc;
      }, {});
    },
  },
  created() {
    const docId = this.$route.params.id
    this.fetchVideoAnalysisData(docId)
  },
  methods: {
    ...mapActions('VideoAnalysis', ['fetchVideoAnalysisData']),
  },
}
</script>

<style scoped>
.v-card {
  background-color: rgb(253, 253, 253);
  border: 1px solid #f4b700;
}
</style>
