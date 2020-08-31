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

      <!-- Landing Page Options -->
      <v-list dense dark v-if="this.$route.path === '/' && user">
        <v-list-item link @click="goTo('/testslist')">
          <v-list-item-icon>
            <v-icon>mdi-console</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Go to Console</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Manager Options -->
      <v-list dense dark v-if="isManager && test">
        <v-list-item-group v-model="item">
          <v-list-item link v-for="(item, i) in managerItems" :key="i" @click="goTo(item.path)">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <div class="footer">
        <v-btn
          dark
          text
          @click.stop="signOut()"
          style="text-transform: none !important; font: Roboto; font-size: 17px"
        >Sign-out</v-btn>
      </div>
    </v-navigation-drawer>

    <v-toolbar-title @click="goTo('/testslist')" style="cursor: pointer">Remote Testing Lab</v-toolbar-title>

    <v-spacer></v-spacer>

    <locale-changer></locale-changer>

    <!-- Go to console Desktop -->
    <v-btn
      v-if="this.$route.path === '/' && user"
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/testslist')"
    >Go to Console</v-btn>

    <NotificationBtn class="mx-2" v-if="user" />

    <!-- Sign-in Desktop -->
    <v-btn text @click="goTo('/signin')" v-if="!user" class="hidden-sm-and-down">
      <v-icon left>mdi-lock</v-icon>Sign-in
    </v-btn>

    <!-- Sign-in Mobile -->
    <v-btn icon @click="goTo('/signin')" v-if="!user" class="hidden-md-and-up">
      <v-icon size="20">mdi-lock</v-icon>
    </v-btn>

    <!-- Profile Button Desktop -->
    <div class="hidden-sm-and-down">
      <v-menu v-model="menu" offset-y v-if="user" min-width="200" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on" class="pa-0 btn-fix" @click="menu = !menu">
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
            @click="signOut(), menu = false"
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
    menu: false,
    item: 0,
    isManager: false,
  }),
  methods: {
    goTo(route) {
      if (route.includes("/testview")) window.open(route);
      else this.$router.push(route);
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
    managerItems() {
      let items = [
        {
          title: "Manager",
          icon: "mdi-home",
          path: `/managerview/${this.test.id}`,
          id: 0,
        },
        {
          title: "Test",
          icon: "mdi-file-document-edit",
          path: `/edittest/${this.test.id}`,
          id: 1,
        },
        {
          title: "Preview",
          icon: "mdi-file-eye",
          path: `/testview/${this.test.id}`,
          id: 2,
        },
        {
          title: "Reports",
          icon: "mdi-book-multiple",
          path: `/reportview/${this.test.reports}`,
          id: 3,
        },
        {
          title: "Answers",
          icon: "mdi-chart-bar",
          path: `/answerview/${this.test.answers}`,
          id: 4,
        },
      ];

      if (this.test.accessLevel == 0) {
        items.push({
          title: "Cooperators",
          icon: "mdi-account-group",
          path: `/cooperatorsview/${this.test.cooperators}`,
          id: 5,
        });
      }

      return items;
    },
    test() {
      return this.$store.state.tests.test;
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        let parentRoute = to.matched[0];
        if (parentRoute) {
          if (parentRoute.name === "Manager View") this.isManager = true;
          else this.isManager = false;
        }
      },
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
  background: #c4c4c4 !important;
  height: 1.5px;
}
.btn-fix:focus::before {
  opacity: 0 !important;
}
</style>
