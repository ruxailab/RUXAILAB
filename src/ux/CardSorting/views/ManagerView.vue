<template>
  <div>
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="bottomCards"
    >
      <div
        v-if="!test"
        class="d-flex justify-center align-center"
        style="min-height: 400px"
      >
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <ManagerDashboardLayout
        v-else
        :test="test"
        :title="test.testTitle || $t('CardSorting.title')"
        :subtitle="
          truncateDescription(test.testDescription) || $t('CardSorting.title')
        "
        icon="mdi-cards"
        :type-label="$t('CardSorting.title')"
        type-icon="mdi-cards"
        :status-icon="getStatusIcon(test.status)"
        :status-text="getStatusText(test.status) || 'active'"
        :modules-title="$t('manager.managementModules.title')"
        :modules-description="$t('manager.managementModules.description')"
      >
        <template #overview>
          <CardSortingOverview :test="test" />
        </template>

        <template #modules>
          <v-col cols="12" md="6">
            <CardSortingInfo :test="test" />
          </v-col>
        </template>
      </ManagerDashboardLayout>
    </ManagerView>
  </div>
</template>

<script setup>
import ManagerView from '@/shared/views/template/ManagerView.vue'
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import CardSortingOverview from '../components/manager/CardSortingOverview.vue'
import CardSortingInfo from '../components/manager/CardSortingInfo.vue'
import { getStatusIcon, getStatusText } from '@/shared/utils/statusUtils'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import {
  buildStudyManagerCards,
  buildStudyNavigator,
} from '@/shared/utils/studyNavigation'

// Stores
const store = useStore()
const route = useRoute()

// Computed
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const truncateDescription = (description) => {
  if (!description || description.length <= 150) return description
  return `${description.slice(0, 147)}...`
}

const managerCards = computed(() => {
  if (!test.value) return { topCards: [], bottomCards: [] }
  return buildStudyManagerCards({
    study: test.value,
    user: user.value,
    type: 'cardSorting',
  })
})

const topCards = computed(() => managerCards.value.topCards)

const bottomCards = computed(() => managerCards.value.bottomCards)

const navigator = computed(() => {
  if (!test.value) return []
  return buildStudyNavigator({
    study: test.value,
    user: user.value,
    type: 'cardSorting',
  })
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
