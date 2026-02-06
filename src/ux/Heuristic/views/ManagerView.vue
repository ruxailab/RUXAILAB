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

      <!-- Dashboard profesional con componentes específicos -->
      <v-container v-else class="large-margins">
        <!-- Primera fila: Título del proyecto con chip al lado -->
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center gap-3">
              <h1 class="text-h4">
                {{
                  test.testTitle || $t('Dashboard.managerView.heuristicStudy')
                }}
              </h1>
              <v-chip class="ml-5" color="info" variant="outlined" size="small">
                <v-icon start size="small"> mdi-crown-outline </v-icon>
                {{ $t('Dashboard.managerView.freePlan') }}
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <!-- Divider -->
        <v-divider class="mb-6" />

        <!-- Título de estadísticas -->
        <v-row>
          <v-col cols="12">
            <h2 class="text-h5">
              {{ $t('Dashboard.managerView.generalStatistics') }}
            </h2>
          </v-col>
        </v-row>
        <v-divider class="mb-6" />

        <!-- Las 4 cards de métricas -->
        <v-row>
          <v-col cols="12">
            <StudyOverview :test="test" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h2 class="text-h5">
              {{ $t('Dashboard.managerView.modules') }}
            </h2>
          </v-col>
        </v-row>
        <v-divider class="mb-6" />

        <!-- Fila con 3 módulos -->
        <v-row class="modules-section">
          <!-- Módulo 1: Actividad reciente -->
          <v-col cols="12" md="4">
            <RecentActivity :test="test" @view-all="viewAllActivity" />
          </v-col>

          <!-- Módulo 2: Cooperadores -->
          <v-col cols="12" md="4">
            <CooperatorsInfo :test="test" />
          </v-col>

          <!-- Módulo 3: Información de heurísticas -->
          <v-col cols="12" md="4">
            <HeuristicsInfo :test="test" />
          </v-col>
        </v-row>

        <!-- Segunda fila con 3 módulos -->
        <v-row class="mb-2 modules-section">
          <!-- Módulo 4: Storage -->
          <v-col cols="12" md="4">
            <StorageInfo :test="test" />
          </v-col>

          <!-- Módulo 5: Resultados de Usabilidad -->
          <v-col cols="12" md="4">
            <UsabilityResults :test="test" />
          </v-col>

          <!-- Módulo 6: Estado del Informe Final -->
          <v-col cols="12" md="4">
            <FinalReportStatus :test="test" />
          </v-col>
        </v-row>
      </v-container>
    </ManagerView>
  </div>
</template>

<script setup>
import {
  getBottomCardsDefualt,
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

// Componentes del manager
import StudyOverview from '@/ux/Heuristic/components/manager/StudyOverview.vue'
import RecentActivity from '@/ux/Heuristic/components/manager/RecentActivity.vue'

import CooperatorsInfo from '@/ux/Heuristic/components/manager/CooperatorsInfo.vue'
import HeuristicsInfo from '@/ux/Heuristic/components/manager/HeuristicsInfo.vue'
import StorageInfo from '@/ux/Heuristic/components/manager/StorageInfo.vue'
import UsabilityResults from '@/ux/Heuristic/components/manager/UsabilityResults.vue'
import FinalReportStatus from '@/ux/Heuristic/components/manager/FinalReportStatus.vue'

// Stores
const store = useStore()
const route = useRoute()

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
  if (coop) return coop.accessLevel

  return currentTest?.isPublic ? ACCESS_LEVEL.EVALUATOR : ACCESS_LEVEL.GUEST
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

<style scoped>
.large-margins {
  margin-left: auto !important;
  margin-right: auto !important;
  width: 70% !important;
  max-width: none !important;
}

@media (max-width: 1200px) {
  .large-margins {
    width: 80% !important;
  }
}

@media (max-width: 960px) {
  .large-margins {
    width: 90% !important;
  }

  .d-flex.gap-3 {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px !important;
  }
}

@media (max-width: 600px) {
  .large-margins {
    width: 96% !important;
  }
}

/* Solo igualar alturas de los módulos, no las cards de estadísticas */
.modules-section :deep(.v-card) {
  height: 300px;
}
</style>
