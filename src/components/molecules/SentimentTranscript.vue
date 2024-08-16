<template>
    <v-container>
      SentimentTranscript  
    </v-container>
</template>


<script>
export default {
  props: {

    sentiment: {
      type: "POS"| "NEG" | "NEU",
      default: '',
    },
    confidence: {
      type: Number,
      default: 0,
    },
   
  },
}
</script>



<style scoped>

</style>