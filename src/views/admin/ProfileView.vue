<template>
  <div class="container px-4 py-8">
    <v-row>
      <!-- Left Section: Profile Details -->
      <v-col
        cols="12"
        md="4"
        lg="3"
      >
        <v-card
          border
          class="rounded-lg h-100"
        >
          <v-card-text class="text-center">
            <div class="d-flex justify-center position-relative my-4">
              <v-hover v-slot="{ isHovered }">
                <v-avatar
                  size="128"
                  class="elevation-4 text-primary"
                  :class="{ 'transform-avatar': isHovered }"
                >
                  <v-img
                    :src="userprofile.profileImage || defaultImage"
                    :alt="$t('PROFILE.title')"
                    class="text-white"
                  />
                </v-avatar>
              </v-hover>
              <div class="profile-glow" />
            </div>

            <h2 class="text-h5 mb-2 font-weight-bold">
              {{ userprofile.username || $t('PROFILE.user') }}
            </h2>
            <v-chip
              size="small"
              class="mb-6 bg-primary"
              color="white"
              :ripple="true"
            >
              {{ $t('PROFILE.admin') }}
            </v-chip>

            <v-divider class="my-4" />

            <div>
              <v-list density="compact">
                <v-hover
                  v-for="(item, index) in profileItems"
                  v-slot="{ isHovered }"
                  :key="index"
                >
                  <v-list-item
                    class="rounded-lg pa-2"
                    :class="{ 'grey lighten-4': isHovered }"
                  >
                    <v-list-item-subtitle
                      class="text-caption text-uppercase font-weight-medium text-grey-darken-1"
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
                    <v-list-item-action>
                      <v-icon
                        size="small"
                        :color="isHovered ? 'primary' : 'grey lighten-1'"
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
      <v-col
        cols="12"
        md="8"
        lg="9"
      >
        <v-card
          flat
          class="w-100"
        >
          <!-- Tabs Section -->
          <v-tabs
            v-if="!isSmallScreen"
            v-model="activeTab"
            bg-color="transparent"
            color="primary"
            slider-color="primary"
            grow
          >
            <v-tab class="text-subtitle-1 font-weight-medium px-4">
              <v-icon
                size="small"
                class="mr-2"
              >
                mdi-account
              </v-icon>
              {{ $t('PROFILE.account') }}
            </v-tab>
            <v-tab class="text-subtitle-1 font-weight-medium px-4">
              <v-icon
                size="small"
                class="mr-2"
              >
                mdi-shield-lock
              </v-icon>
              {{ $t('PROFILE.security') }}
            </v-tab>
          </v-tabs>

          <v-window
            v-model="activeTab"
            class="mt-3"
          >
            <v-window-item transition="fade-transition">
              <!-- Account Tab Content -->
              <v-hover v-slot="{ isHovered }">
                <v-card
                  border
                  flat
                  class="mt-4 rounded-lg"
                  :class="{ 'transform-card': isHovered }"
                >
                  <v-card-title class="mb-4 bg-grey-lighten-4">
                    <v-icon
                      start
                      color="primary"
                    >
                      mdi-account-details
                    </v-icon>
                    {{ $t('PROFILE.personalInfo') }}
                  </v-card-title>
                  <v-card-text>
                    <v-form>
                      <v-row>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="userprofile.username"
                            :label="$t('PROFILE.username')"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="user.email"
                            :label="$t('PROFILE.email')"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-email"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="userprofile.contactNo"
                            :label="$t('PROFILE.contact')"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-phone"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="userprofile.country"
                            :label="$t('PROFILE.country')"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-map-marker"
                            readonly
                            class="input-field-hover"
                          />
                        </v-col>
                      </v-row>
                    </v-form>

                    <v-hover v-slot="{ isHoveredBtn }">
                      <v-btn
                        color="primary"
                        class="mt-4 text-none font-weight-medium"
                        :elevation="isHoveredBtn ? 6 : 2"
                        :class="{ 'transform-button': isHoveredBtn }"
                        @click="openEditProfileDialog"
                      >
                        <v-icon start>
                          mdi-pencil
                        </v-icon>
                        {{ $t('PROFILE.editDetails') }}
                      </v-btn>
                    </v-hover>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-window-item>

            <v-window-item transition="fade-transition">
              <!-- Security Tab Content -->
              <v-hover v-slot="{ isHovered }">
                <v-card
                  border
                  flat
                  class="mt-4 rounded-lg"
                  :class="{ 'transform-card': isHovered }"
                >
                  <v-card-title class="mb-4 bg-grey-lighten-4">
                    <v-icon
                      start
                      color="primary"
                    >
                      mdi-lock
                    </v-icon>
                    {{ $t('PROFILE.changePassword') }}
                  </v-card-title>
                  <v-card-text>
                    <v-alert
                      type="warning"
                      border="start"
                      border-color="warning"
                      class="mb-3"
                    >
                      <div class="text-h6 font-weight-medium mb-2">
                        {{ $t('PROFILE.passwordRequirements') }}
                      </div>
                      <div class="text-body-2 mb-3">
                        {{ $t('PROFILE.passwordMinimumRequirements') }}
                      </div>
                      <div>
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            size="small"
                            class="mr-2"
                            :color="newPassword.length >= 8 ? 'success' : 'grey'"
                          >
                            {{
                              newPassword.length >= 8
                                ? 'mdi-check-circle'
                                : 'mdi-circle-outline'
                            }}
                          </v-icon>
                          <span>{{ $t('PROFILE.passwordMinLength') }}</span>
                        </div>
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            size="small"
                            class="mr-2"
                            :color="/[A-Z]/.test(newPassword) ? 'success' : 'grey'"
                          >
                            {{
                              /[A-Z]/.test(newPassword)
                                ? 'mdi-check-circle'
                                : 'mdi-circle-outline'
                            }}
                          </v-icon>
                          <span>{{ $t('PROFILE.passwordUppercase') }}</span>
                        </div>
                        <div class="d-flex align-center">
                          <v-icon
                            size="small"
                            class="mr-2"
                            :color="specialCharColor"
                          >
                            {{ specialCharIcon }}
                          </v-icon>
                          <span>{{ $t('PROFILE.passwordSymbol') }}</span>
                        </div>
                      </div>
                    </v-alert>

                    <v-form
                      ref="passwordForm"
                      v-model="valid"
                    >
                      <v-row dense>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="newPassword"
                            :rules="passwordRules"
                            :label="$t('PROFILE.newPassword')"
                            :type="showPassword ? 'text' : 'password'"
                            variant="outlined"
                            density="compact"
                            required
                            prepend-inner-icon="mdi-lock"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            class="input-field-hover"
                            @click:append="showPassword = !showPassword"
                          />
                        </v-col>
                        <v-col
                          cols="12"
                          md="6"
                        >
                          <v-text-field
                            v-model="confirmPassword"
                            :rules="confirmPasswordRules"
                            :label="$t('PROFILE.confirmNewPassword')"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            variant="outlined"
                            density="compact"
                            required
                            prepend-inner-icon="mdi-lock-check"
                            :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            class="input-field-hover"
                            @click:append="showConfirmPassword = !showConfirmPassword"
                          />
                        </v-col>
                      </v-row>

                      <div class="mt-2">
                        <v-hover v-slot="{ isHoveredBtn }">
                          <v-btn
                            :disabled="!valid"
                            color="primary"
                            class="text-none font-weight-medium"
                            :elevation="isHoveredBtn ? 6 : 2"
                            :class="{ 'transform-button': isHoveredBtn }"
                            @click="changePassword"
                          >
                            <v-icon start>
                              mdi-key
                            </v-icon>
                            {{ $t('PROFILE.changePassword') }}
                          </v-btn>
                        </v-hover>
                      </div>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-hover>

              <!-- Delete Account Section -->
              <v-hover v-slot="{ isHovered }">
                <v-card
                  class="mt-6 rounded-lg text-error"
                  border
                  :elevation="isHovered ? 3 : 1"
                  :class="{ 'danger-card-hover': isHovered }"
                >
                  <v-card-title class="bg-error-lighten-5">
                    <v-icon
                      start
                      color="error"
                    >
                      mdi-alert-circle
                    </v-icon>
                    {{ $t('PROFILE.deleteAccountTitle') }}
                  </v-card-title>
                  <v-card-text>
                    <p class="text-body-1 mb-4">
                      {{ $t('PROFILE.deleteAccountWarning') }}
                    </p>
                    <v-hover v-slot="{ isHoveredBtn }">
                      <v-btn
                        color="error"
                        class="text-none font-weight-medium"
                        :block="isSmallScreen"
                        :variant="!isHoveredBtn ? 'outlined' : undefined"
                        :class="{ 'transform-button': isHoveredBtn }"
                        :elevation="isHoveredBtn ? 2 : 0"
                        @click="deleteAccountDialog = true"
                      >
                        <v-icon start>
                          mdi-delete
                        </v-icon>
                        <span>{{ $t('PROFILE.deleteAccount') }}</span>
                      </v-btn>
                    </v-hover>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-window-item>
          </v-window>
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
        <v-card-title class="bg-grey-lighten-4">
          <v-icon
            start
            color="primary"
          >
            mdi-account-edit
          </v-icon>
          {{ $t('PROFILE.editProfile') }}
        </v-card-title>
        <v-card-text>
          <div class="text-center">
            <v-avatar size="100">
              <img
                :src="editProfileData.profileImage || defaultImage"
                alt="Profile Image"
              >
            </v-avatar>
            <v-btn
              icon
              class="ml-2"
              @click="selectImage"
            >
              <v-icon>mdi-camera</v-icon>
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="uploadProfileImage"
            >
          </div>
          <v-form
            ref="editProfileForm"
            v-model="editProfileValid"
          >
            <v-text-field
              v-model="editProfileData.username"
              :label="$t('PROFILE.username')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-account"
              :rules="usernameRules"
              class="mt-4 input-field-hover"
            />
            <v-text-field
              v-model="editProfileData.contactNo"
              :label="$t('PROFILE.contact')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-phone"
              :rules="contactRules"
              :hint="$t('PROFILE.enterValidPhoneNumber')"
              persistent-hint
              class="input-field-hover"
            />
            <v-autocomplete
              v-model="editProfileData.country"
              :label="$t('PROFILE.country')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-map-marker"
              :rules="countryRules"
              :items="countries"
              item-title="name"
              item-value="name"
              :custom-filter="countryFilter"
              clearable
              :menu-props="{
                maxHeight: '400px',
                closeOnClick: true,
                closeOnContentClick: true,
              }"
            >
              <template #selection="{ item }">
                {{ item.raw.emoji }} {{ item.raw.name }}
              </template>
              <template #item="{ item }">
                <v-list-item-title>
                  {{ item.raw.emoji }} {{ item.raw.name }}
                </v-list-item-title>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-hover v-slot="{ isHovered }">
            <v-btn
              variant="text"
              :class="{ 'scale-button': isHovered }"
              @click="editProfileDialog = false"
            >
              {{ $t('PROFILE.cancel') }}
            </v-btn>
          </v-hover>
          <v-hover v-slot="{ isHovered }">
            <v-btn
              color="primary"
              :disabled="!editProfileValid"
              :elevation="isHovered ? 4 : 2"
              :class="{ 'transform-button': isHovered }"
              @click="saveProfile"
            >
              <v-icon start>
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
        <v-card-title class="bg-error-lighten-5">
          <v-icon
            start
            color="error"
          >
            mdi-alert-circle
          </v-icon>
          {{ $t('PROFILE.deleteAccountTitle') }}
          <v-spacer />
          <v-btn
            icon
            :disabled="isDeleting"
            @click="closeDeleteDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Step 1: Initial Confirmation -->
        <div v-if="deleteStep === 1">
          <v-card-text>
            <v-alert
              type="error"
              class="mb-4"
              variant="outlined"
            >
              {{ $t('PROFILE.deleteAccountConfirm') }}
            </v-alert>
            <p class="text-body-1 mb-4">
              {{ $t('PROFILE.deleteAccountWarning') }}
            </p>

            <div class="text-center mb-4">
              <p class="font-weight-bold">
                {{ $t('PROFILE.typeDeleteToConfirm') }}
              </p>
              <v-text-field
                v-model="deleteConfirmText"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-2 input-field-hover"
                :rules="[(v) => v === 'DELETE' || $t('PROFILE.pleaseTypeDeleteToConfirm')]"
              />
            </div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-hover v-slot="{ isHovered }">
              <v-btn
                variant="outlined"
                min-width="120"
                class="mx-2"
                :class="{ 'scale-button': isHovered }"
                @click="closeDeleteDialog"
              >
                {{ $t('PROFILE.cancel') }}
              </v-btn>
            </v-hover>
            <v-hover v-slot="{ isHovered }">
              <v-btn
                color="error"
                class="mx-2"
                min-width="120"
                :disabled="deleteConfirmText !== 'DELETE'"
                :elevation="isHovered && deleteConfirmText === 'DELETE' ? 4 : 2"
                :class="{ 'transform-button': isHovered && deleteConfirmText === 'DELETE' }"
                @click="deleteStep = 2"
              >
                {{ $t('PROFILE.proceed') }}
              </v-btn>
            </v-hover>
          </v-card-actions>
        </div>

        <!-- Step 2: Enter password -->
        <div v-else>
          <v-card-text>
            <v-alert
              type="error"
              class="mb-4"
              variant="outlined"
            >
              {{ $t('PROFILE.finalStepVerifyIdentity') }}
            </v-alert>

            <div class="mb-4">
              <p class="text-center font-weight-bold mb-4">
                {{ $t('PROFILE.enterPasswordForAccountDeletion') }}
              </p>
              <v-text-field
                v-model="userPassword"
                :label="$t('PROFILE.yourPassword')"
                type="password"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-lock"
                :disabled="isDeleting"
                :rules="[(v) => !!v || $t('PROFILE.passwordRequired')]"
                class="input-field-hover"
              />
            </div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-hover v-slot="{ isHovered }">
              <v-btn
                variant="outlined"
                class="mx-2"
                :disabled="isDeleting"
                min-width="120"
                :class="{ 'scale-button': isHovered && !isDeleting }"
                @click="deleteStep = 1"
              >
                {{ $t('PROFILE.back') }}
              </v-btn>
            </v-hover>
            <v-hover v-slot="{ isHovered }">
              <v-btn
                color="error"
                class="mx-2"
                :loading="isDeleting"
                :disabled="!userPassword || isDeleting"
                min-width="120"
                :elevation="isHovered && userPassword && !isDeleting ? 4 : 2"
                :class="{ 'transform-button': isHovered && userPassword && !isDeleting }"
                @click="deleteAccount"
              >
                <v-icon start>
                  mdi-delete
                </v-icon>
                {{ $t('PROFILE.deleteForever') }}
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
} from 'firebase/auth';
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
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { countries } from '@/utils/countries';
import i18n from '@/i18n';

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
        country: null,
        profileImage: null,
      },
      countries,
      usernameRules: [
        (v) => !!v || i18n.t('PROFILE.usernameRequired'),
        (v) => (v && v.length >= 3) || i18n.t('PROFILE.usernameMinLength'),
      ],
      countryRules: [(v) => !!v || i18n.t('PROFILE.countryRequired')],
      contactRules: [
        (v) => !!v || i18n.t('PROFILE.contactNumberRequired'),
        (v) => /^\d{9,15}$/.test(v) || i18n.t('PROFILE.enterValidPhoneNumber'),
      ],
      defaultImage:
        'https://static.vecteezy.com/system/resources/previews/024/983/914/large_2x/simple-user-default-icon-free-png.png',
      displayMissingInfo: i18n.t('PROFILE.infoMissing'),
      loading: true,
      valid: false,
      showPassword: false,
      showConfirmPassword: false,
      newPassword: '',
      confirmPassword: '',
      passwordRules: [
        (v) => !!v || i18n.t('PROFILE.passwordRequired'),
        (v) => v.length >= 8 || i18n.t('PROFILE.passwordMinLength'),
        (v) => /[A-Z]/.test(v) || i18n.t('PROFILE.passwordUppercase'),
        (v) => this.hasSpecialChar(v) || i18n.t('PROFILE.passwordSymbol'),
      ],
      confirmPasswordRules: [
        (v) => !!v || i18n.t('PROFILE.confirmPasswordRequired'),
        (v) => v === this.newPassword || i18n.t('PROFILE.passwordsMatch'),
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
    };
  },
  computed: {
    user() {
      return this.$store.getters.user || { email: '' };
    },
    specialCharColor() {
      return this.hasSpecialChar(this.newPassword) ? 'success' : 'grey';
    },
    specialCharIcon() {
      return this.hasSpecialChar(this.newPassword)
        ? 'mdi-check-circle'
        : 'mdi-circle-outline';
    },
    profileItems() {
      return [
        {
          label: i18n.t('PROFILE.username'),
          value: this.userprofile.username,
          icon: 'mdi-account',
        },
        {
          label: i18n.t('PROFILE.email'),
          value: this.user.email,
          icon: 'mdi-email',
        },
        {
          label: i18n.t('PROFILE.contact'),
          value: this.userprofile.contactNo,
          icon: 'mdi-phone',
        },
        {
          label: i18n.t('PROFILE.country'),
          value: this.userprofile.country,
          icon: 'mdi-map-marker',
        },
      ];
    },
  },
  async created() {
    this.fetchUserProfile();
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    hasSpecialChar(str) {
      const specialChars = /[!@#$%^&*(),.{}|<>]/;
      return specialChars.test(str);
    },
    selectImage() {
      this.$refs.fileInput.click();
    },
    async uploadProfileImage(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error(i18n.t('PROFILE.noUserSignedIn'));

        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${user.uid}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { profileImage: downloadURL });

        this.userprofile.profileImage = downloadURL;
        this.editProfileData.profileImage = downloadURL;
        this.$toast.success(i18n.t('PROFILE.profileImageUpdatedSuccess'));
      } catch (error) {
        console.error('Error uploading image:', error);
        this.$toast.error(i18n.t('PROFILE.profileImageUploadFailed'));
      }
    },
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 960;
    },
    async fetchUserProfile() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            this.userprofile = {
              profileImage: data.profileImage || '',
              username: data.username || null,
              contactNo: data.contactNo || null,
              country: data.country || null,
            };
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.$toast.error(i18n.t('PROFILE.profileLoadFailed'));
      } finally {
        this.loading = false;
      }
    },
    openEditProfileDialog() {
      this.editProfileData = {
        username: this.userprofile.username,
        contactNo: this.userprofile.contactNo,
        country: this.userprofile.country,
        profileImage: this.userprofile.profileImage,
      };
      this.editProfileDialog = true;
    },
    async saveProfile() {
      if (!this.$refs.editProfileForm.validate()) return;

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const db = getFirestore();
          const userDocRef = doc(db, 'users', user.uid);

          await updateDoc(userDocRef, {
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country,
          });

          this.userprofile = {
            ...this.userprofile,
            username: this.editProfileData.username,
            contactNo: this.editProfileData.contactNo,
            country: this.editProfileData.country,
          };

          this.$toast.success(i18n.t('PROFILE.profileUpdatedSuccess'));
          this.editProfileDialog = false;
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        this.$toast.error(i18n.t('PROFILE.profileUpdateFailed'));
      }
    },
    async changePassword() {
      if (this.$refs.passwordForm.validate()) {
        try {
          const auth = getAuth();
          const user = auth.currentUser;

          if (user) {
            await updatePassword(user, this.newPassword);
            this.$toast.success(i18n.t('PROFILE.passwordChangedSuccess'));
            this.newPassword = '';
            this.confirmPassword = '';
            this.$refs.passwordForm.reset();
          }
        } catch (error) {
          console.error('Error changing password:', error);
          this.$toast.error(i18n.t('PROFILE.passwordChangeFailed'));
        }
      }
    },
    async deleteAccount() {
      if (!this.userPassword) {
        this.$toast.error(i18n.t('PROFILE.passwordRequired'));
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          this.isDeleting = true;
          const email = user.email;
          const credential = EmailAuthProvider.credential(email, this.userPassword);

          await reauthenticateWithCredential(user, credential);

          const db = getFirestore();
          const userDocId = user.uid;

          const testsCollectionRef = collection(db, 'tests');
          const testsQuery = query(testsCollectionRef, where('testAdmin.userDocId', '==', userDocId));
          const testsSnapshot = await getDocs(testsQuery);

          if (!testsSnapshot.empty) {
            for (const testDoc of testsSnapshot.docs) {
              const testData = testDoc.data();
              const answersDocId = testData.answersDocId;

              if (answersDocId) {
                const answersDocRef = doc(db, 'answers', answersDocId);
                await deleteDoc(answersDocRef);
              }

              const testDocRef = doc(db, 'tests', testDoc.id);
              await deleteDoc(testDocRef);
            }
          }

          const userDocRef = doc(db, 'users', userDocId);
          await deleteDoc(userDocRef);

          await user.delete();
          this.$toast.success(i18n.t('PROFILE.accountDeletedSuccess'));
          this.deleteAccountDialog = false;
          this.signOut();
        } catch (error) {
          console.error('Error during account deletion:', error);
          this.$toast.error(i18n.t('PROFILE.accountDeletionFailed'));
        } finally {
          this.isDeleting = false;
        }
      } else {
        this.$toast.error(i18n.t('PROFILE.noUserSignedIn'));
      }
    },
    closeDeleteDialog() {
      this.deleteAccountDialog = false;
      this.userPassword = '';
      this.deleteConfirmText = '';
      this.deleteStep = 1;
    },
    async signOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/').catch((error) => {
          console.log(error);
        });
      });
    },
    countryFilter(item, queryText) {
      if (!queryText) return true;

      const searchText = queryText.toLowerCase();
      const countryName = item.name.toLowerCase();
      return countryName.includes(searchText);
    },
  },
};
</script>

<style scoped>
/* Custom transitions to replace transition-swing */
.transform-button {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.transform-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.transform-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.transform-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.transform-avatar {
  transition: transform 0.3s ease;
}

.transform-avatar:hover {
  transform: scale(1.05);
}

.scale-button {
  transition: transform 0.3s ease;
}

.scale-button:hover {
  transform: scale(1.05);
}

.danger-card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.danger-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.2);
}

.input-field-hover:hover .v-input__control {
  border-color: var(--v-primary-base);
}

.v-list-item {
  transition: background-color 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s ease-in-out;
}

@media (max-width: 600px) {
  .transform-button:hover,
  .transform-avatar:hover,
  .transform-card:hover,
  .danger-card-hover:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>