<template>
  <v-app-bar app dark dense>
    <v-icon left @click="goTo('/testslist')">mdi-alpha-r-circle</v-icon>
    <v-toolbar-title @click="goTo('/testslist')" style="cursor: pointer">Research Workflow</v-toolbar-title>
    <v-spacer></v-spacer>
    <locale-changer></locale-changer>
    <v-btn
      v-if="this.$route.path === '/' && user"
      text
      color="#f9a826"
      class="console-button mx-1"
      @click="goTo('/testslist')"
    >Go to Console</v-btn>


    <NotificationBtn v-if="user" />

    <v-btn text @click="goTo('/signin')" v-if="!user">
      <v-icon left>mdi-lock</v-icon>Sign-in
    </v-btn>

    <v-menu offset-y open-on-hover v-if="user">
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on" class="mx-1">
          <v-icon dark>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-btn text @click="signOut()">
            <v-icon left>mdi-logout</v-icon>Sign-out
          </v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import NotificationBtn from "../atoms/NotificationButton";
import LocaleChanger from "@/components/atoms/LocaleChanger";

export default {
  data: () => ({}),
  methods: {
    goTo(route) {
      this.$router.push(route);
    },
    async signOut() {
      this.$store.dispatch("logout").then(() => {
        this.$router.push("/");
      });
    }
  },
  computed: {
    user() {
      return this.$store.getters.user;
    }
  },
  components: {
    NotificationBtn,
    LocaleChanger
  }
};
</script>

<style scoped>
.console-button {
  font-size: 13px;
  font: Roboto;
  text-transform: none!important;
  padding: 7px!important;
}
</style>
