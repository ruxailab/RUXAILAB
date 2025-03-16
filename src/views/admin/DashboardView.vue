<template>
  <v-container class="mt-8">
    <Snackbar />

    <!-- CREATE TEST BTN -->
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          data-testid="create-test-btn"
          large
          dark
          fab
          fixed
          bottom
          right
          color="#F9A826"
          v-bind="attrs"
          class="elevation-6 hover:shadow-lg"
          @click="goToCreateTestRoute()"
          v-on="on"
        >
          <v-icon large class="text-white">mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('Dashboard.createNewTest') }}</span>
    </v-tooltip>

    <!-- LOADING -->
    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

    <div>
      <v-row justify="center" class="fill-height">
        <v-col cols="10">
          <!-- Mobile Search Button -->
          <v-row v-if="!searching" align="center">
            <span class="titleText ml-3 mb-2 font-weight-bold text-h5">
              {{ $t('Dashboard.tests') }}
            </span>
            <v-spacer />
            <v-btn class="mr-3 hidden-md-and-up" icon color="grey darken-2" @click="searching = true">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-row>

          <v-text-field
            v-else
            v-model="search"
            :autofocus="searching"
            dense
            outlined
            color="grey darken-2"
            class="rounded-lg"
            :label="$t('Dashboard.search')"
            prepend-inner-icon="mdi-magnify"
            @blur="searching = false"
          />
          <v-divider class="mb-2" />

          <!-- Desktop Main Tabs -->
          <v-tabs
            v-model="mainIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down mt-4"
            active-class="active-tab"
          >
            <v-tab class="text-capitalize">{{ $t('Dashboard.tests') }}</v-tab>
            <v-tab class="text-capitalize">{{ $t('Dashboard.templates') }}</v-tab>

            <v-spacer />

            <v-text-field
              v-model="search"
              dense
              class="mt-1"
              outlined
              color="grey darken-2"
              :label="$t('Dashboard.search')"
              prepend-inner-icon="mdi-magnify"
              :disabled="mainIndex == 2 && subIndex == 1 ? true : false"
            />
          </v-tabs>
          <v-divider class="hidden-sm-and-down" />

          <!-- Sub Tabs -->
          <v-tabs
            v-if="mainIndex === 0"
            v-model="subIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
            active-class="active-tab"
          >
            <v-tab class="text-capitalize">{{ $t('Dashboard.myTests') }}</v-tab>
            <v-tab class="text-capitalize">{{ $t('Dashboard.sharedWithMe') }}</v-tab>
            <v-tab class="text-capitalize">{{ $t('Dashboard.publicTests') }}</v-tab>
            <v-tab class="text-capitalize">{{ $t('Dashboard.sessions') }}</v-tab>
            <v-spacer />
          </v-tabs>
          <v-divider class="hidden-sm-and-down mb-4" />

          <!-- Mobile Select Buttons -->
          <v-select
            v-model="mainIndex"
            dense
            outlined
            class="hidden-md-and-up mx-2 mt-4"
            :items="buttonItems"
          />
          <v-select
            v-if="mainIndex == 1"
            v-model="subIndex"
            dense
            outlined
            class="hidden-md-and-up mx-2"
            :items="templateButtonItems"
          />
          <v-select
            v-else
            v-model="subIndex"
            dense
            outlined
            class="hidden-md-and-up mx-2"
            :items="testButtonItems"
          />

          <!-- Tests & Templates Sections -->
          <List
            v-if="mainIndex == 0 && subIndex == 0"
            :items="filteredTests"
            type="myTests"
            @clicked="goTo"
          />
          <List
            v-if="mainIndex == 0 && subIndex == 1"
            :items="filteredTests"
            type="sharedWithMe"
            @clicked="goTo"
          />
          <List
            v-if="filteredTests && mainIndex == 0 && subIndex == 2"
            :items="filteredTests"
            type="publicTests"
            @clicked="goTo"
          />
          <List
            v-if="filteredModeratedSessions.length > 0 && mainIndex == 0 && subIndex == 3"
            :items="filteredModeratedSessions"
            type="sessions"
            @clicked="goTo"
          />

          <!-- No Active Sessions Message -->
          <v-col
            v-if="filteredModeratedSessions.length == 0 && mainIndex == 0 && subIndex == 3"
            align="center"
            class="my-5 text-center"
          >
            <span class="text-grey-darken-1 text-h6">
              {{ $t("Dashboard.noActiveSessions") }}
            </span>
            <br>
            <v-icon class="mt-2 text-grey-darken-1" size="48">
              mdi-clock-remove-outline
            </v-icon>
          </v-col>

          <!-- Templates Section -->
          <List
            v-if="mainIndex == 1 && subIndex == 0"
            :items="filteredTemplates"
            type="myTemplates"
            @clicked="setupTempDialog"
          />
          <List
            v-if="mainIndex == 1 && subIndex == 1"
            :items="filteredTemplates"
            type="publicTemplates"
            @clicked="setupTempDialog"
          />
        </v-col>
      </v-row>

      <!-- Template Dialog -->
      <TempDialog
        :dialog="tempDialog"
        :template="temp"
        :allow-create="true"
        @close="tempDialog = false"
      />
    </div>
  </v-container>
