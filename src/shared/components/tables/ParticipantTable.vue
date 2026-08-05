<template>
  <div>
    <!-- Filters Slot -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filters.search"
          :label="$t('Participants.filter.search')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="filters.status"
          :items="statusFilterOptions"
          item-title="title"
          item-value="value"
          :label="$t('Participants.filter.filterByStatus')"
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
        :headers="computedHeaders"
        :items="filteredParticipants"
        :items-per-page="itemsPerPage"
        :loading="loading"
        class="participants-table"
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

              <div v-if="item.name" class="text-caption text-grey-darken-1">
                {{ item.name }}
              </div>
            </div>
          </div>
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

        <!-- Accepted Date -->
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

        <!-- Actions -->
        <template v-if="showActions" #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-icon icon="mdi-dots-vertical" v-bind="props" />
            </template>

            <v-list>
              <!-- Send Message -->
              <v-list-item link @click="onSendMessage(item)">
                <v-list-item-title>
                  {{ messageText || $t('Participants.actions.send_message') }}
                </v-list-item-title>
              </v-list-item>

              <!-- Re-invite -->
              <v-list-item
                v-if="item.status != MEMBERSHIP_STATUS.ACCEPTED"
                link
                @click="onReinvite(item)"
              >
                <v-list-item-title>
                  {{ reinviteText }}
                </v-list-item-title>
              </v-list-item>

              <!-- Remove -->
              <v-list-item
                v-if="
                  item.status === MEMBERSHIP_STATUS.ACCEPTED && canRemove(item)
                "
                @click="onRemoveParticipant(item)"
              >
                <v-list-item-title>
                  {{
                    removeText || $t('Participants.actions.remove_participant')
                  }}
                </v-list-item-title>
              </v-list-item>

              <!-- Cancel Invitation -->
              <v-list-item
                v-if="
                  item.status === MEMBERSHIP_STATUS.PENDING &&
                  canCancelInvitation(item)
                "
                @click="onCancelInvitation(item)"
              >
                <v-list-item-title>
                  {{
                    cancelText || $t('Participants.actions.cancel_invitation')
                  }}
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
import { ref, computed } from 'vue'
import { matchesSearch } from '@/shared/utils/searchUtils'
import { useI18n } from 'vue-i18n'
import { MEMBERSHIP_STATUS } from '../../utils/studyAccessPolicy'
import { getStatusColor, getStatusText } from '../../utils/statusUtils'

const { t } = useI18n()

const props = defineProps({
  participants: {
    type: Array,
    default: () => [],
  },

  loading: {
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
    default: '',
  },

  reinviteText: {
    type: String,
    default: '',
  },

  removeText: {
    type: String,
    default: '',
  },

  cancelText: {
    type: String,
    default: '',
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
  'send-message',
  'reinvite',
  'remove-participant',
  'cancel-invitation',
])

const itemsPerPage = ref(10)

const filters = ref({
  search: '',
  status: null,
})

const statusFilterOptions = computed(() => [
  {
    title: t('Participants.status.pending'),
    value: MEMBERSHIP_STATUS.PENDING,
  },
  {
    title: t('Participants.status.accepted'),
    value: MEMBERSHIP_STATUS.ACCEPTED,
  },
  {
    title: t('Participants.status.expired'),
    value: MEMBERSHIP_STATUS.EXPIRED,
  },
  {
    title: t('Participants.status.rejected'),
    value: MEMBERSHIP_STATUS.REJECTED,
  },
])
const computedHeaders = computed(() => {
  const defaultHeaders = [
    {
      title: t('Participants.headers.email'),
      key: 'email',
      sortable: true,
    },
  ]

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

const getParticipantStatus = (participant) => {
  if (
    participant.status === MEMBERSHIP_STATUS.PENDING &&
    participant.expirationDate &&
    new Date(participant.expirationDate).getTime() < Date.now()
  ) {
    return MEMBERSHIP_STATUS.EXPIRED
  }

  if (participant.status) {
    return participant.status
  }

  if (participant.acceptedDate) {
    return MEMBERSHIP_STATUS.ACCEPTED
  }

  return MEMBERSHIP_STATUS.PENDING
}

const filteredParticipants = computed(() => {
  let result = props.participants.map((participant, index) => ({
    ...participant,

    // Use the persisted status when available.
    // Fallback for legacy participants without status.
    status: getParticipantStatus(participant),

    _rowKey: participant.id || `${participant.email || 'participant'}-${index}`,
  }))

  if (filters.value.status) {
    result = result.filter(
      (participant) => participant.status === filters.value.status,
    )
  }

  if (filters.value.search) {
    result = result.filter(
      (participant) =>
        matchesSearch(participant.email, filters.value.search) ||
        matchesSearch(participant.name, filters.value.search),
    )
  }

  return result
})

const getInitials = (email) => {
  if (!email) {
    return '?'
  }

  return email.split('@')[0].slice(0, 2).toUpperCase()
}

const formatDate = (date) => {
  if (!date) {
    return '-'
  }

  if (date?.toDate) {
    date = date.toDate()
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(date))
}

const onSendMessage = (item) => {
  emit('send-message', item)
}

const onReinvite = (item) => {
  emit('reinvite', item)
}

const onRemoveParticipant = (item) => {
  emit('remove-participant', item)
}

const onCancelInvitation = (item) => {
  emit('cancel-invitation', item)
}
</script>

<style scoped>
.participants-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.participants-table :deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-grey-50));
}

.participants-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 2px solid rgb(var(--v-theme-grey-200));
}

.participants-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.participants-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
