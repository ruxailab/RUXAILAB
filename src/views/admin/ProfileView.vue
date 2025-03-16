<template>
  <div class="container px-4 py-8">
    <v-row>
      <!-- Left Section: Profile Details -->
      <v-col cols="12" md="4" lg="3">
        <v-card outlined class="rounded-lg h-100">
          <v-card-text class="text-center">
            <div class="d-flex justify-center position-relative my-4">
              <v-hover v-slot="{ hover }">
                <v-avatar
                  size="128"
                  class="elevation-4 primary--text transition-swing"
                  :class="{ 'transform-avatar': hover }"
                >
                  <v-img
                    :src="userprofile.profileImage || defaultImage"
                    :alt="$t('PROFILE.title')"
                    class="white--text"
                  ></v-img>
                </v-avatar>
              </v-hover>
              <div class="profile-glow"></div>
            </div>

            <h2 class="text-h5 mb-2 font-weight-bold">
              {{ userprofile.username || 'USER' }}
            </h2>
            <v-chip
              small
              class="mb-6 primary"
              text-color="white"
              :ripple="true"
            >
              {{ $t('PROFILE.admin') }}
            </v-chip>

            <v-divider class="my-4"></v-divider>

            <div>
              <v-list dense>
                <v-hover
                  v-slot="{ hover }"
                  v-for="(item, index) in profileItems"
                  :key="index"
                >
                  <v-list-item
                    class="rounded-lg pa-2 transition-swing"
                    :class="{ 'grey lighten-4': hover }"
                  >
                    <v-list-item-content>
                      <v-list-item-subtitle
                        class="caption text-uppercase font-weight-medium grey--text text--darken-1"
                      >
                        {{ item.label }}:
                      </v-list-item-subtitle>
                      <v-list-item-title
                        v-if="!loading"
                        :class="{
                          'font-italic red--text text--darken-1': !item.value,
                          'font-weight-medium': item.value,
                        }"
                      >
                        {{ item.value || $t('PROFILE.missingInfo') }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon
                        small
                        :color="hover ? 'primary' : 'grey lighten-1'"
                        class="transition-swing"
                      >
                        {{ item.icon }}
                      </v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </v-hover>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Section: Tabs and Content -->
      <v-col cols="12" md="8" lg="9">
        <v-card flat class="w-100">
          <!-- Tabs Section -->
          <v-tabs
            v-if="!isSmallScreen"
            v-model="activeTab"
            background-color="transparent"
            color="primary"
            slider-color="primary"
            grow
          >
            <v-tab
              class="text-subtitle-1 font-weight-medium px-4 transition-swing"
            >
              <v-icon small class="mr-2">
                mdi-account
              </v-icon>
              {{ $t('Account') }}
            </v-tab>
            <v-tab
              class="text-subtitle-1 font-weight-medium px-4 transition-swing"
            >
              <v-icon small class="mr-2">
                mdi-shield-lock
              </v-icon>
              {{ $t('Security') }}
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab" class="mt-3">
            <v-tab-item transition="fade-transition">
              <!-- Account Tab Content -->
              <v-hover v-slot="{ hover }">
                <v-card
                  outlined
                  flat
                  class="mt-4 rounded-lg"
                  :class="{ 'transform-card': hover }"
                >
                  <v-card-title class="mb-4 grey lighten-4">
                    <v-icon left color="primary">
                      mdi-account-details
                    </v-icon>
                    {{ $t('Personal Info') }}
                  </v-card-title>
                  <v-card-text>
                    <v-form>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="userprofile.username"
                            :label="$t('buttons.username')"
                            outlined
                            dense
                            prepend-inner-icon="mdi-account"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="user.email"
                            :label="$t('SIGNIN.email')"
                            outlined
                            dense
                            prepend-inner-icon="mdi-email"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="userprofile.contactNo"
                            :label="$t('Contact')"
                            outlined
                            dense
                            prepend-inner-icon="mdi-phone"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="userprofile.country"
                            :label="$t('Country')"
                            outlined
                            dense
                            prepend-inner-icon="mdi-map-marker"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                      </v-row>
                    </v-form>

                    <v-hover v-slot="{ hover }">
                      <v-btn
                        color="primary"
                        class="mt-4 text-none font-weight-medium transition-swing"
                        :elevation="hover ? 6 : 2"
                        @click="openEditProfileDialog"
                        :class="{ 'transform-button': hover }"
                      >
                        <v-icon left>
                          mdi-pencil
                        </v-icon>
                        {{ $t('Edit Details') }}
                      </v-btn>
                    </v-hover>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-tab-item>

            <v-tab-item transition="fade-transition">
              <!-- Security Tab Content -->
              <v-hover v-slot="{ hover }">
                <v-card
                  outlined
                  flat
                  class="mt-4 rounded-lg"
                  :class="{ 'transform-card': hover }"
                >
                  <v-card-title class="mb-4 grey lighten-4">
                    <v-icon left color="primary">
                      mdi-lock
                    </v-icon>
                    {{ $t('Change Password') }}
                  </v-card-title>
                  <v-card-text>
                    <v-alert
                      type="warning"
                      colored-border
                      border="left"
                      class="mb-3"
                    >
                      <div class="text-h6 font-weight-medium mb-2">
                        {{ $t('Password Requirements') }}
                      </div>
                      <div class="text-body-2 mb-3">
                        {{ $t('Password Minimum Requirements') }}
                      </div>
                      <div>
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            small
                            class="mr-2 transition-swing"
                            :color="
                              newPassword.length >= 8 ? 'success' : 'grey'
                            "
                          >
                            {{
                              newPassword.length >= 8
                                ? 'mdi-check-circle'
                                : 'mdi-circle-outline'
                            }}
                          </v-icon>
                          <span>At least 8 characters</span>
                        </div>
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            small
                            class="mr-2 transition-swing"
                            :color="
                              /[A-Z]/.test(newPassword) ? 'success' : 'grey'
                            "
                          >
                            {{
                              /[A-Z]/.test(newPassword)
                                ? 'mdi-check-circle'
                                : 'mdi-circle-outline'
                            }}
                          </v-icon>
                          <span>At least one uppercase letter</span>
                        </div>
                        <div class="d-flex align-center">
                          <v-icon
                            small
                            class="mr-2 transition-swing"
                            :color="specialCharColor"
                          >
                            {{ specialCharIcon }}
                          </v-icon>
                          <span>At least one special character</span>
                        </div>
                      </div>
                    </v-alert>

                    <v-form ref="passwordForm" v-model="valid" lazy-validation>
                      <v-row dense>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="newPassword"
                            :rules="passwordRules"
                            :label="$t('New Password')"
                            :type="showPassword ? 'text' : 'password'"
                            outlined
                            dense
                            required
                            prepend-inner-icon="mdi-lock"
                            :append-icon="
                              showPassword ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            @click:append="showPassword = !showPassword"
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="confirmPassword"
                            :rules="confirmPasswordRules"
                            :label="$t('Confirm New Password')"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            outlined
                            dense
                            required
                            prepend-inner-icon="mdi-lock-check"
                            :append-icon="
                              showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            @click:append="
                              showConfirmPassword = !showConfirmPassword
                            "
                            class="input-field-hover"
                          />
                        </v-col>
                      </v-row>

                      <div class="mt-2">
                        <v-hover v-slot="{ hover }">
                          <v-btn
                            :disabled="!valid"
                            color="primary"
                            class="text-none font-weight-medium transition-swing"
                            :elevation="hover ? 6 : 2"
                            @click="changePassword"
                            :class="{ 'transform-button': hover }"
                          >
                            <v-icon left>
                              mdi-key
                            </v-icon>
                            {{ $t('Change Password') }}
                          </v-btn>
                        </v-hover>
                      </div>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-hover>

              <!-- Delete Account Section -->
              <v-hover v-slot="{ hover }">
                <v-card
                  class="mt-6 rounded-lg error--text"
                  outlined
                  :elevation="hover ? 3 : 1"
                  :class="{ 'danger-card-hover': hover }"
                >
                  <v-card-title class="error lighten-5">
                    <v-icon left color="error">
                      mdi-alert-circle
                    </v-icon>
                    {{ $t('Delete account') }}
                  </v-card-title>
                  <v-card-text>
                    <p class="text-body-1 mb-4">
                      {{ $t('PROFILE.deleteAccountWarning') }}
                    </p>
                    <v-hover v-slot="{ hover }">
                      <v-btn
                        color="error"
                        class="text-none font-weight-medium transition-swing"
                        :block="isSmallScreen"
                        @click="deleteAccountDialog = true"
                        :outlined="!hover"
                        :class="{ 'transform-button': hover }"
                        :elevation="hover ? 2 : 0"
                      >
                        <v-icon left>
                          mdi-delete
                        </v-icon>
                        <span>{{ $t('buttons.deleteAccount') }}</span>
                      </v-btn>
                    </v-hover>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Details Dialog -->
    <v-dialog
      v-model="editProfileDialog"
      max-width="600"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg elevation-12">
        <v-card-title class="grey lighten-4">
          <v-icon left color="primary">
            mdi-account-edit
          </v-icon>
          {{ $t('PROFILE.editProfile') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="editProfileForm" v-model="editProfileValid">
            <v-text-field
              v-model="editProfileData.username"
              :label="$t('buttons.username')"
              outlined
              dense
              prepend-inner-icon="mdi-account"
              :rules="usernameRules"
              class="mt-4 input-field-hover"
            />
            <v-text-field
              v-model="editProfileData.contactNo"
              :label="$t('SIGNIN.contact')"
              outlined
              dense
              prepend-inner-icon="mdi-phone"
              :rules="contactRules"
              hint="Enter a valid phone number"
              persistent-hint
              class="input-field-hover"
            />
            <v-autocomplete
              v-model="editProfileData.country"
              :label="$t('PROFILE.country')"
              outlined
              dense
              prepend-inner-icon="mdi-map-marker"
              :rules="countryRules"
              :items="countries"
              item-text="name"
              item-value="name"
              :filter="countryFilter"
              clearable
              :menu-props="{
                maxHeight: '400px',
                closeOnClick: true,
                closeOnContentClick: true,
              }"
            >
              <template v-slot:selection="{ item }">
                {{ item.emoji }} {{ item.name }}
              </template>
              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.emoji }} {{ item.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-hover v-slot="{ hover }">
            <v-btn
              text
              @click="editProfileDialog = false"
              :class="{ 'scale-button': hover }"
              class="transition-swing"
            >
              {{ $t('buttons.cancel') }}
            </v-btn>
          </v-hover>
          <v-hover v-slot="{ hover }">
            <v-btn
              color="primary"
              @click="saveProfile"
              :disabled="!editProfileValid"
              :elevation="hover ? 4 : 2"
              :class="{ 'transform-button': hover }"
              class="transition-swing"
            >
              <v-icon left>
                mdi-content-save
              </v-icon>
              {{ $t('PROFILE.saveChanges') }}
            </v-btn>
          </v-hover>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Account Dialog -->
    <v-dialog
      v-model="deleteAccountDialog"
      max-width="500"
      transition="dialog-bottom-transition"
      persistent
    >
      <v-card class="rounded-lg elevation-12">
        <v-card-title class="error lighten-5">
          <v-icon left color="error">
            mdi-alert-circle
          </v-icon>
          {{ $t('Delete Account') }}
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDeleteDialog" :disabled="isDeleting">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Step 1: Initial Confirmation -->
        <div v-if="deleteStep === 1">
          <v-card-text>
            <v-alert type="error" class="mb-4" outlined>
              {{ $t('PROFILE.deleteAccountConfirm') }}
            </v-alert>
            <p class="text-body-1 mb-4">
              {{ $t('PROFILE.deleteAccountWarning') }}
            </p>

            <div class="text-center mb-4">
              <p class="font-weight-bold">Type "DELETE" to confirm</p>
              <v-text-field
                v-model="deleteConfirmText"
                outlined
                dense
                hide-details
                class="mt-2 input-field-hover"
                :rules="[
                  (v) => v === 'DELETE' || 'Please type DELETE to confirm',
                ]"
              ></v-text-field>
            </div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-hover v-slot="{ hover }">
              <v-btn
                outlined
                @click="closeDeleteDialog"
                min-width="120"
                class="mx-2 transition-swing"
                :class="{ 'scale-button': hover }"
              >
                {{ $t('buttons.cancel') }}
              </v-btn>
            </v-hover>
            <v-hover v-slot="{ hover }">
              <v-btn
                color="error"
                class="mx-2 transition-swing"
                @click="deleteStep = 2"
                min-width="120"
                :disabled="deleteConfirmText !== 'DELETE'"
                :elevation="hover && deleteConfirmText === 'DELETE' ? 4 : 2"
                :class="{
                  'transform-button': hover && deleteConfirmText === 'DELETE',
                }"
              >
                {{ $t('Proceed') }}
              </v-btn>
            </v-hover>
          </v-card-actions>
        </div>

        <!-- Step 2: Enter password -->
        <div v-else>
          <v-card-text>
            <v-alert type="error" class="mb-4" outlined>
              Final step: Verify your identity
            </v-alert>

            <div class="mb-4">
              <p class="text-center font-weight-bold mb-4">
                Enter your password to proceed with account deletion
              </p>
              <v-text-field
                v-model="userPassword"
                :label="$t('Your Password')"
                type="password"
                outlined
                dense
                prepend-inner-icon="mdi-lock"
                :disabled="isDeleting"
                :rules="[(v) => !!v || 'Password is required']"
                class="input-field-hover"
              ></v-text-field>
            </div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-hover v-slot="{ hover }">
              <v-btn
                outlined
                class="mx-2 transition-swing"
                @click="deleteStep = 1"
                :disabled="isDeleting"
                min-width="120"
                :class="{ 'scale-button': hover && !isDeleting }"
              >
                {{ $t('Back') }}
              </v-btn>
            </v-hover>
            <v-hover v-slot="{ hover }">
              <v-btn
                color="error"
                class="mx-2 transition-swing"
                @click="deleteAccount"
                :loading="isDeleting"
                :disabled="!userPassword || isDeleting"
                min-width="120"
                :elevation="hover && userPassword && !isDeleting ? 4 : 2"
                :class="{
                  'transform-button': hover && userPassword && !isDeleting,
                }"
              >
                <v-icon left>
                  mdi-delete
                </v-icon>
                {{ $t('Delete Forever') }}
              </v-btn>
            </v-hover>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { countries } from '@/utils/countries'

