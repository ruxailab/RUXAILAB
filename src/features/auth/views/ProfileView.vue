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
      </v-col>

      <!-- Right Section: Tabs and Content -->
      <v-col cols="12" md="8" lg="9">
        <v-card flat class="rounded-xl">
          <!-- Tabs Section -->
          <v-tabs
            v-model="activeTab"
            color="primary"
            slider-color="primary"
            class="mb-4"
            :grow="!isSmallScreen"
            :stacked="isSmallScreen"
            align-tabs="center"
          >
            <v-tab value="0" class="text-body-1 font-weight-medium">
              <v-icon size="small" start>mdi-account</v-icon>
              {{ $t('profile.account') }}
            </v-tab>
            <v-tab value="1" class="text-body-1 font-weight-medium">
              <v-icon size="small" start>mdi-shield-lock</v-icon>
              {{ $t('profile.security') }}
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="pa-4">
            <!-- Account Tab Content -->
            <v-window-item value="0" transition="fade-transition">
              <v-card class="rounded-xl pa-6" elevation="2">
                <v-card-title class="text-h6 font-weight-bold mb-4">
                  <v-icon start color="primary">mdi-account-details</v-icon>
                  {{ $t('profile.personalInfo') }}
                </v-card-title>
                <v-card-text>
                  <v-form>
                    <v-row dense>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="profile.userprofile.value.username"
                          :label="$t('profile.username')"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-account"
                          readonly
                          class="input-field-transition"
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="user.email"
                          :label="$t('profile.email')"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-email"
                          readonly
                          class="input-field-transition"
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="profile.userprofile.value.contactNo"
                          :label="$t('profile.contact')"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-phone"
                          readonly
                          class="input-field-transition"
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="profile.userprofile.value.country"
                          :label="$t('profile.country')"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-map-marker"
                          readonly
                          class="input-field-transition"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                  <v-btn
                    color="primary"
                    variant="flat"
                    class="mt-4 text-capitalize"
                    @click="editProfileDialog = true"
                  >
                    <v-icon start>mdi-pencil</v-icon>
                    {{ $t('profile.editDetails') }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-window-item>

            <!-- Security Tab Content -->
            <v-window-item value="1" transition="fade-transition">
              <ChangePasswordForm />
              <DeleteAccountSection :is-small-screen="isSmallScreen" />
            </v-window-item>
          </v-window>
        </v-card>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import UserProfileCard from '../components/UserProfileCard.vue';
import EditProfileDialog from '../components/EditProfileDialog.vue';
import ChangePasswordForm from '../components/ChangePasswordForm.vue';
import DeleteAccountSection from '../components/DeleteAccountSection.vue';
import { useProfile } from '../composables/useProfile';

const store = useStore();
const user = computed(() => store.getters.user || { email: '' });

const profile = useProfile();
const activeTab = ref(0);
const editProfileDialog = ref(false);
const isSmallScreen = ref(false);

const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 960;
};

onMounted(() => {
  profile.fetchUserProfile();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>
