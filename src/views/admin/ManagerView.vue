<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-row class="nav pa-0 ma-0" dense>
      <v-navigation-drawer
        clipped
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
        color="#3F3D56"
      >
        <v-list-item class="px-2" v-if="!mini">
          <v-overflow-btn
            dark
            dense
            v-model="selectedTest"
            @change="pushToTest()"
            item-value="id"
            item-text="title"
            :items="tests"
            :loading="loading"
            :label="test.title"
            background-color="#3F3D56"
          ></v-overflow-btn>

          <!-- <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>-->
        </v-list-item>

        <v-list dense>
          <v-list-item v-for="item in items" :key="item.title" link>
            <v-list-item-icon>
              <v-icon color="#fca326">{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title style="color:#fca326">{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-col class="background pa-0 ma-0">
        <div class="background-top"></div>
        <div v-for="n in 100" :key="n">{{n}}</div>
      </v-col>
    </v-row>
  </v-container>
  <!-- <div class="fill-height background">
    <v-container>
      <v-row class="fill-height" justify="center" align="center" dense>
        <v-col cols="4" v-for="(card,index) in cards" :key="index">
          <v-row justify="center">
            <CardManager :item="card" />
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>-->
</template>

<script>
// import CardManager from "@/components/atoms/CardManager";

export default {
  props: ["id"],
  data: () => ({
    drawer: true,
    items: [
      { title: "Manager", icon: "mdi-cog" },
      { title: "Preview", icon: "mdi-file-eye" },
      { title: "Reports", icon: "mdi-book-multiple" },
      { title: "Answers", icon: "mdi-chart-bar" },
      { title: "Colaborators", icon: "mdi-account-group" },
      { title: "Edit", icon: "mdi-pencil" }
    ],
    loading: true,
    tests: [],
    mini: true
  }),
  methods: {
    pushToTest() {
      this.$router.push('/managerview/' + this.selectedTest)
    }
  },
  computed: {
    width() {
      if (this.mini) return "100%";
      else return "75%";
    },
    myTests() {
      return this.$store.state.auth.user.myTests;
    }
  },
  watch: {
    myTests() {
      if (this.myTests) {
        (this.loading = false),
          this.myTests.forEach(test => {
            this.tests.push({ title: test.title, id: test.id});
          });
      }
    }
  },
  created() {
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(test => test.id == this.id)
    );
    this.selectedTest = this.test;

    this.cards = [
      {
        title: "Preview",
        url: "Preview.svg",
        path: `/testview/${this.test.id}`
      },
      {
        title: "Reports",
        url: "Reports.svg",
        path: `/reportview/${this.test.reports}`
      },
      {
        title: "Answers",
        url: "Answers.svg",
        path: `/answerview/${this.test.answers}`
      },
      {
        title: "Cooperators",
        url: "Coops.svg",
        path: `/coopsview/${this.test.id}`
      },
      { title: "Edit", url: "Edit.svg", path: `/edittest/${this.test.id}` }
    ];
  },
  components: {
    // CardManager
  }
};
</script>

<style>
.background-top {
  background-color: #fca326;
  height: 45%;
  width: 100%;
}
.background {
  background-color: #e8eaf2;
  height: 100vh;
  overflow: auto;
}
.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.background::-webkit-scrollbar {
  display: none;
}
</style>