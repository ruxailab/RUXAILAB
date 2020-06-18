<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-text-field label="Search" prepend-inner-icon="mdi-magnify" outlined></v-text-field>
      </v-col>
      <v-col cols="10">
        <v-tabs  centered>
          <v-tab>My Tests</v-tab>
          <v-tab>Tests I colaborate with</v-tab>
          <v-tab>My Answers</v-tab>

          <v-tab-item class="grid">
            <v-row>
              <v-col v-for="test in user.myTests" :key="test.id">
                <CardTest :test="test"></CardTest>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item class="grid">
            <v-row>
              <v-col v-for="test in user.myCoops" :key="test.id">
                <CardTest :test="test"></CardTest>
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item class="grid">
            <v-row>
              <v-col v-for="test in user.myAnswers" :key="test.id">
                <CardTest :test="test"></CardTest>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs>
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
  margin-top: 100px;
}
.img {
  opacity: 0.6;
  transform: rotate(20deg);
}
</style>