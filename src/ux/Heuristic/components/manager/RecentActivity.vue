<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header con icono a la izquierda y título -->
    <div
      class="d-flex align-center mb-4 clickable-header"
      @click="navigateToActivity"
    >
      <v-icon size="24" color="primary" class="header-icon"
        >mdi-timeline-text-outline</v-icon
      >
      <v-card-title class="text-h6 text-primary clickable-title">{{
        $t('Dashboard.cards.recentActivity')
      }}</v-card-title>
    </div>

    <!-- Métrica principal -->
    <div class="main-metric mb-4">
      <div class="metric-subtitle text-caption text-grey-darken-1">
        {{ $t('Dashboard.cards.activities7Days') }}
      </div>
      <div class="metric-value text-h3 font-weight-bold">
        {{ recentActivitiesCount }}
      </div>
      <div class="metric-change text-caption" :class="changeColor">
        {{ activityChange }}
      </div>
    </div>

    <!-- Información adicional -->
    <div class="additional-info">
      <div class="info-subtitle text-caption text-grey-darken-1">
        {{ $t('Dashboard.cards.lastActivity') }}
      </div>
      <div class="info-value text-body-2 font-weight-medium">
        {{ lastActivityTime }}
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS, de, fr, hi, ja, ptBR, ru, zhCN, arSA } from 'date-fns/locale'

const localeMap = {
  en: enUS,
  es: es,
  de: de,
  fr: fr,
  hi: hi,
  ja: ja,
  pt_br: ptBR,
  ru: ru,
  zh: zhCN,
  ar: arSA,
}

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view-all'])
const router = useRouter()
const { t, locale } = useI18n()

const currentLocale = computed(() => {
  return localeMap[locale.value] || enUS
})

// Navigate to activity section
const navigateToActivity = () => {
  if (props.test?.id) {
    router.push(`/heuristic/activity/${props.test.id}`)
  }
}

// Computed properties
const activities = computed(() => {
  const activityList = []

  // Actividades basadas en cooperadores
  if (props.test?.cooperators) {
    props.test.cooperators.forEach((coop) => {
      if (coop.updateDate) {
        activityList.push({
          id: `coop-${coop.userDocId}`,
          title: t('Dashboard.cards.evaluationUpdated'),
          description: `${coop.email} ${t('Dashboard.cards.updatedProgress')}`,
          timeAgo: formatDistanceToNow(new Date(coop.updateDate), {
            addSuffix: true,
            locale: currentLocale.value,
          }),
          color: coop.progress === 100 ? 'success' : 'warning',
          timestamp: new Date(coop.updateDate),
        })
      }

      if (coop.invited && !coop.accepted) {
        activityList.push({
          id: `invite-${coop.userDocId}`,
          title: t('Dashboard.cards.invitationSentTitle'),
          description: `${t('Dashboard.cards.invitationPendingDesc')} ${
            coop.email
          }`,
          timeAgo: t('Dashboard.cards.pendingStatus'),
          color: 'info',
          timestamp: new Date(coop.updateDate || props.test.creationDate),
        })
      }
    })
  }

  // Ordenar por fecha más reciente
  return activityList.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
})

// Computed para las nuevas métricas
const recentActivitiesCount = computed(() => activities.value.length)

const activityChange = computed(() => {
  // Simular cambio porcentual
  return recentActivitiesCount.value > 0 ? '+15%' : '0%'
})

const changeColor = computed(() => {
  return recentActivitiesCount.value > 0 ? 'text-success' : 'text-grey'
})

const lastActivityTime = computed(() => {
  if (activities.value.length === 0) return t('Dashboard.cards.noActivity')
  const lastActivity = activities.value[0]
  return lastActivity.timeAgo
})

// Methods
const viewAll = () => emit('view-all')
</script>

<style scoped>
.main-metric {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.metric-subtitle {
  margin-bottom: 8px;
}

.metric-value {
  line-height: 1;
  margin-bottom: 4px;
}

.metric-change {
  font-weight: 500;
}

.additional-info {
  padding-top: 8px;
}

.info-subtitle {
  margin-bottom: 4px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
}

.clickable-header {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-header:hover .header-icon {
  color: rgb(var(--v-theme-secondary)) !important;
}

.clickable-header:hover .clickable-title {
  color: rgb(var(--v-theme-secondary)) !important;
}

.header-icon {
  transition: color 0.2s ease;
}

.clickable-title {
  transition: color 0.2s ease;
}
</style>
