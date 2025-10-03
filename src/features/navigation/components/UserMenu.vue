<template>
  <div
    v-if="user"
    class="d-none d-lg-flex"
  >
    <v-menu
      v-model="menu"
      :offset="[0, 8]"
      min-width="300"
      transition="slide-y-transition"
      :close-on-content-click="false"
      class="rounded-lg"
    >
      <template #activator="{ props }">
        <v-btn
          variant="text"
          class="pa-0 btn-fix"
          v-bind="props"
        >
          <v-avatar
            size="24"
            class="mr-1"
          >
            <v-img
              v-if="profileImage"
              :src="profileImage"
              alt="User Profile"
            />
            <v-icon
              v-else
              color="white"
              size="24"
            >
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
          <!-- User Info -->
          <div class="pa-6 d-flex align-center">
            <v-avatar
              size="48"
              color="primary"
              class="elevation-2"
            >
              <span class="text-h5 font-weight-medium text-white">{{ userInitial }}</span>
            </v-avatar>
            <div class="ml-4 flex-grow-1">
              <div class="d-flex align-center">
                <span class="text-h6 font-weight-bold text-grey-darken-4">
                  {{ username || $t('buttons.username') }}
                </span>
                <v-icon
                  color="primary"
                  size="20"
                  class="ml-2"
                >
                  mdi-check-decagram
                </v-icon>
              </div>
              <span class="text-subtitle-2 text-grey-darken-1">{{ user?.email || '' }}</span>
            </div>
          </div>

          <v-divider />

          <!-- Menu Items -->
          <div class="pa-2">
            <v-hover v-slot="{ isHovering }">
              <div
                class="d-flex align-center px-4 py-3 rounded-lg cursor-pointer"
                :class="{ 'primary lighten-5': isHovering }"
                @click="goToProfile(); menu = false;"
              >
                <v-icon
                  color="primary"
                  size="20"
                >
                  mdi-account
                </v-icon>
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
                <v-icon
                  color="error"
                  size="20"
                >
                  mdi-logout
                </v-icon>
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { getAuth } from 'firebase/auth';
import UserController from '@/features/auth/controllers/UserController';

// Composables
const router = useRouter();
const route = useRoute();
const store = useStore();
const { t } = useI18n();
const toast = useToast();

// State
const menu = ref(false);
const username = ref(null);
const profileImage = ref(null);

// Computed
const user = computed(() => store.getters.user);
const userInitial = computed(() => {
    if (username.value) {
        return username.value.charAt(0).toUpperCase();
    }
    return 'U';
});

// Methods
const fetchUsername = async () => {
    if (!user.value) return;

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
                console.warn('User document not found in Firestore');
                username.value = user.value?.username || null;
            }
        } else {
            console.warn('No user is currently signed in');
            username.value = user.value?.username || null;
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to store user data
        username.value = user.value?.username || null;
        profileImage.value = user.value?.profileImage || null;

        if (toast && typeof toast.error === 'function') {
            toast.error(t('errors.globalError'));
        }
    }
};

const goToProfile = () => {
    router.push({ 
      path: '/admin', 
      query: { section: 'profile' } 
    }).catch(() => { });
};

const signOut = async () => {
    await store.dispatch('logout');
    router.push('/').catch(() => { });
};

// Watchers
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
    { immediate: true }
);

// Lifecycle
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

.custom-dropdown {
    border-radius: 12px;
    overflow: hidden;
}
</style>
