<template>
  <v-container v-if="cooperators" class="ma-0 pa-0">
    <v-snackbar v-model="snackbar" :color="snackColor" top :timeout="2000">
      <p>{{ snackMsg }}</p>
      <v-btn text @click="snackbar = false">
        <v-icon>mdi-close-circle-outline</v-icon>
      </v-btn>
    </v-snackbar>
    <v-btn large dark fab fixed bottom right color="#F9A826" @click="submit()">
      <v-icon large>mdi-email</v-icon>
    </v-btn>

    <ShowInfo title="Cooperators">
      <v-autocomplete
        v-model="usersSelect"
        chips
        multiple
        :items="users"
        item-text="email"
        return-object
        label="Select User"
        outlined
      ></v-autocomplete>
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
    usersSelect: []
  }),
  methods: {
    validate(valid, index) {
      this.valids[index] = valid;
    },
    submit() {
      this.cooperatorsEdit.forEach(async guest => {
        //Invide new cooperators
        if (!guest.invited) {
          await this.send(guest);
          this.$store.dispatch("pushCooperators", {
            docId: this.id,
            element: Object.assign({},guest)
          });
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
        });
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
    objectUser() {
      this.objectUser.forEach(item => {
        if (!this.cooperatorsEdit.includes(item))
          this.cooperatorsEdit.push(item);
      });
    },
    snackbar() {
      if (this.snackbar === false && this.snackColor == "success")
        this.change = false;
    }
  },
  computed: {
    objectUser() {
      if (!this.usersSelect) return [];
      return this.usersSelect.map(item => {
        return {
          id: item.id,
          email: item.email,
          invited: false,
          status: null,
          accessLevel: { text: "researcher", value: 1 }
        };
      });
    },
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