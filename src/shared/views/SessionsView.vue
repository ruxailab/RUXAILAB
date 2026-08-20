<template>
  <PageWrapper :title="!showIntroView ? $t('Sessions.title.sessions') : ''">
    <Intro v-if="showIntroView" @close-intro="showIntroComponent = false" />

    <template v-if="!showIntroView" #actions>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateSessionDialog()"
      >
        {{ $t('Sessions.actions.createSession') }}
      </v-btn>
    </template>

    <CreateSessionDialog
      :dialog="createSessionDialog"
      :session="sessionToEdit"
      :participants="participants"
      :participant-limit="1"
      :require-facilitator-and-participant="true"
      @update:dialog="handleSessionDialog"
    />

    <SendSessionMessageDialog
      :dialog="showSendMessageDialog"
      :session="sessionToMessage"
      :study="test"
      @update:dialog="showSendMessageDialog = $event"
    />

    <ConfirmDialog
      :show="showDeleteDialog"
      :title="$t('Sessions.confirm.deleteTitle')"
      :subtitle="sessionToDelete?.title || ''"
      :message="$t('Sessions.confirm.deleteMessage')"
      :confirm-text="$t('Sessions.actions.deleteSession')"
      :cancel-text="$t('Sessions.actions.cancel')"
      confirm-color="error"
      confirm-icon="mdi-delete-outline"
      icon="mdi-alert-circle-outline"
      icon-color="error"
      type="error"
      :loading="loading"
      @update:show="showDeleteDialog = $event"
      @confirm="confirmDeleteSession"
      @cancel="showDeleteDialog = false"
    />

    <v-card v-if="!showIntroView" class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="8" md="8" sm="6">
            <v-text-field
              v-model="filters.search"
              :label="$t('Sessions.filter.search')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
            />
          </v-col>

          <!-- 📅 Session date range filter -->
          <v-col cols="12" lg="4" md="4" sm="6">
            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :label="$t('Sessions.filter.selectRange')"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  readonly
                  prepend-inner-icon="mdi-calendar"
                  clearable
                  :model-value="
                    selectedSessionDateRange.length > 1
                      ? `${new Date(
                          selectedSessionDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          selectedSessionDateRange[
                            selectedSessionDateRange.length - 1
                          ],
                        ).toLocaleDateString()}`
                      : ''
                  "
                  @click:clear="selectedSessionDateRange = []"
                />
              </template>

              <v-date-picker
                v-model="selectedSessionDateRange"
                multiple="range"
              />
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="filteredSessions"
        :loading="loading"
        :items-per-page="10"
        :sort-by="[{ key: 'startDate', order: 'desc' }]"
      >
        <template #item.startDate="{ item }">
          {{ formatDate(item.startDate) }}
        </template>

        <template #item.staff="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="staff in getVisibleMembers(item.staff)"
              :key="staff.userDocId"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ staff.email }}
            </v-chip>

            <v-chip
              v-if="getRemainingMembers(item.staff)"
              size="small"
              color="grey"
              variant="tonal"
            >
              {{ '+' + getRemainingMembers(item.staff) }}
            </v-chip>
          </div>
        </template>

        <template #item.participants="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="participant in getVisibleMembers(item.participants)"
              :key="participant.email"
              size="small"
              color="secondary"
              variant="tonal"
            >
              {{ participant.email }}
            </v-chip>

            <v-chip
              v-if="getRemainingMembers(item.participants)"
              size="small"
              color="grey"
              variant="tonal"
            >
              {{ '+' + getRemainingMembers(item.participants) }}
            </v-chip>
          </div>
        </template>

        <!-- Session -->
        <template #item.session="{ item }">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-if="item"
                v-bind="props"
                variant="text"
                class="ml-1"
                icon
                @click="goToSession(item.id)"
              >
                <v-icon>mdi-file-document-arrow-right</v-icon>
              </v-btn>
            </template>

            <span>{{ $t('cooperator.goToSession') }}</span>
          </v-tooltip>
        </template>

        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
            </template>

            <v-list>
              <v-list-item
                prepend-icon="mdi-pencil-outline"
                :title="$t('Sessions.actions.editSession')"
                @click="openEditSessionDialog(item)"
              />

              <v-list-item
                prepend-icon="mdi-email-outline"
                :title="$t('Sessions.send.title')"
                @click="openSendMessageDialog(item)"
              />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                :title="$t('Sessions.actions.deleteSession')"
                @click="deleteSession(item)"
              />
            </v-list>
          </v-menu>
        </template>

        <template #no-data>
          <v-empty-state
            icon="mdi-monitor-dashboard"
            :title="$t('Sessions.empty.title')"
            :text="$t('Sessions.empty.description')"
          />
        </template>
      </v-data-table>
    </v-card>
  </PageWrapper>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import CreateSessionDialog from '@/shared/components/dialogs/CreateSessionDialog.vue'
