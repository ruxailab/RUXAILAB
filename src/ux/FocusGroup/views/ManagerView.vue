<template>
  <ManagerView :navigator="navigator" :top-cards="[]" :bottom-cards="[]">
    <ManagerDashboardLayout
      v-if="test"
      :test="test"
      :title="test.testTitle || t('focusGroup.dashboard.typeLabel')"
      :subtitle="test.testDescription || t('focusGroup.dashboard.subtitle')"
      icon="mdi-account-group"
      :type-label="t('focusGroup.dashboard.typeLabel')"
      type-icon="mdi-account-group"
      :status-icon="getStatusIcon(statusValue)"
      :status-text="t(`studyCreation.details.status.${statusValue}`)"
      :modules-title="t('manager.managementModules.title')"
      :modules-description="t('manager.managementModules.description')"
    >
      <template #overview>
        <StudyOverview :test="test" />
      </template>

      <template #modules>
        <!-- Discussion guide -->
        <v-col cols="12" md="6">
          <v-card class="h-100">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>
                <v-icon start color="primary">mdi-format-list-numbered</v-icon>
                {{ t('focusGroup.modules.guideTitle') }}
              </span>
              <v-chip size="small" color="primary" variant="tonal">
                {{ t('focusGroup.modules.topicCount', { count: topicCount }) }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <div v-if="topicCount" class="text-body-2 text-medium-emphasis mb-3">
                {{
                  t('focusGroup.modules.guideDescription', {
                    minutes: totalDuration,
                  })
                }}
              </div>

              <v-list v-if="topicCount" density="compact" class="pa-0">
                <v-list-item
                  v-for="(topic, index) in previewTopics"
                  :key="topic.id || index"
                  class="px-0"
                >
                  <template #prepend>
                    <span class="text-primary font-weight-bold me-3">
                      {{ index + 1 }}
                    </span>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ topic.title || t('focusGroup.modules.untitledTopic') }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>

              <div
                v-if="topicCount > previewTopics.length"
                class="text-caption text-medium-emphasis mt-1"
              >
                {{
                  t('focusGroup.modules.moreTopics', {
                    count: topicCount - previewTopics.length,
                  })
                }}
              </div>

              <div v-if="!topicCount" class="text-body-2 text-medium-emphasis">
                {{ t('focusGroup.modules.guideEmpty') }}
              </div>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" color="primary" size="small" @click="goToEdit">
                <v-icon start size="16">mdi-pencil-outline</v-icon>
                {{ t('focusGroup.modules.manageGuide') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Session configuration -->
        <v-col cols="12" md="6">
          <v-card class="h-100">
            <v-card-title>
              <v-icon start color="primary">mdi-cog-outline</v-icon>
              {{ t('focusGroup.modules.configTitle') }}
            </v-card-title>

            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2">
                  {{ t('focusGroup.modules.maxParticipantsLabel') }}
                </span>
                <span class="text-body-1 font-weight-bold">
                  {{ maxParticipants }}
                </span>
              </div>

              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="flag in configFlags"
                  :key="flag.key"
                  class="px-0"
                >
                  <template #prepend>
                    <v-icon
                      :color="flag.enabled ? 'success' : 'grey'"
                      size="18"
                      class="me-2"
                    >
                      {{ flag.enabled ? 'mdi-check-circle' : 'mdi-minus-circle-outline' }}
                    </v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ t(flag.label) }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" color="primary" size="small" @click="goToSettings">
                <v-icon start size="16">mdi-tune</v-icon>
                {{ t('focusGroup.modules.configure') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Live session (coming soon) -->
        <v-col cols="12" md="6">
          <v-card
            class="h-100 d-flex align-center justify-center"
            variant="outlined"
            style="min-height: 200px"
          >
            <div class="text-center text-grey-lighten-1 pa-4">
              <v-icon size="48" class="mb-2">mdi-video-outline</v-icon>
              <p class="text-subtitle-2 mb-1">
                {{ t('focusGroup.modules.liveSessionTitle') }}
              </p>
              <p class="text-body-2 mb-0">
                {{ t('focusGroup.modules.liveSessionComingSoon') }}
              </p>
            </div>
          </v-card>
        </v-col>

        <!-- Results & reports (coming soon) -->
        <v-col cols="12" md="6">
          <v-card
            class="h-100 d-flex align-center justify-center"
            variant="outlined"
            style="min-height: 200px"
          >
            <div class="text-center text-grey-lighten-1 pa-4">
              <v-icon size="48" class="mb-2">mdi-chart-box-outline</v-icon>
              <p class="text-subtitle-2 mb-1">
                {{ t('focusGroup.modules.reportsTitle') }}
              </p>
              <p class="text-body-2 mb-0">
                {{ t('focusGroup.modules.reportsComingSoon') }}
              </p>
            </div>
          </v-card>
        </v-col>
      </template>
    </ManagerDashboardLayout>
  </ManagerView>
</template>

<script setup>
import ManagerView from '@/shared/views/template/ManagerView.vue'
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import StudyOverview from '@/ux/FocusGroup/components/manager/StudyOverview.vue'
import { ICONS } from '@/shared/constants/theme'
import { getStatusIcon } from '@/shared/utils/statusUtils'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const PREVIEW_TOPIC_LIMIT = 4

const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

// Status chip reflects the study's `status` field (set in Settings).
// Fall back to 'active' for unset/legacy values so the chip always shows a
// valid, translatable status with a real icon (not the ? fallback).
const KNOWN_STATUSES = ['active', 'pending', 'finished', 'upcoming']
const statusValue = computed(() => {
  const status = test.value?.status
  return KNOWN_STATUSES.includes(status) ? status : 'active'
})

const discussionGuide = computed(() =>
  Array.isArray(test.value?.discussionGuide) ? test.value.discussionGuide : [],
)
const topicCount = computed(() => discussionGuide.value.length)
const previewTopics = computed(() =>
  discussionGuide.value.slice(0, PREVIEW_TOPIC_LIMIT),
)
const totalDuration = computed(() =>
  discussionGuide.value.reduce(
    (total, topic) => total + (topic?.durationMinutes || 0),
    0,
  ),
)
const maxParticipants = computed(() => test.value?.config?.maxParticipants ?? '—')

const configFlags = computed(() => {
  const config = test.value?.config || {}
  return [
    {
      key: 'waitingRoom',
      label: 'focusGroup.modules.waitingRoom',
      enabled: config.enableWaitingRoom === true,
    },
    {
      key: 'consent',
      label: 'focusGroup.modules.consent',
      enabled: config.requireConsent === true,
    },
    {
      key: 'backroom',
      label: 'focusGroup.modules.backroom',
      enabled: config.hideObservers === true,
    },
  ]
})

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
      accessLevel.value === ACCESS_LEVEL.GUEST

    if (!hasAccess || accessLevel.value === null) {
      router.push('/')
    }
  }
})

// Trimmed navigator — only routes that exist in the module today.
// Reports / Answers links are added as those views are built.
const navigator = computed(() => {
  if (!test.value) return []
  return [
    {
      title: 'Dashboard',
      icon: ICONS.MANAGER,
      path: `/focusGroup/dashboard/${route.params.id}`,
    },
    {
      title: 'Test',
      icon: ICONS.DOCUMENT_EDIT,
      path: `/focusGroup/edit/${test.value.id}`,
    },
    {
      title: 'Cooperators',
      icon: ICONS.ACCOUNT_GROUP,
      path: `/focusGroup/cooperators/${test.value.id}`,
    },
    {
      title: 'Settings',
      icon: ICONS.COG,
      path: `/focusGroup/settings/${test.value.id}`,
    },
  ]
})

const goToEdit = () => {
  router.push(`/focusGroup/edit/${test.value.id}`).catch(() => {})
}
const goToSettings = () => {
  router.push(`/focusGroup/settings/${test.value.id}`).catch(() => {})
}

onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
})
</script>
