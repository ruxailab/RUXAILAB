<template>
  <div class="invitation-wrapper">
    <Loading />
    
    <!-- LEFT: LOGO -->
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img src="@/assets/logo_full.png" alt="RUXAILAB" class="logo-img" />
    </div>

    <!-- RIGHT: FORM -->
    <div class="form-side d-flex align-center justify-center">
      <div class="invitation-box">
        <h1 class="text-h6">{{ $t('invitation.title') }}</h1>
        <p class="subtitle">{{ $t('invitation.subtitle') }}</p>

        <!-- Error Display -->
        <v-alert 
          v-if="error" 
          :type="errorType || 'error'" 
          class="mb-4" 
          dismissible 
          @click:close="clearError"
          variant="tonal"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2" :icon="errorType === 'warning' ? 'mdi-alert' : 'mdi-alert-circle'"></v-icon>
            <div>{{ error }}</div>
          </div>
          <v-btn 
            v-if="showLoginInstead" 
            :color="errorType === 'warning' ? 'warning' : 'error'" 
            variant="text" 
            size="small" 
            @click="redirectToLogin" 
            class="mt-2"
          >
            {{ $t('invitation.signInInstead') }}
          </v-btn>
        </v-alert>

        <!-- Success Display -->
        <v-alert v-if="success" type="success" class="mb-4" dismissible variant="tonal">
          {{ success }}
        </v-alert>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
          <p class="mt-4 text-body-1">{{ $t('invitation.validating') }}</p>
        </div>

        <!-- Invalid Invitation -->
        <div v-else-if="!invitationValid && !loading" class="text-center py-8">
          <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
          <h2 class="text-h5 mb-3">{{ $t('invitation.invalidTitle') }}</h2>
          <p class="text-body-1 mb-4">{{ error || $t('invitation.invalidMessage') }}</p>
          <v-btn color="primary" @click="goToHome" rounded="pill">
            {{ $t('invitation.goToHomepage') }}
          </v-btn>
        </div>

        <!-- Valid Invitation Form -->
        <div v-else-if="invitationValid && !accountCreated">
          <!-- Invitation Info Card -->
          <v-card variant="outlined" class="mb-6" rounded="lg">
            <v-card-item>
              <template #prepend>
                <v-icon color="primary" size="28" icon="mdi-information"></v-icon>
              </template>
              <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
                {{ $t('invitation.invitationDetails') }}
              </v-card-title>
            </v-card-item>
            <v-divider></v-divider>
            <v-card-text class="pt-4">
              <div class="detail-row">
                <v-icon color="primary" size="small" class="mr-2">mdi-account</v-icon>
                <div class="detail-content">
                  <span class="text-caption text-medium-emphasis">{{ $t('invitation.invitedBy') }}</span>
                  <div class="text-body-2 font-weight-medium">{{ invitationData.adminName }}</div>
                </div>
              </div>
              
              <v-divider class="my-3"></v-divider>
              
              <div class="detail-row">
                <v-icon color="primary" size="small" class="mr-2">mdi-clipboard-text</v-icon>
                <div class="detail-content">
                  <span class="text-caption text-medium-emphasis">{{ $t('invitation.study') }}</span>
                  <div class="text-body-2 font-weight-medium">{{ invitationData.testTitle }}</div>
                </div>
              </div>
              
              <v-divider class="my-3"></v-divider>
              
              <div class="detail-row">
                <v-icon color="primary" size="small" class="mr-2">mdi-email</v-icon>
                <div class="detail-content">
                  <span class="text-caption text-medium-emphasis">{{ $t('invitation.invitedEmail') }}</span>
                  <div class="text-body-2 font-weight-medium">{{ invitationData.email }}</div>
                </div>
              </div>
              
              <v-divider v-if="invitationData.invitationExpires" class="my-3"></v-divider>
              
              <div v-if="invitationData.invitationExpires" class="detail-row">
                <v-icon color="primary" size="small" class="mr-2">mdi-clock-outline</v-icon>
                <div class="detail-content">
                  <span class="text-caption text-medium-emphasis">{{ $t('invitation.expires') }}</span>
                  <div class="text-body-2">{{ formatDate(invitationData.invitationExpires) }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Registration Form -->
          <v-form ref="registerForm" v-model="valid" @submit.prevent="createAccount">
            <v-text-field
              v-model="form.name"
              :label="$t('invitation.auth.SIGNIN.name')"
              variant="outlined"
              density="comfortable"
              :rules="nameRules"
              required
              class="mb-3"
              prepend-inner-icon="mdi-account-outline"
              bg-color="grey-lighten-5"
              rounded="lg"
            />

            <v-text-field
              v-model="form.email"
              :label="$t('invitation.auth.SIGNIN.email')"
              variant="outlined"
              density="comfortable"
              type="email"
              disabled
              class="mb-3"
              prepend-inner-icon="mdi-email-outline"
              bg-color="grey-lighten-5"
              rounded="lg"
            />

            <v-text-field
              v-model="form.password"
              :label="$t('invitation.auth.SIGNIN.password')"
              variant="outlined"
              density="comfortable"
              :type="showPassword ? 'text' : 'password'"
              :rules="passwordRules"
              required
              class="mb-2"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              bg-color="grey-lighten-5"
              rounded="lg"
            />

            <PasswordStrength :password="form.password" />

            <v-text-field
              v-model="form.confirmPassword"
              :label="$t('invitation.auth.SIGNIN.confirmPassword')"
              variant="outlined"
              density="comfortable"
              :type="showConfirmPassword ? 'text' : 'password'"
              :rules="confirmPasswordRules"
              required
              class="mb-3 mt-2"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              bg-color="grey-lighten-5"
              rounded="lg"
            />

            <v-checkbox
              v-model="form.terms"
              :rules="[v => !!v || $t('invitation.termsRequired')]"
              required
              class="mt-1"
              color="primary"
            >
              <template #label>
                <span class="text-body-2">
                  {{ $t('invitation.agreeTo') }} 
                  <router-link to="/terms-of-service" class="text-primary text-decoration-none font-weight-medium">{{ $t('invitation.footer.termsOfService') }}</router-link> 
                  {{ $t('invitation.common.and') }} 
                  <router-link to="/privacy-policy" class="text-primary text-decoration-none font-weight-medium">{{ $t('invitation.footer.privacyPolicy') }}</router-link>
                </span>
              </template>
            </v-checkbox>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="creatingAccount"
              :disabled="!valid"
              class="mt-2"
              prepend-icon="mdi-check-circle"
              rounded="pill"
              elevation="2"
            >
              {{ $t('invitation.createAndAccept') }}
            </v-btn>
          </v-form>

          <!-- Google Sign-In option -->
          <v-divider class="my-4">
            <span class="text-body-2 text-medium-emphasis px-2">{{ $t('invitation.auth.SIGNIN.or') }}</span>
          </v-divider>

          <GoogleSignInButton
            :button-text="$t('invitation.auth.SIGNIN.continueWithGoogle')"
            :loading="googleLoading"
            @google-sign-in-start="onGoogleSignInStart"
            @google-sign-in-success="onGoogleSignInSuccess"
            @google-sign-in-error="onGoogleSignInError"
          />

          <div class="text-center mt-4">
            <span class="text-body-2 text-medium-emphasis">
              {{ $t('invitation.auth.SIGNIN.alreadyHaveAnAccount') }}
            </span>
            <v-btn
              variant="text"
              color="primary"
              class="text-body-2 font-weight-medium"
              @click="redirectToLogin"
            >
              {{ $t('invitation.auth.SIGNIN.sign-in') }}
            </v-btn>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="accountCreated" class="text-center py-6">
          <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
          <h2 class="text-h5 mb-3">{{ $t('invitation.successTitle') }}</h2>
          <p class="text-body-1 mb-2">{{ $t('invitation.successMessage') }}</p>
          <p class="text-body-1 font-weight-bold mb-4 text-primary">{{ invitationData.testTitle }}</p>
          <p class="text-body-2 text-medium-emphasis mb-6">{{ $t('invitation.chooseOption') }}</p>
          <div class="d-flex flex-column flex-sm-row justify-center gap-3">
            <v-btn color="primary" size="large" @click="redirectToStudy" rounded="pill" elevation="2">
              {{ $t('invitation.goToStudy') }}
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
            <v-btn variant="outlined" size="large" @click="goToDashboard" rounded="pill">
              {{ $t('invitation.goToDashboard') }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { showSuccess } from "@/shared/utils/toast";
import PasswordStrength from '@/features/auth/components/PasswordStrength.vue'
import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton.vue'
import Loading from '@/shared/components/Loading.vue'

const route = useRoute();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(true);
const error = ref("");
const errorType = ref("error");
const success = ref("");
const invitationValid = ref(false);
const accountCreated = ref(false);
const creatingAccount = ref(false);
const valid = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const registerForm = ref(null);
const showLoginInstead = ref(false);
const googleLoading = ref(false);

const invitationData = ref({
  email: "",
  testTitle: "",
  adminName: "",
  adminEmail: "",
  token: "",
  testId: "",
  invitationExpires: null,
  accessLevel: 1,
  invitationMessage: "",
  userExists: false,
});

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
});