import { matchesSearch } from '@/shared/utils/searchUtils'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import { showError, showSuccess } from '@/shared/utils/toast'
import SendSessionMessageDialog from '@/shared/components/dialogs/SendSessionMessageDialog.vue'
import { useRouter, useRoute } from 'vue-router'
import Intro from '@/shared/components/introduction_cards/IntroSessions.vue'

const { t, locale } = useI18n()

const store = useStore()

const router = useRouter()

const route = useRoute()

const createSessionDialog = ref(false)

const test = computed(() => store.getters.test)

const sessions = computed(() => store.getters.sessions)

const loading = computed(() => store.getters.sessionsLoading)

const showDeleteDialog = ref(false)

const sessionToDelete = ref(null)

const sessionToEdit = ref(null)

const filters = ref({
  search: '',
  startAfter: null,
  startBefore: null,
})

const selectedSessionDateRange = ref([])

const showSendMessageDialog = ref(false)
const sessionToMessage = ref(null)

const showIntroComponent = ref(true)

const openSendMessageDialog = (session) => {
  sessionToMessage.value = session
  showSendMessageDialog.value = true
}

const showIntroView = computed(() => {
  return sessions.value.length <= 0 && showIntroComponent.value
})

const participants = computed(() => store.getters.participants)

const headers = computed(() => [
  {
    title: t('Sessions.headers.goToSession'),
    key: 'session',
    sortable: false,
  },
  {
    title: t('Sessions.headers.title'),
    key: 'title',
  },
  {
    title: t('Sessions.headers.start'),
    key: 'startDate',
  },

  {
    title: t('Sessions.headers.staff'),
    key: 'staff',
    sortable: false,
  },
  {
    title: t('Sessions.headers.participants'),
    key: 'participants',
    sortable: false,
  },
  {
    title: t('Sessions.headers.actions'),
    key: 'actions',
    sortable: false,
  },
])

const filteredSessions = computed(() => {
  return (sessions.value || []).filter((session) => {
    if (
      filters.value.search &&
      !matchesSearch(session.title, filters.value.search)
    ) {
      return false
    }

    const sessionDate = session.startDate?.toDate
      ? session.startDate.toDate()
      : new Date(session.startDate)

    if (filters.value.startAfter && sessionDate < filters.value.startAfter) {
      return false
    }

    if (filters.value.startBefore && sessionDate > filters.value.startBefore) {
      return false
    }

    return true
  })
})

const formatDate = (date) => {
  if (!date) return '-'

  if (date?.toDate) {
    date = date.toDate()
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

const MAX_VISIBLE_MEMBERS = 4

const getVisibleMembers = (members = []) => {
  return members.slice(0, MAX_VISIBLE_MEMBERS)
}

const getRemainingMembers = (members = []) => {
  const remaining = members.length - MAX_VISIBLE_MEMBERS

  return remaining > 0 ? remaining : 0
}

const openCreateSessionDialog = () => {
  sessionToEdit.value = null
  createSessionDialog.value = true
}

const openEditSessionDialog = (session) => {
  sessionToEdit.value = session
  createSessionDialog.value = true
}

const handleSessionDialog = (value) => {
  createSessionDialog.value = value
  showIntroComponent.value = false

  if (!value) {
    sessionToEdit.value = null
  }
}

const deleteSession = (session) => {
  sessionToDelete.value = session
  showDeleteDialog.value = true
}

const goToSession = (coopId) => {
  const route = router.resolve(`/testview/${test.value.id}/${coopId}`)
  window.open(route.href, '_blank')
}

const confirmDeleteSession = async () => {
  try {
    await store.dispatch('deleteSession', {
      studyId: test.value.id,
      sessionId: sessionToDelete.value.id,
    })

    showDeleteDialog.value = false
    sessionToDelete.value = null

    showSuccess(t('Sessions.success.deleted'))
  } catch {
    showError(t('Sessions.error.errorDelete'))
  }
}

watch(
  () => test.value?.id,
  async (studyId) => {
    if (!studyId) return

    selectedSessionDateRange.value = []
    await store.dispatch('fetchSessions', studyId)
  },
  {
    immediate: true,
  },
)

watch(loading, (newValue) => {
  if (!newValue) {
    showIntroComponent.value = sessions.value.length === 0
  }
})

watch(selectedSessionDateRange, (range) => {
  if (!range?.length) {
    filters.value.startAfter = null
    filters.value.startBefore = null
    return
  }

  const startDate = new Date(range[0])

  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(range[range.length - 1])

  endDate.setHours(23, 59, 59, 999)

  filters.value.startAfter = startDate
  filters.value.startBefore = endDate
})

onMounted(async () => {
  const studyId = route.params.id

  if (!studyId) {
    return
  }

  await store.dispatch('getStudy', {
    id: studyId,
  })

  await store.dispatch('getStudyParticipants', { studyId })
})
</script>
