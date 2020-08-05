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
        :items-per-page="5"
        height="420px"
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

              <v-list-item v-if="item.log.status === 'Denied'">
                <v-list-item-title>Re-invite</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:item.progress="{ item }">
          <div>{{item.log.progress}}%</div>
        </template>
      </v-data-table>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            large
            dark
            fab
            fixed
            bottom
            right
            color="#F9A826"
            v-bind="attrs"
            v-on="on"
            @click="dialog = true"
          >
            <v-icon large>mdi-email</v-icon>
          </v-btn>
        </template>
        <span>Invite</span>
      </v-tooltip>

      <v-dialog v-model="dialog" color="white" max-width="600px">
        <v-card min-height="450px">
          <v-autocomplete
            v-model="userSelected"
            :items="filteredUsers"
            item-text="email"
            return-object
            label="Select User"
            outlined
            @input="pushToArray()"
            class="mx-2 pt-3"
            dense
            color="#fca326"
            prepend-icon="mdi-account-multiple-plus"
          ></v-autocomplete>

          <v-list class="mx-2" max-height="310" height="310" style="overflow:auto">
            <v-list-item link v-for="(guest, n) in invitations" :key="n">
              <v-row justify="center" align="center">
                <v-icon class="mr-2">mdi-account-circle</v-icon>
                <div>{{guest.email}}</div>
                <v-spacer></v-spacer>
                <v-btn icon @click="removeFromInvitations(guest)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-row>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="white--text" color="#F47C7C" @click="close">Cancel</v-btn>
            <v-btn class="white--text" color="#8EB995" @click="send">Send</v-btn>
          </v-card-actions>
          <!--<FormCooperation class="cardReport" :invitations="invitations" type="tester" />-->
        </v-card>
      </v-dialog>
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
    dialog: false,
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
    editedIndex: -1,
    //Invide
    userSelected: {},
    invitations: [],
  }),
  watch: {
    dialog(val) {
      val || this.close();
    },
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

    async send() {
      //Making invites
      let d = new Date();
      this.invitations.forEach((item) => {
        let inv = {
          to: {
            id: item.uid,
            email: item.email,
            accessLevel: 2,
          },
          from: {
            id: this.user.uid,
            email: this.user.email,
          },
          test: {
            id: this.test.id,
            title: this.test.title,
            type: this.test.type,
            reports: this.test.reports,
            answers: this.test.answers,
            cooperators: this.test.cooperators,
          },
        };

        this.$store
          .dispatch("pushNotification", {
            docId: inv.to.id,
            element: inv,
            param: "notifications",
          })
          .then(() => {
            item.log.date = d.toLocaleString("en-US");
            this.$store.dispatch("pushLog", {
              docId: this.id,
              element: item,
            });
          });
      });
      this.close();
    },

    pushToArray() {
      let obj = {
        uid: this.userSelected.id,
        email: this.userSelected.email,
        log: {
          date: null,
          progress: 0,
          status: "Invited",
        },
      };

      this.invitations.push(obj);

      this.userSelected = {};
    },

    removeFromInvitations(item) {
      let index = this.invitations.indexOf(item);

      this.invitations.splice(index, 1);
    },
    
    removeReport(report) {
      console.log(report);
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
    user() {
      return this.$store.state.auth.user;
    },
    reports() {
      return this.$store.state.reports.reports || [];
    },
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
    users() {
      if (this.$store.state.users.users) return this.$store.getters.admins;
      return [];
    },
    filteredUsers() {
      let hasUser = null;
      let array = [];
      this.users.forEach((user) => {
        hasUser = false;
        this.invitations.forEach((guest) => {
          if (guest.uid === user.id) {
            hasUser = true;
          }
        });

        if (!hasUser && this.reports)
          //evita um foreach se ja tiver encontrado
          this.reports.reports.forEach((guest) => {
            if (guest.uid === user.id) {
              hasUser = true;
            }
          });

        if (!hasUser) array.push(user);
      });
      return array;
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
