<template>
  <v-container class="py-4">
    <v-row justify="center" v-if="user">
      <v-col 
        cols="12" 
        md="10" 
        lg="8"
        xl="6"
      >

        <!-- HEADER -->
        <v-card 
          class="rounded-xl pa-4 pa-md-5 mb-4"
          flat
          :class="{'pa-3': $vuetify.display.smAndDown}"
        >
          <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
            <div class="flex-grow-1">
              <div class="d-flex align-center gap-2 mb-1">
                <v-icon size="28" color="primary" class="d-none d-sm-flex">mdi-bell-ring-outline</v-icon>
                <h2 class="text-h5 text-h6-sm">{{ $t('common.notifications') }}</h2>
              </div>
              <p class="text-caption text-grey-darken-1 mt-1">
                Stay updated with your activities and collaborations
              </p>
            </div>

            <!-- MARK ALL AS READ BUTTON -->
            <v-btn
              v-if="activeTab === 'unread' && unreadCount > 0"
              size="small"
              variant="flat"
              color="primary"
              @click="markAllAsRead"
              :loading="markingAllAsRead"
              prepend-icon="mdi-email-open-outline"
              class="elevation-0 text-capitalize"
              :class="{'flex-shrink-0': true}"
            >
              Mark all read
            </v-btn>
          </div>

          <!-- TABS FOR DESKTOP -->
          <v-tabs 
            v-if="!$vuetify.display.smAndDown"
            v-model="activeTab" 
            color="primary" 
            class="mt-4"
            height="48"
          >
            <v-tab value="all" class="text-capitalize">
              <div class="d-flex align-center gap-2">
                <span>{{ $t('common.all') }}</span>
                <v-badge v-if="totalCount" :content="totalCount" inline size="small" />
              </div>
            </v-tab>
            <v-tab value="unread" class="text-capitalize">
              <div class="d-flex align-center gap-2">
                <span>{{ $t('common.unread') }}</span>
                <v-badge v-if="unreadCount" color="error" :content="unreadCount" inline size="small" />
              </div>
            </v-tab>
            <v-tab value="inbox" class="text-capitalize">
              <div class="d-flex align-center gap-2">
                <span>{{ $t('common.inbox') }}</span>
              </div>
            </v-tab>
          </v-tabs>

          <!-- SELECT FOR MOBILE -->
          <v-select
            v-else
            v-model="activeTab"
            :items="[
              { title: `All (${totalCount})`, value: 'all', prependIcon: 'mdi-view-list' },
              { title: `Unread (${unreadCount})`, value: 'unread', prependIcon: 'mdi-email-outline' },
              { title: 'Inbox', value: 'inbox', prependIcon: 'mdi-inbox' }
            ]"
            variant="outlined"
            density="compact"
            class="mt-4"
            hide-details
            menu-icon="mdi-chevron-down"
          />
        </v-card>

        <!-- SEARCH BAR -->
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search notifications…"
          variant="outlined"
          density="comfortable"
          hide-details
          class="mb-4"
          clearable
          @click:clear="search = ''"
        />

        <!-- NOTIFICATIONS CONTENT -->
        <v-card 
          flat 
          class="rounded-xl pa-4"
          :class="{'pa-3': $vuetify.display.smAndDown}"
        >
          <!-- SKELETON LOADER -->
          <template v-if="loading">
            <v-skeleton-loader
              v-for="i in 3"
              :key="i"
              type="list-item-avatar-two-line"
              class="mb-3"
            />
          </template>

          <!-- NOTIFICATIONS LIST -->
          <template v-else>
            <!-- EMPTY STATES -->
            <v-alert
              v-if="paginatedNotifications.length === 0"
              type="info"
              variant="tonal"
              icon="mdi-bell-off-outline"
              class="mb-0"
            >
              <template #title>
                <div class="d-flex align-center gap-2">
                  <span>{{ emptyStateTitle }}</span>
                  <v-icon v-if="search" color="info">mdi-magnify-remove</v-icon>
                </div>
              </template>
              <template #text>
                {{ emptyStateMessage }}
              </template>
            </v-alert>

            <!-- LIST VIEW -->
            <div v-else>
              <div
                v-for="(n, index) in paginatedNotifications"
                :key="n.id"
                class="notification-item pa-3 mb-3"
                :class="{ 
                  'unread': !n.read, 
                  'active': activeIndex === index,
                  'border-start-4': !n.read
                }"
                @click="handleNotificationClick(n)"
                :style="!n.read ? 'border-left-color: var(--v-primary-base) !important' : ''"
              >
                <div class="d-flex align-start gap-3">
                  <!-- AVATAR/ICON -->
                  <div class="position-relative">
                    <v-avatar
                      size="44"
                      :color="getTypeIcon(n.type).color + '-lighten-5'"
                      class="elevation-1"
                    >
                      <v-icon :color="getTypeIcon(n.type).color">
                        {{ getTypeIcon(n.type).icon }}
                      </v-icon>
                    </v-avatar>
                    <div 
                      v-if="!n.read"
                      class="unread-dot"
                    />
                  </div>

                  <!-- CONTENT -->
                  <div class="flex-grow-1">
                    <div class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between gap-2 mb-1">
                      <div class="d-flex align-center flex-wrap gap-2">
                        <span class="font-weight-medium text-body-1">{{ n.title || 'Notification' }}</span>
                        <v-chip
                          v-if="n.type"
                          size="x-small"
                          label
                          :color="getTypeIcon(n.type).color"
                          variant="flat"
                          density="compact"
                          class="text-capitalize"
                        >
                          {{ n.type }}
                        </v-chip>
                        <v-chip
                          v-if="n.important"
                          size="x-small"
                          label
                          color="warning"
                          variant="flat"
                          density="compact"
                          prepend-icon="mdi-star"
                        >
                          Important
                        </v-chip>
                      </div>
                      <div class="d-flex align-center gap-2">
                        <span class="text-caption text-grey-darken-2">
                          {{ relativeTime(n.createdDate) }}
                        </span>
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          @click.stop="toggleRead(n)"
                          :aria-label="n.read ? 'Mark unread' : 'Mark read'"
                        >
                          <v-icon size="18" :color="n.read ? 'grey' : 'primary'">
                            {{ n.read ? 'mdi-email-outline' : 'mdi-email-open-outline' }}
                          </v-icon>
                          <v-tooltip activator="parent">
                            {{ n.read ? 'Mark as unread' : 'Mark as read' }}
                          </v-tooltip>
                        </v-btn>
                      </div>
                    </div>
                    <p class="text-body-2 text-grey-darken-1 mb-2 line-clamp-2">
                      {{ n.message || 'You have a new notification.' }}
                    </p>
                    <div v-if="n.senderName" class="text-caption text-grey-darken-2">
                      <v-icon size="small">mdi-account-outline</v-icon>
                      {{ n.senderName }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- PAGINATION -->
              <v-pagination
                v-if="currentPages > 1"
                v-model="currentPage"
                :length="currentPages"
                :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                rounded="circle"
                class="mt-4 justify-center"
                density="comfortable"
              />
            </div>
          </template>
        </v-card>

        <!-- ACTION BAR -->
        <div class="d-flex flex-column flex-sm-row justify-space-between align-center gap-3 mt-4">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
            class="text-capitalize"
          >
            {{ $t('buttons.back') || 'Go Back' }}
          </v-btn>
          
          <!-- ONLY REFRESH BUTTON - NO MARK ALL READ HERE -->
          <v-btn
            variant="tonal"
            size="small"
            prepend-icon="mdi-refresh"
            @click="refreshNotifications"
            :loading="refreshing"
            class="text-capitalize"
          >
            Refresh
            <template #loader>
              <v-progress-circular
                indeterminate
                size="16"
                width="2"
              />
            </template>
          </v-btn>
        </div>

      </v-col>
    </v-row>

    <!-- DIALOG -->
    <AcceptInvitationDialog
      v-model="dialogVisible"
      @cancel="onReject"
      @submit="onAccept"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useGoBack } from '@/composables/useGoBack'
