<template>
  <v-snackbar v-model="snackbar" :color="snackColor" :timeout="4000" top style="margin-top: 50px">
    <div>{{snackMessage}}</div>

    <v-btn text @click="snackbar = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  data: () => ({
    snackbar: false
  }),
  computed: {
    snackMessage() {
      return this.$store.state.tests.snackMessage;
    },
    snackColor() {
      return this.$store.state.tests.snackColor;
    }
  },
  watch: {
    snackMessage() {
      if (this.snackMessage) this.snackbar = true;
    },
    snackbar() {
      if (!this.snackbar) this.$store.commit("resetSnack");
    }
  }
};
</script>