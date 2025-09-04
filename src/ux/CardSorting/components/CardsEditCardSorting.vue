<template>
  <v-container fluid class="pa-0">
    <v-row class="ma-0">
      <!-- Categories -->
      <v-col cols="9">
        <v-card class="elevation-2 rounded-lg pa-6">
          <v-row aling="center" class="pa-4">
            <v-col cols="12" sm="6">
              <v-card-title class="text-h5 font-weight-bold mb-4" :style="{ color: $vuetify.theme.current.colors['on-surface'] }">
                {{ 'Current Cards' }}
              </v-card-title>
            </v-col>
            <v-col cols="12" sm="6" class="text-right">
              <v-btn color="primary" variant="flat" size="large" class="px-6 text-capitalize" rounded="lg" @click="dialog = true">
                <v-icon start>mdi-plus-circle</v-icon>
                Add New Card
              </v-btn>
            </v-col>
          </v-row>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="cards"
              :items-per-page="5"
              class="elevation-0 rounded-lg"
              style="background: #FFFFFF; border: 1px solid #E5E7EB;"
              :no-data-text="$t('noCategories')"
            >
              <!-- IMAGE -->
               <template #item.image="{ item }">
                <v-icon :color="item.image ? 'success' : 'error'">
                  {{ item.image ? 'mdi-checkbox-marked-circle-outline' : 'mdi-close-circle-outline' }}
                </v-icon>
              </template>

              <!-- ACTIONS -->
              <template #item.actions="{ item }">
                <v-btn icon variant="text" color="accent" class="mr-2" @click="editItem(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon variant="text" color="error" @click="deleteItem(item)">
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
              <v-card-title class="text-h5 font-weight-bold mb-4" :style="{ color: $vuetify.theme.current.colors['on-surface'] }">
                {{ 'Settings' }}
              </v-card-title>
              Configure how cards will be displayed
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
            <v-checkbox
              v-model="options.card_random"
              label="Randomize the order of cards"
              @update:model-value="onChange()"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <CreateCardSortingForm :value="card" v-model:dialog="dialog" @save="save" :options="options" />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CreateCardSortingForm from '../components/dialogs/CreateCardSortingForm.vue'
import { useStore } from 'vuex';

// Emits
const emit = defineEmits(['change', 'cards', 'options'])

// Store
const store = useStore();

// Computeds
const test = computed(() => store.getters.test)

// Variables
const cards = ref([])
const editedIndex = ref(-1)
const card = ref({})
const dialog = ref(false)
const options = ref({})
const headers = ref([
  { title: 'Name', align: 'start', sortable: false, value: 'title', width: '10%' },
  { title: 'Description', value: 'description', sortable: false, align: 'center' },
  { title: 'Image', value: 'image', sortable: false, align: 'center' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '150px' },
])

// Methods
const onChange = () => {
  emit('change')
  emit('options', options.value)
}

const save = (newCard) => {
  if (editedIndex.value > -1) {
    Object.assign(cards.value[editedIndex.value], newCard)
    editedIndex.value = -1
    card.value = {}
  } else {
    cards.value.push(newCard)
  }

  emit('change')
  emit('cards', cards.value)
}

const getCards = () => {
  cards.value = test.value.testStructure.cardSorting.cards || []
  options.value = test.value.testStructure.cardSorting.options || {}
  emit('options', options.value)
  emit('cards', cards.value)
}

onMounted(() => {
  getCards()
})
</script>
