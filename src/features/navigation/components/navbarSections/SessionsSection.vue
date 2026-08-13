<template>
  <!-- 🔍 Search + Filters for sessions -->
  <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
    <div class="d-flex align-center mb-3 flex-wrap button-bar">
      <v-text-field
        v-model="searchSessions"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        variant="outlined"
        :placeholder="t('pages.sessions.searchPlaceholder')"
        class="flex-grow-1"
      />

      <v-btn
        color="primary"
        class="search-btn"
        prepend-icon="mdi-filter-remove"
        :disabled="!hasActiveSessionFilters"
        @click="resetSessionFilters"
      >
        {{ t('pages.sessions.reset') }}
      </v-btn>

      <v-btn
        :color="showFilters ? 'primary' : 'grey'"
        variant="tonal"
        icon
        size="small"
        @click="toggleFilters"
      >
        <v-icon>
          {{ showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant' }}
        </v-icon>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-show="showFilters">
        <v-row dense>
          <!-- Ownership filter -->
          <v-col cols="12" sm="6" md="4">
            <div class="filter-label">
              {{ t('pages.sessions.ownership') }}
            </div>

            <v-select
              v-model="selectedSessionOwnershipFilter"
              :items="ownershipOptions"
              item-title="text"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- Date filter -->
          <v-col cols="12" sm="6" md="4">
            <div class="filter-label">
              {{ t('pages.sessions.sessionDate') }}
            </div>

            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  readonly
                  variant="outlined"
                  density="compact"
                  hide-details
                  :placeholder="
                    selectedSessionDateRange.length > 1
                      ? `${new Date(
                          selectedSessionDateRange[0],
                        ).toLocaleDateString()} - ${new Date(
                          selectedSessionDateRange[
                            selectedSessionDateRange.length - 1
                          ],
                        ).toLocaleDateString()}`
                      : t('pages.sessions.selectRange')
                  "
                  prepend-inner-icon="mdi-calendar"
                />
              </template>

              <v-date-picker
                v-model="selectedSessionDateRange"
                multiple="range"
              />
            </v-menu>
          </v-col>

          <!-- Status filter -->
          <v-col cols="12" sm="6" md="4">
            <div class="filter-label">
              {{ t('pages.sessions.statusLabel') }}
            </div>

            <v-select
              v-model="selectedSessionStatusFilter"
              :items="sessionStatusOptions"
              item-title="text"
              item-value="value"
              multiple
              chips
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-card>

  <!-- Session list -->
  <List
    v-if="filteredSessions.length > 0"
    :items="filteredSessions"
    type="sessions"
    :sort-by="[{ key: 'scheduledAt', order: 'desc' }]"
    @clicked="goTo"
  />

  <!-- Empty state -->
  <div v-else class="empty-state">
    <div v-if="hasActiveSessionFilters">
      <v-icon
        icon="mdi-magnify-remove-outline"
        size="48"
        color="grey-lighten-1"
        class="mb-2"
      />

      <div class="text-h6 mt-2">
        {{ t('common.table.noSearchResults') }}
      </div>

      <div class="text-body-2">
        {{ t('common.table.tryAdjustingSearch') }}
      </div>
    </div>

    <div v-else>
      <v-icon
        icon="mdi-clock-remove-outline"
        size="48"
        color="grey-lighten-1"
        class="mb-2"
      />

      <p class="text-h6">
        {{ t('pages.sessions.noActiveSessions') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import List from '@/shared/components/tables/ListComponent.vue'
import { getSessionStatus } from '@/shared/utils/sessionsUtils'
import { matchesSearch } from '@/shared/utils/searchUtils'

const { t } = useI18n()

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
})

const store = useStore()
const router = useRouter()

const user = computed(() => store.getters.user)

const showFilters = ref(false)
const searchSessions = ref('')

const selectedSessionOwnershipFilter = ref('all')
const selectedSessionStatusFilter = ref(['all'])
const selectedSessionDateRange = ref([])

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const ownershipOptions = computed(() => [
  {
    value: 'all',
    text: t('pages.sessions.filters.allStudies'),
  },
  {
    value: 'whereICollaborate',
    text: t('pages.sessions.filters.whereICollaborate'),
  },
  {
    value: 'whereIParticipate',
    text: t('pages.sessions.filters.whereIParticipate'),
  },
])

const sessionStatusOptions = computed(() => [
  {
    value: 'all',
    text: t('pages.sessions.filters.allStatuses'),
  },
  {
    value: 'today',
    text: t('pages.sessions.filters.today'),
  },
  {
    value: 'upcoming',
    text: t('pages.sessions.filters.upcoming'),
  },
  {
    value: 'completed',
    text: t('pages.sessions.filters.completed'),
  },
])

const resetSessionFilters = () => {
  searchSessions.value = ''
  selectedSessionOwnershipFilter.value = 'all'
  selectedSessionStatusFilter.value = ['all']
  selectedSessionDateRange.value = []
}

const hasActiveSessionFilters = computed(() => {
  return (
    searchSessions.value.length > 0 ||
    selectedSessionOwnershipFilter.value !== 'all' ||
    (selectedSessionStatusFilter.value.length > 1 &&
      !selectedSessionStatusFilter.value.includes('all')) ||
    selectedSessionDateRange.value.length > 0
  )
})

const getSessionOwnership = (session) => {
  const currentId = user.value?.id
  const currentEmail = user.value?.email?.toLowerCase()

  const isStaff = session.staff?.some(
    (staff) =>
      staff.userDocId === currentId ||
      staff.email?.toLowerCase() === currentEmail,
  )

  const isParticipant = session.participants?.some(
    (participant) =>
      participant.userDocId === currentId ||
      participant.email?.toLowerCase() === currentEmail,
  )

  if (isStaff) {
    return 'whereICollaborate'
  }

  if (isParticipant) {
    return 'whereIParticipate'
  }

  return 'other'
}

const filteredSessions = computed(() => {
  return props.sessions.filter((session) => {
    const matchesSearchQuery = matchesSearch(
      `${session.title || ''} ${session.study?.title || ''}`,
      searchSessions.value,
    )

    const status = getSessionStatus(session.scheduledAt).status

    const matchesStatus =
      selectedSessionStatusFilter.value.includes('all') ||
      selectedSessionStatusFilter.value.includes(status)

    const ownership = getSessionOwnership(session)

    const matchesOwnership =
      selectedSessionOwnershipFilter.value === 'all' ||
      selectedSessionOwnershipFilter.value === ownership

    let matchesDate = true

    if (selectedSessionDateRange.value.length > 1 && session.scheduledAt) {
      const sessionDate = new Date(session.scheduledAt)

      const start = new Date(selectedSessionDateRange.value[0])

      const end = new Date(
        selectedSessionDateRange.value[
          selectedSessionDateRange.value.length - 1
        ],
      )

      matchesDate = sessionDate >= start && sessionDate <= end
    }

    return (
      matchesSearchQuery && matchesStatus && matchesOwnership && matchesDate
    )
  })
})

const goTo = (session) => {
  const route = router.resolve(`/testview/${session.study.id}/${session.id}`)
  window.open(route.href, '_blank')
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.button-bar {
  gap: 14px;
}

.search-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  color: #475569;
}
</style>
