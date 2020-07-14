<template>
  <div class="background">
    <v-row justify="center">
      <v-col cols="12" md="5">
        <v-img src="@/assets/pageNotFound.svg"></v-img>
        <div class="text-center" style="font-size:50px; color: grey">Page Not Found</div>
        <div
          class="text-center"
          style="font-size:15px; color: grey"
        >We weren't able to find the page you were looking for.</div>
        <v-row justify="center" class="mt-4">
          <v-btn style="color: #f9a826" outlined rounded @click="sendHome()">Back Home</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  methods: {
    sendHome() {
      this.$router.push("/testslist");
    }
  }
};
</script>

<style scoped>
.background {
  background-color: #f5f7ff;
  height: 100vh;
}
</style>