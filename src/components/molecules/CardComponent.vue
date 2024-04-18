<template>
  <v-card
    hover
    class="cards ml-5 mr-5 group"
    color="white"
    :height="height"
    @click="handleClick"
  >
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
/* Styles applied to elements within the scoped style tag */

.insideCards {
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(236, 62, 27, 0.404) 1%,
    rgba(240, 152, 25, 0.3) 97.63%
  );
  z-index: 10;
}

.circle {
  border-radius: 24px;
  background: linear-gradient(
    90deg,
    rgba(255, 80, 45, 0.514) 1%,
    rgba(240, 150, 25, 0.432) 97.63%
  );
}

.cardsTitle {
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
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.cardInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

/* Responsive styles */

@media (max-width: 600px) {
  /* Styles applied for screens with maximum width of 600px */

  .circle {
    height: 10px;
    width: 10px;
  }

  .cardsTitle {
    font-size: 16px;
  }

  .cardSubtitle {
    font-size: 15px;
  }

  .cardSubtitle2 {
    font-size: 16px;
  }

  .cardInternTitles {
    font-size: 15px;
  }

  .cards {
    height: 250px;
  }

  .mt-6 {
    margin-top: 30px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  /* Styles applied for screens with minimum width of 601px and maximum width of 1160px */

  .circle {
    height: 20px;
    width: 20px;
  }

  .cardsTitle {
    font-size: 32px;
  }

  .cards {
    height: 300px;
    width: 100%;
  }

  .mt-6 {
    margin-top: 40px;
  }
}

@media (min-width: 1160px) {
  /* Styles applied for screens with minimum width of 1160px */

  .cardsTitle {
    font-size: 38px;
  }

  .cards {
    height: 350px;
  }

  .mt-6 {
    margin-top: 50px;
  }
}
</style>
