<template>
  <div class="fill-height background">
    <v-container>
      <v-row class="fill-height" justify="center" align="center" dense>
        <v-col cols="4" v-for="(card,index) in cards" :key="index">
          <v-row justify="center">
            <CardManager :item="card" />
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import CardManager from "@/components/atoms/CardManager";

export default {
  props: ["id"],
  data: () => ({
    cards: []
  }),

  created() {
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(test => test.id == this.id)
    );

    this.cards = [
      {
        title: "Preview",
        url: "Preview.svg",
        path: `/testview/${this.test.id}`
      },
      {
        title: "Reports",
        url: "Reports.svg",
        path: `/reportview/${this.test.reports}`
      },
      {
        title: "Answers",
        url: "Answers.svg",
        path: `/answerview/${this.test.answers}`
      },
      {
        title: "Cooperators",
        url: "Coops.svg",
        path: `/cooperatorsview/${this.test.id}`
      },
      { title: "Edit", url: "Edit.svg", path: `/edittest/${this.test.id}` }
    ];
  },
  components: {
    CardManager
  }
};
</script>

<style>
.background {
  position: absolute;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 0%;

  background: url(../../assets/BackgroundShape.png), #dfdfdf;
  background-position: center;
  background-repeat: no-repeat;
  background-origin: border-box;
  background-size: cover;
}
</style>