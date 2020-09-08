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

    <div>
      <v-row justify="center" class="fill-height">
        <v-col cols="11">
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
          <List @clicked="goTo" v-if="index == 0" :tests="filteredMyTests"></List>

          <!-- Tests I Colaborate With -->
          <List @clicked="goTo" v-if="index == 1" :tests="filteredMyCoops"></List>

          <!-- My Answers -->
          <List @clicked="goTo" v-if="index == 2" :tests="filteredMyAnswers"></List>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>


<script>
// import CardTest from "@/components/atoms/CardTest";
// import NewTestBtn from "@/components/atoms/NewTestBtn";
import Snackbar from "@/components/atoms/Snackbar";
import List from "@/components/atoms/ListTests";

export default {
  data: () => ({
    showMenu: false,
    label: "My Tests",
    test: {},
    search: "",
    index: 0,
    searching: false,
    headers: [
      {
        text: "Title",
        align: "start",
        value: "title",
      },
      { text: "Id", value: "id", align: "center" },
      { text: "Type", value: "type", align: "center" },
      { text: "Edit", value: "edit", align: "center", sortable: false },
      { text: "Delete", value: "delete", align: "center", sortable: false },
      { text: "More", value: "more", align: "center", sortable: false },
    ],
    items: [
      { title: "Open Test" },
      { title: "Open Answers" },
      { title: "Open Manager" },
    ],
    buttonItems: [
      { text: "My Tests", value: 0 },
      { text: "Tests I colaborate with", value: 1 },
      { text: "My Answers", value: 2 },
    ],
  }),
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    loading() {
      return this.$store.state.tests.loading;
    },
    filteredMyTests() {
      return this.user.myTests.filter((test) => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    filteredMyCoops() {
      return this.user.myCoops.filter((test) => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    filteredMyAnswers() {
      return this.user.myAnswers.filter((test) => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
  },
  watch: {
    index() {
      if (this.index == 0) {
        this.label = "My Tests";
      } else if (this.index == 1) {
        this.label = "Tests I colaborate with";
      } else {
        this.label = "My Answers";
      }
    },
  },
  components: {
    // CardTest,
    // NewTestBtn,
    Snackbar,
    List,
  },
  methods: {
    pushCreate() {
      this.$router.push("/createtest");
    },
    goTo(test) {
        this.$router.push((test.accessLevel <= 1 ? "/managerview/" : "/testview/") + test.id)
    },
  }
};
</script>

<style scoped>
.button {
  margin: 10px;
}
.grid {
  margin-top: 30px;
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
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(../../assets/toDoTest.svg);

  /* background-position: 150% 800%; */
  background-repeat: no-repeat;

  background-size: 300px auto;
  background-position: right 0px bottom 0px;
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.titleText {
  font-size: 40px;
  font-weight: 300;
}

@media screen and (max-width: 960px) {
  /*sm */
  .background-img:before {
    content: "";
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url(../../assets/toDoTest.svg);
    opacity: 70%;

    /* background-position: 150% 800%; */
    background-repeat: no-repeat;

    background-size: 300px auto;
    background-position: right 0px bottom 0px;
    transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>
