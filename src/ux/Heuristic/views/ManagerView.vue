<template>
  <div>
    <!-- ManagerView genérica mantenida -->
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="bottomCards"
    >
      <!-- Loading state -->
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
        :title="test.testTitle || $t('Dashboard.managerView.heuristicStudy')"
        :subtitle="
          test.testDescription || $t('Dashboard.managerView.heuristicStudy')
        "
        icon="mdi-clipboard-search-outline"
        :type-label="$t('Dashboard.managerView.heuristicStudy')"
        type-icon="mdi-clipboard-search-outline"
        :status-icon="getStatusIcon(test.testStatus)"
        :status-text="test.testStatus || 'active'"
        :extra-chips="[
          {
            icon: 'mdi-crown-outline',
            label: $t('Dashboard.managerView.freePlan'),
          },
        ]"
        :modules-title="$t('manager.managementModules.title')"
        :modules-description="$t('manager.managementModules.description')"
      >
        <template #overview>
          <StudyOverview :test="test" />
        </template>

        <template #modules>
          <v-col cols="12" md="6">
            <EvaluatorInfoCard :test="test" />
          </v-col>

          <v-col cols="12" md="6">
            <RecentActivity :test="test" @view-all="viewAllActivity" />
          </v-col>

          <v-col cols="12" md="6">
            <CooperatorsInfo :test="test" />
          </v-col>

          <v-col cols="12" md="6">
            <HeuristicsInfo :test="test" />
          </v-col>

          <v-col cols="12" md="6">
            <StorageInfo :test="test" />
          </v-col>

          <v-col cols="12" md="6">
            <UsabilityResults :test="test" />
          </v-col>

          <v-col cols="12" md="6">
            <FinalReportStatus :test="test" />
          </v-col>
        </template>
      </ManagerDashboardLayout>
    </ManagerView>
  </div>
</template>

<script setup>
import {
  getBottomCardsDefualt,
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { getStatusIcon } from '@/shared/utils/statusUtils'
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

// Componentes del manager
import StudyOverview from '@/ux/Heuristic/components/manager/StudyOverview.vue'
import RecentActivity from '@/ux/Heuristic/components/manager/RecentActivity.vue'

import CooperatorsInfo from '@/ux/Heuristic/components/manager/CooperatorsInfo.vue'
import HeuristicsInfo from '@/ux/Heuristic/components/manager/HeuristicsInfo.vue'
import StorageInfo from '@/ux/Heuristic/components/manager/StorageInfo.vue'
import UsabilityResults from '@/ux/Heuristic/components/manager/UsabilityResults.vue'
import FinalReportStatus from '@/ux/Heuristic/components/manager/FinalReportStatus.vue'
import EvaluatorInfoCard from '@/ux/Heuristic/components/manager/EvaluatorInfoCard.vue'

// Stores
const store = useStore()
const route = useRoute()
const router = useRouter()

// Computed
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

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

  if (currentTest?.isPublic) return ACCESS_LEVEL.GUEST
  return null
})

watchEffect(() => {
  if (user.value != null && test.value != null) {
    const hasAccess =
      accessLevel.value === ACCESS_LEVEL.ADMIN ||
      accessLevel.value === ACCESS_LEVEL.EVALUATOR ||
      accessLevel.value === ACCESS_LEVEL.GUEST ||
      accessLevel.value === ACCESS_LEVEL.OBSERVATOR

    if (!hasAccess || accessLevel.value === null) {
      router.push('/')
    }
  }
})

const topCards = computed(() => {
  if (!test.value) return []
  return getTopCardsDefualt(test.value, 'heuristic')
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return getBottomCardsDefualt(test.value, 'heuristic')
})

const navigator = computed(() => {
  if (!test.value) return []
  const items = [
    ...getNavigatorDefault(test.value, accessLevel.value, route, 'heuristic'),
  ]

  if (accessLevel.value === 0 && test.value) {
    items.push({
      title: 'Final Report',
      icon: 'mdi-file-document',
      path: `/heuristic/finalreport/${test.value.id}`,
    })
  }

  if (
    (accessLevel.value === ACCESS_LEVEL.ADMIN ||
      accessLevel.value === ACCESS_LEVEL.SUPER_ADMIN) &&
    test.value
  ) {
    items.push({
      title: 'Evaluator Info',
      icon: 'mdi-book-information-variant',
      path: `/heuristic/evaluatorinfo/${test.value.id}`,
    })
  }

  items.push({
    title: 'Storage',
    icon: 'mdi-database',
    path: `/heuristic/storage/${test.value.id}`,
  })

  return items
})

// Methods para los componentes adicionales
const viewAllActivity = () => {}

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
