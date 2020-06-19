<template>
  <v-container style="display:contents">
    <v-row justify="center" class="fill-height background-orange background-img">
      <v-col cols="10">
        <v-text-field label="Search" prepend-inner-icon="mdi-magnify" outlined></v-text-field>
        <v-tabs centered background-color="transparent" color="grey darken-2">
          <v-tab @click="index = 0">My Tests</v-tab>
          <v-tab @click="index = 1">Tests I colaborate with</v-tab>
          <v-tab @click="index = 2">My Answers</v-tab>
        </v-tabs>

        <!-- My Tests -->
        <!-- Coloquei varias vezes so pra ver como fica com scroll -->
        <v-row justify="center" v-if="index == 0" class="grid">
          <v-row v-for="n in 20" :key="n">
            <v-col v-for="test in user.myTests" :key="test.id">
              <CardTest :item="test"></CardTest>
            </v-col>
          </v-row>

        </v-row>

        <!-- Tests I Colaborate With -->
        <v-row justify="center" v-if="index == 1" class="grid">
          <v-col v-for="test in user.myCoops" :key="test.id">
            <CardTest :item="test"></CardTest>
          </v-col>
          <v-col v-for="test in user.myCoops" :key="test.id">
            <CardTest :item="test"></CardTest>
          </v-col>
        </v-row>

        <!-- My Answers -->
        <v-row justify="center" v-if="index == 2" class="grid">
          <v-col v-for="test in user.myAnswers" :key="test.id">
            <CardTest :item="test"></CardTest>
          </v-col>
        </v-row>
      </v-col>

      <v-card></v-card>
    </v-row>

    <v-btn large dark fab fixed bottom right @click="createTest()">
      <!-- Add Button -->
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>


<script>
//import TestsTable from "@/components/molecules/TestsTable";
import CardTest from "@/components/atoms/CardTest";
export default {
  data: () => ({
    showMenu: false,
    x: 0,
    y: 0,
    test: {},
    index: 0,
    headers: [
      {
        text: "Title",
        align: "start",
        value: "title"
      },
      { text: "Id", value: "id", align: "center" },
      { text: "Type", value: "type", align: "center" },
      { text: "Edit", value: "edit", align: "center", sortable: false },
      { text: "Delete", value: "delete", align: "center", sortable: false },
      { text: "More", value: "more", align: "center", sortable: false }
    ],
    items: [
      { title: "Open Test" },
      { title: "Open Answers" },
      { title: "Open Manager" }
    ]
  }),
  methods: {
    createTest() {
      this.$router.push("/createtest");
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    loading() {
      return this.$store.state.tests.loading;
    }
  },
  components: {
    //TestsTable,
    CardTest
  }
};
</script>

<style scoped>
.card {
  height: 300px;
  width: 300px;
  border-radius: 29px;
  background-image: url(/assets/cardTest.png);
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
.button {
  margin: 10px;
}
.grid {
  margin-top: 60px;
}
.img {
  opacity: 0.6;
  transform: rotate(20deg);
}
.background-orange {
  background-color: #f9a826;
  height: 100%;
}
.background-img {
  position: relative;
  z-index: 1;
}
.background-img:before {
  content: "";
  position: fixed;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.5;
  background-image: url(../../assets/toDoTest.svg);
  background-size: 700px;
  background-position-x: right;
  background-position-y: bottom;
  margin-right: 30px;
  /* background-position: 150% 800%; */
  background-repeat: no-repeat;
}
</style>