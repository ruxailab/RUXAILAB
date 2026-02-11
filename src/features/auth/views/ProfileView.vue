<template>
  <div class="container px-4 py-8">
    <v-row>
      <!-- Left Section: Profile Details -->
      <v-col cols="12" md="4" lg="3">
        <UserProfileCard
          :userprofile="profile.userprofile.value"
          :user-email="user.email"
          :loading="profile.loading.value"
        />
        <!-- Edit Details Button below Profile Card -->
        <v-btn
          color="primary"
          variant="flat"
          class="w-100 mt-3 text-capitalize"
          @click="editProfileDialog = true"
        >
          <v-icon start>mdi-pencil</v-icon>
          {{ $t('profile.editDetails') }}
        </v-btn>
      </v-col>

      <!-- Right Section: Security -->
      <v-col cols="12" md="8" lg="9">
        <ChangePasswordForm />
        <DeleteAccountSection :is-small-screen="isSmallScreen" />
      </v-col>
    </v-row>

    <!-- Edit Details Dialog -->
    <EditProfileDialog
      v-model="editProfileDialog"
      :profile-data="profile.userprofile.value"
      :on-save="profile.updateProfile"
      :on-upload-image="profile.uploadProfileImage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import UserProfileCard from '../components/UserProfileCard.vue'
import EditProfileDialog from '../components/EditProfileDialog.vue'
import ChangePasswordForm from '../components/ChangePasswordForm.vue'
import DeleteAccountSection from '../components/DeleteAccountSection.vue'
import { useProfile } from '../composables/useProfile'

const store = useStore()
const user = computed(() => store.getters.user || { email: '' })
const profile = useProfile()

const editProfileDialog = ref(false)
const isSmallScreen = ref(false)

const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 960
}

// Refetch profile when dialog closes
watch(editProfileDialog, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    profile.fetchUserProfile()
  }
})

onMounted(() => {
  profile.fetchUserProfile()
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>
