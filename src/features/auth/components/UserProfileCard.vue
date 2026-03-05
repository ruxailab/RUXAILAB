<template>
    <v-card class="rounded-xl pa-6" elevation="4">
        <v-card-text class="text-center">
            <v-avatar size="120" class="mb-4 bg-ternary">
                <v-img 
                    v-if="userprofile.profileImage" 
                    :key="userprofile.profileImage"
                    :src="userprofile.profileImage" 
                    alt="Profile Image" 
                    cover 
                >
                    <template #placeholder>
                        <v-progress-circular indeterminate color="primary" size="40" />
                    </template>
                </v-img>
                <v-icon v-else size="60" color="grey-lighten-1">
                    mdi-account-circle
                </v-icon>
            </v-avatar>
            <h2 class="text-h6 font-weight-bold mb-2">
                {{ userprofile.username || $t('profile.title') }}
            </h2>
            <v-chip size="small" color="primary" class="mb-6">
                {{ $t('profile.admin') }}
            </v-chip>

            <v-divider class="my-4" />

            <v-list density="compact">
                <v-list-item
v-for="(item, index) in profileItems" :key="index"
                    class="rounded-lg pa-2 list-item-transition">
                    <v-list-item-subtitle class="text-caption text-uppercase text-grey-darken-1">
                        <v-icon size="small" color="grey-darken-1">
                            {{ item.icon }}
                        </v-icon>
                        {{ item.label }}:
                    </v-list-item-subtitle>
                    <v-list-item-title
v-if="!loading" :class="{
                        'font-italic text-error': !item.value,
                        'font-weight-medium': item.value,
                    }">
                        {{ item.value || $t('profile.missingInfo') }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    userprofile: {
        type: Object,
        required: true,
    },
    userEmail: {
        type: String,
        default: '',
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const { t } = useI18n();

const profileItems = computed(() => [
    {
        label: t('profile.username'),
        value: props.userprofile.username,
        icon: 'mdi-account',
    },
    {
        label: t('profile.email'),
        value: props.userEmail,
        icon: 'mdi-email',
    },
    {
        label: t('profile.contact'),
        value: props.userprofile.contactNo,
        icon: 'mdi-phone',
    },
    {
        label: t('profile.country'),
        value: props.userprofile.country,
        icon: 'mdi-map-marker',
    },
]);
</script>
