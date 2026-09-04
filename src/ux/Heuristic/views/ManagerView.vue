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
          truncateDescription(test.testDescription) ||
          $t('Dashboard.managerView.heuristicStudy')
        "
        icon="mdi-clipboard-search-outline"
        :type-label="$t('Dashboard.managerView.heuristicStudy')"
        type-icon="mdi-clipboard-search-outline"
        :status-icon="getStatusIcon(test.status)"
        :status-text="getStatusText(test.status) || 'active'"
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
  buildStudyManagerCards,
  buildStudyNavigator,
} from '@/shared/utils/studyNavigation'
import {
  STUDY_CAPABILITY,
  hasStudyCapability,
} from '@/shared/utils/studyAccessPolicy'
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { getStatusIcon, getStatusText } from '@/shared/utils/statusUtils'
import { computed, watch, watchEffect } from 'vue'
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

const truncateDescription = (description) => {
  if (!description || description.length <= 150) return description
  return `${description.slice(0, 147)}...`
}

watchEffect(() => {
  if (user.value != null && test.value != null) {
    if (
      !hasStudyCapability(
        test.value,
        user.value,
        STUDY_CAPABILITY.DASHBOARD_VIEW,
      )
    ) {
      router.push('/')
    }
  }
})

const topCards = computed(() => {
  if (!test.value) return []
  return buildStudyManagerCards({
    study: test.value,
    user: user.value,
    type: 'heuristic',
  }).topCards
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return buildStudyManagerCards({
    study: test.value,
    user: user.value,
    type: 'heuristic',
  }).bottomCards
})

const navigator = computed(() => {
  if (!test.value) return []
  return buildStudyNavigator({
    study: test.value,
    user: user.value,
    type: 'heuristic',
  })
})

// Methods para los componentes adicionales
const viewAllActivity = () => {}

let studyLoadVersion = 0

const loadStudy = async (studyId) => {
  const loadVersion = ++studyLoadVersion
  store.commit('CLEAN_TEST')
  store.commit('CLEAR_HEURISTIC_STATE')

  if (!studyId) return

  const study = await store.dispatch('getStudy', { id: studyId })
  if (loadVersion !== studyLoadVersion || !study) return

  await store.dispatch('getCurrentTestAnswerDoc')
}

watch(
  () => route.params.id,
  (studyId) => loadStudy(studyId),
  { immediate: true },
)
</script>
