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
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { getStatusIcon, getStatusText } from '@/shared/utils/statusUtils'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import {
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'
import { createCardConfig } from '@/shared/constants/theme'

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

const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value

  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  if (coop?.accepted === true) return coop.accessLevel

  return currentTest?.isPublic ? ACCESS_LEVEL.EVALUATOR : ACCESS_LEVEL.GUEST
})

const topCards = computed(() => getTopCardsDefualt(test.value, 'cardSorting'))

const bottomCards = computed(() => {
  if (!test.value) return []
  return [
    {
      ...createCardConfig('PREVIEW'),
      title: 'reports',
      bottom: '#000',
      description: 'reports',
      path: `/cardSorting/report/${test.value.id}`,
    },
    {
      ...createCardConfig('ANSWERS'),
      title: 'answers',
      bottom: '#000',
      description: 'answers',
      path: `/cardSorting/answer/${test.value.id}`,
    },
  ]
})

const navigator = computed(() => {
  const items = getNavigatorDefault(
    test.value,
    accessLevel.value,
    route,
    'cardSorting',
  )

  for (const item of items) {
    if (item.title === 'Preview') {
      item.path = `/cardSorting/test/${test.value.id}`
    }
  }

  return items
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
