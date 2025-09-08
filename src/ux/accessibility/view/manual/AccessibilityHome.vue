<template>
  <PageWrapper 
    title="Manual Accessibility Testing"
    :side-gap="false"
  >
    <!-- Manager-style Header (uses same image as ManagerView) -->
    <div class="h-64">
      <ManagerBanner />
    </div>
    <!-- Cards section using CardsManager so it matches ManagerView UI -->
    <v-container class="card-container pt-6 pb-10">
      <p class="presentation-text text-center text-md-left mb-4">
        {{ $t('accessibility.description') }}
      </p>
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import CardsManager from '@/shared/components/CardsManager';
import ManagerBanner from '@/shared/components/ManagerBanner.vue';
import { ICONS, createCardConfig } from '@/shared/constants/theme';

const route = useRoute();
const router = useRouter();
const { mdAndUp } = useDisplay();
const { t } = useI18n();
const testId = ref(route.params.testId || '');

// Direct manual accessibility cards implementation
const manualAccessibilityCardsConfig = [
  {
    titleKey: 'titles.manager',
    icon: ICONS.HOME,
    subtitleKey: 'descriptions.edit',
    descriptionKey: 'descriptions.edit',
    route: '',
    theme: 'MANAGER',
  },
  {
    titleKey: 'titles.test',
    icon: ICONS.SETTINGS,
    subtitleKey: 'accessibility.cards.config.subtitle',
    descriptionKey: 'accessibility.cards.config.description',
    routeKey: 'config',
    theme: 'CONFIG',
  },
  {
    titleKey: 'titles.test',
    icon: ICONS.EDIT,
    subtitleKey: 'descriptions.edit',
    descriptionKey: 'accessibility.cards.edit.description',
    routeKey: 'edit',
    theme: 'EDIT',
  },
  {
    titleKey: 'titles.preview',
    icon: ICONS.VIEW,
    subtitleKey: 'descriptions.reports',
    descriptionKey: 'descriptions.reports',
    routeKey: 'preview',
    theme: 'PREVIEW',
  },
  {
    titleKey: 'titles.answers',
    icon: ICONS.QUESTIONS,
    subtitleKey: 'descriptions.answers',
    descriptionKey: 'descriptions.answers',
    routeKey: 'result',
    theme: 'ANSWERS',
  },
  {
    titleKey: 'titles.cooperators',
    icon: ICONS.USERS,
    subtitleKey: 'descriptions.cooperators',
    descriptionKey: 'descriptions.cooperators',
    routeKey: 'cooperative',
    theme: 'COOPERATORS',
  },
];

// Path generators
const createPathGenerators = (testId) => ({
  accessibility: (page) => `/accessibility/automatic/${testId}/${page}`.replace('//', '/'),
  analyse: () => `/accessibility/automatic/analyse/${testId}`,
  answers: () => `/accessibility/automatic/answers/${testId}`,
  reports: () => `/accessibility/automatic/reports/${testId}`,
  settings: () => `/accessibility/automatic/settings/${testId}`,
  config: () => `/accessibility/manual/config/${testId}`,
  edit: () => `/accessibility/manual/edit/${testId}`,
  preview: () => `/accessibility/manual/preview/${testId}`,
  result: () => `/accessibility/manual/result/${testId}`,
  cooperative: () => `/accessibility/manual/cooperative/${testId}`,
});

const getManualAccessibilityCards = (t, testId) => {
  const paths = createPathGenerators(testId);

  return manualAccessibilityCardsConfig.map(config => {
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

const cards = ref(getManualAccessibilityCards(t, testId.value));

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

