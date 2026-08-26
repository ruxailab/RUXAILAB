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
        :title="test.testTitle || $t('manager.dashboard.defaultTitle')"
        :subtitle="$t('manager.dashboard.moderatedDescription')"
        icon="mdi-chart-box-outline"
        :type-label="$t('manager.dashboard.moderatedStudy')"
        type-icon="mdi-account-supervisor-circle"
        :status-icon="getStatusIcon(test.status)"
        :status-text="getStatusText(test.status)"
        :modules-title="$t('manager.managementModules.title')"
        :modules-description="$t('manager.managementModules.description')"
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
                  {{ $t('manager.managementModules.additionalModules') }}
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
import {
  buildStudyManagerCards,
  buildStudyNavigator,
} from '@/shared/utils/studyNavigation'
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { getStatusIcon, getStatusText } from '@/shared/utils/statusUtils'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

// Manager components
import StudyOverview from '@/ux/UserTest/components/manager/StudyOverview.vue'
import ParticipantsInfo from '@/ux/UserTest/components/manager/ParticipantsInfo.vue'
import TasksInfo from '@/ux/UserTest/components/manager/TasksInfo.vue'
import StorageInfo from '@/ux/UserTest/components/manager/StorageInfo.vue'

// Stores
const store = useStore()
const route = useRoute()

// Computed
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const topCards = computed(() => {
  if (!test.value) return []
  return buildStudyManagerCards({
    study: test.value,
    user: user.value,
    type: 'userTest/moderated',
  }).topCards
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return buildStudyManagerCards({
    study: test.value,
    user: user.value,
    type: 'userTest/moderated',
  }).bottomCards
})

const navigator = computed(() => {
  if (!test.value) return []
  return buildStudyNavigator({
    study: test.value,
    user: user.value,
    type: 'userTest/moderated',
    previewPath: user.value?.id
      ? `/testview/${test.value.id}/${user.value.id}`
      : null,
  })
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