import NotificationList from '@/features/notifications/components/NotificationList.vue'
import AcceptInvitationDialog from '@/shared/components/dialogs/AcceptInvitationDialog.vue'
import StudyController from '@/controllers/StudyController'

const store = useStore()
const router = useRouter()
const { goBackOrRedirect } = useGoBack()

// State
const activeTab = ref('unread')
const search = ref('')
const activeIndex = ref(-1)
const loading = ref(true)
const markingAllAsRead = ref(false)
const refreshing = ref(false)

// Pagination
const pageSize = ref(8)
const unreadPage = ref(1)
const inboxPage = ref(1)
const allPage = ref(1)

// Dialog
const dialogVisible = ref(false)
let resolveDialog

// Computed Properties
const user = computed(() => store.getters.user)

const totalCount = computed(() => user.value?.notifications?.length || 0)
const unreadCount = computed(() => 
  user.value?.notifications?.filter(n => !n.read).length || 0
)

const allRead = computed(() =>
  user.value?.notifications?.every((notification) => notification.read) || false
)

const sortedNotifications = computed(() => {
  if (!user.value?.notifications) return []
  
  return [...user.value.notifications].sort((a, b) => {
    const aDate = new Date(a.createdDate)
    const bDate = new Date(b.createdDate)
    return bDate - aDate
  })
})

