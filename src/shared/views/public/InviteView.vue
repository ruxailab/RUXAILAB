<template>
  <div class="invite-wrapper">
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img src="@/assets/logo_full.png" alt="RUXAILAB" class="logo-img" />
    </div>

    <div class="form-side d-flex align-center justify-center">
      <div class="invite-box">
        <div class="d-md-none text-center mb-6">
          <img
            src="@/assets/logo_full.png"
            alt="RUXAILAB"
            class="mobile-logo-img"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center">{{ $t('invite.loading') }}</div>

        <!-- Invalid invitation -->
        <div v-else-if="error" class="text-center">
          <h2>{{ $t('invite.unavailableTitle') }}</h2>

          <p class="mb-6">
            {{ error }}
          </p>
        </div>

        <!-- Wrong authenticated account -->
        <div v-else-if="unauthorized">
          <h1 class="text-h5 mb-2">{{ $t('invite.title') }}</h1>

          <p class="subtitle mb-6">
            {{ $t('invite.wrongAccountDescription') }}
          </p>

          <v-alert type="warning" variant="tonal" class="mb-6">
            {{ $t('invite.currentAccount') }}
            <strong>{{ user.email }}</strong
            >.
          </v-alert>

          <v-btn block color="primary" class="mb-2" @click="goToLogin">
            {{ $t('invite.signInAnotherAccount') }}
          </v-btn>

          <v-btn block variant="primary" color="primary" @click="goToSignup">
            {{ $t('invite.createAccount') }}
          </v-btn>
        </div>

        <!-- Valid invitation -->
        <div v-else>
          <h1 class="text-h5 mb-2">{{ $t('invite.title') }}</h1>

          <p class="subtitle mb-6">
            {{ $t('invite.description') }}
            <strong>{{ invite.studyTitle ?? '' }}</strong>
          </p>

          <template v-if="user">
            <v-alert type="warning" variant="tonal" class="mb-6">
              {{ $t('invite.currentAccount') }}
              <strong>{{ user.email }}</strong
              >.
            </v-alert>

            <v-btn
              block
              color="primary"
              min-height="44"
              :loading="loading"
              @click="acceptInvite"
            >
              {{ $t('invite.accept') }}
            </v-btn>

            <div class="text-center text-medium-emphasis my-5">
              {{ $t('invite.or') }}
            </div>
          </template>

          <template v-else>
            <template v-if="!user && !canContinueAsGuest">
              <v-alert type="info" variant="tonal" class="mb-4">
                {{ $t('invite.loginRequired') }}
              </v-alert>
            </template>
            <p class="mb-4">{{ $t('invite.chooseHowToContinue') }}</p>
          </template>

          <v-btn
            block
            variant="outlined"
            color="primary"
            class="mb-2"
            @click="goToLogin"
          >
            {{ user ? $t('invite.signInAnotherAccount') : $t('invite.signIn') }}
          </v-btn>

          <v-btn
            block
            variant="text"
            color="primary"
            class="mb-4"
            @click="goToSignup"
          >
            {{ $t('invite.createAccount') }}
          </v-btn>
          <template v-if="canContinueAsGuest">
            <v-divider class="mb-4" />

            <v-btn
              block
              variant="outlined"
              color="primary"
              @click="continueAsGuest"
            >
              {{ $t('invite.continueAsGuest') }}
            </v-btn>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const unauthorized = ref(false)
const invite = ref(null)

const token = ref(null)
const user = computed(() => store.getters.user)

const canContinueAsGuest = computed(() => invite.value?.requiredLogin !== true)

const goToLogin = async () => {
  localStorage.setItem('pendingInviteToken', token.value)

  if (store.state.Auth.user) {
    await store.dispatch('logout')
  }

  router.push('/signin')
}

const goToSignup = async () => {
  localStorage.setItem('pendingInviteToken', token.value)

  if (store.state.Auth.user) {
    await store.dispatch('logout')
  }

  router.push('/signup')
}

const acceptInvite = async () => {
  try {
    loading.value = true

    const result = await store.dispatch('acceptInvite', {
      token: token.value,
      user: user.value,
      studyId: invite.value.studyId,
      membershipType: invite.value.membershipType,
    })

    router.replace(`/testview/${result.study.id}`)
  } catch (err) {
    error.value =
      err?.response?.data?.message || err?.message || t('invite.acceptFailed')

    loading.value = false
  }
}

const continueAsGuest = () => {
  localStorage.removeItem('pendingInviteToken')

  router.replace({
    name: 'TestView',
    params: {
      id: invite.value.studyId,
    },
    query: {
      inviteToken: token.value,
      guest: 'true',
    },
  })
}

onMounted(async () => {
  try {
    /**
     * Get invite token
     */
    token.value =
      route.query.token || localStorage.getItem('pendingInviteToken')

    if (!token.value) {
      error.value = t('invite.invalidLink')
      return
    }

    /**
     * Validate invitation and restore authenticated user
     */
    const result = await store.dispatch('loadInvite', {
      token: token.value,
    })

    invite.value = result.invite
    unauthorized.value = result.unauthorized
  } catch (err) {
    error.value =
      err?.response?.data?.message || err?.message || t('invite.loadFailed')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.invite-wrapper {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: #ffffff;
  flex-wrap: wrap;
}

/* LEFT SIDE LOGO */
.logo-side {
  width: 50%;
  min-height: 100%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  max-width: 600px;
  width: 100%;
}

.mobile-logo-img {
  max-width: 220px;
  width: 100%;
}

/* RIGHT SIDE FORM */
.form-side {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* BOX STYLING */
.invite-box {
  width: 100%;
  max-width: 520px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
}

.subtitle {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1rem;
}

@media (max-width: 960px) {
  .logo-side {
    display: none;
  }

  .form-side {
    width: 100%;
    padding: 24px;
    align-items: center;
  }

  .invite-box {
    padding: 24px;
    box-shadow: none;
  }
}

@media (max-width: 600px) {
  .invite-box {
    padding: 16px;
    border-radius: 12px;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
}
</style>
