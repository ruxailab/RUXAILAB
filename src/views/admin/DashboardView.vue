<template>
  <v-container style="display: contents">
    <Snackbar />

    <!-- CREATE TEST BTN -->
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          large
          dark
          fab
          fixed
          bottom
          right
          color="#F9A826"
          @click="goToCreateTestRoute()"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon large>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('Dashboard.createNewTest') }}</span>
    </v-tooltip>

    <!-- LOADING -->
    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <div>
      <v-row justify="center" class="fill-height">
        <v-col cols="10">
          <!-- Mobile search button -->
          <v-row align="center" v-if="!searching">
            <span class="titleText ml-3">{{ $t('Dashboard.tests') }}</span>
            <v-spacer></v-spacer>
            <v-btn class="mr-3 hidden-md-and-up" icon @click="searching = true">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-row>
          <v-text-field
            :autofocus="searching"
            @blur="searching = false"
            v-else
            dense
            :label="$t('Dashboard.search')"
            prepend-inner-icon="mdi-magnify"
            outlined
            color="grey darken-2"
            v-model="search"
          ></v-text-field>
          <v-divider class="mb-1"></v-divider>

          <!-- Desktop Main Tabs -->
          <v-tabs
            v-model="mainIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
          >
            <v-tab>{{ $t('Dashboard.tests') }}</v-tab>
            <!-- <v-tab>Answers</v-tab>-->
            <v-tab>{{ $t('Dashboard.templates') }}</v-tab>

            <v-spacer></v-spacer>

            <v-text-field
              dense
              class="mt-1"
              :label="$t('Dashboard.search')"
              prepend-inner-icon="mdi-magnify"
              :disabled="mainIndex == 2 && subIndex == 1 ? true : false"
              outlined
              color="grey darken-2"
              v-model="search"
            ></v-text-field>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <!-- Desktop Tests/Answers Sub tabs -->
          <v-tabs
            v-model="subIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
            v-if="mainIndex === 0"
          >
            <v-tab>{{ $t('Dashboard.myTests') }}</v-tab>
            <v-tab>{{ $t('Dashboard.sharedWithMe') }}</v-tab>
            <v-tab>{{ $t('Dashboard.publicTests') }}</v-tab>

            <v-spacer></v-spacer>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <!-- Desktop Templates Sub tabs -->
          <v-tabs
            v-model="subIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
            v-if="mainIndex == 1"
          >
            <v-tab>{{ $t('Dashboard.personal') }}</v-tab>
            <v-tab>{{ $t('Dashboard.explore') }}</v-tab>

            <v-spacer></v-spacer>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>
          <!-- Mobile Main Button -->
          <v-select
            dense
            outlined
            v-model="mainIndex"
            class="hidden-md-and-up mx-2"
            :items="buttonItems"
          ></v-select>

          <!-- Mobile Sub Buttons -->
          <v-select
            dense
            outlined
            v-model="subIndex"
            class="hidden-md-and-up mx-2"
            :items="testButtonItems"
            v-if="mainIndex <= 1"
          ></v-select>
          <v-select
            dense
            outlined
            v-model="subIndex"
            class="hidden-md-and-up mx-2"
            :items="templateButtonItems"
            v-else
          ></v-select>

          <!-- Tests -> Personal  -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 0"
            :items="filteredTests"
            type="myTests"
          ></List>

          <!-- Tests -> Others  -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 1"
            :items="filteredTests"
            type="sharedWithMe"
          ></List>

          <!-- Tests -> Public Tests -->
          <List
            v-if="filteredTests != null && mainIndex == 0 && subIndex == 2"
            @clicked="goTo"
            :items="filteredTests"
            type="publicTests"
          ></List>

          <!-- Templates -> Personal -->
          <List
            @clicked="setupTempDialog"
            v-if="mainIndex == 1 && subIndex == 0"
            :items="filteredTemplates"
            type="myTemplates"
          ></List>

          <!-- Templates -> Public Templates -->
          <List
            @clicked="setupTempDialog"
            v-if="mainIndex == 1 && subIndex == 1"
            :items="filteredTemplates"
            type="publicTemplates"
          ></List>
        </v-col>
      </v-row>

      <TempDialog
        :dialog="tempDialog"
        :showDetails="showTempDetails"
        :template="temp"
        @reloadTemplates="reloadTemplates()"
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
      { text: 'Tests', value: 0 },
      { text: 'Answers', value: 1 },
      { text: 'Templates', value: 2 },
    ],
    testButtonItems: [
      { text: 'All', value: 0 },
      { text: 'Personal', value: 1 },
      { text: 'Others', value: 2 },
    ],
    templateButtonItems: [
      { text: 'Personal', value: 0 },
      { text: 'Explore', value: 1 },
    ],
    page: 1,
    lastPage: 1,
    itemsPerPage: 4,
    exploreTemplates: [],
    disableNext: false,
    disablePrevious: true,
    tempDialog: false,
    temp: {},
  }),
  methods: {
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
    reloadTemplates() {
      this.getMyTemplates()
      this.mainIndex = 1
      this.subIndex = 0
    },
    goToCreateTestRoute() {
      this.$router.push('/createtest')
    },
    goTo(test) {
      // if it is from the my tests tab
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
        }
      }
    },
    // nextPage() {
    //   this.page++;
    //   this.disablePrevious = false;
    //   if (this.paginatedTemps.length) {
    //     //if length == 0 got all templates in database
    //     if (this.page > this.lastPage)
    //       this.$store
    //         .dispatch(
    //           "getPaginationTemplates",
    //           Object.assign(
    //             {},
    //             {
    //               itemsPerPage: 2,
    //               last: this.paginatedTemps[this.paginatedTemps.length - 1].id,
    //             }
    //           )
    //         )
    //         .then(() => {
    //           this.exploreTemplates.push(...this.paginatedTemps);
    //           this.lastPage++;
    //           if (this.paginatedTemps.length == 0) {
    //             this.page--; //no more templates to show, go back one page
    //             alert("No more templates to show");
    //             this.disableNext = true;
    //           }
    //         });
    //   } else if (this.page == this.lastPage - 1) {
    //     this.disableNext = true;
    //   }
    // },
    // previousPage() {
    //   this.page--;
    //   if (this.page <= 1) this.disablePrevious = true;
    //   this.disableNext = false;
    // },
    setupTempDialog(temp) {
      this.temp = Object.assign({}, temp)
      this.tempDialog = true
    },
  },
  computed: {
    user() {
      return this.$store.getters.user
    },
    tests() {
      return this.$store.state.Tests.tests
    },
    filteredTests() {
      let arr = null

      arr = this.tests?.filter((test) => {
        return test.testTitle.toLowerCase().includes(this.search.toLowerCase())
      })

      return arr ?? this.tests
    },

    templates() {
      return this.$store.state.Templates.templates || []
    },
    filteredTemplates() {
      return this.templates.filter((temp) =>
        temp.header.templateTitle
          .toLowerCase()
          .includes(this.search.toLowerCase()),
      )
    },
    loading() {
      return this.$store.getters.loading
    },
    // paginatedTemps() {
    //   return this.$store.getters.paginatedTemps;
    // },
    // showOnExplore() {
    //   // let array = [];
    //   let temps = null;
    //   let start = (this.page - 1) * this.itemsPerPage;
    //   let finish = this.page * this.itemsPerPage;

    //   temps = this.exploreTemplates.slice(start, finish);

    //   return temps;
    // },
    showTempDetails() {
      return !(this.mainIndex == 2 && this.subIndex == 0) //dont show on this tab
    },
  },
  watch: {
    async mainIndex(val) {
      this.subIndex = 0 //reset subIndex when main index change

      // If it is on tab tests
      if (val == 0) {
        await this.getMyPersonalTests()
      }

      // If it is on tab templates
      if (val == 1) {
        await this.getMyTemplates()
      }
    },
    async subIndex(val) {
      if (this.mainIndex == 0) {
        // If it is on tab tests
        if (val == 0) {
          await this.getMyPersonalTests()
        }

        // If it is on tab templates
        if (val == 1) {
          await this.getSharedWithMeTests()
        }

        if (val == 2) {
          await this.getPublicTests()
        }
      } else if (this.mainIndex == 1) {
        if (val == 0) {
          await this.getMyTemplates()
        }

        if (val == 1) {
          await this.getPublicTemplates()
        }
      }
    },
  },
  async created() {
    await this.getMyPersonalTests()
  },
}
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
</style>
