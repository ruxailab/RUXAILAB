<template>
  <div class="bg-grey-lighten-4">
    <v-card
      height="260"
      elevation="0"
      rounded="0"
      class="mb-6"
    >
      <v-img
        src="https://theme.zdassets.com/theme_assets/717481/e805a01ba4ee2b0b1d0aa58dca3eb97f54c31e95.png"
        :aspect-ratio="16 / 9"
        height="100%"
      >
        <v-container class="fill-height">
          <v-row
            justify="center"
            align="center"
          >
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
                class="text-h2 font-weight-bold text-white mb-2"
                style="text-shadow: 0 2px 4px rgba(0,0,0,0.2)"
              >
                {{ $t('help.help_center') }}
              </h1>

              <h2
                class="text-h4 font-weight-medium text-white mb-6"
                style="text-shadow: 0 2px 4px rgba(0,0,0,0.2)"
              >
                {{ $t('help.howCanWeHelp') }}
              </h2>
              <div
                class="mx-auto"
                style="max-width: 560px; margin-top: 10px; position: relative; z-index: 5;"
              >
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  placeholder="Search help articles..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  color="deep-orange-accent-3"
                  bg-color="white"
                  class="rounded-lg"
                  @update:model-value="searchArticles"
                  @focus="searchActive = true"
                  @blur="searchActive = searchQuery ? true : false"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                >
                  <template #prepend-inner>
                    <v-icon :color="searchActive ? 'black' : 'grey darken-2'">
                      mdi-magnify
                    </v-icon>
                  </template>
                  <template #append>
                    <v-fade-transition>
                      <v-progress-circular
                        v-if="isSearching"
                        indeterminate
                        color="black"
                        size="20"
                        width="2"
                      />
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
        <v-col
          cols="12"
          md="4"
          lg="3"
        >
          <div
            class="sticky-top"
            style="top: 24px;"
          >
            <v-card
              rounded="lg"
              elevation="2"
            >
              <v-list
                v-model="activeCategory"
                nav
                rounded
                color="black"
              >
                <v-list-subheader
                  class="bg-grey-lighten-4 text-subtitle-2 font-weight-bold text-amber-darken-2"
                >
                  CATEGORIES
                </v-list-subheader>
                <v-list-item
                  v-for="(category, index) in categories"
                  :key="index"
                  class="my-1 mx-2 rounded"
                  :class="{
                    'grey lighten-4': selectedCategory === category.id,
                  }"
                  @click="filterByCategory(category.id)"
                >
                  <template #prepend>
                    <v-icon
                      :color="
                        selectedCategory === category.id
                          ? 'black'
                          : 'grey darken-1'
                      "
                    >
                      {{ category.icon }}
                    </v-icon>
                  </template>
                    
                  <v-list-item-title
                    :class="{
                      'black--text font-weight-medium':
                        selectedCategory === category.id,
                    }"
                  >
                    {{ category.name }}
                  </v-list-item-title>
                  <v-list-item-action>
                    <v-chip
                      size="small"
                      color="black"
                      class="text-white"
                    >
                      {{
                        getCategoryItemCount(category.id)
                      }}
                    </v-chip>
                  </v-list-item-action>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item
                  class="my-1 mx-2 rounded"
                  :class="{ 'grey lighten-4': selectedCategory === null }"
                  @click="openAllArticlesModal()"
                >
                  <template #prepend>
                    <v-icon
                      :color="
                        selectedCategory === null ? 'black' : 'grey darken-1'
                      "
                    >
                      mdi-view-grid
                    </v-icon>
                  </template>
                  <v-list-item-title
                    :class="{
                      'black--text font-weight-medium':
                        selectedCategory === null,
                    }"
                  >
                    View All
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-col>
        <v-col
          cols="12"
          md="8"
          lg="9"
        >
          <div v-if="filteredItems.length > 0">
            <div
              v-for="(category, catIndex) in displayedCategories"
              :key="'cat-' + catIndex"
              class="mb-8"
            >
              <v-card
                v-if="getItemsByCategory(category.id).length > 0"
                flat
                class="mb-4 rounded-lg"
                style="border-left: 4px solid rgb(249, 168, 38);"
              >
                <v-card-title class="py-3 text-black font-weight-medium">
                  <v-icon
                    start
                    color="black"
                  >
                    {{ category.icon }}
                  </v-icon>
                  {{ category.name }}
                </v-card-title>
              </v-card>
              <v-expansion-panels
                flat
              >
                <v-expansion-panel
                  v-for="(item, index) in getItemsByCategory(category.id)"
                  :key="'item-' + index"
                  class="mb-3 rounded-lg"
                  style="border: 1px solid rgba(0,0,0,0.08);"
                >
                  <v-expansion-panel-title
                    class="py-3 text-subtitle-1 text-grey-darken-3 font-weight-medium"
                  >
                    {{ item.title }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="bg-grey-lighten-5">
                    <p class="text-body-1 text-grey-darken-2 mb-4">
                      {{ item.content }}
                    </p>
                    <div class="video-container position-relative">
                      <video
                        ref="videoPlayer"
                        :src="require(`@/assets/faqs/${item.gif}`)"
                        class="rounded-lg"
                        width="100%"
                        max-height="500"
                        controls
                        controlslist="nodownload"
                        preload="metadata"
                        muted
                        aria-label="FAQ demonstration video showing the visual steps to solve the frequently asked question. No audio content is present in this instructional video."
                        style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.08);"
                        @play="updatePlayState()"
                        @pause="updatePlayState()"
                      />
                      <div
                        class="custom-controls d-flex justify-center align-center"
                        :class="{ 'controls-mobile': isXsOnly }"
                      >
                        <v-btn
                          icon
                          color="white"
                          class="custom-control-btn mx-2"
                          style="background-color: rgba(0,0,0,0.5);"
                          :class="{ 'button-hover': true }"
                          @click="skipBackward(item)"
                        >
                          <v-icon>mdi-rewind-10</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          color="white"
                          class="custom-control-btn mx-2"
                          style="background-color: rgba(0,0,0,0.5);"
                          :class="{ 'button-hover': true }"
                          @click="togglePlay(item)"
                        >
                          <v-icon>{{ isPlaying(item) ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          color="white"
                          class="custom-control-btn mx-2"
                          style="background-color: rgba(0,0,0,0.5);"
                          :class="{ 'button-hover': true }"
                          @click="skipForward(item)"
                        >
                          <v-icon>mdi-fast-forward-10</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
          <v-card
            v-if="filteredItems.length === 0"
            class="pa-6 rounded-lg text-center bg-grey-lighten-5"
            style="border: 1px dashed rgba(0,0,0,0.15);"
          >
            <v-card-text>
              <v-icon
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              >
                mdi-help-circle-outline
              </v-icon>
              <h3 class="mb-3">
                No articles found
              </h3>
              <p class="mb-4 text-grey-darken-1">
                Try adjusting your search or browse all categories
              </p>

              <v-btn
                color="black"
                style="color: white;"
                @click="openAllArticlesModal()"
              >
                View All Articles
              </v-btn>
            </v-card-text>
          </v-card>
          <div
            v-if="pageCount > 1"
            class="text-center mt-8"
          >
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              rounded
              color="black"
              class="bg-white elevation-2 py-2 px-4 d-inline-flex rounded-pill"
              @update:model-value="handlePageChange"
            />
          </div>
          
          <!-- Read All Articles Button at the bottom -->
          <div class="text-center mt-4 mb-8">
            <v-btn
              color="black"
              variant="outlined"
              class="px-4 mr-2"
              @click="openAllArticlesModal()"
            >
              <v-icon start>
                mdi-book-open-variant
              </v-icon>
              Read All Articles
            </v-btn>
            
            <v-btn
              color="grey-darken-1"
              variant="text"
              class="px-4"
              @click="openInNewPage()"
            >
              <v-icon
                size="small"
                start
              >
                mdi-open-in-new
              </v-icon>
              Open in New Tab
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-footer
      class="mt-12 pa-0"
      color="grey-darken-4"
    >
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="4"
            class="pt-6"
          >
            <h3
              class="text-subtitle-1 font-weight-medium text-amber mb-4 pb-2"
              style="position: relative;"
            >
              Contact Us
              <span
                style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background-color: rgb(249, 168, 38);"
              />
            </h3>
            <p
              class="text-white mb-3"
              style="opacity: 0.7;"
            >
              <v-icon
                size="small"
                class="mr-2 text-white"
              >
                mdi-email
              </v-icon>
              <a 
                href="mailto:ruxailab@gmail.com"
                class="text-white"
                style="text-decoration: none; opacity: 0.7;"
                @mouseover="$event.target.style.opacity = '1'"
                @mouseleave="$event.target.style.opacity = '0.7'"
              >
                ruxailab@gmail.com
              </a>
            </p>
            <p
              class="text-white mb-3"
              style="opacity: 0.7;"
            >
              <v-icon
                size="small"
                class="mr-2 text-white"
              >
                mdi-phone
              </v-icon> +1 (555)
              123-4567
            </p>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="pt-6"
          >
            <h3
              class="text-subtitle-1 font-weight-medium text-amber mb-4 pb-2"
              style="position: relative;"
            >
              Still Have Questions?
              <span
                style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background-color: rgb(249, 168, 38);"
              />
            </h3>
            <p
              class="text-white mb-4"
              style="opacity: 0.7;"
            >
              We're here to help! Reach out to our support team for assistance.
            </p>
            <v-btn
              color="black"
              variant="outlined"
              class="text-white"
            >
              Submit a Request
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="pt-6"
          >
            <h3
              class="text-subtitle-1 font-weight-medium text-amber mb-4 pb-2"
              style="position: relative;"
            >
              Quick Links
              <span
                style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background-color: rgb(249, 168, 38);"
              />
            </h3>
            <div class="d-flex flex-column">
              <v-btn
                variant="text"
                class="text-white justify-start px-0 text-caption"
                style="opacity: 0.7;"
                @click="$router.push('/terms-of-service')"
              >
                Terms of Service
              </v-btn>
              <v-btn
                variant="text"
                class="text-white justify-start px-0 text-caption"
                style="opacity: 0.7;"
                @click="$router.push('/privacy-policy')"
              >
                Privacy Policy
              </v-btn>
              <v-btn
                variant="text"
                class="text-white justify-start px-0 text-caption"
                style="opacity: 0.7;"
                @click="$router.push('/faq')"
              >
                FAQs
              </v-btn>
            </div>
          </v-col>
          <v-col
            cols="12"
            class="text-center mt-8"
          >
            <v-divider
              dark
              class="mb-4"
            />
            <p
              class="text-caption text-white"
              style="opacity: 0.5;"
            >
              © {{ currentYear }} Ruxailab. All rights reserved.
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>

    <!-- All Articles Modal -->
    <v-dialog
      v-model="showAllArticlesModal"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card>
        <v-toolbar
          dark
          color="black"
        >
          <v-btn
            icon
            @click="showAllArticlesModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>All Help Articles</v-toolbar-title>
          <v-spacer />
          
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn 
                icon
                v-bind="props"
                @click="openInNewPage()"
              >
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </template>
            <span>Open in new page</span>
          </v-tooltip>
        </v-toolbar>
        
        <!-- Loading overlay -->
        <v-overlay
          :model-value="isLoadingModal"
          absolute
        >
          <v-progress-circular
            indeterminate
            size="64"
            color="amber"
          />
        </v-overlay>
        
        <v-card-text class="pt-4">
          <v-container>
            <div
              v-for="(category, catIndex) in categories"
              :key="'modal-cat-' + catIndex"
              class="mb-8"
            >
              <v-card
                flat
                class="mb-4 rounded-lg"
                style="border-left: 4px solid rgb(249, 168, 38);"
              >
                <v-card-title class="py-3 text-black font-weight-medium">
                  <v-icon
                    start
                    color="black"
                  >
                    {{ category.icon }}
                  </v-icon>
                  {{ category.name }}
                </v-card-title>
              </v-card>
              <v-expansion-panels
                flat
              >
                <v-expansion-panel
                  v-for="(item, index) in items.filter(i => i.category === category.id)"
                  :key="'modal-item-' + index"
                  class="mb-3 rounded-lg"
                  style="border: 1px solid rgba(0,0,0,0.08);"
                >
                  <v-expansion-panel-title
                    class="py-3 text-subtitle-1 text-grey-darken-3 font-weight-medium"
                  >
                    {{ item.title }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="bg-grey-lighten-5">
                    <p class="text-body-1 text-grey-darken-2 mb-4">
                      {{ item.content }}
                    </p>
                    <div
                      v-if="item.gif"
                      class="video-container position-relative"
                    >
                      <video
                        ref="modalVideoPlayer"
                        :src="require(`@/assets/faqs/${item.gif}`)"
                        class="rounded-lg"
                        width="100%"
                        max-height="500"
                        controls
                        controlslist="nodownload"
                        preload="metadata"
                        muted
                        aria-label="FAQ demonstration video showing the visual steps to solve the frequently asked question. No audio content is present in this instructional video."
                        style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.08);"
                      />
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import i18n from '@/i18n'

export default {
  props: {
    showAllOnLoad: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      currentYear: new Date().getFullYear(),
      searchQuery: '',
      activeCategory: null,
      selectedCategory: null,
      page: 1,
      itemsPerPage: 5,
      searchActive: false,
      isSearching: false,
      searchTimeout: null,
      isHovered: false,
      showAllArticlesModal: false,
      isLoadingModal: false,
      categories: [
        {
          id: 'test-creation',
          name: 'Test Creation',
          icon: 'mdi-file-document-edit',
        },
        { id: 'templates', name: 'Templates', icon: 'mdi-file-table-outline' },
        { id: 'cooperators', name: 'Cooperators', icon: 'mdi-account-group' },
        { id: 'analytics', name: 'Analytics', icon: 'mdi-chart-bar' },
      ],
      items: this.generateFaqItems(),
    }
  },

  computed: {
    // Add this computed property to safely handle xsOnly
    isXsOnly() {
      return this.$vuetify?.breakpoint?.xsOnly || false;
    },

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
    showAllArticlesModal(val) {
      if (!val && this.$route.name === 'AllArticles') {
        // When modal is closed, go back to the help page
        this.$router.push({ name: 'Help' }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err;
          }
        });
      }
    }
  },

  mounted() {
    // If showAllOnLoad is true, open the modal when the component is mounted
    if (this.showAllOnLoad) {
      this.$nextTick(() => {
        this.openAllArticlesModal();
      });
    }
  },

  methods: {
    generateFaqItems() {
      const createFaqItem = (keyPrefix, category, gif) => ({
        title: i18n.global.t(`help.${keyPrefix}`),
        content: i18n.global.t(`help.${keyPrefix}answer`),
        gif: `${gif}.mp4`,
        isCollapsed: true,
        category
      });
  
      return [
        createFaqItem('createtest', 'test-creation', 'create_test'),
        createFaqItem('heuristictest', 'test-creation', 'hsetup'),
        createFaqItem('deletetest', 'test-creation', 'del_test'),
        createFaqItem('createtemplate', 'templates', 'create-temp'),
        createFaqItem('usetemplate', 'templates', 'use-temp'),
        createFaqItem('previewtest', 'test-creation', 'preview_test'),
        createFaqItem('importcsv', 'test-creation', 'csv'),
        createFaqItem('invitecooperators', 'cooperators', 'sendinvite'),
        createFaqItem('analyseresults', 'analytics', 'analytics'),
        createFaqItem('sendmessage', 'cooperators', 'send_message'),
      ];
    },

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
      if (categoryId === 'all') {
        // Show all articles in the modal
        this.openAllArticlesModal();
        return;
      }
      
      this.selectedCategory = categoryId;
      this.page = 1;
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

    skipBackward(item) {
      const videos = this.$refs.videoPlayer;
      let video;
  
      if (Array.isArray(videos)) {
        const index = this.filteredItems.findIndex(i => i.title === item.title);
        video = videos[index];
      } else {
        video = videos;
      }
  
      if (video) {
        video.currentTime = Math.max(0, video.currentTime - 10);
      }
    },

    skipForward(item) {
      const videos = this.$refs.videoPlayer;
      let video;
  
      if (Array.isArray(videos)) {
        const index = this.filteredItems.findIndex(i => i.title === item.title);
        video = videos[index];
      } else {
        video = videos;
      }
  
      if (video) {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      }
    },

    togglePlay(item) {
      const videos = this.$refs.videoPlayer;
      let video;
  
      if (Array.isArray(videos)) {
        const index = this.filteredItems.findIndex(i => i.title === item.title);
        video = videos[index];
      } else {
        video = videos;
      }
  
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    },

    isPlaying(item) {
      const videos = this.$refs.videoPlayer;
      let video;
  
      if (Array.isArray(videos)) {
        const index = this.filteredItems.findIndex(i => i.title === item.title);
        video = videos[index];
      } else {
        video = videos;
      }
  
      return video ? !video.paused : false;
    },

    updatePlayState() {
      this.$forceUpdate(); 
    },

    openAllArticlesModal() {
      this.isLoadingModal = true;
      this.showAllArticlesModal = true;
      
      // Simulate loading time (can be removed in production)
      setTimeout(() => {
        this.isLoadingModal = false;
      }, 500);
      
      // Update the URL without refreshing the page
      if (this.$route.name !== 'AllArticles') {
        this.$router.push({ 
          name: 'AllArticles' 
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err;
          }
        });
      }
    },
    
    openInNewPage() {
      // Close the modal
      this.showAllArticlesModal = false;
      
      // Open the all articles page in a new tab
      const newPageUrl = this.$router.resolve({ name: 'AllArticles' }).href;
      window.open(newPageUrl, '_blank');
    },
  }
}
</script>

<style>
.button-hover:hover {
  background-color: rgb(249, 168, 38) !important;
}

.button-hover:hover .v-icon {
  color: white !important;
}

.custom-controls {
  position: absolute;
  bottom: 40%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 2;
}

.controls-mobile {
  bottom: 25%; 
}

@media (max-width: 600px) {
  .custom-control-btn {
    transform: scale(0.9);
  }
}

.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s ease-in-out;
}

.dialog-bottom-transition-enter,
.dialog-bottom-transition-leave-to {
  transform: translateY(100%);
}

/* Add some responsive styling for the modal */
@media (max-width: 600px) {
  .v-dialog .v-card-text {
    padding: 12px;
  }
  
  .v-dialog .v-container {
    padding: 8px;
  }
}
</style>