export default {
  name: 'ProfileView',

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
        country: null, // This will now store just the country name
      },
      countries: countries,
      usernameRules: [
        (v) => !!v || 'Username is required',
        (v) => (v && v.length >= 3) || 'Username must be at least 3 characters',
      ],
      countryRules: [(v) => !!v || 'Country is required'],
      contactRules: [
        (v) => !!v || 'Contact number is required',
        (v) =>
          /^\d{9,15}$/.test(v) ||
          'Please enter a valid phone number (9-15 digits only)',
      ],
      defaultImage:
        'https://static.vecteezy.com/system/resources/previews/024/983/914/large_2x/simple-user-default-icon-free-png.png',
      displayMissingInfo: this.$t('PROFILE.infoMissing'),
      loading: true,
      valid: false,
      showPassword: false,
      showConfirmPassword: false,
      newPassword: '',
      confirmPassword: '',
      passwordRules: [
        (v) => !!v || this.$t('PROFILE.passwordRequired'),
        (v) => v.length >= 8 || this.$t('PROFILE.passwordMinLength'),
        (v) => /[A-Z]/.test(v) || this.$t('PROFILE.passwordUppercase'),
        (v) => this.hasSpecialChar(v) || this.$t('PROFILE.passwordSymbol'),
      ],
      confirmPasswordRules: [
        (v) => !!v || this.$t('PROFILE.confirmPasswordRequired'),
        (v) => v === this.newPassword || this.$t('PROFILE.passwordsMatch'),
      ],
      editProfileDialog: false,
      deleteAccountDialog: false,
      activeTab: 0,
      userPassword: '',
      isDeleting: false,
      deleteStep: 1,
      deleteConfirmText: '',
      countrySearch: null,
      isSmallScreen: false,
      editProfileValid: false,
    }
  },

  computed: {
    user() {
      return this.$store.getters.user || { email: '' }
    },
    specialCharColor() {
      return this.hasSpecialChar(this.newPassword) ? 'success' : 'grey'
    },
    specialCharIcon() {
      return this.hasSpecialChar(this.newPassword)
        ? 'mdi-check-circle'
        : 'mdi-circle-outline'
    },
    profileItems() {
      return [
        {
          label: this.$t('buttons.username'),
          value: this.userprofile.username,
          icon: 'mdi-account',
        },
        {
          label: this.$t('SIGNIN.email'),
          value: this.user.email,
          icon: 'mdi-email',
        },
        {
          label: this.$t('SIGNIN.contact'),
          value: this.userprofile.contactNo,
          icon: 'mdi-phone',
        },
        {
          label: this.$t('PROFILE.country'),
          value: this.userprofile.country,
          icon: 'mdi-map-marker',
        },
      ]
    },
  },

  async created() {
    this.fetchUserProfile()
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize)
  },

  methods: {
    hasSpecialChar(str) {
      const specialChars = /[!@#$%^&*(),.{}|<>]/
      return specialChars.test(str)
    },

    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 960 // Adjust breakpoint as needed
    },

    async fetchUserProfile() {
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (user) {
          const db = getFirestore()
          const userDoc = await getDoc(doc(db, 'users', user.uid))

          if (userDoc.exists()) {
            const data = userDoc.data()
            this.userprofile = {
              profileImage: data.profileImage || '',
              username: data.username || null,
              contactNo: data.contactNo || null,
              country: data.country || null,
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        this.$toast.error(this.$t('alerts.failedLoadProfile'))
      } finally {
        this.loading = false
      }
    },

    openEditProfileDialog() {
      // Simplified country handling
      this.editProfileData = {
        username: this.userprofile.username,
        contactNo: this.userprofile.contactNo,
        country: this.userprofile.country, // Store just the country name
      }
      this.editProfileDialog = true
    },

    async saveProfile() {
      if (!this.$refs.editProfileForm.validate()) return

      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (user) {
          const db = getFirestore()
          const userDocRef = doc(db, 'users', user.uid)

          await updateDoc(userDocRef, {
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country,
          })

          this.userprofile = {
            ...this.userprofile,
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country,
          }

          this.$toast.success('Profile updated successfully')
          this.editProfileDialog = false
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        this.$toast.error(this.$t('alerts.failedProfileUpdate'))
      }
    },

    async changePassword() {
      if (this.$refs.passwordForm.validate()) {
        try {
          const auth = getAuth()
          const user = auth.currentUser

          if (user) {
            await updatePassword(user, this.newPassword)
            this.$toast.success('Password changed successfully')
            this.newPassword = ''
            this.confirmPassword = ''
            this.$refs.passwordForm.reset()
          }
        } catch (error) {
          this.$toast.error(
            this.$t('alerts.failedPasswordChange') + ': ' + error.message,
          )
        }
      }
    },

    async deleteAccount() {
      if (!this.userPassword) {
        this.$toast.error(this.$t('alerts.passwordRequredForDelete'))
        return
      }

      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        try {
          this.isDeleting = true
          const email = user.email
          const credential = EmailAuthProvider.credential(
            email,
            this.userPassword,
          )

          await reauthenticateWithCredential(user, credential)

          const db = getFirestore()
          const userDocId = user.uid

          // Clean up related data
          const testsCollectionRef = collection(db, 'tests')
          const testsQuery = query(
            testsCollectionRef,
            where('testAdmin.userDocId', '==', userDocId),
          )

          const testsSnapshot = await getDocs(testsQuery)

          if (!testsSnapshot.empty) {
            for (const testDoc of testsSnapshot.docs) {
              const testData = testDoc.data()
              const answersDocId = testData.answersDocId

              if (answersDocId) {
                const answersDocRef = doc(db, 'answers', answersDocId)
                await deleteDoc(answersDocRef)
              }

              const testDocRef = doc(db, 'tests', testDoc.id)
              await deleteDoc(testDocRef)
            }
          }

          // Delete user document from Firestore
          const userDocRef = doc(db, 'users', userDocId)
          await deleteDoc(userDocRef)

          // Delete the Firebase Auth user
          await user.delete()

          this.$toast.success('Account deleted successfully')
          this.deleteAccountDialog = false
          this.signOut()
        } catch (error) {
          console.error('Error during account deletion:', error)
          this.$toast.error(
            this.$t('alerts.failedDeleteAccount') + ': ' + error.message,
          )
        } finally {
          this.isDeleting = false
        }
      } else {
        this.$toast.error(this.$t('alerts.noUserSignedIn'))
      }
    },

    closeDeleteDialog() {
      this.deleteAccountDialog = false
      this.userPassword = ''
      this.deleteConfirmText = ''
      this.deleteStep = 1
    },

    async signOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/').catch((error) => {
          console.log(error)
        })
      })
    },

    countryFilter(item, queryText) {
      if (!queryText) return true

      const searchText = queryText.toLowerCase()
      const countryName = item.name.toLowerCase()
      return countryName.includes(searchText)
    },
  },
}
</script>

<style>
/* Basic transitions */
.transition-swing {
  transition: all 0.3s ease;
}

/* Simple card hover effect */
.profile-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Simple button hover effect */
.transform-button:hover {
  transform: translateY(-2px);
}

/* Basic avatar hover effect */
.transform-avatar:hover {
  transform: scale(1.05);
}

/* Simple input field hover */
.input-field-hover:hover {
  border-color: var(--v-primary-base);
}

/* Basic list item hover */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Simple dialog transition */
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s ease-in-out;
}

/* Media query for mobile */
@media (max-width: 600px) {
  .transform-button:hover,
  .transform-avatar:hover,
  .profile-card-hover:hover {
    transform: none;
  }
}
</style>
