/**
* GlobalToolbar.vue
* Navbar superior global - solo contiene logo, usuario y botones globales
*/
<template>
    <v-app-bar density="comfortable" color="#00213F" class="px-4">
        <!-- Botón hamburguesa móvil -->
        <v-btn v-if="user && isDashboard" icon class="d-flex d-lg-none" @click="toggleDashboardDrawer">
            <v-icon>mdi-menu</v-icon>
        </v-btn>

        <!-- Botón hamburguesa móvil para otras vistas -->
        <v-btn v-if="user && !isDashboard" icon class="d-flex d-lg-none" @click="$emit('toggle-mobile-drawer')">
            <v-icon>mdi-menu</v-icon>
        </v-btn>

        <!-- Logo y título -->
        <v-toolbar-title style="cursor: pointer" class="d-flex align-center" @click="goTo('/testslist')">
            <img src="@/assets/ruxailab-long-crop-white.png" alt="RUXAILAB Logo" height="25"
                class="mr-3 align-self-center" style="vertical-align: middle;" />
        </v-toolbar-title>

        <v-spacer />

        <!-- Elementos globales -->
        <locale-changer />

        <!-- Botones contextuales -->
        <v-btn v-if="$route.path === '/' && user" variant="text" color="#f9a826"
            class="console-button mx-1 d-none d-lg-flex" @click="goTo('/testslist')">
            {{ $t('buttons.goToConsole') }}
        </v-btn>

        <v-btn v-if="['/testslist', '/signin', '/signup'].includes($route.path)" variant="text" color="#f9a826"
            class="console-button mx-1 d-none d-lg-flex" @click="goTo('/')">
            {{ $t('AccessNotAllowed.goHome') }}
        </v-btn>

        <v-btn v-if="!['/', '/testslist', '/signin', '/signup'].includes($route.path)" variant="text" color="#f9a826"
            class="console-button mx-1 d-none d-lg-flex" @click="goTo('/testslist')">
            {{ $t('buttons.returnToConsole') }}
        </v-btn>

        <!-- Botones de herramientas -->
        <HelpButton :class="smAndDown ? 'mx-1' : 'mx-2'" />
        <NotificationBtn v-if="user" :class="smAndDown ? 'mx-1' : 'mx-2'" />

        <!-- Autenticación -->
        <v-btn v-if="!user" variant="text" class="d-none d-lg-flex" @click="goTo('/signin')">
            <v-icon start>mdi-lock</v-icon>
            {{ $t('SIGNIN.sign-in') }}
        </v-btn>

        <v-btn v-if="!user" icon class="d-flex d-lg-none" @click="goTo('/signin')">
            <v-icon :size="iconSize">mdi-lock</v-icon>
        </v-btn>

        <!-- Menú de usuario -->
        <UserMenu v-if="user" />
    </v-app-bar>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import LocaleChanger from '@/components/atoms/LocaleChanger.vue';
import NotificationBtn from '@/components/atoms/NotificationButton.vue';
import HelpButton from '@/components/atoms/HelpButton.vue';
import UserMenu from './UserMenu.vue';

// Emits
defineEmits(['toggle-mobile-drawer', 'toggle-dashboard-drawer']);

// Composables
const router = useRouter();
const route = useRoute();
const store = useStore();
const { smAndDown } = useDisplay();
const { t } = useI18n();

// Computed
const user = computed(() => store.getters.user);
const iconSize = computed(() => smAndDown.value ? '18' : '20');
const isDashboard = computed(() => route.path === '/testslist');

// Methods
const goTo = (path) => {
    if (path.includes('/testview')) {
        window.open(path);
    } else {
        router.push(path).catch(() => { });
    }
};

const toggleDashboardDrawer = () => {
    // Emitir evento para que lo capture el layout o componente padre
    const event = new CustomEvent('toggle-dashboard-drawer');
    window.dispatchEvent(event);
};
</script>

<style scoped>
.console-button {
    text-transform: none !important;
    letter-spacing: normal !important;
}
</style>
