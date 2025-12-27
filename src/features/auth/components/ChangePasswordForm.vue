<template>
  <v-card class="rounded-xl pa-6" elevation="2">
    <v-card-title class="text-h6 font-weight-bold mb-4">
      <v-icon start color="primary">
        mdi-lock
      </v-icon>
      {{ $t('profile.changePassword') }}
    </v-card-title>
    <v-card-text>
      <v-alert type="warning" variant="outlined" class="mb-6">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          {{ $t('profile.passwordRequirements') }}
        </div>
        <div class="text-body-2 mb-3">
          {{ $t('profile.passwordMinimumRequirements') }}
        </div>
        <div>
          <div class="d-flex align-center mb-2">
            <v-icon size="small" class="mr-2" :color="newPassword.length >= 8 ? 'success' : 'grey-darken-1'">
              {{
                newPassword.length >= 8
                  ? 'mdi-check-circle'
                  : 'mdi-circle-outline'
              }}
            </v-icon>
            <span>{{ $t('profile.passwordMinLength') }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon size="small" class="mr-2" :color="/[A-Z]/.test(newPassword) ? 'success' : 'grey-darken-1'">
              {{
                /[A-Z]/.test(newPassword)
                  ? 'mdi-check-circle'
                  : 'mdi-circle-outline'
              }}
            </v-icon>
            <span>{{ $t('profile.passwordUppercase') }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2" :color="specialCharColor">
              {{ specialCharIcon }}
            </v-icon>
            <span>{{ $t('profile.passwordSymbol') }}</span>
          </div>
        </div>
      </v-alert>

      <v-form ref="formRef" v-model="valid">
        <v-alert v-if="isGoogleUser" type="info" variant="outlined" class="mb-4">
          {{ $t('profile.googleUserPasswordInfo') }}
        </v-alert>
        <v-row dense>
          <v-col v-if="!isGoogleUser" cols="12">
            <v-text-field v-model="currentPassword" :rules="currentPasswordRules" :label="$t('profile.currentPassword')"
              :type="showCurrentPassword ? 'text' : 'password'" variant="outlined" density="compact"
              prepend-inner-icon="mdi-lock-check" :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="input-field-transition" @click:append-inner="toggleCurrentPasswordVisibility()" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="newPassword" :rules="passwordRules" :label="$t('profile.newPassword')"
              :type="showPassword ? 'text' : 'password'" variant="outlined" density="compact"
              prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="input-field-transition" @click:append-inner="togglePasswordVisibility()" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="confirmPassword" :rules="confirmPasswordRules"
              :label="$t('profile.confirmNewPassword')" :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined" density="compact" prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'" class="input-field-transition"
              @click:append-inner="toggleConfirmPasswordVisibility()" />
          </v-col>
        </v-row>
        <v-btn :disabled="!valid || isChanging" :loading="isChanging" color="primary" variant="flat"
          class="mt-4 text-capitalize" @click="handleChangePassword">
          <v-icon start>
            mdi-key
          </v-icon>
          {{ $t('profile.changePassword') }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useChangePassword } from '../composables/useChangePassword';

const formRef = ref(null);
const isChanging = ref(false);

const {
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrentPassword,
  showPassword,
  showConfirmPassword,
  valid,
  isGoogleUser,
  currentPasswordRules,
  passwordRules,
  confirmPasswordRules,
  specialCharColor,
  specialCharIcon,
  changePassword,
  resetForm,
  toggleCurrentPasswordVisibility,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
} = useChangePassword();

const handleChangePassword = async () => {
  if (!formRef.value.validate()) return;

  isChanging.value = true;
  const success = await changePassword();
  isChanging.value = false;

  if (success && formRef.value) {
    formRef.value.reset();
    resetForm();
  }
};
</script>
