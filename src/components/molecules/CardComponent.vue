<template>
  <v-card hover color="white" :height="height" @click="handleClick">
    <v-row>
      <v-sheet class="ml-8 mt-6 mb-10 insideCards" height="50" width="50">
        <v-img class="ma-2" style="z-index: 0;" :src="imageSrc"></v-img>
      </v-sheet>
      <div class="mt-6">
        <span class="cardsTitle ml-4">{{ title }}</span>
        <br />
        <span class="cardSubtitle ml-4">{{ subtitle }}</span>
      </div>
    </v-row>
    <v-divider></v-divider>
    <v-row class="mt-1">
      <v-sheet class="ml-10 mt-8 mb-8 circle" height="20" width="20"></v-sheet>
      <span class="cardInternTitles ml-3 mt-8">{{ feature1 }}</span>
    </v-row>
    <v-row>
      <v-sheet class="ml-10 mb-8 circle" height="20" width="20"></v-sheet>
      <span class="cardInternTitles ml-3">{{ feature2 }}</span>
    </v-row>
    <v-row>
      <v-sheet class="ml-10 mb-8 circle" height="20" width="20"></v-sheet>
      <span class="cardInternTitles ml-3">{{ feature3 }}</span>
    </v-row>
  </v-card>
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    feature1: {
      type: String,
      required: true,
    },
    feature2: {
      type: String,
      required: true,
    },
    feature3: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
    handleClick: {
      type: Function,
      required: true,
    },
  },
}
</script>

<style scoped>
.cardsTitle {
  font-family: 'Poppins', Helvetica;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  max-height: 23px;
  background-color: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-family: 'Poppins', Helvetica;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardInternTitles {
  max-width: 270px;
  font-family: 'Poppins', Helvetica;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
.circle {
  border-radius: 24px;
  background: linear-gradient(
    90deg,
    rgba(255, 80, 45, 0.514) 1%,
    rgba(240, 150, 25, 0.432) 97.63%
  );
}
</style>
