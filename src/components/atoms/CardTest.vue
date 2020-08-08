<template>
  <div>
    <!--
    <Snackbar />
    <Dialog :dialog="dialog" :text="dialogText">
      <v-card-title slot="title" class="headline error white--text" primary-title>Are you sure you want to delete this test?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialog = false">Cancel</v-btn>
        <v-btn
          class="red white--text ml-1"
          :loading="loading"
          text
          @click="deleteTest(item), loading = true"
        >Delete</v-btn>
      </div>
    </Dialog> -->
    <v-hover v-slot:default="{ hover }">

    <v-card :elevation="hover ? 24 : 10" shaped class="card" @click="openManager(item)">

      <v-container>
        <v-col cols="12" align-self="start">
          <h4>{{item.title}}</h4>
        </v-col>
       <v-row justify="end">
           <!--
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
              <v-list-item v-if="accessLevel == 0" @click="dialog = true">
                <v-list-item-icon>
                  <v-icon color="error">mdi-trash-can-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title color="red">Delete</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu> -->
        </v-row>

        <!-- Desktop/Tablet -->
        <v-row align="center">
          <div class="hidden-sm-and-down">
            <v-row class="bottomStart">
              <v-col>
                <v-icon x-large>mdi-account-circle</v-icon>
                <v-btn color="grey darken-3 white--text" disabled rounded :ripple="false">{{item.type}}</v-btn>
                <div class="text-center caption">Created  {{new Date().toDateString()}}</div>

              </v-col>
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
  </v-hover>

  </div>
</template>

<script>
//
// import Snackbar from "@/components/atoms/Snackbar";
// import Dialog from "@/components/atoms/Dialog";

export default {
  props: ["item", "accessLevel"],
  //
  // components: {
  //   Snackbar,
  //   Dialog,
  // },
  data: () => ({
    menu: false,
    dialog: false,
    loading: false,
  }),
  methods: {
    openTest(test) {
      this.$router.push("/testview/" + test.id);
    },
    async deleteTest(item) {
      await this.$store.dispatch("getTest", { id: item.id });
      await this.$store.dispatch("getAnswers", { id: item.answers });
      await this.$store.dispatch("getReports", { id: item.reports });
      await this.$store.dispatch("getCooperators", { id: item.cooperators });

      this.$store
        .dispatch("deleteTest", item)
        .then(() => {
          //Remove test from myTests
          this.$store
            .dispatch("removeMyTest", {
              docId: this.test.admin.id,
              element: {
                id: item.id,
                title: item.title,
                type: item.type,
              },
              param: "myTests",
            })
            .then(() => {
              this.loading = false;
              this.$store.commit("setSuccess", "Project successfully deleted");
            })
            .catch((err) => {
              this.$store.commit("setError", err);
            });

          //Remove report from collection
          this.$store.dispatch("deleteReport", { id: item.reports });

          // Remove all myAnswers
          this.reports.reports.forEach((rep) => {
            this.$store.dispatch("removeMyAnswers", {
              docId: rep.uid,
              element: {
                id: item.id,
                title: item.title,
                type: item.type,
              },
            });
          });

          //Remove all answers
          this.$store.dispatch("deleteAnswers", { id: item.answers });

          //Remove all myCoops
          this.cooperators.cooperators.forEach((guest) => {
            this.$store.dispatch("removeMyCoops", {
              docId: guest.id,
              element: {
                id: item.id,
                title: item.title,
                type: item.type,
              },
            });
          });

          //Remove all Cooperators
          this.$store.dispatch("deleteCooperators", { id: item.cooperators });
        })
        .catch((err) => {
          this.$store.commit("setError", err);
        });
    },
    openManager(test) {
      this.$router.push({
        path: "/managerview/" + test.id,
      });
    },
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
      return this.$store.state.answers.answers || [];
    },
    reports() {
      return this.$store.state.reports.reports || [];
    },
    cooperators() {
      return this.$store.state.cooperators.cooperators || [];
    },
  },
  created() {
    this.dialogText = ''
  },
  mounted() {
    this.dialogText = `Are you sure you want to delete your test "${this.item.title}"? This action can't be undone`;
  },
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
