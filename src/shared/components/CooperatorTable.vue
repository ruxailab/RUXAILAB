<template>
  <div>
    <!-- Filters Slot -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="filters.search"
          :label="`${$t('cooperators.filter.search')}`"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="filters.role"
          :items="roleOptions"
          item-title="title"
          item-value="title"
          :label="`${$t('cooperators.filter.filterByRole')}`"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="filters.status"
          :items="statusFilterOptions"
          item-title="title"
          item-value="value"
          :label="`${$t('cooperators.filter.filterByStatus')}`"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>
    </v-row>

    <!-- Main Table -->
    <v-card elevation="2" height="100%">
      <v-data-table
        v-model="selectedCooperators"
        :headers="computedHeaders"
        :items="filteredCooperators"
        :items-per-page="itemsPerPage"
        class="cooperators-table"
        item-key="_rowKey"
        item-value="_rowKey"
        height="50vh"
      >
        <!-- Email Column -->
        <template #item.email="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar
              :color="item.avatar ? 'transparent' : 'primary'"
              size="40"
              class="me-3"
            >
              <v-img v-if="item.avatar" :src="item.avatar" :alt="item.email" />

              <span v-else class="text-white font-weight-medium">
                {{ getInitials(item.email) }}
              </span>
            </v-avatar>

            <div>
              <div class="font-weight-medium text-body-1">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Role Column -->
        <template #item.accessLevel="{ item }">
          <v-chip
            :color="
              getRoleColor(
                roleOptions.find((r) => r.value === item.accessLevel)?.title,
              )
            "
            size="small"
            variant="flat"
          >
            <v-icon start size="16">
              {{
                getRoleIcon(
                  roleOptions.find((r) => r.value === item.accessLevel)?.title,
                )
              }}
            </v-icon>

            {{ roleOptions.find((r) => r.value === item.accessLevel)?.title }}
          </v-chip>
        </template>

        <!-- Test Date -->
        <template v-if="showDateColumns" #item.testDate="{ item }">
          <div>{{ formatDate(item.testDate) }}</div>
        </template>

        <!-- Starts at -->
        <template v-if="showDateColumns" #item.testHour="{ item }">
          <div>{{ formatTime(item.testDate) }}</div>
        </template>

        <!-- Invited Column -->
        <template #item.invited="{ item }">
          <v-chip
            :color="item.invited ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            <v-icon>mdi-check</v-icon>
          </v-chip>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- Accepted Date Column -->
        <template #item.acceptedDate="{ item }">
          {{ item.acceptedDate ? formatDate(item.acceptedDate) : '-' }}
        </template>

        <!-- Rejected Date -->
        <template #item.rejectedDate="{ item }">
          {{ item.rejectedDate ? formatDate(item.rejectedDate) : '-' }}
        </template>

        <!-- Expiration Date -->
        <template #item.expirationDate="{ item }">
          {{ item.expirationDate ? formatDate(item.expirationDate) : '-' }}
        </template>

        <!-- Actions Column -->
        <template v-if="showActions" #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-icon icon="mdi-dots-vertical" v-bind="props" />
            </template>

            <v-list>
              <!-- Send message -->
              <v-list-item link @click="onSendMessage(item)">
                <v-list-item-title>
                  {{ messageText || 'Send a message' }}
                </v-list-item-title>
              </v-list-item>

              <!-- Re-invite rejected or expired -->
              <v-list-item
                v-if="
                  item.status == 'pending' ||
                  item.status === 'rejected' ||
                  item.status === 'expired'
                "
                link
                @click="onReinvite(item)"
              >
                <v-list-item-title>
                  {{ reinviteText || 'Re-invite' }}
                </v-list-item-title>
              </v-list-item>

              <!-- Remove accepted cooperator -->
              <v-list-item
                v-if="item.status === 'accepted' && canRemove(item)"
                @click="onRemoveCooperator(item)"
              >
                <v-list-item-title>
                  {{ removeText || 'Remove cooperator' }}
                </v-list-item-title>
              </v-list-item>

              <!-- Cancel pending invitation -->
              <v-list-item
                v-if="item.status === 'pending' && canCancelInvitation(item)"
                @click="onCancelInvitation(item)"
              >
                <v-list-item-title>
                  {{ cancelText || 'Cancel invitation' }}
                </v-list-item-title>
              </v-list-item>

              <!-- Change role -->
              <v-list-item
                v-if="canChangeRole(item) || item.status === 'pending'"
                @click="onRoleChange(item)"
              >
                <v-list-item-title>
                  {{ changeRole || 'Change role' }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils'
import { matchesSearch } from '@/shared/utils/searchUtils'
import { useI18n } from 'vue-i18n'
import { MEMBERSHIP_STATUS } from '../utils/studyAccessPolicy'

const { t } = useI18n()

const props = defineProps({
  cooperators: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },

  showDateColumns: {
    type: Boolean,
    default: false,
  },

  showSessionColumn: {
    type: Boolean,
    default: false,
  },

  showActions: {
    type: Boolean,
    default: true,
  },

  baseHeaders: {
    type: Array,
    default: () => [],
  },

  messageText: {
    type: String,
    default: 'Send a message',
  },

  reinviteText: {
    type: String,
    default: 'Re-invite',
  },

  removeText: {
    type: String,
    default: 'Remove cooperator',
  },

  cancelText: {
    type: String,
    default: 'Cancel invitation',
  },

  changeRole: {
    type: String,
    default: 'Change role',
  },

  hasRoleColumn: {
    type: Boolean,
    default: true,
  },

  roleOptions: {
    type: Array,
    default: () => [],
  },

  assignableRoleOptions: {
    type: Array,
    default: () => [],
  },

  canChangeRole: {
    type: Function,
    default: () => true,
  },

  canRemove: {
    type: Function,
    default: () => true,
  },

  canCancelInvitation: {
    type: Function,
    default: () => true,
  },
})

