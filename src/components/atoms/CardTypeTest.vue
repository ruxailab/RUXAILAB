<template>
  <div>
    <v-card
      hover
      color="white"
      class="cards ml-5 mr-5"
      height="350"
      @click="$emit('click', segundType)"
    >
      <v-card-title class="cardsTitle">
        {{ title }}
      </v-card-title>
      <v-card-subtitle class="cardSubtitle">
        {{ type }}
      </v-card-subtitle>

      <v-divider />
      <v-card-text>
        <v-row
          v-for="text in texts"
          :key="text"
          class="ml-6 mt-6 mb-6"
        >
          <p>{{ text }}</p>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
// Define props with the same structure and validation as in Options API
const props = defineProps({
  title: {
    type: String,
    default: '',
    required: true,
  },
  type: {
    type: String,
    default: '',
    required: true,
  },
  img: {
    type: String,
    default: '',
    required: true,
  },
  segundType: {
    type: String,
    default: '',
    required: true,
  },
  texts: {
    type: Array,
    default: () => [],
    required: true,
  },
});

// Define emits
defineEmits(['click']);

// No additional logic is needed since the component only handles props and emits
</script>

<style scoped>
.cards {
  border-radius: 20px !important;
}

.cards :hover {
  cursor: pointer;
  transition: box-shadow 0.6s cubic-bezier(0.55, 0.9, 0.55, 2);
}

.insideCards {
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(236, 62, 27, 0.404) 1%,
    rgba(240, 152, 25, 0.3) 97.63%
  );
}

.cardsTitle {
  font-size: 20px;
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

@media (max-width: 600px) {
  .cards {
    height: 250px; /* Adjust card height for smaller screens */
  }

  .cardsTitle {
    font-size: 16px;
  }

  .cardSubtitle {
    font-size: 15px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .cards {
    height: 300px; /* Adjust card height for medium screens */
    width: 100%;
  }
}

@media (min-width: 1160px) {
  .cards {
    height: 350px; /* Adjust card height for larger screens */
  }
}
</style>