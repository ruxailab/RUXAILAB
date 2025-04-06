<template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h2>Heatmap Dashboard</h2>
          <!-- If you have any other UI or instructions, place them here -->
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <!-- Insert the HeatmapIntegration component -->
          <HeatmapIntegration />
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import HeatmapIntegration from '@/components/HeatmapIntegration.vue'
  
  export default {
    name: 'DashboardView',
    components: {
      HeatmapIntegration,
    }
  }
  </script>
  
  <style scoped>
  /* Optional styling for your dashboard */
  </style>
  