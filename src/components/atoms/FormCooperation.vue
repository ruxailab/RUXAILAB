<template>
  <div>
    <v-card class="mx-auto" tile>
      <v-row justify="center" align="center">
        <v-col cols="11">
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-text-field
                v-on="on"
                outlined
                label="Email"
                clearable
                prepend-inner-icon="mdi-magnify"
                v-model="seach"
              ></v-text-field>
            </template>
            <v-list>
              <v-list-item v-for="(item, index) in seaching" :key="index" @click="select(item)">
                <v-list-item-title>{{ item.email }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-row>
        <v-col>
          <v-list>
            <v-list-item-group>
              <v-list-item v-for="(item, i) in selecteds" :key="i">
                <v-list-item-icon>
                  <v-icon>mdi-account-circle</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="item.email"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon @click="deselect(item)">
                  <v-icon>mdi-close</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ["invitations"],
  data: () => ({
    selecteds: [],
    seach: "",
    invitation: {
      to: {
        id: null,
        email: null
      },
      from: {
        id: null,
        email: null
      },
      test: {
        id: null,
        title: null
      }
    }
  }),
  methods: {
    select(item) {
      this.selecteds.push(item);
      this.seach = "";
      this.invitation.to.id = item.id;
      this.invitation.to.email = item.email;
      this.invitation.from.id = this.user.uid;
      this.invitation.from.email = this.user.email;
      this.invitations.push(this.invitation);
      this.invitation = {
        to: {
          id: null,
          email: null
        },
        from: {
          id: this.user.uid,
          email: this.user.email
        },
        test: {
          id: null,
          title: null,
          type:null
        }
      };
    },
    deselect(item) {
      let rv = this.invitations.filter(element => {
        element.to.id = item.id;
      });
      this.invitations.splice(this.invitations.indexOf(rv), 1);
      this.selecteds.splice(this.selecteds.indexOf(item), 1);
    }
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    users() {
      if (this.$store.state.users.users) return this.$store.getters.admins;
      return [];
    },
    seaching() {
      if (this.seach == null || this.seach == "") return this.users;
      else
        return this.users.filter(item => {
          return item.email.toLowerCase().includes(this.seach.toLowerCase());
        });
    }
  },
  created() {
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
  }
};
</script>

<style>
</style>