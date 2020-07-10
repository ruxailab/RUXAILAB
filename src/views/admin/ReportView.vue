<template>
  <v-container>
    <v-row justify="space-around">
      <v-col cols="12" class="titleView">Reports</v-col>
      <v-col cols="12" class="pb-0 mb-0">
        <v-row justify="end" dense>
          <p class="subtitleView">Last Updated: {{new Date().toLocaleString('en')}}</p>
        </v-row>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-row justify="center">
      <v-col cols="10">
        <v-data-table
          class="datatable"
          :headers="headers"
          :items="reports.reports"
          :items-per-page="5"
          height="420px"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2">{{item}}mdi-pencil</v-icon>
            <v-icon small>mdi-delete</v-icon>
          </template>
        </v-data-table>

        <v-dialog v-model="dialog" color="white" max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn large dark fab fixed bottom right color="#F9A826" v-on="on">
              <v-icon large>mdi-email</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-container>
              <FormCooperation class="cardReport" :invitations="invitations" type="tester" />
              <v-btn text @click="close">Cancel</v-btn>
              <v-btn text @click="save">Send</v-btn>
            </v-container>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FormCooperation from "@/components/atoms/FormCooperation";
export default {
  props: ["id"],
  components: {
    FormCooperation
  },
  data: () => ({
    invitations: [],
    dialog: false,
    headers: [
      {
        text: "Id",
        align: "start",
        value: "uid"
      },
      { text: "Tester", value: "email" },
      { text: "Last Update", value: "log.date" },
      { text: "Progress", value: "log.progress", justify: "center" },
      { text: "Status", value: "log.status" },
      { text: "Actions", value: "actions" }
    ],
    records: [
      {
        id: "101",
        tester: {
          id: "null",
          email: "null@null.com"
        },
        log: {
          date_init: "null",
          progress: "null",
          state: "null"
        }
      }
    ],
    editedIndex: -1,
    editedRecord: {
      id: null,
      tester: {
        id: null,
        email: null
      },
      log: {
        date_init: null,
        progress: null,
        state: null
      }
    },
    defaultRecord: {
      id: null,
      tester: {
        id: null,
        email: null
      },
      log: {
        date_init: null,
        progress: null,
        state: null
      }
    }
  }),
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.desserts.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.desserts.splice(index, 1);
    },

    close() {
      this.dialog = false;
      this.invitations = [];
    },

    async save() {
      //Making invites
      this.invitations.forEach(item => {
        let inv = {
          to: {
            id: item.id,
            email: item.email,
            accessLevel: item.accessLevel
          },
          from: {
            id: this.user.uid,
            email: this.user.email
          },
          test: {
            id: this.reports.test.id,
            title: this.reports.test.title,
            type: this.reports.test.type,
            reports: this.id,
            answers: this.reports.test.answers
          }
        };
        this.$store.dispatch("pushNotification", {
          docId: inv.to.id,
          element: inv,
          param: "notifications"
        });
      });
      this.close();
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    reports() {
      return this.$store.state.reports.reports || [];
    },
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    }
  },

  created() {
    if (!this.$store.reports) {
      this.$store.dispatch("getReports", { id: this.id });
    }
    this.test = Object.assign(
      {},
      this.$store.state.auth.user.myTests.find(test => test.reports == this.id)
    );
  }
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
.datatable {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 10px;
}
.cardReport {
  box-shadow: 0px;
}
</style>