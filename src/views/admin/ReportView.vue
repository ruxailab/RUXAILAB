<template>
  <ShowInfo title="Reports">
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
              <v-list-item @click="removeReport(item)">
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
</template>

<script>
// import FormCooperation from "@/components/atoms/FormCooperation";
import ShowInfo from "@/components/organisms/ShowInfo";

export default {
  props: ["id"],
  components: {
    // FormCooperation,
    ShowInfo,
  },
  data: () => ({
    headers: [
      {
        text: "Id",
        align: "start",
        value: "uid",
      },
      { text: "Tester", value: "email" },
      { text: "Last Update", value: "log.date" },
      { text: "Progress", value: "progress", justify: "center" },
      { text: "Status", value: "log.status" },
      { text: "More", value: "more" },
    ], 
  }),
  methods: {
    removeReport(report) {
      this.$store.dispatch("removeReport", {
        docId: this.id,
        element: {
          id: report.uid,
        },
        param: "reports",
      });
    },
  },
  computed: {
    reports() {
      return this.$store.state.reports.reports || [];
    },
  },

  created() {
    if (!this.$store.reports) {
      this.$store.dispatch("getReports", { id: this.id });
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
