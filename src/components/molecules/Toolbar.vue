<template>
  <v-app-bar app dark dense>
    <v-btn v-if="user" icon dark class="d-flex d-lg-none" @click.stop="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-icon left class="d-none d-lg-flex" @click="goTo('/testslist')">
      mdi-alpha-r-circle
    </v-icon>

    <v-navigation-drawer v-if="user" v-model="drawer" app absolute temporary dark
      class="d-flex d-lg-none drawer-animate" :class="{ 'drawer-open': drawer }">
      <!-- User Info Section - Clickable for Profile -->
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

        <!-- Manager Options -->
        <v-list v-if="isManager && test" dark>
          <v-list-item-group v-model="item">
            <v-list-item v-for="(item, i) in items" :key="i" link @click="goTo(item.path)"
              class="mobile-menu-item rounded-lg mx-2">
              <v-list-item-icon>
                <v-icon color="white">{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="white--text">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <!-- Spacer for pushing signout to bottom -->
        <v-spacer></v-spacer>

        <!-- Signout Button - Always visible at bottom -->
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

    <v-toolbar-title v-if="this.$route.path != '/help'" style="cursor: pointer" @click="goTo('/testslist')">
      RUXAILAB
    </v-toolbar-title>
    <v-toolbar-title v-else style="cursor: pointer" @click="goTo('/testslist')">
      Help Center
    </v-toolbar-title>

    <v-spacer />

    <locale-changer />

    <!-- Go to console Desktop -->
    <v-btn v-if="this.$route.path === '/' && user" text color="#f9a826" class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/testslist')">
      {{ $t('buttons.goToConsole') }}
    </v-btn>

    <v-btn v-if="
      this.$route.path == '/testslist' ||
      this.$route.path == '/signin' ||
      this.$route.path == '/signup' ||
      this.$route.path == '/forgot-password'
    " text color="#f9a826" class="console-button mx-1 d-none d-lg-flex" @click="goTo('/')">
      {{ $t('AccessNotAllowed.goHome') }}
    </v-btn>

    <v-btn v-if="
      this.$route.path !== '/' &&
      this.$route.path !== '/testslist' &&
      this.$route.path !== '/signin' &&
      this.$route.path !== '/signup' &&
      this.$route.path !== '/forgot-password'
    " text color="#f9a826" class="console-button mx-1 d-none d-lg-flex" @click="goTo('/testslist')">
      {{ $t('buttons.returnToConsole') }}
    </v-btn>

    <HelpButton :class="smAndDown ? 'mx-1' : 'mx-2'" />
    <NotificationBtn v-if="user" :class="smAndDown ? 'mx-1' : 'mx-2'" />

    <!-- Sign-in Desktop -->
    <v-btn v-if="!user" text class="d-none d-lg-flex" @click="goTo('/signin')">
      <v-icon left>
        mdi-lock
      </v-icon>
      {{ $t('SIGNIN.sign-in') }}
    </v-btn>

    <!-- Sign-in Mobile -->
    <v-btn 
      v-if="!user" 
      icon 
      class="d-flex d-lg-none" 
      @click="goTo('/signin')"
    >
      <v-icon :size="iconSize">
        mdi-lock
      </v-icon>
    </v-btn>

    <!-- Profile Button Desktop -->
    <div class="d-none d-lg-flex">
      <v-menu v-if="user" v-model="menu" offset-y min-width="300" transition="slide-y-transition"
        :close-on-content-click="false" rounded="lg">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            text
            class="pa-0 btn-fix"
            v-on="on"
            @click="menu = !menu"
          >
            <v-avatar size="24" class="mr-1">
              <v-img 
                v-if="profileImage" 
                :src="profileImage" 
                alt="User Profile"
              ></v-img>
              <v-icon v-else dark>
                mdi-account-circle
              </v-icon>
            </v-avatar>
            <v-icon small>
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>

        <div class="custom-dropdown white rounded-lg">
          <!-- User Info Section -->
          <div class="pa-6 d-flex align-center">
            <v-avatar size="48" color="primary" class="elevation-2">
              <span class="text-h5 font-weight-medium white--text">{{ userInitial }}</span>
            </v-avatar>
            <div class="ml-4 flex-grow-1">
              <div class="d-flex align-center">
                <span class="text-h6 font-weight-bold grey--text text--darken-4">{{ username || $t('buttons.username')
                  }}</span>
                <v-icon color="primary" size="20" class="ml-2">mdi-check-decagram</v-icon>
              </div>
              <span class="subtitle-2 grey--text text--darken-1">{{ user.email }}</span>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- Menu Items -->
          <div class="pa-2">
            <v-hover v-slot="{ hover }">
              <div class="d-flex align-center px-4 py-3 rounded-lg transition-swing cursor-pointer"
                :class="{ 'primary lighten-5': hover }" @click="goToProfile(); menu = false;">
                <v-icon color="primary" size="20">mdi-account</v-icon>
                <span class="ml-3 subtitle-1 font-weight-medium" :class="{ 'primary--text': hover }">
                  {{ $t('buttons.profile') }}
                </span>
              </div>
            </v-hover>

            <v-divider class="my-2"></v-divider>

            <v-hover v-slot="{ hover }">
              <div class="d-flex align-center px-4 py-3 rounded-lg transition-swing cursor-pointer"
                :class="{ 'error lighten-5': hover }" @click="signOut(); menu = false;">
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
import { useDisplay } from 'vuetify/lib/framework.mjs'

export default {
  name: 'Toolbar',
  components: {
    NotificationBtn,
    LocaleChanger,
    HelpButton,
  },
  data() {
    return {
    drawer: false,
    menu: false,
    item: 0,
    isManager: false,
    username: null,
    profileImage: null,
    defaultImage: 'https://static.vecteezy.com/system/resources/previews/024/983/914/large_2x/simple-user-default-icon-free-png.png',
    display: useDisplay(),
  }
  },
  computed: {
    user() {
      return this.$store.getters.user
    },
    test() {
      return this.$store.state.Tests.Test
    },
    items() {
      let items
      if (this.test) {
        items = [
          {
            title: 'Manager',
            icon: 'mdi-home',
            path: `/managerview/${this.test.id}`,
            id: 0,
          },
        ]

        if (this.accessLevel <= 2) {
          if (this.accessLevel == 0) {
            items.push(
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
            )
          } else if (this.accessLevel == 1) {
            items.push({
              title: 'Answer Test',
              icon: 'mdi-file-document',
              path: `/testview/${this.test.id}`,
              id: 1,
            })
          }
        }
        if (this.accessLevel == 0) {
          items.push(
            {
              title: 'Reports',
              icon: 'mdi-book-multiple',
              path: `/reportview/${this.test.id}`,
              id: 3,
            },
            {
              title: 'Answers',
              icon: 'mdi-order-bool-ascending-variant',
              path: `/answerview/${this.test.id}`,
              id: 4,
            },
          )
        } else if (this.accessLevel == 1) {
          items.push(
            {
              title: 'Reports',
              icon: 'mdi-book-multiple',
              path: `/reportview/${this.test.id}`,
              id: 2,
            },
            {
              title: 'Answers',
              icon: 'mdi-order-bool-ascending-variant',
              path: `/answerview/${this.test.id}`,
              id: 3,
            },
          )
        }
        if (this.accessLevel == 0) {
          items.push(
            {
              title: 'Final Report',
              icon: 'mdi-file-document',
              path: `/finalreportview/${this.test.id}`,
              id: 5,
            },
            {
              title: 'Cooperators',
              icon: 'mdi-account-group',
              path: `/cooperators/${this.test.id}`,
              id: 6,
            },
          )
        }

        if (this.test.template) {
          items.push({
            title: 'Template',
            icon: 'mdi-file-compare',
            path: `/templateview/${this.test.template.id}`,
            id: 7,
          })
        }
      }

      return items
    },
    accessLevel() {
      // If the user is a superadmin
      if (this.user) {
        if (this.user.accessLevel == 0) return 0
        // Check if the user is a collaborator or owner
        const isTestOwner = this.test.testAdmin?.userDocId === this.user.id
        if (isTestOwner) return 0

        const answers = []
        const answersEntries = Object.entries(this.user.myAnswers)
        answersEntries.forEach((answer) => {
          answers.push(answer[1])
        })
        if (this.test.cooperators) {
          const coopsInfo = this.test.cooperators.find(
            (coops) => coops.userDocId === this.user.id,
          )
          if (coopsInfo) {
            return coopsInfo.accessLevel
          }
        }
        if (this.test.isPublic) return 1
        else return 2
      }
      return 1
    },
    userInitial() {
      if (this.username) {
        return this.username.charAt(0).toUpperCase()
      }
      return 'U'
    },
    smAndDown() {
      return this.display.smAndDown.value
    },
    iconSize() {
      return this.$vuetify?.breakpoint?.xsOnly ? '18' : '20';
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
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          this.fetchUsername();
        } else {
          this.username = null; // Clear the username when the user logs out
        }
      },
    },
  },

  mounted() {
    if (this.user) {
      console.log(this.username)
      this.fetchUsername();
    }
  },

  methods: {
    async fetchUsername() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userController = new UserController();
          const userDoc = await userController.getById(user.uid);

          if (userDoc) {
            this.username = userDoc.username || null;
            this.profileImage = userDoc.profileImage || null;
          } else {
            console.error('User document not found in Firestore');
          }
        } else {
          console.error('No user is currently signed in');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.$toast.error(i18n.t(errors.globalError));
      }
    },
    goTo(route) {
      if (route.includes('/testview')) window.open(route)
      else {
        this.$router
          .push(route)
          .catch(() => { })
          .catch(() => { })
      }
    },
    async signOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router
          .push('/')
          .catch(() => { })
          .catch(() => { })
      })
    },
    goToProfile() {
      console.log('profile')
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile').catch(() => { });
      }
    },
  },
}
</script>

