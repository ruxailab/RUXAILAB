<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-row class="nav pa-0 ma-0" dense>
      <v-navigation-drawer
        clipped
        height="100%"
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
        color="#3F3D56"
      >
        <div>
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
          </v-list-item>
        </div>

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

        <!-- <template v-slot:append> -->
          <div class="footer" v-if="!mini">
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="mini = !mini" class="mr-2">
              <v-icon color="white">mdi-chevron-left</v-icon>
            </v-btn>
          </div>
 
          <div class="footer" v-else>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="mini = !mini" class="mr-3">
              <v-icon color="white">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        <!-- </template> -->
      </v-navigation-drawer>

      <v-col class="background pa-0 ma-0">
        <div class="background-top">
          <v-row class="pa-5 ma-0">
            <v-col cols="10" class="testTitle" v-text="test.title"></v-col>
          </v-row>
        </div>
        <div>
          <v-container class="content">
            <v-row justify="space-around">
              <v-col cols="6" v-for="n in 2" :key="n">
                <v-card height="300px">
                  <v-card-title>INFO</v-card-title>
                </v-card>
              </v-col>
            </v-row>
            <v-row justify="space-around">
              <v-col cols="4" v-for="n in 3" :key="n">
                <v-card height="300px">
                  <v-card-title>INFO</v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </div>
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
      this.$router.push("/managerview/" + this.selectedTest);
    }
  },
  computed: {
    myTests() {
      return this.$store.state.auth.user.myTests;
    },
    test() {
      return Object.assign(
        {},
        this.$store.state.auth.user.myTests.find(test => test.id == this.id)
      );
    }
  },
  watch: {
    myTests() {
      if (this.myTests) {
        (this.loading = false),
          this.myTests.forEach(test => {
            this.tests.push({ title: test.title, id: test.id });
          });
      }
    },
    test() {
      this.selectedTest = this.test;
    }
  },
  created() {
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
  height: 100%;
  overflow: scroll;
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
.content {
  position: relative;
  top: -100px;
  width: 80%;
}
.testTitle {
  font-family: Roboto;
  font-style: normal;
  font-weight: bold;
  font-size: 45px;
  display: flex;
  align-items: center;
  text-align: center;
  text-shadow: 2px 2px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}
.footer {
  background-color: #343344;
  height: 8%;
  width: 100%;
  display: flex;
  align-items: center;

  position: absolute;
  bottom: 49px;
}
</style>