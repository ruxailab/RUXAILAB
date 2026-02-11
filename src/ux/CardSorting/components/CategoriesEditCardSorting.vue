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
            <v-col cols="12" sm="6" class="text-right">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                class="px-6 text-capitalize"
                rounded="lg"
                @click="dialog = true"
              >
                <v-icon start> mdi-plus-circle </v-icon>
                {{ $t('CardSorting.addNewTask') }}
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
              v-model="options.category_description"
              label="Show Category Description"
              @update:model-value="onChange()"
            />
            <v-checkbox
              v-model="options.category_image"
              label="Show Image"
              @update:model-value="onChange()"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <CardSortingForm
      v-model:dialog="dialog"
      :task="category"
      :options="options"
      @save="save"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { CardSortingStudyCategory } from '../models/CardSortingStudyCategory'
import { CardSortingStudyOptions } from '../models/CardSortingStudyOptions'
import CardSortingForm from './dialogs/CardSortingForm.vue'

// Emits
const emit = defineEmits(['change', 'categories', 'options'])

// Store
const store = useStore()

// Computeds
const test = computed(() => store.getters.test)

// Variables
const categories = ref([])
const editedIndex = ref(-1)
const dialog = ref(false)
const category = ref(new CardSortingStudyCategory())
const options = ref(new CardSortingStudyOptions())
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

const onChange = () => {
  emit('change')
  emit('options', options.value)
  emit('categories', categories.value)
}

const editItem = (item) => {
  editedIndex.value = categories.value.indexOf(item)
  category.value = new CardSortingStudyCategory({ ...item })
  dialog.value = true
}

const deleteItem = (item) => {
  const index = categories.value.indexOf(item)
  categories.value.splice(index, 1)
  onChange()
}

const save = (newCategoryRaw) => {
  const newCategory = new CardSortingStudyCategory(newCategoryRaw)

  if (editedIndex.value > -1) {
    categories.value[editedIndex.value] = newCategory
    editedIndex.value = -1
  } else {
    categories.value.push(newCategory)
  }

  onChange()
}

const getCards = () => {
  if (!test.value.testStructure.cardSorting) return

  test.value.testStructure.cardSorting.categories.map((cat) => {
    categories.value.push(new CardSortingStudyCategory(cat))
  })

  options.value = new CardSortingStudyOptions(
    test.value.testStructure.cardSorting.options,
  )
  onChange()
}

onMounted(() => {
  getCards()
})
</script>
