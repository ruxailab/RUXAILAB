<template>
  <v-snackbar
    v-model="snackbar"
    :color="snackColor"
    :timeout="4000"
    location="top"
  >
    <div>{{ snackMessage }}</div>
    <template #actions="{ attrs }">
      <v-btn
        v-bind="attrs"
        variant="text"
        @click="snackbar = false"
      >
        {{ $t('buttons.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  data: () => ({
    snackbar: false,
  }),
  computed: {
    snackMessage() {
      return this.$store.getters.snackMessage
    },
    snackColor() {
      return this.$store.getters.snackColor
    },
  },
  watch: {
    snackMessage(newVal) {
      if (newVal) this.snackbar = true;
    },
    snackbar(newVal) {
      if (!newVal) this.$store.commit('resetSnack');
    },
  },
}
</script>