<template>
  <div>
    <ShowInfo :title="props.test.testTitle">
      <template #content>
        <v-divider class="mb-5" />

        <v-container>
          <VRow class="fill-height" align="center" justify="center">
            <!-- Cards -->
            <VCol :cols="12 / (categories.length + 1)" class="mb-0 pb-0">
              <VCard class="card-category">
                <VCardTitle class="d-flex justify-center align-center">
                  <VCol class="text-center">
                    <p>{{ pendingAllocationCount }} of {{ props.test.testStructure.cardSorting.cards.length }} cards</p>
                    <v-progress-linear v-model="pendingAllocationCount" color="primary" height="12"
                      :max="props.test.testStructure.cardSorting.cards.length" />
                  </VCol>
                </VCardTitle>

                <Draggable :list="cards" item-key="title" class="list-group" group="cards">
                  <template #item="{ element }">
                    <CardSortingCard :element="element" :options="props.test.testStructure.cardSorting.options" />
                  </template>
                </Draggable>
              </VCard>
            </VCol>

            <!-- Categories -->
            <VCol :cols="12 / (categories.length + 1)" class="mb-0 pb-0" v-for="(category, index) in categories"
              :key="index">
              <VCard class="card-category category">
                <VCardTitle class="d-flex justify-center align-center">
                  <VCol class="text-center">
                    <h3>{{ category.title }}</h3>
                    <p v-if="category.description && props.test.testStructure.cardSorting.options.category_description">
                      {{
                        category.description }}</p>
                  </VCol>
                </VCardTitle>

                <Draggable :list="localTestAnswer.tasks[category.title]" item-key="title" class="list-group"
                  group="cards">
                  <template #item="{ element }">
                    <CardSortingCard :element="element" :options="props.test.testStructure.cardSorting.options" />
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
import { computed, onMounted, ref } from 'vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import Draggable from 'vuedraggable'
import CardSortingCard from '../components/CardSortingCard.vue'

// Props
const props = defineProps({
  test: {
    type: Object,
    required: false
  }
})

// Variables
const categories = ref([])
const cards = ref([])
const localTestAnswer = ref({
  tasks: {}
})

// Computed
const pendingAllocationCount = computed(() => {
  return props.test.testStructure.cardSorting.cards.length - cards.value.length
})

// Methods

// Lifecycle Hooks
onMounted(async () => {
  categories.value = [...props.test.testStructure.cardSorting.categories] || []
  cards.value = [...props.test.testStructure.cardSorting.cards] || []

  localTestAnswer.value.tasks = categories.value.reduce((acc, card) => {
    acc[card.title] = []
    return acc
  }, {})
})
</script>

<style scoped>
.cards {
  border-radius: 20px;
  padding: 10px;
  margin: 10px;
}

.card-category {
  border-radius: 20px;
  padding: 10px;
  margin: 10px;
}

.category {
  background-color: #f5f5f5;
}
</style>
