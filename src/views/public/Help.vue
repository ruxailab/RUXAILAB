<template>
  <div class="grey lighten-4">
    <v-card height="260" elevation="0" rounded="0" class="mb-6">
      <v-img
        src="https://theme.zdassets.com/theme_assets/717481/e805a01ba4ee2b0b1d0aa58dca3eb97f54c31e95.png"
        :aspect-ratio="16 / 9"
        height="100%"
      >
        <v-container class="fill-height">
          <v-row justify="center" align="center">
            <v-col
              cols="12"
              xs="12"
              sm="10"
              md="8"
              lg="7"
              xl="6"
              class="text-center"
            >
              <h1
                class="text-h2 font-weight-bold white--text mb-2"
                style="text-shadow: 0 2px 4px rgba(0,0,0,0.2)"
              >
                {{ $t('help.header.title') }}
              </h1>
              <h2
                class="text-h4 font-weight-medium white--text mb-6"
                style="text-shadow: 0 2px 4px rgba(0,0,0,0.2)"
              >
                {{ $t('help.header.subtitle') }}
              </h2>
              <div
                class="mx-auto"
                style="max-width: 560px; margin-top: 10px; position: relative; z-index: 5;"
              >
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  :placeholder="$t('help.header.searchPlaceholder')"
                  outlined
                  dense
                  hide-details
                  @input="searchArticles"
                  @focus="searchActive = true"
                  @blur="searchActive = searchQuery ? true : false"
                  clearable
                  color="deep-orange accent-3"
                  background-color="white"
                  class="rounded-lg"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                >
                  <template v-slot:prepend-inner>
                    <v-icon :color="searchActive ? 'black' : 'grey darken-2'">
                      mdi-magnify
                    </v-icon>
                  </template>
                  <template v-slot:append>
                    <v-fade-transition>
                      <v-progress-circular
                        v-if="isSearching"
                        indeterminate
                        color="black"
                        size="20"
                        width="2"
                      ></v-progress-circular>
                    </v-fade-transition>
                  </template>
                </v-text-field>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-img>
    </v-card>
    <v-container class="mt-n8">
      <v-row>
        <v-col cols="12" md="4" lg="3">
          <div class="sticky-top" style="top: 24px;">
            <v-card rounded="lg" elevation="2">
              <v-list nav rounded>
                <v-subheader
                  class="grey lighten-4 subtitle-2 font-weight-bold amber--text text--darken-2"
                  >{{ $t('help.categories.title') }}</v-subheader
                >
                <v-list-item-group v-model="activeCategory" color="black">
                  <v-list-item
                    v-for="(category, index) in categories"
                    :key="index"
                    @click="filterByCategory(category.id)"
                    class="my-1 mx-2 rounded"
                    :class="{
                      'grey lighten-4': selectedCategory === category.id,
                    }"
                  >
                    <v-list-item-icon>
                      <v-icon
                        :color="
                          selectedCategory === category.id
                            ? 'black'
                            : 'grey darken-1'
                        "
                        >{{ category.icon }}</v-icon
                      >
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        :class="{
                          'black--text font-weight-medium':
                            selectedCategory === category.id,
                        }"
                        >{{ category.name }}</v-list-item-title
                      >
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-chip small color="black" text-color="white">{{
                        getCategoryItemCount(category.id)
                      }}</v-chip>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item
                    @click="filterByCategory(null)"
                    class="my-1 mx-2 rounded"
                    :class="{ 'grey lighten-4': selectedCategory === null }"
                  >
                    <v-list-item-icon>
                      <v-icon
                        :color="
                          selectedCategory === null ? 'black' : 'grey darken-1'
                        "
                        >mdi-view-grid</v-icon
                      >
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title
                        :class="{
                          'black--text font-weight-medium':
                            selectedCategory === null,
                        }"
                        >{{ $t('help.categories.viewAll') }}</v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-card>
          </div>
        </v-col>
        <v-col cols="12" md="8" lg="9">
          <div v-if="filteredItems.length > 0">
            <div
              v-for="(category, catIndex) in displayedCategories"
              :key="'cat-' + catIndex"
              class="mb-8"
            >
              <v-card
                flat
                v-if="getItemsByCategory(category.id).length > 0"
                class="mb-4 rounded-lg"
                style="border-left: 4px solid rgb(249, 168, 38);"
              >
                <v-card-title class="py-3 black--text font-weight-medium">
                  <v-icon left color="black">{{ category.icon }}</v-icon>
                  {{ category.name }}
                </v-card-title>
              </v-card>
              <v-expansion-panels flat hover>
                <v-expansion-panel
                  v-for="(item, index) in getItemsByCategory(category.id)"
                  :key="'item-' + index"
                  class="mb-3 rounded-lg"
                  style="border: 1px solid rgba(0,0,0,0.08);"
                >
                  <v-expansion-panel-header
                    class="py-3 subtitle-1 grey--text text--darken-3 font-weight-medium"
                  >
                    {{ item.title }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="grey lighten-5">
                    <p class="body-1 grey--text text--darken-2 mb-4">
                      {{ item.content }}
                    </p>
                    <v-img
                      :src="require(`@/assets/faqs/${item.gif}`)"
                      max-height="500"
                      contain
                      class="rounded-lg"
                      style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.08);"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
          <v-card
            v-if="filteredItems.length === 0"
            class="pa-6 rounded-lg text-center grey lighten-5"
            style="border: 1px dashed rgba(0,0,0,0.15);"
          >
            <v-card-text>
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-help-circle-outline</v-icon
              >
              <h3 class="mb-3">{{ $t('help.noResults.title') }}</h3>
              <p class="mb-4 grey--text text--darken-1">
                {{ $t('help.noResults.message') }}
              </p>
              <v-btn color="black" @click="filterByCategory(null)">
                {{ $t('help.noResults.button') }}
              </v-btn>
            </v-card-text>
          </v-card>
          <div class="text-center mt-8" v-if="pageCount > 1">
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              circle
              color="black"
              class="white elevation-2 py-2 px-4 d-inline-flex rounded-pill"
              @input="handlePageChange"
            ></v-pagination>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-footer padless class="mt-12" color="grey darken-4">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" class="pt-6">
            <h3
              class="text-subtitle-1 font-weight-medium amber--text mb-4 pb-2"
              style="position: relative;"
            >
              {{ $t('help.footer.contactUs.title') }}
              <span
                style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background-color: rgb(249, 168, 38);"
              ></span>
            </h3>
            <p class="white--text mb-3" style="opacity: 0.7;">
              <v-icon small class="mr-2 white--text">mdi-email</v-icon>
              {{ $t('help.footer.contactUs.email') }}
            </p>
            <p class="white--text mb-3" style="opacity: 0.7;">
              <v-icon small class="mr-2 white--text">mdi-phone</v-icon> +1 (555)
              123-4567
            </p>
          </v-col>
          <v-col cols="12" md="4" class="pt-6">
            <h3
              class="text-subtitle-1 font-weight-medium amber--text mb-4 pb-2"
              style="position: relative;"
            >
              {{ $t('help.footer.questions.title') }}
              <span
                style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background-color: rgb(249, 168, 38);"
              ></span>
            </h3>
            <p class="white--text mb-4" style="opacity: 0.7;">
              {{ $t('help.footer.questions.message') }}
            </p>
            <v-btn color="black" outlined class="white--text">
              {{ $t('help.footer.questions.button') }}
            </v-btn>
          </v-col>
          <v-col cols="12" md="4" class="pt-6">
            <h3
              class="text-subtitle-1 font-weight-medium amber--text mb-4 pb-2"
              style="position: relative;"
            >
              {{ $t('help.footer.quickLinks.title') }}
              <span
                style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background-color: rgb(249, 168, 38);"
              ></span>
            </h3>
            <div class="d-flex flex-column">
              <v-btn
                text
                class="white--text justify-start px-0 text-caption"
                style="opacity: 0.7;"
              >
                {{ $t('help.footer.quickLinks.terms') }}
              </v-btn>
              <v-btn
                text
                class="white--text justify-start px-0 text-caption"
                style="opacity: 0.7;"
              >
                {{ $t('help.footer.quickLinks.privacy') }}
              </v-btn>
              <v-btn
                text
                class="white--text justify-start px-0 text-caption"
                style="opacity: 0.7;"
              >
                {{ $t('help.footer.quickLinks.faqs') }}
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" class="text-center mt-8">
            <v-divider dark class="mb-4"></v-divider>
            <p class="text-caption white--text" style="opacity: 0.5;">
              {{ $t('help.footer.copyright') }}
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script>
import i18n from '@/i18n'

