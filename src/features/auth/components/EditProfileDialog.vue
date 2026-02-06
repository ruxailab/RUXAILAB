<template>
    <v-dialog :model-value="modelValue" max-width="600px" transition="dialog-bottom-transition"
        @update:model-value="$emit('update:modelValue', $event)">
        <v-card class="rounded-xl pa-6" elevation="6">
            <v-card-title class="text-h6 font-weight-bold">
                <v-icon start color="primary">mdi-account-edit</v-icon>
                {{ $t('profile.editProfile') }}
            </v-card-title>
            <v-card-text>
                <div class="text-center mb-6">
                    <v-avatar size="100" class="bg-ternary">
                        <v-img 
                            v-if="localProfileData.profileImage" 
                            :key="localProfileData.profileImage"
                            :src="localProfileData.profileImage" 
                            alt="Profile Image" 
                            cover 
                        >
                            <template #placeholder>
                                <v-progress-circular indeterminate color="primary" />
                            </template>
                        </v-img>
                        <v-icon v-else size="50" color="grey-lighten-1">
                            mdi-account-circle
                        </v-icon>
                    </v-avatar>
                    <div class="mt-2 d-flex justify-center gap-1">
                        <v-btn icon size="small" @click="selectImage" :disabled="isProcessingImage">
                            <v-icon>mdi-image-plus</v-icon>
                            <v-tooltip activator="parent" location="bottom">
                                {{ $t('profile.uploadProfilePicture') }}
                            </v-tooltip>
                        </v-btn>
                        <v-btn icon size="small" @click="showCameraDialog = true" :disabled="isProcessingImage">
                            <v-icon>mdi-camera</v-icon>
                            <v-tooltip activator="parent" location="bottom">
                                {{ $t('profile.takePhoto') }}
                            </v-tooltip>
                        </v-btn>
                        <v-btn 
                            v-if="localProfileData.profileImage" 
                            icon 
                            size="small" 
                            color="error"
                            @click="removeImage"
                            :disabled="isProcessingImage"
                        >
                            <v-icon>mdi-delete</v-icon>
                            <v-tooltip activator="parent" location="bottom">
                                {{ $t('profile.removeProfilePicture') }}
                            </v-tooltip>
                        </v-btn>
                    </div>
                    <input ref="fileInput" type="file" accept="image/*" style="display: none"
                        @change="handleImageSelect">
                    
                    <!-- Camera Capture Dialog -->
                    <CameraCaptureDialog
                        v-model="showCameraDialog"
                        @photo-captured="handleCameraCapture"
                    />
                </div>
                <v-form ref="formRef" v-model="isValid">
                    <v-text-field v-model="localProfileData.username" :label="$t('profile.username')" variant="outlined"
                        density="compact" prepend-inner-icon="mdi-account" :rules="usernameRules"
                        class="mb-4 input-field-transition" />
                    <v-text-field v-model="localProfileData.contactNo" :label="$t('profile.contact')" variant="outlined"
                        density="compact" prepend-inner-icon="mdi-phone" :rules="contactRules"
                        :hint="$t('profile.enterValidPhoneNumber')" persistent-hint class="mb-4 input-field-transition" />
                    <v-autocomplete v-model="localProfileData.country" :label="$t('profile.country')" variant="outlined"
                        density="compact" prepend-inner-icon="mdi-map-marker" :rules="countryRules" :items="countries"
                        item-title="name" item-value="name" :custom-filter="countryFilter" clearable
                        :menu-props="{ maxHeight: '400px' }" class="input-field-transition">
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
                    @click="handleCancel"
                >
                    {{ $t('common.cancel') }}
                </v-btn>
                <span>
                    <v-btn 
                        color="primary" 
                        variant="flat" 
                        class="text-capitalize" 
                        :disabled="!canSave || isSaving"
                        :loading="isSaving" 
                        @click="handleSave"
                    >
                        <v-icon start>mdi-content-save</v-icon>
                        {{ $t('profile.saveChanges') }}
                    </v-btn>
                    <v-tooltip
                        v-if="!canSave && !isSaving"
                        activator="parent"
                        location="top"
                    >
                        <span v-if="!isValid">
                            {{ $t('profile.formInvalid') }}
                        </span>
                        <span v-else-if="!hasChanges">
                            {{ $t('profile.noChanges') }}
                        </span>
                    </v-tooltip>
                </span>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { countries } from '@/shared/constants/countries'
