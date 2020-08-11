<template>
  <v-app-bar app dark dense>
    <v-btn icon dark @click.stop="drawer =! drawer" class="hidden-md-and-up">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-icon left class="hidden-sm-and-down" @click="goTo('/testslist')">mdi-alpha-r-circle</v-icon>

    <v-navigation-drawer app absolute temporary v-model="drawer" class="hidden-md-and-up" disable-resize-watcher>
      <v-list-item>
        <v-list-item-avatar>
          <!-- <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img> -->
          <v-icon large dark>mdi-account-circle</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-if="user">{{user.email}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      
      <v-divider></v-divider>

      <v-list dense>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-email</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Messages</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <div class="footer">
        <!-- <locale-changer></locale-changer> -->
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
    <locale-changer class="hidden-sm-and-down"></locale-changer>
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
</style>
