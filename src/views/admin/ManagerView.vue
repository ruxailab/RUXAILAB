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
        <div class="header" v-if="!mini">
          <v-list-item>
            <v-row dense>
              <v-col class="pa-0 ma-0">
                <div class="idText">{{test.id}}</div>
                <v-overflow-btn
                  class="pa-0 ma-0"
                  dark
                  dense
                  v-model="selectedTest"
                  @change="pushToTest()"
                  item-value="id"
                  item-text="title"
                  :items="myTests"
                  :label="test.title"
                  background-color="#343344"
                ></v-overflow-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list flat dense>
          <v-list-item v-for="(item,n) in items" :key="n" link @click="index = n,go(item.path)">
            <v-list-item-icon>
              <v-icon :color="index == item.id? '#ffffff' : '#fca326'">{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title
                :style="index == item.id? 'color: white': 'color:#fca326'"
              >{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

       
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
   
      </v-navigation-drawer>

      <v-col class="background pa-0 ma-0">
        <div v-if="index == 0">
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
        </div>
        <router-view v-else></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  props: ["id"],
  data: () => ({
    drawer: true,
    index: 0,
    loading: true,
    tests: [],
    mini: true
  }),
  methods: {
    pushToTest() {
      this.$router.push("/managerview/" + this.selectedTest);
    },
    go(path){
      this.$router.push(path)
    }
  },
  computed: {
    myTests() {
      return this.$store.state.auth.user.myTests;
    },
    test() {
      return Object.assign(
        {},
        this.$store.state.auth.user.myTests.find(test => Object.values(test).includes(this.id))
      );
    }
  },
  watch: {
    test() {
      this.selectedTest = this.test;
    }
  },
  created() {
    this.items = [
      {
        title: "Manager",
        icon: "mdi-cog",
        path: `/managerview/${this.test.id}`,
        id: 0
      },
      {
        title: "Preview",
        icon: "mdi-file-eye",
        path: `/testview/${this.test.id}`,
        id: 1
      },
      {
        title: "Reports",
        icon: "mdi-book-multiple",
        path: `/reportview/${this.test.reports}`,
        id: 2
      },
      {
        title: "Answers",
        icon: "mdi-chart-bar",
        path: `/answerview/${this.test.answers}`,
        id: 3
      },
      {
        title: "Colaborators",
        icon: "mdi-account-group",
        path: `/coopsview/${this.test.id}`,
        id: 4
      },
      {
        title: "Edit",
        icon: "mdi-pencil",
        path: `/edittest/${this.test.id}`,
        id: 5
      }
    ];

    this.itemSelect = {
      title: "Manager",
      icon: "mdi-cog",
      path: `/managerview/${this.test.id}`
    };
  },
};
</script>

<style>
.background-top {
  background-color: #fca326;
  height: 45vh;
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
.header {
  background-color: #343344;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.idText {
  color: rgba(255, 255, 255, 0.28);
  font-size: 12px;
  margin-left: 15px;
  padding: 0px;
  margin-bottom: 0px;
  margin-top: 20px;
  align-items: flex-end;
}
</style>