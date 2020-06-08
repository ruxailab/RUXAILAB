<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card>
          <v-data-table :headers="headers" :items="reports.reports" class="elevation-1">
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon small class="mr-2">{{item}}mdi-pencil</v-icon>
              <v-icon small>mdi-delete</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" color="white" max-width="600px">
      <template v-slot:activator="{ on }">
        <v-btn large dark fab fixed bottom right color="primary" v-on="on">
          <v-icon>mdi-email</v-icon>
        </v-btn>
      </template>
      <FormCooperation :invitations="invitations" type="tester" />

      <v-btn text @click="close">Cancel</v-btn>
      <v-btn text @click="save">Send</v-btn>
    </v-dialog>
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
      { text: "Date_init", value: "log.date" },
      { text: "Progress", value: "log.progress" },
      { text: "State", value: "log.status" },
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
  }
};
</script>

<style>
</style>