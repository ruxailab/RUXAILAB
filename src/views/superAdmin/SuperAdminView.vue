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
            @click=";(dialogDel = false), (userClicked = null)"
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
      {{ $t('PROFILE.superAdmin') }}
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
              :items="users"
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
              <template #[`item.accessLevel`]="{ item }">
                <v-chip
                  :color="getAccessLevelColor(item.accessLevel)"
                  size="small"
                >
                  {{ level(item.accessLevel) }}
                </v-chip>
              </template>

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
                  @click=";(dialogDel = true), (userClicked = item)"
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
                  <span class="text-h5">{{ $t('PROFILE.editProfile') }}</span>
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
              :items="tests"
              class="elevation-1"
              :loading="loading"
            >
              <template #top>
                <v-toolbar
                  flat
                  color="white"
                >
                  <v-toolbar-title>Tests</v-toolbar-title>
                </v-toolbar>
                <v-text-field
                  v-model="search"
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  class="mx-3"
                  density="compact"
                  label="Search"
                />
              </template>

              <template #[`item.actions`]="{ item }">
                <v-icon
                  size="small"
                  class="mr-2"
                  @click="openManager(item)"
                >
                  mdi-eye
                </v-icon>
              </template>

              <template #[`item.creationDate`]="{ item }">
                {{ new Date(item.creationDate).toLocaleString() }}
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <v-card />
  </v-main>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar.vue'

export default {
  components: {
    Snackbar,
  },
  data: () => ({
    dialog: false,
    dialogDel: false,
    userClicked: null,
    search: '',
    editedIndex: -1,
    editedUser: {
      uid: '',
      email: '',
      accessLevel: 0,
    },
    defaultUser: {
      uid: '',
      email: '',
      accessLevel: 0,
    },
    tab: 0,
  }),
  computed: {
    users() {
      return this.$store.getters.users ?? []
    },
    tests() {
      return this.$store.getters.tests ?? []
    },
    loading() {
      return this.$store.getters.loading
    },
    dialogText() {
      return `${this.$t('alerts.deleteUser')} ${
        this.userClicked !== null ? this.userClicked.email : ''
      }`
    },
    usersHeaders() {
      return [
        {
          text: this.$t('titles.id'),
          align: 'start',
          value: 'id',
        },
        { text: this.$t('SIGNIN.email'), value: 'email', align: 'center' },
        { text: this.$t('titles.accessLevel'), value: 'accessLevel', align: 'center' },
        { text: this.$t('titles.actions'), value: 'actions', align: 'end', sortable: false },
      ]
    },
    testsHeaders() {
      return [
        {
          text: this.$t('common.title'),
          align: 'start',
          value: 'testTitle',
        },
        { text: this.$t('pages.listTests.createdBy'), value: 'testAdmin.email' },
        { text: this.$t('pages.listTests.updated'), value: 'creationDate' },
        { text: this.$t('titles.actions'), value: 'actions', align: 'end', sortable: false },
      ]
    },
    accessLevels() {
      return [
        { text: this.$t('PROFILE.superAdmin'), level: 0 },
        { text: this.$t('PROFILE.admin'), level: 1 },
        { text: this.$t('common.user'), level: 2 },
      ]
    },
  },
  watch: {
    dialog(val) {
      if (val) {
        return
      }

      this.close()
    },
    tab() {
      this.search = ''
    },
  },
  async created() {
    await this.$store.dispatch('getAllUsers')
    await this.$store.dispatch('getAllTests')
  },
  methods: {
    getAccessLevelColor(level) {
      switch (level) {
        case 0:
          return 'red darken-2' // Super Admin
        case 1:
          return 'blue darken-2' // Admin
        case 2:
          return 'green darken-1' // User
        default:
          return 'grey' // Unknown level
      }
    },
    editUser(item) {
      this.editedIndex = this.users.indexOf(item)
      this.editedUser = { ...item }
      this.dialog = true
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedUser = { ...this.defaultUser }
        this.editedIndex = -1
      })
    },

    save(user) {
      const payload = {
        uid: user.id,
        customClaims: {
          accessLevel: user.accessLevel,
        },
      }
      this.$store.dispatch('updateLevel', { data: payload })
      this.close()
    },
    level(lv) {
      let text
      this.accessLevels.forEach((item) => {
        if (item.level === lv) {
          text = item.text
        }
      })
      return text
    },
    deleteUser(user) {
      this.dialogDel = false
      this.$store
        .dispatch('deleteUser', user)
        .then(() => {
          this.userClicked = null
        })
        .catch(() => {}) // Errors are handled in the store
    },
    openManager(test) {
      this.$router.push(`managerview/${test.id}`)
    },
  },
}
</script>