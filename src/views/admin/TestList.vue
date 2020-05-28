<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card :ripple="false" @click="openDropdown">
          <v-tabs grow centered>
            <v-tab @click.stop>My Tests</v-tab>

            <v-tab @click.stop>Tests I colaborate with</v-tab>

            <v-tab-item>
              <TestsTable @setTest="setTest" :tests="user.myTests" :headers="headers" />
            </v-tab-item>
            <v-tab-item>
              <TestsTable @setTest="setTest" :tests="user.myCoops" :headers="headers" />
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>

    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
      <v-list>
        <v-list-item @click="openTest(test)">
          <v-list-item-title>Open Test</v-list-item-title>
        </v-list-item>

        <v-list-item @click="openAnswer(test)">
          <v-list-item-title>Open Answers</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

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
      { text: "Tasks", value: "tasks.length", align: "center" },
      { text: "Type", value: "type", align: "center" },
      { text: "Edit", value: "edit", align: "center", sortable: false },
      { text: "Delete", value: "delete", align: "center", sortable: false },
      { text: "", value: "data-table-expand" }
    ],
    items: [{ title: "Open Test" }, { title: "Open Answers" }]
  }),
  methods: {
    createTest() {
      this.$router.push("/createtest");
    },
    setTest(test) {
      this.test = Object.assign({}, test);
      // this.openDropdown()
    },
    openDropdown(e) {
      e.preventDefault();
      this.showMenu = false;
      this.x = e.clientX;
      this.y = e.clientY;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    openAnswer(test) {
      this.$router.push("/answerview/" + test.id);
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