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
        :status-icon="getStatusIcon(test.testStatus)"
        :status-text="
          test.testStatus
            ? $t(`manager.dashboard.${test.testStatus}`)
            : $t('manager.dashboard.active')
        "
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
  getBottomCardsDefualt,
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'
import ManagerDashboardLayout from '@/shared/components/manager/ManagerDashboardLayout.vue'
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { getStatusIcon } from '@/shared/utils/statusUtils'
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

const topCards = computed(() => {
  if (!test.value) return []
  return getTopCardsDefualt(test.value, 'userTest/moderated')
})

const bottomCards = computed(() => {
  if (!test.value) return []
  return getBottomCardsDefualt(test.value, 'userTest/moderated')
})

const navigator = computed(() => {
  if (!test.value) return []
  const items = [
    ...getNavigatorDefault(
      test.value,
      accessLevel.value,
      route,
      'userTest/moderated',
    ),
  ]

  items.push({
    title: 'Storage',
    icon: 'mdi-database',
    path: `/userTest/moderated/storage/${test.value.id}`,
  })

  for (const item of items) {
    if (item.title === 'Preview') {
      item.path = `/testview/${test.value.id}/${user.value.id}`
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
