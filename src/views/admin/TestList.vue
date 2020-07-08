<template>
  <v-container style="display:contents">
    <div style="height: 300px" class="background-orange background-img">
      <v-row justify="center" class="fill-height">
        <v-col cols="10">
          <v-text-field
            class="mt-5"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            outlined
            color="grey darken-2"
            v-model="search"
          ></v-text-field>

          <!-- Desktop Tabs -->
          <v-tabs
            v-model="index"
            background-color="transparent"
            color="black"
            class="tab-border-bottom hidden-sm-and-down"
          >
            <v-tab @click="index = 0">My Tests</v-tab>
            <v-tab @click="index = 1">Tests I colaborate with</v-tab>
            <v-tab @click="index = 2">My Answers</v-tab>
          </v-tabs>

          <!-- Mobile Button -->
          <v-select dense outlined v-model="index" class="hidden-md-and-up mx-2" :items="buttonItems"></v-select>

          <!-- My Tests -->
          <v-row v-if="index == 0" :class="`grid mx-2`">
            <v-col cols="12" sm="6" md="4">
              <CardNewTest />
            </v-col>
            <v-col cols="12" sm="6" md="4" v-for="test in filteredMyTests" :key="test.id">
              <CardTest :item="test" :accessLevel="test.accessLevel"></CardTest>
            </v-col>
          </v-row>

          <!-- Tests I Colaborate With -->
          <v-row justify="start" v-if="index == 1" class="grid mx-2">
            <v-col cols="12" sm="6" md="4" v-for="test in filteredMyCoops" :key="test.id">
              <CardTest :item="test" :accessLevel="test.accessLevel"></CardTest>
            </v-col>

            <v-col v-if="filteredMyCoops.length == 0">
              <div class="text-center">No tests found.</div>
            </v-col>
          </v-row>

          <!-- My Answers -->
          <v-row justify="start" v-if="index == 2" class="grid mx-2">
            <v-col cols="12" sm="6" md="4" v-for="test in filteredMyAnswers" :key="test.id">
              <CardTest :item="test" :accessLevel="test.accessLevel"></CardTest>
            </v-col>

            <v-col v-if="filteredMyAnswers.length == 0">
              <div class="text-center">No tests found.</div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>


<script>
//import TestsTable from "@/components/molecules/TestsTable";
import CardTest from "@/components/atoms/CardTest";
import CardNewTest from "@/components/atoms/CardNewTest";

export default {
  data: () => ({
    showMenu: false,
    label: "My Tests",
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
    ],
    buttonItems: [
      { text: "My Tests", value: 0 },
      { text: "Tests I colaborate with", value: 1 },
      { text: "My Answers", value: 2 }
    ]
  }),
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
    index() {
      if (this.index == 0) {
        this.label = "My Tests";
      } else if (this.index == 1) {
        this.label = "Tests I colaborate with";
      } else {
        this.label = "My Answers";
      }
    }
  },
  components: {
    //TestsTable,
    CardTest,
    CardNewTest
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
.tab-border-bottom {
  border-bottom: 1px solid black;
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
