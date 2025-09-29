<template>
  <div class="word-cloud">
    <h3 class="text-h6 mb-2">Word Cloud de la Transcripción</h3>
    <div v-if="words.length" class="cloud">
      <span v-for="(word, i) in words" :key="i" :style="wordStyle(word)">{{ word.text }}</span>
    </div>
    <div v-else class="text-grey">No hay datos de transcripción.</div>
  </div>
</template>

<script>
export default {
  name: 'TranscriptWordCloud',
  props: {
    transcript: {
      type: String,
      default: ''
    }
  },
  computed: {
    words() {
      if (!this.transcript) return [];
      const freq = {};
      this.transcript.split(/\s+/).forEach(w => {
        w = w.toLowerCase().replace(/[^\wáéíóúüñ]/g, '');
        if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
      });
      return Object.entries(freq).map(([text, count]) => ({ text, count })).sort((a, b) => b.count - a.count);
    }
  },
  methods: {
    wordStyle(word) {
      const size = 12 + word.count * 4;
      return {
        fontSize: `${size}px`,
        margin: '4px',
        color: '#1976D2',
        fontWeight: 'bold',
        display: 'inline-block',
      };
    }
  }
};
</script>

<style scoped>
.cloud {
  min-height: 80px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
