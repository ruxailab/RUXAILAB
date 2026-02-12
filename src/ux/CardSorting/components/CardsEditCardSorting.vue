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
            <v-col cols="12" sm="6" class="text-right">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                class="px-6 text-capitalize"
                rounded="lg"
                @click="dialog = true"
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
              v-model="options.card_description"
              label="Show Card Description"
              @update:model-value="onChange()"
            />
            <v-checkbox
              v-model="options.card_image"
              label="Show Image"
              @update:model-value="onChange()"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <CardSortingForm
      v-model:dialog="dialog"
      :value="card"
      :options="options"
      @save="save"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CardSortingForm from '../components/dialogs/CardSortingForm.vue'
import { useStore } from 'vuex'
import { CardSortingStudyOptions } from '../models/CardSortingStudyOptions'
import { CardSortingStudyCard } from '../models/CardSortingStudyCard'

// Emits
const emit = defineEmits(['change', 'cards', 'options'])

// Store
const store = useStore()

// Computeds
const test = computed(() => store.getters.test)

// Variables
const cards = ref([])
const editedIndex = ref(-1)
const card = ref(new CardSortingStudyCard())
const dialog = ref(false)
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

// Methods
const onChange = () => {
  emit('change')
  emit('options', options.value)
  emit('cards', cards.value)
}

const save = (newCardRaw) => {
  const newCard = new CardSortingStudyCard(newCardRaw)

  if (editedIndex.value > -1) {
    cards.value[editedIndex.value] = newCard
    editedIndex.value = -1
  } else {
    cards.value.push(newCard)
  }

  onChange()
}

const editItem = (item) => {
  editedIndex.value = cards.value.indexOf(item)
  card.value = new CardSortingStudyCard(item)
  dialog.value = true
  onChange()
}

const deleteItem = (item) => {
  const index = cards.value.indexOf(item)
  cards.value.splice(index, 1)
  onChange()
}

const getCards = () => {
  if (!test.value.testStructure.cardSorting) return

  test.value.testStructure.cardSorting.cards.map((card) => {
    cards.value.push(new CardSortingStudyCard(card))
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
