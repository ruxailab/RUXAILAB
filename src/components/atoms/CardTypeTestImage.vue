<template>
  <div>
    <v-card
      hover
      color="white"
      class="cards ml-5 mr-5"
      height="520"
      @click="$emit('click', type)"
    >
      <v-row>
        <div class="mt-6 ml-10">
          <span class="titles">{{ title }}</span>
          <p class="cardSubtitle2">
            {{ type }}
          </p>
        </div>
      </v-row>

      <img
        style="margin-left: 80px"
        class="mt-5 mb-2"
        height="230"
        :src="img"
        alt="Test Creation image"
      >

      <div class="mt-1">
        <v-row v-for="text in texts" :key="text">
          <v-sheet class="ml-10 mb-8 circle" />
          <span class="cardInternTitles ml-3">{{ text }}</span>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
      require: true,
    },

    type: {
      type: String,
      default: '',
      require: true,
    },

    img: {
      type: String,
      default: '',
      require: true,
    },

    texts: {
      type: Array,
      default: () => ([]),
      require: true,
    },
  },
}
</script>

<style scoped>
.titles {
  font-size: 38px;
  text-align: center;
  font-weight: 600;
  color: #f99726;
}

.card {
  margin: auto;
}

.cards {
  border-radius: 20px !important;
}
.cards :hover {
  cursor: pointer;
  transition: box-shadow 0.6s cubic-bezier(0.55, 0.9, 0.55, 2);
}

.cardSubtitle2 {
  color: rgba(139, 149, 156, 0.64);
  font-size: 16px;
  font-weight: 600;
}

.circle {
  height: 20px;
  width: 20px;
  border-radius: 24px;
  background: linear-gradient(
    90deg,
    rgba(255, 80, 45, 0.514) 1%,
    rgba(240, 150, 25, 0.432) 97.63%
  );
}

.cardInternTitles {
  color: #626e76;
  font-size: 18px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }

  .cards {
    height: 250px; /* Adjust card height for smaller screens */
  }

  .cardSubtitle2 {
    font-size: 16px;
  }

  .circle {
    height: 10px;
    width: 10px;
  }

  .cardInternTitles {
    max-width: 270px;
    font-size: 15px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }

  .cards {
    height: 300px; /* Adjust card height for medium screens */
    width: 100%;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }

  .cards {
    height: 350px; /* Adjust card height for larger screens */
  }
}
</style>