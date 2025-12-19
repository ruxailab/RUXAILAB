<template>
  <v-card
    class="rounded-xl pa-6"
    elevation="2"
  >
    <v-card-title class="text-h6 font-weight-bold mb-4">
      <v-icon
        start
        color="primary"
      >
        mdi-lock
      </v-icon>
      {{ $t('profile.changePassword') }}
    </v-card-title>
    <v-card-text>
      <v-alert
        type="warning"
        variant="outlined"
        class="mb-6"
      >
        <div class="text-subtitle-1 font-weight-medium mb-2">
          {{ $t('profile.passwordRequirements') }}
        </div>
        <div class="text-body-2 mb-3">
          {{ $t('profile.passwordMinimumRequirements') }}
        </div>
        <div>
          <div class="d-flex align-center mb-2">
            <v-icon
              size="small"
              class="mr-2"
              :color="password.newPassword.length >= 8 ? 'success' : 'grey-darken-1'"
            >
              {{
                password.newPassword.length >= 8
                  ? 'mdi-check-circle'
                  : 'mdi-circle-outline'
              }}
            </v-icon>
            <span>{{ $t('profile.passwordMinLength') }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon
              size="small"
              class="mr-2"
              :color="/[A-Z]/.test(password.newPassword) ? 'success' : 'grey-darken-1'"
            >
              {{
                /[A-Z]/.test(password.newPassword)
                  ? 'mdi-check-circle'
                  : 'mdi-circle-outline'
              }}
            </v-icon>
            <span>{{ $t('profile.passwordUppercase') }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon
              size="small"
              class="mr-2"
              :color="password.specialCharColor"
            >
              {{ password.specialCharIcon }}
            </v-icon>
            <span>{{ $t('profile.passwordSymbol') }}</span>
          </div>
        </div>
      </v-alert>

      <v-form
        ref="formRef"
        v-model="password.valid"
      >
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="password.newPassword"
              :rules="password.passwordRules"
              :label="$t('profile.newPassword')"
              :type="password.showPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-lock"
              :append-icon="password.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="input-field-transition"
              @click:append="password.showPassword = !password.showPassword"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="password.confirmPassword"
              :rules="password.confirmPasswordRules"
              :label="$t('profile.confirmNewPassword')"
              :type="password.showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-lock-check"
              :append-icon="password.showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="input-field-transition"
              @click:append="password.showConfirmPassword = !password.showConfirmPassword"
            />
          </v-col>
        </v-row>
        <v-btn
          :disabled="!password.valid || isChanging"
          :loading="isChanging"
          color="primary"
          variant="flat"
          class="mt-4 text-capitalize"
          @click="handleChangePassword"
        >
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

const password = useChangePassword();

const handleChangePassword = async () => {
    if (!formRef.value.validate()) return;

    isChanging.value = true;
    const success = await password.changePassword();
    isChanging.value = false;

    if (success && formRef.value) {
        formRef.value.reset();
        password.resetForm();
    }
};
</script>
