<template>
  <div>
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
          @click="openDialog"
        >
          <v-icon start>mdi-delete</v-icon>
          {{ $t('profile.deleteAccountTitle') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Delete Account Dialog -->
    <v-dialog
      v-model="showDialog"
      max-width="500px"
      persistent
      transition="dialog-bottom-transition"
      @click:outside="handleClose"
    >
      <v-card class="rounded-xl pa-6" elevation="6">
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon start color="error">mdi-alert-circle</v-icon>
          {{ $t('profile.deleteAccountTitle') }}
          <v-spacer />
        </v-card-title>

        <!-- Step 1: Initial Confirmation -->
        <div v-if="deleteAccount.deleteStep.value === 1">
          <v-card-text>
            <v-alert type="error" variant="outlined" class="mb-4">
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
                v-model="deleteAccount.deleteConfirmText.value"
                variant="outlined"
                density="compact"
                hide-details
                class="input-field-transition"
                :disabled="deleteAccount.isDeleting.value"
                :rules="[
                  (v) =>
                    v === 'DELETE' || $t('profile.pleaseTypeDeleteToConfirm'),
                ]"
                @keyup.enter="handleProceed"
              />
            </div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              variant="outlined"
              class="text-capitalize"
              min-width="120"
              :disabled="deleteAccount.isDeleting.value"
              @click="handleClose"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="text-capitalize"
              min-width="120"
              :loading="deleteAccount.isDeleting.value"
              :disabled="deleteAccount.deleteConfirmText.value !== 'DELETE'"
              @click="handleProceed"
            >
              {{ $t('common.proceed') }}
            </v-btn>
          </v-card-actions>
        </div>

        <!-- Step 2: Enter Password -->
        <div v-else>
          <v-card-text>
            <v-alert type="error" variant="outlined" class="mb-4">
              {{ $t('profile.finalStepVerifyIdentity') }}
            </v-alert>
            <p class="text-center font-weight-bold mb-4">
              {{ $t('profile.enterPasswordForAccountDeletion') }}
            </p>
            <v-text-field
              v-model="deleteAccount.userPassword.value"
              :label="$t('profile.yourPassword')"
              type="password"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-lock"
              :disabled="deleteAccount.isDeleting.value"
              :rules="[(v) => !!v || $t('profile.passwordRequired')]"
              class="input-field-transition"
              @keyup.enter="handleDelete"
            />
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              variant="outlined"
              class="text-capitalize"
              :disabled="deleteAccount.isDeleting.value"
              min-width="120"
              @click="handleBack"
            >
              {{ $t('profile.back') }}
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="text-capitalize"
              :loading="deleteAccount.isDeleting.value"
              :disabled="
                !deleteAccount.userPassword.value ||
                deleteAccount.isDeleting.value
              "
              min-width="120"
              @click="handleDelete"
            >
              <v-icon start>mdi-delete</v-icon>
              {{ $t('profile.deleteForever') }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDeleteAccount } from '../composables/useDeleteAccount'

defineProps({
  isSmallScreen: {
    type: Boolean,
    default: false,
  },
})

const showDialog = ref(false)
const deleteAccount = useDeleteAccount()

const openDialog = () => {
  deleteAccount.resetDeleteDialog()
  showDialog.value = true
}

const handleClose = () => {
  if (!deleteAccount.isDeleting.value) {
    showDialog.value = false
  }
}

const handleBack = () => {
  if (!deleteAccount.isDeleting.value) {
    deleteAccount.deleteStep.value = 1
    deleteAccount.userPassword.value = ''
  }
}

const handleProceed = async () => {
  if (
    deleteAccount.deleteConfirmText.value === 'DELETE' &&
    !deleteAccount.isDeleting.value
  ) {
    await deleteAccount.handleDeleteConfirmText()
  }
}

const handleDelete = async () => {
  if (deleteAccount.userPassword.value && !deleteAccount.isDeleting.value) {
    await deleteAccount.handleDeleteAccount()
  }
}

// Watch for dialog close to reset state
watch(showDialog, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    setTimeout(() => {
      deleteAccount.resetDeleteDialog()
    }, 150)
  }
})
</script>

<style scoped>
.input-field-transition {
  transition: all 0.3s ease;
}
</style>
