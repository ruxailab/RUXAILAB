<template>
  <v-content>
    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-data-table :headers="headers" :items="users" class="elevation-1">
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Users</v-toolbar-title>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ user }">
            <v-icon small class="mr-2" @click="editUser(user)">mdi-pencil</v-icon>
            <v-icon small click="">mdi-delete</v-icon>
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
                    <v-text-field label="Id" :value="editedUser.uid" disabled outlined></v-text-field>
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
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-card></v-card>
  </v-content>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    headers: [
      {
        text: "Id",
        align: "start",
        value: "uid"
      },
      { text: "E-mail", value: "email", align: "center" },
      { text: "Access Level", value: "accessLevel", align: "center" },
      { text: "Actions", value: "actions", align: "center" }
    ],
    users: [
      {
        uid: "nodnomdsoamfjandfn",
        email: "test@test.com",
        accessLevel: 0
      }
    ],
    editedIndex: -1,
    editedUser: {
      uid: "",
      email: "",
      accessLevel: 0
    },
    defaultUser: {
      uid: "",
      email: "",
      accessLevel: 0
    },
    accessLevels: [
      { text: "Super Admin", level: 0 },
      { text: "Admin", level: 1 },
      { text: "User", level: 2 }
    ]
  }),
  methods: {
    editUser(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedUser = Object.assign({}, item);
      this.dialog = true;
    },

    /*deleteItem(item) {
        item 
    },*/

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedUser = Object.assign({}, this.defaultUser);
        this.editedIndex = -1;
      });
    },

    save() {
      //implement users store
      this.close();
    }
  },
  computed: {},
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  created() {}
};
</script>

<style>
</style>