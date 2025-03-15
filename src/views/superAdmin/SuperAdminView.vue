<template>
  <v-main class="pt-4">
    <Snackbar />
    <!-- Delete Alert Dialog -->
    <v-dialog v-model="dialogDel" width="600" persistent>
      <v-card>
        <v-card-title class="headline error white--text" primary-title>
          {{ $t('alerts.deleteUser') }}
        </v-card-title>

        <v-card-text>{{ dialogText }}</v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            class="grey lighten-3"
            text
            @click=";(dialogDel = false), (userClicked = null)"
          >
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="red white--text ml-1"
            text
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
    <v-row align="center" justify="center">
      <v-col cols="10">
        <v-tabs v-model="tab">
          <v-tab>{{ $t('titles.users') }}</v-tab>
          <v-tab>{{ $t('titles.tests') }}</v-tab>
        </v-tabs>
        <v-divider />
      </v-col>

      <v-col cols="10">
        <v-tabs-items v-model="tab">
          <!-- Users tab -->
          <v-tab-item>
            <v-data-table
              :search="search"
              :headers="usersHeaders"
              :items="users"
              class="elevation-1"
              :loading="loading"
            >
              <template v-slot:top>
                <v-toolbar flat color="white">
                  <v-toolbar-title>{{ $t('titles.users') }}</v-toolbar-title>
                </v-toolbar>
                <v-text-field
                  v-model="search"
                  outlined
                  prepend-inner-icon="mdi-magnify"
                  class="mx-3"
                  dense
                  :label="$t('Dashboard.search')"
                />
              </template>
              <template v-slot:[`item.accessLevel`]="{ item }">
                <div>{{ level(item.accessLevel) }}</div>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editUser(item)">
                  mdi-pencil
                </v-icon>

                <v-icon
                  color="red"
                  small
                  click
                  @click=";(dialogDel = true), (userClicked = item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
            <v-dialog v-model="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ $t('PROFILE.editProfile') }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          label="Id"
                          :value="editedUser.id"
                          disabled
                          outlined
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          label="E-mail"
                          :value="editedUser.email"
                          disabled
                          outlined
                        />
                      </v-col>
                      <v-col cols="12">
                        <p>Access Level</p>
                        <v-overflow-btn
                          v-model="editedUser.accessLevel"
                          class="my-2"
                          :items="accessLevels"
                          item-value="level"
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer />
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save(editedUser)">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-tab-item>

          <!-- Tests Tab -->
          <v-tab-item>
            <v-data-table
              :search="search"
              :headers="testsHeaders"
              :items="tests"
              class="elevation-1"
              :loading="loading"
            >
              <template v-slot:top>
                <v-toolbar flat color="white">
                  <v-toolbar-title>Tests</v-toolbar-title>
                </v-toolbar>
                <v-text-field
                  v-model="search"
                  outlined
                  prepend-inner-icon="mdi-magnify"
                  class="mx-3"
                  dense
                  label="Search"
                />
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="openManager(item)">
                  mdi-eye
                </v-icon>
              </template>

               <template v-slot:[`item.creationDate`]="{ item }">
                {{ new Date(item.creationDate).toLocaleString() }}
              </template>
            </v-data-table>
          </v-tab-item>
        </v-tabs-items>
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
        .dispatch('deleteAuth', user)
        .then(() => {
          this.$store
            .dispatch('deleteUser', user)
            .then(() => {
              this.$store.commit(
                'setSuccess',
                `Successfully deleted user ${this.userClicked.email}`,
              )
              this.$delete(this.users, this.users.indexOf(this.userClicked))
              this.userClicked = null
            })
            .catch((err) => {
              this.commit('setError', {
                errorCode: 'auth',
                message: 'Error deleting user',
              })
            })
        })
        .catch((err) => {
          this.commit('setError', {
            errorCode: 'auth',
            message: 'Error deleting user',
          })
        })
    },
    openManager(test) {
      this.$router.push(`managerview/${test.id}`)
    },
  },
}
</script>
