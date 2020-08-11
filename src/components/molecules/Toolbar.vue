<template>
  <v-app-bar app dark dense>
    <v-btn v-if="user" icon dark @click.stop="drawer =! drawer" class="hidden-md-and-up">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-icon left class="hidden-sm-and-down" @click="goTo('/testslist')">mdi-alpha-r-circle</v-icon>

    <v-navigation-drawer
      app
      absolute
      temporary
      v-model="drawer"
      class="hidden-md-and-up"
      disable-resize-watcher
      v-if="user"
    >
      <v-row align="center" class="ma-0" justify="center">
        <v-list-item-avatar>
          <v-icon large dark>mdi-account-circle</v-icon>
        </v-list-item-avatar>

        <v-col>
          <v-list-item-content v-if="user">
            <v-list-item-title>Username</v-list-item-title>
            <div class="caption">{{ user.email }}</div>
          </v-list-item-content>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-list dense></v-list>

      <div class="footer">
        <v-btn
          dark
          text
          @click.stop="signOut()"
          style="text-transform: none !important; font: Roboto; font-size: 17px"
        >Sign-out</v-btn>
      </div>
    </v-navigation-drawer>

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

    <!-- Desktop -->
    <v-btn text @click="goTo('/signin')" v-if="!user" class="hidden-sm-and-down">
      <v-icon left>mdi-lock</v-icon>Sign-in
    </v-btn>

    <!-- Mobile -->
    <v-btn icon @click="goTo('/signin')" v-if="!user" class="hidden-md-and-up">
      <v-icon size="20">mdi-lock</v-icon>
    </v-btn>

    <div class="hidden-sm-and-down">
      <v-menu offset-y v-if="user" class="ma-0 pa-0" min-width="200">
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on" class="pa-0">
            <v-icon class="mr-1" dark>mdi-account-circle</v-icon>
            <v-icon small>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list dense class="ma-0 py-1" style="border-radius: 0px!important">
          <v-list-item dense style="font-size: 14px; font: Roboto;" class="px-2">
            <v-list-item-content>
              <v-list-item-title style="font-weight: bold">Username</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <div class="divider"></div>

          <v-list-item
            @click="signOut()"
            dense
            style="font-size: 14px; font: Roboto"
            class="px-2"
          >Sign-out</v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
import NotificationBtn from "../atoms/NotificationButton";
import LocaleChanger from "@/components/atoms/LocaleChanger";

export default {
  data: () => ({
    drawer: false,
  }),
  methods: {
    goTo(route) {
      this.$router.push(route);
    },
    async signOut() {
      this.$store.dispatch("logout").then(() => {
        this.$router.push("/");
      });
    },
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
  },
  components: {
    NotificationBtn,
    LocaleChanger,
  },
};
</script>

<style scoped>
.console-button {
  font-size: 13px;
  font: Roboto;
  text-transform: none !important;
  padding: 7px !important;
}
.footer {
  background-color: transparent;
  height: 8%;
  width: 100%;
  display: flex;
  align-content: center;
  justify-content: center;

  position: absolute;
  bottom: 0px;
}
.divider {
  background: #C4C4C4!important;
  height: 1.5px
}
</style>
