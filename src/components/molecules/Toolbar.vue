<template>
  <v-app-bar app dark dense>
    <v-icon left @click="moveHome()">mdi-alpha-r-circle</v-icon>
    <v-toolbar-title @click="moveHome()" style="cursor: pointer">Research Workflow</v-toolbar-title>

    <v-spacer></v-spacer>
    <locale-changer></locale-changer>
    <NotificationBtn v-if="user" />

    <v-btn text @click="moveSignIn()" v-if="!user">
      <v-icon left>mdi-lock</v-icon>Sign-in
    </v-btn>

    <v-menu offset-y open-on-hover v-else>
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
    moveHome() {
      this.$router.push("/testslist");
    },
    moveSignIn() {
      this.$router.push("/signin");
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