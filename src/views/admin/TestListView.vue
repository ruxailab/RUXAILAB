<template>
  <v-container style="display:contents">
    <Snackbar />

    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          large
          dark
          fab
          fixed
          bottom
          right
          color="#F9A826"
          @click="pushCreate()"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon large>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>Create new test</span>
    </v-tooltip>

    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <div>
      <v-row justify="center" class="fill-height">
        <v-col cols="10">
          <!-- Mobile search button -->
          <v-row align="center" v-if="!searching">
            <span class="titleText ml-3">Tests</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-3 hidden-md-and-up" icon @click="searching = true">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-row>
          <v-text-field
            :autofocus="searching"
            @blur="searching = false"
            v-else
            dense
            label="Search"
            prepend-inner-icon="mdi-magnify"
            outlined
            color="grey darken-2"
            v-model="search"
          ></v-text-field>
          <v-divider class="mb-1"></v-divider>

          <!-- Desktop Main Tabs -->
          <v-tabs
            v-model="mainIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
          >
            <v-tab>Tests</v-tab>
            <v-tab>Answers</v-tab>
            <v-tab>Templates</v-tab>

            <v-spacer></v-spacer>

            <v-text-field
              dense
              class="mt-1"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              outlined
              color="grey darken-2"
              v-model="search"
            ></v-text-field>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <v-tabs
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
          >
            <!-- Tests/Answers sub tabs -->
            <v-tab v-if="mainIndex != 2">All</v-tab>
            <v-tab v-if="mainIndex != 2">Personal</v-tab>
            <v-tab v-if="mainIndex != 2">Others</v-tab>

            <!-- Template sub tabs -->
            <v-tab v-if="mainIndex == 2">Personal</v-tab>
            <v-tab v-if="mainIndex == 2">Explore</v-tab>

            <v-spacer></v-spacer>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <!-- Mobile Button -->
          <v-select
            dense
            outlined
            v-model="mainIndex"
            class="hidden-md-and-up mx-2"
            :items="buttonItems"
          ></v-select>

          <!-- My Tests -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0"
            :tests="filteredMyTests"
            type="myTests"
          ></List>

          <!-- Tests I Colaborate With -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 1"
            :tests="filteredMyCoops"
            type="myCoops"
          ></List>

          <!-- My Answers -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 2"
            :tests="filteredMyAnswers"
            type="myAnswers"
          ></List>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>


<script>
import Snackbar from "@/components/atoms/Snackbar";
import List from "@/components/atoms/ListTests";

export default {
  components: {
    Snackbar,
    List
  },
  data: () => ({
    search: "",
    mainIndex: 0,
    searching: false,
    buttonItems: [
      { text: "Tests", value: 0 },
      { text: "Answers", value: 1 },
      { text: "Templates", value: 2 }
    ]
  }),
  methods: {
    pushCreate() {
      this.$router.push("/createtest").catch(() => {});
    },
    goTo(test) {
      this.$router.push(
        (test.accessLevel <= 1 ? "/managerview/" : "/testview/") + test.id
      ).catch(() => {});
    }
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    filteredMyTests() {
      if (this.user)
        return (
          this.user.myTests.filter(test => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
    },
    filteredMyCoops() {
      if (this.user)
        return this.user.myCoops.filter(test => {
          return test.title.toLowerCase().includes(this.search.toLowerCase());
        }) || [] 
      return [];
    },
    filteredMyAnswers() {
      if (this.user)
        return this.user.myAnswers.filter(test => {
          return test.title.toLowerCase().includes(this.search.toLowerCase());
        }) || [] 
      return [];
    },
    loading() {
      return this.$store.getters.loading;
    }
  }
};
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
</style>