<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-row class="nav pa-0 ma-0" dense>
      <v-navigation-drawer clipped v-model="drawer" :mini-variant="mini" permanent color="#3F3D56">
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
          <v-list class="mt-0 pa-0">
            <v-list-item class="pt-0" style="cursor: pointer">
              <v-list-item-icon @click="go(`/settingsview/${test.id}`)">
                <v-icon color="white">mdi-cog</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item style="cursor: pointer">
              <v-list-item-icon @click.stop="mini = !mini">
                <v-icon color="white">mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </div>
      </v-navigation-drawer>

      <!-- View -->
      <v-col class="background pa-0 ma-0">
        <div v-if="this.$route.path.includes('manager')">
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
    loading: true,
    tests: [],
    mini: true,
    isCoops: null,
    selectedTest: null,
    item: 0,
  }),
  methods: {
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

      return test;
    },
    index: {
      get() {
        if (this.items){
          return this.items.indexOf(
            this.items.find((item) => item.path.includes(this.$route.path))
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
          icon: "mdi-chart-bar",
          path: `/answerview/${this.test.answers}`,
          id: 4
        },
        {
          title: "Analytics",
          icon: "mdi-alien-outline", //Change It
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
  },
  created() {
    this.itemSelect = {
      title: "Manager",
      icon: "mdi-home",
      path: `/managerview/${this.test.id}`,
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
