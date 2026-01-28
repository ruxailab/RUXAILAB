<template>
  <div v-if="user">
    <v-menu
      v-model="menu"
      :offset="[0, 8]"
      min-width="300"
      transition="slide-y-transition"
      :close-on-content-click="false"
      class="rounded-lg"
    >
      <template #activator="{ props }">
        <v-btn variant="text" class="pa-0 btn-fix" v-bind="props">
          <v-avatar size="24" class="mr-1">
            <v-img v-if="profileImage" :src="profileImage" alt="User Profile" />

            <template v-else>
              <v-avatar
                size="24"
                class="bg-primary d-flex align-center justify-center"
              >
                <span class="text-white text-body-2">
                  {{ userInitial }}
                </span>
              </v-avatar>
            </template>
          </v-avatar>

          <v-icon size="small"> mdi-chevron-down </v-icon>
        </v-btn>
      </template>

      <template #default>
        <div class="custom-dropdown bg-white rounded-lg">
          <!-- User Info -->
          <div class="pa-6 d-flex align-center">
            <template v-if="profileImage">
              <v-avatar size="48" class="elevation-2">
                <v-img :src="profileImage" alt="User Profile" />
              </v-avatar>
            </template>

            <template v-else>
              <v-avatar
                size="48"
                class="elevation-2 bg-primary d-flex align-center justify-center"
              >
                <span class="text-h5 font-weight-medium text-white">
                  {{ userInitial }}
                </span>
              </v-avatar>
            </template>

            <div class="ml-4 flex-grow-1">
              <div class="d-flex align-center">
                <span class="text-h6 font-weight-bold text-grey-darken-4">
                  {{ username || $t('buttons.username') }}
                </span>

                <v-icon color="primary" size="20" class="ml-2">
                  mdi-check-decagram
                </v-icon>
              </div>

              <span class="text-subtitle-2 text-grey-darken-1">
                {{ user?.email || '' }}
              </span>
            </div>
          </div>

          <v-divider />

          <!-- Menu Items -->
          <div class="pa-2">
            <v-hover v-slot="{ isHovering }">
              <div
                class="d-flex align-center px-4 py-3 rounded-lg cursor-pointer"
                :class="{ 'primary lighten-5': isHovering }"
                @click="goToProfile(), (menu = false)"
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
                @click="
                  showSignOutConfirm = true
                  menu = false
                "
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

    <!-- Sign Out Confirmation Dialog -->
    <v-dialog
      v-model="showSignOutConfirm"
      max-width="400"
      role="dialog"
      aria-labelledby="signout-dialog-title"
    >
      <v-card class="rounded-lg">
        <v-card-title
          id="signout-dialog-title"
          class="text-h6 d-flex align-center"
        >
          <v-icon color="warning" class="mr-2">mdi-logout</v-icon>
          {{ $t('dialogs.signOutConfirm.title') }}
        </v-card-title>
        <v-card-text class="text-body-1">
          {{ $t('dialogs.signOutConfirm.message') }}
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showSignOutConfirm = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn color="error" variant="flat" @click="confirmedSignOut">
            {{ $t('buttons.signout') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getAuth } from 'firebase/auth'
import UserController from '@/features/auth/controllers/UserController'
import { showError } from '@/shared/utils/toast'

// Composables
const router = useRouter()
const store = useStore()

// State
const menu = ref(false)
const username = ref(null)
const profileImage = ref(null)
const showSignOutConfirm = ref(false)

// Computed
const user = computed(() => store.getters.user)
const userInitial = computed(() => {
  if (username.value) {
    return username.value.charAt(0).toUpperCase()
  }
  return 'U'
})

// Methods
const fetchUsername = async () => {
  if (!user.value) return

  try {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser) {
      const userController = new UserController()
      const userDoc = await userController.getById(currentUser.uid)
      if (userDoc) {
        username.value = userDoc.username || currentUser.displayName || null
        profileImage.value =
          userDoc.profileImage || currentUser.photoURL || null
      } else {
        username.value = user.value?.username || null
      }
    } else {
      username.value = user.value?.username || null
    }
  } catch {
    // Fallback to store user data
    username.value = user.value?.username || null
    profileImage.value = user.value?.profileImage || null

    showError('errors.globalError')
  }
}

const goToProfile = () => {
  router
    .push({
      path: '/admin',
      query: { section: 'profile' },
    })
    .catch(() => {})
}

const signOut = async () => {
  await store.dispatch('logout')
  router.push('/').catch(() => {})
}

const confirmedSignOut = async () => {
  showSignOutConfirm.value = false
  await signOut()
}

// Watchers
watch(
  user,
  (newUser) => {
    if (newUser) {
      fetchUsername()
    } else {
      username.value = null
      profileImage.value = null
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  if (user.value) {
    fetchUsername()
  }
})
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
