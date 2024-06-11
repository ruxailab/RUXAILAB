<template>
    <v-container fluid>
      <Snackbar />
      <v-row>
        <v-col cols="12">
          <h1>{{ $t('titles.videoAnalysis') }}</h1>
          <v-data-table
            :headers="headers"
            :items="videoAnalysisData"
            :items-per-page="10"
            class="elevation-1"
          >
            <template v-slot:item.fragment1="{ item }">
              <div v-for="(value, key) in item.fragment1" :key="key">
                {{ key }}: {{ value }}
              </div>
            </template>
            <template v-slot:item.timestamp="{ item }">
              <div>{{ formatDate(item.timestamp) }}</div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import Snackbar from '@/components/atoms/Snackbar';
  import { mapGetters, mapActions } from 'vuex';
  
  export default {
    components: {
      Snackbar,
    },
    data() {
      return {
        headers: [
          { text: 'Fragment 1', value: 'fragment1' },
          { text: 'Timestamp', value: 'timestamp' },
        ],
      };
    },
    computed: {
      ...mapGetters('VideoAnalysis', {
        videoAnalysisData: 'videoAnalysisData',
      }),
    },
    created() {
      const docId = this.$route.params.id; 
      this.fetchVideoAnalysisData("SYi7BjCzhQEqeqeOIIjm");
    },
    methods: {
      ...mapActions('VideoAnalysis', ['fetchVideoAnalysisData']),
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString();
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  