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
          @click="goToCreateTestRoute()"
          v-on="on"
          elevation="4"
        >
          <v-icon large>
            mdi-plus
          </v-icon>
        </v-btn>
      </template>
      <span>{{ $t('Dashboard.createNewTest') }}</span>
    </v-tooltip>

    <!-- LOADING -->
    <v-overlay v-model="loading">
      <v-progress-circular indeterminate color="#F9A826" size="64" />
    </v-overlay>

    <div>
      <v-row justify="center" class="fill-height">
        <v-col cols="12" md="10" lg="9">
          <!-- Mobile search button and title -->
          <v-row v-if="!searching" align="center">
            <div class="titleText ml-3 mb-2 primary--text">{{ $t('Dashboard.tests') }}</div>
            <v-spacer />
            <v-btn class="mr-3 hidden-md-and-up" icon @click="searching = true">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-row>
          
          <!-- Mobile search field -->
          <v-text-field
            v-if="searching"
            v-model="search"
            autofocus
            dense
            :label="$t('Dashboard.search')"
            prepend-inner-icon="mdi-magnify"
            append-icon="mdi-close"
            outlined
            color="#F9A826"
            @blur="searching = false"
            @click:append="searching = false"
            class="mb-3"
          />
          
          <v-divider class="mb-3" />

          <!-- Desktop Main Tabs - Enhanced -->
          <v-tabs
            v-model="mainIndex"
            background-color="transparent"
            color="#F9A826"
            class="hidden-sm-and-down mt-4 custom-tabs"
            active-class="active-tab"
            slider-color="#F9A826"
            slider-size="3"
          >
            <v-tab class="px-6 text-subtitle-1">
              <v-icon left>mdi-clipboard-text</v-icon>
              {{ $t('Dashboard.tests') }}
            </v-tab>
            <!-- <v-tab>Answers</v-tab>-->
            <v-tab class="px-6 text-subtitle-1">
              <v-icon left>mdi-file-document-outline</v-icon>
              {{ $t('Dashboard.templates') }}
            </v-tab>

            <v-spacer />

            <!-- Desktop search field -->
            <v-text-field
              v-model="search"
              dense
              class="mt-1 custom-search-width"
              :label="$t('Dashboard.search')"
              prepend-inner-icon="mdi-magnify"
              :disabled="mainIndex == 1 && subIndex == 1 ? true : false"
              outlined
              color="#F9A826"
              hide-details
            />
          </v-tabs>
          <v-divider class="hidden-sm-and-down mb-3" />

          <!-- Desktop Tests/Answers Sub tabs - Enhanced -->
          <v-tabs
            v-if="mainIndex === 0"
            v-model="subIndex"
            background-color="transparent"
            color="#F9A826"
            class="hidden-sm-and-down custom-tabs"
            active-class="active-tab"
            slider-color="#F9A826"
            slider-size="3"
          >
            <v-tab class="text-subtitle-2">
              <v-icon small class="mr-1">mdi-account</v-icon>
              {{ $t('Dashboard.myTests') }}
            </v-tab>
            <v-tab class="text-subtitle-2">
              <v-icon small class="mr-1">mdi-share-variant</v-icon>
              {{ $t('Dashboard.sharedWithMe') }}
            </v-tab>
            <v-tab class="text-subtitle-2">
              <v-icon small class="mr-1">mdi-earth</v-icon>
              {{ $t('Dashboard.publicTests') }}
            </v-tab>
            <v-tab class="text-subtitle-2">
              <v-icon small class="mr-1">mdi-clock-outline</v-icon>
              {{ $t('Dashboard.sessions') }}
            </v-tab>

            <v-spacer />
          </v-tabs>
          <v-divider class="hidden-sm-and-down mb-4" />

          <!-- Desktop Templates Sub tabs - Enhanced -->
          <v-tabs
            v-if="mainIndex == 1"
            v-model="subIndex"
            background-color="transparent"
            color="#F9A826"
            class="hidden-sm-and-down custom-tabs"
            active-class="active-tab"
            slider-color="#F9A826"
            slider-size="3"
          >
            <v-tab class="text-subtitle-2">
              <v-icon small class="mr-1">mdi-folder-account</v-icon>
              {{ $t('Dashboard.personal') }}
            </v-tab>
            <v-tab class="text-subtitle-2">
              <v-icon small class="mr-1">mdi-compass</v-icon>
              {{ $t('Dashboard.explore') }}
            </v-tab>

            <v-spacer />
          </v-tabs>
          <v-divider class="hidden-sm-and-down mb-4" />
          
          <!-- Mobile Main Button - Enhanced -->
          <v-select
            v-model="mainIndex"
            dense
            outlined
            class="hidden-md-and-up mx-2 mt-4 mb-3"
            :items="buttonItems"
            item-color="#F9A826"
            color="#F9A826"
            prepend-inner-icon="mdi-filter-variant"
            hide-details
          />

          <!-- Mobile Sub Buttons - Enhanced -->
          <v-select
            v-if="mainIndex == 1"
            v-model="subIndex"
            dense
            outlined
            class="hidden-md-and-up mx-2 mb-4"
            :items="templateButtonItems"
            item-color="#F9A826"
            color="#F9A826"
            hide-details
          />
          <v-select
            v-else
            v-model="subIndex"
            dense
            outlined
            class="hidden-md-and-up mx-2 mb-4"
            :items="testButtonItems"
            item-color="#F9A826"
            color="#F9A826"
            hide-details
          />

          <!-- Content Container - Enhanced -->
          <v-card outlined class="rounded-lg mb-4 content-container">
            <!-- Tests -> Personal  -->
            <List
              v-if="mainIndex == 0 && subIndex == 0"
              :items="filteredTests"
              type="myTests"
              @clicked="goTo"
            />

            <!-- Tests -> Others  -->
            <List
              v-if="mainIndex == 0 && subIndex == 1"
              :items="filteredTests"
              type="sharedWithMe"
              @clicked="goTo"
            />

            <!-- Tests -> Public Tests -->
            <List
              v-if="filteredTests != null && mainIndex == 0 && subIndex == 2"
              :items="filteredTests"
              type="publicTests"
              @clicked="goTo"
            />

            <!-- Tests -> Sessions -->
            <List
              v-if="
                filteredModeratedSessions.length > 0 &&
                  mainIndex == 0 &&
                  subIndex == 3
              "
              :items="filteredModeratedSessions"
              type="sessions"
              @clicked="goTo"
            />
            
            <!-- Empty Sessions State -->
            <v-card-text
              v-if="
                filteredModeratedSessions.length == 0 &&
                  mainIndex == 0 &&
                  subIndex == 3
              "
              align="center"
              class="py-12"
            >
              <v-icon size="64" color="grey lighten-1" class="mb-3">
                mdi-clock-remove-outline
              </v-icon>
              <div class="text-subtitle-1 grey--text text--darken-1">
                You don't have active sessions
              </div>
            </v-card-text>

            <!-- Templates -> Personal -->
            <List
              v-if="mainIndex == 1 && subIndex == 0"
              :items="filteredTemplates"
              type="myTemplates"
              @clicked="setupTempDialog"
            />

            <!-- Templates -> Public Templates -->
            <List
              v-if="mainIndex == 1 && subIndex == 1"
              :items="filteredTemplates"
              type="publicTemplates"
              @clicked="setupTempDialog"
            />
          </v-card>
        </v-col>
      </v-row>

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
import Snackbar from '@/components/atoms/Snackbar'
import List from '@/components/atoms/ListComponent'
import TempDialog from '@/components/molecules/TemplateInfoDialog'

