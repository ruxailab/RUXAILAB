<template>
  <div>
    <v-app-bar density="comfortable" color="#00213F" class="px-4">
      <v-btn v-if="user" icon class="d-flex d-lg-none" @click.stop="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-toolbar-title v-if="$route.path !== '/help'" style="cursor: pointer" class="d-flex align-center"
        @click="goTo('/testslist')">
        <img src="@/assets/ruxailab-long-crop-white.png" alt="RUXAILAB Logo" height="25" class="mr-3 align-self-center"
          style="vertical-align: middle;" @click="goTo('/testslist')" />
      </v-toolbar-title>
      <v-toolbar-title v-else style="cursor: pointer" class="d-flex align-center" @click="goTo('/testslist')">
        <img src="@/assets/ruxailab-long-crop-white.png" alt="RUXAILAB Logo" height="25" class="mr-3 align-self-center"
          style="vertical-align: middle;" @click="goTo('/testslist')" />
        <span class="text-white font-weight-bold">Help Center</span>
      </v-toolbar-title>

      <v-spacer />

      <locale-changer />

      <v-btn v-if="$route.path === '/' && user" variant="text" color="#f9a826"
        class="console-button mx-1 d-none d-lg-flex" @click="goTo('/testslist')">
        {{ $t('buttons.goToConsole') }}
      </v-btn>

      <v-btn v-if="['/testslist', '/signin', '/signup'].includes($route.path)" variant="text" color="#f9a826"
        class="console-button mx-1 d-none d-lg-flex" @click="goTo('/')">
        {{ $t('AccessNotAllowed.goHome') }}
      </v-btn>

      <v-btn v-if="!['/', '/testslist', '/signin', '/signup'].includes($route.path)" variant="text" color="#f9a826"
        class="console-button mx-1 d-none d-lg-flex" @click="goTo('/testslist')">
        {{ $t('buttons.returnToConsole') }}
      </v-btn>

      <HelpButton :class="smAndDown ? 'mx-1' : 'mx-2'" />
      <NotificationBtn v-if="user" :class="smAndDown ? 'mx-1' : 'mx-2'" />

      <v-btn v-if="!user" variant="text" class="d-none d-lg-flex" @click="goTo('/signin')">
        <v-icon start>
          mdi-lock
        </v-icon>
        {{ $t('SIGNIN.sign-in') }}
      </v-btn>

      <v-btn v-if="!user" icon class="d-flex d-lg-none" @click="goTo('/signin')">
        <v-icon :size="iconSize">
          mdi-lock
        </v-icon>
      </v-btn>

      <div class="d-none d-lg-flex">
        <v-menu v-if="user" v-model="menu" :offset="[0, 8]" min-width="300" transition="slide-y-transition"
          :close-on-content-click="false" class="rounded-lg">
          <template #activator="{ props }">
            <v-btn variant="text" class="pa-0 btn-fix" v-bind="props">
              <v-avatar size="24" class="mr-1">
                <v-img v-if="profileImage" :src="profileImage" alt="User Profile" />
                <v-icon v-else color="white" size="24">
                  mdi-account-circle
                </v-icon>
              </v-avatar>
              <v-icon size="small">
                mdi-chevron-down
              </v-icon>
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
                    <span class="text-h6 font-weight-bold text-grey-darken-4">{{ username || $t('buttons.username')
                      }}</span>
                    <v-icon color="primary" size="20" class="ml-2">
                      mdi-check-decagram
                    </v-icon>
                  </div>
                  <span class="text-subtitle-2 text-grey-darken-1">{{ user.email }}</span>
                </div>
              </div>

              <v-divider />

              <div class="pa-2">
                <v-hover v-slot="{ isHovering }">
                  <div class="d-flex align-center px-4 py-3 rounded-lg cursor-pointer"
                    :class="{ 'primary lighten-5': isHovering }" @click="goToProfile(); menu = false;">
                    <v-icon color="primary" size="20">
                      mdi-account
                    </v-icon>
                    <span class="ml-3 text-subtitle-1 font-weight-medium" :class="{ 'primary--text': isHovering }">
                      {{ $t('buttons.profile') }}
                    </span>
                  </div>
                </v-hover>

                <v-divider class="my-2" />

                <v-hover v-slot="{ isHovering }">
                  <div class="d-flex align-center px-4 py-3 rounded-lg cursor-pointer"
                    :class="{ 'error lighten-5': isHovering }" @click="signOut(); menu = false;">
                    <v-icon color="error" size="20">
                      mdi-logout
                    </v-icon>
                    <span class="ml-3 text-subtitle-1 font-weight-medium" :class="{ 'error--text': isHovering }">
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

    <v-navigation-drawer v-if="user" v-model="drawer" temporary class="d-flex d-lg-none" style="height: 100vh;">
      <div class="mobile-dropdown dropdown">
        <div class="pa-4 d-flex align-center" style="cursor: pointer" @click="goToProfile(); drawer = false;">
          <v-avatar size="48" color="primary" class="user-avatar text-white">
            <span class="text-h5 font-weight-medium">{{ userInitial }}</span>
          </v-avatar>
          <div class="ml-4 flex-grow-1">
            <div class="d-flex align-center">
              <span class="mobile-user-name" style="color: #00213F;">{{ username || $t('buttons.username') }}</span>
              <v-icon color="primary" size="20" class="ml-2 verified-icon">
                mdi-check-decagram
              </v-icon>
            </div>
            <span class="mobile-user-email text-grey-darken-1">{{ user.email }}</span>
          </div>
        </div>

        <v-divider />

        <v-list v-if="isManager && test" density="compact" nav>
          <v-list-item v-for="(menuItem, i) in items" :key="i" :value="menuItem.path" link
            class="mobile-menu-item rounded-lg mx-2" @click="goTo(menuItem.path); drawer = false;">
            <template #prepend>
              <v-icon class="menu-icon">
                {{ menuItem.icon }}
              </v-icon>
            </template>
            <v-list-item-title class="menu-title">
              {{ menuItem.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-spacer />

        <div class="mobile-signout">
          <v-divider />
          <div class="pa-2">
            <div class="mobile-menu-item d-flex align-center px-4 py-3 rounded-lg" @click="signOut(); drawer = false;">
              <v-icon color="error" size="20">
                mdi-logout
              </v-icon>
              <span class="ml-3" style="color: #00213F;">{{ $t('buttons.signout') }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { getAuth } from 'firebase/auth';
import LocaleChanger from '@/components/atoms/LocaleChanger.vue';
import NotificationBtn from '../atoms/NotificationButton.vue';
import HelpButton from '../atoms/HelpButton.vue';
import UserController from '@/controllers/UserController';

const drawer = ref(false);
const menu = ref(false);
const isManager = ref(false);
const username = ref(null);
const profileImage = ref(null);
const defaultImage = 'https://static.vecteezy.com/system/resources/previews/024/983/914/large_2x/simple-user-default-icon-free-png.png';

const store = useStore();
const router = useRouter();
const route = useRoute();
const { smAndDown } = useDisplay();
const { t } = useI18n();
const toast = useToast();

const user = computed(() => store.getters.user);
const test = computed(() => store.state.Tests.Test);

const items = computed(() => {
  let items = [];
  if (test.value) {
    items = [
      {
        title: 'Manager',
        icon: 'mdi-home',
        path: `/managerview/${test.value.id}`,
        id: 0,
      },
    ];

    if (accessLevel.value <= 2) {
      if (accessLevel.value === 0) {
        items.push(
          {
            title: 'Test',
            icon: 'mdi-file-document-edit',
            path: `/edittest/${test.value.id}`,
            id: 1,
          },
          {
            title: 'Preview',
            icon: 'mdi-file-eye',
            path: `/testview/${test.value.id}`,
            id: 2,
          },
        );
      } else if (accessLevel.value === 1) {
        items.push({
          title: 'Answer Test',
          icon: 'mdi-file-document',
          path: `/testview/${test.value.id}`,
          id: 1,
        });
      }
    }
    if (accessLevel.value === 0) {
      items.push(
        {
          title: 'Reports',
          icon: 'mdi-book-multiple',
          path: `/reportview/${test.value.id}`,
          id: 3,
        },
        {
          title: 'Answers',
          icon: 'mdi-order-bool-ascending-variant',
          path: `/answerview/${test.value.id}`,
          id: 4,
        },
        {
          title: 'Final Report',
          icon: 'mdi-file-document',
          path: `/finalreportview/${test.value.id}`,
          id: 5,
        },
        {
          title: 'Cooperators',
          icon: 'mdi-account-group',
          path: `/cooperators/${test.value.id}`,
          id: 6,
        },
      );
    } else if (accessLevel.value === 1) {
      items.push(
        {
          title: 'Reports',
          icon: 'mdi-book-multiple',
          path: `/reportview/${test.value.id}`,
          id: 2,
        },
        {
          title: 'Answers',
          icon: 'mdi-order-bool-ascending-variant',
          path: `/answerview/${test.value.id}`,
          id: 3,
        },
      );
    }

    if (test.value.template) {
      items.push({
        title: 'Template',
        icon: 'mdi-file-compare',
        path: `/templateview/${test.value.template.id}`,
        id: 7,
      });
    }
  }
  return items;
});

const accessLevel = computed(() => {
  if (user.value) {
    if (user.value.accessLevel === 0) return 0;
    const isTestOwner = test.value.testAdmin?.userDocId === user.value.id;
    if (isTestOwner) return 0;
    const answers = [];
    const answersEntries = Object.entries(user.value.myAnswers || {});
    answersEntries.forEach((answer) => {
      answers.push(answer[1]);
    });
    if (test.value.cooperators) {
      const coopsInfo = test.value.cooperators.find(
        (coops) => coops.userDocId === user.value.id,
      );
      if (coopsInfo) {
        return coopsInfo.accessLevel;
      }
    }
    if (test.value.isPublic) return 1;
    else return 2;
  }
  return 1;
});

const userInitial = computed(() => {
  if (username.value) {
    return username.value.charAt(0).toUpperCase();
  }
  return 'U';
});

const iconSize = computed(() => {
  return smAndDown.value ? '18' : '20';
});

const fetchUsername = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userController = new UserController();
      const userDoc = await userController.getById(currentUser.uid);
      if (userDoc) {
        username.value = userDoc.username || null;
        profileImage.value = userDoc.profileImage || null;
      } else {
        console.error('User document not found in Firestore');
      }
    } else {
      console.error('No user is currently signed in');
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    toast.error(t('errors.globalError'));
    console.error(e)
  }
};

const goTo = (path) => {
  if (path.includes('/testview')) {
    window.open(path);
  } else {
    router.push(path).catch(() => { });
  }
};

const signOut = async () => {
  await store.dispatch('logout');
  router.push('/').catch(() => { });
};

const goToProfile = () => {
  if (route.path !== '/profile') {
    router.push('/profile').catch(() => { });
  }
};

watch(
  () => route,
  (to) => {
    const parentRoute = to.matched[0];
    if (parentRoute) {
      isManager.value = parentRoute.name === 'ManagerView';
    }
  },
  { immediate: true, deep: true },
);

watch(
  user,
  (newUser) => {
    if (newUser) {
      fetchUsername();
    } else {
      username.value = null;
      profileImage.value = null;
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (user.value) {
    fetchUsername();
  }
});
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

/* Mobile menu specific styling */
.mobile-menu-item .v-list-item-title {
  color: #00213F !important;
}

.mobile-menu-item .v-icon {
  color: #00213F !important;
}

.mobile-menu-item .menu-icon {
  color: #00213F !important;
}

.mobile-menu-item .menu-title {
  color: #00213F !important;
}

.mobile-user-name {
  color: #00213F !important;
}

.mobile-signout span {
  color: #00213F !important;
}

/* Force blue color for all mobile menu text */
.v-navigation-drawer .mobile-dropdown .v-list-item-title {
  color: #00213F !important;
}

.v-navigation-drawer .mobile-dropdown .v-icon:not(.verified-icon) {
  color: #00213F !important;
}
</style>
