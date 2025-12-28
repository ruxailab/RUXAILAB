<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600px"
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="rounded-xl pa-6" elevation="6">
      <v-card-title class="text-h6 font-weight-bold">
        <v-icon start color="primary">mdi-account-edit</v-icon>
        {{ $t('profile.editProfile') }}
      </v-card-title>

      <v-card-text>
        <!-- Avatar & Upload -->
        <div class="text-center mb-6">
          <v-avatar size="100" class="bg-ternary">
            <v-img
              v-if="localProfileData.profileImage"
              :key="localProfileData.profileImage"
              :src="localProfileData.profileImage"
              cover
            >
              <template #placeholder>
                <v-progress-circular indeterminate color="primary" />
              </template>
            </v-img>

            <v-icon v-else size="50" color="grey-lighten-1">
              mdi-account-circle
            </v-icon>

            <!-- Upload indicator -->
            <v-progress-circular
              v-if="isUploadingImage"
              indeterminate
              color="primary"
              size="20"
              width="2"
              class="upload-indicator"
            />
          </v-avatar>

          <v-btn
            icon
            size="small"
            class="ml-2"
            :disabled="isUploadingImage"
            @click="selectImage"
          >
            <v-icon>mdi-camera</v-icon>
          </v-btn>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            hidden
            @change="handleImageUpload"
          />
        </div>

        <!-- Form -->
        <v-form ref="formRef" v-model="isValid">
          <v-text-field
            v-model="localProfileData.username"
            :label="$t('profile.username')"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-account"
            :rules="usernameRules"
            class="mb-4"
          />

          <v-text-field
            v-model="localProfileData.contactNo"
            :label="$t('profile.contact')"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-phone"
            :rules="contactRules"
            :hint="$t('profile.enterValidPhoneNumber')"
            persistent-hint
            class="mb-4"
          />

          <v-autocomplete
            v-model="localProfileData.country"
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

      <!-- Actions -->
      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="handleCancel">
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="primary"
          :loading="isSaving"
          :disabled="!canSave"
          @click="handleSave"
        >
          <v-icon start>mdi-content-save</v-icon>
          {{ $t('profile.saveChanges') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { countries } from '@/shared/constants/countries'

const props = defineProps({
  modelValue: Boolean,
  profileData: Object,
  onSave: Function,
  onUploadImage: Function
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const fileInput = ref(null)
const formRef = ref(null)

const isValid = ref(false)
const isSaving = ref(false)
const isUploadingImage = ref(false)

const selectedImageFile = ref(null)
const imagePreviewUrl = ref(null)
const isImageChanged = ref(false)

const localProfileData = ref({
  username: '',
  contactNo: '',
  country: '',
  profileImage: ''
})

watch(
  () => props.profileData,
  (data) => {
    if (data) localProfileData.value = { ...data }
  },
  { immediate: true, deep: true }
)

const usernameRules = computed(() => [
  (v) => !!v || t('profile.usernameRequired'),
  (v) => (v && v.length >= 3) || t('profile.usernameMinLength')
])

const contactRules = computed(() => [
  (v) => !!v || t('profile.contactNumberRequired'),
  (v) => /^\d{9,15}$/.test(v) || t('profile.enterValidPhoneNumber')
])

const countryRules = computed(() => [
  (v) => !!v || t('profile.countryRequired')
])

const countryFilter = (title, query, item) =>
  item.raw.name.toLowerCase().includes(query.toLowerCase())

const canSave = computed(() =>
  isValid.value || isImageChanged.value
)

const selectImage = () => {
  fileInput.value?.click()
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file || !file.type.startsWith('image/')) return

  selectedImageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  localProfileData.value.profileImage = imagePreviewUrl.value
  isImageChanged.value = true

  e.target.value = ''
}

const handleSave = async () => {
  const form = formRef.value

  if (
    (!form || !(await form.validate())) &&
    !isImageChanged.value
  ) return

  isSaving.value = true

  try {
    if (isImageChanged.value && selectedImageFile.value) {
      isUploadingImage.value = true
      const url = await props.onUploadImage(selectedImageFile.value)
      localProfileData.value.profileImage = url
    }

    const success = await props.onSave(localProfileData.value)
    if (success) {
      cleanupPreview()
      emit('update:modelValue', false)
    }
  } finally {
    isUploadingImage.value = false
    isSaving.value = false
  }
}

const handleCancel = () => {
  cleanupPreview()
  localProfileData.value = { ...props.profileData }
  emit('update:modelValue', false)
}

const cleanupPreview = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  imagePreviewUrl.value = null
  selectedImageFile.value = null
  isImageChanged.value = false
}
</script>

<style scoped>
.upload-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 2px;
}
</style>
