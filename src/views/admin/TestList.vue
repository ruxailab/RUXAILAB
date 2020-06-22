<template>
  <v-container style="display:contents">
    <v-row justify="center" class="fill-height background-orange background-img">
      <v-col cols="10">
        <v-text-field label="Search" prepend-inner-icon="mdi-magnify" outlined v-model="search"></v-text-field>
        <v-tabs centered background-color="transparent" color="grey darken-2">
          <v-tab @click="index = 0">My Tests</v-tab>
          <v-tab @click="index = 1">Tests I colaborate with</v-tab>
          <v-tab @click="index = 2">My Answers</v-tab>
        </v-tabs>

        <!-- My Tests -->
        <v-row v-if="index == 0" class="grid" justify="start">
          <v-col md="4" sm="6" xs="12" v-for="test in filteredMyTests" :key="test.id">
            <CardTest :item="test"></CardTest>
          </v-col>

          <v-col v-if="filteredMyTests.length == 0">
            <div class="text-center">No tests found.</div>
          </v-col>
        </v-row>

        <!-- Tests I Colaborate With -->
        <v-row justify="start" v-if="index == 1" class="grid">
          <v-col  md="4" sm="6" xs="12" v-for="test in filteredMyCoops" :key="test.id">
            <CardTest :item="test"></CardTest>
          </v-col>

          <v-col v-if="filteredMyCoops.length == 0">
            <div class="text-center">No tests found.</div>
          </v-col>
        </v-row>

        <!-- My Answers -->
        <v-row justify="start" v-if="index == 2" class="grid">
          <v-col  md="4" sm="6" xs="12" v-for="test in filteredMyAnswers" :key="test.id">
            <CardTest :item="test"></CardTest>
          </v-col>

          <v-col v-if="filteredMyAnswers.length == 0">
            <div class="text-center">No tests found.</div>
          </v-col>
        </v-row>

        <div style="height: 100px"></div>
        <!-- here to leave some empty space under the cards-->
      </v-col>
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
    search: "",
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
    },
    filteredMyTests() {
      return this.user.myTests.filter(test => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    filteredMyCoops() {
      return this.user.myCoops.filter(test => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    filteredMyAnswers() {
      return this.user.myAnswers.filter(test => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      });
    }
  },
  watch: {
    filteredMyTests() {
      console.log(this.filteredMyTests);
    }
  },
  components: {
    //TestsTable,
    CardTest
  }
};
</script>

<style scoped>
.button {
  margin: 10px;
}
.grid {
  margin-top: 100px;
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