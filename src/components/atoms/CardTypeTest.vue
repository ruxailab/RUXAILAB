<template>
  <div>
    <v-card
      hover
      :theme="darkMode ? 'dark' : 'light'"
      class="cards ml-5 mr-5"
      height="350"
      @click="$emit('click', segundType)"
    >
      <v-row>
        <v-sheet class="ml-8 mt-6 mb-10 insideCards" height="50" width="50">
          <v-img class="ma-2" :src="img" />
        </v-sheet>

        <div class="mt-6">
          <span class="cardsTitle ml-4">{{ title }}</span>
          <p class="cardSubtitle ml-4">{{ type }}</p>
        </div>
      </v-row>

      <v-divider />

      <div class="mt-1">
        <v-row v-for="(text, index) in texts" :key="index" class="ml-6 mt-6 mb-6">
          <v-sheet class="circle" />
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

    segundType: {
      type: String,
      default: '',
      require: true,
    },

    texts: {
      type: Array,
      default: () => ([]),
      require: true,
    },
    darkMode:Boolean,},
  data() {
  return {
    isDarkMode: localStorage.getItem('darkMode') === 'true', // Ensure it's a boolean
  };
},
watch: {
  isDarkMode(newValue) {
    localStorage.setItem('darkMode', newValue);
  },
},
methods: {
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  },
}

};
</script>

<style scoped>
.cards {
  border-radius: 20px ;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

.cards:hover {
  cursor: pointer;
  transition: box-shadow 0.6s cubic-bezier(0.55, 0.9, 0.55, 2);
}

/* Light Mode */
.light {
  background-color: white !important; 
  color: black !important;
}

/* Dark Mode */
.dark {
  background-color: #1e1e1e !important;
  color: #e0e0e0 !important;
}

.insideCards {
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(236, 62, 27, 0.404) 1%, rgba(240, 152, 25, 0.3) 97.63%);
}

.cardsTitle {
  font-size: 24px;
  font-weight: 600;
  background-color: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-weight: 600;
}

.cardInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
}

/* Dark Mode Text Colors */
.dark .cardSubtitle {
  color: #a0a0a0;
}

.dark .cardInternTitles {
  color: #c0c0c0;
}

.circle {
  height: 20px;
  width: 20px;
  border-radius: 24px;
  background: linear-gradient(90deg, rgba(255, 80, 45, 0.514) 1%, rgba(240, 150, 25, 0.432) 97.63%);
}

@media (max-width: 600px) {
  .cards {
    height: 250px;
  }
  .cardsTitle {
    font-size: 16px;
  }
  .cardSubtitle {
    font-size: 15px;
  }
  .circle {
    height: 10px;
    width: 10px;
  }
  .cardInternTitles {
    font-size: 15px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .cards {
    height: 300px;
    width: 100%;
  }
}

@media (min-width: 1160px) {
  .cards {
    height: 350px;
  }
}
</style>
