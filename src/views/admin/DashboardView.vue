<template>
  <v-sheet class="fill-height">
    <v-container
      class="mt-6"
      :class="{
        'pa-2': $vuetify.breakpoint.xsOnly,
        'pa-4': $vuetify.breakpoint.smOnly,
      }"
    >
      <Snackbar />

      <!-- Responsive Dashboard Header -->
      <v-card dark class="mb-4" :style="headerGradientStyle" elevation="2">
        <v-card-text
          :class="{
            'text-center py-4': $vuetify.breakpoint.smAndUp,
            'text-center py-3': $vuetify.breakpoint.xsOnly,
          }"
        >
          <h1
            :class="[
              {
                'text-h4': $vuetify.breakpoint.mdAndUp,
                'text-h5': $vuetify.breakpoint.sm,
                'text-h6': $vuetify.breakpoint.xsOnly,
              },
              'font-weight-bold',
              'white--text',
              'mb-2',
            ]"
          >
            RUXAILAB Dashboard
          </h1>
          <div
            class="white--text"
            :class="{
              'text-body-1': $vuetify.breakpoint.smAndUp,
              'text-body-2': $vuetify.breakpoint.xsOnly,
            }"
          >
            Manage your tests and templates
          </div>

          <!-- Responsive Quick Access Buttons -->
          <v-row
            justify="center"
            :class="{
              'mt-5': $vuetify.breakpoint.smAndUp,
              'mt-3': $vuetify.breakpoint.xsOnly,
            }"
          >
            <v-btn
              color="white"
              :class="{
                'mx-2': $vuetify.breakpoint.smAndUp,
                'mx-1': $vuetify.breakpoint.xsOnly,
              }"
              :small="$vuetify.breakpoint.xsOnly"
              outlined
              @click="goToCreateTestRoute"
            >
              <v-icon left :small="$vuetify.breakpoint.xsOnly">mdi-plus</v-icon>
              <span :class="{ 'd-none d-sm-inline': true }">New Test</span>
              <span :class="{ 'd-inline d-sm-none': true }">New</span>
            </v-btn>

            <v-btn
              color="white"
              :class="{
                'mx-2': $vuetify.breakpoint.smAndUp,
                'mx-1': $vuetify.breakpoint.xsOnly,
              }"
              :small="$vuetify.breakpoint.xsOnly"
              outlined
              @click="
                mainIndex = 1
                subIndex = 0
              "
            >
              <v-icon left :small="$vuetify.breakpoint.xsOnly"
                >mdi-file-document-outline</v-icon
              >
              Templates
            </v-btn>

            <v-btn
              v-if="filteredModeratedSessions.length > 0"
              color="white"
              :class="{
                'mx-2': $vuetify.breakpoint.smAndUp,
                'mx-1': $vuetify.breakpoint.xsOnly,
              }"
              :small="$vuetify.breakpoint.xsOnly"
              outlined
              @click="
                mainIndex = 0
                subIndex = 3
              "
            >
              <v-icon left :small="$vuetify.breakpoint.xsOnly"
                >mdi-clock-outline</v-icon
              >
              <span :class="{ 'd-none d-sm-inline': true }">Sessions</span>
              <span :class="{ 'd-inline d-sm-none': true }">Sessions</span>
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Main Content Card - Responsive -->
      <v-card class="rounded-lg" elevation="2" :style="mainCardStyle">
        <!-- Responsive Toolbar -->
        <v-toolbar
          flat
          color="transparent"
          :height="$vuetify.breakpoint.xsOnly ? '52' : '60'"
        >
          <v-card-title
            :class="{
              'pa-0': $vuetify.breakpoint.smAndUp,
              'pa-0 text-subtitle-1': $vuetify.breakpoint.xsOnly,
            }"
          >
            <span
              :style="gradientTextStyle"
              class="font-weight-bold"
              :class="{ 'd-none d-sm-flex': true }"
            >
              {{ currentTabTitle }}
            </span>
            <span
              :style="gradientTextStyle"
              class="font-weight-bold d-flex d-sm-none"
            >
              {{ mobileTabTitle }}
            </span>
          </v-card-title>

          <v-spacer></v-spacer>

          <!-- Responsive Search -->
          <v-text-field
            v-model="search"
            :disabled="isSearchDisabled"
            hide-details
            :label="
              $vuetify.breakpoint.xsOnly ? 'Search' : $t('Dashboard.search')
            "
            prepend-inner-icon="mdi-magnify"
            clearable
            outlined
            dense
            color="deep-orange accent-3"
            :style="{
              'max-width': $vuetify.breakpoint.mdAndUp
                ? '280px'
                : $vuetify.breakpoint.sm
                ? '180px'
                : '120px',
            }"
            @click:clear="search = ''"
          />
        </v-toolbar>

        <v-divider></v-divider>

        <!-- Desktop Tabs - Unchanged -->
        <v-card class="mb-2 hidden-sm-and-down" flat>
          <v-tabs
            v-model="mainIndex"
            background-color="white"
            color="deep-orange accent-3"
            center-active
            height="42"
            show-arrows
          >
            <v-tab>
              <v-icon left small>mdi-clipboard-text-outline</v-icon>
              {{ $t('Dashboard.tests') }}
            </v-tab>
            <v-tab>
              <v-icon left small>mdi-file-document-outline</v-icon>
              {{ $t('Dashboard.templates') }}
            </v-tab>
          </v-tabs>
        </v-card>

        <!-- Desktop Sub Tabs - Unchanged -->
        <v-card v-if="mainIndex === 0" class="mb-2 hidden-sm-and-down" flat>
          <v-tabs
            v-model="subIndex"
            background-color="white"
            color="deep-orange accent-3"
            height="36"
            show-arrows
          >
            <v-tab>
              <v-icon small left>mdi-account</v-icon>
              {{ $t('Dashboard.myTests') }}
            </v-tab>
            <v-tab>
              <v-icon small left>mdi-share-variant</v-icon>
              {{ $t('Dashboard.sharedWithMe') }}
            </v-tab>
            <v-tab>
              <v-icon small left>mdi-earth</v-icon>
              {{ $t('Dashboard.publicTests') }}
            </v-tab>
            <v-tab>
              <v-icon small left>mdi-clock-outline</v-icon>
              Sessions
            </v-tab>
          </v-tabs>
        </v-card>

        <!-- Add Desktop Sub Tabs for Templates - Unchanged -->
        <v-card v-if="mainIndex === 1" class="mb-2 hidden-sm-and-down" flat>
          <v-tabs
            v-model="subIndex"
            background-color="white"
            color="deep-orange accent-3"
            height="36"
            show-arrows
          >
            <v-tab>
              <v-icon small left>mdi-account</v-icon>
              Personal
            </v-tab>
            <v-tab>
              <v-icon small left>mdi-compass</v-icon>
              Explore
            </v-tab>
          </v-tabs>
        </v-card>

        <!-- Enhanced Mobile Tab Selectors -->
        <div class="px-3 pt-2 hidden-md-and-up">
          <v-select
            v-model="mainIndex"
            :items="buttonItems"
            item-text="text"
            item-value="value"
            label="Section"
            dense
            outlined
            hide-details
            class="mb-2"
            color="deep-orange"
          ></v-select>

          <v-select
            v-if="mainIndex === 0"
            v-model="subIndex"
            :items="testButtonItems"
            item-text="text"
            item-value="value"
            label="Category"
            dense
            outlined
            hide-details
            class="mb-2"
            color="deep-orange"
          ></v-select>

          <v-select
            v-if="mainIndex === 1"
            v-model="subIndex"
            :items="templateButtonItems"
            item-text="text"
            item-value="value"
            label="Category"
            dense
            outlined
            hide-details
            class="mb-2"
            color="deep-orange"
          ></v-select>
        </div>

        <!-- Content Area - Responsive padding -->
        <v-card-text
          :class="{
            'pa-4': $vuetify.breakpoint.smAndUp,
            'pa-2': $vuetify.breakpoint.xsOnly,
          }"
        >
          <!-- Tests -> Personal  -->
          <div v-if="mainIndex === 0 && subIndex === 0">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line@3"
            ></v-skeleton-loader>
            <List
              v-else
              :items="sortedFilteredTests"
              type="myTests"
              @clicked="goTo"
              @refresh="getMyPersonalTests"
            />

            <!-- Empty state - Responsive - FIXED class binding syntax -->
            <v-card
              v-if="!loading && (!filteredTests || filteredTests.length === 0)"
              :class="[
                { 'text-center': true, 'mt-4': true },
                'pa-6',
                'pa-4',
                'pa-3',
              ]"
              outlined
            >
              <v-icon
                :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
                color="deep-orange lighten-4"
                class="mb-3"
              >
                mdi-clipboard-text-outline
              </v-icon>
              <h3
                :class="{
                  'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                  'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                  'font-weight-medium': true,
                  'grey--text': true,
                  'text--darken-2': true,
                }"
              >
                No tests found
              </h3>
              <p
                :class="{
                  'text-caption': $vuetify.breakpoint.xsOnly,
                  'grey--text': true,
                  'text--darken-1': true,
                  'mt-2': true,
                  'mb-4': true,
                }"
              >
                Create a new test to get started
              </p>
              <v-btn
                color="deep-orange"
                outlined
                @click="goToCreateTestRoute"
                :small="$vuetify.breakpoint.xsOnly"
              >
                <v-icon left :small="$vuetify.breakpoint.xsOnly"
                  >mdi-plus</v-icon
                >
                New Test
              </v-btn>
            </v-card>
          </div>

          <!-- Tests -> Shared With Me  -->
          <div v-else-if="mainIndex === 0 && subIndex === 1">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line@2"
            ></v-skeleton-loader>
            <List
              v-else
              :items="sortedFilteredTests"
              type="sharedWithMe"
              @clicked="goTo"
            />

            <!-- Empty state - Fixed class binding syntax -->
            <v-card
              v-if="!loading && (!filteredTests || filteredTests.length === 0)"
              :class="[
                { 'text-center': true, 'mt-4': true },
                'pa-6',
                'pa-4',
                'pa-3',
              ]"
              outlined
            >
              <v-icon
                :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
                color="deep-orange lighten-4"
                class="mb-3"
              >
                mdi-share-variant
              </v-icon>
              <h3
                :class="{
                  'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                  'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                  'font-weight-medium': true,
                  'grey--text': true,
                  'text--darken-2': true,
                }"
              >
                No shared tests
              </h3>
              <p
                :class="{
                  'text-body-2': $vuetify.breakpoint.smAndUp,
                  'text-caption': $vuetify.breakpoint.xsOnly,
                  'grey--text': true,
                  'text--darken-1': true,
                  'mt-2': true,
                }"
              >
                Tests shared with you will appear here
              </p>
            </v-card>
          </div>

          <!-- Tests -> Public Tests - Similar responsive improvements for other sections -->
          <div v-else-if="mainIndex === 0 && subIndex === 2">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line@2"
            ></v-skeleton-loader>
            <List
              v-else
              :items="sortedFilteredTests"
              type="publicTests"
              @clicked="goTo"
            />

            <!-- Empty state - Responsive -->
            <v-card
              v-if="!loading && (!filteredTests || filteredTests.length === 0)"
              :class="{
                'pa-6': $vuetify.breakpoint.mdAndUp,
                'pa-4': $vuetify.breakpoint.sm,
                'pa-3': $vuetify.breakpoint.xsOnly,
                'text-center mt-4': true,
              }"
              outlined
            >
              <v-icon
                :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
                color="deep-orange lighten-4"
                class="mb-3"
              >
                mdi-earth
              </v-icon>
              <h3
                :class="[
                  {
                    'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                    'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                  },
                  'font-weight-medium',
                  'grey--text',
                  'text--darken-2',
                ]"
              >
                No public tests found
              </h3>
              <p
                :class="[
                  {
                    'text-body-2': $vuetify.breakpoint.smAndUp,
                    'text-caption': $vuetify.breakpoint.xsOnly,
                  },
                  'grey--text',
                  'text--darken-1',
                  'mt-2',
                ]"
              >
                Public tests will appear here
              </p>
            </v-card>
          </div>

          <!-- Tests -> Sessions -->
          <div
            v-else-if="
              mainIndex === 0 &&
                subIndex === 3 &&
                filteredModeratedSessions.length > 0
            "
          >
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line@2"
            ></v-skeleton-loader>
            <List
              v-else
              :items="filteredModeratedSessions"
              type="sessions"
              @clicked="goTo"
            />
          </div>

          <!-- Empty sessions state - Responsive -->
          <v-card
            v-else-if="mainIndex === 0 && subIndex === 3"
            :class="{
              'pa-6': $vuetify.breakpoint.mdAndUp,
              'pa-4': $vuetify.breakpoint.sm,
              'pa-3': $vuetify.breakpoint.xsOnly,
              'text-center': true,
            }"
            outlined
          >
            <v-icon
              :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
              color="deep-orange lighten-4"
              class="mb-3"
            >
              mdi-clock-outline
            </v-icon>
            <h3
              :class="[
                {
                  'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                  'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                },
                'font-weight-medium',
                'grey--text',
                'text--darken-2',
              ]"
            >
              No active sessions
            </h3>
            <p
              :class="[
                {
                  'text-body-2': $vuetify.breakpoint.smAndUp,
                  'text-caption': $vuetify.breakpoint.xsOnly,
                },
                'grey--text',
                'text--darken-1',
                'mt-2',
              ]"
            >
              Create a session to start moderating tests
            </p>
          </v-card>

          <!-- Templates -> Personal -->
          <div v-else-if="mainIndex === 1 && subIndex === 0">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line@2"
            ></v-skeleton-loader>
            <List
              v-else
              :items="filteredTemplates"
              type="myTemplates"
              @clicked="setupTempDialog"
            />

            <!-- Empty state - Responsive -->
            <v-card
              v-if="
                !loading &&
                  (!filteredTemplates || filteredTemplates.length === 0)
              "
              :class="{
                'pa-6': $vuetify.breakpoint.mdAndUp,
                'pa-4': $vuetify.breakpoint.sm,
                'pa-3': $vuetify.breakpoint.xsOnly,
                'text-center mt-4': true,
              }"
              outlined
            >
              <v-icon
                :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
                color="deep-orange lighten-4"
                class="mb-3"
              >
                mdi-file-document-outline
              </v-icon>
              <h3
                :class="[
                  {
                    'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                    'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                  },
                  'font-weight-medium',
                  'grey--text',
                  'text--darken-2',
                ]"
              >
                No templates found
              </h3>
              <p
                :class="[
                  {
                    'text-body-2': $vuetify.breakpoint.smAndUp,
                    'text-caption': $vuetify.breakpoint.xsOnly,
                  },
                  'grey--text',
                  'text--darken-1',
                  'mt-2',
                ]"
              >
                Create a template to get started
              </p>
            </v-card>
          </div>

          <!-- Templates -> Public Templates -->
          <div v-else-if="mainIndex === 1 && subIndex === 1">
            <v-skeleton-loader
              v-if="loading"
              type="list-item-three-line@2"
            ></v-skeleton-loader>
            <List
              v-else
              :items="filteredTemplates"
              type="publicTemplates"
              @clicked="setupTempDialog"
            />

            <!-- Empty state - Responsive -->
            <v-card
              v-if="
                !loading &&
                  (!filteredTemplates || filteredTemplates.length === 0)
              "
              :class="{
                'pa-6': $vuetify.breakpoint.mdAndUp,
                'pa-4': $vuetify.breakpoint.sm,
                'pa-3': $vuetify.breakpoint.xsOnly,
                'text-center mt-4': true,
              }"
              outlined
            >
              <v-icon
                :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
                color="deep-orange lighten-4"
                class="mb-3"
              >
                mdi-file-document-multiple-outline
              </v-icon>
              <h3
                :class="[
                  {
                    'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                    'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                  },
                  'font-weight-medium',
                  'grey--text',
                  'text--darken-2',
                ]"
              >
                No public templates found
              </h3>
              <p
                :class="[
                  {
                    'text-body-2': $vuetify.breakpoint.smAndUp,
                    'text-caption': $vuetify.breakpoint.xsOnly,
                  },
                  'grey--text',
                  'text--darken-1',
                  'mt-2',
                ]"
              >
                Public templates will appear here
              </p>
            </v-card>
          </div>

          <!-- No search results message - Responsive -->
          <v-card
            v-if="search && resultCount === 0 && !loading"
            :class="{
              'pa-6': $vuetify.breakpoint.mdAndUp,
              'pa-4': $vuetify.breakpoint.sm,
              'pa-3': $vuetify.breakpoint.xsOnly,
              'text-center': true,
            }"
            outlined
          >
            <v-icon
              :size="$vuetify.breakpoint.xsOnly ? '36' : '48'"
              color="grey lighten-1"
              class="mb-3"
            >
              mdi-file-search-outline
            </v-icon>
            <h3
              :class="[
                {
                  'text-subtitle-1': $vuetify.breakpoint.smAndUp,
                  'text-subtitle-2': $vuetify.breakpoint.xsOnly,
                },
                'font-weight-medium',
                'grey--text',
                'text--darken-2',
              ]"
            >
              No results found
            </h3>
            <p
              :class="[
                {
                  'text-body-2': $vuetify.breakpoint.smAndUp,
                  'text-caption': $vuetify.breakpoint.xsOnly,
                },
                'grey--text',
                'text--darken-1',
                'mt-2',
              ]"
            >
              Try using different keywords or filters
            </p>
          </v-card>
        </v-card-text>

        <!-- Responsive Pagination -->
        <v-card-actions v-if="shouldShowPagination">
          <v-spacer></v-spacer>
          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="
              $vuetify.breakpoint.xsOnly
                ? 3
                : $vuetify.breakpoint.smOnly
                ? 4
                : 5
            "
            color="deep-orange"
            :class="{ 'my-2': $vuetify.breakpoint.xsOnly }"
          ></v-pagination>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>

      <!-- Create Button - Responsive sizing -->
      <v-btn
        fab
        fixed
        bottom
        right
        color="deep-orange accent-3"
        :class="{
          'mb-4 mr-4': $vuetify.breakpoint.smAndUp,
          'mb-3 mr-3': $vuetify.breakpoint.xsOnly,
        }"
        :small="$vuetify.breakpoint.xsOnly"
        elevation="2"
        @click="goToCreateTestRoute"
        data-testid="create-test-btn"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <!-- Loading overlay -->
      <v-overlay v-if="loading" :opacity="0.7">
        <v-progress-circular
          indeterminate
          color="deep-orange accent-3"
          :size="$vuetify.breakpoint.xsOnly ? '48' : '64'"
        />
      </v-overlay>

      <TempDialog
        :dialog="tempDialog"
        :template="temp"
        :allow-create="true"
        @close="tempDialog = false"
      />
    </v-container>
  </v-sheet>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'
