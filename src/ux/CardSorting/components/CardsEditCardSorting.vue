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
                {{ $t('CardSorting.currentCards') }}
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
                {{ $t('CardSorting.addNewCard') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="cards"
              :items-per-page="5"
              class="elevation-0 rounded-lg"
              style="background: #ffffff; border: 1px solid #e5e7eb"
              :no-data-text="$t('CardSorting.noCards')"
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
              {{ $t('CardSorting.configureCards') }}
            </v-col>
          </v-row>
          <v-card-text>
            <v-checkbox
              :model-value="options.card_description"
              :label="$t('CardSorting.showCardDescription')"
              @update:model-value="updateOption('card_description', $event)"
            />
            <v-checkbox
              :model-value="options.card_image"
              :label="$t('CardSorting.showImage')"
              @update:model-value="updateOption('card_image', $event)"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <CardSortingForm
      :dialog="dialog"
      type="card"
      :task="card"
      :options="options"
      :is-edit="editedIndex > -1"
      @save="save"
      @update:dialog="onDialogChange"
    />
    <CardSortingImportDialog
      :dialog="importDialog"
      type="card"
      :existing-titles="existingTitles"
      @import="importItems"
      @update:dialog="importDialog = $event"
    />
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import CardSortingForm from './dialogs/CardSortingForm.vue'
import CardSortingImportDialog from './dialogs/CardSortingImportDialog.vue'
import { CardSortingStudyOptions } from '../models/CardSortingStudyOptions'
import { CardSortingStudyCard } from '../models/CardSortingStudyCard'

// The parent owns the unsaved draft. Reading from the store here would
// overwrite unsaved edits every time this tab is remounted.
const props = defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['change', 'cards', 'options'])

// Variables
const editedIndex = ref(-1)
const card = ref(new CardSortingStudyCard())
const dialog = ref(false)
const importDialog = ref(false)
const existingTitles = computed(() =>
  props.cards.map((item) => item.title).filter(Boolean),
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

// Methods
const updateCards = (cards) => {
  emit('cards', cards)
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
  card.value = new CardSortingStudyCard()
}

const openCreate = () => {
  resetEditor()
  dialog.value = true
}

const openImport = () => {
  importDialog.value = true
}

const importItems = (titles) => {
  updateCards([
    ...props.cards,
    ...titles.map((title) => new CardSortingStudyCard({ title })),
  ])
}

const onDialogChange = (isOpen) => {
  dialog.value = isOpen
  if (!isOpen) {
    resetEditor()
  }
}

const save = (newCardRaw) => {
  const newCard = new CardSortingStudyCard(newCardRaw)
  const nextCards = [...props.cards]

  if (editedIndex.value > -1) {
    nextCards[editedIndex.value] = newCard
  } else {
    nextCards.push(newCard)
  }

  resetEditor()
  updateCards(nextCards)
}

const editItem = (item) => {
  editedIndex.value = props.cards.indexOf(item)
  card.value = new CardSortingStudyCard(item)
  dialog.value = true
}

const deleteItem = (item) => {
  const index = props.cards.indexOf(item)
  if (index === -1) return
  updateCards(props.cards.filter((_, i) => i !== index))
}
</script>
