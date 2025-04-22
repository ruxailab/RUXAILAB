<template>
  <div>
    <v-app-bar density="comfortable" color="#272727" class="px-4">
      <v-btn
        v-if="user"
        icon
        class="d-flex d-lg-none"
        @click.stop="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-toolbar-title
        v-if="$route.path != '/help'"
        style="cursor: pointer"
        @click="goTo('/testslist')"
      >
        <v-icon @click="goTo('/testslist')"> mdi-alpha-r-circle </v-icon>
        RUXAILAB
      </v-toolbar-title>
      <v-toolbar-title v-else style="cursor: pointer" @click="goTo('/testslist')">
        Help Center
      </v-toolbar-title>

      <v-spacer />

      <locale-changer />

      <v-btn
        v-if="$route.path === '/' && user"
        variant="text"
        color="#f9a826"
        class="console-button mx-1 d-none d-lg-flex"
        @click="goTo('/testslist')"
      >
        {{ $t('buttons.goToConsole') }}
      </v-btn>

      <v-btn
        v-if="['/testslist', '/signin', '/signup'].includes($route.path)"
        variant="text"
        color="#f9a826"
        class="console-button mx-1 d-none d-lg-flex"
        @click="goTo('/')"
      >
        {{ $t('AccessNotAllowed.goHome') }}
      </v-btn>

      <v-btn
        v-if="!['/', '/testslist', '/signin', '/signup'].includes($route.path)"
        variant="text"
        color="#f9a826"
        class="console-button mx-1 d-none d-lg-flex"
        @click="goTo('/testslist')"
      >
        {{ $t('buttons.returnToConsole') }}
      </v-btn>

      <HelpButton :class="smAndDown ? 'mx-1' : 'mx-2'" />
      <NotificationBtn v-if="user" :class="smAndDown ? 'mx-1' : 'mx-2'" />

      <v-btn
        v-if="!user"
        variant="text"
        class="d-none d-lg-flex"
        @click="goTo('/signin')"
      >
        <v-icon start> mdi-lock </v-icon>
        {{ $t('SIGNIN.sign-in') }}
      </v-btn>

      <v-btn v-if="!user" icon class="d-flex d-lg-none" @click="goTo('/signin')">
        <v-icon :size="iconSize"> mdi-lock </v-icon>
      </v-btn>

      <div class="d-none d-lg-flex">
        <v-menu
          v-if="user"
          v-model="menu"
          :offset="{ y: 8 }"
          min-width="300"
          transition="slide-y-transition"
          :close-on-content-click="false"
          class="rounded-lg"
        >
          <template #activator="{ props }">
            <v-btn variant="text" class="pa-0 btn-fix" v-bind="props">
              <v-avatar size="24" class="mr-1">
                <v-img v-if="profileImage" :src="profileImage" alt="User Profile" />
                <v-icon v-else> mdi-account-circle </v-icon>
              </v-avatar>
              <v-icon size="small"> mdi-chevron-down </v-icon>
            </v-btn>
          </template>

          <template #default>
            <div class="custom-dropdown bg-white rounded-lg">
              <div class="pa-6 d-flex align-center">
                <v-avatar size="48" color="primary" class="elevation-2">
                  <span class="text-h5 font-weight-medium text-white">{{ userInitial }}</span>
                </v-avatar>
                <div class="ml-4 flex-grow-1">
                  <div class="d-flex align-center">
                    <span class="text-h6 font-weight-bold text-grey-darken-4">{{ username || $t('buttons.username') }}</span>
                    <v-icon color="primary" size="20" class="ml-2"> mdi-check-decagram </v-icon>
                  </div>
                  <span class="text-subtitle-2 text-grey-darken-1">{{ user.email }}</span>
                </div>
              </div>

              <v-divider />

              <div class="pa-2">
                <v-hover v-slot="{ isHovering }">
                  <div
                    class="d-flex align-center px-4 py-3 rounded-lg cursor-pointer"
                    :class="{ 'primary lighten-5': isHovering }"
                    @click="goToProfile(); menu = false;"
                  >
                    <v-icon color="primary" size="20"> mdi-account </v-icon>
                    <span
                      class="ml-3 text-subtitle-1 font-weight-medium"
                      :class="{ 'primary--text': isHovering }"
                    >
                      {{ $t('buttons.profile') }}
                    </span>
                  </div>
                </v-hover>

                <v-divider class="my-2" />

                <v-hover v-slot="{ isHovering }">
                  <div
                    class="d-flex align-center px-4 py-3 rounded-lg cursor-pointer"
                    :class="{ 'error lighten-5': isHovering }"
                    @click="signOut(); menu = false;"
                  >
                    <v-icon color="error" size="20"> mdi-logout </v-icon>
                    <span
                      class="ml-3 text-subtitle-1 font-weight-medium"
                      :class="{ 'error--text': isHovering }"
                    >
                      {{ $t('buttons.signout') }}
                    </span>
                  </div>
                </v-hover>
              </div>
            </div>
          </template>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-if="user"
      v-model="drawer"
      temporary
      class="d-flex d-lg-none"
      style="height: 100vh;"
    >
      <div class="mobile-dropdown dropdown">
        <div
          class="pa-4 d-flex align-center"
          style="cursor: pointer"
          @click="goToProfile(); drawer = false;"
        >
          <v-avatar size="48" color="primary" class="user-avatar text-white">
            <span class="text-h5 font-weight-medium">{{ userInitial }}</span>
          </v-avatar>
          <div class="ml-4 flex-grow-1">
            <div class="d-flex align-center">
              <span class="mobile-user-name text-white">{{ username || $t('buttons.username') }}</span>
              <v-icon color="primary" size="20" class="ml-2 verified-icon">
                mdi-check-decagram
              </v-icon>
            </div>
            <span class="mobile-user-email text-grey-lighten-1">{{ user.email }}</span>
          </div>
        </div>

        <v-divider />

        <v-list v-if="isManager && test" density="compact" nav>
          <v-list-item
            v-for="(menuItem, i) in items"
            :key="i"
            :value="menuItem.path"
            link
            class="mobile-menu-item rounded-lg mx-2"
            @click="goTo(menuItem.path); drawer = false;"
          >
            <template #prepend>
              <v-icon color="white"> {{ menuItem.icon }} </v-icon>
            </template>
            <v-list-item-title class="text-white">
              {{ menuItem.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-spacer />

        <div class="mobile-signout">
          <v-divider />
          <div class="pa-2">
            <div
              class="mobile-menu-item d-flex align-center px-4 py-3 rounded-lg"
              @click="signOut(); drawer = false;"
            >
              <v-icon color="error" size="20"> mdi-logout </v-icon>
              <span class="ml-3 text-white">{{ $t('buttons.signout') }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import LocaleChanger from '@/components/atoms/LocaleChanger.vue';
import NotificationBtn from '../atoms/NotificationButton.vue';
import HelpButton from '../atoms/HelpButton.vue';
import UserController from '@/controllers/UserController';
import { getAuth } from 'firebase/auth';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import i18n from '@/i18n';

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
      isManager: false,
      username: null,
      profileImage: null,
      defaultImage: 'https://static.vecteezy.com/system/resources/previews/024/983/914/large_2x/simple-user-default-icon-free-png.png',
      display: useDisplay(),
    };
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    test() {
      return this.$store.state.Tests.Test;
    },
    items() {
      let items = [];
      if (this.test) {
        items = [
          {
            title: 'Manager',
            icon: 'mdi-home',
            path: `/managerview/${this.test.id}`,
            id: 0,
          },
        ];

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
            );
          } else if (this.accessLevel == 1) {
            items.push({
              title: 'Answer Test',
              icon: 'mdi-file-document',
              path: `/testview/${this.test.id}`,
              id: 1,
            });
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
          );
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
          );
        }
        if (this.test.template) {
          items.push({
            title: 'Template',
            icon: 'mdi-file-compare',
            path: `/templateview/${this.test.template.id}`,
            id: 7,
          });
        }
      }
      return items;
    },
    accessLevel() {
      if (this.user) {
        if (this.user.accessLevel == 0) return 0;
        const isTestOwner = this.test.testAdmin?.userDocId === this.user.id;
        if (isTestOwner) return 0;
        const answers = [];
        const answersEntries = Object.entries(this.user.myAnswers);
        answersEntries.forEach((answer) => {
          answers.push(answer[1]);
        });
        if (this.test.cooperators) {
          const coopsInfo = this.test.cooperators.find(
            (coops) => coops.userDocId === this.user.id,
          );
          if (coopsInfo) {
            return coopsInfo.accessLevel;
          }
        }
        if (this.test.isPublic) return 1;
        else return 2;
      }
      return 1;
    },
    userInitial() {
      if (this.username) {
        return this.username.charAt(0).toUpperCase();
      }
      return 'U';
    },
    smAndDown() {
      return this.display.smAndDown.value;
    },
    iconSize() {
      return this.$vuetify?.breakpoint?.xsOnly ? '18' : '20';
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const parentRoute = to.matched[0];
        if (parentRoute) {
          if (parentRoute.name === 'ManagerView') this.isManager = true;
          else this.isManager = false;
        }
      },
    },
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          this.fetchUsername();
        } else {
          this.username = null;
        }
      },
    },
  },
  mounted() {
    if (this.user) {
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
        this.$toast.error(i18n.t('errors.globalError'));
      }
    },
    goTo(route) {
      if (route.includes('/testview')) window.open(route);
      else {
        this.$router.push(route).catch(() => {});
      }
    },
    async signOut() {
      await this.$store.dispatch('logout');
      this.$router.push('/').catch(() => {});
    },
    goToProfile() {
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile').catch(() => { });
      }
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-navigation-drawer {
  height: 100vh !important;
}

.v-navigation-drawer__content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-dropdown {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
