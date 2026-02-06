<template>
  <div>
    <!-- Filters Slot -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="filters.search"
          :label="$t('HeuristicsCooperators.filters.search_placeholder')"
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
          :label="$t('HeuristicsCooperators.filters.role_label')"
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
          :label="$t('HeuristicsCooperators.filters.status_label')"
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
        :items-per-page-text="$t('common.table.itemsPerPage')"
        :no-data-text="$t('Dashboard.noDataAvailable')"
        class="cooperators-table"
        item-key="email"
        item-value="email"
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
          <v-select
            v-if="hasRoleColumn"
            :ref="'select' + cooperators.indexOf(item)"
            :key="dataTableKey"
            :model-value="item.accessLevel"
            :items="roleOptions"
            item-title="title"
            return-object
            density="comfortable"
            :disabled="!item.invited || item.accepted ? false : true"
            variant="plain"
            @update:model-value="onRoleChange(item, $event)"
          >
            <template #selection="{ item: selectedItem }">
              <v-chip
                :color="getRoleColor(selectedItem.value)"
                size="small"
                variant="flat"
              >
                <v-icon start size="16">
                  {{ getRoleIcon(selectedItem.value) }}
                </v-icon>
                {{ selectedItem.title }}
              </v-chip>
            </template>
          </v-select>
        </template>

        <!-- Test Date (only for accessibility tests) -->
        <template v-if="showDateColumns" #item.testDate="{ item }">
          <div>{{ formatDate(item.testDate) }}</div>
        </template>

        <!-- Starts at (only for accessibility tests) -->
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

        <!-- Accepted Column -->
        <template #item.accepted="{ item }">
          <v-chip
            :color="getStatusColor(item.accepted)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.accepted) }}
          </v-chip>
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
                @click="goToSession(item.userDocId)"
              >
                <v-icon>mdi-file-document-arrow-right</v-icon>
              </v-btn>
            </template>
            <span>{{
              $t('HeuristicsCooperators.messages.go_to_session')
            }}</span>
          </v-tooltip>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-icon icon="mdi-dots-vertical" v-bind="props" />
            </template>
            <v-list>
              <v-list-item link @click="onSendMessage(item)">
                <v-list-item-title>
                  {{ messageText || 'Send a message' }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.accepted == false"
                link
                @click="onReinvite(item)"
              >
                <v-list-item-title>
                  {{ reinviteText || 'Re-invite' }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.accepted"
                @click="onRemoveCooperator(item)"
              >
                <v-list-item-title>
                  {{ removeText || 'Remove cooperator' }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.invited && !item.accepted"
                @click="onCancelInvitation(item)"
              >
                <v-list-item-title>
                  {{ cancelText || 'Cancel invitation' }}
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
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useStore()
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
  baseHeaders: {
    type: Array,
    default: () => [],
  },
  // Text customization props
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
  hasRoleColumn: {
    type: Boolean,
    default: true,
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

// Use composables
const {
  roleOptions,
  statusFilterOptions,
  getInitials,
  getRoleColor,
  getRoleIcon,
  getStatusColor,
  getStatusText,
  formatDate,
  formatTime,
} = useCooperatorUtils()

// Local state
const dataTableKey = ref(0)
const itemsPerPage = ref(10)
const selectedCooperators = ref([])

const filters = ref({
  search: '',
  role: null,
  status: null,
})

// Computed properties
const study = computed(() => store.getters.test)

const computedHeaders = computed(() => {
  const defaultHeaders = [
    {
      title: t('HeuristicsCooperators.headers.email'),
      key: 'email',
      sortable: true,
    },
  ]

  if (props.hasRoleColumn) {
    defaultHeaders.push({
      title: t('HeuristicsCooperators.headers.role'),
      key: 'accessLevel',
      sortable: true,
    })
  }

  if (props.showDateColumns) {
    defaultHeaders.push(
      {
        title: t('HeuristicsCooperators.headers.test_date'),
        key: 'testDate',
        sortable: true,
      },
      {
        title: t('HeuristicsCooperators.headers.starts_at'),
        key: 'testHour',
        sortable: true,
      },
    )
  }

  if (props.showSessionColumn) {
    defaultHeaders.push({
      title: t('HeuristicsCooperators.headers.session'),
      key: 'session',
      sortable: false,
    })
  }

  defaultHeaders.push(
    {
      title: t('HeuristicsCooperators.headers.invited'),
      key: 'invited',
      sortable: true,
    },
    {
      title: t('HeuristicsCooperators.headers.status'),
      key: 'accepted',
      sortable: true,
    },
    {
      title: t('HeuristicsCooperators.headers.actions'),
      key: 'actions',
      sortable: false,
    },
  )

  return props.baseHeaders.length > 0 ? props.baseHeaders : defaultHeaders
})

const filteredCooperators = computed(() => {
  let result = [...props.cooperators]

  if (filters.value.role) {
    result = result.filter(
      (coop) =>
        roleOptions.value.find((r) => r.value === coop.accessLevel)?.title ===
        filters.value.role,
    )
  }

  if (filters.value.status) {
    const { status } = filters.value
    result = result.filter((coop) => {
      if (status === 'accepted') return coop.accepted
      if (status === 'invited' || status === 'pending')
        return coop.invited && !coop.accepted
      return true
    })
  }

  if (filters.value.search) {
    result = result.filter((coop) =>
      coop.email.toLowerCase().includes(filters.value.search.toLowerCase()),
    )
  }

  return result
})

// Event handlers
const onRoleChange = (item, newValue) => {
  emit('role-change', item, newValue)
  dataTableKey.value++
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

// Watch for selected cooperators changes
watch(
  selectedCooperators,
  (newVal) => {
    emit('update:selected-cooperators', newVal)
  },
  { deep: true },
)

// Methods
const goToSession = (coopId) => {
  router.push(`/testview/${study.value.id}/${coopId}`)
}
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
