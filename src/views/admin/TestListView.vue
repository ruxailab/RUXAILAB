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

          <!-- Desktop Tabs -->
          <v-tabs
            v-model="index"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
          >
            <v-tab @click="index = 0">My Tests</v-tab>
            <v-tab @click="index = 1">Tests I colaborate with</v-tab>
            <v-tab @click="index = 2">My Answers</v-tab>

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

          <!-- Mobile Button -->
          <v-select
            dense
            outlined
            v-model="index"
            class="hidden-md-and-up mx-2"
            :items="buttonItems"
          ></v-select>

          <!-- My Tests -->
          <List
            @clicked="goTo"
            v-if="index == 0"
            :tests="filteredMyTests"
          ></List>

          <!-- Tests I Colaborate With -->
          <List
            @clicked="goTo"
            v-if="index == 1"
            :tests="filteredMyCoops"
          ></List>

          <!-- My Answers -->
          <List
            @clicked="goTo"
            v-if="index == 2"
            :tests="filteredMyAnswers"
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
    index: 0,
    searching: false,
    buttonItems: [
      { text: "My Tests", value: 0 },
      { text: "Tests I colaborate with", value: 1 },
      { text: "My Answers", value: 2 }
    ]
  }),
  methods: {
    pushCreate() {
      this.$router.push("/createtest");
    },
    goTo(test) {
      this.$router.push(
        (test.accessLevel <= 1 ? "/managerview/" : "/testview/") + test.id
      );
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