<template>
  <PageWrapper :title="$t('Sessions.title.sessions')">
    <template #actions>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="createSessionDialog = true"
      >
        {{ $t('Sessions.actions.createSession') }}
      </v-btn>
    </template>

    <CreateSessionDialog
      :dialog="createSessionDialog"
      @update:dialog="createSessionDialog = $event"
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

    <v-card class="mt-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
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

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.startAfter"
              type="datetime-local"
              :label="$t('Sessions.filter.startsAfter')"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.startBefore"
              type="datetime-local"
              :label="$t('Sessions.filter.startsBefore')"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="filteredSessions"
        :loading="loading"
        :items-per-page="10"
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

        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
            </template>

            <v-list>
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
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import CreateSessionDialog from '@/shared/components/dialogs/CreateSessionDialog.vue'
import { matchesSearch } from '@/shared/utils/searchUtils'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import { showError, showSuccess } from '@/shared/utils/toast'

const { t } = useI18n()

const store = useStore()

const createSessionDialog = ref(false)

const test = computed(() => store.getters.test)

const sessions = computed(() => store.getters.sessions)

const loading = computed(() => store.getters.sessionsLoading)

const showDeleteDialog = ref(false)

const sessionToDelete = ref(null)

const filters = ref({
  search: '',
  startAfter: null,
  startBefore: null,
})

const headers = computed(() => [
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

    const sessionDate = new Date(session.startDate)

    if (
      filters.value.startAfter &&
      sessionDate < new Date(filters.value.startAfter)
    ) {
      return false
    }

    if (
      filters.value.startBefore &&
      sessionDate > new Date(filters.value.startBefore)
    ) {
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

  return new Intl.DateTimeFormat(undefined, {
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

const deleteSession = (session) => {
  sessionToDelete.value = session
  showDeleteDialog.value = true
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

    await store.dispatch('fetchSessions', studyId)
  },
  {
    immediate: true,
  },
)
</script>
