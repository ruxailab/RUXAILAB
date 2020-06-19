<template>
  <v-card shaped class="card">
    <v-container>
      <v-row justify="end" align="center">
        <v-menu v-model="menu" close-on-click close-on-content-click offset-x>
          <template v-slot:activator="{ on, attrs }">
            <v-col cols="2" class="button">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-col>
          </template>
          <v-list>
            <v-list-item @click="openManager(item)">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Manager</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="deleteTest(item)">
              <v-list-item-icon>
                <v-icon color="error">mdi-trash-can-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title color="red">Delete</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-col cols="12" class="text" align-self="start">
          <h1>{{item.title}}</h1>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: ["item"],
  data: () => ({
    menu: false
  }),
  methods: {
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
  position: relative;
  overflow: hidden;
  height: 300px;
  width: 300px;
  border-radius: 29px;
  z-index: 2;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
.card:before {
  content: " ";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  z-index: -1;
  background-image: url(../../assets/cardTest.svg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: rotate(15deg);
}
.button {
  margin-right: 10px;
  margin-top: 10px;
}
.text {
  margin-top: 0px;
  padding-top: 0px;
}
</style>