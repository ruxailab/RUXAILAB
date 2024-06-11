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
          <RadarChart :labels="chartLabels" :data="chartData" />
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
import Snackbar from '@/components/atoms/Snackbar'
import RadarChart from '@/components/atoms/RadarChart.vue'
import BarChart from '@/components/atoms/BarChart.vue'
import SummaryTable from '@/components/atoms/SummaryTable.vue'
import { mapGetters, mapActions } from 'vuex'

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
        { text: 'Angry', value: 'angry' },
        { text: 'Sad', value: 'sad' },
        { text: 'Happy', value: 'happy' },
        { text: 'Surprised', value: 'surprised' },
        { text: 'Fearful', value: 'fearful' },
        { text: 'Neutral', value: 'neutral' },
      ],
      collaborators: [
        { name: 'Name 1', attention: '25%', emotion: 'Annoyance', focus: '10 minutes' },
        { name: 'Name 2', attention: '25%', emotion: 'Confusion', focus: '10 minutes' },
        { name: 'Name 3', attention: '25%', emotion: 'Annoyance', focus: '10 minutes' },
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
      return this.formattedVideoAnalysisData.length > 0 ? Object.values(this.formattedVideoAnalysisData[0]) : []
    },
  },
  created() {
    const docId = this.$route.params.id
    this.fetchVideoAnalysisData("wN1xMuQpPNqebn8T6CoD")
  },
  methods: {
    ...mapActions('VideoAnalysis', ['fetchVideoAnalysisData']),
  },
}
</script>

<style scoped>
.v-card {
  background-color: rgb(253, 253, 253);
}
</style>