import { showError } from '@/shared/utils/toast'
import CameraCaptureDialog from './CameraCaptureDialog.vue'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  profileData: {
    type: Object,
    required: true,
  },
  onSave: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const fileInput = ref(null)
const formRef = ref(null)
const isValid = ref(false)
const isSaving = ref(false)
const isProcessingImage = ref(false)

// Store pending image file
const pendingImageFile = ref(null)
const pendingImagePreview = ref(null)
const showCameraDialog = ref(false)

const localProfileData = ref({
  username: '',
  contactNo: '',
  country: '',
  profileImage: '',
})

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.profileData) {
      localProfileData.value = { ...props.profileData }
      pendingImageFile.value = null
      if (pendingImagePreview.value) {
        URL.revokeObjectURL(pendingImagePreview.value)
        pendingImagePreview.value = null
      }
    }
  }
)

// Validation rules
const usernameRules = computed(() => [
  (v) => !!v || t('profile.usernameRequired'),
  (v) => (v && v.length >= 3) || t('profile.usernameMinLength'),
])

const countryRules = computed(() => [
  (v) => !!v || t('profile.countryRequired'),
])

const contactRules = computed(() => [
  (v) => !!v || t('profile.contactNumberRequired'),
  (v) => /^\d{9,15}$/.test(v) || t('profile.enterValidPhoneNumber'),
])

const hasChanges = computed(() => {
  if (!props.profileData) return false

  const formChanged =
    localProfileData.value.username !== props.profileData.username ||
    localProfileData.value.contactNo !== props.profileData.contactNo ||
    localProfileData.value.country !== props.profileData.country

  const imageChanged =
    pendingImageFile.value !== null ||
    (localProfileData.value.profileImage === '' &&
     props.profileData.profileImage !== '')

  return formChanged || imageChanged
})

const canSave = computed(() => isValid.value && hasChanges.value)


const validateImageFile = (file) => {
  if (!file.type.startsWith('image/')) {
    return 'profile.invalidFileType'
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'profile.fileTooLarge'
  }

  return null
}

const processImageFile = (file) => {
  const error = validateImageFile(file)
  if (error) {
    showError(error)
    return false
  }

  // Clean up previous preview if exists
  if (pendingImagePreview.value) {
    URL.revokeObjectURL(pendingImagePreview.value)
  }

  // Create preview URL
  const previewUrl = URL.createObjectURL(file)
  
  // Update state
  pendingImagePreview.value = previewUrl
  pendingImageFile.value = file
  localProfileData.value.profileImage = previewUrl

  return true
}

const selectImage = () => {
  fileInput.value.click()
}

const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  try {
    isProcessingImage.value = true
    processImageFile(file)
  } catch (error) {
    console.error('Error processing image:', error)
    showError('profile.imageProcessingError')
  } finally {
    isProcessingImage.value = false
    resetFileInput()
  }
}

const removeImage = () => {
  if (pendingImagePreview.value) {
    URL.revokeObjectURL(pendingImagePreview.value)
    pendingImagePreview.value = null
  }

  pendingImageFile.value = null
  localProfileData.value.profileImage = ''
}


const handleCameraCapture = (file) => {
  try {
    isProcessingImage.value = true
    processImageFile(file)
  } catch (error) {
    console.error('Error processing camera capture:', error)
    showError('profile.imageProcessingError')
  } finally {
    isProcessingImage.value = false
  }
}

const handleSave = async () => {
  try {
    if (!formRef.value) return
    const { valid } = await formRef.value.validate()
    if (!valid) return

    isSaving.value = true

   
    const result = await props.onSave({
      data: localProfileData.value,
      image: pendingImageFile.value ?? null
    })

    if (result) {
      // Clean up preview URL
      if (pendingImagePreview.value) {
        URL.revokeObjectURL(pendingImagePreview.value)
        pendingImagePreview.value = null
      }
      pendingImageFile.value = null
      emit('update:modelValue', false)
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    showError('profile.saveError') 
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  if (pendingImagePreview.value) {
    URL.revokeObjectURL(pendingImagePreview.value)
    pendingImagePreview.value = null
  }
  pendingImageFile.value = null
  emit('update:modelValue', false)
}

const countryFilter = (item, queryText) => {
  if (!queryText) return true

  const text = queryText.toString().toLowerCase()
  const name = typeof item === 'string' ? item : item?.name || ''

  return name.toString().toLowerCase().includes(text)
}
</script>

<style scoped>
/* Removed unused .upload-indicator class */
</style>