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
                        <!-- Small upload indicator overlay -->
                        <v-progress-circular 
                            v-if="isUploadingImage" 
                            indeterminate 
                            color="primary" 
                            size="20"
                            width="2"
                            class="upload-indicator"
                        />
                    </v-avatar>
                    <v-btn icon size="small" class="ml-2" @click="selectImage" :disabled="isUploadingImage">
                        <v-icon>mdi-camera</v-icon>
                    </v-btn>
                    <input ref="fileInput" type="file" accept="image/*" style="display: none"
                        @change="handleImageUpload">
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
                <v-btn variant="text" class="text-capitalize" @click="handleCancel">
                    {{ $t('common.cancel') }}
                </v-btn>
                <v-btn color="primary" variant="flat" class="text-capitalize" :disabled="!isValid || isSaving"
                    :loading="isSaving" @click="handleSave">
                    <v-icon start>mdi-content-save</v-icon>
                    {{ $t('profile.saveChanges') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { countries } from '@/shared/constants/countries';

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
    onUploadImage: {
        type: Function,
        required: true,
    },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const fileInput = ref(null);
const formRef = ref(null);
const isValid = ref(false);
const isSaving = ref(false);
const isUploadingImage = ref(false);

const localProfileData = ref({
    username: '',
    contactNo: '',
    country: '',
    profileImage: '',
});

// Watch for prop changes
watch(
    () => props.profileData,
    (newData) => {
        if (newData) {
            localProfileData.value = { ...newData };
        }
    },
    { immediate: true, deep: true }
);

// Validation rules
const usernameRules = computed(() => [
    (v) => !!v || t('profile.usernameRequired'),
    (v) => (v && v.length >= 3) || t('profile.usernameMinLength'),
]);

const countryRules = computed(() => [(v) => !!v || t('profile.countryRequired')]);

const contactRules = computed(() => [
    (v) => !!v || t('profile.contactNumberRequired'),
    (v) => /^\d{9,15}$/.test(v) || t('profile.enterValidPhoneNumber'),
]);

const selectImage = () => {
    fileInput.value.click();
};

const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('Selected file is not an image');
        return;
    }

    // Warn if file is very large (over 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        console.warn('Large file detected, compressing before upload...');
    }

    try {
        // Create instant preview
        const previewUrl = URL.createObjectURL(file);
        localProfileData.value.profileImage = previewUrl;
        
        // Show uploading state but don't block UI
        isUploadingImage.value = true;
        
        // Upload in background
        const downloadURL = await props.onUploadImage(file, (preview) => {
            // This callback is called immediately with preview
            localProfileData.value.profileImage = preview;
        });
        
        if (downloadURL) {
            // Clean up preview URL
            URL.revokeObjectURL(previewUrl);
            localProfileData.value.profileImage = downloadURL;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
    } finally {
        isUploadingImage.value = false;
        // Reset file input
        if (fileInput.value) {
            fileInput.value.value = '';
        }
    }
};

const handleSave = async () => {
    if (!formRef.value.validate()) return;

    isSaving.value = true;
    const success = await props.onSave(localProfileData.value);
    isSaving.value = false;

    if (success) {
        emit('update:modelValue', false);
    }
};

const handleCancel = () => {
    emit('update:modelValue', false);
};

const countryFilter = (item, queryText) => {
    if (!queryText) return true;

    const text = queryText.toString().toLowerCase();
    const name = typeof item === 'string' ? item : (item?.name || '');

    return name.toString().toLowerCase().includes(text);
};
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
