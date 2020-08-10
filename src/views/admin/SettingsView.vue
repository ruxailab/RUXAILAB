<template>
  <v-container v-if="test">
    <Snackbar />

    <Dialog
      :dialog="dialogAlert"
      text="Are you sure you want to leave? All your changes will be discarded"
    >
      <v-card-title
        slot="title"
        class="headline error accent-4 white--text"
        primary-title
      >Are you sure you want to leave?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialogAlert = false">Stay</v-btn>
        <v-btn
          class="error accent-4 white--text ml-1"
          text
          @click="change = false,$router.push(go)"
        >Leave</v-btn>
      </div>
    </Dialog>

    <Dialog :dialog="dialogDel" :text="dialogText">
      <v-card-title
        slot="title"
        class="headline error white--text"
        primary-title
      >Are you sure you want to delete this test?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialogDel = false">Cancel</v-btn>
        <v-btn
          class="red white--text ml-1"
          :loading="loading"
          text
          @click="deleteTest(object), loading = true"
        >Delete</v-btn>
      </div>
    </Dialog>

    <ShowInfo title="Settings">
      <div slot="content">
        <v-card class="dataCard">
          <v-row>
            <v-col class="mb-1 pa-4 pb-1">
              <p class="subtitleView">Current Test</p>
            </v-col>
            <v-spacer></v-spacer>
            <v-btn @click="dialogDel = true" color="#e04141" icon class="my-1 mx-4">
              <v-icon color="#f26363">mdi-trash-can-outline</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>
          <FormTestDescription
            v-if="object"
            :test="object"
            @valForm="validate"
            ref="form1"
            :lock="true"
            @change="change = true"
          />
        </v-card>
        <v-tooltip left v-if="change">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-if="change"
              large
              dark
              fab
              fixed
              bottom
              right
              color="#F9A826"
              @click=" submit()"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon large>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>
      </div>
    </ShowInfo>
  </v-container>
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";
import Snackbar from "@/components/atoms/Snackbar";
import ShowInfo from "@/components/organisms/ShowInfo";
import Dialog from "@/components/atoms/Dialog";

export default {
  props: ["id"],
  components: {
    FormTestDescription,
    Snackbar,
    ShowInfo,
    Dialog,
  },
  data: () => ({
    object: null,
    change: false,
    valids: [false, true, true],
    dialogAlert: false,
    dialogDel: false,
    loading: false,
  }),
  methods: {
    validate(valid, index) {
      this.valids[index] = valid;
    },
    async submit() {
      await this.$store.dispatch("getAnswers", { id: this.test.answers });
      await this.$store.dispatch("getReports", { id: this.test.reports });
      await this.$store.dispatch("getCooperators", {
        id: this.test.cooperators,
      });

      this.$store
        .dispatch("updateTest", {
          docId: this.id,
          data: this.object,
        })
        .then(() => {
          this.$store.dispatch("updateMyTest", {
            docId: this.object.admin.id,
            element: {
              id: this.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              cooperators: this.object.cooperators,
              accessLevel: 0,
            },
          });

          this.cooperators.cooperators.forEach((coop) => {
            this.$store.dispatch("updateMyCoops", {
              docId: coop.id,
              element: {
                id: this.id,
                title: this.object.title,
                type: this.object.type,
                reports: this.object.reports,
                answers: this.object.answers,
                cooperators: this.object.cooperators,
                accessLevel: coop.accessLevel,
              },
            });
          });

          this.answers.test.title = this.object.title;
          this.reports.test.title = this.object.title;
          this.cooperators.test.title = this.object.title;

          this.$store.dispatch("updateTestAnswer", {
            docId: this.test.answers,
            data: this.answers,
          });

          this.$store.dispatch("updateTestReport", {
            docId: this.test.reports,
            data: this.reports,
          });

          this.$store.dispatch("updateTestCooperators", {
            docId: this.test.cooperators,
            data: this.cooperators,
          });

          this.$store.commit("setSuccess", "Test updated succesfully");
        })
        .catch((err) => {
          this.$store.commit("setError", err);
        });
    },
    preventNav(event) {
      if (!this.change) return;
      event.preventDefault();
      event.returnValue = "";
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
              this.$router.push("/testslist").then(() => {
                this.$store.commit(
                  "setSuccess",
                  "Project successfully deleted"
                );
              });
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
  },
  watch: {
    test: async function () {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test);
      }
    },
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
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
    dialogText() {
      if (this.object)
        return `Are you sure you want to delete your test "${this.object.title}"? This action can't be undone`;

      return `Are you sure you want to delete this test? This action can't be undone`; //in case object isnt loaded
    },
  },
  created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      this.$store.dispatch("getTest", { id: this.id });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialogAlert = true;
      this.go = to.path;
    } else {
      next();
    }
  },
  beforeMount() {
    window.addEventListener("beforeunload", this.preventNav);
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.preventNav);
  },
};
</script>

<style scoped>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}

.dataCard {
  background: #f5f7ff;
  min-height: 350px;
}
</style>