const emit = defineEmits([
  'role-change',
  'send-message',
  'reinvite',
  'remove-cooperator',
  'cancel-invitation',
  'update:selected-cooperators',
])

const {
  statusFilterOptions,
  getInitials,
  getRoleColor,
  getRoleIcon,
  getStatusColor,
  getStatusText,
  formatDate,
  formatTime,
} = useCooperatorUtils()

const itemsPerPage = ref(10)
const selectedCooperators = ref([])

const filters = ref({
  search: '',
  role: null,
  status: null,
})

const computedHeaders = computed(() => {
  const defaultHeaders = [
    {
      title: t('Participants.headers.email'),
      key: 'email',
      sortable: true,
    },
  ]

  if (props.hasRoleColumn) {
    defaultHeaders.push({
      title: 'Role',
      key: 'accessLevel',
      sortable: true,
    })
  }

  if (props.showDateColumns) {
    defaultHeaders.push(
      {
        title: 'Test Date',
        key: 'testDate',
        sortable: true,
      },
      {
        title: 'Starts at',
        key: 'testHour',
        sortable: true,
      },
    )
  }

  if (props.showSessionColumn) {
    defaultHeaders.push({
      title: 'Session',
      key: 'session',
      sortable: false,
    })
  }

  defaultHeaders.push(
    {
      title: t('Participants.headers.status'),
      key: 'status',
      sortable: true,
    },
    {
      title: t('Participants.headers.acceptedDate'),
      key: 'acceptedDate',
      sortable: true,
    },
    {
      title: t('Participants.headers.rejectedDate'),
      key: 'rejectedDate',
      sortable: true,
    },
    {
      title: t('Participants.headers.expirationDate'),
      key: 'expirationDate',
      sortable: true,
    },
  )

  if (props.showActions) {
    defaultHeaders.push({
      title: t('Participants.headers.actions'),
      key: 'actions',
      sortable: false,
    })
  }

  return props.baseHeaders.length > 0 ? props.baseHeaders : defaultHeaders
})

const getEffectiveStatus = (cooperator) => {
  if (
    cooperator.status === MEMBERSHIP_STATUS.PENDING &&
    cooperator.expirationDate &&
    new Date(cooperator.expirationDate) < new Date()
  ) {
    return MEMBERSHIP_STATUS.EXPIRED
  }

  if (cooperator.status) {
    return cooperator.status
  }

  if (cooperator.accepted) {
    return MEMBERSHIP_STATUS.ACCEPTED
  }

  return MEMBERSHIP_STATUS.PENDING
}

const filteredCooperators = computed(() => {
  let result = props.cooperators.map((coop, index) => ({
    ...coop,

    // Backward compatibility for old records
    status: getEffectiveStatus(coop),

    _rowKey:
      coop.userDocId ||
      coop.token ||
      `${coop.email || 'cooperator'}-${index}-${coop.accessLevel}-${coop.accepted}`,
  }))

  if (filters.value.role) {
    result = result.filter(
      (coop) =>
        props.roleOptions.find((role) => role.value === coop.accessLevel)
          ?.title === filters.value.role,
    )
  }

  if (filters.value.status) {
    result = result.filter((coop) => coop.status === filters.value.status)
  }

  if (filters.value.search) {
    result = result.filter((coop) =>
      matchesSearch(coop.email, filters.value.search),
    )
  }

  return result
})

const onRoleChange = (item) => {
  emit('role-change', item)
}

const onSendMessage = (item) => {
  emit('send-message', item)
}

const onReinvite = (item) => {
  emit('reinvite', item)
}

const onRemoveCooperator = (item) => {
  emit('remove-cooperator', item)
}

const onCancelInvitation = (item) => {
  emit('cancel-invitation', item)
}

watch(
  selectedCooperators,
  (newVal) => {
    emit('update:selected-cooperators', newVal)
  },
  { deep: true },
)
</script>

<style scoped>
.cooperators-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.cooperators-table :deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-grey-50));
}

.cooperators-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 2px solid rgb(var(--v-theme-grey-200));
}

.cooperators-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.cooperators-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