<style scoped>
/* Only keeping styles that can't be handled by Vuetify */
.cursor-pointer {
  cursor: pointer;
}

/* Drawer animations - can't be handled by Vuetify */
.drawer-animate {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  transform: translateX(-100%);
}

.drawer-animate.drawer-open {
  transform: translateX(0);
}

.drawer-animate .mobile-dropdown {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.drawer-animate.drawer-open .mobile-dropdown {
  opacity: 1;
  transition-delay: 0.2s;
}

.drawer-animate .mobile-menu-item {
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.3s ease;
}

.drawer-animate.drawer-open .mobile-menu-item {
  opacity: 1;
  transform: translateX(0);
}

/* Stagger animations - can't be handled by Vuetify */
.drawer-animate.drawer-open .mobile-menu-item:nth-child(1) {
  transition-delay: 0.2s;
}

.drawer-animate.drawer-open .mobile-menu-item:nth-child(2) {
  transition-delay: 0.25s;
}

.drawer-animate.drawer-open .mobile-menu-item:nth-child(3) {
  transition-delay: 0.3s;
}

.drawer-animate.drawer-open .mobile-menu-item:nth-child(4) {
  transition-delay: 0.35s;
}

.drawer-animate.drawer-open .mobile-menu-item:nth-child(5) {
  transition-delay: 0.4s;
}

.drawer-animate .mobile-signout {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.drawer-animate.drawer-open .mobile-signout {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.4s;
}
</style>
