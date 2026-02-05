<template>
  <div class="bg-grey-lighten-4">
    <v-card height="260" elevation="0" rounded="0" class="mb-6">
      <v-img
        src="https://theme.zdassets.com/theme_assets/717481/e805a01ba4ee2b0b1d0aa58dca3eb97f54c31e95.png"
        height="260"
        cover
      >
        <v-container class="fill-height d-flex align-center justify-center">
          <v-row justify="center" align="center" class="text-center">
            <v-col cols="12" xs="12" sm="10" md="8" lg="7" xl="6">
              <h2
                class="text-h4 font-weight-medium text-white mb-6"
                style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
              >
                {{ $t('help.howCanWeHelp') }}
              </h2>
            </v-col>
          </v-row>
        </v-container>
      </v-img>
    </v-card>
    <v-container class="mt-4">
      <v-row>
        <v-col cols="12" md="4" lg="3">
          <div class="sticky-top" style="top: 24px">
            <v-card rounded="lg" elevation="2">
              <v-list nav rounded color="black">
                <v-list-subheader
                  class="text-subtitle-2 font-weight-bold text-amber-darken-2"
                >
                  {{ $t('help.categories') }}
                </v-list-subheader>
                <v-list-item
                  v-for="(category, index) in categories"
                  :key="index"
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
                    {{ $t(category.nameKey) }}
                    <v-chip
                      v-if="items && Array.isArray(items)"
                      size="small"
                      color="amber-darken-2"
                      class="text-white"
                    >
                      {{
                        items.filter(
                          (item) => item && item.category === category.id,
                        ).length
                      }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
                <v-divider class="my-2" />
                <v-list-item
                  class="my-1 mx-2 rounded"
                  :class="{ 'grey lighten-4': selectedCategory === null }"
                  @click="filterByCategory(null)"
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
                    {{ $t('help.viewAll') }}
                  </v-list-item-title>
                </v-list-item>
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
                v-if="getItemsByCategory(category.id).length > 0"
                flat
                class="mb-4 rounded-lg"
                style="border-left: 4px solid rgb(249, 168, 38)"
              >
                <v-card-title class="py-3 text-black font-weight-medium">
                  <v-icon start color="black">
                    {{ category.icon }}
                  </v-icon>
                  {{ $t(category.nameKey) }}
                </v-card-title>
              </v-card>
              <v-expansion-panels flat>
                <v-expansion-panel
                  v-for="(item, index) in getItemsByCategory(category.id)"
                  :key="'item-' + index"
                  class="mb-3 rounded-lg"
                  style="border: 1px solid rgba(0, 0, 0, 0.08)"
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
                        :src="require(`@/assets/faqs/${item.gif}`)"
                        class="rounded-lg"
                        width="100%"
                        max-height="500"
                        controls
                        controlslist="nodownload"
                        preload="metadata"
                        muted
                        :aria-label="$t('help.videoAltText')"
                        style="
                          border: 1px solid rgba(0, 0, 0, 0.08);
                          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                        "
                      />
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
          <v-card
            v-if="filteredItems.length === 0"
            class="pa-6 rounded-lg text-center bg-grey-lighten-5"
            style="border: 1px dashed rgba(0, 0, 0, 0.15)"
          >
            <v-card-text>
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-help-circle-outline
              </v-icon>
              <h3 class="mb-3">
                {{ $t('help.noArticlesFound') }}
              </h3>
              <p class="mb-4 text-grey-darken-1">
                {{ $t('help.browseAllCategories') }}
              </p>

              <v-btn
                color="black"
                style="color: white"
                @click="filterByCategory(null)"
              >
                {{ $t('help.viewAllArticles') }}
              </v-btn>
            </v-card-text>
          </v-card>
          <div v-if="pageCount > 1" class="text-center mt-8">
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              rounded
              color="black"
              class="bg-white elevation-2 py-2 px-4 d-inline-flex rounded-pill"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  showAllOnLoad: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const selectedCategory = ref(null)
const page = ref(1)
const itemsPerPage = ref(5)

// Categories
const categories = ref([
  {
    id: 'test-creation',
    nameKey: 'help.testCreation',
    icon: 'mdi-file-document-edit',
  },
  {
    id: 'templates',
    nameKey: 'help.templates',
    icon: 'mdi-file-table-outline',
  },
  { id: 'cooperators', nameKey: 'help.cooperators', icon: 'mdi-account-group' },
  { id: 'analytics', nameKey: 'help.analytics', icon: 'mdi-chart-bar' },
])

// FAQ Items
const generateFaqItems = () => {
  const createFaqItem = (keyPrefix, category, gif) => {
    try {
      return {
        title: t(`help.${keyPrefix}`) || `FAQ ${keyPrefix}`,
        content: t(`help.${keyPrefix}answer`) || 'Content not available',
        gif: `${gif}.mp4`,
        category,
      }
    } catch {
      return {
        title: `FAQ ${keyPrefix}`,
        content: 'Content not available',
        gif: `${gif}.mp4`,
        category,
      }
    }
  }

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
  ]
}

const items = ref([])

const filteredItems = computed(() => {
  if (!items.value || !Array.isArray(items.value)) {
    return []
  }

  let filtered = items.value

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (item) => item && item.category === selectedCategory.value,
    )
  }

  return filtered.sort((a, b) => {
    const indexA = categories.value.findIndex((cat) => cat.id === a.category)
    const indexB = categories.value.findIndex((cat) => cat.id === b.category)

    return indexA - indexB
  })
})

const pageCount = computed(() => {
  const itemsLength = filteredItems.value?.length || 0
  const perPage = itemsPerPage.value || 5
  return Math.ceil(itemsLength / perPage)
})

const paginatedItems = computed(() => {
  if (!filteredItems.value || !Array.isArray(filteredItems.value)) {
    return []
  }

  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const displayedCategories = computed(() => {
  if (!categories.value || !Array.isArray(categories.value)) {
    return []
  }

  if (selectedCategory.value) {
    return categories.value.filter(
      (cat) => cat && cat.id === selectedCategory.value,
    )
  }
  return categories.value
})

const filterByCategory = (categoryId) => {
  selectedCategory.value = categoryId
  page.value = 1
}

const getItemsByCategory = (categoryId) => {
  if (!paginatedItems.value || !Array.isArray(paginatedItems.value)) {
    return []
  }

  if (!categoryId) return paginatedItems.value
  return paginatedItems.value.filter(
    (item) => item && item.category === categoryId,
  )
}

onMounted(() => {
  try {
    items.value = generateFaqItems()
  } catch {
    items.value = []
  }

  if (props.showAllOnLoad) {
    nextTick(() => {
      selectedCategory.value = null
    })
  }
})
</script>