import List from '@/components/atoms/ListComponent'
import TempDialog from '@/components/molecules/TemplateInfoDialog'

export default {
  name: 'DashboardView',

  components: {
    Snackbar,
    List,
    TempDialog,
  },

  data: () => ({
    search: '',
    mainIndex: 0,
    subIndex: 0,
    buttonItems: [
      { text: 'Tests', value: 0 },
      { text: 'Templates', value: 1 },
    ],
    testButtonItems: [
      { text: 'My Tests', value: 0 },
      { text: 'Shared With Me', value: 1 },
      { text: 'Public Tests', value: 2 },
      { text: 'Sessions', value: 3 },
    ],
    templateButtonItems: [
      { text: 'Personal', value: 0 },
      { text: 'Explore', value: 1 },
    ],
    tempDialog: false,
    temp: {},
    filteredModeratedSessions: [],

    // Simplified data - removed options related data
    page: 1,
    itemsPerPage: 10,
    refreshInterval: null,
  }),

  computed: {
    // Style objects
    headerGradientStyle() {
      return {
        background: 'linear-gradient(to right, #ff8a00, #ff5252)',
      }
    },

    mainCardStyle() {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
      }
    },

    gradientTextStyle() {
      return {
        background: 'linear-gradient(to right, #ff8a00, #ff5252)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
      }
    },

    // Dynamic title based on current tab
    currentTabTitle() {
      if (this.mainIndex === 0) {
        switch (this.subIndex) {
          case 0:
            return 'My Tests'
          case 1:
            return 'Tests Shared With Me'
          case 2:
            return 'Public Tests'
          case 3:
            return 'Active Sessions'
          default:
            return 'Tests'
        }
      } else {
        return this.subIndex === 0 ? 'Personal Templates' : 'Explore Templates'
      }
    },

    // Shortened title for mobile displays
    mobileTabTitle() {
      if (this.mainIndex === 0) {
        switch (this.subIndex) {
          case 0:
            return 'My Tests'
          case 1:
            return 'Shared'
          case 2:
            return 'Public'
          case 3:
            return 'Sessions'
          default:
            return 'Tests'
        }
      } else {
        return this.subIndex === 0 ? 'My Templates' : 'Explore'
      }
    },

    // Existing computed properties
    user() {
      return this.$store.getters.user || {}
    },

    tests() {
      return this.$store.state.Tests.tests || []
    },

    filteredTests() {
      if (!this.tests) return []

      let result = this.tests

      // Apply search filter only
      if (this.search) {
        result = result.filter(
          (test) =>
            test.testTitle &&
            test.testTitle.toLowerCase().includes(this.search.toLowerCase()),
        )
      }

      return result
    },

    // Sorted and paginated data - simplified sorting
    sortedFilteredTests() {
      let result = [...this.filteredTests]

      // Default sort by newest
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )

      // Apply pagination
      const startIndex = (this.page - 1) * this.itemsPerPage
      return result.slice(startIndex, startIndex + this.itemsPerPage)
    },

    totalPages() {
      return Math.ceil(this.filteredTests.length / this.itemsPerPage)
    },

    shouldShowPagination() {
      return this.filteredTests.length > this.itemsPerPage
    },

    templates() {
      return this.$store.state.Templates.templates || []
    },

    filteredTemplates() {
      if (!this.search || !this.templates) return this.templates

      return this.templates.filter(
        (temp) =>
          temp.header &&
          temp.header.templateTitle &&
          temp.header.templateTitle
            .toLowerCase()
            .includes(this.search.toLowerCase()),
      )
    },

    loading() {
      return this.$store.getters.loading
    },

    isSearchDisabled() {
      return this.mainIndex === 0 && this.subIndex === 1
    },

    currentType() {
      return this.mainIndex === 0 ? 'test' : 'template'
    },

    resultCount() {
      if (this.mainIndex === 0) {
        return this.filteredTests ? this.filteredTests.length : 0
      }
      return this.filteredTemplates ? this.filteredTemplates.length : 0
    },

    // Dashboard stats
    totalTests() {
      return this.tests.length || 0
    },

    totalTemplates() {
      return this.templates.length || 0
    },

    activeSessions() {
      return this.filteredModeratedSessions.length || 0
    },

    myTestsCount() {
      return this.tests.filter(
        (test) =>
          test.testAdmin === this.user.id || test.testAdmin === this.user.email,
      ).length
    },
  },

  watch: {
    async mainIndex(val) {
      this.subIndex = 0 // reset subIndex when main index changes

      if (val === 0) {
        await this.getMyPersonalTests()
      } else if (val === 1) {
        await this.getMyTemplates()
      }
    },

    async subIndex(val) {
      if (this.mainIndex === 0) {
        switch (val) {
          case 0:
            await this.getMyPersonalTests()
            break
          case 1:
            await this.getSharedWithMeTests()
            break
          case 2:
            await this.getPublicTests()
            break
        }
      } else if (this.mainIndex === 1) {
        if (val === 0) {
          await this.getMyTemplates()
        } else if (val === 1) {
          await this.getPublicTemplates()
        }
      }
    },
  },

  async created() {
    await this.getMyPersonalTests()
    await this.cleanTestStore()
    this.filterModeratedSessions()
    this.generateRecentActivity()

    // Set up refresh interval - refresh data every 5 minutes
    this.refreshInterval = setInterval(this.refreshData, 300000)
  },

  beforeDestroy() {
    // Clear interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },

  methods: {
    async cleanTestStore() {
      await this.$store.dispatch('cleanTest')
    },

    async getMyPersonalTests() {
      await this.$store.dispatch('getTestsAdminByUser')
    },

    async getPublicTests() {
      try {
        await this.$store.dispatch('getPublicTests')
        console.log('Public tests loaded:', this.filteredTests)
      } catch (error) {
        console.error('Error loading public tests:', error)
      }
    },

    async getPublicTemplates() {
      await this.$store.dispatch('getPublicTemplates')
    },

    async getMyTemplates() {
      await this.$store.dispatch('getTemplatesOfUser')
    },

    async getSharedWithMeTests() {
      try {
        await this.$store.dispatch('getSharedWithMeTests', this.user.id)
        console.log('Shared tests loaded:', this.filteredTests)
      } catch (error) {
        console.error('Error loading shared tests:', error)
      }
    },

    async filterModeratedSessions() {
      if (!this.user || !this.user.myAnswers) {
        this.filteredModeratedSessions = []
        return []
      }

      const userModeratedTests = Object.values(this.user.myAnswers).filter(
        (answer) => answer && answer.userTestType === 'moderated',
      )

      const cooperatorArray = []

      for (const userTest of userModeratedTests) {
        const testId = userTest.testDocId

        try {
          const testObj = await this.$store.dispatch('getTest', { id: testId })

          if (testObj && testObj.cooperators) {
            const cooperatorObj = testObj.cooperators.find(
              (coop) => coop.userDocId === this.user.id,
            )

            if (cooperatorObj) {
              cooperatorObj.testTitle = testObj.testTitle
              cooperatorObj.testAdmin = testObj.testAdmin
              cooperatorObj.id = testObj.id

              const today = new Date()
              const testDate = new Date(cooperatorObj.testDate)

              if (testDate.getDate() === today.getDate()) {
                cooperatorArray.push(cooperatorObj)
              }
            }
          }
        } catch (error) {
          console.error('Error fetching test:', error)
        }
      }

      this.filteredModeratedSessions = cooperatorArray
      return cooperatorArray
    },

    goToCreateTestRoute() {
      this.$router.push('/createtest')
    },

    goTo(test) {
      if (!test) return

      if (this.mainIndex === 0) {
        if (this.subIndex === 0) {
          this.$router.push({
            name: 'ManagerView',
            params: { id: test.testDocId || test.id },
          })
        } else if (this.subIndex === 1) {
          const route = test.accessLevel >= 2 ? 'TestView' : 'ManagerView'
          this.$router.push({
            name: route,
            params: { id: test.testDocId || test.id },
          })
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
      if (!temp) return
      this.temp = { ...temp }
      this.tempDialog = true
    },

    // Simplified refresh method
    async refreshData() {
      if (this.mainIndex === 0) {
        switch (this.subIndex) {
          case 0:
            await this.getMyPersonalTests()
            break
          case 1:
            await this.getSharedWithMeTests()
            break
          case 2:
            await this.getPublicTests()
            break
          case 3:
            await this.filterModeratedSessions()
            break
        }
      } else if (this.mainIndex === 1) {
        if (this.subIndex === 0) {
          await this.getMyTemplates()
        } else if (this.subIndex === 1) {
          await this.getPublicTemplates()
        }
      }

      this.generateRecentActivity()
    },

    // Generate sample recent activity
    generateRecentActivity() {
      const activityTypes = [
        { icon: 'mdi-file-edit-outline', color: 'deep-orange' },
        { icon: 'mdi-eye', color: 'blue' },
        { icon: 'mdi-share', color: 'green' },
        { icon: 'mdi-plus-circle-outline', color: 'purple' },
      ]

      this.recentActivity = []

      // Generate activity from recent tests/templates
      const allTests = [...this.tests]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0),
        )
        .slice(0, 3)

      allTests.forEach((test) => {
        const randomActivity =
          activityTypes[Math.floor(Math.random() * activityTypes.length)]
        const timeAgo = this.getTimeAgo(
          new Date(test.updatedAt || test.createdAt || new Date()),
        )

        this.recentActivity.push({
          icon: randomActivity.icon,
          color: randomActivity.color,
          title: `${test.testTitle || 'Untitled Test'} was updated`,
          time: timeAgo,
          link: `/manager/${test.id || test.testDocId}`,
        })
      })
    },

    // Helper to format relative time
    getTimeAgo(date) {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)

      if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
      }

      const hours = Math.floor(minutes / 60)
      if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
      }

      const days = Math.floor(hours / 24)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    },
  },
}
</script>

<style scoped>
/* Add responsive styles */
@media (max-width: 600px) {
  .v-btn {
    min-width: 0 !important;
  }
}
</style>