export default {
  components: {
    Snackbar,
    List,
    TempDialog,
  },

  data: () => ({
    search: '',
    mainIndex: 0,
    subIndex: 0,
    searching: false,
    buttonItems: [
      { text: 'Tests', value: 0, icon: 'mdi-clipboard-text' },
      { text: 'Templates', value: 1, icon: 'mdi-file-document-outline' },
    ],
    testButtonItems: [
      { text: 'My Tests', value: 0, icon: 'mdi-account' },
      { text: 'Shared With Me', value: 1, icon: 'mdi-share-variant' },
      { text: 'Public Tests', value: 2, icon: 'mdi-earth' },
      { text: 'Sessions', value: 3, icon: 'mdi-clock-outline' },
    ],
    templateButtonItems: [
      { text: 'Personal', value: 0, icon: 'mdi-folder-account' },
      { text: 'Explore', value: 1, icon: 'mdi-compass' },
    ],
    page: 1,
    lastPage: 1,
    itemsPerPage: 4,
    exploreTemplates: [],
    disableNext: false,
    disablePrevious: true,
    tempDialog: false,
    temp: {},
    filteredModeratedSessions: [],
  }),

  computed: {
    user() {
      return this.$store.getters.user
    },
    test() {
      return this.$store.getters.test
    },
    tests() {
      return this.$store.state.Tests.tests
    },

    filteredTests() {
      return this.tests?.filter(test => {
        return test.testTitle.toLowerCase().includes(this.search.toLowerCase())
      }) ?? this.tests
    },

    templates() {
      return this.$store.state.Templates.templates || []
    },

    filteredTemplates() {
      return this.templates.filter(temp => {
        return temp.header.templateTitle.toLowerCase().includes(this.search.toLowerCase())
      })
    },

    loading() {
      return this.$store.getters.loading
    },

    showTempDetails() {
      return !(this.mainIndex == 2 && this.subIndex == 0) //dont show on this tab
    },
  },
  watch: {
    async mainIndex(val) {
      this.subIndex = 0 //reset subIndex when main index change

      // If it is on tab tests
      if (val == 0) await this.getMyPersonalTests()

      // If it is on tab templates
      if (val == 1) await this.getMyTemplates()
    },

    async subIndex(val) {
      if (this.mainIndex == 0) {
        // If it is on tab tests
        if (val == 0) await this.getMyPersonalTests()

        // If it is on tab templates
        if (val == 1) await this.getSharedWithMeTests()

        if (val == 2) await this.getPublicTests()
      } else if (this.mainIndex == 1) {
        if (val == 0) await this.getMyTemplates()
        if (val == 1) await this.getPublicTemplates()
      }
    },
  },
  
  mounted() {
    this.filterModeratedSessions()
  },

  async created() {
    await this.getMyPersonalTests()
    await this.cleanTestStore()
  },

  methods: {
    async cleanTestStore() {
      await this.$store.dispatch('cleanTest')
    },
    
    async getMyPersonalTests() {
      await this.$store.dispatch('getTestsAdminByUser')
    },

    async getPublicTests() {
      await this.$store.dispatch('getPublicTests')
    },

    async getPublicTemplates() {
      await this.$store.dispatch('getPublicTemplates')
    },

    async getMyTemplates() {
      await this.$store.dispatch('getTemplatesOfUser')
    },

    async getSharedWithMeTests() {
      await this.$store.dispatch('getSharedWithMeTests', this.user.id)
    },

    async filterModeratedSessions() {
      const userModeratedTests = Object.values(this.user.myAnswers).filter(
        (answer) => answer.userTestType === 'moderated',
      )

      const cooperatorArray = []

      for (let i = 0; i < userModeratedTests.length; i++) {
        const testId = userModeratedTests[i].testDocId
        const testObj = await this.$store.dispatch('getTest', { id: testId })

        if (testObj) {
          const cooperatorObj = testObj.cooperators.find(
            (coop) => coop.userDocId == this.user.id,
          )
          cooperatorObj.testTitle = testObj.testTitle
          cooperatorObj.testAdmin = testObj.testAdmin
          cooperatorObj.id = testObj.id

          const today = new Date()
          const testDate = new Date(cooperatorObj.testDate)

          if (cooperatorObj && testDate.getDate() === today.getDate()) {
            cooperatorArray.push(cooperatorObj)
          }
        }
      }
      this.filteredModeratedSessions = cooperatorArray
      return cooperatorArray
    },

    goToCreateTestRoute() {
      this.$router.push('/createtest')
    },

    goTo(test) {
      if (this.mainIndex === 0) {
        if (this.subIndex === 0) {
          this.$router.push({
            name: 'ManagerView',
            params: { id: test.testDocId },
          })
        }
        // if it is the shared with me tests
        else if (this.subIndex === 1) {
          if (test.accessLevel >= 2) {
            this.$router.push({
              name: 'TestView',
              params: { id: test.testDocId },
            })
          } else {
            this.$router.push({
              name: 'ManagerView',
              params: { id: test.testDocId },
            })
          }
        } else if (this.subIndex === 2) {
          this.$router.push({
            name: 'ManagerView',
            params: { id: test.id },
          })
        } else if (this.subIndex === 3) {
          this.$router.push(`testview/${test.id}/${this.user.id}`)
        }
      }
    },

    setupTempDialog(temp) {
      this.temp = Object.assign({}, temp)
      this.tempDialog = true
    },
  },
}
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 400;
  letter-spacing: -0.5px;
}

.active-tab {
  background-color: rgba(249, 168, 38, 0.1) !important; 
  border-radius: 4px 4px 0 0; 
  color: #F9A826 !important; 
  font-weight: 500;
}

.custom-tabs .v-tab {
  letter-spacing: 0.5px;
  text-transform: none;
  min-width: 100px;
}

.custom-search-width {
  max-width: 300px;
}

.content-container {
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 300px;
}

.primary--text {
  color: #F9A826 !important;
}

/* Override Vuetify default colors for this component */
:deep(.v-tab--active) {
  color: #F9A826 !important;
}

:deep(.v-input__slot:focus-within) {
  border-color: #F9A826 !important;
}

:deep(.v-text-field--outlined fieldset) {
  border-color: rgba(0, 0, 0, 0.15);
}

:deep(.v-text-field--outlined:focus-within fieldset) {
  border-color: #F9A826 !important;
}
</style>