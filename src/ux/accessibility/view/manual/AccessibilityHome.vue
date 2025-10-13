<template>
  
    <!-- Manager-style Header (uses same image as ManagerView) -->
    <div class="h-64 w-full">
      <ManagerBanner />
    </div>
    <v-container class="card-container pt-6 pb-10">
      <p class="presentation-text text-center text-md-left mb-4">
        {{ $t('accessibility.description') }}
      </p>
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
    </v-container>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import CardsManager from '@/shared/components/CardsManager';
import ManagerBanner from '@/shared/components/ManagerBanner.vue';
import { ICONS, createCardConfig } from '@/shared/constants/theme';
import { hasAdminAccess } from '@/ux/accessibility/utils/accessControl';
import { getCurrentUser } from '@/ux/accessibility/utils/getCurrentUser';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { mdAndUp } = useDisplay();
const { t } = useI18n();
const testId = ref(route.params.id || '');
const userRole = ref(null);

// Get user role based on access control rules
const checkUserRole = async () => {
  try {
    // Use centralized getCurrentUser utility
    const currentUser = await getCurrentUser(store);
    
    if (!currentUser) {
      console.log('AccessibilityHome - No current user available');
      return 'user';
    }
    
    // Wait for study data to be loaded if not already available
    let studyData = null;
    if (store.getters.test) {
      studyData = store.getters.test;
    } else if (store.state.Study && store.state.Study.Test) {
      studyData = store.state.Study.Test;
    } else if (store.state.Test) {
      studyData = store.state.Test;
    }
    
    // If no study data, try to fetch it
    if (!studyData && testId.value) {
      console.log('AccessibilityHome - Fetching study data for:', testId.value);
      try {
        await store.dispatch('getStudy', { id: testId.value });
        studyData = store.getters.test || store.state.Study?.Test || store.state.Test;
      } catch (err) {
        console.error('AccessibilityHome - Error fetching study:', err);
      }
    }
    
    if (!studyData) {
      console.log('AccessibilityHome - No study data available');
      return 'user';
    }
    
    console.log('AccessibilityHome - Study data:', studyData);
    console.log('AccessibilityHome - Current user:', currentUser);
    console.log('AccessibilityHome - Current user.id:', currentUser.id);
    console.log('AccessibilityHome - Current user.uid:', currentUser.uid);
    console.log('AccessibilityHome - Test admin:', studyData.testAdmin);
    console.log('AccessibilityHome - Cooperators:', studyData.cooperators);
    
    // Use simple admin check from utility
    const isAdmin = hasAdminAccess(currentUser, studyData);
    console.log('AccessibilityHome - Has admin access:', isAdmin);
    return isAdmin ? 'admin' : 'user';
  } catch (error) {
    console.error('AccessibilityHome - Error getting user role:', error);
    return 'user';
  }
};

onMounted(async () => {
  userRole.value = await checkUserRole();
  console.log('AccessibilityHome - User role:', userRole.value);
  console.log('AccessibilityHome - Will show', userRole.value === 'admin' ? 'ALL' : 'LIMITED', 'cards');
});

// Direct manual accessibility cards implementation
const manualAccessibilityCardsConfig = [
  {
    titleKey: 'titles.manager',
    icon: ICONS.HOME,
    subtitleKey: 'descriptions.edit',
    descriptionKey: 'descriptions.edit',
    route: '',
    theme: 'MANAGER',
    requiresAdmin: false,
  },
  {
    titleKey: 'titles.test',
    icon: ICONS.SETTINGS,
    subtitleKey: 'accessibility.cards.config.subtitle',
    descriptionKey: 'accessibility.cards.config.description',
    routeKey: 'config',
    theme: 'CONFIG',
    requiresAdmin: true,
  },
  {
    titleKey: 'titles.test',
    icon: ICONS.EDIT,
    subtitleKey: 'descriptions.edit',
    descriptionKey: 'accessibility.cards.edit.description',
    routeKey: 'edit',
    theme: 'EDIT',
    requiresAdmin: true,
  },
  {
    titleKey: 'titles.preview',
    icon: ICONS.VIEW,
    subtitleKey: 'descriptions.reports',
    descriptionKey: 'descriptions.reports',
    routeKey: 'preview',
    theme: 'PREVIEW',
    requiresAdmin: false,
  },
  {
    titleKey: 'titles.answers',
    icon: ICONS.QUESTIONS,
    subtitleKey: 'descriptions.answers',
    descriptionKey: 'descriptions.answers',
    routeKey: 'result',
    theme: 'ANSWERS',
    requiresAdmin: true,
  },
  {
    titleKey: 'titles.cooperators',
    icon: ICONS.USERS,
    subtitleKey: 'descriptions.cooperators',
    descriptionKey: 'descriptions.cooperators',
    routeKey: 'cooperative',
    theme: 'COOPERATORS',
    requiresAdmin: true,
  },
];

// Path generators
const createPathGenerators = (testId) => ({
  config: () => `/accessibility/manual/config/${testId}`,
  edit: () => `/accessibility/manual/edit/${testId}`,
  preview: () => `/accessibility/manual/preview/${testId}`,
  result: () => `/accessibility/manual/result/${testId}`,
  cooperative: () => `/accessibility/manual/cooperative/${testId}`,
});

const getManualAccessibilityCards = (t, testId, userRole) => {
  const paths = createPathGenerators(testId);

  // Filter cards based on user role
  let filteredConfigs = manualAccessibilityCardsConfig;
  if (userRole !== 'admin') {
    // For cooperators and regular users, only show non-admin cards
    filteredConfigs = manualAccessibilityCardsConfig.filter(config => !config.requiresAdmin);
    console.log('AccessibilityHome - Filtered cards for non-admin:', filteredConfigs.map(c => c.titleKey));
  } else {
    console.log('AccessibilityHome - Showing all cards for admin');
  }

  return filteredConfigs.map(config => {
    const cardTheme = createCardConfig(config.theme);

    return {
      title: t(config.titleKey),
      icon: config.icon,
      subtitle: t(config.subtitleKey),
      description: t(config.descriptionKey),
      route: config.routeKey ? paths[config.routeKey]() : config.route,
      ...cardTheme,
    };
  });
};

const cards = computed(() => getManualAccessibilityCards(t, testId.value, userRole.value));

const managerCards = computed(() =>
  cards.value.map((c) => ({
    image: c.image,
    title: c.title,
    titleDirect: (c.title || '').toString(),
    imageStyle: c.imageStyle || '',
    bottom: '#000',
    description: c.subtitle || c.description,
    descriptionDirect: (c.subtitle || c.description || '').toString(),
    cardStyle: c.cardStyle || '',
    path: c.route,
  }))
);

const go = (path) => {
  router.push(path).catch(() => { });
};
</script>

