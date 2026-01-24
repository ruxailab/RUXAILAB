<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="elevation-12 rounded-xl">
          <v-card-title class="bg-primary text-white pa-6 rounded-t-xl">
            <div class="d-flex align-center">
              <v-icon class="mr-3" size="32">mdi-account-plus</v-icon>
              <div>
                <h1 class="text-h5 font-weight-bold">Accept Invitation</h1>
                <p class="text-body-2 mb-0 opacity-90">Create your account to join the study</p>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Error Display -->
            <v-alert v-if="error" type="error" class="mb-4">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-alert-circle</v-icon>
                <div>{{ error }}</div>
              </div>
              <v-btn v-if="showLoginInstead" color="error" variant="text" size="small" @click="redirectToLogin" class="mt-2">
                Sign in instead
              </v-btn>
            </v-alert>

            <!-- Success Display -->
            <v-alert v-if="success" type="success" class="mb-4">
              {{ success }}
            </v-alert>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
              <p class="mt-4 text-body-1">Validating invitation...</p>
            </div>

            <!-- Invalid Invitation -->
            <div v-else-if="!invitationValid && !loading" class="text-center py-8">
              <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
              <h2 class="text-h5 mb-3">Invalid Invitation</h2>
              <p class="text-body-1 mb-4">{{ error || 'This invitation link is invalid or has expired.' }}</p>
              <v-btn color="primary" @click="goToHome">
                Go to Homepage
              </v-btn>
            </div>

            <!-- Valid Invitation Form -->
            <div v-else-if="invitationValid && !accountCreated">
              <!-- Invitation Info Card -->
              <v-card variant="outlined" class="mb-6">
                <v-card-title class="bg-blue-lighten-5">
                  <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                  Invitation Details
                </v-card-title>
                <v-card-text>
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-account</v-icon>
                      </template>
                      <v-list-item-title class="text-caption">Invited by</v-list-item-title>
                      <v-list-item-subtitle class="text-body-1">{{ invitationData.adminName }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-divider class="my-2"></v-divider>
                    
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-clipboard-text</v-icon>
                      </template>
                      <v-list-item-title class="text-caption">Study</v-list-item-title>
                      <v-list-item-subtitle class="text-body-1">{{ invitationData.testTitle }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-divider class="my-2"></v-divider>
                    
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-email</v-icon>
                      </template>
                      <v-list-item-title class="text-caption">Invited Email</v-list-item-title>
                      <v-list-item-subtitle class="text-body-1">{{ invitationData.email }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-divider class="my-2"></v-divider>
                    
                    <v-list-item v-if="invitationData.invitationExpires">
                      <template #prepend>
                        <v-icon color="primary">mdi-clock-outline</v-icon>
                      </template>
                      <v-list-item-title class="text-caption">Expires</v-list-item-title>
                      <v-list-item-subtitle class="text-body-1">
                        {{ formatDate(invitationData.invitationExpires) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>

              <!-- Registration Form -->
              <v-form ref="registerForm" v-model="valid" @submit.prevent="createAccount">
                <v-text-field
                  v-model="form.name"
                  label="Full Name"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Name is required']"
                  required
                  class="mb-4"
                  prepend-inner-icon="mdi-account-outline"
                />

                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  variant="outlined"
                  density="comfortable"
                  type="email"
                  disabled
                  class="mb-4"
                  prepend-inner-icon="mdi-email-outline"
                />

                <v-text-field
                  v-model="form.password"
                  label="Password"
                  variant="outlined"
                  density="comfortable"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[
                    v => !!v || 'Password is required',
                    v => (v && v.length >= 6) || 'Password must be at least 6 characters',
                    v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
                    v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
                    v => /\d/.test(v) || 'Password must contain at least one number'
                  ]"
                  required
                  class="mb-2"
                  prepend-inner-icon="mdi-lock-outline"
                >
                  <template #append-inner>
                    <v-icon @click="showPassword = !showPassword" class="cursor-pointer">
                      {{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="form.confirmPassword"
                  label="Confirm Password"
                  variant="outlined"
                  density="comfortable"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :rules="[
                    v => !!v || 'Please confirm your password',
                    v => v === form.password || 'Passwords do not match'
                  ]"
                  required
                  class="mb-4"
                  prepend-inner-icon="mdi-lock-check-outline"
                >
                  <template #append-inner>
                    <v-icon @click="showConfirmPassword = !showConfirmPassword" class="cursor-pointer">
                      {{ showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </template>
                </v-text-field>

                <v-checkbox
                  v-model="form.terms"
                  :rules="[v => !!v || 'You must accept the terms to continue']"
                  required
                  class="mt-2"
                >
                  <template #label>
                    <span class="text-body-2">
                      I agree to the 
                      <router-link to="/terms-of-service" class="text-primary text-decoration-none">Terms of Service</router-link> 
                      and 
                      <router-link to="/privacy-policy" class="text-primary text-decoration-none">Privacy Policy</router-link>
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
                  class="mt-4"
                  prepend-icon="mdi-check-circle"
                >
                  Create Account & Accept Invitation
                </v-btn>
              </v-form>
            </div>

            <!-- Success State -->
            <div v-else-if="accountCreated" class="text-center py-8">
              <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
              <h2 class="text-h5 mb-3">Account Created Successfully!</h2>
              <p class="text-body-1 mb-2">You have been added to the study:</p>
              <p class="text-body-1 font-weight-bold mb-4">{{ invitationData.testTitle }}</p>
              <div class="d-flex justify-center gap-3">
                <v-btn color="primary" size="large" @click="redirectToStudy">
                  Go to Study
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn variant="outlined" size="large" @click="goToDashboard">
                  Go to Dashboard
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { showSuccess } from "@/shared/utils/toast";

const route = useRoute();
const router = useRouter();
const store = useStore();

// State
const loading = ref(true);
const error = ref("");
const success = ref("");
const invitationValid = ref(false);
const accountCreated = ref(false);
const creatingAccount = ref(false);
const valid = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const registerForm = ref(null);
const showLoginInstead = ref(false);

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

// Computed
const isInvitationExpired = computed(() => {
  if (!invitationData.value.invitationExpires) return false;
  return Date.now() > invitationData.value.invitationExpires;
});

// Methods
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const validateInvitation = async () => {
  const token = route.query.token;
  const email = route.query.email ? decodeURIComponent(route.query.email) : "";

  if (!token || !email) {
    error.value = "Invalid invitation link. Please check the URL.";
    loading.value = false;
    return;
  }

  try {
    const result = await store.dispatch("validateInvitation", { token, email });

    if (result.valid === false) {
      error.value = result.error || "Invalid invitation";
      
      // Check if user already exists
      if (result.error?.includes("already exists") || result.error?.includes("already in use")) {
        showLoginInstead.value = true;
      }
      
      invitationValid.value = false;
      loading.value = false;
      return;
    }

    // Set form data
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
      userExists: result.userExists,
    };

    // Check for various conditions
    if (result.userExists) {
      error.value = "An account already exists with this email. Please sign in instead.";
      showLoginInstead.value = true;
      invitationValid.value = false;
    } else if (isInvitationExpired.value) {
      error.value = "This invitation has expired. Please contact the study administrator.";
      invitationValid.value = false;
    } else {
      invitationValid.value = true;
    }

    loading.value = false;
  } catch (err) {
    error.value = err.message || "Failed to validate invitation. Please try again.";
    loading.value = false;
    invitationValid.value = false;
  }
};

const createAccount = async () => {
  if (!registerForm.value.validate()) return;

  creatingAccount.value = true;
  error.value = "";

  try {
    await store.dispatch("acceptInvitation", {
      token: invitationData.value.token,
      email: form.value.email,
      name: form.value.name,
      password: form.value.password,
    });

    accountCreated.value = true;
    creatingAccount.value = false;
    
    showSuccess("Account created successfully! You have been added to the study.");
    
    // Redirect after delay
    setTimeout(() => {
      redirectToStudy();
    }, 2000);
  } catch (err) {
    error.value = err.message || "Failed to create account. Please try again.";
    creatingAccount.value = false;
  }
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

// Lifecycle
onMounted(async () => {
  try {
    await validateInvitation();
  } catch (err) {
    error.value = "An unexpected error occurred. Please try again.";
    loading.value = false;
  }
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-list-item {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.gap-3 {
  gap: 12px;
}
</style>