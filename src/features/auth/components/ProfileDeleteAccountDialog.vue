<template>
  <v-dialog
    v-model="deleteAccountDialog"
    max-width="500px"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card
      class="rounded-xl pa-6"
      elevation="6"
    >
      <v-card-title class="text-h6 font-weight-bold">
        <v-icon
          start
          color="error"
        >
          mdi-alert-circle
        </v-icon>
        {{ $t('profile.deleteAccountTitle') }}
        <v-spacer />
      </v-card-title>

      <!-- Step 1: Initial Confirmation -->
      <div v-if="deleteStep === 1">
        <v-card-text>
          <v-alert
            type="error"
            variant="outlined"
            class="mb-4"
          >
            {{ $t('profile.deleteAccountConfirm') }}
          </v-alert>
          <p class="text-body-1 mb-4">
            {{ $t('profile.deleteAccountWarning') }}
          </p>
          <div class="text-center">
            <p class="font-weight-bold mb-2">
              {{ $t('profile.typeDeleteToConfirm') }}
            </p>
            <v-text-field
              v-model="deleteConfirmText"
              variant="outlined"
              density="compact"
              hide-details
              class="input-field-transition"
              :rules="[(v) => v === 'DELETE' || $t('profile.pleaseTypeDeleteToConfirm')]"
            />
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            variant="outlined"
            class="text-capitalize"
            min-width="120"
            @click="closeDeleteDialog"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            min-width="120"
            :disabled="deleteConfirmText !== 'DELETE'"
            @click="$emit('next-step')"
          >
            {{ $t('Proceed') }}
          </v-btn>
        </v-card-actions>
      </div>

      <!-- Step 2: Enter Password -->
      <div v-else>
        <v-card-text>
          <v-alert
            type="error"
            variant="outlined"
            class="mb-4"
          >
            {{ $t('profile.finalStepVerifyIdentity') }}
          </v-alert>
          <p class="text-center font-weight-bold mb-4">
            {{ $t('profile.enterPasswordForAccountDeletion') }}
          </p>
          <v-text-field
            v-model="userPassword"
            :label="$t('profile.yourPassword')"
            type="password"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-lock"
            :disabled="isDeleting"
            :rules="[(v) => !!v || $t('profile.passwordRequired')]"
            class="input-field-transition"
          />
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            variant="outlined"
            class="text-capitalize"
            :disabled="isDeleting"
            min-width="120"
            @click="$emit('prev-step')"
          >
            {{ $t('profile.back') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            :loading="isDeleting"
            :disabled="!userPassword || isDeleting"
            min-width="120"
            @click="$emit('delete-account')"
          >
            <v-icon start>
              mdi-delete
            </v-icon>
            {{ $t('profile.deleteForever') }}
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup>
const props = defineProps({
  deleteAccountDialog: Boolean,
  deleteStep: Number,
  deleteConfirmText: String,
  userPassword: String,
  isDeleting: Boolean,
});
const emit = defineEmits(['next-step', 'prev-step', 'delete-account', 'close-dialog']);
function closeDeleteDialog() {
  emit('close-dialog');
}
</script>
