<template>
  <div>
    <ShowInfo :title="props.test.testTitle">
      <template #content>
        <v-divider class="mb-5" />

        <v-container>
          <div class="d-flex align-center justify-center mb-4">
            <p class="text-body-1 mb-0">
              {{ assignedCount }} {{ $t('CardSorting.of') }}
              {{ totalCards }} {{ $t('CardSorting.cards_low') }}
            </p>
          </div>
          <v-progress-linear
            :model-value="assignedCount"
            color="primary"
            height="10"
            rounded
            :max="totalCards"
            class="mb-6"
          />

          <VRow class="fill-height" justify="center">
            <!-- Unassigned cards pool -->
            <VCol :cols="poolCols" class="mb-0 pb-0">
              <VCard class="card-category">
                <VCardTitle class="d-flex justify-center align-center">
                  <VCol class="text-center">
                    <h3>{{ $t('CardSorting.cards') }}</h3>
                  </VCol>
                </VCardTitle>

                <Draggable
                  :list="pool"
                  item-key="title"
                  class="list-group drop-zone"
                  group="cards"
                  @change="onChange"
                >
                  <template #item="{ element }">
                    <CardSortingCard
                      :element="element"
                      :options="options"
                    />
                  </template>
                </Draggable>
              </VCard>
            </VCol>

            <!-- Categories -->
            <VCol
              v-for="category in categories"
              :key="category.title"
              :cols="poolCols"
              class="mb-0 pb-0"
            >
              <VCard class="card-category category">
                <VCardTitle class="d-flex justify-center align-center">
                  <VCol class="text-center">
                    <h3>{{ category.title }}</h3>
                    <p
                      v-if="category.description && options.category_description"
                      class="text-caption"
                    >
                      {{ category.description }}
                    </p>
                  </VCol>
                </VCardTitle>

                <Draggable
                  :list="categoryLists[category.title]"
                  item-key="title"
                  class="list-group drop-zone"
                  group="cards"
                  @change="onChange"
                >
                  <template #item="{ element }">
                    <CardSortingCard
                      :element="element"
                      :options="options"
                    />
                  </template>
                </Draggable>
              </VCard>
            </VCol>
          </VRow>
        </v-container>
      </template>
    </ShowInfo>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import Draggable from 'vuedraggable'
import CardSortingCard from './CardSortingCard.vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'update:pending'])

const UNASSIGNED_KEY = '__unassigned'

// Source data from the study structure
const cards = computed(
  () => props.test?.testStructure?.cardSorting?.cards || [],
)
const categories = computed(
  () => props.test?.testStructure?.cardSorting?.categories || [],
)
const options = computed(
  () => props.test?.testStructure?.cardSorting?.options || {},
)

const totalCards = computed(() => cards.value.length)

// Local drag-and-drop state
const pool = ref([])
const categoryLists = reactive({})

const poolCols = computed(() => {
  const columns = categories.value.length + 1
  return Math.max(2, Math.floor(12 / columns))
})

const assignedCount = computed(() => totalCards.value - pool.value.length)

const buildSorting = () => {
  const sorting = {}
  categories.value.forEach((category) => {
    sorting[category.title] = (categoryLists[category.title] || []).map(
      (card) => card.title,
    )
  })
  sorting[UNASSIGNED_KEY] = pool.value.map((card) => card.title)
  return sorting
}

const onChange = () => {
  emit('update:modelValue', buildSorting())
  emit('update:pending', pool.value.length)
}

const initialize = () => {
  const cardByTitle = new Map(cards.value.map((card) => [card.title, card]))
  const savedSorting = props.modelValue || {}
  const hasSaved = Object.keys(savedSorting).length > 0

  categories.value.forEach((category) => {
    categoryLists[category.title] = []
  })

  if (hasSaved) {
    const usedTitles = new Set()
    categories.value.forEach((category) => {
      const titles = savedSorting[category.title] || []
      categoryLists[category.title] = titles
        .filter((title) => cardByTitle.has(title))
        .map((title) => {
          usedTitles.add(title)
          return cardByTitle.get(title)
        })
    })
    // Any card not restored into a category goes back to the pool
    pool.value = cards.value.filter((card) => !usedTitles.has(card.title))
  } else {
    pool.value = [...cards.value]
  }

  emit('update:pending', pool.value.length)
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.card-category {
  border-radius: 20px;
  padding: 10px;
  margin: 10px;
}

.category {
  background-color: #f5f5f5;
}

.drop-zone {
  min-height: 120px;
}
</style>
