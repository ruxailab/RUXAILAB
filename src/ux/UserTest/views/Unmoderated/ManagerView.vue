<template>
  <div>
    <!-- ManagerView genérica mantenida -->
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="bottomCards"
    >
      <ManagerDashboardLayout
        v-if="test"
        :test="test"
        :title="test.testTitle || t('manager.dashboard.defaultTitle')"
        :subtitle="
          truncateDescription(test.testDescription) ||
          t('manager.dashboard.defaultTitle')
        "
        icon="mdi-chart-box-outline"
        :type-label="t('manager.dashboard.unmoderatedStudy')"
        type-icon="mdi-account-check-outline"
        :status-icon="getStatusIcon(test.testStatus)"
        :status-text="test.testStatus || t('manager.dashboard.active')"
        :modules-title="t('manager.managementModules.title')"
        :modules-description="t('manager.managementModules.description')"
      >
        <template #overview>
          <StudyOverview :test="test" />
        </template>

        <template #modules>
          <v-col cols="12" md="6">
            <ParticipantsInfo :test="test" />
          </v-col>
          <v-col cols="12" md="6">
            <TasksInfo :test="test" />
          </v-col>

          <!-- Row 2 -->
          <v-col cols="12" md="6">
            <StorageInfo :test="test" />
          </v-col>
          <v-col cols="12" md="6">
            <!-- Empty slot for future components -->
            <v-card
              class="h-100 d-flex align-center justify-center"
              variant="outlined"
              style="min-height: 200px"
            >
              <div class="text-center text-grey-lighten-1">
                <v-icon size="48" class="mb-2">
                  mdi-plus-circle-outline
                </v-icon>
                <p class="text-body-2">
                  {{ t('manager.managementModules.additionalModules') }}
                </p>
              </div>
            </v-card>
          </v-col>
        </template>
      </ManagerDashboardLayout>
    </ManagerView>
  </div>
</template>

<script setup>
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import {
  STUDY_CAPABILITY,
  hasStudyCapability,
} from '@/shared/utils/studyAccessPolicy'
import {
  buildStudyManagerCards,
  buildStudyNavigator,
} from '@/shared/utils/studyNavigation'
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getStatusIcon } from '@/shared/utils/statusUtils'
import { useI18n } from 'vue-i18n'

// Manager components
import StudyOverview from '@/ux/UserTest/components/manager/StudyOverview.vue'
import ParticipantsInfo from '@/ux/UserTest/components/manager/ParticipantsInfo.vue'
import TasksInfo from '@/ux/UserTest/components/manager/TasksInfo.vue'
import StorageInfo from '@/ux/UserTest/components/manager/StorageInfo.vue'

// Stores
const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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
    type: 'userTest/unmoderated',
  }).topCards
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return buildStudyManagerCards({
    study: test.value,
    user: user.value,
    type: 'userTest/unmoderated',
  }).bottomCards
})

const navigator = computed(() => {
  if (!test.value) return []
  return buildStudyNavigator({
    study: test.value,
    user: user.value,
    type: 'userTest/unmoderated',
  })
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
