<template>
  <PageWrapper 
    title="Automated Accessibility Testing"
    :side-gap="false"
  >
    <!-- Manager-style Header (uses same image as ManagerView) -->
    <div class="h-64">
      <ManagerBanner />
    </div>
    <!-- Cards section using CardsManager so it matches ManagerView UI -->
    <v-container class="card-container pt-6 pb-10">
      <p class="presentation-text text-center text-md-left mb-4">
        Browse accessibility tools and actions
      </p>
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import CardsManager from '@/shared/components/CardsManager'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import { getAccessibilityNavItems, imageMap, getDescription } from '@/ux/accessibility/utils/constants'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const testId = ref(route.params.testId || '')

// Navigation items for the dashboard cards
const navItems = computed(() => getAccessibilityNavItems(testId.value))

const managerCards = computed(() =>
  navItems.value.map((item) => ({
    image: imageMap[item.title.toLowerCase()] || 'IntroManager.svg',
    title: item.title,
    titleDirect: item.title,
    imageStyle: '',
    bottom: '#000',
    description: item.title,
    descriptionDirect: getDescription(item.title),
    cardStyle: '',
    path: item.path,
  })),
)


const go = (path) => {
  router.push(path).catch(() => { })
}
</script>
