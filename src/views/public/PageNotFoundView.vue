<template>
  <div class="background">
    <v-row justify="center">
      <v-col cols="12" md="5">
        <v-img src="@/assets/pageNotFound.svg" />
        <div class="text-center" style="font-size:50px; color: grey">
          Page Not Found
        </div>
        <div
          class="text-center"
          style="font-size:15px; color: grey"
        >
          We weren't able to find the page you were looking for.
        </div>
        <v-row justify="center" class="mt-4">
          <v-btn style="color: #f9a826" outlined rounded @click="sendHome()">
            Go Back
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    prevRoute: null,
  }),
 methods: {
  sendHome() {
    // Check if prevRoute exists and has a valid path before attempting navigation
    if (this.prevRoute && this.prevRoute.path) {
      this.$router.push(this.prevRoute.path).catch(() => {
        // Catch any navigation errors to prevent unexpected crashes
      });
    } else {
      // If no previous route exists, redirect the user to the home page
      this.$router.push('/').catch(() => {
        // Catch any navigation errors to prevent unexpected crashes
      });
    }
  },
},

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from
    })
  },
}
</script>

<style scoped>
.background {
  background-color: #f5f7ff;
  height: 100vh;
}
</style>
