<template>
  <v-app-bar app dark dense>
    <v-btn
      v-if="user"
      icon
      dark
      class="d-flex d-lg-none"
      @click.stop="drawer = !drawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-icon left class="d-none d-lg-flex" @click="goTo('/testslist')">
      mdi-alpha-r-circle
    </v-icon>

    <!-- MOBILE DRAWER -->
    <v-navigation-drawer
      v-if="user"
      v-model="drawer"
      app
      absolute
      temporary
      dark
      class="d-flex d-lg-none drawer-animate"
      :class="{ 'drawer-open': drawer }"
    >
      <!-- User Info -->
      <div class="mobile-dropdown">
        <div class="pa-4 d-flex align-center" style="cursor: pointer" @click="goToProfile(); drawer = false;">
          <v-avatar size="48" color="primary" class="user-avatar white--text">
            <span class="text-h5 font-weight-medium">{{ userInitial }}</span>
          </v-avatar>
          <div class="ml-4 flex-grow-1">
            <div class="d-flex align-center">
              <span class="mobile-user-name white--text">{{ username || $t('buttons.username') }}</span>
              <v-icon color="primary" size="20" class="ml-2 verified-icon">mdi-check-decagram</v-icon>
            </div>
            <span class="mobile-user-email grey--text text--lighten-1">{{ user.email }}</span>
          </div>
        </div>

        <v-divider dark></v-divider>

        <!-- Manager Items -->
        <v-list v-if="isManager && test" dark>
          <v-list-item-group v-model="item">
            <v-list-item
              v-for="(item, i) in items"
              :key="i"
              link
              @click="goTo(item.path)"
              class="mobile-menu-item rounded-lg mx-2"
            >
              <v-list-item-icon>
                <v-icon color="white">{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="white--text">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <v-spacer></v-spacer>

        <!-- Sign Out -->
        <div class="mobile-signout">
          <v-divider dark></v-divider>
          <div class="pa-2">
            <div class="mobile-menu-item d-flex align-center px-4 py-3 rounded-lg" @click="signOut(); drawer = false;">
              <v-icon color="error" size="20">mdi-logout</v-icon>
              <span class="ml-3 white--text">{{ $t('buttons.signout') }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <v-toolbar-title
      v-if="this.$route.path != '/help'"
      style="cursor: pointer"
      @click="goTo('/testslist')"
    >
      RUXAILAB
    </v-toolbar-title>
    <v-toolbar-title v-else style="cursor: pointer" @click="goTo('/testslist')">
      Help Center
    </v-toolbar-title>

    <v-spacer />

    <locale-changer />

    <!-- THEME TOGGLE BUTTON -->
    <v-menu offset-y rounded="lg">
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on" :title="'Toggle Theme'">
          <v-icon>{{ themeIcon }}</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="setTheme('light')">
          <v-list-item-icon><v-icon>mdi-white-balance-sunny</v-icon></v-list-item-icon>
          <v-list-item-title>Light</v-list-item-title>
        </v-list-item>
        <v-list-item @click="setTheme('dark')">
          <v-list-item-icon><v-icon>mdi-weather-night</v-icon></v-list-item-icon>
          <v-list-item-title>Dark</v-list-item-title>
        </v-list-item>
        <v-list-item @click="setTheme('auto')">
          <v-list-item-icon><v-icon>mdi-theme-light-dark</v-icon></v-list-item-icon>
          <v-list-item-title>Auto</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Go to console buttons based on route -->
    <v-btn
      v-if="this.$route.path === '/' && user"
      text
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/testslist')"
    >
      {{ $t('buttons.goToConsole') }}
    </v-btn>

    <v-btn
      v-if="['/testslist', '/signin', '/signup'].includes(this.$route.path)"
      text
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/')"
    >
      {{ $t('AccessNotAllowed.goHome') }}
    </v-btn>

    <v-btn
      v-if="!['/', '/testslist', '/signin', '/signup'].includes(this.$route.path)"
      text
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/testslist')"
    >
      {{ $t('buttons.returnToConsole') }}
    </v-btn>

    <HelpButton :class="$vuetify.breakpoint.smAndDown ? 'mx-1' : 'mx-2'" />
    <NotificationBtn v-if="user" :class="$vuetify.breakpoint.smAndDown ? 'mx-1' : 'mx-2'" />

    <!-- Sign-in Buttons -->
    <v-btn v-if="!user" text class="d-none d-lg-flex" @click="goTo('/signin')">
      <v-icon left>mdi-lock</v-icon>
      {{ $t('SIGNIN.sign-in') }}
    </v-btn>
    <v-btn v-if="!user" icon class="d-flex d-lg-none" @click="goTo('/signin')">
      <v-icon :size="$vuetify.breakpoint.xsOnly ? '18' : '20'">mdi-lock</v-icon>
    </v-btn>

    <!-- Profile Desktop -->
    <div class="d-none d-lg-flex">
      <v-menu
        v-if="user"
        v-model="menu"
        offset-y
        min-width="300"
        transition="slide-y-transition"
        :close-on-content-click="false"
        rounded="lg"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" class="pa-0 btn-fix" v-on="on" @click="menu = !menu">
            <v-avatar size="24" class="mr-1">
              <v-img v-if="profileImage" :src="profileImage" alt="User Profile"></v-img>
              <v-icon v-else dark>mdi-account-circle</v-icon>
            </v-avatar>
            <v-icon small>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <div class="custom-dropdown white rounded-lg">
          <!-- User Info -->
          <div class="pa-6 d-flex align-center">
            <v-avatar size="48" color="primary" class="elevation-2">
              <span class="text-h5 font-weight-medium white--text">{{ userInitial }}</span>
            </v-avatar>
            <div class="ml-4 flex-grow-1">
              <div class="d-flex align-center">
                <span class="text-h6 font-weight-bold grey--text text--darken-4">{{ username || $t('buttons.username') }}</span>
                <v-icon color="primary" size="20" class="ml-2">mdi-check-decagram</v-icon>
              </div>
              <span class="subtitle-2 grey--text text--darken-1">{{ user.email }}</span>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- Actions -->
          <div class="pa-2">
            <v-hover v-slot="{ hover }">
              <div class="d-flex align-center px-4 py-3 rounded-lg transition-swing cursor-pointer" :class="{ 'primary lighten-5': hover }" @click="goToProfile(); menu = false;">
                <v-icon color="primary" size="20">mdi-account</v-icon>
                <span class="ml-3 subtitle-1 font-weight-medium" :class="{ 'primary--text': hover }">
                  {{ $t('buttons.profile') }}
                </span>
              </div>
            </v-hover>

            <v-divider class="my-2"></v-divider>

            <v-hover v-slot="{ hover }">
              <div class="d-flex align-center px-4 py-3 rounded-lg transition-swing cursor-pointer" :class="{ 'error lighten-5': hover }" @click="signOut(); menu = false;">
                <v-icon color="error" size="20">mdi-logout</v-icon>
                <span class="ml-3 subtitle-1 font-weight-medium" :class="{ 'error--text': hover }">
                  {{ $t('buttons.signout') }}
                </span>
              </div>
            </v-hover>
          </div>
        </div>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
import LocaleChanger from '@/components/atoms/LocaleChanger.vue'
import NotificationBtn from '../atoms/NotificationButton.vue'
import HelpButton from '../atoms/HelpButton.vue'
import UserController from '@/controllers/UserController'
import { getAuth } from 'firebase/auth'

export default {
  name: 'Toolbar',
  components: { NotificationBtn, LocaleChanger, HelpButton },
  data() {
    return {
      drawer: false,
      menu: false,
      item: 0,
      isManager: false,
      username: null,
      profileImage: null,
      theme: localStorage.getItem('theme') || 'auto'
    }
  },
  computed: {
    user() {
      return this.$store.getters.user
    },
    test() {
      return this.$store.state.Tests.Test
    },
    accessLevel() {
      return this.test?.accessLevel || 0
    },
    userInitial() {
      return this.username?.charAt(0)?.toUpperCase() || 'U'
    },
    themeIcon() {
      switch (this.theme) {
        case 'light': return 'mdi-white-balance-sunny'
        case 'dark': return 'mdi-weather-night'
        default: return 'mdi-theme-light-dark'
      }
    },
    items() {
      const test = this.test
      const items = []
      if (!test) return items

      items.push({ title: 'Manager', icon: 'mdi-home', path: `/managerview/${test.id}` })
      if (this.accessLevel <= 2) {
        if (this.accessLevel === 0) {
          items.push(
            { title: 'Test', icon: 'mdi-file-document-edit', path: `/edittest/${test.id}` },
            { title: 'Preview', icon: 'mdi-file-eye', path: `/testview/${test.id}` }
          )
        } else if (this.accessLevel === 1) {
          items.push({ title: 'Answer Test', icon: 'mdi-file-document', path: `/testview/${test.id}` })
        }
      }
      if (this.accessLevel === 0 || this.accessLevel === 1) {
        items.push(
          { title: 'Reports', icon: 'mdi-book-multiple', path: `/reportview/${test.id}` },
          { title: 'Answers', icon: 'mdi-order-bool-ascending-variant', path: `/answerview/${test.id}` }
        )
      }
      if (this.accessLevel === 0) {
        items.push(
          { title: 'Final Report', icon: 'mdi-file-document', path: `/finalreportview/${test.id}` },
          { title: 'Cooperators', icon: 'mdi-account-group', path: `/cooperators/${test.id}` }
        )
      }
      if (test.template) {
        items.push({ title: 'Template', icon: 'mdi-file-compare', path: `/templateview/${test.template.id}` })
      }

      return items
    }
  },
  watch: {
    theme: {
      immediate: true,
      handler(newTheme) {
        if (newTheme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          this.$vuetify.theme.dark = prefersDark
        } else {
          this.$vuetify.theme.dark = newTheme === 'dark'
        }
      }
    }
  },
  methods: {
    goTo(path) {
      this.$router.push(path)
    },
    goToProfile() {
      this.$router.push('/profile')
    },
    signOut() {
      getAuth().signOut().then(() => {
        this.$store.commit('setUser', null)
        this.$router.push('/signin')
      })
    },
    setTheme(value) {
      this.theme = value
      localStorage.setItem('theme', value)
    }
  },
  async mounted() {
    if (this.user) {
      const data = await UserController.getUserData(this.user.uid)
      this.username = data.username || ''
      this.profileImage = data.image || ''
      this.isManager = !!this.test
    }
  }
}
</script>
