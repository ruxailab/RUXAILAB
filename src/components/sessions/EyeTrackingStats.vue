<template>
  <div class="eye-tracking-stats">
    <h3 class="text-h6 mb-2">Eye Tracking Accuracy</h3>
    <v-row>
      <v-col cols="6">
        <v-card class="pa-2" outlined>
          <div class="text-caption">Accuracy</div>
          <div class="text-h5 font-weight-bold">{{ accuracy }}%</div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card class="pa-2" outlined>
          <div class="text-caption">Fixations</div>
          <div class="text-h5 font-weight-bold">{{ fixations }}</div>
        </v-card>
      </v-col>
    </v-row>
    <div v-if="!accuracy && !fixations" class="text-grey mt-2">No hay datos de eye tracking.</div>
  </div>
</template>

<script>
export default {
  name: 'EyeTrackingStats',
  props: {
    accuracy: {
      type: Number,
      default: 0
    },
    fixations: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.eye-tracking-stats {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
}
</style>
