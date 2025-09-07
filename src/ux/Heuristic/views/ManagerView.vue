<template>
  <div>
    <!-- Loading state -->
    <div v-if="!test" class="d-flex justify-center align-center" style="min-height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>
    
    <!-- Dashboard profesional con componentes específicos -->
    <v-container v-else class="large-margins">
      <!-- Primera fila: Título del proyecto con chip al lado -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center gap-3">
            <h1 class="text-h4">{{ test.testTitle || 'Estudio Heurístico' }}</h1>
            <v-chip class="ml-5" color="info" variant="outlined" size="small">
              <v-icon start size="small">mdi-crown-outline</v-icon>
              Plan Gratuito
            </v-chip>
          </div>
        </v-col>
      </v-row>
      
      <!-- Divider -->
      <v-divider class="mb-6"></v-divider>
      
      <!-- Título de estadísticas -->
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5">Estadísticas Generales</h2>
        </v-col>
      </v-row>
            <v-divider class="mb-6"></v-divider>

      <!-- Las 4 cards de métricas -->
      <v-row>
        <v-col cols="12">
          <StudyOverview :test="test" />
        </v-col>
      </v-row>
      
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5">Módulos</h2>
        </v-col>
      </v-row>
      <v-divider class="mb-6"></v-divider>

      <!-- Fila con 3 módulos -->
      <v-row>
        <!-- Módulo 1: Actividad reciente -->
        <v-col cols="12" md="4">
          <RecentActivity 
            :test="test"
            @view-all="viewAllActivity"
          />
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
      <v-row class="mb-2">
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

    <!-- Separador visual -->
    
      <!-- ManagerView genérica mantenida -->
   <ManagerView
        :navigator="navigator"
        :top-cards="topCards"
        :bottom-cards="bottomCards"
      />
  </div>
</template>

<script setup>
import { getBottomCardsDefualt, getNavigatorDefault, getTopCardsDefualt } from '@/shared/utils/managerDefault';
import ManagerView from '@/shared/views/template/ManagerView.vue';
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

// Componentes del manager
import StudyOverview from '@/ux/Heuristic/components/manager/StudyOverview.vue';
import RecentActivity from '@/ux/Heuristic/components/manager/RecentActivity.vue';
import ParticipantsList from '@/ux/Heuristic/components/manager/ParticipantsList.vue';
import CooperatorsInfo from '@/ux/Heuristic/components/manager/CooperatorsInfo.vue';
import HeuristicsInfo from '@/ux/Heuristic/components/manager/HeuristicsInfo.vue';
import StorageInfo from '@/ux/Heuristic/components/manager/StorageInfo.vue';
import UsabilityResults from '@/ux/Heuristic/components/manager/UsabilityResults.vue';
import FinalReportStatus from '@/ux/Heuristic/components/manager/FinalReportStatus.vue';

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
  if (currentTest?.testAdmin?.userDocId === currentUser.id) return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(c => c.userDocId === currentUser.id)
  if (coop) return coop.accessLevel

  return currentTest?.isPublic ? ACCESS_LEVEL.GUEST : ACCESS_LEVEL.EVALUATOR
})

// Computed properties para el estado del estudio
const studyCompletionRate = computed(() => {
  if (!test.value?.cooperators?.length) return 0
  const completed = test.value.cooperators.filter(c => c?.progress === 100).length
  return Math.round((completed / test.value.cooperators.length) * 100)
})

const studyStatusText = computed(() => {
  if (!test.value) return 'Cargando...'
  const rate = studyCompletionRate.value
  if (rate === 100) return 'Completado'
  if (rate > 0) return 'En Progreso'
  return 'Pendiente'
})

const studyStatusColor = computed(() => {
  if (!test.value) return 'grey'
  const rate = studyCompletionRate.value
  if (rate === 100) return 'success'
  if (rate > 0) return 'warning'
  return 'info'
})

const studyStatusIcon = computed(() => {
  if (!test.value) return 'mdi-loading'
  const rate = studyCompletionRate.value
  if (rate === 100) return 'mdi-check-circle'
  if (rate > 0) return 'mdi-clock'
  return 'mdi-play-circle'
})

// Mantener la lógica genérica original
const topCards = computed(() => {
  if (!test.value) return []
  const cards = getTopCardsDefualt(test.value, 'heuristic')
  console.log('TopCards:', cards)
  return cards
})
const bottomCards = computed(() => {
  if (!test.value) return []
  const cards = getBottomCardsDefualt(test.value, 'heuristic')
  console.log('BottomCards:', cards)
  return cards
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

  console.log('Navigator:', items)
  console.log('Test data:', test.value)
  console.log('AccessLevel:', accessLevel.value)
  return items
})

// Methods para los componentes adicionales
const viewAllActivity = () => {
  console.log('View all activity')
}

const inviteParticipant = () => {
  if (!test.value?.id) return
  router.push(`/heuristic/cooperators/${test.value.id}`)
}

const viewParticipant = (participant) => {
  console.log('View participant:', participant)
}

const sendReminder = (participant) => {
  console.log('Send reminder to:', participant)
}

const removeParticipant = (participant) => {
  console.log('Remove participant:', participant)
}

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
</style>