// Validation rules
const nameRules = [
  (v) => !!v || t('invitation.errors.nameRequired'),
  (v) => v?.length >= 2 || t('invitation.errors.nameMinLength'),
];

const passwordRules = [
  (v) => !!v || t('invitation.errors.passwordRequired'),
  (v) => v?.length >= 8 || t('invitation.errors.passwordValidate'),
  (v) => /[A-Z]/.test(v) || t('invitation.errors.passwordUppercase'),
  (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || t('invitation.errors.passwordSymbol'),
];

const confirmPasswordRules = [
  (v) => !!v || t('invitation.errors.passwordRequired'),
  (v) => v === form.value.password || t('invitation.errors.differentPasswords'),
];

// Computed
const isInvitationExpired = computed(() => {
  if (!invitationData.value.invitationExpires) return false;
  return Date.now() > invitationData.value.invitationExpires;
});

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const clearError = () => {
  error.value = "";
  errorType.value = "error";
};

const validateInvitation = async () => {
  const token = route.query.token;
  const email = route.query.email ? decodeURIComponent(route.query.email) : "";

  if (!token || !email) {
    error.value = t('invitation.invalidLink');
    loading.value = false;
    return;
  }

  try {
    const result = await store.dispatch("validateInvitation", { token, email });

    if (!result.valid) {
      error.value = result.error || t('invitation.invalidInvitation');
      
      if (result.error?.includes("already exists")) {
        showLoginInstead.value = true;
        errorType.value = "warning";
      }
      
      invitationValid.value = false;
      loading.value = false;
      return;
    }

    form.value.email = result.email;
    invitationData.value = {
      email: result.email,
      testTitle: result.testTitle,
      adminName: result.adminName,
      adminEmail: result.adminEmail,
      token: token,
      testId: result.testId,
      invitationExpires: result.invitationExpires,
      accessLevel: result.accessLevel,
      invitationMessage: result.invitationMessage,
      userExists: result.userExistsInFirestore,
    };

    if (result.userExistsInFirestore) {
      error.value = t('invitation.accountExists');
      showLoginInstead.value = true;
      errorType.value = "warning";
      invitationValid.value = false;
    } else if (isInvitationExpired.value) {
      error.value = t('invitation.expiredInvitation');
      invitationValid.value = false;
    } else {
      invitationValid.value = true;
    }

    loading.value = false;
  } catch (err) {
    error.value = err.message || t('invitation.validationFailed');
    loading.value = false;
    invitationValid.value = false;
  }
};

const createAccount = async () => {
  const { valid } = await registerForm.value.validate();
  if (!valid) return;

  creatingAccount.value = true;
  clearError();

  try {
    await store.dispatch("acceptInvitation", {
      token: invitationData.value.token,
      email: form.value.email,
      name: form.value.name,
      password: form.value.password,
    });

    accountCreated.value = true;
    showSuccess(t('invitation.accountCreated'));
  } catch (err) {
    error.value = err.message || t('invitation.accountCreationFailed');
  } finally {
    creatingAccount.value = false;
  }
};

const onGoogleSignInStart = () => {
  googleLoading.value = true;
  store.commit('setLoading', true);
};

const onGoogleSignInSuccess = async () => {
  googleLoading.value = false;
  store.commit('setLoading', false);
  
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Authentication failed');
    }
    
    await store.dispatch("acceptInvitationWithGoogle", {
      token: invitationData.value.token,
      email: form.value.email,
      userId: user.uid,
      name: user.displayName || form.value.name || user.email.split('@')[0],
    });
    
    accountCreated.value = true;
    showSuccess(t('invitation.accountCreated'));
  } catch (error) {
    error.value = error.message || t('invitation.accountCreationFailed');
  }
};

const onGoogleSignInError = () => {
  googleLoading.value = false;
  store.commit('setLoading', false);
  error.value = t('invitation.googleSignInFailed');
};

const redirectToStudy = () => {
  if (invitationData.value.testId) {
    router.push(`/testview/${invitationData.value.testId}`);
  } else {
    router.push("/dashboard");
  }
};

const goToDashboard = () => {
  router.push("/dashboard");
};

const goToHome = () => {
  router.push("/");
};

const redirectToLogin = () => {
  router.push("/signin");
};

onMounted(async () => {
  await validateInvitation();
});
</script>

<style scoped>
.invitation-wrapper {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: #ffffff;
  flex-wrap: wrap;
}

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

.form-side {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invitation-box {
  width: 100%;
  max-width: 480px;
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.08);
}

.subtitle {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-content {
  flex: 1;
}

/* RESPONSIVE STYLES */
@media (max-width: 960px) {
  .logo-side {
    display: none;
  }

  .form-side {
    width: 100%;
    padding: 24px;
  }

  .invitation-box {
    padding: 24px;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .form-side {
    padding: 16px;
  }

  .invitation-box {
    padding: 20px;
    border-radius: 20px;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
}

.gap-3 {
  gap: 12px;
}
</style>
