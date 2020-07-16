<template>
  <v-container v-if="cooperators" class="ma-0 pa-0">
    <v-snackbar v-model="snackbar" :color="snackColor" top :timeout="2000">
      <p>{{ snackMsg }}</p>
      <v-btn text @click="snackbar = false">
        <v-icon>mdi-close-circle-outline</v-icon>
      </v-btn>
    </v-snackbar>
    <v-btn
      v-if="change"
      large
      dark
      fab
      fixed
      bottom
      right
      color="#F9A826"
      @click="submit(), change = false"
    >
      <v-icon large>mdi-email</v-icon>
    </v-btn>

    <ShowInfo title="Cooperators">
      <v-autocomplete
        v-model="userSelected"
        :items="filteredUsers"
        item-text="email"
        return-object
        label="Select User"
        outlined
        @input="pushToArray()"
      ></v-autocomplete>

      <v-data-table :items="cooperatorsEdit" :headers="headers">
        <!-- Invited -->
        <template v-slot:item.invited="{ item }">
          <v-icon color="green" v-if="item.invited">mdi-checkbox-marked-circle-outline</v-icon>
          <v-icon color="red" v-else>mdi-close-circle-outline</v-icon>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-icon color="blue" v-if="item.status == null">mdi-checkbox-blank-circle-outline</v-icon>
          <v-icon color="green" v-else-if="item.status">mdi-checkbox-marked-circle-outline</v-icon>
          <v-icon color="red" v-else>mdi-close-circle-outline</v-icon>
        </template>

        <!-- Role -->
        <template v-slot:item.accessLevel="{ item }">
          <v-select
            @change="recordChange(item)"
            v-model="item.accessLevel"
            return-object
            dense
            :items="roleOptions"
            :label="item.accessLevel.text"
            class="mt-3"
          ></v-select>
        </template>

        <!-- More -->
        <template v-slot:item.more="{ item }">
          <v-menu>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <!-- v-if="item.invited && item.accepted == null" -->
              <v-list-item link>
                <v-list-item-title>Cancel invitation</v-list-item-title>
              </v-list-item>
              <!-- v-if="item.invited && !item.accepted" -->
              <v-list-item link>
                <v-list-item-title>Re-invite</v-list-item-title>
              </v-list-item>
              <!-- v-if="item.accepted" -->
              <v-list-item @click="removeCoop(item)">
                <v-list-item-title>Remove cooperator</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
      {{cooperatorsEdit}}
    </ShowInfo>
  </v-container>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";

export default {
  props: ["id"],
  components: {
    ShowInfo
  },
  data: () => ({
    object: null,
    change: false,
    valids: [false, true, true],
    snackbar: false,
    snackMsg: "",
    snackColor: "",
    cooperatorsEdit: [],
    editedCoops: [],
    deletedCoops: [],
    userSelected: {},
    headers: [
      { text: "Email", value: "email" },
      { text: "Role", value: "accessLevel" },
      { text: "Invited", value: "invited", justify: "center" },
      { text: "Status", value: "status", justify: "center" },
      { text: "More", value: "more", justify: "center", sortable: false }
    ],
    roleOptions: [
      { text: "Researcher", value: 1 },
      { text: "Co-Administrator", value: 0 }
    ]
  }),
  methods: {
    log() {
      console.log("aaaaaa");
    },
    validate(valid, index) {
      this.valids[index] = valid;
    },
    submit() {
      this.cooperatorsEdit.forEach(async guest => {
        //Invide new cooperators
        if (!guest.invited) {
          this.send(guest);
        }
      });
    },
    send(guest) {
      let inv = {
        to: {
          id: guest.id,
          email: guest.email,
          accessLevel: guest.accessLevel.value
        },
        from: {
          id: this.user.uid,
          email: this.user.email
        },
        test: {
          id: this.test.id,
          title: this.test.title,
          type: this.test.type,
          reports: this.test.reports,
          answers: this.test.answers,
          cooperators: this.test.cooperators
        }
      };
      this.$store
        .dispatch("pushNotification", {
          docId: inv.to.id,
          element: inv,
          param: "notifications"
        })
        .then(() => {
          guest.invited = true;
          this.$store.dispatch("pushCooperators", {
            docId: this.id,
            element: Object.assign({}, guest)
          });
        });
    },
    pushToArray() {
      let hasObj = false;
      let obj = {
        id: this.userSelected.id,
        email: this.userSelected.email,
        invited: false,
        status: null,
        accessLevel: { text: "Researcher", value: 1 }
      };
      let index = 0;

      this.cooperatorsEdit.forEach(coop => {
        if (coop.id === obj.id) {
          hasObj = true;
          this.filteredUsers.splice(index, 1);
          index++;
        }
      });

      if (!hasObj) {
        this.cooperatorsEdit.push(obj);
        this.change = true;

        if (this.deletedCoops.includes(obj.id)) //se add de novo remove do deleted
          this.deletedCoops.splice(this.deletedCoops.indexOf(obj.id), 1);
      }
      this.userSelected = {};
    },
    removeCoop(coop) {
      let index = this.cooperatorsEdit.indexOf(coop);
      this.cooperatorsEdit.splice(index, 1);
      this.deletedCoops.push(coop.id);
    },
    recordChange(item) {
      this.change = true;
      if (!this.editedCoops.includes(item.id)) this.editedCoops.push(item.id);

      console.log(this.editedCoops);
    }
  },
  watch: {
    cooperators: async function() {
      if (this.cooperators !== null && this.cooperators !== undefined) {
        this.cooperatorsEdit = Array.from(this.cooperators.cooperators);
        if (!this.$store.test) {
          this.$store.dispatch("getTest", { id: this.cooperators.test.id });
        }
      }
    },
    snackbar() {
      if (this.snackbar === false && this.snackColor == "success")
        this.change = false;
    },
    deletedCoops() {
      console.log("deleted ", this.deletedCoops);
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    },
    cooperators() {
      return this.$store.state.cooperators.cooperators || [];
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
        this.cooperatorsEdit.forEach(coop => {
          if (coop.id === user.id) {
            hasUser = true;
          }
        });
        if (!hasUser) array.push(user);
      });
      return array;
    }
  },
  created() {
    if (!this.$store.state.cooperators.cooperators)
      this.$store.dispatch("getCooperators", { id: this.id });
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
</style>