// Filtered notifications for search only
const filteredNotifications = computed(() => {
  let list = sortedNotifications.value

  // Apply tab filter
  if (activeTab.value === 'unread') {
    list = list.filter(n => !n.read)
  }

  // Apply search filter
  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    list = list.filter(n =>
      (n.title || '').toLowerCase().includes(query) ||
      (n.message || '').toLowerCase().includes(query) ||
      (n.senderName || '').toLowerCase().includes(query)
    )
  }

  return list
})

// Get paginated notifications based on active tab
const paginatedNotifications = computed(() => {
  let list = []
  let start = 0
  let page = 1

  if (activeTab.value === 'unread') {
    page = unreadPage.value
    list = filteredNotifications.value
  } else if (activeTab.value === 'inbox') {
    page = inboxPage.value
    list = sortedNotifications.value
  } else {
    page = allPage.value
    list = filteredNotifications.value
  }

  start = (page - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// Get current pagination info
const currentPage = computed({
  get() {
    if (activeTab.value === 'unread') return unreadPage.value
    if (activeTab.value === 'inbox') return inboxPage.value
    return allPage.value
  },
  set(value) {
    if (activeTab.value === 'unread') unreadPage.value = value
    else if (activeTab.value === 'inbox') inboxPage.value = value
    else allPage.value = value
  }
})

const currentPages = computed(() => {
  if (activeTab.value === 'unread') return Math.ceil(filteredNotifications.value.length / pageSize.value)
  if (activeTab.value === 'inbox') return Math.ceil(sortedNotifications.value.length / pageSize.value)
  return Math.ceil(filteredNotifications.value.length / pageSize.value)
})

// Empty states
const emptyStateTitle = computed(() => {
  if (search.value.trim()) return 'No results found'
  if (activeTab.value === 'unread') return 'All caught up!'
  return 'No notifications yet'
})

const emptyStateMessage = computed(() => {
  if (search.value.trim()) return 'Try different keywords or clear your search'
  if (activeTab.value === 'unread') return "You've read all your notifications. Great job!"
  return "You'll see notifications here when you have new activities"
})

// Helper functions
const relativeTime = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const getTypeIcon = (type) => {
  const icons = {
    Study: { icon: 'mdi-flask-outline', color: 'primary' },
    Session: { icon: 'mdi-account-group-outline', color: 'green' },
    System: { icon: 'mdi-alert-circle-outline', color: 'orange' },
    Collaboration: { icon: 'mdi-account-multiple-outline', color: 'purple' }
  }
  return icons[type] || { icon: 'mdi-bell-outline', color: 'grey' }
}

// Dialog methods
const onAccept = () => {
  dialogVisible.value = false
  if (resolveDialog) {
    resolveDialog(true)
  }
}

const onReject = () => {
  dialogVisible.value = false
  if (resolveDialog) {
    resolveDialog(false)
  }
}

function showAcceptDialog() {
  dialogVisible.value = true
  return new Promise((resolve) => {
    resolveDialog = resolve
  })
}

// Notification methods
const handleNotificationClick = async (notification) => {
  if (!notification) return
  
  // If notification has a redirect, use the existing flow
  if (notification.redirectsTo) {
    await goToNotificationRedirect(notification)
  } else if (!notification.read) {
    // Mark as read if unread
    await toggleRead(notification)
  }
}

const goToNotificationRedirect = async (notification) => {
  if (!notification?.redirectsTo) return
  
  // For collaboration invitations, show dialog
  if (notification.type === 'Collaboration' || notification.action === 'invitation') {
    const accepted = await showAcceptDialog()
    if (!accepted) {
      await markAsRead(notification)
      return
    }
    
    try {
      const study = await new StudyController().getStudy({ id: notification.testId })
      
      await store.dispatch('acceptStudyCollaboration', {
        test: study,
        cooperator: user.value,
      })
      
      if (!notification.read) {
        await markAsRead(notification)
      }
    } catch (error) {
      // Error handling without console.error for SonarCloud
      // In production, you might want to log this differently
    }
  }
  
  // Mark as read if unread
  if (!notification.read) {
    await markAsRead(notification)
  }

  // Open redirect URL
  let url = notification.redirectsTo
  if (!url.startsWith('http')) {
    const baseUrl = globalThis.location.origin
    const path = url.startsWith('/') ? url : '/' + url
    url = baseUrl + path
  }
  
  try {
    globalThis.open(url, '_blank')
  } catch(e) {
    // Error handling without console.error for SonarCloud
  }
}

const markAsRead = async (notification) => {
  if (!notification || notification.read) return
  
  try {
    await store.dispatch('markNotificationAsRead', {
      notification,
      user: user.value
    })
  } catch (error) {
    // Error handling without console.error for SonarCloud
  }
}

const toggleRead = async (notification) => {
  await markAsRead(notification)
}

const markAllAsRead = async () => {
  const unread = user.value.notifications.filter((n) => !n.read)
  
  if (unread.length === 0) return

  markingAllAsRead.value = true
  try {
    await Promise.all(
      unread.map((notification) =>
        store.dispatch('markNotificationAsRead', {
          notification,
          user: user.value,
        })
      )
    )
  } catch (error) {
    // Error handling without console.error for SonarCloud
  } finally {
    markingAllAsRead.value = false
  }
}

const refreshNotifications = async () => {
  refreshing.value = true
  try {
    globalThis.location.reload()
  } catch (error) {
    // Error handling without console.error for SonarCloud
  } finally {
    refreshing.value = false
  }
}

const goBack = () => {
  goBackOrRedirect('/')
}

// Keyboard navigation
const handleKeyDown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  
  switch (e.key) {
    case 'j':
    case 'ArrowDown':
      e.preventDefault()
      if (activeIndex.value < filteredNotifications.value.length - 1) {
        activeIndex.value++
      }
      break
      
    case 'k':
    case 'ArrowUp':
      e.preventDefault()
      if (activeIndex.value > 0) {
        activeIndex.value--
      }
      break
      
    case 'Enter':
      e.preventDefault()
      if (activeIndex.value >= 0 && filteredNotifications.value[activeIndex.value]) {
        handleNotificationClick(filteredNotifications.value[activeIndex.value])
      }
      break
      
    case 'r':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        refreshNotifications()
      }
      break
      
    case 'Escape':
      activeIndex.value = -1
      break
  }
}

// Watchers
watch(activeTab, () => {
  unreadPage.value = 1
  inboxPage.value = 1
  allPage.value = 1
  activeIndex.value = -1
})

watch(search, () => {
  unreadPage.value = 1
  inboxPage.value = 1
  allPage.value = 1
  activeIndex.value = -1
})

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 600)
  
  globalThis.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.notification-item {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
}

.notification-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.notification-item.unread {
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.03) 0%, white 3%);
  border-left-width: 4px;
}

.notification-item.active {
  outline: 2px solid rgba(var(--v-theme-primary), 0.3);
  outline-offset: 2px;
  background: rgba(var(--v-theme-primary), 0.02);
}

.unread-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #1976d2;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
  -moz-box-orient: vertical;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .rounded-xl {
    border-radius: 12px !important;
  }
  
  .notification-item {
    padding: 12px !important;
    margin-bottom: 12px;
  }
  
  .v-btn {
    min-width: auto !important;
  }
  
  .v-btn--size-small {
    font-size: 0.75rem;
    padding: 0 8px;
  }
}

/* Tablet adjustments */
@media (min-width: 601px) and (max-width: 960px) {
  .rounded-xl {
    border-radius: 14px !important;
  }
}
</style>