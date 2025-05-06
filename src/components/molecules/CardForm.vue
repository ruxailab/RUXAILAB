<template>
  <v-card class="cards">
    <v-col cols="12">
      <p class="cardsTitle ml-3">{{ title }}</p>
      <p v-if="subtitle" class="cardsSubtitle ml-3">{{ subtitle }}</p>
      <slot></slot>
    </v-col>
  </v-card>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
      required: false,
    },
  },
}
</script>

<style scoped>
.cards {
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cardsTitle {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.cardsSubtitle {
  color: #455a64;
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 8px;
}
</style>
