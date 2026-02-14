<template>
  <div class="background-grey">
    <Snackbar />

    <v-row justify="center" align="center" style="height: 100%">
      <v-col cols="12" md="6" lg="5">
        <v-card class="mx-auto pa-6" max-width="480" elevation="8">
          <template v-if="!isSubmitted">
            <v-card-title class="text-h4 font-weight-bold mb-2">
              {{ $t('auth.FORGOT_PASSWORD.reset_password') }}
            </v-card-title>

            <v-card-subtitle class="mb-6">
              {{ $t('auth.FORGOT_PASSWORD.instructions') }}
            </v-card-subtitle>

            <v-form ref="form" v-model="valid" @submit.prevent="onResetRequest">
              <v-text-field
                v-model="email"
                :label="$t('auth.FORGOT_PASSWORD.email')"
                :rules="emailRules"
                type="email"
                placeholder="you@example.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                class="mb-6"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                min-height="44"
              >
                {{ $t('auth.FORGOT_PASSWORD.reset_button') }}
              </v-btn>
            </v-form>
          </template>

          <v-card-text v-else class="text-center pa-4">
            <v-icon
              icon="mdi-check-circle"
              color="success"
              size="64"
              class="mb-4"
            />

            <h2 class="text-h5 font-weight-bold mb-2">
              {{ $t('auth.FORGOT_PASSWORD.check_your_email') }}
            </h2>

            <p class="text-body-1 mb-4">
              {{ $t('auth.FORGOT_PASSWORD.reset_link_sent') }}
              <strong>{{ email }}</strong>
            </p>

            <p class="text-body-2 text-medium-emphasis">
              {{ $t('auth.FORGOT_PASSWORD.no_email') }}
              <v-btn
                variant="text"
                color="primary"
                class="text-body-2 px-2"
                @click="isSubmitted = false"
              >
                {{ $t('auth.FORGOT_PASSWORD.try_again') }}
              </v-btn>
            </p>
          </v-card-text>

          <div class="text-center" :class="{ 'mt-6': !isSubmitted }">
            <v-btn
              variant="text"
              color="primary"
              class="text-body-2"
              prepend-icon="mdi-arrow-left"
              @click="redirectToSignin"
            >
              {{ $t('auth.FORGOT_PASSWORD.back_to_signin') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Snackbar from '@/shared/components/Snackbar'
import { useI18n } from 'vue-i18n'

const store = useStore()
const router = useRouter()
const { t } = useI18n()

const valid = ref(false)
const email = ref('')
const form = ref(null)
const isSubmitted = ref(false)

const loading = computed(() => store.getters.loading)

const emailRules = [
  (v) => !!v || t('errors.emailIsRequired'),
  (v) =>
    /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ||
    t('errors.invalidEmail'),
]

const onResetRequest = async () => {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  try {
    await store.dispatch('resetPassword', { email: email.value })
    isSubmitted.value = true
  } catch (error) {
    return error
  }
}

const redirectToSignin = () => {
  router.push('/signin')
}
</script>

<style scoped>
.background-grey {
  background-color: #e8eaf2;
  height: 100vh;
  display: flex;
  align-items: center;
}

.v-card {
  border-radius: 16px !important;
}

:deep(.v-field) {
  border-radius: 12px !important;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}
</style>
