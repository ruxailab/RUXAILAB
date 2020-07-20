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
      <v-col cols="12">
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

          <template v-slot:item.progress="{ item }">
            <div>{{item.log.progress}}%</div>
          </template>
        </v-data-table>

        <v-dialog v-model="dialog" color="white" max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn large dark fab fixed bottom right color="#F9A826" v-on="on">
              <v-icon large>mdi-email</v-icon>
            </v-btn>
          </template>

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

            <v-list class="mx-2">
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
              <v-btn class="white--text" color="#8EB995" @click="save">Send</v-btn>
            </v-card-actions>
            <!--<FormCooperation class="cardReport" :invitations="invitations" type="tester" />-->
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import FormCooperation from "@/components/atoms/FormCooperation";
export default {
  props: ["id"],
  components: {
    // FormCooperation
  },
  data: () => ({
    dialog: false,
    headers: [
      {
        text: "Id",
        align: "start",
        value: "uid"
      },
      { text: "Tester", value: "email" },
      { text: "Last Update", value: "log.date" },
      { text: "Progress", value: "progress", justify: "center" },
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
    },
    //Invide
    userSelected: {},
    invitations: []
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
      let d = new Date();
      this.invitations.forEach(item => {
        let inv = {
          to: {
            id: item.uid,
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
          docId: inv.to.uid,
          element: inv,
          param: "notifications"
        })
        .then(() => {
          item.log.date = d.toLocaleString('en-US');
          this.$store.dispatch("pushLog", {
            docId: this.id,
            element: item
          })
        })
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
          status: "Invited"
        }
      };

      this.invitations.push(obj);

      this.userSelected = {};
    },
    removeFromInvitations(item) {
      let index = this.invitations.indexOf(item);

      this.invitations.splice(index, 1);
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
    },
    users() {
      if (this.$store.state.users.users) return this.$store.getters.admins;
      return [];
    },
    filteredUsers() {
      let hasUser = null;
      let array = [];
      this.users.forEach(user => {
        hasUser = false;
        this.invitations.forEach(guest => {
          if (guest.id === user.id) {
            hasUser = true;
          }
        });

        if (!hasUser)
          //evita um foreach se ja tiver encontrado
          this.reports.reports.forEach(guest => {
            if (guest.uid === user.id) {
              hasUser = true;
            }
          });

        if (!hasUser) array.push(user);
      });
      return array;
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
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
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