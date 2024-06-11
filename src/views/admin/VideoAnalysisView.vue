<template>
  <v-container fluid>
    <Snackbar />
    <h1>{{ $t('titles.videoAnalysis') }}</h1>
    <v-row>
      <v-col cols="12">
        <!-- Collaborator Info Section -->
        <v-card class="mb-4 pa-3">
          <v-row>
            <v-col cols="3" class="text-center">
              <strong>COLLABORATOR</strong>
              <div>Name 1</div>
            </v-col>
            <v-col cols="3" class="text-center">
              <strong>AVG ATTENTION</strong>
              <div>25%</div>
            </v-col>
            <v-col cols="3" class="text-center">
              <strong>DOMINANT EMOTION</strong>
              <div>Annoyance</div>
            </v-col>
            <v-col cols="3" class="text-center">
              <strong>CONTINUED FOCUS</strong>
              <div>10 minutes</div>
            </v-col>
          </v-row>
        </v-card>
        
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
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    Snackbar,
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
