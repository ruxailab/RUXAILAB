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
      <v-row align="center" class="ma-0" justify="center" style="cursor: pointer;" @click="goToProfile">
        <v-list-item-avatar>
          <v-icon large dark>
            mdi-account-circle
          </v-icon>
        </v-list-item-avatar>

        <v-col>
          <v-list-item-content v-if="user">
            <v-list-item-title>{{ username || $t('buttons.username') }}</v-list-item-title>
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
          <v-list-item-title>{{ $t('buttons.goToConsole') }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Manager Options -->
      <v-list v-if="isManager && test" dense dark>
        <v-list-item-group v-model="item">
          <v-list-item
            v-for="(item, i) in items"
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
          class="text-none font-weight-regular text-body-1"
          @click.stop="signOut()"
        >
          {{ $t('buttons.signout') }}
        </v-btn>
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

    <!-- Go to console Desktop -->
    <v-btn
      v-if="this.$route.path === '/' && user"
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/testslist')"
    >
      {{ $t('buttons.goToConsole') }}
    </v-btn>

    <v-btn
      v-if="
        this.$route.path == '/testslist' ||
          this.$route.path == '/signin' ||
          this.$route.path == '/signup'
      "
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/')"
    >
      {{ $t('AccessNotAllowed.goHome') }}
    </v-btn>

    <v-btn
      v-if="
        this.$route.path !== '/' &&
          this.$route.path !== '/testslist' &&
          this.$route.path !== '/signin' &&
          this.$route.path !== '/signup'
      "
      text
      color="#f9a826"
      class="console-button mx-1 hidden-sm-and-down"
      @click="goTo('/testslist')"
    >
      {{ $t('buttons.returnToConsole') }}
    </v-btn>

    <HelpButton class="mx-2" />
    <NotificationBtn v-if="user" class="mx-2" />

    <!-- Sign-in Desktop -->
    <v-btn
      v-if="!user"
      text
      class="hidden-sm-and-down"
      @click="goTo('/signin')"
    >
      <v-icon left>
        mdi-lock
      </v-icon>
      {{ $t('SIGNIN.sign-in') }}
    </v-btn>

    <!-- Sign-in Mobile -->
    <v-btn v-if="!user" icon class="hidden-md-and-up" @click="goTo('/signin')">
      <v-icon size="20">
        mdi-lock
      </v-icon>
    </v-btn>

    <!-- Profile Button Desktop -->
    <div class="hidden-sm-down">
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
          <v-btn
            text
            v-bind="attrs"
            v-on="on"
            class="profile-trigger"
          >
            <v-avatar size="32" color="primary" class="white--text">
              {{ userInitial }}
            </v-avatar>
            <v-icon small class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <div class="custom-dropdown white rounded-lg">
          <!-- User Info Section -->
          <div class="pa-6 d-flex align-center">
            <v-avatar size="48" color="primary" class="user-avatar white--text">
              <span class="text-h5 font-weight-medium">{{ userInitial }}</span>
            </v-avatar>
            <div class="ml-4 flex-grow-1">
              <div class="d-flex align-center">
                <span class="user-name">{{ username || $t('buttons.username') }}</span>
                <v-icon color="primary" size="20" class="ml-2 verified-icon">mdi-check-decagram</v-icon>
              </div>
              <span class="user-email mt-1 grey--text text--darken-1">{{ user.email }}</span>
            </div>
          </div>

          <v-divider></v-divider>

          <!-- Menu Items -->
          <div class="pa-2">
            <div class="menu-item d-flex align-center px-4 py-3 rounded-lg" @click="goToProfile(); menu = false;">
              <v-icon color="primary" size="20">mdi-account</v-icon>
              <span class="ml-3 menu-text">{{ $t('buttons.profile') }}</span>
            </div>

            <v-divider class="my-2"></v-divider>

            <div class="menu-item d-flex align-center px-4 py-3 rounded-lg" @click="signOut(); menu = false;">
              <v-icon color="error" size="20">mdi-logout</v-icon>
              <span class="ml-3 menu-text">{{ $t('buttons.signout') }}</span>
            </div>
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
    }
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
          } else {
            console.error('User document not found in Firestore');
          }
        } else {
          console.error('No user is currently signed in');
        } 
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.$toast.error('Failed to load profile data');
      }
    },
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
    goToProfile() {
      console.log('profile')
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile').catch(() => {});
      }
    },
  },
}
</script>

<style scoped>
/* Only keeping styles that can't be handled by Vuetify */
.custom-dropdown {
  min-width: 300px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.user-name {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.user-email {
  font-size: 14px;
  font-weight: 500;
}

.verified-icon {
  filter: drop-shadow(0 2px 4px rgba(33, 150, 243, 0.2));
}

.menu-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Profile hover */
.menu-item:first-child:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.menu-item:first-child:hover .menu-text {
  color: #2196F3;
}

/* Signout hover */
.menu-item:last-child:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.menu-item:last-child:hover .menu-text {
  color: #F44336;
}

.menu-text {
  font-size: 15px;
  font-weight: 500;
  color: #424242;
  transition: color 0.2s ease;
}
</style>
