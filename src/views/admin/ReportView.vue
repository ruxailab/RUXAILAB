<template>
  <div>
    <Snackbar />
    <Dialog :dialog="dialog" :text="dialogText">
      <v-card-title
        slot="title"
        class="headline error white--text"
        primary-title
      >Are you sure you want to delete this test?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialog = false">Cancel</v-btn>
        <v-btn
          class="red white--text ml-1"
          :loading="loadingBtn"
          text
          @click="removeReport(report), loadingBtn = true"
        >Delete</v-btn>
      </div>
    </Dialog>

    <v-overlay class="text-center" v-model="loading">
      <v-progress-circular indeterminate color="#fca326" size="50"></v-progress-circular>
      <div class="white-text mt-3">Loading Reports</div>
    </v-overlay>

    <Intro v-if="reports.reports.length == 0 && !loading" @goToCoops="goToCoops()" />
    <ShowInfo title="Reports" v-else>
      <v-row justify="end" dense slot="top" class="mr-3">
        <p class="subtitleView">Last Updated: {{new Date().toLocaleString('en')}}</p>
      </v-row>

      <div slot="content" class="ma-0 pa-0">
        <v-data-table
          style="background: #f5f7ff"
          :headers="headers"
          :items="reports.reports"
          :items-per-page="10"
          height="420px"
          dense
        >
          <template v-slot:item.more="{ item }">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="dialog = true, report = item">
                  <v-list-item-title>Remove Report</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <template v-slot:item.progress="{ item }">
            <div>{{item.log.progress}}%</div>
          </template>
        </v-data-table>
      </div>
    </ShowInfo>
  </div>
</template>

<script>
// import FormCooperation from "@/components/atoms/FormCooperation";
import ShowInfo from "@/components/organisms/ShowInfo";
import Intro from "@/components/atoms/IntroReports";
import Dialog from "@/components/atoms/Dialog";
import Snackbar from "@/components/atoms/Snackbar";

export default {
  props: ["id"],
  components: {
    // FormCooperation,
    ShowInfo,
    Intro,
    Snackbar,
    Dialog
  },
  data: () => ({
    headers: [
      { text: "Evaluator", value: "email" },
      { text: "Last Update", value: "log.date" },
      { text: "Progress", value: "progress", justify: "center" },
      { text: "Status", value: "log.status" },
      { text: "More", value: "more", justify: "end" },
    ],
    loading: true,
    dialog: false,
    loadingBtn: false,
    report: null
  }),
  methods: {
    removeReport(report) {
      this.$store
        .dispatch("removeReport", {
          docId: this.id,
          element: {
            id: report.uid,
          },
          param: "reports",
        })
        .then(() => {
          this.$store.commit("setSuccess", "Report successfully deleted");
          this.loadingBtn = false;
          this.dialog = false;
        })
        .catch((err) => {
          this.$store.commit("setError", err);
        });
    },
    goToCoops() {
      this.$emit("goToCoops");
    },
  },
  computed: {
    reports() {
      return (
        this.$store.state.reports.reports || Object.assign({}, { reports: [] })
      );
    },
    dialogText() {
      return 'Are you sure you want to delete ' + (this.report !== null ? this.report.email : '') + `'s report? This action can't be undone`;
    }
  },
  watch: {
    reports() {
      if (Object.keys(this.reports).length) this.loading = false;
    },
  },
  created() {
    if (!this.$store.state.reports.reports) {
      this.$store.dispatch("getReports", { id: this.id });
    } else if(this.$store.state.reports.reports.id !== this.id)
    this.$store.dispatch("getReports", { id: this.id });
    else {
      this.loading = false;
    }
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(
        (test) => test.reports == this.id
      )
    );
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
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
.cardReport {
  box-shadow: 0px;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #fca326;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>
