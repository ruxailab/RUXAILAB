<template>
  <v-app-bar app dark dense>
    <v-btn
      v-if="user"
      icon
      dark
      class="hidden-md-and-up"
      @click.stop="drawer = !drawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-icon left class="hidden-sm-and-down" @click="goTo('/testslist')">
      mdi-alpha-r-circle
    </v-icon>

    <v-navigation-drawer
      v-if="user"
      v-model="drawer"
      app
      absolute
      temporary
      class="hidden-md-and-up"
    >
      <v-row align="center" class="ma-0" justify="center">
        <v-list-item-avatar>
          <v-icon large dark> mdi-account-circle </v-icon>
        </v-list-item-avatar>

        <v-col>
          <v-list-item-content v-if="user">
            <v-list-item-title>Username</v-list-item-title>
            <div class="caption">
              {{ user.email }}
            </div>
          </v-list-item-content>
        </v-col>
      </v-row>

      <v-divider />

      <!-- Landing Page Options -->
      <v-list v-if="this.$route.path === '/' && user" dense dark>
        <v-list-item link @click="goTo('/testslist')">
          <v-list-item-icon>
            <v-icon>mdi-console</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Go to Console</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Manager Options -->
      <v-list v-if="isManager && test" dense dark>
        <v-list-item-group v-model="item">
          <v-list-item
            v-for="(item, i) in managerItems"
            :key="i"
            link
            @click="goTo(item.path)"
          >
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
          style="text-transform: none !important; font: Roboto; font-size: 17px"
          @click.stop="signOut()"
        >
          Sign-out
        </v-btn>
      </div>
    </v-navigation-drawer>

    <v-toolbar-title style="cursor: pointer" @click="goTo('/testslist')">
      Remote Testing Lab
    </v-toolbar-title>

    <v-spacer />

    <locale-changer />

    <!-- Go to console Desktop -->
    <v-btn
      v-if="this.$route.path === '/' && user"
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/testslist')"
    >
      Go to Console
    </v-btn>

    <v-btn
      v-if="this.$route.path == '/testslist'"
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/')"
    >
      Go to Home
    </v-btn>

        <v-btn
      v-if="this.$route.path !== '/' && this.$route.path !== '/testslist'"
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/testslist')"
    >
      Return to Console
    </v-btn>
    

    <NotificationBtn v-if="user" class="mx-2" />

    <!-- Sign-in Desktop -->
    <v-btn
      v-if="!user"
      text
      class="hidden-sm-and-down"
      @click="goTo('/signin')"
    >
      <v-icon left> mdi-lock </v-icon>

      Sign-in
    </v-btn>

    <!-- Sign-in Mobile -->
    <v-btn v-if="!user" icon class="hidden-md-and-up" @click="goTo('/signin')">
      <v-icon size="20"> mdi-lock </v-icon>
    </v-btn>

    <!-- Profile Button Desktop -->
    <div class="hidden-sm-and-down">
      <v-menu
        v-if="user"
        v-model="menu"
        offset-y
        min-width="200"
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            text
            v-bind="attrs"
            class="pa-0 btn-fix"
            v-on="on"
            @click="menu = !menu"
          >
            <v-icon class="mr-1" dark> mdi-account-circle </v-icon>
            <v-icon small> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-list dense class="ma-0 py-1" style="border-radius: 0px !important">
          <v-list-item dense style="font-size: 14px; font: Roboto" class="px-2">
            <v-list-item-content>
              <v-list-item-title style="font-weight: bold">
                Username
              </v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <div class="divider" />

          <v-list-item
            dense
            style="font-size: 14px; font: Roboto"
            class="px-2"
            @click="signOut(), (menu = false)"
          >
            Sign-out
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
import LocaleChanger from '@/components/atoms/LocaleChanger.vue'
import NotificationBtn from '../atoms/NotificationButton.vue'

export default {
  components: {
    NotificationBtn,
    LocaleChanger,
  },
  data: () => ({
    drawer: false,
    menu: false,
    item: 0,
    isManager: false,
  }),
  computed: {
    user() {
      return this.$store.getters.user
    },
    managerItems() {
      const items = [
        {
          title: 'Manager',
          icon: 'mdi-home',
          path: `/managerview/${this.test.id}`,
          id: 0,
        },
        {
          title: 'Test',
          icon: 'mdi-file-document-edit',
          path: `/edittest/${this.test.id}`,
          id: 1,
        },
        {
          title: 'Preview',
          icon: 'mdi-file-eye',
          path: `/testview/${this.test.id}`,
          id: 2,
        },
        {
          title: 'Reports',
          icon: 'mdi-book-multiple',
          path: `/reportview/${this.test.reports}`,
          id: 3,
        },
        {
          title: 'Answers',
          icon: 'mdi-order-bool-ascending-variant',
          path: `/answerview/${this.test.answersDocId}`,
          id: 4,
        },
        {
          title: 'Analytics',
          icon: 'mdi-chart-bar',
          path: `/analyticsview/${this.test.answersDocId}`,
          id: 5,
        },
        {
          title: 'Final Report',
          icon: 'mdi-file-document',
          path: `/finalreportview/${this.test.id}`,
          id: 6,
        },
      ]

      if (this.isManager) {
        items.push({
          title: 'Cooperators',
          icon: 'mdi-account-group',
          path: `/cooperators/${this.test.cooperators}`,
          id: 6,
        })
      }

      if (this.test.template) {
        items.push({
          title: 'Template',
          icon: 'mdi-file-compare',
          path: `/templateview/${this.test.template.id}`,
          id: 7,
        })
      }

      items.push({
        title: 'Settings',
        icon: 'mdi-cog',
        path: `/settingsview/${this.test.id}`,
        id: 8,
      })
      return items
    },
    test() {
      return this.$store.getters.test
    },
    accessLevel() {
      /*
      let id = this.test?.id;

      //if (this.user?.myTests.find((mt) => mt.id == id)) return 0; //if own test

      let myCoop = this.user?.myCoops.find((mc) => mc.id == id);
      if (myCoop) return myCoop.accessLevel;
      */

      return 1 // default to 1 -> Guest
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const parentRoute = to.matched[0]
        if (parentRoute) {
          if (parentRoute.name === 'ManagerView') this.isManager = true
          else this.isManager = false
        }
      },
    },
  },
  methods: {
    goTo(route) {
      if (route.includes('/testview')) window.open(route)
      else {
        this.$router
          .push(route)
          .catch(() => {})
          .catch(() => {})
      }
    },
    async signOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router
          .push('/')
          .catch(() => {})
          .catch(() => {})
      })
    },
  },
}
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
