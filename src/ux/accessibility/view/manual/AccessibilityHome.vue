<template>
  <v-app>
    <v-main>
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
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import CardsManager from '@/shared/components/CardsManager';
import ManagerBanner from '@/shared/components/ManagerBanner.vue';
import { getManualAccessibilityCards } from '@/ux/accessibility/utils/constants';

const route = useRoute();
const router = useRouter();
const { mdAndUp } = useDisplay();
const { t } = useI18n();
const testId = ref(route.params.testId || '');

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

