<template>
  <v-container style="display: contents">
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

          <!-- Desktop Tests/Answers Sub tabs -->
          <v-tabs
            v-model="subIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
            v-if="mainIndex !== 2"
          >
            <v-tab>All</v-tab>
            <v-tab>Personal</v-tab>
            <v-tab>Others</v-tab>

            <v-spacer></v-spacer>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <!-- Desktop Templates Sub tabs -->
          <v-tabs
            v-model="subIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
            v-if="mainIndex == 2"
          >
            <v-tab>Personal</v-tab>
            <v-tab>Explore</v-tab>

            <v-spacer></v-spacer>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <!-- Mobile Main Button -->
          <v-select
            dense
            outlined
            v-model="mainIndex"
            class="hidden-md-and-up mx-2"
            :items="buttonItems"
          ></v-select>

          <!-- Mobile Sub Buttons -->
          <v-select
            dense
            outlined
            v-model="subIndex"
            class="hidden-md-and-up mx-2"
            :items="testButtonItems"
            v-if="mainIndex <= 1"
          ></v-select>
          <v-select
            dense
            outlined
            v-model="subIndex"
            class="hidden-md-and-up mx-2"
            :items="templateButtonItems"
            v-else
          ></v-select>

          <!-- Tests -> All -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 0"
            :tests="filteredAllTests"
            type="myCoops"
          ></List>

          <!-- Tests -> Personal -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 1"
            :tests="filteredMyTests"
            type="myTests"
          ></List>

          <!-- Tests -> Others -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 2"
            :tests="filteredMyCoops"
            type="myCoops"
          ></List>

          <!-- Answers -> All -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 1 && subIndex == 0"
            :tests="filteredMyAnswers"
            type="answers"
          ></List>

          <!-- Answers -> Personal -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 1 && subIndex == 1"
            :tests="filteredPersonalAnswers"
            type="answers"
          ></List>

          <!-- Answers -> Ohters -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 1 && subIndex == 2"
            :tests="filteredOtherAnswers"
            type="answers"
          ></List>

          <!-- Templates -> Personal -->
          <List
            v-if="mainIndex == 2 && subIndex == 0"
            :tests="filteredPersonalTemplates"
            type="template"
          ></List>

          <!-- Templates -> Explore -->
          <List
            v-if="mainIndex == 2 && subIndex == 1"
            :tests="filteredTemplates"
            type="template"
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
    List,
  },
  data: () => ({
    search: "",
    mainIndex: 0,
    subIndex: 0,
    searching: false,
    buttonItems: [
      { text: "Tests", value: 0 },
      { text: "Answers", value: 1 },
      { text: "Templates", value: 2 },
    ],
    testButtonItems: [
      { text: "All", value: 0 },
      { text: "Personal", value: 1 },
      { text: "Others", value: 2 },
    ],
    templateButtonItems: [
      { text: "Personal", value: 0 },
      { text: "Explore", value: 1 },
    ]
  }),
  methods: {
    pushCreate() {
      this.$router.push("/createtest").catch(() => {});
    },
    goTo(test) {
      this.$router
        .push(
          (test.accessLevel <= 1 ? "/managerview/" : "/testview/") + test.id
        )
        .catch(() => {});
    },
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    allTests() {
      let array = [];

      if(this.user) {
        array.push(...this.user.myTests);

        let hasTest = null

        this.user.myCoops.forEach(test => {
          hasTest = array.find(t => t.id == test.id);

          if(hasTest == undefined) //if test not add to array
            array.push(test);
        })

        
      }
      return array;
    },
    filteredAllTests() {
      let arr = [];

      arr = this.allTests.filter((test) => {
        return test.title.toLowerCase().includes(this.search.toLowerCase());
      })

      return arr;
    },
    filteredMyTests() {
      if (this.user)
        return (
          this.user.myTests.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
    },
    filteredMyCoops() {
      if (this.user)
        return (
          this.user.myCoops.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
    },
    filteredMyAnswers() {
      if (this.user)
        return (
          this.user.myAnswers.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
    },
    personalAnswers() {
      if (this.user) {
        return (
          this.user.myAnswers.filter((test) => {
            return test.author == this.user.email;
          }) || []
        );
      }

      return [];
    },
    filteredPersonalAnswers() {
      if (this.user)
        return (
          this.personalAnswers.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
    },
    otherAnswers() {
      if (this.user) {
        return (
          this.user.myAnswers.filter((test) => {
            return test.author !== this.user.email;
          }) || []
        );
      }

      return [];
    },
    filteredOtherAnswers() {
      if (this.user)
        return (
          this.otherAnswers.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
    },
    storeTemplates() {
      return this.$store.getters.templates || [];
    },
    templates() {
      let array = [];
      if (this.storeTemplates !== null) {
        array = this.storeTemplates.map((temp) => {
          let obj = {
            id: temp.id,
            title: temp.header.title || "No Title",
            date: temp.header.date,
            type: temp.body.type,
            author: temp.header.author,
            version: temp.header.version,
            description: temp.header.description,
          };
          return obj;
        });
      }

      return array;
    },
    filteredTemplates() {
      return this.templates.filter(temp=> {
        return temp.title.toLowerCase().includes(this.search.toLowerCase())
      })
    },
    personalTemplates() {
      return this.templates.filter(temp => {
        return temp.author == this.user.email
      })
    },
    filteredPersonalTemplates() {
      return this.personalTemplates.filter(temp => {
        return temp.title.toLowerCase().includes(this.search.toLowerCase());
      })
    },
    loading() {
      return this.$store.getters.loading;
    },
  },
  watch: {
    mainIndex() {
      this.subIndex = 0; //reset subIndex when main idex change
    },
  },
  created() {
    // if (this.$store.getters.templates == null) {
    this.$store.dispatch("getTemplates");
    // }
  },
};
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
</style>