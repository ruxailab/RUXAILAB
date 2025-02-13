<template>
  <div v-if="loading" class="loading-spinner">
    <!-- Add a spinner or skeleton loader here -->
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
  <div v-else>
    <div class="container h-screen py-8 flex flex-col md:flex-row gap-4">
      <!-- Left Section: Profile Details -->
      <div class="flex-shrink-0 w-full md:w-auto" style="max-width: 100%; min-width: 350px;">
        <v-card class="profile-card h-full" elevation="0">
          <v-card-text class="text-center">
            <v-avatar size="128" class="mb-4">
              <v-img :src="userprofile.profileImage || defaultImage" :alt="$t('PROFILE.title')" />
            </v-avatar>
            <h2 class="text-h6 mb-2">{{ userprofile.username || 'USER' }}</h2>
            <v-chip small class="mb-6" color="grey lighten-3">{{ $t('PROFILE.admin') }}</v-chip>

            <div class="text-left">
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>{{ $t('buttons.username') }}:</v-list-item-subtitle>
                    <v-list-item-title v-if="!loading" :class="{ 'missing-info': !userprofile.username }">
                      {{ userprofile.username || $t('PROFILE.missingInfo') }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>{{ $t('SIGNIN.email') }}:</v-list-item-subtitle>
                    <v-list-item-title v-if="!loading" :class="{ 'missing-info': !user.email }">
                      {{ user.email || $t('PROFILE.missingInfo') }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>{{ $t('SIGNIN.contact') }}:</v-list-item-subtitle>
                    <v-list-item-title v-if="!loading" :class="{ 'missing-info': !userprofile.contactNo }">
                      {{ userprofile.contactNo || $t('PROFILE.missingInfo') }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-subtitle>{{ $t('PROFILE.country') }}:</v-list-item-subtitle>
                    <v-list-item-title v-if="!loading" :class="{ 'missing-info': !userprofile.country }">
                      {{ userprofile.country || $t('PROFILE.missingInfo') }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Right Section: Tabs and Content -->
      <div class="flex-grow-1 w-full">
        <v-card flat class="w-full">
          <!-- Tabs Section -->
          <v-tabs background-color="transparent" color="primary" v-if="!isSmallScreen">
            <v-tab>
              <v-icon small class="mr-2">mdi-account</v-icon>
              {{ $t('PROFILE.account') }}
            </v-tab>
          </v-tabs>

          <!-- Change Password Section -->
          <v-card class="password-card mt-4">
            <v-card-title>{{ $t('PROFILE.changePassword') }}</v-card-title>
            <v-card-text>
              <v-alert type="warning" colored-border border="left" class="mb-4">
                <div class="text-h6 font-weight-medium">{{ $t('PROFILE.passwordRequirements') }}</div>
                <div class="text-body-2">{{ $t('PROFILE.passwordMinimumRequirements') }}</div>
              </v-alert>

              <v-form ref="passwordForm" v-model="valid" lazy-validation>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="newPassword" :rules="passwordRules" :label="$t('PROFILE.newPassword')"
                      :type="showPassword ? 'text' : 'password'" outlined dense required
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="showPassword = !showPassword"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="confirmPassword" :rules="confirmPasswordRules"
                      :label="$t('PROFILE.confirmNewPassword')" :type="showConfirmPassword ? 'text' : 'password'" outlined
                      dense required :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="showConfirmPassword = !showConfirmPassword"></v-text-field>
                  </v-col>
                </v-row>

                <v-btn color="primary" class="mt-4" @click="changePassword" :disabled="!valid">
                  {{ $t('PROFILE.changePassword') }}
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Edit Details and Delete Account Buttons -->
          <div class="mt-4 d-flex justify-space-between flex-wrap">
            <v-btn color="primary" @click="openEditProfileDialog" class="mb-2">
              <v-icon left>mdi-pencil</v-icon>
              {{ $t('PROFILE.editDetails') }}
            </v-btn>
            <v-btn color="error" @click="deleteAccountDialog = true" class="mb-2">
              <v-icon left>mdi-delete</v-icon>
              {{ $t('buttons.deleteAccount') }}
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- Edit Details Dialog -->
      <v-dialog v-model="editProfileDialog" max-width="600">
        <v-card>
          <v-card-title>{{ $t('PROFILE.editProfile') }}</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field v-model="editProfileData.username" :label="$t('buttons.username')"></v-text-field>
              <v-text-field v-model="editProfileData.contactNo" :label="$t('SIGNIN.contact')"></v-text-field>
              <v-text-field v-model="editProfileData.country" :label="$t('PROFILE.country')"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div class="mb-2">
              <v-btn color="primary" class="mr-2" @click="saveProfile">{{ $t('PROFILE.saveChanges') }}</v-btn>
              <v-btn color="error" @click="editProfileDialog = false">{{ $t('buttons.cancel') }}</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Account Dialog -->
      <v-dialog v-model="deleteAccountDialog" max-width="500">
        <v-card>
          <v-card-title>{{ $t('PROFILE.deleteAccountTitle') }}</v-card-title>
          <v-card-text>
            {{ $t('PROFILE.deleteAccountConfirm') }}<br>
            {{ $t('PROFILE.deleteAccountWarning') }}
          </v-card-text>
          <v-card-actions>
            <div class="mb-2">
              <v-btn color="error" class="mr-2" @click="deleteAccount">{{ $t('buttons.deleteAccount') }}</v-btn>
              <v-btn color="primary" @click="deleteAccountDialog = false">{{ $t('buttons.cancel') }}</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth';
import UserController from '@/controllers/UserController';

export default {
  name: 'SecurityProfile',

  data() {
    return {
      userprofile: {
        profileImage: '',
        username: null,
        contactNo: null,
        country: null,
      },
      editProfileData: {
        username: null,
        contactNo: null,
        country: null,
      },
      defaultImage: 'https://static.vecteezy.com/system/resources/previews/024/983/914/large_2x/simple-user-default-icon-free-png.png',
      loading: true,
      valid: false,
      showPassword: false,
      showConfirmPassword: false,
      newPassword: '',
      confirmPassword: '',
      passwordRules: [
        v => !!v || this.$t('PROFILE.passwordRequired'),
        v => v.length >= 8 || this.$t('PROFILE.passwordMinLength'),
        v => /[A-Z]/.test(v) || this.$t('PROFILE.passwordUppercase'),
        v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || this.$t('PROFILE.passwordSymbol'),
      ],
      confirmPasswordRules: [
        v => !!v || this.$t('PROFILE.confirmPasswordRequired'),
        v => v === this.newPassword || this.$t('PROFILE.passwordsMatch'),
      ],
      editProfileDialog: false,
      deleteAccountDialog: false,
      isSmallScreen: false,
    };
  },

  computed: {
    user() {
      return this.$store.getters.user || { email: '' };
    },
  },

  async created() {
    await this.fetchUserProfile();
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },

  methods: {
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 960;
    },

    async fetchUserProfile() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userController = new UserController();
          const userDoc = await userController.getById(user.uid);

          if (userDoc) {
            this.userprofile = {
              profileImage: userDoc.profileImage || '',
              username: userDoc.username || null,
              contactNo: userDoc.contactNo || null,
              country: userDoc.country || null,
            };
          } else {
            console.error('User document not found in Firestore');
          }
        } else {
          console.error('No user is currently signed in');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.$toast.error('Failed to load profile data');
      } finally {
        this.loading = false;
      }
    },

    openEditProfileDialog() {
      this.editProfileData = {
        username: this.userprofile.username,
        contactNo: this.userprofile.contactNo,
        country: this.userprofile.country,
      };
      this.editProfileDialog = true;
    },

    async saveProfile() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userController = new UserController();
          await userController.updateProfile(user.uid, this.editProfileData);

          this.userprofile = {
            ...this.userprofile,
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country,
          };
          this.$toast.success('Profile updated successfully');
          this.editProfileDialog = false;
        }
        console.log('Updated profile data:', this.editProfileData);
      } catch (error) {
        console.error('Error updating profile:', error);
        this.$toast.error('Failed to update profile');
      }
    },

    async changePassword() {
      if (this.$refs.passwordForm.validate()) {
        try {
          const auth = getAuth();
          const user = auth.currentUser;

          if (user) {
            const userController = new UserController();
            await userController.changePassword(user, this.newPassword);
            this.$toast.success('Password changed successfully');

            this.newPassword = '';
            this.confirmPassword = '';
            this.$refs.passwordForm.reset();
          }
        } catch (error) {
          this.$toast.error('Failed to change password: ' + error.message);
        }
      }
    },

    async deleteAccount() {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const email = user.email;
          const password = prompt('Please enter your password to confirm deletion:');
          if (!password) {
            alert('Password is required to delete your account.');
            return;
          }

          const userController = new UserController();
          await userController.reauthenticateUser(user, email, password);
          await userController.deleteUser(user.uid);
          await user.delete();

          this.signOut();
        } catch (error) {
          console.error('Error during account deletion:', error.message);
          alert('Failed to delete account. Please try again.');
        }
      } else {
        console.error('No user is signed in.');
      }
    },

    async signOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router
          .push('/')
          .catch((error) => {
            console.log(error);
          });
      });
    },
  },
};
</script>

<style scoped>
.loading-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999; /* Ensure it's above other content */
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-card {
  background-color: #f8f9fe !important;
  border-radius: 8px !important;
  height: 100%;
}

.password-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 20px;
}

.v-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
}

.v-text-field ::v-deep(.v-input__slot),
.v-select ::v-deep .v-input__slot {
  min-height: 40px !important;
  box-shadow: none !important;
}

.v-list-item {
  min-height: 40px !important;
}

.v-list-item__subtitle {
  color: #666 !important;
}

.missing-info {
  color: #d84646 !important;
  font-style: italic;
}

@media (max-width: 960px) {
  .container {
    flex-direction: column;
  }

  .profile-card {
    max-width: 100%;
    min-width: 100%;
  }
}
</style>