<template>
  <div class="sentiment-summary">
    <h3 class="text-h6 mb-2">Resumen de Sentimiento</h3>
    <div v-if="mainSentiment">
      <v-chip color="primary" class="mb-2">{{ mainSentiment }}</v-chip>
      <div class="text-caption">Sentimiento predominante en la sesión</div>
    </div>
    <div v-else class="text-grey">No hay datos de análisis sentimental.</div>
  </div>
</template>

<script>
export default {
  name: 'SentimentSummary',
  props: {
    sentiments: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    mainSentiment() {
      if (!this.sentiments.length) return '';
      const freq = {};
      this.sentiments.forEach(s => { freq[s] = (freq[s] || 0) + 1; });
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    }
  }
};
</script>

<style scoped>
.sentiment-summary {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
}
</style>