</template>


<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Snackbar from '@/components/atoms/Snackbar'
import List from '@/components/atoms/ListComponent'
import TempDialog from '@/components/molecules/TemplateInfoDialog'

export default {
  components: { Snackbar, List, TempDialog },

  data: () => ({
    search: '',
    mainIndex: 0,
    subIndex: 0,
    searching: false,
    buttonItems: [
      { text: 'Tests', value: 0 },
      { text: 'Templates', value: 1 },
    ],
    testButtonItems: [
      { text: 'My Tests', value: 0 },
      { text: 'Shared With Me', value: 1 },
      { text: 'Public Tests', value: 2 },
    ],
    templateButtonItems: [
      { text: 'Personal', value: 0 },
      { text: 'Explore', value: 1 },
    ],
    page: 1,
    lastPage: 1,
    itemsPerPage: 4,
    tempDialog: false,
    temp: {},
    filteredModeratedSessions: [],
  }),

  computed: {
    ...mapState({
      tests: (state) => state.Tests.tests,
      templates: (state) => state.Templates.templates,
    }),
    ...mapGetters(['user', 'test', 'loading']),

    filteredTests() {
      return this.tests?.filter(test =>
        test.testTitle.toLowerCase().includes(this.search.toLowerCase())
      ) ?? this.tests
    },

    filteredTemplates() {
      return this.templates?.filter(temp =>
        temp.header.templateTitle.toLowerCase().includes(this.search.toLowerCase())
      ) ?? this.templates
    },

    showTempDetails() {
      return !(this.mainIndex === 2 && this.subIndex === 0)
    },
  },

  watch: {
    mainIndex: {
      immediate: true,
      async handler(val) {
        this.subIndex = 0
        if (val === 0) await this.getMyPersonalTests()
        if (val === 1) await this.getMyTemplates()
      }
    },

    subIndex: {
      async handler(val) {
        if (this.mainIndex === 0) {
          if (val === 0) await this.getMyPersonalTests()
          else if (val === 1) await this.getSharedWithMeTests()
          else if (val === 2) await this.getPublicTests()
        } else if (this.mainIndex === 1) {
          if (val === 0) await this.getMyTemplates()
          else if (val === 1) await this.getPublicTemplates()
        }
      }
    }
  },

  async created() {
    await this.getMyPersonalTests()
    await this.cleanTestStore()
  },

  methods: {
    ...mapActions([
      'cleanTest',
      'getTestsAdminByUser',
      'getPublicTests',
      'getPublicTemplates',
      'getTemplatesOfUser',
      'getSharedWithMeTests',
      'getTest'
    ]),

    async getMyPersonalTests() {
      await this.getTestsAdminByUser()
    },

    async getMyTemplates() {
      await this.getTemplatesOfUser()
    },

    async filterModeratedSessions() {
      const userModeratedTests = Object.values(this.user?.myAnswers || []).filter(
        (answer) => answer.userTestType === 'moderated'
      )

      const today = new Date().setHours(0, 0, 0, 0)
      this.filteredModeratedSessions = await Promise.all(
        userModeratedTests.map(async (test) => {
          const testObj = await this.getTest({ id: test.testDocId })
          if (!testObj) return null

          const cooperatorObj = testObj.cooperators.find(coop => coop.userDocId === this.user.id)
          if (!cooperatorObj) return null

          const testDate = new Date(cooperatorObj.testDate).setHours(0, 0, 0, 0)
          if (testDate !== today) return null

          return {
            ...cooperatorObj,
            testTitle: testObj.testTitle,
            testAdmin: testObj.testAdmin,
            id: testObj.id
          }
        })
      ).then(results => results.filter(Boolean))
    },

    goToCreateTestRoute() {
      this.$router.push('/createtest')
    },

    goTo(test) {
      let routeName = 'ManagerView'
      let params = { id: test.testDocId || test.id }

      if (this.mainIndex === 0) {
        if (this.subIndex === 1 && test.accessLevel >= 2) {
          routeName = 'TestView'
        } else if (this.subIndex === 3) {
          routeName = `testview/${test.id}/${this.user.id}`
        }
      }

      this.$router.push({ name: routeName, params })
    },

    setupTempDialog(temp) {
      this.temp = { ...temp }
      this.tempDialog = true
    },
  }
}
</script>


<style scoped>
/* Light Mode (Default) */
.navbar {
  background-color: #ffffff; /* White background */
  color: #000000; /* Black text */
  padding: 10px 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

/* Dark Mode */
.dark-mode .navbar {
  background-color: #f9a826; /* Yellow navbar background */
  color: #ffffff; /* White text */
}

/* Default Tab Styling */
.nav-item {
  padding: 8px 16px;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
}

/* Active Tab (Clicked Option) */
.active-tab {
  background-color: rgba(249, 168, 38, 0.8) !important; /* Yellow background */
  border-radius: 4px;
  color: #000000 !important; /* Black text */
  font-weight: bold;
}
</style>
