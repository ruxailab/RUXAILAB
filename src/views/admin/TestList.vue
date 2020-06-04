<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card>
          <v-tabs grow centered>
            <v-tab>My Tests</v-tab>
            <v-tab>Tests I colaborate with</v-tab>
            <v-tab>My Answers</v-tab>

            <v-tab-item>
              <TestsTable :tests="user.myTests" :headers="headers" />
            </v-tab-item>
            <v-tab-item>
              <TestsTable :tests="user.myCoops" :headers="headers" />
            </v-tab-item>

            <v-tab-item>
              <TestsTable :tests="user.myAnswers" :headers="headers" />
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>

    <v-btn large dark fab fixed bottom right @click="createTest()">
      <!-- Add Button -->
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>


<script>
import TestsTable from "@/components/molecules/TestsTable";

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
      { text: "More", value: "more", align: "center", sortable: false },
    ],
    items: [{ title: "Open Test" }, { title: "Open Answers" }, {title: "Open Manager"}]
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
    TestsTable
  }
};
</script>