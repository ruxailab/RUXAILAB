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

        <!-- Edit Details Button below Profile Card -->
        <v-btn
          color="primary"
          variant="flat"
          class="w-100 mt-3 text-capitalize"
          @click="openEditProfileDialog"
        >
          <v-icon start>
            mdi-pencil
          </v-icon>
          {{ $t('profile.editDetails') }}
        </v-btn>
      </v-col>

      <!-- Right Section: Security and Delete Account -->
      <v-col
        cols="12"
        md="8"
        lg="9"
      >
        <!-- Security Section -->
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
            <div class="d-flex justify-center align-center gap-2 mt-3">
              <v-btn
                icon
                size="small"
                @click="selectImage"
                color="primary"
              >
                <v-icon>mdi-camera</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('profile.uploadProfilePicture') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                v-if="editProfileData.profileImage"
                icon
                size="small"
                @click="removeProfilePicture"
                color="error"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ t('profile.removeProfilePicture') }}
                </v-tooltip>
              </v-btn>
            </div>
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
                <span v-if="item.raw && item.raw.emoji">{{ item.raw.emoji }} {{ item.raw.name }}</span>
              </template>
              <template #item="{ item, props }">
                <v-list-item 
                  v-bind="{ ...props, title: undefined }" 
                  v-if="item.raw && item.raw.emoji"
                >
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
            @click="handleCancelEdit"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-capitalize"
            :disabled="!saveButtonEnabled"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
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
const userPassword = ref('');
const isDeleting = ref(false);
const deleteStep = ref(1);
const deleteConfirmText = ref('');
const isSmallScreen = ref(false);
const editProfileValid = ref(false);

// FIX: ADD THESE VARIABLES
const selectedImageFile = ref(null);
const imagePreviewUrl = ref('');
const hasImageChanges = ref(false);

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

// FIX: SIMPLE SAVE BUTTON LOGIC
const saveButtonEnabled = computed(() => {
  return editProfileValid.value || hasImageChanges.value;
});

const hasSpecialChar = (str) => {
  const specialChars = /[!@#$%^&*(),.{}|<>]/;
  return specialChars.test(str);
};

const selectImage = () => {
  if (fileInput.value) fileInput.value.value = '';
  fileInput.value.click();
};

// FIX: REPLACE THIS FUNCTION COMPLETELY
const uploadProfileImage = async (event) => {
  const file = event?.target?.files?.[0];
  if (!file) return;

  try {
    // Create preview only - NO UPLOAD!
    const previewUrl = URL.createObjectURL(file);
    
    // Store file for later upload
    selectedImageFile.value = file;
    imagePreviewUrl.value = previewUrl;
    
    // Update preview in dialog
    editProfileData.value.profileImage = previewUrl;
    
    // Mark that we have image changes
    hasImageChanges.value = true;
    
    // Reset file input
    if (fileInput.value) fileInput.value.value = '';
    
    console.log('Image selected. hasImageChanges:', true);
    
  } catch (error) {
    console.error('Error creating image preview:', error);
    toast.error(t('profile.imagePreviewFailed'));
    editProfileData.value.profileImage = userprofile.value.profileImage;
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

// FIX: UPDATE THIS FUNCTION
const openEditProfileDialog = () => {
  editProfileData.value = {
    username: userprofile.value.username,
    contactNo: userprofile.value.contactNo,
    country: userprofile.value.country,
    profileImage: userprofile.value.profileImage,
  };
  
  // Reset image states when opening dialog
  selectedImageFile.value = null;
  imagePreviewUrl.value = '';
  hasImageChanges.value = false;
  
  editProfileDialog.value = true;
};

// FIX: ADD CANCEL HANDLER
const handleCancelEdit = () => {
  // Clean up preview URL if exists
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
  
  // Reset image states
  selectedImageFile.value = null;
  imagePreviewUrl.value = '';
  hasImageChanges.value = false;
  
  editProfileDialog.value = false;
};

// FIX: REPLACE THIS FUNCTION COMPLETELY
const saveProfile = async () => {
  // First validate the form
  if (editProfileForm.value) {
    const { valid } = await editProfileForm.value.validate();
    if (!valid) return;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      // Upload image first if there's a new one
      let finalProfileImage = editProfileData.value.profileImage;
      
      if (selectedImageFile.value) {
        // Actually upload the image now (only when saving!)
        const storage = getStorage();
        const storageReference = storageRef(storage, `profileImages/${user.uid}`);
        const snapshot = await uploadBytes(storageReference, selectedImageFile.value);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Update with final URL
        finalProfileImage = downloadURL;
        
        // Clean up preview URL
        if (imagePreviewUrl.value) {
          URL.revokeObjectURL(imagePreviewUrl.value);
        }
      }

      const updateData = {
        username: editProfileData.value.username,
        contactNo: editProfileData.value.contactNo,
        country: editProfileData.value.country,
        profileImage: finalProfileImage,
      };

      await updateDoc(userDocRef, updateData);

      // Update local state
      userprofile.value = {
        ...userprofile.value,
        username: editProfileData.value.username,
        contactNo: editProfileData.value.contactNo,
        country: editProfileData.value.country,
        profileImage: finalProfileImage,
      };

      // Reset image states
      selectedImageFile.value = null;
      imagePreviewUrl.value = '';
      hasImageChanges.value = false;

      toast.success(t('profile.profileUpdatedSuccess'));
      editProfileDialog.value = false;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error(t('profile.profileUpdateFailed'));
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

// FIX: UPDATE REMOVE PROFILE PICTURE FUNCTION
const removeProfilePicture = () => {
  // Set to empty string for removal
  editProfileData.value.profileImage = '';
  
  // Clear any selected file
  selectedImageFile.value = null;
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = '';
  }
  
  // Mark as changed
  hasImageChanges.value = true;
  
  if (fileInput.value) fileInput.value.value = '';
};

const handlerDeleteConfirmText = async (value) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user.providerData.includes(a => a.providerId !== 'google.com')) {
    deleteStep.value = 2;
    return;
  }
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
    globalThis.location.href = '/';
  } catch (error) {
    console.log(error);
  }
};

const countryFilter = (item, queryText) => {
  if (!queryText) return true;
  
  const itemName = item?.name || item || '';
  return String(itemName).toLowerCase().includes(queryText.toLowerCase());
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