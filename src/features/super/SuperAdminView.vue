<template>
  <v-main class="pt-4">
    <Snackbar />
    <!-- Delete Alert Dialog -->
    <v-dialog
      v-model="dialogDel"
      width="600"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 bg-error text-white"
          primary-title
        >
          {{ $t('alerts.deleteUser') }}
        </v-card-title>
        <v-card-text>{{ dialogText }}</v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            class="bg-grey-lighten-3"
            variant="text"
            @click="closeDelete"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="bg-red text-white ml-1"
            variant="text"
            @click="deleteUser(userClicked)"
          >
            {{ $t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <h1 style="margin-left: 8%; font-weight: 300">
      {{ $t('profile.superAdmin') }}
    </h1>

    <v-row
      align="center"
      justify="center"
    >
      <v-col cols="10">
        <v-tabs v-model="tab">
          <v-tab>{{ $t('titles.users') }}</v-tab>
          <v-tab>{{ $t('titles.tests') }}</v-tab>
        </v-tabs>
        <v-divider />
      </v-col>

      <v-col cols="10">
        <v-window v-model="tab">
          <!-- Users tab -->
          <v-window-item>
            <v-data-table
              :search="search"
              :headers="usersHeaders"
              :items="formattedUsers"
              class="elevation-1"
              :loading="loading"
            >
              <template #top>
                <v-toolbar
                  flat
                  color="white"
                >
                  <v-toolbar-title>{{ $t('titles.users') }}</v-toolbar-title>
                </v-toolbar>
                <v-text-field
                  v-model="search"
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  class="mx-3"
                  density="compact"
                  :label="$t('Dashboard.search')"
                />
              </template>
              
              <!-- Username Column -->
              <template #[`item.username`]="{ item }">
                <span>{{ item.username || 'N/A' }}</span>
              </template>
              
              <!-- Studies Count Column -->
              <template #[`item.studiesCount`]="{ item }">
                <span>{{ item.studiesCount }}</span>
              </template>
              
              <!-- Media Size Column -->
              <template #[`item.mediaSize`]="{ item }">
                <span>{{ item.mediaSize }}</span>
              </template>
              
              <!-- Access Level Column -->
              <template #[`item.accessLevel`]="{ item }">
                <v-chip
                  :color="getAccessLevelColor(item.accessLevel)"
                  size="small"
                >
                  {{ level(item.accessLevel) }}
                </v-chip>
              </template>
              
              <!-- Actions Column -->
              <template #[`item.actions`]="{ item }">
                <v-icon
                  size="small"
                  class="mr-2"
                  @click="editUser(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  color="red"
                  size="small"
                  @click="confirmDelete(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>

            <v-dialog
              v-model="dialog"
              max-width="500px"
            >
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ $t('profile.editProfile') }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          label="Id"
                          :model-value="editedUser.id"
                          disabled
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          label="E-mail"
                          :model-value="editedUser.email"
                          disabled
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12">
                        <p>Access Level</p>
                        <v-select
                          v-model="editedUser.accessLevel"
                          class="my-2"
                          :items="accessLevels"
                          item-value="level"
                          item-title="text"
                          variant="outlined"
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="close"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="save(editedUser)"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-window-item>

          <!-- Tests Tab -->
          <v-window-item>
            <v-data-table
              :search="search"
              :headers="testsHeaders"
              :items="formattedTests"
              class="elevation-1"
              :loading="loading"
            >
              <template #top>
                <v-toolbar
                  flat
                  color="white"
                >
                  <v-toolbar-title>{{ $t('titles.studies') }}</v-toolbar-title>
                </v-toolbar>
                <v-text-field
                  v-model="search"
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  class="mx-3"
                  density="compact"
                  :label="$t('Dashboard.search')"
                />
              </template>
              
              <!-- Study Type Column -->
              <template #[`item.studyType`]="{ item }">
                <v-chip 
                  size="small" 
                  :color="getMethodColor(item)" 
                  class="text-white"
                >
                  {{ item.studyType }}
                </v-chip>
              </template>
              
              <!-- Creation Date Column -->
              <template #[`item.creationDateFormatted`]="{ item }">
                <span>{{ item.creationDateFormatted }}</span>
              </template>
              
              <!-- Collaborators Column -->
              <template #[`item.collaboratorsCount`]="{ item }">
                <span>{{ item.collaboratorsCount }}</span>
              </template>
              
              <!-- Media Size Column -->
              <template #[`item.mediaSize`]="{ item }">
                <v-tooltip bottom>
                  <template #activator="{ props }">
                    <span v-bind="props" class="text-grey">
                      {{ item.mediaSize }}
                    </span>
                  </template>
                  <span>{{ $t('tooltips.storagePerUser') }}</span>
                </v-tooltip>
              </template>
              
              <!-- Actions Column -->
              <template #[`item.actions`]="{ item }">
                <v-icon
                  size="small"
                  class="mr-2"
                  @click="openManager(item)"
                >
                  mdi-eye
                </v-icon>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <v-card />
  </v-main>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Snackbar from '@/shared/components/Snackbar';
import { useI18n } from 'vue-i18n'
import { getMethodName, getMethodColor } from '@/shared/constants/methodDefinitions'

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const dialog = ref(false)
const dialogDel = ref(false)
const userClicked = ref(null)
const search = ref('')
const editedIndex = ref(-1)
const editedUser = ref({ uid: '', email: '', accessLevel: 0 })
const defaultUser = { uid: '', email: '', accessLevel: 0 }
const tab = ref(0)

const users = computed(() => store.getters.users ?? [])
const tests = computed(() => store.getters.tests ?? [])
const loading = computed(() => store.getters.loading)

// Format users data with calculated fields
const formattedUsers = computed(() => {
  return users.value.map(user => ({
    ...user,
    // Calculate number of studies created (count keys in myTests object)
    studiesCount: user.myTests ? Object.keys(user.myTests).length : 0,
    // Format media size (convert MB to GB if > 1024 MB)
    mediaSize: formatMediaSize(user.storageUsageMB || 0),
    // Ensure username is not undefined
    username: user.username || 'N/A'
  }));
});

// Format tests data with calculated fields
const formattedTests = computed(() => {
  return tests.value.map(test => ({
    ...test,
    // Format study type
    studyType: getMethodName(test, i18n.locale.value),
    // Format creation date
    creationDateFormatted: test.creationDate ? new Date(test.creationDate).toLocaleDateString() : 'N/A',
    // Count collaborators
    collaboratorsCount: test.cooperators ? test.cooperators.length : 0,
    // Media size - not directly available at study level
    mediaSize: 'N/A',
  }));
});

// Table headers
const usersHeaders = computed(() => [
  { title: t('titles.name'), align: 'start', value: 'username' },
  { title: t('SIGNIN.email'), value: 'email', align: 'center' },
  { title: t('titles.studiesCount'), value: 'studiesCount', align: 'center' },
  { title: t('titles.mediaSize'), value: 'mediaSize', align: 'center' },
  { title: t('titles.accessLevel'), value: 'accessLevel', align: 'center' },
  { title: t('titles.actions'), value: 'actions', align: 'end', sortable: false },
])

const testsHeaders = computed(() => [
  { title: t('titles.studyName'), align: 'start', value: 'testTitle' },
  { title: t('titles.studyType'), value: 'studyType', align: 'center' },
  { title: t('titles.creationDate'), value: 'creationDateFormatted', align: 'center', sortable: true },
  { title: t('titles.collaborators'), value: 'collaboratorsCount', align: 'center' },
  { title: t('titles.mediaSize'), value: 'mediaSize', align: 'center' },
  { title: t('titles.actions'), value: 'actions', align: 'end', sortable: false },
])

const accessLevels = computed(() => [
  { title: t('profile.superAdmin'), level: 0 },
  { title: t('profile.admin'), level: 1 },
  { title: t('common.user'), level: 2 },
])

const dialogText = computed(() =>
  `${t('alerts.deleteUser')} ${userClicked.value ? userClicked.value.email : ''}`
)

// Helper function to format media size
const formatMediaSize = (mb) => {
  if (mb === 0) return '0 MB';
  if (mb < 1024) {
    return `${Math.round(mb * 10) / 10} MB`;
  }
  const gb = mb / 1024;
  return `${Math.round(gb * 10) / 10} GB`;
};

// Helper function to get access level color
const getAccessLevelColor = (level) => {
  switch (level) {
    case 0:
      return 'red darken-2'
    case 1:
      return 'blue darken-2'
    case 2:
      return 'green darken-1'
    default:
      return 'grey'
  }
}

// Helper function to get access level text
const level = (lv) => {
  return accessLevels.value.find((item) => item.level === lv)?.text
}

// Edit user - need to find original user from formattedUsers
const editUser = (item) => {
  // Find the original user in the users array
  const originalUser = users.value.find(u => u.id === item.id);
  if (originalUser) {
    editedIndex.value = users.value.indexOf(originalUser);
    editedUser.value = { ...originalUser };
    dialog.value = true;
  }
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedUser.value = { ...defaultUser }
    editedIndex.value = -1
  })
}

const save = (user) => {
  const payload = {
    uid: user.id,
    customClaims: {
      accessLevel: user.accessLevel,
    },
  }
  store.dispatch('updateLevel', { data: payload })
  close()
}

const confirmDelete = (item) => {
  dialogDel.value = true
  userClicked.value = item
}

const closeDelete = () => {
  dialogDel.value = false
  userClicked.value = null
}

const deleteUser = (user) => {
  dialogDel.value = false
  store.dispatch('deleteUser', user).then(() => {
    userClicked.value = null
  })
}

const openManager = (test) => {
  router.push(`managerview/${test.id}`)
}

watch(dialog, (val) => {
  if (!val) close()
})

watch(tab, () => {
  search.value = ''
})

onMounted(async () => {
  await store.dispatch('getAllUsers')
  await store.dispatch('getAllStudies')
})
</script>