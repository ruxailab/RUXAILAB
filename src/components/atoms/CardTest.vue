<template>
  <v-card shaped class="card">
    <v-container>
      <v-row justify="end">
        <v-menu v-model="menu" close-on-click close-on-content-click offset-x>
          <template v-slot:activator="{ on, attrs }">
            <v-col cols="9" align-self="start">
              <h3>{{item.title}}</h3>
            </v-col>
            <v-col cols="2" class="mr-2">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-col>
          </template>
          <v-list>
            <v-list-item v-if="accessLevel == 2" @click="openTest(item)">
              <v-list-item-icon>
                <v-icon>mdi-glasses</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Open Test</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="accessLevel < 2" @click="openManager(item)">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Manager</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="accessLevel == 0" @click="deleteTest(item)">
              <v-list-item-icon>
                <v-icon color="error">mdi-trash-can-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title color="red">Delete</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-row>

      <!-- Desktop/Tablet -->
      <v-row align="center">
      <div class="hidden-sm-and-down">
        <v-row class="bottomStart">
          <v-col>
            <v-icon x-large>mdi-account-circle</v-icon>
            <div class="text-center caption">{{new Date().toDateString()}}</div>
          </v-col>
        </v-row>

        <v-row class="bottomEnd">
          <v-btn color="grey darken-3 white--text" rounded :ripple="false">{{item.type}}</v-btn>
        </v-row>
      </div>
      </v-row>

      <!-- Mobile -->
      <v-row justify="center">
        <div class="hidden-md-and-up bottomMobile">
          <v-row class="ma-1" justify="space-between">
            <v-icon x-large>mdi-account-circle</v-icon>
            <v-btn color="grey darken-3 white--text" rounded :ripple="false">{{item.type}}</v-btn>
          </v-row>

          <v-row class="mt-2" justify="center">
            <div class="text-center caption">{{new Date().toDateString()}}</div>
          </v-row>
        </div>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: ["item", "accessLevel"],
  data: () => ({
    menu: false
  }),
  methods: {
    openTest(test) {
      this.$router.push("/testview/" + test.id);
    },
    async deleteTest(item) {
      console.log(item);
      await this.$store.dispatch("getTest", { id: item.id });
      await this.$store.dispatch("getAnswers", { id: item.answers });

      this.$store.dispatch("deleteTest", item).then(() => {
        //Remove test from myTests
        this.$store.dispatch("removeMyTest", {
          docId: this.test.admin.id,
          element: {
            id: item.id,
            title: item.title,
            type: item.type,
            reports: item.reports,
            answers: item.answers,
            accessLevel: 0
          },
          param: "myTests"
        });

        //Remove test from myCoops
        this.test.coop.forEach(coop => {
          this.$store.dispatch("removeMyCoops", {
            docId: coop.id,
            element: {
              id: item.id,
              title: item.title,
              type: item.type,
              reports: item.reports,
              answers: item.answers,
              accessLevel: coop.accessLevel
            }
          });
        });

        //Remove report from collection
        this.$store.dispatch("deleteReport", { id: item.reports });

        //Remove all myAnswers
        this.answers.answers.forEach(ans => {
          this.$store.dispatch("removeMyAnswers", {
            docId: ans.uid,
            element: {
              id: item.id,
              title: item.title,
              type: item.type,
              accessLevel: 2,
              reports: item.reports,
              answersSheet: Object.assign(
                {},
                {
                  heuristics: ans.heuristics,
                  progress: ans.progress,
                  total: ans.total,
                  email: ans.email,
                  uid: ans.uid
                }
              ),
              answers: item.answers
            }
          });
        });

        //Remove all answers
        this.$store.dispatch("deleteAnswers", { id: item.answers });
      });
    },
    openManager(test) {
      this.$router.push({
        path: "/managerview/" + test.id
      });
    }
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    test() {
      if (this.$store.getters.test) return this.$store.getters.test;
      return [];
    },
    answers() {
      return this.$store.state.answers.answers;
    }
  }
};
</script>

<style scoped>
.card {
  max-width: 330px;
  height: 200px;
  border-radius: 3px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
  background-color: #fff;
  border-bottom: 2px solid transparent;
  margin: 0 16px 16px 0;
}
.bottomStart {
  position: absolute;
  bottom: 0%;
  left: 5%;
}
.bottomEnd {
  position: absolute;
  bottom: 11%;
  right: 8%;
}
.bottomMobile {
  position: absolute;
  bottom: 0%;
  width: 80%;
}
</style>

<!--
@media screen and (max-width: 960px) {
  /*sm */
  .card {
    height: 300px;
    width: 250px;
    justify-self: center;
  }
}

@media screen and (max-width: 1264px) {
  /*md */
} 



-->