export default {
  data() {
    return {
      searchQuery: '',
      activeCategory: null,
      selectedCategory: null,
      page: 1,
      itemsPerPage: 5,
      searchActive: false,
      isSearching: false,
      searchTimeout: null,
      isHovered: false,
      categories: [
        {
          id: 'test-creation',
          name: this.$t('help.categories.testCreation'),
          icon: 'mdi-file-document-edit',
        },
        { 
          id: 'templates', 
          name: this.$t('help.categories.templates'), 
          icon: 'mdi-file-table-outline' 
        },
        { 
          id: 'cooperators', 
          name: this.$t('help.categories.cooperators'), 
          icon: 'mdi-account-group' 
        },
        { 
          id: 'analytics', 
          name: this.$t('help.categories.analytics'), 
          icon: 'mdi-chart-bar' 
        },
      ],
      items: [
        {
          title: i18n.t('help.createtest'),
          content: i18n.t('help.createtestanswer'),
          gif: 'create_test.gif',
          isCollapsed: true,
          category: 'test-creation',
        },
        {
          title: i18n.t('help.heuristictest'),
          content: i18n.t('help.heuristictestanswer'),
          gif: 'hsetup.gif',
          isCollapsed: true,
          category: 'test-creation',
        },
        {
          title: i18n.t('help.deletetest'),
          content: i18n.t('help.deletetestanswer'),
          gif: 'del_test.gif',
          isCollapsed: true,
          category: 'test-creation',
        },
        {
          title: i18n.t('help.createtemplate'),
          content: i18n.t('help.createtemplateanswer'),
          gif: 'create-temp.gif',
          isCollapsed: true,
          category: 'templates',
        },
        {
          title: i18n.t('help.usetemplate'),
          content: i18n.t('help.usetemplateanswer'),
          gif: 'use-temp.gif',
          isCollapsed: true,
          category: 'templates',
        },
        {
          title: i18n.t('help.previewtest'),
          content: i18n.t('help.previewtestanswer'),
          gif: 'preview_test.gif',
          isCollapsed: true,
          category: 'test-creation',
        },
        {
          title: i18n.t('help.importcsv'),
          content: i18n.t('help.importcsvanswer'),
          gif: 'csv.gif',
          isCollapsed: true,
          category: 'test-creation',
        },
        {
          title: i18n.t('help.invitecooperators'),
          content: i18n.t('help.invitecooperatorsanswer'),
          gif: 'sendinvite.gif',
          isCollapsed: true,
          category: 'cooperators',
        },
        {
          title: i18n.t('help.analyseresults'),
          content: i18n.t('help.analyseresultsanswer'),
          gif: 'analytics.gif',
          isCollapsed: true,
          category: 'analytics',
        },
        {
          title: i18n.t('help.sendmessage'),
          content: i18n.t('help.sendmessageanswer'),
          gif: 'send_message.gif',
          isCollapsed: true,
          category: 'cooperators',
        },
      ],
    }
  },

  computed: {
    filteredItems() {
      let items = this.items

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query),
        )
      }

      if (this.selectedCategory) {
        items = items.filter((item) => item.category === this.selectedCategory)
      }

      return items
    },

    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage)
    },

    paginatedItems() {
      const start = (this.page - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredItems.slice(start, end)
    },

    displayedCategories() {
      if (this.selectedCategory) {
        return this.categories.filter((cat) => cat.id === this.selectedCategory)
      }
      return this.categories
    },
  },

  watch: {
    // Add watcher for language changes
    '$i18n.locale': {
      immediate: true,
      handler() {
        // Update items when language changes
        this.items = [
          {
            title: this.$t('help.createtest'),
            content: this.$t('help.createtestanswer'),
            gif: 'create_test.gif',
            isCollapsed: true,
            category: 'test-creation',
          },
          {
            title: this.$t('help.heuristictest'),
            content: this.$t('help.heuristictestanswer'),
            gif: 'hsetup.gif',
            isCollapsed: true,
            category: 'test-creation',
          },
          {
            title: this.$t('help.deletetest'),
            content: this.$t('help.deletetestanswer'),
            gif: 'del_test.gif',
            isCollapsed: true,
            category: 'test-creation',
          },
          {
            title: this.$t('help.createtemplate'),
            content: this.$t('help.createtemplateanswer'),
            gif: 'create-temp.gif',
            isCollapsed: true,
            category: 'templates',
          },
          {
            title: this.$t('help.usetemplate'),
            content: this.$t('help.usetemplateanswer'),
            gif: 'use-temp.gif',
            isCollapsed: true,
            category: 'templates',
          },
          {
            title: this.$t('help.previewtest'),
            content: this.$t('help.previewtestanswer'),
            gif: 'preview_test.gif',
            isCollapsed: true,
            category: 'test-creation',
          },
          {
            title: this.$t('help.importcsv'),
            content: this.$t('help.importcsvanswer'),
            gif: 'csv.gif',
            isCollapsed: true,
            category: 'test-creation',
          },
          {
            title: this.$t('help.invitecooperators'),
            content: this.$t('help.invitecooperatorsanswer'),
            gif: 'sendinvite.gif',
            isCollapsed: true,
            category: 'cooperators',
          },
          {
            title: this.$t('help.analyseresults'),
            content: this.$t('help.analyseresultsanswer'),
            gif: 'analytics.gif',
            isCollapsed: true,
            category: 'analytics',
          },
          {
            title: this.$t('help.sendmessage'),
            content: this.$t('help.sendmessageanswer'),
            gif: 'send_message.gif',
            isCollapsed: true,
            category: 'cooperators',
          },
        ]
        // Update categories when language changes
        this.categories = [
          {
            id: 'test-creation',
            name: this.$t('help.categories.testCreation'),
            icon: 'mdi-file-document-edit',
          },
          { 
            id: 'templates', 
            name: this.$t('help.categories.templates'), 
            icon: 'mdi-file-table-outline' 
          },
          { 
            id: 'cooperators', 
            name: this.$t('help.categories.cooperators'), 
            icon: 'mdi-account-group' 
          },
          { 
            id: 'analytics', 
            name: this.$t('help.categories.analytics'), 
            icon: 'mdi-chart-bar' 
          },
        ]
      }
    }
  },

  methods: {
    toggleCollapse(index) {
      if (index !== -1) {
        this.items.forEach((item, i) => {
          if (i !== index) {
            item.isCollapsed = true
          }
        })

        this.items[index].isCollapsed = !this.items[index].isCollapsed
      }
    },

    searchArticles() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.isSearching = true

      this.searchTimeout = setTimeout(() => {
        this.page = 1
        this.isSearching = false
      }, 300)
    },

    filterByCategory(categoryId) {
      this.selectedCategory = categoryId
      this.page = 1
    },

    handlePageChange() {
      const contentEl = document.querySelector('.content-area')
      if (contentEl) {
        contentEl.scrollIntoView({ behavior: 'smooth' })
      }
    },

    getItemsByCategory(categoryId) {
      if (!categoryId) return this.paginatedItems

      return this.paginatedItems.filter((item) => item.category === categoryId)
    },

    getCategoryItemCount(categoryId) {
      return this.items.filter((item) => item.category === categoryId).length
    },

    getItemIndex(item) {
      return this.items.findIndex((i) => i.title === item.title)
    },
  },
}
</script>
