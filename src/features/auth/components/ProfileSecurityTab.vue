<template>
  <v-card class="rounded-xl pa-6" elevation="2">
    <v-card-title class="text-h6 font-weight-bold mb-4">
      <v-icon start color="primary">mdi-lock</v-icon>
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
              {{ newPassword.length >= 8 ? 'mdi-check-circle' : 'mdi-circle-outline' }}
            </v-icon>
            <span>{{ $t('profile.passwordMinLength') }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon size="small" class="mr-2" :color="/[A-Z]/.test(newPassword) ? 'success' : 'grey-darken-1'">
              {{ /[A-Z]/.test(newPassword) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
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
      <v-form ref="passwordForm" v-model="valid">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="newPassword"
              :rules="passwordRules"
              :label="$t('profile.newPassword')"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="input-field-transition"
              @click:append="showPassword = !showPassword"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="confirmPassword"
              :rules="confirmPasswordRules"
              :label="$t('profile.confirmNewPassword')"
              :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-lock-check"
              :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="input-field-transition"
              @click:append="showConfirmPassword = !showConfirmPassword"
            />
          </v-col>
        </v-row>
        <v-btn
          :disabled="!valid"
          color="primary"
          variant="flat"
          class="mt-4 text-capitalize"
          @click="changePassword"
        >
          <v-icon start>
            mdi-key
          </v-icon>
          {{ $t('profile.changePassword') }}
        </v-btn>
      </v-form>
      <!-- Delete Account Section -->
      <v-card class="rounded-xl pa-6 mt-6" elevation="2">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon start color="error">mdi-alert-circle</v-icon>
          {{ $t('profile.deleteAccountTitle') }}
        </v-card-title>
        <v-card-text>
          <p class="text-body-1 mb-4">
            {{ $t('profile.deleteAccountWarning') }}
          </p>
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            :block="isSmallScreen"
            @click="deleteAccountDialog = true"
          >
            <v-icon start>
              mdi-delete
            </v-icon>
            {{ $t('profile.deleteAccountTitle') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>
<script setup>
const props = defineProps({
  newPassword: String,
  confirmPassword: String,
  valid: Boolean,
  passwordRules: Array,
  confirmPasswordRules: Array,
  showPassword: Boolean,
  showConfirmPassword: Boolean,
  specialCharColor: String,
  specialCharIcon: String,
  isSmallScreen: Boolean,
  changePassword: Function,
  deleteAccountDialog: Boolean,
});
</script>
