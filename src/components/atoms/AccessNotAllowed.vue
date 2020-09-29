<template>
  <div style="height: 100%">
    <v-row justify="center" align="center" style="height:100%">
      <v-col cols="12" md="5">
        <v-img
          src="@/assets/accessNotAllowed.svg"
          contain
          max-height="250"
        ></v-img>
        <div class="text-center" style="font-size: 50px; color: grey">
          Access not allowed
        </div>
        <div class="text-center" style="font-size: 15px; color: grey">
          You do not have access to the page you're trying to access.
        </div>
        <v-row justify="center" class="mt-4">
          <v-btn style="color: #f9a826" outlined rounded @click="goBack()"
            >Go to Home</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.push("/testslist");
    },
  },
};
</script>