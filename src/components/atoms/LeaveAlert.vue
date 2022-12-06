<template>
  <v-card>
    <v-card-title
      class="headline error accent-4 white--text"
      primary-title
      >Are you sure you want to leave?</v-card-title
    >
    <v-card-text
      >Are you sure you want to leave? All your changes will be
      discarded</v-card-text
    >
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn class="grey lighten-3" text @click="setDialog"
        >Stay</v-btn
      >
      <v-btn
        class="error accent-4 white--text ml-1"
        text
        @click="(change = false), $router.push(go)"
        >Leave</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
name: "LeaveAlert",
methods: {
  setDialog() {
    this.$store.commit('SET_DIALOG', false)
  }
}
}
</script>