<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-overlay class="text-center" v-model="loading">
      <v-progress-circular indeterminate color="#fca326" size="50"></v-progress-circular>
      <div class="white-text mt-3">Loading Test</div>
    </v-overlay>

    <v-row class="nav pa-0 ma-0" dense>
      <v-navigation-drawer
        clipped
        v-model="drawer"
        :mini-variant="mini"
        permanent
        color="#3F3D56"
        class="hidden-sm-and-down"
      >
        <!-- Navigation header -->
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
                  :items="testsList"
                  :label="test.title"
                  background-color="#343344"
                  style="max-width: 240px"
                ></v-overflow-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <!-- Navigation options -->
        <v-list flat dense v-if="items">
          <div v-if="mini">
            <v-tooltip right v-for="(item,n) in items" :key="n">
              <template v-slot:activator="{ on, attrs }">
                <v-list-item @click="index = n,go(item)" v-bind="attrs" v-on="on">
                  <v-list-item-icon>
                    <v-icon :color="index == item.id? '#fca326' : '#bababa'">{{ item.icon }}</v-icon>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title
                      :style="index == item.id? 'color: #fca326': 'color:#bababa'"
                    >{{ item.title }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <span>{{ item.title }}</span>
            </v-tooltip>
          </div>

          <div v-else>
            <v-list-item v-for="(item,n) in items" :key="n" @click="index = n,go(item)">
              <v-list-item-icon>
                <v-icon :color="index == item.id? '#fca326' : '#bababa'">{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="index == item.id? 'color: #fca326': 'color:#bababa'"
                >{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </div>
        </v-list>

        <!-- Navigation footer -->
        <div class="footer" v-if="!mini">
          <v-btn icon @click="go(`/settingsview/${test.id}`)" class="ml-3">
            <v-icon color="white">mdi-cog</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click.stop="mini = !mini" class="mr-2">
            <v-icon color="white">mdi-chevron-left</v-icon>
          </v-btn>
        </div>

        <div class="footer" style="height:16%" v-else>
          <v-col>
            <v-btn icon @click="go(`/settingsview/${test.id}`)">
              <v-icon :color="isSettings ? '#fca326' : 'white'">mdi-cog</v-icon>
            </v-btn>
            <v-btn icon @click.stop="mini = !mini" class="mt-2">
              <v-icon color="white">mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </div>
      </v-navigation-drawer>

      <!-- View -->
      <v-col class="background pa-0 ma-0">
        <div v-if="this.$route.path.includes('manager')">
          <div class="back-gradient">
            <v-row></v-row>
            <v-row align="center" justify="center" style="height: 100%">
              <v-col class="text-div">
                <div
                  class="display-3 mb-4 white--text mobile-center"
                  style="font-size: 60px; font-weight: 500"
                >Manager</div>
                <div style="font-size: 22px" class="white--text mb-4 mobile-center">{{test.title}}</div>
              </v-col>
              <v-img
                class="hidden-sm-and-down"
                contain
                max-width="40%"
                max-height="85%"
                src="@/assets/manager/IntroManager.svg"
              ></v-img>
            </v-row>
          </div>
          <div>
            <v-container style="width: 70%">
              <div class="presentation-text">Edit and invite people to your test</div>

              <!-- Top Cards -->
              <v-row justify="center" justify-md="space-around">
                <v-col cols="12" md="6" v-for="(item, n) in topCards" :key="n">
                  <v-card height="380px" :style="item.cardStyle"  @click="go(item.path)" hover > 
                    <v-row style="height: 290px" justify="center" align="center">
                      <v-img
                        max-height="220"
                        :style="item.imageStyle"
                        contain
                        :src="require('../../assets/manager/' + item.image)"
                      ></v-img>
                    </v-row>

                    <div
                      class="white--text pl-4"
                      :style="{height: '90px', position: 'absolute', bottom: '0', width: '100%', 'background-color': item.bottom, 'padding-top': '10px', 'border-top': '.3px solid #505050'}"
                    >
                      <h2>{{ item.title }}</h2>
                      <div>{{ item.description }}</div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <div class="presentation-text mt-5">Analyze your project and evaluators</div>

              <!-- Bottom Cards -->
              <v-row justify="center" justify-md="space-around">
                <v-col cols="12" md="4" v-for="(item, i) in bottomCards" :key="i">
                  <v-card height="350px" :style="item.cardStyle" @click="go(item.path)" hover>
                    <v-row style="height: 260px" justify="center" align="center" class="px-5">
                      <v-img
                        height="150"
                        contain
                        :src="require('../../assets/manager/' + item.image)"
                      ></v-img>
                    </v-row>

                    <div
                      class="white--text pl-4"
                      :style="{height: '90px', position: 'absolute', bottom: '0', width: '100%', 'background-color': item.bottom, 'border-top': '.3px solid #505050'}"
                    >
                      <h2>{{ item.title }}</h2>
                      <div>{{ item.description }}</div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </div>
        <router-view @goToCoops="go(items[6])" v-else></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    drawer: true,
    loading: true,
    tests: [],
    mini: true,
    isCoops: null,
    selectedTest: null,
    item: 0,
  }),
  methods: {
    log() {
      console.log("log");
    },
    pushToTest() {
      this.$router.push("/managerview/" + this.selectedTest);
      this.index = 0;
    },
    go(item) {
      if (item.id == undefined) this.$router.push(item);
      else {
        if (item.id == 2) window.open(item.path);
        else this.$router.push(item.path);
      }
    },
    setIsCoops(payload) {
      this.isCoops = payload;
    },
    setLoading(payload) {
      this.loading = payload;
    },
  },
  computed: {
    testsList() {
      if (!this.isCoops) return this.$store.state.auth.user.myTests;
      else return this.$store.state.auth.user.myCoops;
    },
    test() {
      let seach = this.selectedTest || this.id;
      let test = Object.assign(
        {},
        this.$store.state.auth.user.myTests.find((test) =>
          Object.values(test).includes(seach)
        )
      );

      if (!Object.keys(test).length) {
        //se o objeto for vazio
        test = Object.assign(
          {},
          this.$store.state.auth.user.myCoops.find((test) =>
            Object.values(test).includes(seach)
          )
        );

        if (Object.keys(test).length) {
          //se nao for vazio entao é coops
          this.setIsCoops(true);
        }
      } else {
        this.setIsCoops(false);
      }

      if (!Object.keys(test).length) {
        this.setLoading(true);
      } else {
        this.setLoading(false);
      }

      this.$store.commit("setManagerIDS", test);
      return test;
    },
    index: {
      get() {
        if (this.items) {
          return this.items.indexOf(
            this.items.find(item =>
              item.path.split("/").includes(this.$route.path.split("/")[1])
            )
          );
        }
        return 0;
      },
      set(item) {
        return item;
      },
    },
    items() {
      let items = [
        {
          title: "Manager",
          icon: "mdi-home",
          path: `/managerview/${this.test.id}`,
          id: 0,
        },
        {
          title: "Test",
          icon: "mdi-file-document-edit",
          path: `/edittest/${this.test.id}`,
          id: 1,
        },
        {
          title: "Preview",
          icon: "mdi-file-eye",
          path: `/testview/${this.test.id}`,
          id: 2,
        },
        {
          title: "Reports",
          icon: "mdi-book-multiple",
          path: `/reportview/${this.test.reports}`,
          id: 3,
        },
        {
          title: "Answers",
          icon: "mdi-order-bool-ascending-variant",
          path: `/answerview/${this.test.answers}`,
          id: 4
        },
        {
          title: "Analytics",
          icon: "mdi-chart-bar",
          path: `/analyticsview/${this.test.answers}`,
          id: 5
        }
      ];

      if (this.test.accessLevel == 0) {
        items.push({
          title: "Cooperators",
          icon: "mdi-account-group",
          path: `/cooperatorsview/${this.test.cooperators}`,
          id: 6
        });
      }

      return items;
    },
    isSettings() {
      return this.$route.path.includes("/settings");
    },
    topCards() {
      return [
        {
          image: "IntroEdit.svg",
          title: "Edit",
          imageStyle: "transform: rotateY(180deg);",
          bottom: "#740999",
          description: "Start creating and editing your test.",
          cardStyle:
            "background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden",
          path: `/edittest/${this.test.id}`
        },
        {
          image: "IntroCoops.svg",
          title: "Cooperators",
          imageStyle: "",
          bottom: "#DBC717",
          description: "Invite people to help you in your test.",
          cardStyle:
            "background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden",
          path: `/cooperatorsview/${this.test.cooperators}`
        }
      ];
    },
    bottomCards() {
      return [
        {
          image: "IntroReports.svg",
          title: "Reports",
          imageStyle: "height: 250px",
          bottom: "#E03C3C",
          description: "Take a look at how your evaluators are doing.",
          cardStyle:
            "background-image: radial-gradient(circle at top right, #ec6618, #f54e42); overflow: hidden",
          path: `/reportview/${this.test.reports}`
        },
        {
          image: "IntroAnswer.svg",
          title: "Answers",
          imageStyle: "height: 250px",
          bottom: "#4DA73E",
          description: "See how your evaluators are evaluating your project.",
          cardStyle:
            "background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden",
          path: `/answerview/${this.test.answers}`
        },
        {
          image: "IntroAnalytics.svg",
          title: "Analytics",
          imageStyle: "height: 250px",
          bottom: "#2666E1",
          description: "Analyze comments and answers from your evaluators.",
          cardStyle:
            "background-image: radial-gradient(circle at top right, #32bde7, #2488e0); overflow: hidden",
          path: `/analyticsview/${this.test.answers}`
        }
      ];
    }
  }
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
  height: 94%;
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
.presentation-text {
  color: rgb(87, 84, 100);
  font-weight: 700;
  font-size: 22px;
  margin-bottom: 20px;
}
.back-gradient {
  height: 60vh;
  background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
}
.text-div {
  max-width: 45%;
}
@media screen and (max-width: 960px) {
  .presentation-text {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}
</style>
