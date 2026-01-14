<template>
  <v-app-bar
    density="comfortable"
    color="#00213F"
    padding="10px !important"
  >
    <v-btn
      v-if="user"
      icon
      class="d-flex d-lg-none"
      @click="toggleDashboardDrawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    
    <!-- Logo y título -->
    <v-toolbar-title
      style="cursor: pointer"
      class="d-flex align-center"
      @click="goTo('/admin')"
    >
      <img
        :src="xs ? logoSmall : logoFull"
        alt="RUXAILAB Logo"
        :height="xs ? '30' : '25'"
        :class="xs ? 'mr-1 align-self-center' : 'mr-3 align-self-center'"
        style="vertical-align: middle;"
      >
    </v-toolbar-title>

    <v-spacer />

    <!-- Theme Toggle Button -->
    <v-btn icon class="mx-1" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <locale-changer />

    <v-btn
      v-if="$route.path === '/' && user"
      variant="text"
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/admin')"
    >
      {{ $t('buttons.goToConsole') }}
    </v-btn>

    <v-btn
      v-if="['/admin', '/signin', '/signup'].includes($route.path)"
      variant="text"
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/')"
    >
      {{ $t('AccessNotAllowed.goHome') }}
    </v-btn>

    <v-btn
      v-if="!['/', '/admin', '/signin', '/signup'].includes($route.path)"
      variant="text"
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/admin')"
    >
      {{ $t('buttons.returnToConsole') }}
    </v-btn>

    <!-- Botones de herramientas -->
    <HelpButton :class="smAndDown ? 'mx-1' : 'mx-2'" />
    <NotificationButton
      v-if="user"
      :class="smAndDown ? 'mx-1' : 'mx-2'"
    />

    <!-- Autenticación -->
    <v-btn
      v-if="!user"
      variant="text"
      class="d-none d-lg-flex"
      @click="goTo('/signin')"
    >
      <v-icon start>
        mdi-lock
      </v-icon>
      {{ $t('auth.SIGNIN.sign-in') }}
    </v-btn>

    <v-btn
      v-if="!user"
      icon
      class="d-flex d-lg-none"
      @click="goTo('/signin')"
    >
      <v-icon :size="iconSize">
        mdi-lock
      </v-icon>
    </v-btn>

    <!-- Menú de usuario -->
    <UserMenu v-if="user" />
  </v-app-bar>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useDisplay, useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import LocaleChanger from '@/features/language/components/LocaleChanger.vue';
import HelpButton from '@/features/navigation/components/HelpButton.vue';
import UserMenu from './UserMenu.vue';
import NotificationButton from './NotificationButton.vue';
import logoFull from "@/assets/logo_full_white.png";
import logoSmall from "@/assets/logo_small_red.png";

// Emits
defineEmits(['toggle-mobile-drawer', 'toggle-dashboard-drawer']);

// Composables
const router = useRouter();
const route = useRoute();
const store = useStore();
const { smAndDown, xs } = useDisplay();
const { t } = useI18n();
const theme = useTheme();

// Computed
const user = computed(() => store.getters.user);
const iconSize = computed(() => smAndDown.value ? '18' : '20');
const isDashboard = computed(() => route.path === '/admin');
const isDark = computed(() => theme.global.name.value === 'myCustomDarkTheme');

// Methods
const goTo = (path) => {
    if (path.includes('/testview')) {
        window.open(path);
    } else {
        router.push(path).catch(() => { });
    }
};

const toggleDashboardDrawer = () => {
    const event = new CustomEvent('toggle-dashboard-drawer');
    window.dispatchEvent(event);
};

const toggleTheme = () => {
  const newTheme = isDark.value ? 'myCustomLightTheme' : 'myCustomDarkTheme';
  // Use the new Vuetify 3 API
  theme.change(newTheme);
  localStorage.setItem('user-theme', newTheme);
};

// Initialize theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('user-theme');
  if (savedTheme === 'myCustomDarkTheme') {
    // Use the new Vuetify 3 API
    theme.change('myCustomDarkTheme');
  }
});
</script>

<style scoped>
.console-button {
    text-transform: none !important;
    letter-spacing: normal !important;
}

:deep(.v-toolbar__content) {
  padding-right: 20px;
  padding-left: 10px;
}

@media (max-width: 600px) {
  :deep(.v-toolbar__content) {
    padding-left: 4px;
    padding-right: 4px;
  }
}
</style>