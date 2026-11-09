<template>
  <v-container fluid class="pa-0">
    <v-row class="ma-0">
      <!-- Categories -->
      <v-col cols="9">
        <v-card class="elevation-2 rounded-lg pa-6">
          <v-row aling="center" class="pa-4">
            <v-col cols="12" sm="6">
              <v-card-title
                class="text-h5 font-weight-bold mb-4"
                :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
              >
                {{ $t('CardSorting.currentCategories') }}
              </v-card-title>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              class="d-flex justify-end align-center ga-3 flex-wrap"
            >
              <v-btn
                color="primary"
                variant="outlined"
                size="large"
                class="px-6 text-capitalize"
                rounded="lg"
                @click="openImport"
              >
                <v-icon start>mdi-import</v-icon>
                {{ $t('CardSorting.import') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                class="px-6 text-capitalize"
                rounded="lg"
                @click="openCreate"
              >
                <v-icon start>mdi-plus-circle</v-icon>
                {{ $t('CardSorting.addNewCategory') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="categories"
              :items-per-page="5"
              class="elevation-0 rounded-lg"
              style="background: #ffffff; border: 1px solid #e5e7eb"
              :no-data-text="$t('CardSorting.noCategory')"
            >
              <!-- DESCRIPTION -->
              <template #item.description="{ item }">
                <v-icon :color="item.description ? 'success' : 'error'">
                  {{
                    item.description
                      ? 'mdi-checkbox-marked-circle-outline'
                      : 'mdi-close-circle-outline'
                  }}
                </v-icon>
              </template>

              <!-- IMAGE -->
              <template #item.image="{ item }">
                <v-icon :color="item.image ? 'success' : 'error'">
                  {{
                    item.image
                      ? 'mdi-checkbox-marked-circle-outline'
                      : 'mdi-close-circle-outline'
                  }}
                </v-icon>
              </template>

              <!-- ACTIONS -->
              <template #item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  color="accent"
                  class="mr-2"
                  @click="editItem(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  @click="deleteItem(item)"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Settings -->
      <v-col cols="3">
        <v-card class="elevation-2 rounded-lg pa-6">
          <v-row align="center" class="pa-4">
            <v-col cols="12" sm="12">
              <v-card-title
                class="text-h5 font-weight-bold mb-4"
                :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
              >
                {{ $t('CardSorting.settings') }}
              </v-card-title>
              {{ $t('CardSorting.configureCategories') }}
            </v-col>
          </v-row>
          <v-card-text>
            <v-checkbox
              :model-value="options.category_description"
              :label="$t('CardSorting.showCategoryDescription')"
              @update:model-value="updateOption('category_description', $event)"
            />
            <v-checkbox
              :model-value="options.category_image"
              :label="$t('CardSorting.showImage')"
              @update:model-value="updateOption('category_image', $event)"
            />
            <v-divider class="my-3" />
            <v-checkbox
              :model-value="options.allow_create_categories"
              :label="$t('CardSorting.allowCreateCategories')"
              @update:model-value="
                updateOption('allow_create_categories', $event)
              "
            />
            <p class="text-caption text-medium-emphasis mt-1">
              {{
                options.allow_create_categories
                  ? categories.length > 0
                    ? $t('CardSorting.hybridModeHint')
                    : $t('CardSorting.openModeHint')
                  : $t('CardSorting.closedModeHint')
              }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <CardSortingForm
      :dialog="dialog"
      type="category"
      :task="category"
      :options="options"
      :is-edit="editedIndex > -1"
      @save="save"
      @update:dialog="onDialogChange"
    />
    <CardSortingImportDialog
      :dialog="importDialog"
      type="category"
      :existing-titles="existingTitles"
      @import="importItems"
      @update:dialog="importDialog = $event"
    />
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CardSortingStudyCategory } from '../models/CardSortingStudyCategory'
import { CardSortingStudyOptions } from '../models/CardSortingStudyOptions'
import CardSortingForm from './dialogs/CardSortingForm.vue'
import CardSortingImportDialog from './dialogs/CardSortingImportDialog.vue'

// The parent owns the unsaved draft. Reading from the store here would
// overwrite unsaved edits every time this tab is remounted.
const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['change', 'categories', 'options'])

// Variables
const editedIndex = ref(-1)
const dialog = ref(false)
const importDialog = ref(false)
const category = ref(new CardSortingStudyCategory())
const existingTitles = computed(() =>
  props.categories.map((item) => item.title).filter(Boolean),
)
const headers = ref([
  {
    title: 'Name',
    align: 'start',
    sortable: false,
    value: 'title',
    width: '10%',
  },
  {
    title: 'Description',
    value: 'description',
    sortable: false,
    align: 'center',
  },
  { title: 'Image', value: 'image', sortable: false, align: 'center' },
  {
    title: 'Actions',
    value: 'actions',
    sortable: false,
    align: 'center',
    width: '150px',
  },
])

const updateCategories = (categories) => {
  emit('categories', categories)
  emit('change')
}

const updateOption = (key, value) => {
  emit(
    'options',
    new CardSortingStudyOptions({ ...props.options, [key]: value }),
  )
  emit('change')
}

const resetEditor = () => {
  editedIndex.value = -1
  category.value = new CardSortingStudyCategory()
}

const openCreate = () => {
  resetEditor()
  dialog.value = true
}

const openImport = () => {
  importDialog.value = true
}

const importItems = (titles) => {
  updateCategories([
    ...props.categories,
    ...titles.map((title) => new CardSortingStudyCategory({ title })),
  ])
}

const onDialogChange = (isOpen) => {
  dialog.value = isOpen
  if (!isOpen) {
    resetEditor()
  }
}

const editItem = (item) => {
  editedIndex.value = props.categories.indexOf(item)
  category.value = new CardSortingStudyCategory({ ...item })
  dialog.value = true
}

const deleteItem = (item) => {
  const index = props.categories.indexOf(item)
  if (index === -1) return
  updateCategories(props.categories.filter((_, i) => i !== index))
}

const save = (newCategoryRaw) => {
  const newCategory = new CardSortingStudyCategory(newCategoryRaw)
  const nextCategories = [...props.categories]

  if (editedIndex.value > -1) {
    nextCategories[editedIndex.value] = newCategory
  } else {
    nextCategories.push(newCategory)
  }

  resetEditor()
  updateCategories(nextCategories)
}
</script>
