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
          class="rounded-xl pa-6"
          elevation="4"
        >
          <v-card-text class="text-center">
            <v-avatar
              size="120"
              class="mb-4"
            >
              <v-img
                :src="userprofile.profileImage"
                alt="No Image"
                class="avatar-transition bg-ternary"
              />
            </v-avatar>
            <h2 class="text-h6 font-weight-bold mb-2">
              {{ userprofile.username || $t('profile.title') }}
            </h2>
            <v-chip
              size="small"
              color="primary"
              class="mb-6"
            >
              {{ $t('profile.admin') }}
            </v-chip>

            <v-divider class="my-4" />

            <v-list density="compact">
              <v-list-item
                v-for="(item, index) in profileItems"
                :key="index"
                class="rounded-lg pa-2 list-item-transition"
              >
                <v-list-item-subtitle class="text-caption text-uppercase text-grey-darken-1">
                  <v-icon
                    size="small"
                    color="grey-darken-1"
                  >
                    {{ item.icon }}
                  </v-icon>
                  {{ item.label }}:
                </v-list-item-subtitle>
                <v-list-item-title
                  v-if="!loading"
                  :class="{
                    'font-italic text-error': !item.value,
                    'font-weight-medium': item.value,
                  }"
                >
                  {{ item.value || $t('profile.missingInfo') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
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
          class="rounded-xl"
        >
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
            <v-tab
              value="0"
              class="text-body-1 font-weight-medium"
            >
              <v-icon
                size="small"
                start
              >
                mdi-account
              </v-icon>
              {{ $t('profile.account') }}
            </v-tab>
            <v-tab
              value="1"
              class="text-body-1 font-weight-medium"
            >
              <v-icon
                size="small"
                start
              >
                mdi-shield-lock
              </v-icon>
              {{ $t('profile.security') }}
            </v-tab>
          </v-tabs>

          <v-window
            v-model="activeTab"
            class="pa-4"
          >
            <!-- Account Tab Content -->
            <v-window-item
              value="0"
              transition="fade-transition"
            >
              <v-card
                class="rounded-xl pa-6"
                elevation="2"
              >
                <v-card-title class="text-h6 font-weight-bold mb-4">
                  <v-icon
                    start
                    color="primary"
                  >
                    mdi-account-details
                  </v-icon>
                  {{ $t('profile.personalInfo') }}
                </v-card-title>
                <v-card-text>
                  <v-form>
                    <v-row dense>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-text-field
                          v-model="userprofile.username"
                          :label="$t('profile.username')"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-account"
                          readonly
                          class="input-field-transition"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
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
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-text-field
                          v-model="userprofile.contactNo"
                          :label="$t('profile.contact')"
                          variant="outlined"
                          density="compact"
                          prepend-inner-icon="mdi-phone"
                          readonly
                          class="input-field-transition"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                      >
                        <v-text-field
                          v-model="userprofile.country"
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
                    @click="openEditProfileDialog"
                  >
                    <v-icon start>
                      mdi-pencil
                    </v-icon>
                    {{ $t('profile.editDetails') }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-window-item>

            <!-- Security Tab Content -->
            <v-window-item
              value="1"
              transition="fade-transition"
            >
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
                          :color="newPassword.length >= 8 ? 'success' : 'grey-darken-1'"
                        >
                          {{ newPassword.length >= 8 ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                        </v-icon>
                        <span>{{ $t('profile.passwordMinLength') }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon
                          size="small"
                          class="mr-2"
                          :color="/[A-Z]/.test(newPassword) ? 'success' : 'grey-darken-1'"
                        >
                          {{ /[A-Z]/.test(newPassword) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                        </v-icon>
                        <span>{{ $t('profile.passwordUppercase') }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon
                          size="small"
                          class="mr-2"
                          :color="specialCharColor"
                        >
                          {{ specialCharIcon }}
                        </v-icon>
                        <span>{{ $t('profile.passwordSymbol') }}</span>
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
                        sm="6"
                      >
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
                      <v-col
                        cols="12"
                        sm="6"
                      >
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
                </v-card-text>
              </v-card>

              <!-- Delete Account Section -->
              <v-card
                class="rounded-xl pa-6 mt-6"
                elevation="2"
              >
                <v-card-title class="text-h6 font-weight-bold">
                  <v-icon
                    start
                    color="error"
                  >
                    mdi-alert-circle
                  </v-icon>
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
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Details Dialog -->
    <v-dialog
      v-model="editProfileDialog"
      max-width="600px"
      transition="dialog-bottom-transition"
    >
      <v-card
        class="rounded-xl pa-6"
        elevation="6"
      >
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon
            start
            color="primary"
          >
            mdi-account-edit
          </v-icon>
          {{ $t('profile.editProfile') }}
        </v-card-title>
        <v-card-text>
          <div class="text-center mb-6">
            <v-avatar
              size="100"
              class="avatar-transition bg-ternary"
            >
              <v-img
                :src="editProfileData.profileImage"
                alt="No Image"
              />
            </v-avatar>
            <v-btn
              icon
              size="small"
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
              :label="$t('profile.username')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-account"
              :rules="usernameRules"
              class="mb-4 input-field-transition"
            />
            <v-text-field
              v-model="editProfileData.contactNo"
              :label="$t('profile.contact')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-phone"
              :rules="contactRules"
              :hint="$t('Enter a valid No.')"
              persistent-hint
              class="mb-4 input-field-transition"
            />
            <v-autocomplete
              v-model="editProfileData.country"
              :label="$t('profile.country')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-map-marker"
              :rules="countryRules"
              :items="countries"
              item-title="name"
              item-value="name"
              :custom-filter="countryFilter"
              clearable
              :menu-props="{ maxHeight: '400px' }"
              class="input-field-transition"
            >
              <template #selection="{ item }">
                {{ item.raw.emoji }} {{ item.raw.name }}
              </template>
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <v-list-item-title>
                    {{ item.raw.emoji }} {{ item.raw.name }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-capitalize"
            @click="editProfileDialog = false"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-capitalize"
            :disabled="!editProfileValid"
            @click="saveProfile"
          >
            <v-icon start>
              mdi-content-save
            </v-icon>
            {{ $t('profile.saveChanges') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Account Dialog -->
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
              :disabled="isDeleting"
              @click="closeDeleteDialog"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="text-capitalize"
              min-width="120"
              :loading="isDeleting"
              :disabled="deleteConfirmText !== 'DELETE'"
              @click="handlerDeleteConfirmText"
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
              @click="deleteStep = 1"
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
              @click="handlerDeleteAccount"
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
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  fetchSignInMethodsForEmail,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { countries } from '@/shared/constants/countries';

const store = useStore();
const user = computed(() => store.getters.user || { email: '' });

const { t } = useI18n();
const toast = useToast();

const userprofile = ref({
  profileImage: null,
  username: null,
  contactNo: null,
  country: null,
});
const editProfileData = ref({
  username: null,
  contactNo: null,
  country: null,
  profileImage: null,
});
const loading = ref(true);
const valid = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const editProfileDialog = ref(false);
const deleteAccountDialog = ref(false);
const activeTab = ref(0);
const userPassword = ref('');
const isDeleting = ref(false);
const deleteStep = ref(1);
const deleteConfirmText = ref('');
const isSmallScreen = ref(false);
const editProfileValid = ref(false);

const passwordForm = ref(null);
const editProfileForm = ref(null);
const fileInput = ref(null);

// Validation rules
const usernameRules = [
  (v) => !!v || t('PROFILE.usernameRequired'),
  (v) => (v && v.length >= 3) || t('PROFILE.usernameMinLength'),
];
const countryRules = [(v) => !!v || t('PROFILE.countryRequired')];
const contactRules = [
  (v) => !!v || t('PROFILE.contactNumberRequired'),
  (v) => /^\d{9,15}$/.test(v) || t('PROFILE.enterValidPhoneNumber'),
];
const passwordRules = [
  (v) => !!v || t('PROFILE.passwordRequired'),
  (v) => v.length >= 8 || t('PROFILE.passwordMinLength'),
  (v) => /[A-Z]/.test(v) || t('PROFILE.passwordUppercase'),
  (v) => hasSpecialChar(v) || t('PROFILE.passwordSymbol'),
];
const confirmPasswordRules = [
  (v) => !!v || t('PROFILE.confirmPasswordRequired'),
  (v) => v === newPassword.value || t('PROFILE.passwordsMatch'),
];

const specialCharColor = computed(() =>
  hasSpecialChar(newPassword.value) ? 'success' : 'grey'
);
const specialCharIcon = computed(() =>
  hasSpecialChar(newPassword.value) ? 'mdi-check-circle' : 'mdi-circle-outline'
);
const profileItems = computed(() => [
  {
    label: t('profile.username'),
    value: userprofile.value.username,
    icon: 'mdi-account',
  },
  {
    label: t('profile.email'),
    value: user.value.email,
    icon: 'mdi-email',
  },
  {
    label: t('profile.contact'),
    value: userprofile.value.contactNo,
    icon: 'mdi-phone',
  },
  {
    label: t('profile.country'),
    value: userprofile.value.country,
    icon: 'mdi-map-marker',
  },
]);

const hasSpecialChar = (str) => {
  const specialChars = /[!@#$%^&*(),.{}|<>]/;
  return specialChars.test(str);
};

const selectImage = () => {
  fileInput.value.click();
};

const uploadProfileImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error(t('PROFILE.noUserSignedIn'));

    const storage = getStorage();
    const storageReference = storageRef(storage, `profileImages/${user.uid}`);

    const snapshot = await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { profileImage: downloadURL });

    userprofile.value.profileImage = downloadURL;
    editProfileData.value.profileImage = downloadURL;
    toast.success(t('PROFILE.profileImageUpdatedSuccess'));
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error(t('PROFILE.profileImageUploadFailed'));
  }
};

const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 960;
};

const fetchUserProfile = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        userprofile.value = {
          profileImage: data.profileImage || '',
          username: data.username || null,
          contactNo: data.contactNo || null,
          country: data.country || null,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    toast.error(t('PROFILE.profileLoadFailed'));
  } finally {
    loading.value = false;
  }
};

const openEditProfileDialog = () => {
  editProfileData.value = {
    username: userprofile.value.username,
    contactNo: userprofile.value.contactNo,
    country: userprofile.value.country,
    profileImage: userprofile.value.profileImage,
  };
  editProfileDialog.value = true;
};

const saveProfile = async () => {
  if (!editProfileForm.value.validate()) return;

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        username: editProfileData.value.username,
        contactNo: editProfileData.value.contactNo,
        country: editProfileData.value.country,
      });

      userprofile.value = {
        ...userprofile.value,
        username: editProfileData.value.username,
        contactNo: editProfileData.value.contactNo,
        country: editProfileData.value.country,
      };

      toast.success(t('PROFILE.profileUpdatedSuccess'));
      editProfileDialog.value = false;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error(t('PROFILE.profileUpdateFailed'));
  }
};

const changePassword = async () => {
  if (passwordForm.value.validate()) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await updatePassword(user, newPassword.value);
        toast.success(t('PROFILE.passwordChangedSuccess'));
        newPassword.value = '';
        confirmPassword.value = '';
        passwordForm.value.reset();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(t('PROFILE.passwordChangeFailed'));
    }
  }
};

const handlerDeleteConfirmText = async (value) => {
  const auth = getAuth();
  const user = auth.currentUser
  if (user.providerData.includes(a => a.providerId !== 'google.com')) return deleteStep.value = 2

  try {
    isDeleting.value = true
    await reauthenticateWithPopup(user, new GoogleAuthProvider())
    return await deleteAccount(user)
  } catch (error) {
    console.error('Error during account deletion:', error)
    toast.error(t('PROFILE.accountDeletionFailed'))
  } finally {
    isDeleting.value = false
    deleteAccountDialog.value = false
  }
};

const deleteAccount = async (user) => {
  await store.dispatch('deleteAuth', user.uid)
  toast.success(t('PROFILE.accountDeletedSuccess'))
  signOut()
};

const handlerDeleteAccount = async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (!userPassword.value) return toast.error(t('PROFILE.passwordRequired'))

  try {
    isDeleting.value = true
    const cred = EmailAuthProvider.credential(user.email, userPassword.value)
    await reauthenticateWithCredential(user, cred)
    await deleteAccount(user)
  } catch (error) {
    console.error('Error during account deletion:', error)
    toast.error(t('PROFILE.accountDeletionFailed'))
  } finally {
    isDeleting.value = false
    deleteAccountDialog.value = false
  }
};

const closeDeleteDialog = () => {
  deleteAccountDialog.value = false;
  userPassword.value = '';
  deleteConfirmText.value = '';
  deleteStep.value = 1;
};

const signOut = async () => {
  try {
    await store.dispatch('logout');
    window.location.href = '/';
  } catch (error) {
    console.log(error);
  }
};

const countryFilter = (item, queryText) => {
  if (!queryText) return true;

  const searchText = queryText.toLowerCase();
  const countryName = item.name.toLowerCase();
  return countryName.includes(searchText);
};

onMounted(() => {
  fetchUserProfile();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>
