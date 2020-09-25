<template>
  <v-main>
    <Snackbar></Snackbar>

    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card>
        <v-card-title
          class="headline error white--text"
          primary-title
        >Are you sure you want to delete this user?</v-card-title>

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="grey lighten-3" text @click="dialogDel = false, userClicked = null">Cancel</v-btn>
          <v-btn class="red white--text ml-1" text @click="deleteUser(userClicked)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-data-table
          :search="search"
          :headers="headers"
          :items="users"
          class="elevation-1"
          :loading="loading"
        >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Users</v-toolbar-title>
            </v-toolbar>
            <v-text-field
              outlined
              prepend-inner-icon="mdi-magnify"
              v-model="search"
              class="mx-3"
              dense
              label="Search"
            ></v-text-field>
          </template>
          <template v-slot:item.accessLevel="{ item }">
            <div>{{level(item.accessLevel)}}</div>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editUser(item)">mdi-pencil</v-icon>
            <v-icon color="red" small click @click="dialogDel = true, userClicked = item">mdi-delete</v-icon>
          </template>
        </v-data-table>
        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Edit User</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Id" :value="editedUser.id" disabled outlined></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field label="E-mail" :value="editedUser.email" disabled outlined></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <p>Access Level</p>
                    <v-overflow-btn
                      class="my-2"
                      :items="accessLevels"
                      v-model="editedUser.accessLevel"
                      item-value="level"
                    ></v-overflow-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save(editedUser)">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-card></v-card>
  </v-main>
</template>

<script>
import Snackbar from "@/components/atoms/Snackbar";

export default {
  components: {
    Snackbar,
  },
  data: () => ({
    dialog: false,
    dialogDel: false,
    userClicked: null,
    search: "",
    headers: [
      {
        text: "Id",
        align: "start",
        value: "id",
      },
      { text: "E-mail", value: "email", align: "center" },
      { text: "Access Level", value: "accessLevel", align: "center" },
      { text: "Actions", value: "actions", align: "end" },
    ],
    editedIndex: -1,
    editedUser: {
      uid: "",
      email: "",
      accessLevel: 0,
    },
    defaultUser: {
      uid: "",
      email: "",
      accessLevel: 0,
    },
    accessLevels: [
      { text: "Super Admin", level: 0 },
      { text: "Admin", level: 1 },
      { text: "User", level: 2 },
    ],
  }),
  methods: {
    editUser(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedUser = Object.assign({}, item);
      this.dialog = true;
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedUser = Object.assign({}, this.defaultUser);
        this.editedIndex = -1;
      });
    },

    save(user) {
      let payload = {
        uid: user.id,
        customClaims: {
          accessLevel: user.accessLevel,
        },
      };
      this.$store.dispatch("updateLevel", { data: payload });
      this.close();
    },
    level(lv) {
      let text;
      this.accessLevels.forEach((item) => {
        if (item.level == lv) {
          text = item.text;
        }
      });
      return text;
    },
    deleteUser(user) {
      this.dialogDel = false;
      this.$store
        .dispatch("deleteAuth", user)
        .then(() => {
          this.$store
            .dispatch("deleteUser", user)
            .then(() => {
              this.$store.commit(
                "setSuccess",
                "Successfully deleted user " + this.userClicked.email
              );
              this.$delete(this.users, this.users.indexOf(this.userClicked));
              this.userClicked = null;
            })
            .catch((err) => {
              console.error(err);
              this.commit("setError", "Error deleting user");
            });
        })
        .catch((err) => {
          console.error(err);
          this.commit("setError", "Error deleting user");
        });
    },
  },
  computed: {
    users() {
      return this.$store.state.users.users || [];
    },
    loading() {
      return this.$store.state.tests.loading;
    },
    dialogText() {
      return (
        "Are you sure you want to delete the user " +
        (this.userClicked !== null ? this.userClicked.email : "") +
        "? This action can't be undone."
      );
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  created() {
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
  },
};
</script>