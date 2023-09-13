<template>
  <v-container style="display: contents">
    <Snackbar />
    {{ storeTemplates }}
    <!-- {{ allTests }}
        <br />
        <br />
        {{ user }}
        <br />
        <br />
        {{ filteredMyTemps }}
        <br />
        <br />
        {{ showOnExplore }} -->
    {{ this.exploreTemplates }}
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
          @click="pushCreate()"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon large>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>Create new test</span>
    </v-tooltip>

    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <div>
      <v-row justify="center" class="fill-height">
        <v-col cols="10">
          <!-- Mobile search button -->
          <v-row align="center" v-if="!searching">
            <span class="titleText ml-3">Tests</span>
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
            label="Search"
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
            <v-tab>Tests</v-tab>
            <v-tab>Answers</v-tab>
            <v-tab>Templates</v-tab>

            <v-spacer></v-spacer>

            <v-text-field
              dense
              class="mt-1"
              label="Search"
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
            v-if="mainIndex !== 2"
          >
            <v-tab>All</v-tab>
            <v-tab>Personal</v-tab>
            <v-tab>Others</v-tab>

            <v-spacer></v-spacer>
          </v-tabs>
          <v-divider class="hidden-sm-and-down"></v-divider>

          <!-- Desktop Templates Sub tabs -->
          <v-tabs
            v-model="subIndex"
            background-color="transparent"
            color="black"
            class="hidden-sm-and-down"
            v-if="mainIndex == 2"
          >
            <v-tab>Personal</v-tab>
            <v-tab @click="setupTempDialog">Explore</v-tab>

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

          <!-- Tests -> All -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 0"
            :items="filteredAllTests"
            type="myCoops"
          ></List>

          <!-- Tests -> Personal  -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 1"
            :items="filteredMyTests"
            type="myTests"
          ></List>

          <!-- Tests -> Others  -->
          <List
            @clicked="goTo"
            v-if="mainIndex == 0 && subIndex == 2"
            :items="filteredMyCoops"
            type="myCoops"
          ></List>

          <!-- Answers -> All 
          <List
            @clicked="goTo"
            v-if="mainIndex == 1 && subIndex == 0"
            :items="filteredMyAnswers"
            type="answers"
          ></List>
-->
          <!-- Answers -> Personal 
          <List
            @clicked="goTo"
            v-if="mainIndex == 1 && subIndex == 1"
            :items="filteredPersonalAnswers"
            type="answers"
          ></List>
-->
          <!-- Answers -> Ohters 
          <List
            @clicked="goTo"
            v-if="mainIndex == 1 && subIndex == 2"
            :items="filteredOtherAnswers"
            type="answers"
          ></List>
-->
          <!-- Templates -> Personal  -->
          <List
            @clicked="setupTempDialog"
            v-if="mainIndex == 2 && subIndex == 0"
            :items="filteredMyTemps"
            type="template"
          ></List>

          <!-- Templates -> Explore -->
          <List
            @clicked="setupTempDialog"
            v-if="mainIndex == 2 && subIndex == 1"
            :items="showOnExplore"
            type="template"
            :hasPagination="true"
            @nextPage="nextPage()"
            :disableNext="disableNext"
            @previousPage="previousPage()"
            :disablePrevious="disablePrevious"
          ></List>
        </v-col>
      </v-row>

      <TempDialog
        :dialog="tempDialog"
        :showDetails="showTempDetails"
        :template="temp"
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
    pushCreate() {
      this.$router.push('/createtest').catch(() => {})
    },
    goTo(test) {
      this.$router
        .push(
          (this.$store.state.Auth.user.accessLevel <= 1
            ? '/managerview/'
            : '/testview/') + test.id,
        )
        .catch(() => {})
    },
    nextPage() {
      this.page++
      this.disablePrevious = false
      if (this.paginatedTemps.length) {
        //if length == 0 got all templates in database
        if (this.page > this.lastPage)
          this.$store
            .dispatch(
              'getPaginationTemplates',
              Object.assign(
                {},
                {
                  itemsPerPage: 2,
                  last: this.paginatedTemps[this.paginatedTemps.length - 1].id,
                },
              ),
            )
            .then(() => {
              this.exploreTemplates.push(...this.paginatedTemps)
              this.lastPage++
              if (this.paginatedTemps.length == 0) {
                this.page-- //no more templates to show, go back one page
                alert('No more templates to show')
                this.disableNext = true
              }
            })
      } else if (this.page == this.lastPage - 1) {
        this.disableNext = true
      }
    },
    previousPage() {
      this.page--
      if (this.page <= 1) this.disablePrevious = true
      this.disableNext = false
    },
    setupTempDialog() {
      this.$store.dispatch('getAllTemplates', {})
      this.temp = this.$store.state.Templates
      // this.temp = Object.assign({}, temp);
      this.tempDialog = true
    },
  },
  computed: {
    user() {
      return this.$store.getters.user
    },
    allTests() {
      return this.$store.state.Tests.Tests
    },
    filteredAllTests() {
      return this.allTests
    },
    filteredMyTests() {
      /*
      if (this.user)
        return (
          this.user.myTests.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
      */
      return this.allTests
    },
    filteredMyCoops() {
      /*
      if (this.user)
        return (
          this.user.myCoops.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
        */
      return this.allTests
    },
    filteredMyAnswers() {
      /*
      if (this.user)
        return (
          this.user.myAnswers.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
      return [];
        */
      return this.allTests
    },
    personalAnswers() {
      /*
      if (this.user) {
        return (
          this.user.myAnswers.filter((test) => {
            return test.author == this.user.email;
          }) || []
        );

      }

      return [];
        */
      return this.allTests
    },
    filteredPersonalAnswers() {
      /*
      if (this.user)
        return (
          this.personalAnswers.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
        */
      return []
    },
    otherAnswers() {
      /*
      if (this.user) {
        return (
          this.user.myAnswers.filter((test) => {
            return test.author !== this.user.email;
          }) || []
        );
      }
*/
      return []
    },
    filteredOtherAnswers() {
      /*
      if (this.user)
        return (
          this.otherAnswers.filter((test) => {
            return test.title.toLowerCase().includes(this.search.toLowerCase());
          }) || []
        );
        */
      return []
    },
    storeTemplates() {
      return this.$store.getters.templates || []
    },
    myTempsHeaders() {
      return this.user.myTemplates.map((temp) => {
        return {
          header: temp,
        }
      })
    },
    filteredMyTemps() {
      return this.myTempsHeaders.filter((temp) => {
        return temp.header.title
          .toLowerCase()
          .includes(this.search.toLowerCase())
      })
    },
    loading() {
      return this.$store.getters.loading
    },
    paginatedTemps() {
      return this.$store.getters.paginatedTemps
    },
    showOnExplore() {
      // let array = [];
      let temps = null
      // let start = (this.page - 1) * this.itemsPerPage;
      // let finish = this.page * this.itemsPerPage;
      // temps = this.exploreTemplates.slice(start, finish);
      temps = this.$store.state.Templates.Templates
      return temps
    },
    showTempDetails() {
      return !(this.mainIndex == 2 && this.subIndex == 0) //dont show on this tab
    },
  },
  watch: {
    mainIndex() {
      this.subIndex = 0 //reset subIndex when main idex change
    },
  },
  created() {
    this.$store.dispatch('getAllTest')
  },
}
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
</style>
